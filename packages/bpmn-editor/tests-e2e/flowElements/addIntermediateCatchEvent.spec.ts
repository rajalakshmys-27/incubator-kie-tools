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
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - Intermediate Catch Event", () => {
  test.describe("Add from palette", () => {
    test("should add Intermediate Catch Event node from palette", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 100, y: 100 } });
      await expect(diagram.get()).toHaveScreenshot("add-intermediate-catch-event-node-from-palette.png");
    });

    test("should add two Intermediate Catch Event nodes from palette in a row", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 100, y: 100 } });
      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_CATCH_EVENT,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Second Intermediate Catch",
      });
      await diagram.resetFocus();
      await expect(diagram.get()).toHaveScreenshot("add-2-intermediate-catch-event-nodes-from-palette.png");
    });
  });

  // BPMN 2.0 Intermediate Catch Event Types:
  // Allowed: Message, Timer, Error, Escalation, Compensation, Conditional, Link, Signal
  // Not allowed: None, Terminate

  test.describe("Intermediate catch event type morphing", () => {
    test("should morph Intermediate Catch Event to Message", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 300 } });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: catchEvent, targetMorphType: "Message" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateCatchEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "messageEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-catch-event-to-message.png");
    });

    test("should morph Intermediate Catch Event to Timer", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 300 } });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: catchEvent, targetMorphType: "Timer" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateCatchEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "timerEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-catch-event-to-timer.png");
    });

    test("should morph Intermediate Catch Event to Error", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 300 } });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: catchEvent, targetMorphType: "Error" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateCatchEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "errorEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-catch-event-to-error.png");
    });

    test("should morph Intermediate Catch Event to Escalation", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 300 } });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: catchEvent, targetMorphType: "Escalation" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateCatchEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "escalationEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-catch-event-to-escalation.png");
    });

    test("should morph Intermediate Catch Event to Compensation", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 300 } });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: catchEvent, targetMorphType: "Compensation" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateCatchEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-catch-event-to-compensation.png");
    });

    test("should morph Intermediate Catch Event to Conditional", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 300 } });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: catchEvent, targetMorphType: "Conditional" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateCatchEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "conditionalEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-catch-event-to-conditional.png");
    });

    test("should morph Intermediate Catch Event to Link", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 300 } });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: catchEvent, targetMorphType: "Link" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateCatchEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "linkEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-catch-event-to-link.png");
    });

    test("should morph Intermediate Catch Event to Signal", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 300 } });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: catchEvent, targetMorphType: "Signal" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateCatchEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "signalEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-catch-event-to-signal.png");
    });
  });

  test.describe("Add connected Intermediate Catch Event node", () => {
    test("should add connected Task node from Intermediate Catch Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_CATCH_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      const box = await catchEvent.boundingBox();
      if (!box) throw new Error("Intermediate Catch Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);

      const addTaskHandle = catchEvent.getByTitle("Add Task");
      await expect(addTaskHandle).toBeVisible({ timeout: 5000 });

      await addTaskHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-intermediate-catch-event.png");
    });

    test("should add connected Gateway node from Intermediate Catch Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_CATCH_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      const box = await catchEvent.boundingBox();
      if (!box) throw new Error("Intermediate Catch Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);

      const addGatewayHandle = catchEvent.getByTitle("Add Gateway");
      await expect(addGatewayHandle).toBeVisible({ timeout: 5000 });

      await addGatewayHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("add-gateway-node-from-intermediate-catch-event.png");
    });

    test("should create sequence flow from Intermediate Catch Event to End Event", async ({
      diagram,
      palette,
      page,
    }) => {
      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_CATCH_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      const endBox = await endEvent.boundingBox();
      if (!endBox) throw new Error("End Event bounding box not found");

      await catchEvent.dragTo(diagram.get(), {
        sourcePosition: { x: 20, y: 10 },
        targetPosition: { x: endBox.x + endBox.width / 2, y: endBox.y + endBox.height / 2 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-intermediate-catch-event-to-end-event.png");
    });

    test("should create sequence flow from Start Event to Intermediate Catch Event", async ({
      diagram,
      palette,
      page,
    }) => {
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_CATCH_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      const catchBox = await catchEvent.boundingBox();
      if (!catchBox) throw new Error("Intermediate Catch Event bounding box not found");

      await startEvent.dragTo(diagram.get(), {
        sourcePosition: { x: 20, y: 10 },
        targetPosition: { x: catchBox.x + catchBox.width / 2, y: catchBox.y + catchBox.height / 2 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-start-event-to-intermediate-catch-event.png");
    });

    test("should create sequence flow from Task to Intermediate Catch Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 100, y: 100 },
      });
      await diagram.resetFocus();

      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_CATCH_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible({ timeout: 5000 });

      const taskBox = await task.boundingBox();
      if (!taskBox) throw new Error("Task bounding box not found");

      await page.mouse.move(taskBox.x + taskBox.width - 10, taskBox.y + taskBox.height / 2);
      await page.waitForTimeout(500);

      const addSequenceFlowHandle = task.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      const catchBox = await catchEvent.boundingBox();
      if (!catchBox) throw new Error("Intermediate Catch Event bounding box not found");

      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: catchBox.x + catchBox.width / 2, y: catchBox.y + catchBox.height / 2 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-intermediate-catch-event.png");
    });
  });

  test.describe("Intermediate Catch Event operations", () => {
    test("should delete intermediate catch event", async ({ palette, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 300 } });

      const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(catchEvent).toBeVisible();

      // Delete using keyboard
      await catchEvent.click();
      await page.keyboard.press("Delete");

      await expect(catchEvent).not.toBeAttached();

      // Verify it's removed from JSON model
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });
  });
});
