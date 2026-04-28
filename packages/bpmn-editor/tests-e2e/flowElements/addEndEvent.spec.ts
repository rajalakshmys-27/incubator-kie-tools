/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";
import { EdgeType } from "../__fixtures__/edges";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - End Event", () => {
  test.describe("Add from palette", () => {
    test("should add End Event node from palette", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 100, y: 100 } });
      await expect(diagram.get()).toHaveScreenshot("add-end-event-node-from-palette.png");
    });

    test("should add two End Event nodes from palette in a row", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 100, y: 100 } });
      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Second End",
      });
      await diagram.resetFocus();
      await expect(diagram.get()).toHaveScreenshot("add-2-end-event-nodes-from-palette.png");
    });
  });

  // BPMN 2.0 End Event Types:
  // All types available in any context: None, Message, Error, Escalation, Signal, Compensation, Terminate

  test.describe("End event type morphing", () => {
    test("should morph None End Event to Message End Event", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Message" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "messageEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-message.png");
    });

    test("should morph None End Event to Error End Event", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Error" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "errorEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-error.png");
    });

    test("should morph None End Event to Escalation End Event", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Escalation" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "escalationEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-escalation.png");
    });

    test("should morph None End Event to Signal End Event", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Signal" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "signalEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-signal.png");
    });

    test("should morph None End Event to Compensation End Event", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Compensation" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-compensation.png");
    });

    test("should morph None End Event to Terminate End Event", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Terminate" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "terminateEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-terminate.png");
    });
  });

  test.describe("Add connected End Event node", () => {
    test("should create sequence flow from Task to End Event", async ({ diagram, palette, nodes, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 100, y: 100 },
      });
      await diagram.resetFocus();
      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for End Event to be visible and get its ID
      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });
      const endEventId = (await endEvent.getAttribute("data-nodehref")) ?? "";

      await nodes.dragNewConnectedEdge({
        type: EdgeType.SEQUENCE_FLOW,
        from: DefaultNodeName.TASK,
        to: endEventId,
      });

      // Wait for edge to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot since edge creation is visual
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-end-event.png");
    });

    test("should add connected End Event from Gateway node", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 100, y: 100 },
      });

      // Get the Gateway node
      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      // Get Gateway bounding box to hover over it
      const box = await gateway.boundingBox();
      if (!box) throw new Error("Gateway bounding box not found");

      // Hover over the top of the Gateway to reveal connection handles
      await page.mouse.move(box.x + box.width / 2, box.y + 10);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find and click the "Add End Event" handle
      const addEndEventHandle = gateway.getByTitle("Add End Event");
      await expect(addEndEventHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the End Event
      await addEndEventHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the End Event to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-end-event-node-from-gateway.png");
    });

    test("should add connected End Event from Sub-process node", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.SUB_PROCESS,
        targetPosition: { x: 100, y: 100 },
      });

      // Get the Sub-Process node using CSS class
      const subProcess = page.locator(".kie-bpmn-editor--sub-process-node").first();
      await subProcess.waitFor({ state: "attached", timeout: 5000 });

      // Get Sub-Process bounding box to hover over it
      const box = await subProcess.boundingBox();
      if (!box) throw new Error("Sub-Process bounding box not found");

      // Hover over the right side of the Sub-Process to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find and click the "Add End Event" handle
      const addEndEventHandle = subProcess.getByTitle("Add End Event");
      await expect(addEndEventHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the End Event
      await addEndEventHandle.dragTo(diagram.get(), {
        targetPosition: { x: 350, y: 100 },
      });

      // Wait for the End Event to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-end-event-node-from-subprocess.png");
    });
  });

  test.describe("End Event operations", () => {
    test("should delete end event", async ({ palette, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible();

      // Delete using keyboard
      await endEvent.click();
      await page.keyboard.press("Delete");

      await expect(endEvent).not.toBeAttached();

      // Verify it's removed from JSON model
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });

    //   test("should move end event to new position", async ({ palette, page }) => {
    //     await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

    //     const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
    //     const boxBefore = await endEvent.boundingBox();

    //     // Move end event to new position
    //     await endEvent.dragTo(endEvent, {
    //       targetPosition: { x: 500, y: 400 },
    //     });

    //     const boxAfter = await endEvent.boundingBox();

    //     // Verify position changed
    //     expect(boxAfter?.x).not.toBe(boxBefore?.x);
    //     expect(boxAfter?.y).not.toBe(boxBefore?.y);
    //   });

    //   test("should copy and paste end event", async ({ palette, jsonModel, page }) => {
    //     await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

    //     const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
    //     await endEvent.click();

    //     // Copy the end event
    //     await page.keyboard.press("ControlOrMeta+C");

    //     // Paste the end event
    //     await page.keyboard.press("ControlOrMeta+V");

    //     // Verify both end events exist in JSON model
    //     const flowElements = await jsonModel.getProcess();
    //     expect(flowElements.flowElement?.length).toBe(2);

    //     // Both should be end events
    //     expect(flowElements.flowElement?.[0].__$$element).toBe("endEvent");
    //     expect(flowElements.flowElement?.[1].__$$element).toBe("endEvent");
    //   });
  });
});
