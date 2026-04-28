/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Page } from "@playwright/test";

export class Editor {
  constructor(
    public page: Page,
    public baseURL?: string
  ) {}

  public async open() {
    await this.page.goto(`${this.baseURL}/iframe.html?args=&id=misc-empty--empty&viewMode=story`);

    const processIdInput = this.page.getByPlaceholder("e.g., hiring");
    await processIdInput.waitFor({ state: "visible" });
    await processIdInput.fill("test");

    await this.page.getByRole("button", { name: "Start Modeling" }).click();
    await this.page.locator(".react-flow").waitFor({ state: "visible" });
  }

  public async openWithLocale(locale: string) {
    await this.page.goto(`${this.baseURL}/iframe.html?args=locale:${locale}&id=misc-empty--empty&viewMode=story`);

    const processIdInput = this.page.getByPlaceholder("e.g., hiring");
    await processIdInput.waitFor({ state: "visible" });
    await processIdInput.fill("test");

    await this.page.getByRole("button", { name: "Start Modeling" }).click();
    await this.page.locator(".react-flow").waitFor({ state: "visible" });
  }

  public async openCustomTasks() {
    await this.page.goto(`${this.baseURL}/iframe.html?args=&id=features-customtasks--custom-tasks&viewMode=story`);
    await this.page.locator(".react-flow").waitFor({ state: "visible" });
    await this.page.locator(".kie-bpmn-editor--palette-custom-tasks-button").waitFor({ state: "visible" });
    await this.page.waitForTimeout(1000);
  }
}
