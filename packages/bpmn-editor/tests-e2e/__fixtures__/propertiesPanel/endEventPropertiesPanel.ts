/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Page, Locator } from "@playwright/test";
import { PropertiesPanelBase } from "./propertiesPanelBase";
import { Diagram } from "../diagram";
import { NameProperties } from "./parts/nameProperties";
import { DocumentationProperties } from "./parts/documentationProperties";

export class EndEventPropertiesPanel extends PropertiesPanelBase {
  private nameProperties: NameProperties;
  private documentationProperties: DocumentationProperties;

  constructor(
    public diagram: Diagram,
    public page: Page
  ) {
    super(diagram, page);
    this.nameProperties = new NameProperties(this.panel(), page);
    this.documentationProperties = new DocumentationProperties(this.panel(), page);
  }

  /**
   * Morphs the end event to a specific event type using the morphing panel.
   * This must be called before setting event-specific properties.
   */
  private async morphToEventType(args: { endEventLocator: Locator; eventType: string }) {
    const box = await args.endEventLocator.boundingBox();
    if (!box) throw new Error("End Event not visible");

    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.waitForTimeout(300);

    const morphingToggle = args.endEventLocator.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await morphingToggle.waitFor({ state: "visible", timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingOption = this.page.getByTitle(args.eventType);
    await morphingOption.waitFor({ state: "visible", timeout: 5000 });
    await morphingOption.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  public async setName(args: { newName: string }) {
    await this.nameProperties.setName({ ...args });
  }

  public async getName(): Promise<string> {
    return await this.nameProperties.getName();
  }

  public async setDocumentation(args: { newDocumentation: string }) {
    await this.documentationProperties.setDocumentation({ ...args });
  }

  public async getDocumentation(): Promise<string> {
    return await this.documentationProperties.getDocumentation();
  }

  public async setTerminateDefinition(args: { endEventLocator: Locator }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Terminate" });
    await this.page.waitForTimeout(500);
  }

  public async setMessageDefinition(args: { messageName: string; endEventLocator: Locator }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Message" });

    const messageInput = this.panel().locator('input[type="text"]').first();
    await messageInput.waitFor({ state: "visible", timeout: 10000 });
    await messageInput.fill(args.messageName);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  public async setSignalDefinition(args: { signalName: string; endEventLocator: Locator }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Signal" });

    const signalInput = this.panel().locator('input[type="text"]').first();
    await signalInput.waitFor({ state: "visible", timeout: 10000 });
    await signalInput.fill(args.signalName);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  public async setErrorDefinition(args: { errorName: string; errorCode?: string; endEventLocator: Locator }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Error" });

    const errorInput = this.panel().locator('input[type="text"]').first();
    await errorInput.waitFor({ state: "visible", timeout: 10000 });
    await errorInput.fill(args.errorName);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);

    if (args.errorCode) {
      const errorCodeInput = this.panel().getByPlaceholder("Error code");
      const isVisible = await errorCodeInput.isVisible().catch(() => false);
      if (isVisible) {
        await errorCodeInput.fill(args.errorCode);
        await errorCodeInput.blur();
        await this.page.waitForTimeout(300);
      }
    }
  }

  public async setEscalationDefinition(args: {
    escalationName: string;
    escalationCode?: string;
    endEventLocator: Locator;
  }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Escalation" });

    const escalationInput = this.panel().locator('input[type="text"]').first();
    await escalationInput.waitFor({ state: "visible", timeout: 10000 });
    await escalationInput.fill(args.escalationName);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);

    if (args.escalationCode) {
      const escalationCodeInput = this.panel().getByPlaceholder("Escalation code");
      const isVisible = await escalationCodeInput.isVisible().catch(() => false);
      if (isVisible) {
        await escalationCodeInput.fill(args.escalationCode);
        await escalationCodeInput.blur();
        await this.page.waitForTimeout(300);
      }
    }
  }

  public async setCompensationDefinition(args: { endEventLocator: Locator }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Compensation" });
    await this.page.waitForTimeout(500);
  }
}
