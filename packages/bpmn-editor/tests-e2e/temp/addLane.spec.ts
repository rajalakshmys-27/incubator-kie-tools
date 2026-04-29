/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025
 */

import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName, NodePosition } from "../__fixtures__/nodes";

test.describe("Add Lane", () => {
  test.beforeEach(async ({ editor }) => {
    await editor.open();
  });

  test.skip("should add lane from palette", async ({ palette, nodes, diagram }) => {
    await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

    // Lane nodes have visibility:hidden CSS, so we can only check if they're attached, not visible
    await expect(nodes.get({ name: DefaultNodeName.LANE })).toBeAttached();
    await expect(diagram.get()).toHaveScreenshot("add-lane-node-from-palette.png");
  });

  // TODO: All other lane tests are commented out because lanes have special rendering
  // with visibility:hidden CSS that makes them incompatible with standard node operations
  // like select(), rename(), delete(), etc. These operations require visible elements.

  // TODO: Lane renaming is not working - element is not visible for clicking
  // test.skip("should rename lane", async ({ palette, nodes }) => {
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });
  //   await nodes.rename({ current: DefaultNodeName.LANE, new: "Customer Service" });
  //   await expect(nodes.get({ name: "Customer Service" })).toBeAttached();
  // });

  // TODO: Lane deletion is not working - element is not visible for clicking
  // test.skip("should delete lane", async ({ palette, nodes }) => {
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });
  //   await nodes.delete({ name: DefaultNodeName.LANE });
  //   await expect(nodes.get({ name: DefaultNodeName.LANE })).not.toBeAttached();
  // });

  // TODO: Lane resizing is not working - element is not visible for clicking
  // test.skip("should resize lane", async ({ palette, nodes }) => {
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });
  //   const laneBefore = nodes.get({ name: DefaultNodeName.LANE });
  //   const boxBefore = await laneBefore.boundingBox();
  //   await nodes.resize({ nodeName: DefaultNodeName.LANE, xOffset: 100, yOffset: 50 });
  //   const laneAfter = nodes.get({ name: DefaultNodeName.LANE });
  //   const boxAfter = await laneAfter.boundingBox();
  //   expect(boxAfter?.width).toBeGreaterThan(boxBefore?.width ?? 0);
  //   expect(boxAfter?.height).toBeGreaterThan(boxBefore?.height ?? 0);
  // });

  // TODO: element is not visible for clicking
  // test.skip("should create multiple lanes", async ({ palette, nodes }) => {
  //   // Create first lane
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 200 } });
  //   await nodes.rename({ current: DefaultNodeName.LANE, new: "Sales" });

  //   // Create second lane
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 400 } });
  //   await nodes.rename({ current: DefaultNodeName.LANE, new: "Marketing" });

  //   // Create third lane
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 600 } });
  //   await nodes.rename({ current: DefaultNodeName.LANE, new: "Support" });

  //   await expect(nodes.get({ name: "Sales" })).toBeAttached();
  //   await expect(nodes.get({ name: "Marketing" })).toBeAttached();
  //   await expect(nodes.get({ name: "Support" })).toBeAttached();
  // });

  // TODO: Lane interaction tests are not working - element is not visible
  // test.skip("should move task into lane", async ({ palette, nodes }) => {
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });
  //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });
  //   const lane = nodes.get({ name: DefaultNodeName.LANE });
  //   const laneBox = await lane.boundingBox();
  //   if (!laneBox) throw new Error("Lane bounding box not found");
  //   const task = nodes.get({ name: DefaultNodeName.TASK });
  //   await task.dragTo(lane, { targetPosition: { x: laneBox.width / 2, y: laneBox.height / 2 } });
  //   await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
  // });

  // TODO: Lane interaction tests are not working - element is not visible
  // test.skip("should move task out of lane", async ({ palette, nodes, diagram }) => {
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

  //   // Create a task inside the lane
  //   const lane = nodes.get({ name: DefaultNodeName.LANE });
  //   const laneBox = await lane.boundingBox();
  //   if (!laneBox) {
  //     throw new Error("Lane bounding box not found");
  //   }

  //   await palette.dragNewNode({
  //     type: NodeType.TASK,
  //     targetPosition: { x: 300 + laneBox.width / 2, y: 300 + laneBox.height / 2 },
  //   });

  //   // Drag task out of the lane
  //   const task = nodes.get({ name: DefaultNodeName.TASK });
  //   await task.dragTo(diagram.get(), { targetPosition: { x: 100, y: 100 } });

  //   // Verify task still exists
  //   await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
  // });

  // TODO: element is not visible for clicking
  // test.skip("should move multiple tasks into lane", async ({ palette, nodes }) => {
  //   // Create a lane
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 400, y: 400 } });

  //   // Create multiple tasks
  //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });
  //   await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 1" });

  //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 200 } });
  //   await nodes.rename({ current: DefaultNodeName.TASK, new: "Task 2" });

  //   // Select both tasks
  //   await nodes.selectMultiple({ names: ["Task 1", "Task 2"], position: NodePosition.CENTER });

  //   // Get lane bounding box
  //   const lane = nodes.get({ name: DefaultNodeName.LANE });
  //   const laneBox = await lane.boundingBox();
  //   if (!laneBox) {
  //     throw new Error("Lane bounding box not found");
  //   }

  //   // Drag one of the selected tasks into the lane (both should move)
  //   const task1 = nodes.get({ name: "Task 1" });
  //   await task1.dragTo(lane, {
  //     targetPosition: { x: laneBox.width / 2, y: laneBox.height / 2 },
  //   });

  //   // Verify both tasks still exist
  //   await expect(nodes.get({ name: "Task 1" })).toBeAttached();
  //   await expect(nodes.get({ name: "Task 2" })).toBeAttached();
  // });

  // test.skip("should create task inside lane from palette", async ({ palette, nodes }) => {
  //   // Create a lane
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

  //   // Get lane bounding box
  //   const lane = nodes.get({ name: DefaultNodeName.LANE });
  //   const laneBox = await lane.boundingBox();
  //   if (!laneBox) {
  //     throw new Error("Lane bounding box not found");
  //   }

  //   // Create a task inside the lane
  //   await palette.dragNewNode({
  //     type: NodeType.TASK,
  //     targetPosition: { x: 300 + laneBox.width / 2, y: 300 + laneBox.height / 2 },
  //   });

  //   // Verify task exists
  //   await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
  // });

  // test.skip("should create connected task inside lane", async ({ palette, nodes }) => {
  //   // Create a lane
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

  //   // Get lane bounding box
  //   const lane = nodes.get({ name: DefaultNodeName.LANE });
  //   const laneBox = await lane.boundingBox();
  //   if (!laneBox) {
  //     throw new Error("Lane bounding box not found");
  //   }

  //   // Create a start event inside the lane
  //   await palette.dragNewNode({
  //     type: NodeType.START_EVENT,
  //     targetPosition: { x: 300 + laneBox.width / 3, y: 300 + laneBox.height / 2 },
  //   });

  //   // Create a connected task inside the lane
  //   await nodes.dragNewConnectedNode({
  //     type: NodeType.TASK,
  //     from: DefaultNodeName.START_EVENT,
  //     targetPosition: { x: 300 + (2 * laneBox.width) / 3, y: 300 + laneBox.height / 2 },
  //   });

  //   // Verify both elements exist
  //   await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
  // });

  // TODO: element is not visible for clicking
  // test.skip("should move task between lanes", async ({ palette, nodes }) => {
  //   // Create first lane
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 200 } });
  //   await nodes.rename({ current: DefaultNodeName.LANE, new: "Lane 1" });

  //   // Create second lane
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 500 } });
  //   await nodes.rename({ current: DefaultNodeName.LANE, new: "Lane 2" });

  //   // Create a task in Lane 1
  //   const lane1 = nodes.get({ name: "Lane 1" });
  //   const lane1Box = await lane1.boundingBox();
  //   if (!lane1Box) {
  //     throw new Error("Lane 1 bounding box not found");
  //   }

  //   await palette.dragNewNode({
  //     type: NodeType.TASK,
  //     targetPosition: { x: 300 + lane1Box.width / 2, y: 200 + lane1Box.height / 2 },
  //   });

  //   // Move task to Lane 2
  //   const lane2 = nodes.get({ name: "Lane 2" });
  //   const lane2Box = await lane2.boundingBox();
  //   if (!lane2Box) {
  //     throw new Error("Lane 2 bounding box not found");
  //   }

  //   const task = nodes.get({ name: DefaultNodeName.TASK });
  //   await task.dragTo(lane2, {
  //     targetPosition: { x: lane2Box.width / 2, y: lane2Box.height / 2 },
  //   });

  //   // Verify task still exists
  //   await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
  // });

  // TODO: element is not visible for clicking
  // test.skip("should select and deselect lane", async ({ palette, nodes, page }) => {
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

  //   // Select lane
  //   await nodes.select({ name: DefaultNodeName.LANE, position: NodePosition.CENTER });

  //   // Verify it's selected
  //   const selectedNode = page.locator(`div[data-nodelabel="${DefaultNodeName.LANE}"][data-selected="true"]`);
  //   await expect(selectedNode).toBeAttached();

  //   // Deselect by clicking on diagram
  //   await page.locator('[data-testid="rf__wrapper"]').click({ position: { x: 100, y: 100 } });

  //   // Verify it's deselected
  //   const deselectedNode = page.locator(`div[data-nodelabel="${DefaultNodeName.LANE}"][data-selected="false"]`);
  //   await expect(deselectedNode).toBeAttached();
  // });

  // test.skip("should delete lane with tasks inside", async ({ palette, nodes }) => {
  //   // Create a lane
  //   await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

  //   // Create a task inside the lane
  //   const lane = nodes.get({ name: DefaultNodeName.LANE });
  //   const laneBox = await lane.boundingBox();
  //   if (!laneBox) {
  //     throw new Error("Lane bounding box not found");
  //   }

  //   await palette.dragNewNode({
  //     type: NodeType.TASK,
  //     targetPosition: { x: 300 + laneBox.width / 2, y: 300 + laneBox.height / 2 },
  //   });

  //   // Delete the lane
  //   await nodes.delete({ name: DefaultNodeName.LANE });

  //   // Verify lane is deleted
  //   await expect(nodes.get({ name: DefaultNodeName.LANE })).not.toBeAttached();

  //   // Verify task still exists (moved out of lane)
  //   await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
  // });
});
