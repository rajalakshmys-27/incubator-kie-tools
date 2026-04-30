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

test.describe("Change Properties - Sub-Process", () => {
  test.beforeEach(async ({ palette, nodes, page }) => {
    await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 200, y: 200 } });

    await expect(nodes.get({ name: DefaultNodeName.SUB_PROCESS })).toBeAttached();
  });

  test("should change the Sub-Process name", async ({ subProcessPropertiesPanel, page }) => {
    await subProcessPropertiesPanel.setName({ newName: "Order Processing" });

    expect(await subProcessPropertiesPanel.getName()).toBe("Order Processing");
    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("subprocess-name-changed.png");
  });

  test("should change the Sub-Process documentation", async ({ subProcessPropertiesPanel, page }) => {
    await subProcessPropertiesPanel.setDocumentation({
      newDocumentation: "This sub-process handles order processing logic",
    });

    expect(await subProcessPropertiesPanel.getDocumentation()).toBe("This sub-process handles order processing logic");
  });
});

test.describe("Change Properties - Sub-Process Multi-Instance", () => {
  test.beforeEach(async ({ palette, nodes, subProcessPropertiesPanel, page }) => {
    await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 200, y: 200 } });

    const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
    await expect(subProcess).toBeAttached();

    const box = await subProcess.boundingBox();
    if (!box) throw new Error("Sub-Process not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const morphingToggle = subProcess.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
    const multiInstanceOption = morphingPanel.getByTitle("Multi-instance");
    await expect(multiInstanceOption).toBeVisible({ timeout: 5000 });
    await multiInstanceOption.click({ force: true });
  });

  test("should configure Sub-Process multi-instance parallel", async ({ subProcessPropertiesPanel, page }) => {
    await subProcessPropertiesPanel.setMultiInstance({ type: "parallel" });
    await subProcessPropertiesPanel.setCollectionExpression({ expression: "${orderItems}" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("subprocess-multi-instance-parallel.png");
  });

  test("should configure Sub-Process multi-instance sequential", async ({ subProcessPropertiesPanel, page }) => {
    await subProcessPropertiesPanel.setMultiInstance({ type: "sequential" });
    await subProcessPropertiesPanel.setCollectionExpression({ expression: "${tasks}" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("subprocess-multi-instance-sequential.png");
  });
});

test.describe("Change Properties - Ad-Hoc Sub-Process", () => {
  test.beforeEach(async ({ palette, nodes, page }) => {
    await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 200, y: 200 } });

    const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
    await expect(subProcess).toBeAttached();

    const box = await subProcess.boundingBox();
    if (!box) throw new Error("Sub-Process not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const morphingToggle = subProcess.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
    const adHocOption = morphingPanel.getByTitle("Ad-hoc");
    await expect(adHocOption).toBeVisible({ timeout: 5000 });
    await adHocOption.click({ force: true });
  });

  test("should configure Ad-Hoc Sub-Process", async ({ subProcessPropertiesPanel, page }) => {
    await subProcessPropertiesPanel.setAdHocOrdering({ ordering: "Parallel" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("adhoc-subprocess-parallel.png");
  });

  test("should configure Ad-Hoc Sub-Process with sequential ordering", async ({ subProcessPropertiesPanel, page }) => {
    await subProcessPropertiesPanel.setAdHocOrdering({ ordering: "Sequential" });
    await subProcessPropertiesPanel.setAdHocCompletionCondition({ condition: "${allTasksCompleted}" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("adhoc-subprocess-sequential.png");
  });
});
