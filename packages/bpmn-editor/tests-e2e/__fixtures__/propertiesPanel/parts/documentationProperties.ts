/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Locator, Page } from "@playwright/test";

export class DocumentationProperties {
  constructor(
    public panel: Locator,
    public page: Page
  ) {}

  public async setDocumentation(args: { newDocumentation: string }) {
    const docTextarea = this.panel.getByPlaceholder("Enter documentation...");
    await docTextarea.fill(args.newDocumentation);
    await docTextarea.blur();
    await this.page.waitForTimeout(300);
  }

  public async getDocumentation(): Promise<string> {
    const docTextarea = this.panel.getByPlaceholder("Enter documentation...");
    const value = await docTextarea.inputValue();
    return value.trim();
  }

  public async clearDocumentation() {
    const docTextarea = this.panel.getByPlaceholder("Enter documentation...");
    await docTextarea.clear();
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }
}
