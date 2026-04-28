/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Page } from "@playwright/test";

const VIEWPORT_OFFSET_X = 100;
const VIEWPORT_OFFSET_Y = 100;

export class Diagram {
  constructor(public page: Page) {}

  public get() {
    return this.page.getByTestId("kie-bpmn-editor--diagram-container");
  }

  public async dblclick(position: { x: number; y: number }) {
    return this.get().dblclick({ position: { x: position.x + VIEWPORT_OFFSET_X, y: position.y + VIEWPORT_OFFSET_Y } });
  }

  public async resetFocus() {
    return this.get().click({ position: { x: 0, y: 0 } });
  }

  public async select(args: { startPosition: { x: number; y: number }; endPosition: { x: number; y: number } }) {
    await this.page.mouse.move(args.startPosition.x, args.startPosition.y);
    await this.page.mouse.down();
    await this.page.mouse.move(args.endPosition.x, args.endPosition.y);
    await this.page.mouse.up();
  }

  public async zoomIn(args: { clicks: number }) {
    await this.get().getByTitle("zoom in").click({ clickCount: args.clicks });
  }

  public async zoomOut(args: { clicks: number }) {
    await this.get().getByLabel("zoom out").click({ clickCount: args.clicks });
  }

  public async fitView() {
    await this.get().getByLabel("fit view").click();
  }

  public async pan(args: { startPosition: { x: number; y: number }; endPosition: { x: number; y: number } }) {
    await this.page.mouse.move(args.startPosition.x, args.startPosition.y);
    await this.page.mouse.down({ button: "middle" });
    await this.page.mouse.move(args.endPosition.x, args.endPosition.y);
    await this.page.mouse.up({ button: "middle" });
  }
}
