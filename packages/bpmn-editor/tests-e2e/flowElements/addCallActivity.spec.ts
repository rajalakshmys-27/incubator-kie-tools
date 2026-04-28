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
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - Call Activity", () => {
  test.describe("Add from palette", () => {
    test("should add Call Activity node from palette", async ({ palette, nodes, diagram }) => {
      await palette.dragNewNode({ type: NodeType.CALL_ACTIVITY, targetPosition: { x: 100, y: 100 } });

      await expect(nodes.get({ name: DefaultNodeName.CALL_ACTIVITY })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("add-call-activity-node-from-palette.png");
    });

    test("should add two Call Activity nodes from palette in a row", async ({ palette, nodes, diagram }) => {
      test.info().annotations.push({
        type: TestAnnotations.REGRESSION,
      });

      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 100, y: 100 },
        thenRenameTo: "First Call Activity",
      });

      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Second Call Activity",
      });

      await diagram.resetFocus();

      await expect(nodes.get({ name: "First Call Activity" })).toBeAttached();
      await expect(nodes.get({ name: "Second Call Activity" })).toBeAttached();

      await expect(diagram.get()).toHaveScreenshot("add-2-call-activity-nodes-from-palette.png");
    });
  });

  test.describe("Add connected Call Activity node", () => {
    test("should add connected Task node from Call Activity", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 100, y: 100 },
      });

      // Get the Call Activity node
      const callActivity = page.locator('[data-nodelabel="New Call Activity"]').first();
      await expect(callActivity).toBeAttached();

      // Get Call Activity bounding box to hover over it
      const box = await callActivity.boundingBox();
      if (!box) throw new Error("Call Activity bounding box not found");

      // Hover over the right side of the Call Activity to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find and click the "Add Task" handle
      const addTaskHandle = callActivity.getByTitle("Add Task");
      await expect(addTaskHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the Task
      await addTaskHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the Task to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-call-activity.png");
    });

    test("should add connected Gateway node from Call Activity", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 100, y: 100 },
      });

      // Get the Call Activity node
      const callActivity = page.locator('[data-nodelabel="New Call Activity"]').first();
      await expect(callActivity).toBeAttached();

      // Get Call Activity bounding box to hover over it
      const box = await callActivity.boundingBox();
      if (!box) throw new Error("Call Activity bounding box not found");

      // Hover over the right side of the Call Activity to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find and click the "Add Gateway" handle
      const addGatewayHandle = callActivity.getByTitle("Add Gateway");
      await expect(addGatewayHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the Gateway
      await addGatewayHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the Gateway to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-gateway-node-from-call-activity.png");
    });

    test("should create sequence flow from Call Activity to End Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 100, y: 100 },
      });
      await diagram.resetFocus();
      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      // Get the Call Activity and End Event nodes
      const callActivity = page.locator('[data-nodelabel="New Call Activity"]').first();
      await expect(callActivity).toBeAttached();

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      // Get Call Activity bounding box to hover over it
      const box = await callActivity.boundingBox();
      if (!box) throw new Error("Call Activity bounding box not found");

      // Hover over the right side of the Call Activity to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find the "Add Sequence Flow" handle
      const addSequenceFlowHandle = callActivity.getByTitle("Add Sequence Flow");
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
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-call-activity-to-end-event.png");
    });

    test("should add connected Call Activity from Start Event", async ({ diagram, palette, page }) => {
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

      // Find and click the "Add Task" handle (Call Activity is created from Task)
      const addTaskHandle = startEvent.getByTitle("Add Task");
      await expect(addTaskHandle).toBeVisible({ timeout: 5000 });

      // Drag from the handle to create the Task
      await addTaskHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      // Wait for the Task to be created
      await page.waitForTimeout(1000);

      // Now morph the Task to Call Activity
      const task = page.locator('[data-nodelabel="New Task"]').first();
      await expect(task).toBeAttached();

      const taskBox = await task.boundingBox();
      if (!taskBox) throw new Error("Task not visible");

      // Hover to reveal morphing toggle
      await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2);
      await page.waitForTimeout(300);

      // Click the morphing toggle
      const morphingToggle = task.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
      await expect(morphingToggle).toBeVisible({ timeout: 5000 });
      await morphingToggle.click({ force: true });

      // Click the "Call activity" morphing option from the morphing panel
      const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
      const callActivityOption = morphingPanel.getByTitle("Call activity");
      await expect(callActivityOption).toBeVisible({ timeout: 5000 });
      await callActivityOption.click({ force: true });

      // Wait for morphing to complete
      await page.waitForTimeout(1000);

      // Verify via screenshot
      await expect(diagram.get()).toHaveScreenshot("add-call-activity-from-start-event.png");
    });

    test("should create sequence flow from Call Activity to another Call Activity", async ({
      diagram,
      palette,
      page,
    }) => {
      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 100, y: 100 },
        thenRenameTo: "First Call Activity",
      });

      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 350, y: 100 },
        thenRenameTo: "Second Call Activity",
      });

      // Get the Call Activity nodes
      const firstCallActivity = page.locator('[data-nodelabel="First Call Activity"]').first();
      await expect(firstCallActivity).toBeAttached();

      const secondCallActivity = page.locator('[data-nodelabel="Second Call Activity"]').first();
      await expect(secondCallActivity).toBeAttached();

      // Get first Call Activity bounding box to hover over it
      const box = await firstCallActivity.boundingBox();
      if (!box) throw new Error("First Call Activity bounding box not found");

      // Hover over the right side of the first Call Activity to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find the "Add Sequence Flow" handle
      const addSequenceFlowHandle = firstCallActivity.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      // Get second Call Activity position for drag target
      const secondCallActivityBox = await secondCallActivity.boundingBox();
      if (!secondCallActivityBox) throw new Error("Second Call Activity bounding box not found");

      // Drag from the handle to the second Call Activity center using diagram as target
      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: {
          x: secondCallActivityBox.x + secondCallActivityBox.width / 2,
          y: secondCallActivityBox.y + secondCallActivityBox.height / 2,
        },
      });

      // Wait for edge to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot since edge creation is visual
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-call-activity-to-call-activity.png");
    });

    test("should create sequence flow from Gateway to Call Activity", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 350, y: 100 },
      });

      // Get the Gateway and Call Activity nodes
      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      const callActivity = page.locator('[data-nodelabel="New Call Activity"]').first();
      await expect(callActivity).toBeAttached();

      // Get Gateway bounding box to hover over it
      const box = await gateway.boundingBox();
      if (!box) throw new Error("Gateway bounding box not found");

      // Hover over the right side of the Gateway to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find the "Add Sequence Flow" handle
      const addSequenceFlowHandle = gateway.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      // Get Call Activity position for drag target
      const callActivityBox = await callActivity.boundingBox();
      if (!callActivityBox) throw new Error("Call Activity bounding box not found");

      // Drag from the handle to the Call Activity center using diagram as target
      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: {
          x: callActivityBox.x + callActivityBox.width / 2,
          y: callActivityBox.y + callActivityBox.height / 2,
        },
      });

      // Wait for edge to be created
      await page.waitForTimeout(1000);

      // Verify via screenshot since edge creation is visual
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-gateway-to-call-activity.png");
    });

    test("should create sequence flow from Call Activity to Gateway", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 350, y: 100 },
      });

      // Get the Call Activity and Gateway nodes
      const callActivity = page.locator('[data-nodelabel="New Call Activity"]').first();
      await expect(callActivity).toBeAttached();

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      // Get Call Activity bounding box to hover over it
      const box = await callActivity.boundingBox();
      if (!box) throw new Error("Call Activity bounding box not found");

      // Hover over the right side of the Call Activity to reveal connection handles
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500); // Wait for handles to appear

      // Find the "Add Sequence Flow" handle
      const addSequenceFlowHandle = callActivity.getByTitle("Add Sequence Flow");
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
      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-call-activity-to-gateway.png");
    });
  });

  test.describe("Call Activity in process flow", () => {
    test.beforeEach(async ({ editor, page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await editor.open();
    });
    test("should create a complete process with Call Activity", async ({
      jsonModel,
      palette,
      nodes,
      diagram,
      page,
    }) => {
      // Create Start Event
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 100, y: 150 },
      });

      // Add Task 1 - Prepare Data
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 250, y: 150 },
        thenRenameTo: "Prepare Data",
      });

      // Add Call Activity
      await palette.dragNewNode({
        type: NodeType.CALL_ACTIVITY,
        targetPosition: { x: 500, y: 150 },
        thenRenameTo: "Execute Subprocess",
      });

      // Add Task 2 - Process Results
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 750, y: 150 },
        thenRenameTo: "Process Results",
      });

      // Add End Event
      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 1000, y: 150 },
      });

      // Create connections manually
      // Connect Start Event to Prepare Data
      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });
      let box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event not visible");
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);
      const handle1 = startEvent.getByTitle("Add Sequence Flow");
      await expect(handle1).toBeVisible({ timeout: 5000 });
      const prepareData = nodes.get({ name: "Prepare Data" });
      let targetBox = await prepareData.boundingBox();
      if (!targetBox) throw new Error("Prepare Data not visible");
      await handle1.dragTo(diagram.get(), {
        targetPosition: { x: targetBox.x + targetBox.width / 2, y: targetBox.y + targetBox.height / 2 },
      });
      await page.waitForTimeout(1000);

      // Connect Prepare Data to Call Activity
      box = await prepareData.boundingBox();
      if (!box) throw new Error("Prepare Data not visible");
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);
      const handle2 = prepareData.getByTitle("Add Sequence Flow");
      await expect(handle2).toBeVisible({ timeout: 5000 });
      const callActivity = nodes.get({ name: "Execute Subprocess" });
      targetBox = await callActivity.boundingBox();
      if (!targetBox) throw new Error("Call Activity not visible");
      await handle2.dragTo(diagram.get(), {
        targetPosition: { x: targetBox.x + targetBox.width / 2, y: targetBox.y + targetBox.height / 2 },
      });
      await page.waitForTimeout(1000);

      // Connect Call Activity to Process Results
      box = await callActivity.boundingBox();
      if (!box) throw new Error("Call Activity not visible");
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);
      const handle3 = callActivity.getByTitle("Add Sequence Flow");
      await expect(handle3).toBeVisible({ timeout: 5000 });
      const processResults = nodes.get({ name: "Process Results" });
      targetBox = await processResults.boundingBox();
      if (!targetBox) throw new Error("Process Results not visible");
      await handle3.dragTo(diagram.get(), {
        targetPosition: { x: targetBox.x + targetBox.width / 2, y: targetBox.y + targetBox.height / 2 },
      });
      await page.waitForTimeout(1000);

      // Connect Process Results to End Event
      box = await processResults.boundingBox();
      if (!box) throw new Error("Process Results not visible");
      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);
      const handle4 = processResults.getByTitle("Add Sequence Flow");
      await expect(handle4).toBeVisible({ timeout: 5000 });
      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      targetBox = await endEvent.boundingBox();
      if (!targetBox) throw new Error("End Event not visible");
      await handle4.dragTo(diagram.get(), {
        targetPosition: { x: targetBox.x + targetBox.width / 2, y: targetBox.y + targetBox.height / 2 },
      });
      await page.waitForTimeout(1000);

      await diagram.resetFocus();

      // Verify Call Activity exists in JSON model
      const flowElements = await jsonModel.getProcess();
      const callActivityElement = flowElements.flowElement?.find((el: any) => el["@_name"] === "Execute Subprocess");
      expect(callActivityElement).toMatchObject({
        __$$element: "callActivity",
        "@_name": "Execute Subprocess",
      });

      await expect(diagram.get()).toHaveScreenshot("complete-process-with-call-activity.png");
    });
  });

  test.describe("Call Activity operations", () => {
    test("should delete call activity", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.CALL_ACTIVITY, targetPosition: { x: 300, y: 300 } });

      await nodes.delete({ name: DefaultNodeName.CALL_ACTIVITY });

      await expect(nodes.get({ name: DefaultNodeName.CALL_ACTIVITY })).not.toBeAttached();

      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });
  });
});
