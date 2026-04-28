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

test.describe("Edge Operations - Sequence Flow", () => {
  test("should create sequence flow between two tasks", async ({ palette, nodes, edges, diagram }) => {
    await palette.dragNewNode({
      type: NodeType.TASK,
      targetPosition: { x: 100, y: 100 },
      thenRenameTo: "Task A",
    });
    await palette.dragNewNode({
      type: NodeType.TASK,
      targetPosition: { x: 300, y: 100 },
      thenRenameTo: "Task B",
    });

    await nodes.dragNewConnectedEdge({
      type: EdgeType.SEQUENCE_FLOW,
      from: "Task A",
      to: "Task B",
    });

    await expect(await edges.get({ from: "Task A", to: "Task B" })).toBeAttached();
    expect(await edges.getType({ from: "Task A", to: "Task B" })).toEqual(EdgeType.SEQUENCE_FLOW);
    await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-between-tasks.png");
  });

  test("should create sequence flow from Start Event to Task", async ({ palette, nodes, edges, diagram }) => {
    await palette.dragNewNode({
      type: NodeType.START_EVENT,
      targetPosition: { x: 100, y: 100 },
    });
    await palette.dragNewNode({
      type: NodeType.TASK,
      targetPosition: { x: 300, y: 100 },
    });

    await nodes.dragNewConnectedEdge({
      type: EdgeType.SEQUENCE_FLOW,
      from: DefaultNodeName.START_EVENT,
      to: DefaultNodeName.TASK,
    });

    await expect(await edges.get({ from: DefaultNodeName.START_EVENT, to: DefaultNodeName.TASK })).toBeAttached();
    await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-start-to-task.png");
  });

  // test("should create sequence flow from Task to End Event", async ({ palette, nodes, edges, diagram }) => {
  //   await palette.dragNewNode({
  //     type: NodeType.TASK,
  //     targetPosition: { x: 100, y: 100 },
  //   });
  //   await palette.dragNewNode({
  //     type: NodeType.END_EVENT,
  //     targetPosition: { x: 300, y: 100 },
  //   });

  //   await nodes.dragNewConnectedEdge({
  //     type: EdgeType.SEQUENCE_FLOW,
  //     from: DefaultNodeName.TASK,
  //     to: DefaultNodeName.END_EVENT,
  //   });

  //   await expect(await edges.get({ from: DefaultNodeName.TASK, to: DefaultNodeName.END_EVENT })).toBeAttached();
  //   await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-end.png");
  // });

  test("should delete sequence flow", async ({ palette, nodes, edges, diagram }) => {
    await palette.dragNewNode({
      type: NodeType.TASK,
      targetPosition: { x: 100, y: 100 },
      thenRenameTo: "Task A",
    });
    await nodes.dragNewConnectedNode({
      from: "Task A",
      type: NodeType.TASK,
      targetPosition: { x: 300, y: 100 },
    });

    await edges.delete({ from: "Task A", to: DefaultNodeName.TASK });

    await expect(await edges.get({ from: "Task A", to: DefaultNodeName.TASK })).not.toBeAttached();
    await expect(diagram.get()).toHaveScreenshot("delete-sequence-flow.png");
  });
});

