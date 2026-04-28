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

test.describe("Add node - Gateway", () => {
  test.describe("Add from palette", () => {
    test("should add Gateway node from palette", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 100, y: 100 } });

      await expect(diagram.get()).toHaveScreenshot("add-gateway-node-from-palette.png");
    });

    test("should add two Gateway nodes from palette in a row", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 100, y: 100 } });
      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Second Gateway",
      });

      await diagram.resetFocus();

      await expect(diagram.get()).toHaveScreenshot("add-2-gateway-nodes-from-palette.png");
    });
  });

  // BPMN 2.0 Gateway Types:
  // Exclusive (default), Parallel, Inclusive, Event-Based, Complex

  test.describe("Gateway type morphing", () => {
    test("should morph Exclusive Gateway to Parallel Gateway", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 300, y: 300 } });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      // Verify it starts as Exclusive
      const gatewayElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(gatewayElement.__$$element).toBe("exclusiveGateway");

      await nodes.morphNode({ nodeLocator: gateway, targetMorphType: "Parallel" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "parallelGateway",
          "@_id": expect.any(String),
        });

      await expect(diagram.get()).toHaveScreenshot("morph-gateway-to-parallel.png");
    });

    test("should morph Exclusive Gateway to Inclusive Gateway", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 300, y: 300 } });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: gateway, targetMorphType: "Inclusive" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "inclusiveGateway",
          "@_id": expect.any(String),
        });

      await expect(diagram.get()).toHaveScreenshot("morph-gateway-to-inclusive.png");
    });

    test("should morph Exclusive Gateway to Event-Based Gateway", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 300, y: 300 } });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: gateway, targetMorphType: "Event", exact: true });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "eventBasedGateway",
          "@_id": expect.any(String),
        });

      await expect(diagram.get()).toHaveScreenshot("morph-gateway-to-event-based.png");
    });

    test("should morph Exclusive Gateway to Complex Gateway", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 300, y: 300 } });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: gateway, targetMorphType: "Complex" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "complexGateway",
          "@_id": expect.any(String),
        });

      await expect(diagram.get()).toHaveScreenshot("morph-gateway-to-complex.png");
    });

    test("should morph Parallel Gateway back to Exclusive Gateway", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 300, y: 300 } });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      // First morph to Parallel
      await nodes.morphNode({ nodeLocator: gateway, targetMorphType: "Parallel" });

      const gatewayElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(gatewayElement.__$$element).toBe("parallelGateway");

      // Reset hover state before second morph
      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);

      // Morph back to Exclusive
      await nodes.morphNode({ nodeLocator: gateway, targetMorphType: "Exclusive" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "exclusiveGateway",
          "@_id": expect.any(String),
        });

      await expect(diagram.get()).toHaveScreenshot("morph-gateway-parallel-to-exclusive.png");
    });
  });

  test.describe("Add connected Gateway node", () => {
    test("should add connected Task node from Gateway", async ({ diagram, palette, page }) => {
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

      // Hover over the right side of the Gateway to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find and click the "Add Task" handle
      const addTaskHandle = gateway.getByTitle("Add Task");
      await expect(addTaskHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the Task
      await addTaskHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the Task to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-gateway.png");
    });

    test("should add connected Gateway node from Gateway", async ({ diagram, palette, page }) => {
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

      // Hover over the right side of the Gateway to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find and click the "Add Gateway" handle
      const addGatewayHandle = gateway.getByTitle("Add Gateway");
      await expect(addGatewayHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the Gateway
      await addGatewayHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the Gateway to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-gateway-node-from-gateway.png");
    });

    test("should create sequence flow from Gateway to Task", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 350, y: 100 },
      });

      // Get the Gateway and Task nodes
      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      // Get Gateway bounding box to hover over it
      const box = await gateway.boundingBox();
      if (!box) throw new Error("Gateway bounding box not found");

      // Hover over the right side of the Gateway to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find the "Add Sequence Flow" handle
      const addSequenceFlowHandle = gateway.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      // Get Task position for drag target
      const taskBox = await task.boundingBox();
      if (!taskBox) throw new Error("Task bounding box not found");

      // Drag from the handle to the Task center using diagram as target
      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: taskBox.x + taskBox.width / 2, y: taskBox.y + taskBox.height / 2 },
      });

      // Wait for edge to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot since edge creation is visual
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-gateway-to-task.png");
    });

    test("should create sequence flow from Gateway to End Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 100, y: 100 },
      });
      await diagram.resetFocus();
      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      // Get the Gateway and End Event nodes
      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      // Get Gateway bounding box to hover over it
      const box = await gateway.boundingBox();
      if (!box) throw new Error("Gateway bounding box not found");

      // Hover over the right side of the Gateway to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find the "Add Sequence Flow" handle
      const addSequenceFlowHandle = gateway.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      // Get End Event position for drag target
      const endEventBox = await endEvent.boundingBox();
      if (!endEventBox) throw new Error("End Event bounding box not found");

      // Drag from the handle to the End Event center using diagram as target
      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: endEventBox.x + endEventBox.width / 2, y: endEventBox.y + endEventBox.height / 2 },
      });

      // Wait for edge to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot since edge creation is visual
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-gateway-to-end-event.png");
    });

    test("should create sequence flow from Gateway to another Gateway", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 350, y: 100 },
      });

      // Get the first Gateway and second Gateway nodes
      const firstGateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(firstGateway).toBeVisible({ timeout: 5000 });

      const secondGateway = page.locator(".kie-bpmn-editor--gateway-node").nth(1);
      await expect(secondGateway).toBeAttached();

      // Get first Gateway bounding box to hover over it
      const box = await firstGateway.boundingBox();
      if (!box) throw new Error("First Gateway bounding box not found");

      // Hover over the right side of the first Gateway to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find the "Add Sequence Flow" handle
      const addSequenceFlowHandle = firstGateway.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      // Get second Gateway position for drag target
      const secondGatewayBox = await secondGateway.boundingBox();
      if (!secondGatewayBox) throw new Error("Second Gateway bounding box not found");

      // Drag from the handle to the second Gateway center using diagram as target
      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: {
          x: secondGatewayBox.x + secondGatewayBox.width / 2,
          y: secondGatewayBox.y + secondGatewayBox.height / 2,
        },
      });

      // Wait for edge to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot since edge creation is visual
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-gateway-to-gateway.png");
    });

    test("should add connected Gateway from Start Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      // Get the Start Event node
      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      // Get Start Event bounding box to hover over it
      const box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event bounding box not found");

      // Hover over the right side of the Start Event to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find and click the "Add Gateway" handle
      const addGatewayHandle = startEvent.getByTitle("Add Gateway");
      await expect(addGatewayHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the Gateway
      await addGatewayHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the Gateway to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-gateway-node-from-start-event.png");
    });

    test("should add connected Gateway from Task node", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 100, y: 100 },
      });

      // Get the Task node
      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      // Get Task bounding box to hover over it
      const box = await task.boundingBox();
      if (!box) throw new Error("Task bounding box not found");

      // Hover over the right side of the Task to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find and click the "Add Gateway" handle
      const addGatewayHandle = task.getByTitle("Add Gateway");
      await expect(addGatewayHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the Gateway
      await addGatewayHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the Gateway to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-gateway-node-from-task.png");
    });
  });

  test.describe("Gateway operations", () => {
    test("should delete gateway", async ({ palette, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 300, y: 300 } });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible();

      // Delete using the gateway locator
      await gateway.click();
      await page.keyboard.press("Delete");

      await expect(gateway).not.toBeAttached();

      // Verify it's removed from JSON model
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });

    //   test("should move gateway to new position", async ({ palette, page }) => {
    //     await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 300, y: 300 } });

    //     const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
    //     const boxBefore = await gateway.boundingBox();

    //     // Move gateway to new position
    //     await gateway.dragTo(gateway, {
    //       targetPosition: { x: 500, y: 400 },
    //     });

    //     const boxAfter = await gateway.boundingBox();

    //     // Verify position changed
    //     expect(boxAfter?.x).not.toBe(boxBefore?.x);
    //     expect(boxAfter?.y).not.toBe(boxBefore?.y);
    //   });

    //   test("should copy and paste gateway", async ({ palette, jsonModel, page }) => {
    //     await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 300, y: 300 } });

    //     const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
    //     await gateway.click();

    //     // Copy the gateway
    //     await page.keyboard.press("ControlOrMeta+C");

    //     // Paste the gateway
    //     await page.keyboard.press("ControlOrMeta+V");

    //     // Verify both gateways exist in JSON model
    //     const flowElements = await jsonModel.getProcess();
    //     expect(flowElements.flowElement?.length).toBe(2);

    //     // Both should be gateways
    //     expect(flowElements.flowElement?.[0].__$$element).toBe("exclusiveGateway");
    //     expect(flowElements.flowElement?.[1].__$$element).toBe("exclusiveGateway");
    //   });
  });
});
