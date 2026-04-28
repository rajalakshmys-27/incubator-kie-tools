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

test.describe("Add node - Text Annotation", () => {
  test.describe("Add from palette", () => {
    test("should add Text Annotation node from palette", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 100, y: 100 } });

      await expect(diagram.get()).toHaveScreenshot("add-text-annotation-node-from-palette.png");
    });

    test("should add two Text Annotation nodes from palette in a row", async ({ palette, diagram }) => {
      await palette.dragNewNode({
        type: NodeType.TEXT_ANNOTATION,
        targetPosition: { x: 100, y: 100 },
      });
      await palette.dragNewNode({
        type: NodeType.TEXT_ANNOTATION,
        targetPosition: { x: 300, y: 300 },
      });

      await diagram.resetFocus();

      await expect(diagram.get()).toHaveScreenshot("add-2-text-annotation-nodes-from-palette.png");
    });
  });

  test.describe("Text Annotation operations", () => {
    test("should delete text annotation", async ({ palette, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 300, y: 300 } });

      await page.keyboard.press("Delete");

      const process = await jsonModel.getProcess();
      expect(process.artifact?.length || 0).toBe(0);
    });

    //   test("should move text annotation to new position", async ({ palette, page }) => {
    //     await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 300, y: 300 } });

    //     const textAnnotation = page.locator('[data-nodetype="textAnnotation"]').first();
    //     const boxBefore = await textAnnotation.boundingBox();

    //     // Move text annotation to new position
    //     await textAnnotation.dragTo(textAnnotation, {
    //       targetPosition: { x: 500, y: 400 },
    //     });

    //     const boxAfter = await textAnnotation.boundingBox();

    //     // Verify position changed
    //     expect(boxAfter?.x).not.toBe(boxBefore?.x);
    //     expect(boxAfter?.y).not.toBe(boxBefore?.y);
    //   });

    //   test("should resize text annotation", async ({ palette, page }) => {
    //     await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 300, y: 300 } });

    //     const textAnnotation = page.locator('[data-nodetype="textAnnotation"]').first();
    //     const boxBefore = await textAnnotation.boundingBox();

    //     // Resize by dragging a corner
    //     if (boxBefore) {
    //       await page.mouse.move(boxBefore.x + boxBefore.width, boxBefore.y + boxBefore.height);
    //       await page.mouse.down();
    //       await page.mouse.move(boxBefore.x + boxBefore.width + 100, boxBefore.y + boxBefore.height + 50);
    //       await page.mouse.up();
    //     }

    //     const boxAfter = await textAnnotation.boundingBox();

    //     // Verify size changed
    //     expect(boxAfter?.width).toBeGreaterThan(boxBefore?.width ?? 0);
    //     expect(boxAfter?.height).toBeGreaterThan(boxBefore?.height ?? 0);
    //   });

    //   test("should copy and paste text annotation", async ({ palette, jsonModel, page }) => {
    //     await palette.dragNewNode({ type: NodeType.TEXT_ANNOTATION, targetPosition: { x: 300, y: 300 } });

    //     const textAnnotation = page.locator('[data-nodetype="textAnnotation"]').first();
    //     await textAnnotation.click();

    //     await page.keyboard.press("ControlOrMeta+C");
    //     await page.keyboard.press("ControlOrMeta+V");

    //     const process = await jsonModel.getProcess();
    //     const annotations = process.artifact?.filter((a: any) => a.__$$element === "textAnnotation");
    //     expect(annotations?.length).toBe(2);
    //   });
  });
});
