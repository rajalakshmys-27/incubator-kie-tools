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
    test("should add End Event node from palette", async ({ palette, jsonModel, diagram }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 100, y: 100 } });

      const endEvent = await jsonModel.getFlowElement({ elementIndex: 0 });
      expect(endEvent.__$$element).toBe("endEvent");

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
    const morphTestCases = [
      { morphType: "Message", eventDefinition: "messageEventDefinition" },
      { morphType: "Error", eventDefinition: "errorEventDefinition" },
      { morphType: "Escalation", eventDefinition: "escalationEventDefinition" },
      { morphType: "Signal", eventDefinition: "signalEventDefinition" },
      { morphType: "Compensation", eventDefinition: "compensateEventDefinition" },
      { morphType: "Terminate", eventDefinition: "terminateEventDefinition" },
    ];

    for (const { morphType, eventDefinition } of morphTestCases) {
      test(`should morph None End Event to ${morphType} End Event`, async ({
        jsonModel,
        palette,
        diagram,
        page,
        nodes,
      }) => {
        await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

        const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
        await expect(endEvent).toBeVisible({ timeout: 5000 });

        await nodes.morphNode({ nodeLocator: endEvent, targetMorphType: morphType });

        await expect
          .poll(
            async () => {
              return await jsonModel.getFlowElement({ elementIndex: 0 });
            },
            { timeout: 10000 }
          )
          .toMatchObject({
            __$$element: "endEvent",
            eventDefinition: [{ __$$element: eventDefinition }],
          });

        await expect(diagram.get()).toHaveScreenshot(`morph-end-event-to-${morphType.toLowerCase()}.png`);
      });
    }
  });

  test.describe("Add connected End Event node", () => {
    test("should create sequence flow from Task to End Event", async ({ diagram, palette, nodes, page }) => {
      await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 100, y: 100 } });
      await diagram.resetFocus();
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 100 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeVisible({ timeout: 5000 });
      const endEventId = (await endEvent.getAttribute("data-nodehref")) ?? "";

      await nodes.dragNewConnectedEdge({
        type: EdgeType.SEQUENCE_FLOW,
        from: DefaultNodeName.TASK,
        to: endEventId,
      });

      await expect(diagram.get()).toHaveScreenshot("create-sequence-flow-task-to-end-event.png");
    });

    test("should add connected End Event from Gateway node", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({ type: NodeType.GATEWAY, targetPosition: { x: 100, y: 100 } });

      const gateway = page.locator(".kie-bpmn-editor--gateway-node").first();
      await expect(gateway).toBeVisible({ timeout: 5000 });

      const box = await gateway.boundingBox();
      if (!box) throw new Error("Gateway bounding box not found");

      await page.mouse.move(box.x + box.width / 2, box.y + 10);

      const addEndEventHandle = gateway.getByTitle("Add End Event");
      await expect(addEndEventHandle).toBeVisible({ timeout: 5000 });

      await addEndEventHandle.dragTo(diagram.get(), { targetPosition: { x: 300, y: 100 } });

      await expect(diagram.get()).toHaveScreenshot("add-end-event-node-from-gateway.png");
    });

    test("should add connected End Event from Sub-process node", async ({ diagram, palette, page }) => {
      await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 100 } });

      const subProcess = page.locator(".kie-bpmn-editor--sub-process-node").first();
      await subProcess.waitFor({ state: "attached", timeout: 5000 });

      const box = await subProcess.boundingBox();
      if (!box) throw new Error("Sub-Process bounding box not found");

      await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);

      const addEndEventHandle = subProcess.getByTitle("Add End Event");
      await expect(addEndEventHandle).toBeVisible({ timeout: 5000 });

      await addEndEventHandle.dragTo(diagram.get(), { targetPosition: { x: 350, y: 100 } });

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

      const process = await jsonModel.getProcess();
      expect(process.flowElement?.length).toBe(0);
    });

    test("should move end event to new position", async ({ palette, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.END_EVENT, targetPosition: { x: 300, y: 300 } });

      const endEvent = page.locator(".kie-bpmn-editor--end-event-node").first();
      await expect(endEvent).toBeAttached();
      await endEvent.scrollIntoViewIfNeeded();

      const endEventBox = await endEvent.boundingBox();
      if (!endEventBox) throw new Error("End Event bounding box not found");

      await endEvent.dragTo(diagram.get(), {
        sourcePosition: { x: endEventBox.width / 2, y: endEventBox.height / 2 },
        targetPosition: { x: 500, y: 400 },
        force: true,
      });

      const boxAfter = await endEvent.boundingBox();
      expect(boxAfter?.x).not.toBe(endEventBox.x);
      expect(boxAfter?.y).not.toBe(endEventBox.y);
    });
  });
});
