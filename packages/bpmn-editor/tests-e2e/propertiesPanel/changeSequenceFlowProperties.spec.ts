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

test.describe("Change Properties - Sequence Flow", () => {
  test.beforeEach(async ({ palette, nodes, edges, sequenceFlowPropertiesPanel, diagram, page }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 }, thenRenameTo: "Task A" });
    await diagram.resetFocus();
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 400, y: 400 }, thenRenameTo: "Task B" });
    await diagram.resetFocus();

    const taskA = nodes.get({ name: "Task A" });
    const taskB = nodes.get({ name: "Task B" });

    await taskA.scrollIntoViewIfNeeded();
    await taskB.scrollIntoViewIfNeeded();

    const box = await taskA.boundingBox();
    if (!box) throw new Error("Task A bounding box not found");

    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
    await page.waitForTimeout(500);

    const addSequenceFlowHandle = taskA.getByTitle("Add Sequence Flow");
    await addSequenceFlowHandle.waitFor({ state: "visible", timeout: 5000 });

    const taskBBox = await taskB.boundingBox();
    if (!taskBBox) throw new Error("Task B bounding box not found");

    await addSequenceFlowHandle.dragTo(diagram.get(), {
      targetPosition: { x: taskBBox.x + taskBBox.width / 2, y: taskBBox.y + taskBBox.height / 2 },
    });

    await page.waitForTimeout(1000);

    const edge = await edges.get({ from: "Task A", to: "Task B" });
    await edge.scrollIntoViewIfNeeded();
    await edge.click({ force: true });

    await sequenceFlowPropertiesPanel.open();
  });

  test("should change the Sequence Flow name", async ({ sequenceFlowPropertiesPanel, diagram }) => {
    await sequenceFlowPropertiesPanel.setName({ newName: "Normal Flow" });

    expect(await sequenceFlowPropertiesPanel.getName()).toBe("Normal Flow");
    await expect(diagram.get()).toHaveScreenshot("sequence-flow-name-changed.png");
  });

  test("should change the Sequence Flow documentation", async ({ sequenceFlowPropertiesPanel }) => {
    await sequenceFlowPropertiesPanel.setDocumentation({
      newDocumentation: "This flow connects Task A to Task B",
    });

    expect(await sequenceFlowPropertiesPanel.getDocumentation()).toBe("This flow connects Task A to Task B");
  });

  test("should configure conditional expression", async ({ sequenceFlowPropertiesPanel, diagram }) => {
    await sequenceFlowPropertiesPanel.setConditionExpression({ expression: "${amount > 1000}" });

    expect(await sequenceFlowPropertiesPanel.getConditionExpression()).toBe("${amount > 1000}");
    await expect(diagram.get()).toHaveScreenshot("sequence-flow-conditional-expression.png");
  });

  test("should set priority", async ({ sequenceFlowPropertiesPanel, diagram }) => {
    await sequenceFlowPropertiesPanel.setPriority({ priority: "1" });

    expect(await sequenceFlowPropertiesPanel.getPriority()).toBe("1");
    await expect(diagram.get()).toHaveScreenshot("sequence-flow-priority.png");
  });
});

