/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - Group", () => {
  test.describe("Add from palette", () => {
    test("should add Group node from palette", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 100, y: 100 } });

      await expect(diagram.get()).toHaveScreenshot("add-group-node-from-palette.png");
    });

    test("should add two Group nodes from palette in a row", async ({ palette, diagram }) => {
      await palette.dragNewNode({
        type: NodeType.GROUP,
        targetPosition: { x: 100, y: 100 },
      });
      await palette.dragNewNode({
        type: NodeType.GROUP,
        targetPosition: { x: 300, y: 300 },
      });

      await diagram.resetFocus();

      await expect(diagram.get()).toHaveScreenshot("add-2-group-nodes-from-palette.png");
    });
  });

  test.describe("Group operations", () => {
    test("should delete group", async ({ palette, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 300, y: 300 } });

      await page.keyboard.press("Delete");

      const process = await jsonModel.getProcess();
      expect(process.artifact?.length || 0).toBe(0);
    });

    test("should move group to new position", async ({ palette, page, diagram }) => {
      await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 300, y: 300 } });

      const group = page.locator(".kie-bpmn-editor--group-node").first();
      await expect(group).toBeAttached();

      await group.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const groupBox = await group.boundingBox();
      if (!groupBox) {
        throw new Error("Group bounding box not found");
      }

      await group.dragTo(diagram.get(), {
        sourcePosition: { x: 20, y: groupBox.height / 2 },
        targetPosition: { x: 500, y: 400 },
        force: true,
      });

      const boxAfter = await group.boundingBox();

      expect(boxAfter?.x).not.toBe(groupBox?.x);
      expect(boxAfter?.y).not.toBe(groupBox?.y);
    });

    //   test("should rename group", async ({ palette, nodes, jsonModel, page }) => {
    //     await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 300, y: 300 } });

    //     // Groups may have a default name or empty name, find the group element
    //     const group = page.locator('[data-nodetype="group"]').first();
    //     await group.click();
    //     await page.keyboard.press("Enter");
    //     await page.keyboard.type("Payment Group");
    //     await page.keyboard.press("Escape");

    //     // Verify in JSON model
    //     const process = await jsonModel.getProcess();
    //     const groupArtifact = process.artifact?.find((a: any) => a.__$$element === "group");
    //     expect(groupArtifact?.["@_categoryValueRef"]).toBeDefined();
    //   });

    //   test("should resize group", async ({ palette, page }) => {
    //     await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 300, y: 300 } });

    //     const group = page.locator('[data-nodetype="group"]').first();
    //     const boxBefore = await group.boundingBox();

    //     // Resize by dragging a corner (groups are resizable containers)
    //     if (boxBefore) {
    //       await page.mouse.move(boxBefore.x + boxBefore.width, boxBefore.y + boxBefore.height);
    //       await page.mouse.down();
    //       await page.mouse.move(boxBefore.x + boxBefore.width + 100, boxBefore.y + boxBefore.height + 50);
    //       await page.mouse.up();
    //     }

    //     const boxAfter = await group.boundingBox();

    //     // Verify size changed
    //     expect(boxAfter?.width).toBeGreaterThan(boxBefore?.width ?? 0);
    //     expect(boxAfter?.height).toBeGreaterThan(boxBefore?.height ?? 0);
    //   });

    //   test("should copy and paste group", async ({ palette, jsonModel, page }) => {
    //     await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 300, y: 300 } });

    //     const group = page.locator('[data-nodetype="group"]').first();
    //     await group.click();

    //     await page.keyboard.press("ControlOrMeta+C");
    //     await page.keyboard.press("ControlOrMeta+V");

    //     const process = await jsonModel.getProcess();
    //     const groups = process.artifact?.filter((a: any) => a.__$$element === "group");
    //     expect(groups?.length).toBe(2);
    //   });
  });
});
