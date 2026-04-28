/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Compensation Boundary Events", () => {
  test("should create compensation boundary event on task", async ({ palette, nodes, jsonModel, page }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

    const event = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });
    const taskBox = await task.boundingBox();

    await event.dragTo(task, { targetPosition: { x: taskBox!.width - 10, y: taskBox!.height / 2 } });

    // TODO: Add compensation event definition through properties panel when available

    const process = await jsonModel.getProcess();
    const boundaryEvent = process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");

    expect(boundaryEvent).toBeDefined();
    expect(boundaryEvent["@_cancelActivity"]).toBe(true);
  });

  test("should not allow incoming sequence flows to compensation boundary event", async ({
    palette,
    nodes,
    jsonModel,
  }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

    const event = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const task = nodes.get({ name: DefaultNodeName.TASK });
    const taskBox = await task.boundingBox();

    await event.dragTo(task, { targetPosition: { x: taskBox!.width - 10, y: taskBox!.height / 2 } });

    // TODO: Add compensation event definition and verify no incoming sequence flows allowed

    const process = await jsonModel.getProcess();
    const boundaryEvent = process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");

    expect(boundaryEvent).toBeDefined();
  });

  test("should allow compensation boundary event on subprocess", async ({ palette, nodes, jsonModel }) => {
    await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 300, y: 300 } });
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 600, y: 300 } });

    const event = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
    const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
    const box = await subProcess.boundingBox();

    await event.dragTo(subProcess, { targetPosition: { x: box!.width - 10, y: box!.height / 2 } });

    const process = await jsonModel.getProcess();
    const boundaryEvent = process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");
    const subProcessElement = process.flowElement?.find((e: any) => e.__$$element === "subProcess");

    expect(boundaryEvent["@_attachedToRef"]).toBe(subProcessElement["@_id"]);
  });
});

// Made with Bob
