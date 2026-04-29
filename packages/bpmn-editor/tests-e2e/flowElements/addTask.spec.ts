/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { TestAnnotations } from "@kie-tools/playwright-base/annotations";
import { test, expect } from "../__fixtures__/base";
import { DefaultNodeName, NodeType, NodePosition } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - Task", () => {
  test.describe("Add from palette", () => {
    test("should add Task node from palette", async ({ palette, nodes, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

      await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-palette.png");
    });

    test("should add two Task nodes from palette in a row", async ({ palette, nodes, diagram }) => {
      test.info().annotations.push({
        type: TestAnnotations.REGRESSION,
      });

      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 100, y: 100 },
        thenRenameTo: "Task A",
      });

      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Task B",
      });

      await diagram.resetFocus();

      await expect(nodes.get({ name: "Task A" })).toBeAttached();
      await expect(nodes.get({ name: "Task B" })).toBeAttached();

      await expect(diagram.get()).toHaveScreenshot("add-2-task-nodes-from-palette.png");
    });
  });

  test.describe("Task type morphing", () => {
    test("should morph Task to User Task", async ({ jsonModel, palette, nodes, diagram, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 300, y: 300 },
      });

      await nodes.select({
        name: DefaultNodeName.TASK,
        position: NodePosition.CENTER,
      });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await task.waitFor({ state: "attached" });
      await nodes.morphNode({ nodeLocator: task, targetMorphType: "User task" });

      const userTask = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(userTask).toMatchObject({
        __$$element: "userTask",
        "@_id": expect.any(String),
        "@_name": DefaultNodeName.TASK,
      });

      await expect(diagram.get()).toHaveScreenshot("morph-task-to-user-task.png");
    });

    test("should morph Task to Service Task", async ({ jsonModel, palette, nodes, diagram, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 300, y: 300 },
      });

      await nodes.select({
        name: DefaultNodeName.TASK,
        position: NodePosition.CENTER,
      });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await task.waitFor({ state: "attached" });
      await nodes.morphNode({ nodeLocator: task, targetMorphType: "Service task" });

      const serviceTask = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(serviceTask).toMatchObject({
        __$$element: "serviceTask",
        "@_id": expect.any(String),
        "@_name": DefaultNodeName.TASK,
      });

      await expect(diagram.get()).toHaveScreenshot("morph-task-to-service-task.png");
    });

    test("should morph Task to Script Task", async ({ jsonModel, palette, nodes, diagram, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 300, y: 300 },
      });

      await nodes.select({
        name: DefaultNodeName.TASK,
        position: NodePosition.CENTER,
      });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await task.waitFor({ state: "attached" });
      await nodes.morphNode({ nodeLocator: task, targetMorphType: "Script task" });

      const scriptTask = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(scriptTask).toMatchObject({
        __$$element: "scriptTask",
        "@_id": expect.any(String),
        "@_name": DefaultNodeName.TASK,
      });

      await expect(diagram.get()).toHaveScreenshot("morph-task-to-script-task.png");
    });

    test("should morph Task to Business Rule Task", async ({ jsonModel, palette, nodes, diagram, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 300, y: 300 },
      });

      await nodes.select({
        name: DefaultNodeName.TASK,
        position: NodePosition.CENTER,
      });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await task.waitFor({ state: "attached" });
      await nodes.morphNode({ nodeLocator: task, targetMorphType: "Business Rule task" });

      const businessRuleTask = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(businessRuleTask).toMatchObject({
        __$$element: "businessRuleTask",
        "@_id": expect.any(String),
        "@_name": DefaultNodeName.TASK,
      });

      await expect(diagram.get()).toHaveScreenshot("morph-task-to-business-rule-task.png");
    });

    test("should morph User Task to Service Task", async ({ jsonModel, palette, nodes, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 300, y: 300 },
      });

      await nodes.select({
        name: DefaultNodeName.TASK,
        position: NodePosition.CENTER,
      });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await task.waitFor({ state: "attached" });

      await nodes.morphNode({ nodeLocator: task, targetMorphType: "User task" });

      let taskElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(taskElement.__$$element).toBe("userTask");

      // Reset hover state before second morph
      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);

      await nodes.morphNode({ nodeLocator: task, targetMorphType: "Service task" });

      taskElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(taskElement).toMatchObject({
        __$$element: "serviceTask",
        "@_id": expect.any(String),
        "@_name": DefaultNodeName.TASK,
      });
    });

    test("should morph Script Task back to generic Task", async ({ jsonModel, palette, nodes, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 300, y: 300 },
      });

      await nodes.select({
        name: DefaultNodeName.TASK,
        position: NodePosition.CENTER,
      });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await task.waitFor({ state: "attached" });

      await nodes.morphNode({ nodeLocator: task, targetMorphType: "Script task" });

      let taskElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(taskElement.__$$element).toBe("scriptTask");

      // Reset hover state before second morph
      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);

      await nodes.morphNode({ nodeLocator: task, targetMorphType: "Task", exact: true });

      taskElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(taskElement).toMatchObject({
        __$$element: "task",
        "@_id": expect.any(String),
        "@_name": DefaultNodeName.TASK,
      });
    });
  });

  test.describe("Add connected Task node", () => {
    test("should add connected Task from Start Event", async ({ diagram, palette, page }) => {
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

      // Find and click the "Add Task" handle
      const addTaskHandle = startEvent.getByTitle("Add Task");
      await expect(addTaskHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the Task
      await addTaskHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the Task to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-start-event.png");
    });

    test("should add connected Task from Gateway", async ({ diagram, palette, page }) => {
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

    test("should add connected Task from another Task", async ({ diagram, palette, page }) => {
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

      // Find and click the "Add Task" handle
      const addTaskHandle = task.getByTitle("Add Task");
      await expect(addTaskHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create another Task
      await addTaskHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the Task to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-task.png");
    });

    test("should create sequence flow from Task to End Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 100, y: 100 },
      });
      await diagram.resetFocus();
      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      // Get the Task and End Event nodes
      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      // Get Task bounding box to hover over it
      const box = await task.boundingBox();
      if (!box) throw new Error("Task bounding box not found");

      // Hover over the right side of the Task to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find the "Add Sequence Flow" handle
      const addSequenceFlowHandle = task.getByTitle("Add Sequence Flow");
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
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-end-event.png");
    });

    test("should create sequence flow from Task to Gateway", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 350, y: 100 },
      });

      // Get the Task and Gateway nodes
      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      // Get Task bounding box to hover over it
      const box = await task.boundingBox();
      if (!box) throw new Error("Task bounding box not found");

      // Hover over the right side of the Task to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find the "Add Sequence Flow" handle
      const addSequenceFlowHandle = task.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      // Get Gateway position for drag target
      const gatewayBox = await gateway.boundingBox();
      if (!gatewayBox) throw new Error("Gateway bounding box not found");

      // Drag from the handle to the Gateway center using diagram as target
      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: gatewayBox.x + gatewayBox.width / 2, y: gatewayBox.y + gatewayBox.height / 2 },
      });

      // Wait for edge to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot since edge creation is visual
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-gateway.png");
    });
  });

  test.describe("Task operations", () => {
    test("should delete task", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.delete({ name: DefaultNodeName.TASK });

      await expect(nodes.get({ name: DefaultNodeName.TASK })).not.toBeAttached();

      // Verify it's removed from JSON model
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });

    test("should move task to new position", async ({ palette, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      const task = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(task).toBeAttached();

      await task.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const taskBox = await task.boundingBox();
      if (!taskBox) {
        throw new Error("Task bounding box not found");
      }

      await task.dragTo(diagram.get(), {
        sourcePosition: { x: 20, y: taskBox.height / 2 },
        targetPosition: { x: 500, y: 400 },
        force: true,
      });

      const boxAfter = await task.boundingBox();

      expect(boxAfter?.x).not.toBe(taskBox?.x);
      expect(boxAfter?.y).not.toBe(taskBox?.y);
    });

    // test("should rename task", async ({ palette, nodes, jsonModel }) => {
    //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
    //   await nodes.rename({ current: DefaultNodeName.TASK, new: "Process Order" });

    //   await expect(nodes.get({ name: "Process Order" })).toBeAttached();

    //   const task = await jsonModel.getFlowElement({ elementIndex: 0 });
    //   expect(task["@_name"]).toBe("Process Order");
    // });

    // test("should copy and paste task", async ({ palette, nodes, jsonModel, page }) => {
    //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    //   // Select and copy the task
    //   await nodes.select({ name: DefaultNodeName.TASK, position: NodePosition.CENTER });
    //   await page.keyboard.press("ControlOrMeta+C");

    //   // Paste the task
    //   await page.keyboard.press("ControlOrMeta+V");

    //   // Verify both tasks exist in JSON model
    //   const flowElements = await jsonModel.getProcess();
    //   expect(flowElements.flowElement?.length).toBe(2);

    //   // Both should be tasks
    //   expect(flowElements.flowElement?.[0].__$$element).toBe("task");
    //   expect(flowElements.flowElement?.[1].__$$element).toBe("task");
    // });
  });
});
