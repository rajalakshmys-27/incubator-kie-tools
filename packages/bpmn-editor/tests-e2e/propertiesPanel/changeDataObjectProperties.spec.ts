/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test, expect } from "../__fixtures__/base";
import { DefaultNodeName, NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor, page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await editor.open();
});

test.describe("Change Properties - Data Object", () => {
  test.beforeEach(async ({ palette, nodes, page }) => {
    await palette.dragNewNode({ type: NodeType.DATA_OBJECT, targetPosition: { x: 100, y: 100 } });

    const dataObject = nodes.get({ name: DefaultNodeName.DATA_OBJECT });
    await expect(dataObject).toBeAttached();

    await dataObject.click();
    await page.waitForTimeout(500);
  });

  test("should change the Data Object name", async ({ dataObjectPropertiesPanel, page }) => {
    await dataObjectPropertiesPanel.setName({ newName: "Customer Data" });

    await page.waitForTimeout(300);

    expect(await dataObjectPropertiesPanel.getName()).toBe("Customer Data");
    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("data-object-name-changed.png");
  });

  test("should change the Data Object documentation", async ({ dataObjectPropertiesPanel, page }) => {
    await dataObjectPropertiesPanel.setDocumentation({
      newDocumentation: "Contains customer information for processing",
    });

    await page.waitForTimeout(300);

    expect(await dataObjectPropertiesPanel.getDocumentation()).toBe("Contains customer information for processing");
  });

  test("should set item subject reference", async ({ dataObjectPropertiesPanel, page }) => {
    await dataObjectPropertiesPanel.setItemSubjectRef({ itemSubjectRef: "tCustomer" });

    await page.waitForTimeout(300);

    expect(await dataObjectPropertiesPanel.getItemSubjectRef()).toBe("tCustomer");
    await expect(page.locator(".kie-bpmn-editor--root")).toHaveScreenshot("data-object-item-subject-ref.png");
  });
});
