/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - Intermediate Throw Event", () => {
  test.describe("Add from palette", () => {
    test("should add Intermediate Throw Event node from palette", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 100, y: 100 } });
      await expect(diagram.get()).toHaveScreenshot("add-intermediate-throw-event-node-from-palette.png");
    });

    test("should add two Intermediate Throw Event nodes from palette in a row", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 100, y: 100 } });
      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_THROW_EVENT,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Second Intermediate Throw",
      });
      await diagram.resetFocus();
      await expect(diagram.get()).toHaveScreenshot("add-2-intermediate-throw-event-nodes-from-palette.png");
    });
  });

  // BPMN 2.0 Intermediate Throw Event Types:
  // Allowed: Message, Escalation, Compensation, Link, Signal
  // Not allowed: None, Timer, Error, Conditional, Terminate

  test.describe("Intermediate throw event type morphing", () => {
    test("should morph Intermediate Throw Event to Message", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 300, y: 300 } });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: throwEvent, targetMorphType: "Message" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateThrowEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "messageEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-throw-event-to-message.png");
    });

    test("should morph Intermediate Throw Event to Escalation", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 300, y: 300 } });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: throwEvent, targetMorphType: "Escalation" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateThrowEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "escalationEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-throw-event-to-escalation.png");
    });

    test("should morph Intermediate Throw Event to Compensation", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 300, y: 300 } });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: throwEvent, targetMorphType: "Compensation" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateThrowEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-throw-event-to-compensation.png");
    });

    test("should morph Intermediate Throw Event to Link", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 300, y: 300 } });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: throwEvent, targetMorphType: "Link" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateThrowEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "linkEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-throw-event-to-link.png");
    });

    test("should morph Intermediate Throw Event to Signal", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 300, y: 300 } });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: throwEvent, targetMorphType: "Signal" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "intermediateThrowEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "signalEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-intermediate-throw-event-to-signal.png");
    });
  });

  test.describe("Add connected Intermediate Throw Event node", () => {
    test("should add connected Task node from Intermediate Throw Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_THROW_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      const box = await throwEvent.boundingBox();
      if (!box) throw new Error("Intermediate Throw Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);

      const addTaskHandle = throwEvent.getByTitle("Add Task");
      await expect(addTaskHandle).toBeVisible({ timeout: 5000 });

      await addTaskHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-intermediate-throw-event.png");
    });

    test("should add connected Gateway node from Intermediate Throw Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_THROW_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      const box = await throwEvent.boundingBox();
      if (!box) throw new Error("Intermediate Throw Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);

      const addGatewayHandle = throwEvent.getByTitle("Add Gateway");
      await expect(addGatewayHandle).toBeVisible({ timeout: 5000 });

      await addGatewayHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("add-gateway-node-from-intermediate-throw-event.png");
    });

    test("should create sequence flow from Intermediate Throw Event to End Event", async ({
      diagram,
      palette,
      page,
    }) => {
      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_THROW_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      const endBox = await endEvent.boundingBox();
      if (!endBox) throw new Error("End Event bounding box not found");

      await throwEvent.dragTo(diagram.get(), {
        sourcePosition: { x: 20, y: 10 },
        targetPosition: { x: endBox.x + endBox.width / 2, y: endBox.y + endBox.height / 2 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-intermediate-throw-event-to-end-event.png");
    });

    test("should create sequence flow from Start Event to Intermediate Throw Event", async ({
      diagram,
      palette,
      page,
    }) => {
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_THROW_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      const throwBox = await throwEvent.boundingBox();
      if (!throwBox) throw new Error("Intermediate Throw Event bounding box not found");

      await startEvent.dragTo(diagram.get(), {
        sourcePosition: { x: 20, y: 10 },
        targetPosition: { x: throwBox.x + throwBox.width / 2, y: throwBox.y + throwBox.height / 2 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-start-event-to-intermediate-throw-event.png");
    });

    test("should create sequence flow from Task to Intermediate Throw Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 100, y: 100 },
      });
      await diagram.resetFocus();

      await palette.dragNewNode({
        type: NodeType.INTERMEDIATE_THROW_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible({ timeout: 5000 });

      const taskBox = await task.boundingBox();
      if (!taskBox) throw new Error("Task bounding box not found");

      await page.mouse.move(taskBox.x + taskBox.width - 10, taskBox.y + taskBox.height / 2);
      await page.waitForTimeout(500);

      const addSequenceFlowHandle = task.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      const throwBox = await throwEvent.boundingBox();
      if (!throwBox) throw new Error("Intermediate Throw Event bounding box not found");

      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: throwBox.x + throwBox.width / 2, y: throwBox.y + throwBox.height / 2 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-intermediate-throw-event.png");
    });
  });

  test.describe("Intermediate Throw Event operations", () => {
    test("should delete intermediate throw event", async ({ palette, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 300, y: 300 } });

      const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
      await expect(throwEvent).toBeVisible();

      // Delete using keyboard
      await throwEvent.click();
      await page.keyboard.press("Delete");

      await expect(throwEvent).not.toBeAttached();

      // Verify it's removed from JSON model
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });

    //   test("should move intermediate throw event to new position", async ({ palette, page }) => {
    //     await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 300, y: 300 } });

    //     const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
    //     const boxBefore = await throwEvent.boundingBox();

    //     // Move intermediate throw event to new position
    //     await throwEvent.dragTo(throwEvent, {
    //       targetPosition: { x: 500, y: 400 },
    //     });

    //     const boxAfter = await throwEvent.boundingBox();

    //     // Verify position changed
    //     expect(boxAfter?.x).not.toBe(boxBefore?.x);
    //     expect(boxAfter?.y).not.toBe(boxBefore?.y);
    //   });

    //   test("should copy and paste intermediate throw event", async ({ palette, jsonModel, page }) => {
    //     await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 300, y: 300 } });

    //     const throwEvent = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
    //     await throwEvent.click();

    //     // Copy the intermediate throw event
    //     await page.keyboard.press("ControlOrMeta+C");

    //     // Paste the intermediate throw event
    //     await page.keyboard.press("ControlOrMeta+V");

    //     // Verify both events exist in JSON model
    //     const flowElements = await jsonModel.getProcess();
    //     expect(flowElements.flowElement?.length).toBe(2);

    //     // Both should be intermediate throw events
    //     expect(flowElements.flowElement?.[0].__$$element).toBe("intermediateThrowEvent");
    //     expect(flowElements.flowElement?.[1].__$$element).toBe("intermediateThrowEvent");
    //   });
  });
});
