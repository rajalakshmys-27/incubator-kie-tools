/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName, NodePosition } from "../__fixtures__/nodes";
import { EdgeType } from "../__fixtures__/edges";

test.describe("Add Data Object", () => {
  test.beforeEach(async ({ editor }) => {
    await editor.open();
  });

  test("should add data object from palette", async ({ palette, nodes, jsonModel }) => {
    await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 300, y: 300 } });

    await expect(nodes.get({ name: DefaultNodeName.DATA_OBJECT })).toBeAttached();

    const dataObject = await jsonModel.getFlowElement({ elementIndex: 0 });
    expect(dataObject.__$$element).toBe("dataObject");
    expect(dataObject["@_name"]).toBe(DefaultNodeName.DATA_OBJECT);
  });

  test("should rename data object", async ({ palette, nodes, jsonModel }) => {
    await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 300, y: 300 } });
    await nodes.rename({ current: DefaultNodeName.DATA_OBJECT, new: "Customer Data" });

    await expect(nodes.get({ name: "Customer Data" })).toBeAttached();

    const dataObject = await jsonModel.getFlowElement({ elementIndex: 0 });
    expect(dataObject["@_name"]).toBe("Customer Data");
  });

  test("should delete data object", async ({ palette, nodes, jsonModel }) => {
    await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 300, y: 300 } });
    await nodes.delete({ name: DefaultNodeName.DATA_OBJECT });

    await expect(nodes.get({ name: DefaultNodeName.DATA_OBJECT })).not.toBeAttached();

    // Verify it's removed from JSON model
    const flowElements = await jsonModel.getProcess();
    expect(flowElements.flowElement?.length || 0).toBe(0);
  });

  // test("should move data object to new position", async ({ palette, nodes }) => {
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 300, y: 300 } });

  //   const dataObjectBefore = nodes.get({ name: DefaultNodeName.DATA_OBJECT });
  //   const boxBefore = await dataObjectBefore.boundingBox();

  //   // Move data object to new position
  //   await dataObjectBefore.dragTo(nodes.get({ name: DefaultNodeName.DATA_OBJECT }), {
  //     targetPosition: { x: 500, y: 400 },
  //   });

  //   const dataObjectAfter = nodes.get({ name: DefaultNodeName.DATA_OBJECT });
  //   const boxAfter = await dataObjectAfter.boundingBox();

  //   // Verify position changed
  //   expect(boxAfter?.x).not.toBe(boxBefore?.x);
  //   expect(boxAfter?.y).not.toBe(boxBefore?.y);
  // });

  // test("should copy and paste data object", async ({ palette, nodes, jsonModel, page }) => {
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 300, y: 300 } });

  //   const dataObject = nodes.get({ name: DefaultNodeName.DATA_OBJECT });
  //   await dataObject.click();

  //   await page.keyboard.press("ControlOrMeta+C");
  //   await page.keyboard.press("ControlOrMeta+V");

  //   const flowElements = await jsonModel.getProcess();
  //   expect(flowElements.flowElement?.length).toBe(2);
  //   expect(flowElements.flowElement?.[0].__$$element).toBe("dataObject");
  //   expect(flowElements.flowElement?.[1].__$$element).toBe("dataObject");
  // });

  // test("should create association from data object to task", async ({ palette, nodes, edges }) => {
  //   // Create a task
  //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 200, y: 300 } });

  //   // Create a data object
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 400, y: 300 } });

  //   // Create association from data object to task
  //   await nodes.dragNewConnectedEdge({
  //     type: EdgeType.ASSOCIATION,
  //     from: DefaultNodeName.DATA_OBJECT,
  //     to: DefaultNodeName.TASK,
  //   });

  //   // Verify association exists
  //   const association = await edges.get({ from: DefaultNodeName.DATA_OBJECT, to: DefaultNodeName.TASK });
  //   expect(association).toBeDefined();

  //   const associationType = await edges.getType({ from: DefaultNodeName.DATA_OBJECT, to: DefaultNodeName.TASK });
  //   expect(associationType).toBe("association");
  // });

  // test("should create association from task to data object", async ({ palette, nodes, edges }) => {
  //   // Create a task
  //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 200, y: 300 } });

  //   // Create a data object
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 400, y: 300 } });

  //   // Create association from task to data object
  //   await nodes.dragNewConnectedEdge({
  //     type: EdgeType.ASSOCIATION,
  //     from: DefaultNodeName.TASK,
  //     to: DefaultNodeName.DATA_OBJECT,
  //   });

  //   // Verify association exists
  //   const association = await edges.get({ from: DefaultNodeName.TASK, to: DefaultNodeName.DATA_OBJECT });
  //   expect(association).toBeDefined();
  // });

  // test("should create data object connected to task via association", async ({ palette, nodes, edges }) => {
  //   // Create a task
  //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 200, y: 300 } });

  //   // Create data object connected to task
  //   await nodes.dragNewConnectedNode({
  //     type: NodeType.DATA_OBJECT,
  //     from: DefaultNodeName.TASK,
  //     targetPosition: { x: 400, y: 300 },
  //   });

  //   await expect(nodes.get({ name: DefaultNodeName.DATA_OBJECT })).toBeAttached();

  //   // Verify association was created
  //   const association = await edges.get({ from: DefaultNodeName.TASK, to: DefaultNodeName.DATA_OBJECT });
  //   expect(association).toBeDefined();
  // });

  // test("should create multiple data objects", async ({ palette, nodes, jsonModel }) => {
  //   // Create first data object
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 200, y: 300 } });
  //   await nodes.rename({ current: DefaultNodeName.DATA_OBJECT, new: "Input Data" });

  //   // Create second data object
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 400, y: 300 } });
  //   await nodes.rename({ current: DefaultNodeName.DATA_OBJECT, new: "Output Data" });

  //   // Create third data object
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 600, y: 300 } });
  //   await nodes.rename({ current: DefaultNodeName.DATA_OBJECT, new: "Reference Data" });

  //   await expect(nodes.get({ name: "Input Data" })).toBeAttached();
  //   await expect(nodes.get({ name: "Output Data" })).toBeAttached();
  //   await expect(nodes.get({ name: "Reference Data" })).toBeAttached();

  //   // Verify all three data objects exist in the model
  //   const inputData = await jsonModel.getFlowElement({ elementIndex: 0 });
  //   expect(inputData.__$$element).toBe("dataObject");
  //   expect(inputData["@_name"]).toBe("Input Data");

  //   const outputData = await jsonModel.getFlowElement({ elementIndex: 1 });
  //   expect(outputData.__$$element).toBe("dataObject");
  //   expect(outputData["@_name"]).toBe("Output Data");

  //   const referenceData = await jsonModel.getFlowElement({ elementIndex: 2 });
  //   expect(referenceData.__$$element).toBe("dataObject");
  //   expect(referenceData["@_name"]).toBe("Reference Data");
  // });

  // test("should create data object with associations to multiple tasks", async ({ palette, nodes, edges }) => {
  //   // Create a data object
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 300, y: 300 } });

  //   // Create first task and connect to data object
  //   await nodes.dragNewConnectedNode({
  //     type: NodeType.TASK,
  //     from: DefaultNodeName.DATA_OBJECT,
  //     targetPosition: { x: 150, y: 200 },
  //     thenRenameTo: "Read Task",
  //   });

  //   // Create second task and connect to data object
  //   await nodes.dragNewConnectedNode({
  //     type: NodeType.TASK,
  //     from: DefaultNodeName.DATA_OBJECT,
  //     targetPosition: { x: 150, y: 400 },
  //     thenRenameTo: "Write Task",
  //   });

  //   // Verify both associations exist
  //   const association1 = await edges.get({ from: DefaultNodeName.DATA_OBJECT, to: "Read Task" });
  //   expect(association1).toBeDefined();

  //   const association2 = await edges.get({ from: DefaultNodeName.DATA_OBJECT, to: "Write Task" });
  //   expect(association2).toBeDefined();
  // });

  // test("should create data flow pattern with input and output data objects", async ({ palette, nodes, edges }) => {
  //   // Create input data object
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 100, y: 300 } });
  //   await nodes.rename({ current: DefaultNodeName.DATA_OBJECT, new: "Input" });

  //   // Create task
  //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 300, y: 300 } });

  //   // Create output data object
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 500, y: 300 } });
  //   await nodes.rename({ current: DefaultNodeName.DATA_OBJECT, new: "Output" });

  //   // Connect input to task
  //   await nodes.dragNewConnectedEdge({
  //     type: EdgeType.ASSOCIATION,
  //     from: "Input",
  //     to: DefaultNodeName.TASK,
  //   });

  //   // Connect task to output
  //   await nodes.dragNewConnectedEdge({
  //     type: EdgeType.ASSOCIATION,
  //     from: DefaultNodeName.TASK,
  //     to: "Output",
  //   });

  //   // Verify both associations exist
  //   const inputAssociation = await edges.get({ from: "Input", to: DefaultNodeName.TASK });
  //   expect(inputAssociation).toBeDefined();

  //   const outputAssociation = await edges.get({ from: DefaultNodeName.TASK, to: "Output" });
  //   expect(outputAssociation).toBeDefined();
  // });

  // test("should resize data object", async ({ palette, nodes }) => {
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 300, y: 300 } });

  //   const dataObjectBefore = nodes.get({ name: DefaultNodeName.DATA_OBJECT });
  //   const boxBefore = await dataObjectBefore.boundingBox();

  //   await nodes.resize({ nodeName: DefaultNodeName.DATA_OBJECT, xOffset: 50, yOffset: 30 });

  //   const dataObjectAfter = nodes.get({ name: DefaultNodeName.DATA_OBJECT });
  //   const boxAfter = await dataObjectAfter.boundingBox();

  //   expect(boxAfter?.width).toBeGreaterThan(boxBefore?.width ?? 0);
  //   expect(boxAfter?.height).toBeGreaterThan(boxBefore?.height ?? 0);
  // });

  // test("should delete association between data object and task", async ({ palette, nodes, edges }) => {
  //   // Create task and data object with association
  //   await palette.dragNewNode({ type: NodeType.TASK, targetPosition: { x: 200, y: 300 } });
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 400, y: 300 } });

  //   await nodes.dragNewConnectedEdge({
  //     type: EdgeType.ASSOCIATION,
  //     from: DefaultNodeName.TASK,
  //     to: DefaultNodeName.DATA_OBJECT,
  //   });

  //   // Verify association exists
  //   let association = await edges.get({ from: DefaultNodeName.TASK, to: DefaultNodeName.DATA_OBJECT });
  //   expect(association).toBeDefined();

  //   // Delete the association
  //   await edges.delete({ from: DefaultNodeName.TASK, to: DefaultNodeName.DATA_OBJECT });

  //   // Verify association is deleted
  //   association = await edges.get({ from: DefaultNodeName.TASK, to: DefaultNodeName.DATA_OBJECT });
  //   expect(association).toBeNull();
  // });

  // test("should create data object associated with text annotation", async ({ palette, nodes, edges }) => {
  //   // Create a data object
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 300, y: 300 } });

  //   // Create a text annotation
  //   await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 500, y: 300 } });

  //   // Create association from data object to text annotation
  //   await nodes.dragNewConnectedEdge({
  //     type: EdgeType.ASSOCIATION,
  //     from: DefaultNodeName.DATA_OBJECT,
  //     to: DefaultNodeName.TEXT_ANNOTATION,
  //   });

  //   // Verify association exists
  //   const association = await edges.get({ from: DefaultNodeName.DATA_OBJECT, to: DefaultNodeName.TEXT_ANNOTATION });
  //   expect(association).toBeDefined();
  // });

  // test("should select and deselect data object", async ({ palette, nodes, page }) => {
  //   await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 300, y: 300 } });

  //   // Select data object
  //   await nodes.select({ name: DefaultNodeName.DATA_OBJECT, position: NodePosition.CENTER });

  //   // Verify it's selected
  //   const selectedNode = page.locator(`div[data-nodelabel="${DefaultNodeName.DATA_OBJECT}"][data-selected="true"]`);
  //   await expect(selectedNode).toBeAttached();

  //   // Deselect by clicking on diagram
  //   await page.locator('[data-testid="rf__wrapper"]').click({ position: { x: 100, y: 100 } });

  //   // Verify it's deselected
  //   const deselectedNode = page.locator(
  //     `div[data-nodelabel="${DefaultNodeName.DATA_OBJECT}"][data-selected="false"]`
  //   );
  //   await expect(deselectedNode).toBeAttached();
  // });
});
