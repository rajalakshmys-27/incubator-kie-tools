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

import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Compensation Boundary Events", () => {
  test("should create compensation boundary event on task", async ({
    palette,
    nodes,
    jsonModel,
    page,
    diagram,
    intermediateEventPropertiesPanel,
  }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

    const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
    expect(boundaryEvent).toMatchObject({
      __$$element: "boundaryEvent",
      "@_id": expect.any(String),
      "@_attachedToRef": expect.any(String),
    });

    const eventNode = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
    await eventNode.click();

    await intermediateEventPropertiesPanel.setCompensationDefinition({});

    await intermediateEventPropertiesPanel.setCancelActivity({ cancelActivity: false });

    await expect
      .poll(
        async () => {
          return await jsonModel.getFlowElement({ elementIndex: 1 });
        },
        { timeout: 10000 }
      )
      .toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
        "@_cancelActivity": false,
        eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
      });

    const cancelActivity = await intermediateEventPropertiesPanel.getCancelActivity();
    expect(cancelActivity).toBe(false);

    await expect(diagram.get()).toHaveScreenshot("compensation-boundary-event-on-task.png");
  });

  test.skip("should not allow incoming sequence flows to compensation boundary event", async ({
    // TODO: Enable when compensation boundary event validation is implemented
    // This test requires validation logic to prevent sequence flows to compensation boundary events
    palette,
    nodes,
    jsonModel,
    page,
    diagram,
    intermediateEventPropertiesPanel,
  }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

    const eventNode = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
    await expect(eventNode).toBeAttached();

    await eventNode.click();

    await intermediateEventPropertiesPanel.setCompensationDefinition({});

    await expect
      .poll(
        async () => {
          const process = await jsonModel.getProcess();
          return process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");
        },
        { timeout: 10000 }
      )
      .toMatchObject({
        __$$element: "boundaryEvent",
        eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
      });

    const process = await jsonModel.getProcess();
    const boundaryEvent = process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");

    await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 100, y: 300 } });

    const startEvent = page.locator(".kie-bpmn-editor--task-node").last();
    await expect(startEvent).toBeAttached();

    const box = await startEvent.boundingBox();
    if (!box) throw new Error("Start Event bounding box not found");

    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

    const addSequenceFlowHandle = startEvent.getByTitle("Add Sequence Flow");
    await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

    const eventBox = await eventNode.boundingBox();
    if (!eventBox) throw new Error("Boundary Event bounding box not found");

    await addSequenceFlowHandle.dragTo(diagram.get(), {
      targetPosition: { x: eventBox.x + eventBox.width / 2, y: eventBox.y + eventBox.height / 2 },
    });

    const updatedProcess = await jsonModel.getProcess();
    const sequenceFlows = updatedProcess.flowElement?.filter((e: any) => e.__$$element === "sequenceFlow") || [];
    const incomingFlowToBoundary = sequenceFlows.find((flow: any) => flow["@_targetRef"] === boundaryEvent["@_id"]);

    expect(incomingFlowToBoundary).toBeUndefined();
  });

  test("should allow compensation boundary event on subprocess", async ({
    palette,
    nodes,
    jsonModel,
    page,
    diagram,
    intermediateEventPropertiesPanel,
  }) => {
    await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 300 } });
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 550, y: 350 } });

    const process = await jsonModel.getProcess();
    const boundaryEvent = process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");
    const subProcessElement = process.flowElement?.find((e: any) => e.__$$element === "subProcess");

    expect(boundaryEvent).toBeDefined();
    expect(boundaryEvent["@_attachedToRef"]).toBe(subProcessElement["@_id"]);

    const eventNode = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
    await eventNode.click();

    await intermediateEventPropertiesPanel.setCompensationDefinition({});

    await intermediateEventPropertiesPanel.setCancelActivity({ cancelActivity: false });

    await expect
      .poll(
        async () => {
          const updatedProcess = await jsonModel.getProcess();
          return updatedProcess.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");
        },
        { timeout: 10000 }
      )
      .toMatchObject({
        __$$element: "boundaryEvent",
        "@_attachedToRef": subProcessElement["@_id"],
        "@_cancelActivity": false,
        eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
      });

    await expect(diagram.get()).toHaveScreenshot("compensation-boundary-event-on-subprocess.png");
  });
});
