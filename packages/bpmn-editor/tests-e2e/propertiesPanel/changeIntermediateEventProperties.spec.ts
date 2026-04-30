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
  await page.setViewportSize({ width: 1920, height: 1080 });
  await editor.open();
});

test.describe("Change Properties - Intermediate Catch Event", () => {
  test.beforeEach(async ({ palette, page }) => {
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 100, y: 100 } });

    const event = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
    await expect(event).toBeVisible({ timeout: 5000 });

    await event.click();
  });

  test("should change the Intermediate Catch Event name", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setName({ newName: "Wait for Approval" });

    expect(await intermediateEventPropertiesPanel.getName()).toBe("Wait for Approval");
    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-catch-event-name-changed.png");
  });

  test("should change the Intermediate Catch Event documentation", async ({
    intermediateEventPropertiesPanel,
    page,
  }) => {
    await intermediateEventPropertiesPanel.setDocumentation({
      newDocumentation: "This event waits for an external approval",
    });

    expect(await intermediateEventPropertiesPanel.getDocumentation()).toBe("This event waits for an external approval");
  });

  test("should configure Timer definition with duration", async ({ intermediateEventPropertiesPanel, page, nodes }) => {
    const catchEvent = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
    await expect(catchEvent).toBeVisible({ timeout: 5000 });

    await nodes.morphNode({ nodeLocator: catchEvent, targetMorphType: "Timer" });
    await intermediateEventPropertiesPanel.setTimerDefinition({ type: "duration", value: "PT1H" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot(
      "intermediate-catch-event-timer-duration.png"
    );
  });

  test("should configure Message definition", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setMessageDefinition({ messageName: "ApprovalMessage" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-catch-event-message.png");
  });

  test("should configure Conditional expression", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setConditionalExpression({ expression: "${approved == true}" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-catch-event-conditional.png");
  });

  test("should configure Link definition", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setLinkDefinition({ linkName: "ProcessLink" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-catch-event-link.png");
  });

  test("should configure Error definition", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setErrorDefinition({
      errorName: "ValidationError",
    });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-catch-event-error.png");
  });

  test("should configure Escalation definition", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setEscalationDefinition({
      escalationName: "ProcessEscalation",
    });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-catch-event-escalation.png");
  });
});

test.describe("Change Properties - Intermediate Throw Event", () => {
  test.beforeEach(async ({ palette, page }) => {
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_THROW_EVENT, targetPosition: { x: 100, y: 100 } });

    const event = page.locator(".kie-bpmn-editor--intermediate-throw-event-node").first();
    await expect(event).toBeVisible({ timeout: 5000 });

    await event.click();
  });

  test("should change the Intermediate Throw Event name", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setName({ newName: "Send Notification" });

    expect(await intermediateEventPropertiesPanel.getName()).toBe("Send Notification");
    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-throw-event-name-changed.png");
  });

  test("should change the Intermediate Throw Event documentation", async ({
    intermediateEventPropertiesPanel,
    page,
  }) => {
    await intermediateEventPropertiesPanel.setDocumentation({
      newDocumentation: "This event sends a notification to external systems",
    });

    expect(await intermediateEventPropertiesPanel.getDocumentation()).toBe(
      "This event sends a notification to external systems"
    );
  });

  test("should configure Message definition", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setMessageDefinition({ messageName: "NotificationMessage" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-throw-event-message.png");
  });

  test("should configure Signal definition", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setSignalDefinition({
      signalName: "BroadcastSignal",
      scope: "project",
    });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-throw-event-signal.png");
  });

  test("should configure Link definition", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setLinkDefinition({ linkName: "TargetLink" });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-throw-event-link.png");
  });

  test("should configure Escalation definition", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setEscalationDefinition({
      escalationName: "ThrowEscalation",
    });

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-throw-event-escalation.png");
  });

  test("should configure Compensation definition", async ({ intermediateEventPropertiesPanel, page }) => {
    await intermediateEventPropertiesPanel.setCompensationDefinition({});

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("intermediate-throw-event-compensation.png");
  });
});
