/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Page, Locator } from "@playwright/test";
import { Diagram } from "../diagram";

export abstract class PropertiesPanelBase {
  constructor(
    public diagram: Diagram,
    public page: Page
  ) {}

  public panel() {
    return this.page.getByTestId("kie-tools--bpmn-editor--properties-panel-container");
  }

  public async open() {
    const isPanelOpen = await this.panel().isVisible();
    if (isPanelOpen) {
      return;
    }

    const propertiesButton = this.page.getByTitle("Properties");
    const isButtonVisible = await propertiesButton.isVisible();
    if (isButtonVisible) {
      await propertiesButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  public async close() {
    const closeButton = this.panel().getByTitle("Close");
    const isVisible = await closeButton.isVisible();
    if (isVisible) {
      await closeButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  public async isOpen(): Promise<boolean> {
    return await this.panel().isVisible();
  }
}
