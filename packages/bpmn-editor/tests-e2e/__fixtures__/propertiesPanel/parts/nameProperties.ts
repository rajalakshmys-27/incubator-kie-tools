/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Locator, Page } from "@playwright/test";

export class NameProperties {
  constructor(
    public panel: Locator,
    public page: Page
  ) {}

  public async setName(args: { newName: string }) {
    const nameInput = this.panel.getByPlaceholder("Enter a name...");
    await nameInput.fill(args.newName);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  public async getName(): Promise<string> {
    const nameInput = this.panel.getByPlaceholder("Enter a name...");
    return await nameInput.inputValue();
  }

  public async clearName() {
    const nameInput = this.panel.getByPlaceholder("Enter a name...");
    await nameInput.clear();
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }
}