test.describe("Change Properties - Conditional Sequence Flow from Gateway", () => {
  test.beforeEach(async ({ palette, nodes, edges, sequenceFlowPropertiesPanel, diagram, page }) => {
    await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 100, y: 250 } });

    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 50 }, thenRenameTo: "High Amount" });

    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 400 }, thenRenameTo: "Low Amount" });

    const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
    await expect(gateway).toBeVisible({ timeout: 5000 });
    const gatewayId = (await gateway.getAttribute("data-nodehref")) ?? "";

    const highAmountTask = nodes.get({ name: "High Amount" });
    await expect(highAmountTask).toBeAttached();

    const lowAmountTask = nodes.get({ name: "Low Amount" });
    await expect(lowAmountTask).toBeAttached();

    let box = await gateway.boundingBox();
    if (!box) throw new Error("Gateway bounding box not found");
    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
    await page.waitForTimeout(500);

    const addTaskHandle1 = gateway.getByTitle("Add Sequence Flow");
    await expect(addTaskHandle1).toBeVisible({ timeout: 5000 });

    let taskBox = await highAmountTask.boundingBox();
    if (!taskBox) throw new Error("High Amount task bounding box not found");

    await addTaskHandle1.dragTo(diagram.get(), {
      targetPosition: { x: taskBox.x + taskBox.width / 2, y: taskBox.y + taskBox.height / 2 },
    });
    await page.waitForTimeout(1000);

    box = await gateway.boundingBox();
    if (!box) throw new Error("Gateway bounding box not found");
    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
    await page.waitForTimeout(500);

    const addTaskHandle2 = gateway.getByTitle("Add Sequence Flow");
    await expect(addTaskHandle2).toBeVisible({ timeout: 5000 });

    taskBox = await lowAmountTask.boundingBox();
    if (!taskBox) throw new Error("Low Amount task bounding box not found");

    await addTaskHandle2.dragTo(diagram.get(), {
      targetPosition: { x: taskBox.x + taskBox.width / 2, y: taskBox.y + taskBox.height / 2 },
    });
    await page.waitForTimeout(1000);

    const edge = await edges.get({ from: gatewayId, to: "High Amount" });
    await edge.scrollIntoViewIfNeeded();
    await edge.click({ force: true });
    await sequenceFlowPropertiesPanel.open();
  });

  test("should configure conditional flow from gateway", async ({
    edges,
    sequenceFlowPropertiesPanel,
    diagram,
    nodes,
    page,
  }) => {
    const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
    const gatewayId = (await gateway.getAttribute("data-nodehref")) ?? "";

    await sequenceFlowPropertiesPanel.setName({ newName: "High Amount Path" });
    await sequenceFlowPropertiesPanel.setConditionExpression({ expression: "${amount > 5000}" });

    const edge = await edges.get({ from: gatewayId, to: "High Amount" });
    await edge.click();

    await expect(diagram.get()).toHaveScreenshot("gateway-conditional-flow-high.png");
  });

  test("should configure multiple conditional flows", async ({
    edges,
    sequenceFlowPropertiesPanel,
    diagram,
    nodes,
    page,
  }) => {
    const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
    const gatewayId = (await gateway.getAttribute("data-nodehref")) ?? "";

    await sequenceFlowPropertiesPanel.setName({ newName: "High Amount" });
    await sequenceFlowPropertiesPanel.setConditionExpression({ expression: "${amount > 5000}" });

    const edge2 = await edges.get({ from: gatewayId, to: "Low Amount" });
    await edge2.click();
    await sequenceFlowPropertiesPanel.setName({ newName: "Low Amount" });
    await sequenceFlowPropertiesPanel.setConditionExpression({ expression: "${amount <= 5000}" });

    await expect(diagram.get()).toHaveScreenshot("gateway-multiple-conditional-flows.png");
  });
});

test.describe("Change Properties - Default Sequence Flow", () => {
  test.beforeEach(async ({ palette, nodes, edges, sequenceFlowPropertiesPanel, diagram, page }) => {
    await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 100, y: 250 } });

    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 50 }, thenRenameTo: "Condition A" });

    await palette.dragNewNode({
      type: NodeType.TASK,
      targetPosition: { x: 300, y: 400 },
      thenRenameTo: "Default Path",
    });

    const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
    await expect(gateway).toBeVisible({ timeout: 5000 });
    const gatewayId = (await gateway.getAttribute("data-nodehref")) ?? "";

    const conditionATask = nodes.get({ name: "Condition A" });
    await expect(conditionATask).toBeAttached();

    const defaultPathTask = nodes.get({ name: "Default Path" });
    await expect(defaultPathTask).toBeAttached();

    let box = await gateway.boundingBox();
    if (!box) throw new Error("Gateway bounding box not found");
    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
    await page.waitForTimeout(500);

    const addTaskHandle1 = gateway.getByTitle("Add Sequence Flow");
    await expect(addTaskHandle1).toBeVisible({ timeout: 5000 });

    let taskBox = await conditionATask.boundingBox();
    if (!taskBox) throw new Error("Condition A task bounding box not found");

    await addTaskHandle1.dragTo(diagram.get(), {
      targetPosition: { x: taskBox.x + taskBox.width / 2, y: taskBox.y + taskBox.height / 2 },
    });
    await page.waitForTimeout(1000);

    box = await gateway.boundingBox();
    if (!box) throw new Error("Gateway bounding box not found");
    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
    await page.waitForTimeout(500);

    const addTaskHandle2 = gateway.getByTitle("Add Sequence Flow");
    await expect(addTaskHandle2).toBeVisible({ timeout: 5000 });

    taskBox = await defaultPathTask.boundingBox();
    if (!taskBox) throw new Error("Default Path task bounding box not found");

    await addTaskHandle2.dragTo(diagram.get(), {
      targetPosition: { x: taskBox.x + taskBox.width / 2, y: taskBox.y + taskBox.height / 2 },
    });
    await page.waitForTimeout(1000);
  });

  test("should configure default flow", async ({ edges, sequenceFlowPropertiesPanel, diagram, nodes, page }) => {
    const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
    const gatewayId = (await gateway.getAttribute("data-nodehref")) ?? "";

    const edge1 = await edges.get({ from: gatewayId, to: "Condition A" });
    await edge1.click();
    await sequenceFlowPropertiesPanel.setConditionExpression({ expression: "${approved == true}" });

    const edge2 = await edges.get({ from: gatewayId, to: "Default Path" });
    await edge2.click();
    await sequenceFlowPropertiesPanel.setName({ newName: "Default" });

    await expect(diagram.get()).toHaveScreenshot("gateway-default-flow.png");
  });
});
