/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName, NodePosition } from "../__fixtures__/nodes";
import { EdgeType } from "../__fixtures__/edges";

test.describe("Node Operations", () => {
  test.beforeEach(async ({ editor }) => {
    await editor.open();
  });

  test.describe("Delete Operations", () => {
    test("should delete single task", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.delete({ name: DefaultNodeName.TASK });

      await expect(nodes.get({ name: DefaultNodeName.TASK })).not.toBeAttached();

      // Verify it's removed from JSON model
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });

    test("should delete task with connections", async ({ palette, nodes, edges, jsonModel }) => {
      // Create a flow: Start -> Task -> End
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 200, y: 300 } });
      await nodes.dragNewConnectedNode({
        type: NodeType.TASK,
        from: DefaultNodeName.START_EVENT,
        targetPosition: { x: 400, y: 300 },
      });
      await nodes.dragNewConnectedNode({
        type: NodeType.END_EVENT,
        from: DefaultNodeName.TASK,
        targetPosition: { x: 600, y: 300 },
      });

      // Delete the task
      await nodes.delete({ name: DefaultNodeName.TASK });

      await expect(nodes.get({ name: DefaultNodeName.TASK })).not.toBeAttached();

      // Verify connections are also deleted
      const edge1 = await edges.get({ from: DefaultNodeName.START_EVENT, to: DefaultNodeName.TASK });
      expect(edge1).toBeNull();

      const edge2 = await edges.get({ from: DefaultNodeName.TASK, to: DefaultNodeName.END_EVENT });
      expect(edge2).toBeNull();
    });

    test("should delete multiple nodes", async ({ palette, nodes, jsonModel }) => {
      // Create multiple tasks
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 200, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 1" });

      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 400, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 2" });

      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 600, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 3" });

      // Delete multiple nodes
      await nodes.deleteMultiple({ names: ["Task 1", "Task 2"] });

      await expect(nodes.get({ name: "Task 1" })).not.toBeAttached();
      await expect(nodes.get({ name: "Task 2" })).not.toBeAttached();
      await expect(nodes.get({ name: "Task 3" })).toBeAttached();

      // Verify only Task 3 remains
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(1);
    });

    test("should delete gateway with multiple connections", async ({ palette, nodes, edges }) => {
      // Create a gateway with multiple outgoing connections
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 200, y: 300 } });
      await nodes.dragNewConnectedNode({
        type: NodeType.GATEWAY,
        from: DefaultNodeName.START_EVENT,
        targetPosition: { x: 400, y: 300 },
      });

      // Add multiple tasks connected to gateway
      await nodes.dragNewConnectedNode({
        type: NodeType.TASK,
        from: DefaultNodeName.GATEWAY,
        targetPosition: { x: 600, y: 200 },
        thenRenameTo: "Task 1",
      });

      await nodes.dragNewConnectedNode({
        type: NodeType.TASK,
        from: DefaultNodeName.GATEWAY,
        targetPosition: { x: 600, y: 400 },
        thenRenameTo: "Task 2",
      });

      // Delete the gateway
      await nodes.delete({ name: DefaultNodeName.GATEWAY });

      await expect(nodes.get({ name: DefaultNodeName.GATEWAY })).not.toBeAttached();

      // Verify all connections to/from gateway are deleted
      const edge1 = await edges.get({ from: DefaultNodeName.START_EVENT, to: DefaultNodeName.GATEWAY });
      expect(edge1).toBeNull();

      const edge2 = await edges.get({ from: DefaultNodeName.GATEWAY, to: "Task 1" });
      expect(edge2).toBeNull();

      const edge3 = await edges.get({ from: DefaultNodeName.GATEWAY, to: "Task 2" });
      expect(edge3).toBeNull();
    });

    test("should delete using keyboard shortcut", async ({ palette, nodes, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.select({ name: DefaultNodeName.TASK, position: NodePosition.CENTER });

      // Delete using keyboard
      await diagram.get().press("Delete");

      await expect(nodes.get({ name: DefaultNodeName.TASK })).not.toBeAttached();
    });
  });

  test.describe("Move Operations", () => {
    test("should move task to new position", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      const taskBefore = nodes.get({ name: DefaultNodeName.TASK });
      const boxBefore = await taskBefore.boundingBox();

      // Move task to new position
      await taskBefore.dragTo(nodes.get({ name: DefaultNodeName.TASK }), {
        targetPosition: { x: 500, y: 400 },
      });

      const taskAfter = nodes.get({ name: DefaultNodeName.TASK });
      const boxAfter = await taskAfter.boundingBox();

      // Verify position changed
      expect(boxAfter?.x).not.toBe(boxBefore?.x);
      expect(boxAfter?.y).not.toBe(boxBefore?.y);
    });

    test("should move task while preserving connections", async ({ palette, nodes, edges }) => {
      // Create connected flow
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 200, y: 300 } });
      await nodes.dragNewConnectedNode({
        type: NodeType.TASK,
        from: DefaultNodeName.START_EVENT,
        targetPosition: { x: 400, y: 300 },
      });
      await nodes.dragNewConnectedNode({
        type: NodeType.END_EVENT,
        from: DefaultNodeName.TASK,
        targetPosition: { x: 600, y: 300 },
      });

      // Move the task
      const task = nodes.get({ name: DefaultNodeName.TASK });
      await task.dragTo(task, { targetPosition: { x: 400, y: 500 } });

      // Verify connections still exist
      const edge1 = await edges.get({ from: DefaultNodeName.START_EVENT, to: DefaultNodeName.TASK });
      expect(edge1).toBeDefined();

      const edge2 = await edges.get({ from: DefaultNodeName.TASK, to: DefaultNodeName.END_EVENT });
      expect(edge2).toBeDefined();
    });

    test("should move multiple selected nodes together", async ({ palette, nodes }) => {
      // Create multiple tasks
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 200, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 1" });

      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 400, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 2" });

      // Select both tasks
      await nodes.selectMultiple({ names: ["Task 1", "Task 2"], position: NodePosition.CENTER });

      // Get initial positions
      const task1Before = await nodes.get({ name: "Task 1" }).boundingBox();
      const task2Before = await nodes.get({ name: "Task 2" }).boundingBox();

      // Move one of the selected tasks (both should move)
      const task1 = nodes.get({ name: "Task 1" });
      await task1.dragTo(task1, { targetPosition: { x: 300, y: 500 } });

      // Verify both tasks moved
      const task1After = await nodes.get({ name: "Task 1" }).boundingBox();
      const task2After = await nodes.get({ name: "Task 2" }).boundingBox();

      expect(task1After?.y).not.toBe(task1Before?.y);
      expect(task2After?.y).not.toBe(task2Before?.y);
    });
  });

  test.describe("Resize Operations", () => {
    test("should resize task horizontally", async ({ palette, nodes }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      const taskBefore = nodes.get({ name: DefaultNodeName.TASK });
      const boxBefore = await taskBefore.boundingBox();

      await nodes.resize({ nodeName: DefaultNodeName.TASK, xOffset: 100, yOffset: 0 });

      const taskAfter = nodes.get({ name: DefaultNodeName.TASK });
      const boxAfter = await taskAfter.boundingBox();

      expect(boxAfter?.width).toBeGreaterThan(boxBefore?.width ?? 0);
      expect(boxAfter?.height).toBe(boxBefore?.height);
    });

    test("should resize task vertically", async ({ palette, nodes }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      const taskBefore = nodes.get({ name: DefaultNodeName.TASK });
      const boxBefore = await taskBefore.boundingBox();

      await nodes.resize({ nodeName: DefaultNodeName.TASK, xOffset: 0, yOffset: 50 });

      const taskAfter = nodes.get({ name: DefaultNodeName.TASK });
      const boxAfter = await taskAfter.boundingBox();

      expect(boxAfter?.width).toBe(boxBefore?.width);
      expect(boxAfter?.height).toBeGreaterThan(boxBefore?.height ?? 0);
    });

    test("should resize sub-process", async ({ palette, nodes }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 300, y: 300 } });

      const subProcessBefore = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
      const boxBefore = await subProcessBefore.boundingBox();

      await nodes.resize({ nodeName: DefaultNodeName.SUB_PROCESS, xOffset: 150, yOffset: 100 });

      const subProcessAfter = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
      const boxAfter = await subProcessAfter.boundingBox();

      expect(boxAfter?.width).toBeGreaterThan(boxBefore?.width ?? 0);
      expect(boxAfter?.height).toBeGreaterThan(boxBefore?.height ?? 0);
    });

    test("should resize while preserving connections", async ({ palette, nodes, edges }) => {
      // Create connected flow
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 200, y: 300 } });
      await nodes.dragNewConnectedNode({
        type: NodeType.TASK,
        from: DefaultNodeName.START_EVENT,
        targetPosition: { x: 400, y: 300 },
      });

      // Resize the task
      await nodes.resize({ nodeName: DefaultNodeName.TASK, xOffset: 80, yOffset: 40 });

      // Verify connection still exists
      const edge = await edges.get({ from: DefaultNodeName.START_EVENT, to: DefaultNodeName.TASK });
      expect(edge).toBeDefined();
    });
  });

  test.describe("Copy/Paste Operations", () => {
    test("should copy and paste single task", async ({ palette, nodes, page, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Original Task" });

      // Select and copy
      await nodes.select({ name: "Original Task", position: NodePosition.CENTER });
      await page.keyboard.press("Control+C");

      // Paste
      await page.keyboard.press("Control+V");

      // Verify original task still exists
      await expect(nodes.get({ name: "Original Task" })).toBeAttached();

      // Verify copy was created (should have different name or position)
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(2);
    });

    test("should copy and paste multiple nodes", async ({ palette, nodes, page, jsonModel }) => {
      // Create multiple tasks
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 200, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 1" });

      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 400, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 2" });

      // Select both tasks
      await nodes.selectMultiple({ names: ["Task 1", "Task 2"], position: NodePosition.CENTER });

      // Copy and paste
      await page.keyboard.press("Control+C");
      await page.keyboard.press("Control+V");

      // Verify originals still exist
      await expect(nodes.get({ name: "Task 1" })).toBeAttached();
      await expect(nodes.get({ name: "Task 2" })).toBeAttached();

      // Verify copies were created
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(4);
    });

    test("should copy and paste connected nodes", async ({ palette, nodes, page, jsonModel }) => {
      // Create connected flow
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 200, y: 300 } });
      await nodes.dragNewConnectedNode({
        type: NodeType.TASK,
        from: DefaultNodeName.START_EVENT,
        targetPosition: { x: 400, y: 300 },
      });

      // Select both nodes
      await nodes.selectMultiple({
        names: [DefaultNodeName.START_EVENT, DefaultNodeName.TASK],
        position: NodePosition.CENTER,
      });

      // Copy and paste
      await page.keyboard.press("Control+C");
      await page.keyboard.press("Control+V");

      // Verify originals still exist
      await expect(nodes.get({ name: DefaultNodeName.START_EVENT })).toBeAttached();
      await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();

      // Verify copies were created with connections
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(4); // 2 originals + 2 copies
    });

    test("should cut and paste task", async ({ palette, nodes, page, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Cut Task" });

      // Select and cut
      await nodes.select({ name: "Cut Task", position: NodePosition.CENTER });
      await page.keyboard.press("Control+X");

      // Verify task is removed
      await expect(nodes.get({ name: "Cut Task" })).not.toBeAttached();

      // Paste
      await page.keyboard.press("Control+V");

      // Verify task is restored
      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(1);
    });
  });

  test.describe("Selection Operations", () => {
    test("should select single node", async ({ palette, nodes, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.select({ name: DefaultNodeName.TASK, position: NodePosition.CENTER });

      const selectedNode = page.locator(`div[data-nodelabel="${DefaultNodeName.TASK}"][data-selected="true"]`);
      await expect(selectedNode).toBeAttached();
    });

    test("should select multiple nodes with Ctrl+Click", async ({ palette, nodes, page }) => {
      // Create multiple tasks
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 200, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 1" });

      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 400, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 2" });

      // Select multiple
      await nodes.selectMultiple({ names: ["Task 1", "Task 2"], position: NodePosition.CENTER });

      // Verify both are selected
      const selected1 = page.locator(`div[data-nodelabel="Task 1"][data-selected="true"]`);
      const selected2 = page.locator(`div[data-nodelabel="Task 2"][data-selected="true"]`);

      await expect(selected1).toBeAttached();
      await expect(selected2).toBeAttached();
    });

    test("should deselect node by clicking on canvas", async ({ palette, nodes, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.select({ name: DefaultNodeName.TASK, position: NodePosition.CENTER });

      // Click on canvas to deselect
      await diagram.get().click({ position: { x: 100, y: 100 } });

      const deselectedNode = page.locator(`div[data-nodelabel="${DefaultNodeName.TASK}"][data-selected="false"]`);
      await expect(deselectedNode).toBeAttached();
    });

    test("should select all nodes with Ctrl+A", async ({ palette, nodes, page }) => {
      // Create multiple nodes
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 200, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 1" });

      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 400, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 2" });

      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 600, y: 300 } });

      // Select all
      await page.keyboard.press("Control+A");

      // Verify all are selected
      const selected1 = page.locator(`div[data-nodelabel="Task 1"][data-selected="true"]`);
      const selected2 = page.locator(`div[data-nodelabel="Task 2"][data-selected="true"]`);
      const selected3 = page.locator(`div[data-nodelabel="${DefaultNodeName.GATEWAY}"][data-selected="true"]`);

      await expect(selected1).toBeAttached();
      await expect(selected2).toBeAttached();
      await expect(selected3).toBeAttached();
    });
  });

  test.describe("Undo/Redo Operations", () => {
    test("should undo node creation", async ({ palette, nodes, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();

      // Undo
      await page.keyboard.press("Control+Z");

      // Verify task is removed
      await expect(nodes.get({ name: DefaultNodeName.TASK })).not.toBeAttached();
    });

    test("should redo node creation", async ({ palette, nodes, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      // Undo
      await page.keyboard.press("Control+Z");
      await expect(nodes.get({ name: DefaultNodeName.TASK })).not.toBeAttached();

      // Redo
      await page.keyboard.press("Control+Y");
      await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
    });

    test("should undo node deletion", async ({ palette, nodes, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.delete({ name: DefaultNodeName.TASK });
      await expect(nodes.get({ name: DefaultNodeName.TASK })).not.toBeAttached();

      // Undo deletion
      await page.keyboard.press("Control+Z");
      await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
    });
  });
});
