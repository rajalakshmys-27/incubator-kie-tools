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

import { test, expect } from "../__fixtures__/base";
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor, page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await editor.open();
});

test.describe("Change Properties - Task Node", () => {
  test.beforeEach(async ({ palette, page, nodes }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

    await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();
  });

  test("should change the Task name", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setName({ newName: "Process Order" });

    expect(await taskPropertiesPanel.getName()).toBe("Process Order");
    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("task-name-changed.png");
  });

  test("should change the Task documentation", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setDocumentation({
      newDocumentation: "This task processes customer orders",
    });

    expect(await taskPropertiesPanel.getDocumentation()).toBe("This task processes customer orders");
  });
});

test.describe("Change Properties - User Task", () => {
  test.beforeEach(async ({ palette, nodes, taskPropertiesPanel, page }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

    const task = nodes.get({ name: DefaultNodeName.TASK });
    await expect(task).toBeAttached();

    const box = await task.boundingBox();
    if (!box) throw new Error("Task not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const morphingToggle = task.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
    const userTaskOption = morphingPanel.getByTitle("User task");
    await expect(userTaskOption).toBeVisible({ timeout: 5000 });
    await userTaskOption.click({ force: true });
  });

  test("should configure User Task actors", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setActors({ actors: "john, mary, admin" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("user-task-actors-configured.png");
  });

  test("should configure User Task groups", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setGroups({ groups: "managers, supervisors" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("user-task-groups-configured.png");
  });

  test("should configure User Task name", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setTaskName({ taskName: "ApproveOrder" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("user-task-name-configured.png");
  });

  test("should configure User Task with actors and groups", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setActors({ actors: "john, mary" });
    await taskPropertiesPanel.setGroups({ groups: "managers" });
    await taskPropertiesPanel.setTaskName({ taskName: "ReviewDocument" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("user-task-full-configuration.png");
  });

  test("should set async flag on User Task", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setAsync({ isAsync: true });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("user-task-async-enabled.png");
  });
});

test.describe("Change Properties - Service Task", () => {
  test.beforeEach(async ({ palette, nodes, page }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

    const task = nodes.get({ name: DefaultNodeName.TASK });
    await expect(task).toBeAttached();

    const box = await task.boundingBox();
    if (!box) throw new Error("Task not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const morphingToggle = task.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
    const serviceTaskOption = morphingPanel.getByTitle("Service task");
    await expect(serviceTaskOption).toBeVisible({ timeout: 5000 });
    await serviceTaskOption.click({ force: true });
  });

  test("should configure Service Task implementation", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setImplementation({ implementation: "Java" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("service-task-implementation.png");
  });

  test("should configure Service Task interface and operation", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setInterface({ interfaceName: "OrderService" });
    await taskPropertiesPanel.setOperation({ operationName: "processOrder" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("service-task-interface-operation.png");
  });
});

test.describe("Change Properties - Script Task", () => {
  test.beforeEach(async ({ palette, nodes, taskPropertiesPanel, page }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

    const task = nodes.get({ name: DefaultNodeName.TASK });
    await expect(task).toBeAttached();

    const box = await task.boundingBox();
    if (!box) throw new Error("Task not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const morphingToggle = task.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
    const scriptTaskOption = morphingPanel.getByTitle("Script task");
    await expect(scriptTaskOption).toBeVisible({ timeout: 5000 });
    await scriptTaskOption.click({ force: true });
  });

  test("should configure Script Task script content", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setScript({
      script: 'System.out.println("Processing order: " + orderId);',
    });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("script-task-with-script.png");
  });
});

test.describe("Change Properties - Business Rule Task", () => {
  test.beforeEach(async ({ palette, nodes, taskPropertiesPanel, page }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

    const task = nodes.get({ name: DefaultNodeName.TASK });
    await expect(task).toBeAttached();

    const box = await task.boundingBox();
    if (!box) throw new Error("Task not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const morphingToggle = task.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
    const businessRuleTaskOption = morphingPanel.getByTitle("Business rule task");
    await expect(businessRuleTaskOption).toBeVisible({ timeout: 5000 });
    await businessRuleTaskOption.click({ force: true });
  });

  test("should configure Business Rule Task with DRL rule flow group", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setRuleFlowGroup({ ruleFlowGroup: "order-validation-rules" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("business-rule-task-drl-ruleflow.png");
  });

  test("should configure Business Rule Task with DMN model", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setDmnModel({
      relativePath: "models/decision.dmn",
      namespace: "https://example.com/dmn",
      modelName: "OrderDecision",
    });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("business-rule-task-dmn-model.png");
  });
});

test.describe("Change Properties - Task Multi-Instance", () => {
  test.beforeEach(async ({ palette, nodes, page }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

    const task = nodes.get({ name: DefaultNodeName.TASK });
    await expect(task).toBeAttached();

    const box = await task.boundingBox();
    if (!box) throw new Error("Task not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const morphingToggle = task.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
    const callActivityOption = morphingPanel.getByTitle("Call activity");
    await expect(callActivityOption).toBeVisible({ timeout: 5000 });
    await callActivityOption.click({ force: true });
  });

  test("should configure parallel multi-instance", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setMultiInstance({ type: "parallel" });
    await taskPropertiesPanel.setCollectionExpression({ expression: "${orderItems}" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("task-multi-instance-parallel.png");
  });

  test("should configure sequential multi-instance", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setMultiInstance({ type: "sequential" });
    await taskPropertiesPanel.setCollectionExpression({ expression: "${approvers}" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("task-multi-instance-sequential.png");
  });

  test("should configure multi-instance with completion condition", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.setMultiInstance({ type: "parallel" });
    await taskPropertiesPanel.setCollectionExpression({ expression: "${tasks}" });
    await taskPropertiesPanel.setCompletionCondition({ condition: "${nrOfCompletedInstances >= 3}" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot(
      "task-multi-instance-completion-condition.png"
    );
  });
});

test.describe("Change Properties - Task Data I/O", () => {
  test.beforeEach(async ({ palette, nodes, page }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });

    const task = nodes.get({ name: DefaultNodeName.TASK });
    await expect(task).toBeAttached();

    const box = await task.boundingBox();
    if (!box) throw new Error("Task not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const morphingToggle = task.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
    const userTaskOption = morphingPanel.getByTitle("User task");
    await expect(userTaskOption).toBeVisible({ timeout: 5000 });
    await userTaskOption.click({ force: true });
  });

  test("should add data input to Task", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.addDataInput({ name: "orderId" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("task-data-input-added.png");
  });

  test("should add data output to Task", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.addDataOutput({ name: "result" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("task-data-output-added.png");
  });

  test("should add multiple data inputs and outputs", async ({ taskPropertiesPanel, page }) => {
    await taskPropertiesPanel.openDataMappingModal();

    await taskPropertiesPanel.addDataInputInModal({ name: "orderId" });
    await taskPropertiesPanel.addDataInputInModal({ name: "customerId" });

    await taskPropertiesPanel.addDataOutputInModal({ name: "approved" });
    await taskPropertiesPanel.addDataOutputInModal({ name: "message" });

    await taskPropertiesPanel.closeDataMappingModal();

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("task-multiple-data-io.png");
  });
});
