/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName, NodePosition } from "../__fixtures__/nodes";

test.describe("Add Lane", () => {
  test.beforeEach(async ({ editor }) => {
    await editor.open();
  });

  test("should add lane from palette", async ({ palette, nodes, diagram }) => {
    await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

    await expect(nodes.get({ name: DefaultNodeName.LANE })).toBeAttached();
    await expect(diagram.get()).toHaveScreenshot("add-lane-node-from-palette.png");
  });

  test.describe("Lane operations", () => {
    test("should delete lane", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });
      await nodes.delete({ name: DefaultNodeName.LANE });

      await expect(nodes.get({ name: DefaultNodeName.LANE })).not.toBeAttached();

      // Verify it's removed from JSON model - check the lanes within the laneSet
      const process = await jsonModel.getProcess();
      const laneSet = Array.isArray(process.laneSet) ? process.laneSet[0] : process.laneSet;
      expect(laneSet?.lane?.length || 0).toBe(0);
    });

    //   test("should move lane to new position", async ({ palette, nodes }) => {
    //     await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

    //     const laneBefore = nodes.get({ name: DefaultNodeName.LANE });
    //     const boxBefore = await laneBefore.boundingBox();

    //     // Move lane to new position
    //     await laneBefore.dragTo(nodes.get({ name: DefaultNodeName.LANE }), {
    //       targetPosition: { x: 500, y: 400 },
    //     });

    //     const laneAfter = nodes.get({ name: DefaultNodeName.LANE });
    //     const boxAfter = await laneAfter.boundingBox();

    //     // Verify position changed
    //     expect(boxAfter?.x).not.toBe(boxBefore?.x);
    //     expect(boxAfter?.y).not.toBe(boxBefore?.y);
    //   });

    //   test("should rename lane", async ({ palette, nodes, jsonModel }) => {
    //     await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });
    //     await nodes.rename({ current: DefaultNodeName.LANE, new: "Customer Service Lane" });

    //     await expect(nodes.get({ name: "Customer Service Lane" })).toBeAttached();

    //     const process = await jsonModel.getProcess();
    //     const lane = process.laneSet?.[0]?.lane?.[0];
    //     expect(lane?.["@_name"]).toBe("Customer Service Lane");
    //   });

    //   test("should resize lane", async ({ palette, nodes }) => {
    //     await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

    //     const laneBefore = nodes.get({ name: DefaultNodeName.LANE });
    //     const boxBefore = await laneBefore.boundingBox();

    //     // Resize lane (lanes can be resized in width and height)
    //     await nodes.resize({ nodeName: DefaultNodeName.LANE, xOffset: 150, yOffset: 100 });

    //     const laneAfter = nodes.get({ name: DefaultNodeName.LANE });
    //     const boxAfter = await laneAfter.boundingBox();

    //     // Verify size changed
    //     expect(boxAfter?.width).toBeGreaterThan(boxBefore?.width ?? 0);
    //     expect(boxAfter?.height).toBeGreaterThan(boxBefore?.height ?? 0);
    //   });

    //   test("should copy and paste lane", async ({ palette, nodes, jsonModel, page }) => {
    //     await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

    //     const lane = nodes.get({ name: DefaultNodeName.LANE });
    //     await lane.click();

    //     await page.keyboard.press("ControlOrMeta+C");
    //     await page.keyboard.press("ControlOrMeta+V");

    //     const process = await jsonModel.getProcess();
    //     expect(process.laneSet?.length).toBe(2);
    //   });
  });
});
