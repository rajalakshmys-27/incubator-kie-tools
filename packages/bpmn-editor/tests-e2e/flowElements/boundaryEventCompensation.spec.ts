/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Compensation Boundary Events", () => {
  test("should create compensation boundary event on task", async ({
    palette,
    nodes,
    jsonModel,
    page,
    diagram,
    intermediateEventPropertiesPanel,
  }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

    // Verify the intermediate catch event attached as a boundary event
    const boundaryEvent = await jsonModel.getFlowElement({ elementIndex: 1 });
    expect(boundaryEvent).toMatchObject({
      __$$element: "boundaryEvent",
      "@_id": expect.any(String),
      "@_attachedToRef": expect.any(String),
    });

    // Select the boundary event and set compensation event definition
    const eventNode = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
    await eventNode.click();
    await page.waitForTimeout(500);

    // Set compensation event definition through properties panel
    await intermediateEventPropertiesPanel.setCompensationDefinition({});

    // Set cancel activity to false (compensation boundary events typically don't cancel)
    await intermediateEventPropertiesPanel.setCancelActivity({ cancelActivity: false });

    // Verify the compensation event definition was added (using poll for async updates)
    await expect
      .poll(
        async () => {
          return await jsonModel.getFlowElement({ elementIndex: 1 });
        },
        { timeout: 10000 }
      )
      .toMatchObject({
        __$$element: "boundaryEvent",
        "@_id": expect.any(String),
        "@_attachedToRef": expect.any(String),
        "@_cancelActivity": false,
        eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
      });

    // Verify cancel activity through properties panel
    const cancelActivity = await intermediateEventPropertiesPanel.getCancelActivity();
    expect(cancelActivity).toBe(false);

    await expect(diagram.get()).toHaveScreenshot("compensation-boundary-event-on-task.png");
  });

  test("should not allow incoming sequence flows to compensation boundary event", async ({
    palette,
    nodes,
    jsonModel,
    page,
    diagram,
    intermediateEventPropertiesPanel,
  }) => {
    await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 450, y: 300 } });

    // Use CSS class selector to locate the intermediate catch event
    const eventNode = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
    await expect(eventNode).toBeAttached();

    // Select the boundary event and set compensation event definition
    await eventNode.click();
    await page.waitForTimeout(500);

    // Set compensation event definition through properties panel
    await intermediateEventPropertiesPanel.setCompensationDefinition({});

    // Verify the boundary event was created with compensation definition
    await expect
      .poll(
        async () => {
          const process = await jsonModel.getProcess();
          return process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");
        },
        { timeout: 10000 }
      )
      .toMatchObject({
        __$$element: "boundaryEvent",
        eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
      });

    const process = await jsonModel.getProcess();
    const boundaryEvent = process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");

    // Try to create a sequence flow to the compensation boundary event
    // This should not be allowed - compensation boundary events can only have outgoing flows
    await palette.dragNewNode({ type: NodeType.START_EVENT, targetPosition: { x: 100, y: 300 } });

    // Get the Start Event node using data-nodelabel attribute
    const startEvent = page.locator(".kie-bpmn-editor--task-node").last();
    await expect(startEvent).toBeAttached();

    // Get Start Event bounding box to hover over it
    const box = await startEvent.boundingBox();
    if (!box) throw new Error("Start Event bounding box not found");

    // Hover over the right side of the Start Event to reveal connection handles
    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
    await page.waitForTimeout(500); // Wait for handles to appear

    // Find the "Add Sequence Flow" handle
    const addSequenceFlowHandle = startEvent.getByTitle("Add Sequence Flow");
    await expect(addSequenceFlowHandle).toBeVisible({ timeout: 5000 });

    // Get boundary event position for drag target
    const eventBox = await eventNode.boundingBox();
    if (!eventBox) throw new Error("Boundary Event bounding box not found");

    // Attempt to drag from the handle to the boundary event center
    // The editor should prevent this or the flow should not be created
    await addSequenceFlowHandle.dragTo(diagram.get(), {
      targetPosition: { x: eventBox.x + eventBox.width / 2, y: eventBox.y + eventBox.height / 2 },
    });

    // Wait for edge to be created
    await page.waitForTimeout(1000);

    // Verify no incoming sequence flow was created to the boundary event
    const updatedProcess = await jsonModel.getProcess();
    const sequenceFlows = updatedProcess.flowElement?.filter((e: any) => e.__$$element === "sequenceFlow") || [];
    const incomingFlowToBoundary = sequenceFlows.find((flow: any) => flow["@_targetRef"] === boundaryEvent["@_id"]);

    expect(incomingFlowToBoundary).toBeUndefined();
  });

  test("should allow compensation boundary event on subprocess", async ({
    palette,
    nodes,
    jsonModel,
    page,
    diagram,
    intermediateEventPropertiesPanel,
  }) => {
    await palette.dragNewNode({ type: NodeType.SUB_PROCESS, targetPosition: { x: 100, y: 300 } });
    await palette.dragNewNode({ type: NodeType.INTERMEDIATE_CATCH_EVENT, targetPosition: { x: 550, y: 350 } });

    // The intermediate catch event should auto-attach to the subprocess when dragged near its edge
    // Verify it became a boundary event
    const process = await jsonModel.getProcess();
    const boundaryEvent = process.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");
    const subProcessElement = process.flowElement?.find((e: any) => e.__$$element === "subProcess");

    expect(boundaryEvent).toBeDefined();
    expect(boundaryEvent["@_attachedToRef"]).toBe(subProcessElement["@_id"]);

    // Select the boundary event and set compensation event definition
    const eventNode = page.locator(".kie-bpmn-editor--intermediate-catch-event-node").first();
    await eventNode.click();
    await page.waitForTimeout(500);

    // Set compensation event definition through properties panel
    await intermediateEventPropertiesPanel.setCompensationDefinition({});

    // Set cancel activity to false
    await intermediateEventPropertiesPanel.setCancelActivity({ cancelActivity: false });

    // Verify the compensation event definition was added (using poll for async updates)
    await expect
      .poll(
        async () => {
          const updatedProcess = await jsonModel.getProcess();
          return updatedProcess.flowElement?.find((e: any) => e.__$$element === "boundaryEvent");
        },
        { timeout: 10000 }
      )
      .toMatchObject({
        __$$element: "boundaryEvent",
        "@_attachedToRef": subProcessElement["@_id"],
        "@_cancelActivity": false,
        eventDefinition: [{ __$$element: "compensateEventDefinition", "@_id": expect.any(String) }],
      });

    await expect(diagram.get()).toHaveScreenshot("compensation-boundary-event-on-subprocess.png");
  });
});
