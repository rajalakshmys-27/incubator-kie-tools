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
import { EdgeType } from "../__fixtures__/edges";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

async function setupEventSubProcess(palette: any, nodes: any, page: any) {
  await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 200 } });

  const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
  await expect(subProcess).toBeAttached();

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

  const targetPosition = {
    x: box.x + box.width / 2 - 50,
    y: box.y + box.height / 2 + 50,
  };

  await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition });

  const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
  await expect(startEvent).toBeVisible({ timeout: 5000 });

  return startEvent;
}

async function setupRegularSubProcess(palette: any, nodes: any, page: any) {
  await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 200 } });

  const subProcess = nodes.get({ name: DefaultNodeName.SUB_PROCESS });
  await expect(subProcess).toBeAttached();

  const box = await subProcess.boundingBox();
  if (!box) throw new Error("Sub-Process not visible");

  const targetPosition = {
    x: box.x + box.width / 2 - 50,
    y: box.y + box.height / 2 + 50,
  };

  await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition });

  const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
  await expect(startEvent).toBeVisible({ timeout: 5000 });
  return startEvent;
}

test.describe("Add node - Start Event", () => {
  test.describe("Add from palette", () => {
    test("should add Start Event node from palette", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 100, y: 100 } });
      await expect(diagram.get()).toHaveScreenshot("add-start-event-node-from-palette.png");
    });

    test("should add two Start Event nodes from palette in a row", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 100, y: 100 } });
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Second Start",
      });
      await diagram.resetFocus();
      await expect(diagram.get()).toHaveScreenshot("add-2-start-event-nodes-from-palette.png");
    });
  });

  // BPMN 2.0 Start Event Morphing Rules:
  // - Top-Level Process: None, Message, Timer, Conditional, Signal
  // - Event Sub-Process (triggeredByEvent=true): Message, Timer, Error, Escalation, Compensation, Conditional, Signal
  // - Regular Sub-Process (triggeredByEvent=false): None only (no morphing)

  test.describe("Top-level process start event morphing", () => {
    test("should morph None Start Event to Message Start Event", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 300, y: 300 } });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Message" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "messageEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-start-event-to-message.png");
    });

    test("should morph None Start Event to Timer Start Event", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 300, y: 300 } });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Timer" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "timerEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-start-event-to-timer.png");
    });

    test("should morph None Start Event to Conditional Start Event", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 300, y: 300 } });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Conditional" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "conditionalEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-start-event-to-conditional.png");
    });

    test("should morph None Start Event to Signal Start Event", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 300, y: 300 } });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Signal" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "signalEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-start-event-to-signal.png");
    });

    test("should NOT show Error/Escalation/Compensation options for Top-Level Start Event", async ({
      palette,
      diagram,
      page,
    }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 300, y: 300 } });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event not visible");

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(300);

      const morphingToggle = startEvent.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
      await expect(morphingToggle).toBeVisible({ timeout: 5000 });
      await morphingToggle.click({ force: true });

      await expect(page.getByTitle("Error")).toHaveClass(/disabled/);
      await expect(page.getByTitle("Escalation")).toHaveClass(/disabled/);
      await expect(page.getByTitle("Compensation")).toHaveClass(/disabled/);

      await expect(page.getByTitle("Message")).toBeVisible();
      await expect(page.getByTitle("Timer")).toBeVisible();
      await expect(page.getByTitle("Conditional")).toBeVisible();
      await expect(page.getByTitle("Signal")).toBeVisible();

      await expect(diagram.get()).toHaveScreenshot("top-level-start-event-morphing-options.png");
    });
  });

  test.describe("Event sub-process start event morphing", () => {
    test("should morph None Start Event to Message Start Event in Event Sub-Process", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      const startEvent = await setupEventSubProcess(palette, nodes, page);

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Message" });

      await expect
        .poll(
          async () => {
            const subProcessElement = await jsonModel.getFlowElement({ elementIndex: 0 });
            return subProcessElement.flowElement?.find(
              (el: { __$$element: string }) => el.__$$element === "startEvent"
            );
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "messageEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-event-subprocess-start-event-to-message.png");
    });

    test("should morph None Start Event to Timer Start Event in Event Sub-Process", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      const startEvent = await setupEventSubProcess(palette, nodes, page);

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Timer" });

      await expect
        .poll(
          async () => {
            const subProcessElement = await jsonModel.getFlowElement({ elementIndex: 0 });
            return subProcessElement.flowElement?.find(
              (el: { __$$element: string }) => el.__$$element === "startEvent"
            );
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "timerEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-event-subprocess-start-event-to-timer.png");
    });

    test("should morph None Start Event to Error Start Event in Event Sub-Process", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      const startEvent = await setupEventSubProcess(palette, nodes, page);

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Error" });

      await expect
        .poll(
          async () => {
            const subProcessElement = await jsonModel.getFlowElement({ elementIndex: 0 });
            return subProcessElement.flowElement?.find(
              (el: { __$$element: string }) => el.__$$element === "startEvent"
            );
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "errorEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-event-subprocess-start-event-to-error.png");
    });

    test("should morph None Start Event to Escalation Start Event in Event Sub-Process", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      const startEvent = await setupEventSubProcess(palette, nodes, page);

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Escalation" });

      await expect
        .poll(
          async () => {
            const subProcessElement = await jsonModel.getFlowElement({ elementIndex: 0 });
            return subProcessElement.flowElement?.find(
              (el: { __$$element: string }) => el.__$$element === "startEvent"
            );
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "escalationEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-event-subprocess-start-event-to-escalation.png");
    });

    test("should morph None Start Event to Compensation Start Event in Event Sub-Process", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      const startEvent = await setupEventSubProcess(palette, nodes, page);

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Compensation" });

      await expect
        .poll(
          async () => {
            const subProcessElement = await jsonModel.getFlowElement({ elementIndex: 0 });
            return subProcessElement.flowElement?.find(
              (el: { __$$element: string }) => el.__$$element === "startEvent"
            );
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-event-subprocess-start-event-to-compensation.png");
    });

    test("should morph None Start Event to Conditional Start Event in Event Sub-Process", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      const startEvent = await setupEventSubProcess(palette, nodes, page);

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Conditional" });

      await expect
        .poll(
          async () => {
            const subProcessElement = await jsonModel.getFlowElement({ elementIndex: 0 });
            return subProcessElement.flowElement?.find(
              (el: { __$$element: string }) => el.__$$element === "startEvent"
            );
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "conditionalEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-event-subprocess-start-event-to-conditional.png");
    });

    test("should morph None Start Event to Signal Start Event in Event Sub-Process", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      const startEvent = await setupEventSubProcess(palette, nodes, page);

      await nodes.morphNode({ nodeLocator: startEvent, targetMorphType: "Signal" });

      await expect
        .poll(
          async () => {
            const subProcessElement = await jsonModel.getFlowElement({ elementIndex: 0 });
            return subProcessElement.flowElement?.find(
              (el: { __$$element: string }) => el.__$$element === "startEvent"
            );
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "signalEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-event-subprocess-start-event-to-signal.png");
    });
  });

  test.describe("Regular embedded sub-process start events", () => {
    test("should add None Start Event inside regular Sub-Process and verify JSON", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      const startEvent = await setupRegularSubProcess(palette, nodes, page);

      await expect
        .poll(
          async () => {
            const subProcessElement = await jsonModel.getFlowElement({ elementIndex: 0 });
            return subProcessElement.flowElement?.find(
              (el: { __$$element: string }) => el.__$$element === "startEvent"
            );
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "startEvent",
          "@_id": expect.any(String),
        });

      await expect(diagram.get()).toHaveScreenshot("regular-subprocess-start-event-none.png");
    });

    test("should NOT show morphing options for Start Event inside regular Sub-Process", async ({
      palette,
      diagram,
      page,
      nodes,
    }) => {
      const startEvent = await setupRegularSubProcess(palette, nodes, page);

      const box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event not visible");

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(300);

      const morphingToggle = startEvent.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
      await expect(morphingToggle).toBeVisible({ timeout: 5000 });
      await morphingToggle.click({ force: true });

      await expect(page.getByTitle("Message")).toHaveClass(/disabled/);
      await expect(page.getByTitle("Timer")).toHaveClass(/disabled/);
      await expect(page.getByTitle("Error")).toHaveClass(/disabled/);
      await expect(page.getByTitle("Escalation")).toHaveClass(/disabled/);
      await expect(page.getByTitle("Compensation")).toHaveClass(/disabled/);
      await expect(page.getByTitle("Conditional")).toHaveClass(/disabled/);
      await expect(page.getByTitle("Signal")).toHaveClass(/disabled/);

      await expect(diagram.get()).toHaveScreenshot("regular-subprocess-start-event-no-morphing.png");
    });
  });

  test.describe("Add connected node", () => {
    test("should add connected Task node from Start Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);

      const addTaskHandle = startEvent.getByTitle("Add Task");
      await expect(addTaskHandle).toBeVisible({ timeout: 5000 });

      await addTaskHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("add-task-node-from-start-event.png");
    });

    test("should add connected Gateway node from Start Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);

      const addGatewayHandle = startEvent.getByTitle("Add Gateway");
      await expect(addGatewayHandle).toBeVisible({ timeout: 5000 });

      await addGatewayHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("add-gateway-node-from-start-event.png");
    });

    test("should create sequence flow from Start Event to Sub-process", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 100, y: 100 },
      });

      await palette.dragNewNode({
        type: NodeType.SUB_PROCESS,
        targetPosition: { x: 350, y: 100 },
      });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const subProcess = page.locator('[data-nodelabel="New Sub-process"]').first();
      await expect(subProcess).toBeAttached();

      const box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);

      const addSequenceFlowHandle = startEvent.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      const subProcessBox = await subProcess.boundingBox();
      if (!subProcessBox) throw new Error("Sub-process bounding box not found");

      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: subProcessBox.x + subProcessBox.width / 2, y: subProcessBox.y + subProcessBox.height / 2 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-start-event-to-subprocess.png");
    });

    test("should create sequence flow from Start Event to End Event", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.START_EVENT,
        targetPosition: { x: 100, y: 100 },
      });
      await diagram.resetFocus();
      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible({ timeout: 5000 });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      const box = await startEvent.boundingBox();
      if (!box) throw new Error("Start Event bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);

      const addSequenceFlowHandle = startEvent.getByTitle("Add Sequence Flow");
      await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

      const endEventBox = await endEvent.boundingBox();
      if (!endEventBox) throw new Error("End Event bounding box not found");

      await addSequenceFlowHandle.dragTo(diagram.get(), {
        targetPosition: { x: endEventBox.x + endEventBox.width / 2, y: endEventBox.y + endEventBox.height / 2 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-start-event-to-end-event.png");
    });
  });

  test.describe("Start Event operations", () => {
    test("should delete start event", async ({ palette, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 300, y: 300 } });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeVisible();

      await startEvent.click();
      await page.keyboard.press("Delete");

      await expect(startEvent).not.toBeAttached();

      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });

    test("should move start event to new position", async ({ palette, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 300, y: 300 } });

      const startEvent = page.locator(".kie-bpmn-editor--task-node").first();
      await expect(startEvent).toBeAttached();

      await startEvent.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const startEventBox = await startEvent.boundingBox();
      if (!startEventBox) {
        throw new Error("Start Event bounding box not found");
      }

      await startEvent.dragTo(diagram.get(), {
        sourcePosition: { x: startEventBox.width / 2, y: startEventBox.height / 2 },
        targetPosition: { x: 500, y: 400 },
        force: true,
      });

      const boxAfter = await startEvent.boundingBox();

      expect(boxAfter?.x).not.toBe(startEventBox?.x);
      expect(boxAfter?.y).not.toBe(startEventBox?.y);
    });
  });
});
