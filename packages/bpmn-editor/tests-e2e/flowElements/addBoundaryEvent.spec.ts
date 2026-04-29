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

    test("should attach intermediate catch event to subprocess", async ({ palette, nodes, jsonModel, diagram }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 550, y: 350 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent).toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
      });

      await expect(diagram.get()).toHaveScreenshot("attach-boundary-event-to-subprocess.png");
    });

    test("should attach multiple boundary events to same task", async ({ palette, nodes, jsonModel, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 300, y: 280 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 350, y: 350 } });

      const process = await jsonModel.getProcess();
      const boundaryEvents = process.flowElement?.filter((e: any) => e.__$$element === "boundaryEvent");
      expect(boundaryEvents?.length).toBe(3);

      // Verify each boundary event has proper attachment
      boundaryEvents?.forEach((event: any) => {
        expect(event).toMatchObject({
          __$$element: "boundaryEvent",
          "@_id": expect.any(String),
          "@_attachedToRef": expect.any(String),
        });
      });

      await expect(diagram.get()).toHaveScreenshot("attach-multiple-boundary-events-to-task.png");
    });
  });

  test.describe("Detachment", () => {
    test("should detach boundary event back to intermediate catch event", async ({
      palette,
      nodes,
      jsonModel,
      diagram,
      page,
    }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent).toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
      });

      // Use CSS class selector to locate the boundary event (which was an intermediate catch event)
      const boundaryEventNode = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(boundaryEventNode).toBeVisible({ timeout: 5000 });

      await boundaryEventNode.dragTo(diagram.get(), { targetPosition: { x: 500, y: 100 } });

      const detachedEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(detachedEvent).toMatchObject({
        __$$element: "intermediateCatchEvent",
        "@_id": expect.any(String),
      });
      expect(detachedEvent["@_attachedToRef"]).toBeUndefined();

      await expect(diagram.get()).toHaveScreenshot("detach-boundary-event-from-task.png");
    });
  });

  test.describe("Interrupting vs Non-interrupting", () => {
    test("should create interrupting boundary event by default", async ({ palette, nodes, jsonModel, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent).toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
      });

      await expect(diagram.get()).toHaveScreenshot("interrupting-boundary-event.png");
    });
  });

  test.describe("Activity types", () => {
    test("should attach to user task", async ({ palette, nodes, jsonModel, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await nodes.morphNode({ nodeLocator: task, targetMorphType: "User task" });

      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent).toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
      });

      await expect(diagram.get()).toHaveScreenshot("attach-boundary-event-to-user-task.png");
    });

    test("should attach to call activity", async ({ palette, nodes, jsonModel, diagram }) => {
      await palette.dragNewNode({ type: NodeType.CALL_ACTIVITY, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent).toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
      });

      await expect(diagram.get()).toHaveScreenshot("attach-boundary-event-to-call-activity.png");
    });
  });

  test.describe("Operations", () => {
    test("should delete boundary event", async ({ palette, nodes, jsonModel, diagram, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      // Verify attachment before deletion
      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent).toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
      });

      // Use CSS class selector to locate the boundary event
      const boundaryEventNode = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
      await expect(boundaryEventNode).toBeVisible({ timeout: 5000 });
      await boundaryEventNode.click();
      await boundaryEventNode.press("Delete");

      const process = await jsonModel.getProcess();
      expect(process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent")).toBeUndefined();
      expect(process.flowElement?.find((e: any) => e.__$$element === "task")).toBeDefined();

      await expect(diagram.get()).toHaveScreenshot("delete-boundary-event.png");
    });

    test("should delete task with boundary event", async ({ palette, nodes, jsonModel, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      // Verify attachment before deletion
      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent).toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
      });

      // Delete the task using the helper method
      await nodes.delete({ name: DefaultNodeName.TASK });

      const process = await jsonModel.getProcess();
      expect(process.flowElement?.filter((e: any) => e.__$$element === "task").length).toBe(0);
      expect(process.flowElement?.filter((e: any) => e.__$$element === "boundaryEvent").length).toBe(0);

      await expect(diagram.get()).toHaveScreenshot("delete-task-with-boundary-event.png");
    });

    test("should move task with boundary event", async ({ palette, nodes, jsonModel, diagram, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

      // Use CSS class selector to locate the task node
      const taskNode = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(taskNode).toBeAttached();

      // Scroll into view before dragging
      await taskNode.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Get the task bounding box to calculate a safe drag point
      const taskBox = await taskNode.boundingBox();
      if (!taskBox) {
        throw new Error("Task bounding box not found");
      }

      // Drag from the center-left of the task (away from where boundary event attaches on the right)
      // to avoid the boundary event overlap issue
      await taskNode.dragTo(diagram.get(), {
        sourcePosition: { x: 20, y: taskBox.height / 2 },
        targetPosition: { x: 400, y: 350 },
        force: true,
      });

      // Verify attachment is maintained after move
      const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
      expect(boundaryEvent).toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
      });

      await expect(diagram.get()).toHaveScreenshot("move-task-with-boundary-event.png");
    });

    // test("should copy and paste task with boundary event", async ({ palette, nodes, jsonModel, page, diagram }) => {
    //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
    //   await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

    //   const task = nodes.get({ name: DefaultNodeName.TASK });
    //   await task.click();
    //   await page.keyboard.press("Meta+C");
    //   await page.keyboard.press("Meta+V");

    //   const process = await jsonModel.getProcess();
    //   const boundaryEvents = process.flowElement?.filter((e: any) => e.__$$element === "boundaryEvent");
    //   expect(boundaryEvents?.length).toBe(2);

    //   // Verify both boundary events have proper attachment
    //   boundaryEvents?.forEach((event: any) => {
    //     expect(event).toMatchObject({
    //       __$$element: "boundaryEvent",
    //       "@_id": expect.any(String),
    //       "@_attachedToRef": expect.any(String),
    //     });
    //   });

    //   await expect(diagram.get()).toHaveScreenshot("copy-paste-task-with-boundary-event.png");
    // });
  });
});
