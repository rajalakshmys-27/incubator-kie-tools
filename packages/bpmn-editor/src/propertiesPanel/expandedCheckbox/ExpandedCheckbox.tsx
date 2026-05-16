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
  "@_kie:expandedWidth"?: number;
  "@_kie:expandedHeight"?: number;
};

export function ExpandedCheckbox({ element }: { element: SubProcessElement }) {
  const { i18n } = useBpmnEditorI18n();
  const isReadOnly = useBpmnEditorStore((s) => s.settings.isReadOnly);

  const bpmnEditorStoreApi = useBpmnEditorStoreApi();

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
          bpmnEditorStoreApi.setState((s) => {
            const diagramElements =
              s.bpmn.model.definitions["bpmndi:BPMNDiagram"]?.[0]?.["bpmndi:BPMNPlane"]?.["di:DiagramElement"];
            if (diagramElements) {
              const shapeIndex = diagramElements.findIndex(
                (d) => d.__$$element === "bpmndi:BPMNShape" && d["@_bpmnElement"] === element["@_id"]
              );
              if (shapeIndex >= 0) {
                const diagramElement = diagramElements[shapeIndex];
                if (diagramElement.__$$element !== "bpmndi:BPMNShape") {
                  return;
                }

                const shape = diagramElement as BPMNShapeWithExpandedDimensions;

                if (
                  !shape["dc:Bounds"] ||
                  typeof shape["dc:Bounds"]["@_x"] !== "number" ||
                  typeof shape["dc:Bounds"]["@_y"] !== "number" ||
                  typeof shape["dc:Bounds"]["@_width"] !== "number" ||
                  typeof shape["dc:Bounds"]["@_height"] !== "number"
                ) {
                  console.warn("Invalid bounds for subprocess", element["@_id"]);
                  return;
                }

                const oldX = shape["dc:Bounds"]["@_x"];
                const oldY = shape["dc:Bounds"]["@_y"];
                const oldWidth = shape["dc:Bounds"]["@_width"];
                const oldHeight = shape["dc:Bounds"]["@_height"];

                if (!checked && shape["@_isExpanded"] !== false) {
                  shape["@_kie:expandedWidth"] = shape["dc:Bounds"]["@_width"];
                  shape["@_kie:expandedHeight"] = shape["dc:Bounds"]["@_height"];

                  shape["dc:Bounds"]["@_width"] = COLLAPSED_SUBPROCESS_WIDTH;
                  shape["dc:Bounds"]["@_height"] = COLLAPSED_SUBPROCESS_HEIGHT;
                } else if (checked && shape["@_isExpanded"] === false) {
                  const expandedWidth = shape["@_kie:expandedWidth"];
                  const expandedHeight = shape["@_kie:expandedHeight"];

                  if (expandedWidth !== undefined && expandedHeight !== undefined) {
                    shape["dc:Bounds"]["@_width"] = expandedWidth;
                    shape["dc:Bounds"]["@_height"] = expandedHeight;
                    delete shape["@_kie:expandedWidth"];
                    delete shape["@_kie:expandedHeight"];
                  } else {
                    const currentWidth = shape["dc:Bounds"]["@_width"];
                    const currentHeight = shape["dc:Bounds"]["@_height"];

                    if (currentWidth === COLLAPSED_SUBPROCESS_WIDTH && currentHeight === COLLAPSED_SUBPROCESS_HEIGHT) {
                      shape["dc:Bounds"]["@_width"] = DEFAULT_EXPANDED_SUBPROCESS_WIDTH;
                      shape["dc:Bounds"]["@_height"] = DEFAULT_EXPANDED_SUBPROCESS_HEIGHT;
                    }
                  }
                }

                const newWidth = shape["dc:Bounds"]["@_width"];
                const newHeight = shape["dc:Bounds"]["@_height"];

                const oldCenterY = oldY + oldHeight / 2;
                const newX = oldX;
                const newY = oldCenterY - newHeight / 2;

                shape["dc:Bounds"]["@_x"] = newX;
                shape["dc:Bounds"]["@_y"] = newY;

                if (checked) {
                  delete shape["@_isExpanded"];
                } else {
                  shape["@_isExpanded"] = false;
                }

                if ((oldWidth !== newWidth || oldHeight !== newHeight) && element["@_id"]) {
                  shiftNodesAfterSubProcessResize({
                    definitions: s.bpmn.model.definitions,
                    subProcessElementId: element["@_id"],
                    oldBounds: { width: oldWidth, height: oldHeight },
                    newBounds: { width: newWidth, height: newHeight },
                    oldPosition: { x: oldX, y: oldY },
                  });
                }
              }
            }
          });
        }}
      />
    </FormGroup>
  );
}
