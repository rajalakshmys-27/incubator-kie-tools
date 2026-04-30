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

test.describe("Add node - Sub-process", () => {
  test.describe("Add from palette", () => {
    test("should add Sub-process node from palette", async ({ palette, nodes, diagram }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 100 } });

      await expect(nodes.get({ name: DefaultNodeName.SUB_PROCESS })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("add-sub-process-node-from-palette.png");
    });

    test("should add two Sub-process nodes from palette in a row", async ({ palette, nodes, diagram }) => {
      test.info().annotations.push({
        type: TestAnnotations.REGRESSION,
      });

      await palette.dragNewNode({
        type: NodeType.SUB_PROCESS,
        targetPosition: { x: 100, y: 100 },
        thenRenameTo: "Sub-process A",
      });

      await palette.dragNewNode({
        type: NodeType.SUB_PROCESS,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Sub-process B",
      });

      await diagram.resetFocus();

      await expect(nodes.get({ name: "Sub-process A" })).toBeAttached();
      await expect(nodes.get({ name: "Sub-process B" })).toBeAttached();

      await expect(diagram.get()).toHaveScreenshot("add-2-subprocess-nodes-from-palette.png");
    });
  });

  test.describe("Add connected Sub-process node", () => {
    test("should add connected Task from Sub-process", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.SUB_PROCESS,
        targetPosition: { x: 100, y: 100 },
      });

      const subProcess = page.locator('[data-nodelabel="New Sub-process"]').first();
      await expect(subProcess).toBeAttached();

      const box = await subProcess.boundingBox();
      if (!box) throw new Error("Sub-process bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

      const addTaskHandle = subProcess.getByTitle("Add Task");
      await expect(addTaskHandle).toBeVisible({ timeout: 5000 });

      await addTaskHandle.dragTo(diagram.get(), {
        targetPosition: { x: 400, y: 100 },
      });

      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-subprocess.png");
    });

    test("should create sequence flow from Start Event to Sub-process", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.SUB_PROCESS,
        targetPosition: { x: 400, y: 100 },
      });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const subProcess = page.locator('[data-nodelabel="New Sub-process"]').first();
      await expect(subProcess).toBeAttached();

      const box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

      const addSequenceFlowHandle = startEvent.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      const subProcessBox = await subProcess.boundingBox();
      if (!subProcessBox) throw new Error("Sub-process bounding box not found");

      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: subProcessBox.x + subProcessBox.width / 2, y: subProcessBox.y + subProcessBox.height / 2 },
      });

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-start-event-to-subprocess.png");
    });

    test("should create sequence flow from Gateway to Sub-process", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.SUB_PROCESS,
        targetPosition: { x: 400, y: 100 },
      });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      const subProcess = page.locator('[data-nodelabel="New Sub-process"]').first();
      await expect(subProcess).toBeAttached();

      const box = await gateway.boundingBox();
      if (!box) throw new Error("Gateway bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

      const addSequenceFlowHandle = gateway.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      const subProcessBox = await subProcess.boundingBox();
      if (!subProcessBox) throw new Error("Sub-process bounding box not found");

      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: subProcessBox.x + subProcessBox.width / 2, y: subProcessBox.y + subProcessBox.height / 2 },
      });

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-gateway-to-subprocess.png");
    });
  });

  test.describe("Sub-process morphing", () => {
    test.beforeEach(async ({ palette, nodes, page }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 300, y: 300 } });

      const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
      await expect(subProcess).toBeAttached();

      const box = await subProcess.boundingBox();
      if (!box) throw new Error("Sub-Process not visible");

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

      const morphingToggle = subProcess.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
      await expect(morphingToggle).toBeVisible({ timeout: 5000 });
      await morphingToggle.click({ force: true });
    });

    test("should morph Sub-process to Event Sub-process", async ({ page, diagram }) => {
      const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
      const eventOption = morphingPanel.locator('div[title="Event"]').first();
      await expect(eventOption).toBeVisible({ timeout: 5000 });
      await eventOption.click({ force: true });

      await expect(diagram.get()).toHaveScreenshot("morph-subprocess-to-event.png");
    });

    test("should morph Sub-process to Multi-instance Sub-process", async ({ page, diagram }) => {
      const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
      const multiInstanceOption = morphingPanel.locator('div[title="Multi-instance"]').first();
      await expect(multiInstanceOption).toBeVisible({ timeout: 5000 });
      await multiInstanceOption.click({ force: true });

      await expect(diagram.get()).toHaveScreenshot("morph-subprocess-to-multi-instance.png");
    });

    test("should morph Sub-process to Ad-hoc Sub-process", async ({ page, diagram }) => {
      const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
      const adHocOption = morphingPanel.locator('div[title="Ad-hoc"]').first();
      await expect(adHocOption).toBeVisible({ timeout: 5000 });
      await adHocOption.click({ force: true });

      await expect(diagram.get()).toHaveScreenshot("morph-subprocess-to-adhoc.png");
    });
  });

  test.describe("Nested elements inside Sub-process", () => {
    test("should add Start Event inside Sub-process", async ({ palette, nodes, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 300 } });

      const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
      await expect(subProcess).toBeAttached();

      const box = await subProcess.boundingBox();
      if (!box) throw new Error("Sub-Process not visible");

      const targetPosition = {
        x: box.x + 50,
        y: box.y + box.height + 50,
      };

      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition });

      await expect(diagram.get()).toHaveScreenshot("add-start-event-inside-subprocess.png");
    });

    test("should add Task inside Sub-process", async ({ palette, nodes, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 300 } });

      const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
      await expect(subProcess).toBeAttached();

      const box = await subProcess.boundingBox();
      if (!box) throw new Error("Sub-Process not visible");

      const targetPosition = {
        x: box.x + 50,
        y: box.y + 50,
      };

      await palette.dragNewNode({ type: NodeType.TASK, targetPosition });

      await expect(diagram.get()).toHaveScreenshot("add-task-inside-subprocess.png");
    });

    test("should create complete flow inside Sub-process: Start Event -> Task -> End Event", async ({
      palette,
      nodes,
      page,
      diagram,
    }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 300 } });

      const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
      await expect(subProcess).toBeAttached();

      const box = await subProcess.boundingBox();
      if (!box) throw new Error("Sub-Process not visible");

      const startEventPosition = {
        x: box.x + box.width / 8,
        y: box.y + 100,
      };
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: startEventPosition });

      const taskPosition = {
        x: box.x + box.width / 3,
        y: box.y + 70,
      };
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: taskPosition });

      const endEventPosition = {
        x: box.x + box.width - 100,
        y: box.y + 100,
      };
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: endEventPosition });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      const startBox = await startEvent.boundingBox();
      if (!startBox) throw new Error("Start Event bounding box not found");

      await page.mouse.move(startBox.x + startBox.width - 10, startBox.y + startBox.height / 2);

      const addSequenceFlowHandle1 = startEvent.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle1).toBeVisible({ timeout: 5000 });

      const taskBox = await task.boundingBox();
      if (!taskBox) throw new Error("Task bounding box not found");

      await addSequenceFlowHandle1.dragTo(diagram.get(), {
        targetPosition: { x: taskBox.x + taskBox.width / 2, y: taskBox.y + taskBox.height / 2 },
      });

      await page.mouse.move(taskBox.x + taskBox.width - 10, taskBox.y + taskBox.height / 2);

      const addSequenceFlowHandle2 = task.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle2).toBeVisible({ timeout: 5000 });

      const endBox = await endEvent.boundingBox();
      if (!endBox) throw new Error("End Event bounding box not found");

      await addSequenceFlowHandle2.dragTo(diagram.get(), {
        targetPosition: { x: endBox.x + endBox.width / 2, y: endBox.y + endBox.height / 2 },
      });

      await expect(diagram.get()).toHaveScreenshot("complete-flow-inside-subprocess.png");
    });

    test("should add Gateway inside Sub-process", async ({ palette, nodes, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 300 } });

      const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
      await expect(subProcess).toBeAttached();

      const box = await subProcess.boundingBox();
      if (!box) throw new Error("Sub-Process not visible");

      const targetPosition = {
        x: box.x + box.width / 4,
        y: box.y + 100,
      };

      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition });

      await expect(diagram.get()).toHaveScreenshot("add-gateway-inside-subprocess.png");
    });
  });

  test.describe("Sub-process operations", () => {
    test("should delete sub-process", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 300, y: 300 } });
      await nodes.delete({ name: DefaultNodeName.SUB_PROCESS });

      await expect(nodes.get({ name: DefaultNodeName.SUB_PROCESS })).not.toBeAttached();

      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });

    test("should move sub-process to new position", async ({ palette, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 300, y: 300 } });

      const subProcess = page.locator(".kie-bpmn-editor--sub-process-node").first();
      await expect(subProcess).toBeAttached();

      await subProcess.scrollIntoViewIfNeeded();

      const subProcessBox = await subProcess.boundingBox();
      if (!subProcessBox) {
        throw new Error("Sub-process bounding box not found");
      }

      await subProcess.dragTo(diagram.get(), {
        sourcePosition: { x: 20, y: subProcessBox.height / 2 },
        targetPosition: { x: 500, y: 400 },
        force: true,
      });

      const boxAfter = await subProcess.boundingBox();

      expect(boxAfter?.x).not.toBe(subProcessBox?.x);
      expect(boxAfter?.y).not.toBe(subProcessBox?.y);
    });

    test("should rename sub-process", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 300, y: 300 } });
      await nodes.rename({ current: DefaultNodeName.SUB_PROCESS, new: "Order Processing" });

      await expect(nodes.get({ name: "Order Processing" })).toBeAttached();

      const subProcess = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(subProcess["@_name"]).toBe("Order Processing");
    });
  });
});
