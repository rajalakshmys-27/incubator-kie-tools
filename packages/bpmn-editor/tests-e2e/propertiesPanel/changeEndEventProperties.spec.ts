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
import { NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor, page }) => {
  await editor.open();
  await page.setViewportSize({ width: 1920, height: 1080 });
});

test.describe("Change Properties - End Event", () => {
  test.beforeEach(async ({ palette, page }) => {
    await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 100, y: 100 } });

    const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
    await expect(endEvent).toBeVisible({ timeout: 5000 });

    await endEvent.click();
    await page.waitForTimeout(500);
  });

  test("should change the End Event name", async ({ endEventPropertiesPanel, page }) => {
    await endEventPropertiesPanel.setName({ newName: "Process Completed" });

    await page.waitForTimeout(300);

    expect(await endEventPropertiesPanel.getName()).toBe("Process Completed");
    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("end-event-name-changed.png");
  });

  test("should change the End Event documentation", async ({ endEventPropertiesPanel, page }) => {
    await endEventPropertiesPanel.setDocumentation({
      newDocumentation: "This event ends the process successfully",
    });

    await page.waitForTimeout(300);

    expect(await endEventPropertiesPanel.getDocumentation()).toBe("This event ends the process successfully");
  });

  test("should configure Terminate event definition", async ({ endEventPropertiesPanel, page }) => {
    const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();

    await endEventPropertiesPanel.setTerminateDefinition({
      endEventLocator: endEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("end-event-terminate.png");
  });

  test("should configure Message event definition", async ({ endEventPropertiesPanel, page }) => {
    const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();

    await endEventPropertiesPanel.setMessageDefinition({
      messageName: "CompletionMessage",
      endEventLocator: endEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("end-event-message.png");
  });

  test("should configure Signal event definition", async ({ endEventPropertiesPanel, page }) => {
    const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();

    await endEventPropertiesPanel.setSignalDefinition({
      signalName: "CompletionSignal",
      endEventLocator: endEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("end-event-signal.png");
  });

  test("should configure Error event definition", async ({ endEventPropertiesPanel, page }) => {
    const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();

    await endEventPropertiesPanel.setErrorDefinition({
      errorName: "ProcessError",
      errorCode: "ERR500",
      endEventLocator: endEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("end-event-error.png");
  });

  test("should configure Escalation event definition", async ({ endEventPropertiesPanel, page }) => {
    const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();

    await endEventPropertiesPanel.setEscalationDefinition({
      escalationName: "ProcessEscalation",
      escalationCode: "ESC100",
      endEventLocator: endEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("end-event-escalation.png");
  });

  test("should configure Compensation event definition", async ({ endEventPropertiesPanel, page }) => {
    const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();

    await endEventPropertiesPanel.setCompensationDefinition({
      endEventLocator: endEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("end-event-compensation.png");
  });
});
