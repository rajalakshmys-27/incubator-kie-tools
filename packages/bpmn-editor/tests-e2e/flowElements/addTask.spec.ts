/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { TestAnnotations } from "@kie-tools/playwright-base/annotations";
import { test, expect } from "../__fixtures__/base";
import { DefaultNodeName, NodeType, NodePosition } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - Task", () => {
  test.describe("Add from palette", () => {
    test("should add Task node from palette", async ({ palette, nodes, jsonModel, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

      await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();

      const task = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(task.__$$element).toBe("task");

      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-palette.png");
    });

    test("should add two Task nodes from palette in a row", async ({ palette, nodes, diagram }) => {
      test.info().annotations.push({ type: TestAnnotations.REGRESSION });

      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 }, thenRenameTo: "Task A" });
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 }, thenRenameTo: "Task B" });

      await diagram.resetFocus();

      await expect(nodes.get({ name: "Task A" })).toBeAttached();
      await expect(nodes.get({ name: "Task B" })).toBeAttached();

      await expect(diagram.get()).toHaveScreenshot("add-2-task-nodes-from-palette.png");
    });
  });

  test.describe("Task type morphing", () => {
    const singleMorphCases = [
      { morphType: "User task", expectedElement: "userTask", screenshot: "morph-task-to-user-task.png" },
      { morphType: "Service task", expectedElement: "serviceTask", screenshot: "morph-task-to-service-task.png" },
      { morphType: "Script task", expectedElement: "scriptTask", screenshot: "morph-task-to-script-task.png" },
      {
        morphType: "Business Rule task",
        expectedElement: "businessRuleTask",
        screenshot: "morph-task-to-business-rule-task.png",
      },
    ];

    for (const { morphType, expectedElement, screenshot } of singleMorphCases) {
      test(`should morph Task to ${morphType}`, async ({ jsonModel, palette, nodes, diagram, page }) => {
        await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

        await nodes.select({ name: DefaultNodeName.TASK, position: NodePosition.CENTER });

        const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
        await task.waitFor({ state: "attached" });
        await nodes.morphNode({ nodeLocator: task, targetMorphType: morphType });

        const result = await jsonModel.getFlowElement({ elementIndex: 0 });
        expect(result.__$$element).toBe(expectedElement);
        expect(result["@_name"]).toBe(DefaultNodeName.TASK);

        await expect(diagram.get()).toHaveScreenshot(screenshot);
      });
    }

    test("should morph User Task to Service Task", async ({ jsonModel, palette, nodes, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      await nodes.select({ name: DefaultNodeName.TASK, position: NodePosition.CENTER });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await task.waitFor({ state: "attached" });

      await nodes.morphNode({ nodeLocator: task, targetMorphType: "User task" });

      let taskElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(taskElement.__$$element).toBe("userTask");

      await page.mouse.move(0, 0);

      await nodes.morphNode({ nodeLocator: task, targetMorphType: "Service task" });

      taskElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(taskElement.__$$element).toBe("serviceTask");
      expect(taskElement["@_name"]).toBe(DefaultNodeName.TASK);
    });

    test("should morph Script Task back to generic Task", async ({ jsonModel, palette, nodes, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      await nodes.select({ name: DefaultNodeName.TASK, position: NodePosition.CENTER });

      const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
      await task.waitFor({ state: "attached" });

      await nodes.morphNode({ nodeLocator: task, targetMorphType: "Script task" });

      let taskElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(taskElement.__$$element).toBe("scriptTask");

      await page.mouse.move(0, 0);

      await nodes.morphNode({ nodeLocator: task, targetMorphType: "Task", exact: true });

      taskElement = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(taskElement.__$$element).toBe("task");
      expect(taskElement["@_name"]).toBe(DefaultNodeName.TASK);
    });
  });

  test.describe("Add connected Task node", () => {
    test("should add connected Task from Start Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 100, y: 100 } });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

      const addTaskHandle = startEvent.getByTitle("Add Task");
      await addTaskHandle.dragTo(diagram.get(), { targetPosition: { x: 300, y: 100 } });

      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-start-event.png");
    });

    test("should add connected Task from Gateway", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 100, y: 100 } });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      const box = await gateway.boundingBox();
      if (!box) throw new Error("Gateway bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

      const addTaskHandle = gateway.getByTitle("Add Task");
      await addTaskHandle.dragTo(diagram.get(), { targetPosition: { x: 300, y: 100 } });

      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-gateway.png");
    });

    test("should add connected Task from another Task", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      const box = await task.boundingBox();
      if (!box) throw new Error("Task bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

      const addTaskHandle = task.getByTitle("Add Task");
      await addTaskHandle.dragTo(diagram.get(), { targetPosition: { x: 300, y: 100 } });

      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-task.png");
    });

    test("should create sequence flow from Task to End Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });
      await diagram.resetFocus();
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 100 } });

      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      const box = await task.boundingBox();
      if (!box) throw new Error("Task bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

      const addSequenceFlowHandle = task.getByTitle("Add Sequence Flow");

      const endEventBox = await endEvent.boundingBox();
      if (!endEventBox) throw new Error("End Event bounding box not found");

      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: endEventBox.x + endEventBox.width / 2, y: endEventBox.y + endEventBox.height / 2 },
      });

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-end-event.png");
    });

    test("should create sequence flow from Task to Gateway", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 350, y: 100 } });

      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      const box = await task.boundingBox();
      if (!box) throw new Error("Task bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

      const addSequenceFlowHandle = task.getByTitle("Add Sequence Flow");

      const gatewayBox = await gateway.boundingBox();
      if (!gatewayBox) throw new Error("Gateway bounding box not found");

      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: gatewayBox.x + gatewayBox.width / 2, y: gatewayBox.y + gatewayBox.height / 2 },
      });

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-gateway.png");
    });
  });

  test.describe("Task operations", () => {
    test("should delete task", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.delete({ name: DefaultNodeName.TASK });

      await expect(nodes.get({ name: DefaultNodeName.TASK })).not.toBeAttached();

      const process = await jsonModel.getProcess();
      expect(process.flowElement?.length).toBe(0);
    });

    test("should move task to new position", async ({ palette, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

      const task = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(task).toBeAttached();
      await task.scrollIntoViewIfNeeded();

      const taskBox = await task.boundingBox();
      if (!taskBox) throw new Error("Task bounding box not found");

      await task.dragTo(diagram.get(), {
        sourcePosition: { x: 20, y: taskBox.height / 2 },
        targetPosition: { x: 500, y: 400 },
        force: true,
      });

      const boxAfter = await task.boundingBox();
      expect(boxAfter?.x).not.toBe(taskBox.x);
      expect(boxAfter?.y).not.toBe(taskBox.y);
    });

    test("should rename task", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.TASK, new: "Process Order" });

      await expect(nodes.get({ name: "Process Order" })).toBeAttached();

      const task = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(task.__$$element).toBe("task");
      expect(task["@_name"]).toBe("Process Order");
    });
  });
});
