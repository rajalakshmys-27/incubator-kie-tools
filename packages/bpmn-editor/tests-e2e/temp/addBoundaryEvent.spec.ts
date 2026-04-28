/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName, NodePosition } from "../__fixtures__/nodes";

test.describe("Add Boundary Event", () => {
  test.beforeEach(async ({ editor }) => {
    await editor.open();
  });

  test("should attach intermediate catch event to task as boundary event", async ({
    diagram,
    palette,
    nodes,
    jsonModel,
  }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 300 } });

    // Drag the intermediate catch event to the task border to make it a boundary event
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });

    // Get task bounding box to calculate border position
    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    // Drag to the right edge of the task (border position)
    await intermediateCatchEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 2 },
    });

    // Verify the boundary event is attached
    const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
    expect(boundaryEvent.__$$element).toBe("boundaryEvent");
    expect(boundaryEvent["@_attachedToRef"]).toBeDefined();
    expect(boundaryEvent["@_cancelActivity"]).toBe(true); // Default is interrupting
  });

  test("should attach boundary event to sub-process", async ({ diagram, palette, nodes, jsonModel }) => {
    // Create a sub-process
    await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 600, y: 300 } });

    // Drag to sub-process border
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });

    const subProcessBox = await subProcess.boundingBox();
    if (!subProcessBox) {
      throw new Error("Sub-process bounding box not found");
    }

    await intermediateCatchEvent.dragTo(subProcess, {
      targetPosition: { x: subProcessBox.width - 10, y: subProcessBox.height / 2 },
    });

    // Verify boundary event is attached to sub-process
    const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
    expect(boundaryEvent.__$$element).toBe("boundaryEvent");
    expect(boundaryEvent["@_attachedToRef"]).toBeDefined();
  });

  test("should create boundary event with timer event definition", async ({ diagram, palette, nodes, page }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 300 } });

    // Select the intermediate catch event and add timer event definition
    await nodes.select({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT, position: NodePosition.CENTER });

    // Open properties panel and select timer event definition
    await page.getByTitle("Timer").click({ force: true });

    // Drag to task border to make it a boundary event
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });

    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    await intermediateCatchEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 2 },
    });

    // Verify boundary event has timer event definition
    await expect(page.getByTitle("Timer")).toBeVisible();
  });

  test("should create boundary event with error event definition", async ({ diagram, palette, nodes, page }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 300 } });

    // Select the intermediate catch event and add error event definition
    await nodes.select({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT, position: NodePosition.CENTER });
    await page.getByTitle("Error").click({ force: true });

    // Drag to task border
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });

    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    await intermediateCatchEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 2 },
    });

    // Verify boundary event has error event definition
    await expect(page.getByTitle("Error")).toBeVisible();
  });

  test("should create boundary event with message event definition", async ({ diagram, palette, nodes, page }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 300 } });

    // Select the intermediate catch event and add message event definition
    await nodes.select({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT, position: NodePosition.CENTER });
    await page.getByTitle("Message").click({ force: true });

    // Drag to task border
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });

    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    await intermediateCatchEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 2 },
    });

    // Verify boundary event has message event definition
    await expect(page.getByTitle("Message")).toBeVisible();
  });

  test("should create boundary event with signal event definition", async ({ diagram, palette, nodes, page }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 300 } });

    // Select the intermediate catch event and add signal event definition
    await nodes.select({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT, position: NodePosition.CENTER });
    await page.getByTitle("Signal").click({ force: true });

    // Drag to task border
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });

    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    await intermediateCatchEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 2 },
    });

    // Verify boundary event has signal event definition
    await expect(page.getByTitle("Signal")).toBeVisible();
  });

  test("should create boundary event with escalation event definition", async ({ diagram, palette, nodes, page }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 300 } });

    // Select the intermediate catch event and add escalation event definition
    await nodes.select({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT, position: NodePosition.CENTER });
    await page.getByTitle("Escalation").click({ force: true });

    // Drag to task border
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });

    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    await intermediateCatchEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 2 },
    });

    // Verify boundary event has escalation event definition
    await expect(page.getByTitle("Escalation")).toBeVisible();
  });

  test("should create boundary event with conditional event definition", async ({ diagram, palette, nodes, page }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 300 } });

    // Select the intermediate catch event and add conditional event definition
    await nodes.select({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT, position: NodePosition.CENTER });
    await page.getByTitle("Conditional").click({ force: true });

    // Drag to task border
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });

    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    await intermediateCatchEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 2 },
    });

    // Verify boundary event has conditional event definition
    await expect(page.getByTitle("Conditional")).toBeVisible();
  });

  test("should detach boundary event back to intermediate catch event", async ({
    diagram,
    palette,
    nodes,
    jsonModel,
  }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 300 } });

    // Attach as boundary event
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });

    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    await intermediateCatchEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 2 },
    });

    // Verify it's a boundary event
    let boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
    expect(boundaryEvent.__$$element).toBe("boundaryEvent");

    // Drag it away from the task to detach
    const boundaryEventNode = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    await boundaryEventNode.dragTo(diagram.get(), { targetPosition: { x: 600, y: 300 } });

    // Verify it's back to intermediate catch event
    const detachedEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
    expect(detachedEvent.__$$element).toBe("intermediateCatchEvent");
    expect(detachedEvent["@_attachedToRef"]).toBeUndefined();
  });

  test("should create multiple boundary events on same task", async ({ diagram, palette, nodes, jsonModel }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create first intermediate catch event (timer)
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 250 } });
    await nodes.rename({ current: DefaultNodeName.INTERMEDIATE_CATCH_EVENT, new: "Timer Event" });

    // Create second intermediate catch event (error)
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 350 } });
    await nodes.rename({ current: DefaultNodeName.INTERMEDIATE_CATCH_EVENT, new: "Error Event" });

    const task = nodes.get({ name: DefaultNodeName.TASK });
    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    // Attach first boundary event (top-right)
    const timerEvent = nodes.get({ name: "Timer Event" });
    await timerEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 3 },
    });

    // Attach second boundary event (bottom-right)
    const errorEvent = nodes.get({ name: "Error Event" });
    await errorEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: (2 * taskBox.height) / 3 },
    });

    // Verify both are boundary events
    const firstBoundary = await jsonModel.getFlowElement({ elementIndex: 1 });
    expect(firstBoundary.__$$element).toBe("boundaryEvent");

    const secondBoundary = await jsonModel.getFlowElement({ elementIndex: 2 });
    expect(secondBoundary.__$$element).toBe("boundaryEvent");

    // Both should reference the same task
    expect(firstBoundary["@_attachedToRef"]).toBe(secondBoundary["@_attachedToRef"]);
  });

  test("should preserve boundary event connections when attached", async ({
    diagram,
    palette,
    nodes,
    edges,
    jsonModel,
  }) => {
    // Create a task
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

    // Create an intermediate catch event
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 500, y: 300 } });

    // Create an end event and connect it to the intermediate catch event
    await nodes.dragNewConnectedNode({
      type: NodeType.END_EVENT,
      from: DefaultNodeName.INTERMEDIATE_CATCH_EVENT,
      targetPosition: { x: 700, y: 300 },
    });

    // Now attach the intermediate catch event as boundary event
    const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });

    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Task bounding box not found");
    }

    await intermediateCatchEvent.dragTo(task, {
      targetPosition: { x: taskBox.width - 10, y: taskBox.height / 2 },
    });

    // Verify the boundary event still has the outgoing connection
    const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
    expect(boundaryEvent.__$$element).toBe("boundaryEvent");
    expect(boundaryEvent.outgoing).toBeDefined();
    expect(boundaryEvent.outgoing?.length).toBeGreaterThan(0);
  });
});
