/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Page } from "@playwright/test";
import { PropertiesPanelBase } from "./propertiesPanelBase";
import { Diagram } from "../diagram";
import { NameProperties } from "./parts/nameProperties";
import { DocumentationProperties } from "./parts/documentationProperties";

export class DataObjectPropertiesPanel extends PropertiesPanelBase {
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

  public async setItemSubjectRef(args: { itemSubjectRef: string }) {
    const dataTypeInput = this.panel().locator('input[role="combobox"]').first();

    await dataTypeInput.click();
    await this.page.keyboard.type(args.itemSubjectRef);
    await this.page.waitForTimeout(300);

    const createOption = this.page.getByText(`Create Data Type "${args.itemSubjectRef}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.itemSubjectRef, exact: true }).click();
    }

    await this.page.waitForTimeout(300);
  }

  public async getItemSubjectRef(): Promise<string> {
    const dataTypeInput = this.panel().locator('input[role="combobox"]').first();
    return (await dataTypeInput.inputValue()).trim();
  }
}
