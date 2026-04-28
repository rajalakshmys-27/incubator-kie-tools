/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName, NodePosition } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add Boundary Event", () => {
  test.describe("Basic attachment", () => {
    test("should attach intermediate catch event to task", async ({ palette, nodes, jsonModel, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent).toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
      });

      await expect(diagram.get()).toHaveScreenshot("attach-boundary-event-to-task.png");
    });

    test("should attach to subprocess", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent.__$$element).toBe("boundaryEvent");
      expect(boundaryEvent["@_attachedToRef"]).toBeDefined();
    });

    test("should attach multiple boundary events to same task", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 280 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 320 } });

      const process = await jsonModel.getProcess();
      const boundaryEvents = process.flowElement?.filter((e: any) => e.__$$element === "boundaryEvent");
      expect(boundaryEvents?.length).toBe(3);
    });
  });

  test.describe("Detachment", () => {
    test("should detach boundary event back to intermediate catch event", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent.__$$element).toBe("boundaryEvent");

      const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
      await intermediateCatchEvent.dragTo(intermediateCatchEvent, { targetPosition: { x: 200, y: 0 } });

      const detachedEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(detachedEvent.__$$element).toBe("intermediateCatchEvent");
    });
  });

  test.describe("Interrupting vs Non-interrupting", () => {
    test("should create interrupting boundary event by default", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent.__$$element).toBe("boundaryEvent");
      expect(boundaryEvent["@_attachedToRef"]).toBeDefined();
    });
  });

  test.describe("Activity types", () => {
    test("should attach to user task", async ({ palette, nodes, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await nodes.morphNode({ nodeLocator: task, targetMorphType: "User task" });

      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent.__$$element).toBe("boundaryEvent");
      expect(boundaryEvent["@_attachedToRef"]).toBeDefined();
    });

    test("should attach to call activity", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.CALL_ACTIVITY, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent.__$$element).toBe("boundaryEvent");
      expect(boundaryEvent["@_attachedToRef"]).toBeDefined();
    });
  });

  test.describe("Operations", () => {
    test("should delete boundary event", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const intermediateCatchEvent = nodes.get({ name: DefaultNodeName.INTERMEDIATE_CATCH_EVENT });
      await intermediateCatchEvent.click();
      await intermediateCatchEvent.press("Delete");

      const process = await jsonModel.getProcess();
      expect(process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent")).toBeUndefined();
      expect(process.flowElement?.find((e: any) => e.__$$element === "task")).toBeDefined();
    });

    test("should delete task with boundary event", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const task = nodes.get({ name: DefaultNodeName.TASK });
      await task.click();
      await task.press("Delete");

      const process = await jsonModel.getProcess();
      expect(process.flowElement?.filter((e: any) => e.__$$element === "task").length).toBe(0);
      expect(process.flowElement?.filter((e: any) => e.__$$element === "boundaryEvent").length).toBe(0);
    });

    test("should move task with boundary event", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const task = nodes.get({ name: DefaultNodeName.TASK });
      await task.dragTo(task, { targetPosition: { x: 100, y: 50 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent.__$$element).toBe("boundaryEvent");
      expect(boundaryEvent["@_attachedToRef"]).toBeDefined();
    });

    test("should copy and paste task with boundary event", async ({ palette, nodes, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const task = nodes.get({ name: DefaultNodeName.TASK });
      await task.click();
      await page.keyboard.press("Meta+C");
      await page.keyboard.press("Meta+V");

      const process = await jsonModel.getProcess();
      const boundaryEvents = process.flowElement?.filter((e: any) => e.__$$element === "boundaryEvent");
      expect(boundaryEvents?.length).toBe(2);
    });
  });
});

// Made with Bob
