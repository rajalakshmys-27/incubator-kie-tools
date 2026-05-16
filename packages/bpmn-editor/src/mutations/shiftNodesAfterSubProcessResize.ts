/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  BPMN20__tDefinitions,
  BPMN20__tProcess,
  BPMNDI__BPMNShape,
} from "@kie-tools/bpmn-marshaller/dist/schemas/bpmn-2_0/ts-gen/types";
import { Unpacked } from "@kie-tools/xyflow-react-kie-diagram/dist/tsExt/tsExt";
import { elementToNodeType } from "../diagram/BpmnDiagramDomain";
import { Normalized } from "../normalization/normalize";
import { addOrGetProcessAndDiagramElements } from "./addOrGetProcessAndDiagramElements";
import { findSubProcessRecursively, isSubProcessElement } from "./moveNodesOutOfSubProcess";
import { repositionNode } from "./repositionNode";

function collectAllDescendantIds(
  flowElements: NonNullable<BPMN20__tProcess["flowElement"]>,
  childIds: Set<string>
): void {
  for (const element of flowElements) {
    if (element["@_id"]) {
      childIds.add(element["@_id"]);
    }
    if (isSubProcessElement(element) && element.flowElement) {
      collectAllDescendantIds(element.flowElement, childIds);
    }
  }
}

type BpmnElementInProcess =
  | Unpacked<NonNullable<BPMN20__tProcess["flowElement"]>>
  | Unpacked<NonNullable<BPMN20__tProcess["artifact"]>>;

function findBpmnElementInProcess(
  process: Normalized<BPMN20__tProcess>,
  elementId: string
): BpmnElementInProcess | undefined {
  const searchInFlowElements = (
    flowElements: NonNullable<BPMN20__tProcess["flowElement"]>
  ): Unpacked<NonNullable<BPMN20__tProcess["flowElement"]>> | undefined => {
    for (const element of flowElements) {
      if (element["@_id"] === elementId) {
        return element;
      }
      if (isSubProcessElement(element) && element.flowElement) {
        const found = searchInFlowElements(element.flowElement);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };

  // Search in flow elements
  const flowElement = searchInFlowElements(process.flowElement ?? []);
  if (flowElement) {
    return flowElement;
  }

  // Search in artifacts
  for (const artifact of process.artifact ?? []) {
    if (artifact["@_id"] === elementId) {
      return artifact;
    }
  }

  return undefined;
}

export function shiftNodesAfterSubProcessResize({
  definitions,
  subProcessElementId,
  oldBounds,
  newBounds,
  oldPosition,
}: {
  definitions: Normalized<BPMN20__tDefinitions>;
  subProcessElementId: string;
  oldBounds: { width: number; height: number };
  newBounds: { width: number; height: number };
  oldPosition: { x: number; y: number };
}): void {
  const widthDelta = newBounds.width - oldBounds.width;
  const heightDelta = newBounds.height - oldBounds.height;

  if (widthDelta === 0 && heightDelta === 0) {
    return;
  }

  const { process, diagramElements } = addOrGetProcessAndDiagramElements({ definitions });

  const subProcessX = oldPosition.x;
  const subProcessY = oldPosition.y;

  const subProcessShapeIndex = diagramElements.findIndex(
    (d) => d.__$$element === "bpmndi:BPMNShape" && d["@_bpmnElement"] === subProcessElementId
  );

  if (subProcessShapeIndex < 0) {
    return;
  }

  const subprocess = findSubProcessRecursively(process.flowElement ?? [], subProcessElementId);
  const childIds = new Set<string>();
  if (subprocess) {
    if (subprocess.flowElement) {
      collectAllDescendantIds(subprocess.flowElement, childIds);
    }
    if (subprocess.artifact) {
      for (const artifact of subprocess.artifact) {
        if (artifact["@_id"]) {
          childIds.add(artifact["@_id"]);
        }
      }
    }
  }

  for (let i = 0; i < diagramElements.length; i++) {
    const element = diagramElements[i];

    if (element.__$$element !== "bpmndi:BPMNShape") {
      continue;
    }

    const elementId = element["@_bpmnElement"];
    if (!elementId) {
      continue;
    }

    if (elementId === subProcessElementId) {
      continue;
    }

    if (childIds.has(elementId)) {
      continue;
    }

    const otherX = element["dc:Bounds"]["@_x"];
    const otherY = element["dc:Bounds"]["@_y"];
    const otherWidth = element["dc:Bounds"]["@_width"];
    const otherHeight = element["dc:Bounds"]["@_height"];

    const needsHorizontalShift = widthDelta !== 0 && otherX >= subProcessX + oldBounds.width;
    const needsVerticalShift = heightDelta !== 0 && otherY >= subProcessY + oldBounds.height;

    if (!needsHorizontalShift && !needsVerticalShift) {
      continue;
    }

    const bpmnElement = findBpmnElementInProcess(process, elementId);
    if (!bpmnElement) {
      continue;
    }

    const elementType = bpmnElement.__$$element as keyof typeof elementToNodeType;
    const nodeType = elementToNodeType[elementType];
    if (!nodeType) {
      continue;
    }

    const sourceEdgeIndexes: number[] = [];
    const targetEdgeIndexes: number[] = [];

    for (let j = 0; j < diagramElements.length; j++) {
      const edgeElement = diagramElements[j];
      if (edgeElement.__$$element !== "bpmndi:BPMNEdge") {
        continue;
      }

      const edgeElementId = edgeElement["@_bpmnElement"];
      if (!edgeElementId) {
        continue;
      }

      const bpmnEdge = findBpmnElementInProcess(process, edgeElementId);
      if (!bpmnEdge) {
        continue;
      }

      if (bpmnEdge.__$$element === "sequenceFlow") {
        if (bpmnEdge["@_sourceRef"] === elementId) {
          sourceEdgeIndexes.push(j);
        }
        if (bpmnEdge["@_targetRef"] === elementId) {
          targetEdgeIndexes.push(j);
        }
      } else if (bpmnEdge.__$$element === "association") {
        if (bpmnEdge["@_sourceRef"] === elementId) {
          sourceEdgeIndexes.push(j);
        }
        if (bpmnEdge["@_targetRef"] === elementId) {
          targetEdgeIndexes.push(j);
        }
      }
    }

    repositionNode({
      definitions,
      controlWaypointsByEdge: new Map(),
      __readonly_change: {
        type: "offset",
        nodeType,
        shapeIndex: i,
        sourceEdgeIndexes,
        targetEdgeIndexes,
        selectedEdges: [],
        offset: {
          deltaX: needsHorizontalShift ? widthDelta : 0,
          deltaY: needsVerticalShift ? heightDelta : 0,
        },
      },
    });
  }
}
