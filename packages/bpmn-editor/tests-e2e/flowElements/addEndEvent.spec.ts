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

test.describe("Add node - End Event", () => {
  test.describe("Add from palette", () => {
    test("should add End Event node from palette", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 100, y: 100 } });
      await expect(diagram.get()).toHaveScreenshot("add-end-event-node-from-palette.png");
    });

    test("should add two End Event nodes from palette in a row", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 100, y: 100 } });
      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Second End",
      });
      await diagram.resetFocus();
      await expect(diagram.get()).toHaveScreenshot("add-2-end-event-nodes-from-palette.png");
    });
  });

  // BPMN 2.0 End Event Types:
  // All types available in any context: None, Message, Error, Escalation, Signal, Compensation, Terminate

  test.describe("End event type morphing", () => {
    test("should morph None End Event to Message End Event", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Message" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "messageEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-message.png");
    });

    test("should morph None End Event to Error End Event", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Error" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "errorEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-error.png");
    });

    test("should morph None End Event to Escalation End Event", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Escalation" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "escalationEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-escalation.png");
    });

    test("should morph None End Event to Signal End Event", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Signal" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "signalEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-signal.png");
    });

    test("should morph None End Event to Compensation End Event", async ({
      jsonModel,
      palette,
      diagram,
      page,
      nodes,
    }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Compensation" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-compensation.png");
    });

    test("should morph None End Event to Terminate End Event", async ({ jsonModel, palette, diagram, page, nodes }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });

      await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: "Terminate" });

      await expect
        .poll(
          async () => {
            return await jsonModel.getFlowElement({ elementIndex: 0 });
          },
          { timeout: 10000 }
        )
        .toMatchObject({
          __$$element: "endEvent",
          "@_id": expect.any(String),
          eventDefinition: [{ __$$element: "terminateEventDefinition", "@_id": expect.any(String) }],
        });

      await expect(diagram.get()).toHaveScreenshot("morph-end-event-to-terminate.png");
    });
  });

  test.describe("Add connected End Event node", () => {
    test("should create sequence flow from Task to End Event", async ({ diagram, palette, nodes, page }) => {
      await palette.dragNewNode({
        type: NodeType.TASK,
        targetPosition: { x: 100, y: 100 },
      });
      await diagram.resetFocus();
      await palette.dragNewNode({
        type: NodeType.END_EVENT,
        targetPosition: { x: 300, y: 100 },
      });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });
      const endEventId = (await endEvent.getAttribute("data-nodehref")) ?? "";

      await nodes.dragNewConnectedEdge({
        type: EdgeType.SEQUENCE_FLOW,
        from: DefaultNodeName.TASK,
        to: endEventId,
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-end-event.png");
    });

    test("should add connected End Event from Gateway node", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.GATEWAY,
        targetPosition: { x: 100, y: 100 },
      });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      const box = await gateway.boundingBox();
      if (!box) throw new Error("Gateway bounding box not found");

      await page.mouse.move(box.x + box.width / 2, box.y + 10);
      await page.waitForTimeout(500);

      const addEndEventHandle = gateway.getByTitle("Add End Event");
      await expect(addEndEventHandle).toBeVisible({ timeout: 5000 });

      await addEndEventHandle.dragTo(diagram.get(), {
        targetPosition: { x: 300, y: 100 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("add-end-event-node-from-gateway.png");
    });

    test("should add connected End Event from Sub-process node", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({
        type: NodeType.SUB_PROCESS,
        targetPosition: { x: 100, y: 100 },
      });

      const subProcess = page.locator(".kie-bpmn-editor--sub-process-node").first();
      await subProcess.waitFor({ state: "attached", timeout: 5000 });

      const box = await subProcess.boundingBox();
      if (!box) throw new Error("Sub-Process bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
      await page.waitForTimeout(500);

      const addEndEventHandle = subProcess.getByTitle("Add End Event");
      await expect(addEndEventHandle).toBeVisible({ timeout: 5000 });

      await addEndEventHandle.dragTo(diagram.get(), {
        targetPosition: { x: 350, y: 100 },
      });

      await page.waitForTimeout(1000);

      await expect(diagram.get()).toHaveScreenshot("add-end-event-node-from-subprocess.png");
    });
  });

  test.describe("End Event operations", () => {
    test("should delete end event", async ({ palette, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible();

      await endEvent.click();
      await page.keyboard.press("Delete");

      await expect(endEvent).not.toBeAttached();

      const flowElements = await jsonModel.getProcess();
      expect(flowElements.flowElement?.length).toBe(0);
    });
  });
});
