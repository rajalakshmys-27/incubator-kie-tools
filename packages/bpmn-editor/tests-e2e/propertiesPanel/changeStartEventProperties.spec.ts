/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor, page }) => {
  await editor.open();
  // Set wider viewport to include properties panel in screenshots
  await page.setViewportSize({ width: 1920, height: 1080 });
});

test.describe("Change Properties - Start Event", () => {
  test.beforeEach(async ({ palette, page }) => {
    await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 100, y: 100 } });

    // Get the start event locator directly (like in addStartEvent.spec.ts)
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
    await expect(startEvent).toBeVisible({ timeout: 5000 });

    // Click to select it - properties panel is already open by default
    await startEvent.click();
    await page.waitForTimeout(500);
  });

  test("should change the Start Event name", async ({ startEventPropertiesPanel, page }) => {
    await startEventPropertiesPanel.setName({ newName: "Process Started" });

    await page.waitForTimeout(300);

    expect(await startEventPropertiesPanel.getName()).toBe("Process Started");
    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-name-changed.png");
  });

  test("should change the Start Event documentation", async ({ startEventPropertiesPanel, page }) => {
    await startEventPropertiesPanel.setDocumentation({
      newDocumentation: "This event starts the process",
    });

    await page.waitForTimeout(300);

    expect(await startEventPropertiesPanel.getDocumentation()).toBe("This event starts the process");
  });

  test("should configure Timer event definition with date", async ({ startEventPropertiesPanel, page }) => {
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();

    await startEventPropertiesPanel.setTimerDefinition({
      type: "date",
      value: "2025-12-31T23:59:59",
      startEventLocator: startEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-timer-date.png");
  });

  test("should configure Timer event definition with duration", async ({ startEventPropertiesPanel, page }) => {
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();

    await startEventPropertiesPanel.setTimerDefinition({
      type: "duration",
      value: "PT5M",
      startEventLocator: startEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-timer-duration.png");
  });

  test("should configure Timer event definition with cycle", async ({ startEventPropertiesPanel, page }) => {
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();

    await startEventPropertiesPanel.setTimerDefinition({
      type: "cycle",
      value: "R3/PT10M",
      startEventLocator: startEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-timer-cycle.png");
  });

  test("should configure Message event definition", async ({ startEventPropertiesPanel, page }) => {
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();

    await startEventPropertiesPanel.setMessageDefinition({
      messageName: "StartMessage",
      startEventLocator: startEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-message.png");
  });

  test("should configure Signal event definition", async ({ startEventPropertiesPanel, page }) => {
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();

    await startEventPropertiesPanel.setSignalDefinition({
      signalName: "StartSignal",
      startEventLocator: startEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-signal.png");
  });

  test("should configure Conditional event definition", async ({ startEventPropertiesPanel, page }) => {
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();

    await startEventPropertiesPanel.setConditionalExpression({
      expression: "${amount > 1000}",
      startEventLocator: startEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-conditional.png");
  });

  test("should configure Error event definition", async ({ startEventPropertiesPanel, page }) => {
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();

    await startEventPropertiesPanel.setErrorDefinition({
      errorName: "StartError",
      startEventLocator: startEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-error.png");
  });

  test("should configure Escalation event definition", async ({ startEventPropertiesPanel, page }) => {
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();

    await startEventPropertiesPanel.setEscalationDefinition({
      escalationName: "StartEscalation",
      startEventLocator: startEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-escalation.png");
  });

  test("should configure Compensation event definition", async ({ startEventPropertiesPanel, page }) => {
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();

    await startEventPropertiesPanel.setCompensationDefinition({
      startEventLocator: startEvent,
    });

    await page.waitForTimeout(300);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-compensation.png");
  });
});

test.describe("Change Properties - Start Event in Event Sub-Process", () => {
  test.beforeEach(async ({ palette, nodes, page, startEventPropertiesPanel }) => {
    // Create a sub-process
    await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 200, y: 200 } });

    const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
    await expect(subProcess).toBeAttached();

    // Morph to Event Sub-Process
    const box = await subProcess.boundingBox();
    if (!box) throw new Error("Sub-Process not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(300);

    const morphingToggle = subProcess.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = page.locator(".kie-bpmn-editor--node-morphing-panel");
    const eventSubProcessOption = morphingPanel.locator('div[title="Event"]').first();
    await expect(eventSubProcessOption).toBeVisible({ timeout: 5000 });
    await eventSubProcessOption.click({ force: true });
    await page.waitForTimeout(500);

    // Add Start Event inside Event Sub-Process
    const targetPosition = {
      x: box.x + box.width / 2 - 50,
      y: box.y + box.height / 2 + 50,
    };

    await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition });

    // Wait for start event and select it
    const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
    await expect(startEvent).toBeVisible({ timeout: 5000 });
    await startEvent.click();
    await page.waitForTimeout(500);

    // Add a Message event definition (interrupting checkbox only shows with event definitions)
    await startEventPropertiesPanel.setMessageDefinition({
      messageName: "StartMessage",
      startEventLocator: startEvent,
    });
    await page.waitForTimeout(500);
  });

  test("should display interrupting checkbox for Start Event in Event Sub-Process", async ({
    startEventPropertiesPanel,
  }) => {
    expect(await startEventPropertiesPanel.isInterruptingVisible()).toBe(true);
  });

  test("should toggle interrupting flag for Start Event in Event Sub-Process", async ({
    startEventPropertiesPanel,
    page,
  }) => {
    // Default should be interrupting (true)
    expect(await startEventPropertiesPanel.getInterrupting()).toBe(true);

    // Set to non-interrupting
    await startEventPropertiesPanel.setInterrupting({ isInterrupting: false });
    await page.waitForTimeout(300);

    expect(await startEventPropertiesPanel.getInterrupting()).toBe(false);

    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("start-event-non-interrupting.png");
  });
});
