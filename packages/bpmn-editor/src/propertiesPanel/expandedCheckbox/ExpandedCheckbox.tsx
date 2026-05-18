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

import * as React from "react";
import { useRef } from "react";
import { useBpmnEditorStore, useBpmnEditorStoreApi } from "../../store/StoreContext";
import { FormGroup } from "@patternfly/react-core/dist/js/components/Form";
import { Checkbox } from "@patternfly/react-core/dist/js/components/Checkbox";
import { useBpmnEditorI18n } from "../../i18n";
import { SubProcessElement } from "../../mutations/moveNodesOutOfSubProcess";
import { BPMNDI__BPMNShape } from "@kie-tools/bpmn-marshaller/dist/schemas/bpmn-2_0/ts-gen/types";
import { Normalized } from "../../normalization/normalize";
import { shiftNodesAfterSubProcessResize } from "../../mutations/shiftNodesAfterSubProcessResize";

const COLLAPSED_SUBPROCESS_WIDTH = 180;
const COLLAPSED_SUBPROCESS_HEIGHT = 100;
const DEFAULT_EXPANDED_SUBPROCESS_WIDTH = 350;
const DEFAULT_EXPANDED_SUBPROCESS_HEIGHT = 200;

type BPMNShapeWithExpandedDimensions = Normalized<BPMNDI__BPMNShape> & {
  "@_kie:preCollapseWidth"?: number;
  "@_kie:preCollapseHeight"?: number;
};

function calculateNewDimensions(
  shape: BPMNShapeWithExpandedDimensions,
  isExpanding: boolean
): { width: number; height: number } {
  if (!isExpanding && shape["@_isExpanded"] !== false) {
    shape["@_kie:preCollapseWidth"] = shape["dc:Bounds"]["@_width"];
    shape["@_kie:preCollapseHeight"] = shape["dc:Bounds"]["@_height"];
    return { width: COLLAPSED_SUBPROCESS_WIDTH, height: COLLAPSED_SUBPROCESS_HEIGHT };
  } else if (isExpanding && shape["@_isExpanded"] === false) {
    const expandedWidth = shape["@_kie:preCollapseWidth"];
    const expandedHeight = shape["@_kie:preCollapseHeight"];

    if (expandedWidth !== undefined && expandedHeight !== undefined) {
      delete shape["@_kie:preCollapseWidth"];
      delete shape["@_kie:preCollapseHeight"];
      return { width: expandedWidth, height: expandedHeight };
    } else {
      const currentWidth = shape["dc:Bounds"]["@_width"];
      const currentHeight = shape["dc:Bounds"]["@_height"];

      if (currentWidth === COLLAPSED_SUBPROCESS_WIDTH && currentHeight === COLLAPSED_SUBPROCESS_HEIGHT) {
        return { width: DEFAULT_EXPANDED_SUBPROCESS_WIDTH, height: DEFAULT_EXPANDED_SUBPROCESS_HEIGHT };
      }
    }
  }
  return { width: shape["dc:Bounds"]["@_width"], height: shape["dc:Bounds"]["@_height"] };
}

function repositionSubprocess(
  shape: BPMNShapeWithExpandedDimensions,
  oldY: number,
  oldHeight: number,
  newHeight: number
): { x: number; y: number } {
  const oldCenterY = oldY + oldHeight / 2;
  const newX = shape["dc:Bounds"]["@_x"];
  const newY = oldCenterY - newHeight / 2;
  return { x: newX, y: newY };
}

function validateBounds(shape: BPMNShapeWithExpandedDimensions): boolean {
  return !!(
    shape["dc:Bounds"] &&
    typeof shape["dc:Bounds"]["@_x"] === "number" &&
    typeof shape["dc:Bounds"]["@_y"] === "number" &&
    typeof shape["dc:Bounds"]["@_width"] === "number" &&
    typeof shape["dc:Bounds"]["@_height"] === "number"
  );
}

export function ExpandedCheckbox({ element }: { element: SubProcessElement }) {
  const { i18n } = useBpmnEditorI18n();
  const isReadOnly = useBpmnEditorStore((s) => s.settings.isReadOnly);

  const bpmnEditorStoreApi = useBpmnEditorStoreApi();
  const isProcessingRef = useRef(false);

  const isExpanded = useBpmnEditorStore((s) => {
    const diagramElements =
      s.bpmn.model.definitions["bpmndi:BPMNDiagram"]?.[0]?.["bpmndi:BPMNPlane"]?.["di:DiagramElement"];
    const shape = diagramElements?.find(
      (d) => d.__$$element === "bpmndi:BPMNShape" && d["@_bpmnElement"] === element["@_id"]
    );
    return shape && shape.__$$element === "bpmndi:BPMNShape" ? shape["@_isExpanded"] !== false : true;
  });

  return (
    <FormGroup fieldId="kie-bpmn-editor--properties-panel--expanded">
      <Checkbox
        label="Expanded"
        id="kie-bpmn-editor--properties-panel--expanded"
        name="is-expanded"
        aria-label="Expanded"
        isChecked={isExpanded}
        isDisabled={isReadOnly}
        onChange={(_e, checked) => {
          if (isProcessingRef.current) {
            return;
          }
          isProcessingRef.current = true;

          try {
            bpmnEditorStoreApi.setState((s) => {
              const diagramElements =
                s.bpmn.model.definitions["bpmndi:BPMNDiagram"]?.[0]?.["bpmndi:BPMNPlane"]?.["di:DiagramElement"];
              if (!diagramElements) return;

              const shapeIndex = diagramElements.findIndex(
                (d) => d.__$$element === "bpmndi:BPMNShape" && d["@_bpmnElement"] === element["@_id"]
              );
              if (shapeIndex < 0) return;

              const diagramElement = diagramElements[shapeIndex];
              if (diagramElement.__$$element !== "bpmndi:BPMNShape") return;

              const shape: BPMNShapeWithExpandedDimensions = diagramElement;

              if (!validateBounds(shape)) {
                console.warn("Invalid bounds for subprocess", element["@_id"]);
                return;
              }

              const oldX = shape["dc:Bounds"]["@_x"];
              const oldY = shape["dc:Bounds"]["@_y"];
              const oldWidth = shape["dc:Bounds"]["@_width"];
              const oldHeight = shape["dc:Bounds"]["@_height"];

              const { width: newWidth, height: newHeight } = calculateNewDimensions(shape, checked);
              shape["dc:Bounds"]["@_width"] = newWidth;
              shape["dc:Bounds"]["@_height"] = newHeight;

              const { x: newX, y: newY } = repositionSubprocess(shape, oldY, oldHeight, newHeight);
              shape["dc:Bounds"]["@_x"] = newX;
              shape["dc:Bounds"]["@_y"] = newY;

              shape["@_isExpanded"] = checked ? undefined : false;

              if ((oldWidth !== newWidth || oldHeight !== newHeight) && element["@_id"]) {
                shiftNodesAfterSubProcessResize({
                  definitions: s.bpmn.model.definitions,
                  subProcessElementId: element["@_id"],
                  oldBounds: { width: oldWidth, height: oldHeight },
                  newBounds: { width: newWidth, height: newHeight },
                  oldPosition: { x: oldX, y: oldY },
                });
              }
            });
          } finally {
            isProcessingRef.current = false;
          }
        }}
      />
    </FormGroup>
  );
}
