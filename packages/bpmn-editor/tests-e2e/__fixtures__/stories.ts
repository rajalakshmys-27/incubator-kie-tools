/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Page } from "@playwright/test";

export class Stories {
  constructor(
    public page: Page,
    public baseURL?: string
  ) {}

  public async openEmpty() {
    await this.page.goto(`${this.baseURL}/iframe.html?args=&id=misc-empty--empty&viewMode=story`);
  }

  public async openEmptyWithLocale(locale: string) {
    await this.page.goto(`${this.baseURL}/iframe.html?args=locale:${locale}&id=misc-empty--empty&viewMode=story`);
  }
}