test.describe("Edge Operations - Association", () => {
  test("should create association from Task to Text Annotation", async ({ palette, nodes, edges, diagram }) => {
    await palette.dragNewNode({
      type: NodeType.TASK,
      targetPosition: { x: 100, y: 100 },
    });
    await palette.dragNewNode({
      type: NodeType.TEXT_ANNOTATION,
      targetPosition: { x: 300, y: 100 },
    });

    await nodes.dragNewConnectedEdge({
      type: EdgeType.ASSOCIATION,
      from: DefaultNodeName.TASK,
      to: DefaultNodeName.TEXT_ANNOTATION,
    });

    await expect(await edges.get({ from: DefaultNodeName.TASK, to: DefaultNodeName.TEXT_ANNOTATION })).toBeAttached();
    expect(await edges.getType({ from: DefaultNodeName.TASK, to: DefaultNodeName.TEXT_ANNOTATION })).toEqual(
      EdgeType.ASSOCIATION
    );
    await expect(diagram.get()).toHaveScreenshot("create-association-task-to-annotation.png");
  });

  test("should delete association", async ({ palette, nodes, edges, diagram }) => {
    await palette.dragNewNode({
      type: NodeType.TASK,
      targetPosition: { x: 100, y: 100 },
    });
    await palette.dragNewNode({
      type: NodeType.TEXT_ANNOTATION,
      targetPosition: { x: 300, y: 100 },
    });

    await nodes.dragNewConnectedEdge({
      type: EdgeType.ASSOCIATION,
      from: DefaultNodeName.TASK,
      to: DefaultNodeName.TEXT_ANNOTATION,
    });

    await edges.delete({ from: DefaultNodeName.TASK, to: DefaultNodeName.TEXT_ANNOTATION });

    await expect(
      await edges.get({ from: DefaultNodeName.TASK, to: DefaultNodeName.TEXT_ANNOTATION })
    ).not.toBeAttached();
    await expect(diagram.get()).toHaveScreenshot("delete-association.png");
  });
});

test.describe("Edge Operations - Complete Flow", () => {
  test("should create a complete process flow", async ({ palette, nodes, edges, diagram }) => {
    // Create Start Event
    await palette.dragNewNode({
      type: NodeType.START_EVENT,
      targetPosition: { x: 50, y: 150 },
    });

    // Add Task 1
    await nodes.dragNewConnectedNode({
      from: DefaultNodeName.START_EVENT,
      type: NodeType.TASK,
      targetPosition: { x: 200, y: 150 },
      thenRenameTo: "Task 1",
    });

    // Add Gateway
    await nodes.dragNewConnectedNode({
      from: "Task 1",
      type: NodeType.GATEWAY,
      targetPosition: { x: 350, y: 150 },
    });

    // Add Task 2 (upper branch)
    await nodes.dragNewConnectedNode({
      from: DefaultNodeName.GATEWAY,
      type: NodeType.TASK,
      targetPosition: { x: 500, y: 100 },
      thenRenameTo: "Task 2",
    });

    // Add Task 3 (lower branch)
    await nodes.dragNewConnectedNode({
      from: DefaultNodeName.GATEWAY,
      type: NodeType.TASK,
      targetPosition: { x: 500, y: 200 },
      thenRenameTo: "Task 3",
    });

    // Add End Event
    await palette.dragNewNode({
      type: NodeType.END_EVENT,
      targetPosition: { x: 650, y: 150 },
    });

    // Connect Task 2 to End Event
    await nodes.dragNewConnectedEdge({
      type: EdgeType.SEQUENCE_FLOW,
      from: "Task 2",
      to: DefaultNodeName.END_EVENT,
    });

    // Connect Task 3 to End Event
    await nodes.dragNewConnectedEdge({
      type: EdgeType.SEQUENCE_FLOW,
      from: "Task 3",
      to: DefaultNodeName.END_EVENT,
    });

    await diagram.resetFocus();

    // Verify all edges exist
    await expect(await edges.get({ from: DefaultNodeName.START_EVENT, to: "Task 1" })).toBeAttached();
    await expect(await edges.get({ from: "Task 1", to: DefaultNodeName.GATEWAY })).toBeAttached();
    await expect(await edges.get({ from: DefaultNodeName.GATEWAY, to: "Task 2" })).toBeAttached();
    await expect(await edges.get({ from: DefaultNodeName.GATEWAY, to: "Task 3" })).toBeAttached();
    await expect(await edges.get({ from: "Task 2", to: DefaultNodeName.END_EVENT })).toBeAttached();
    await expect(await edges.get({ from: "Task 3", to: DefaultNodeName.END_EVENT })).toBeAttached();

    await expect(diagram.get()).toHaveScreenshot("complete-process-flow-with-gateway.png");
  });
});
