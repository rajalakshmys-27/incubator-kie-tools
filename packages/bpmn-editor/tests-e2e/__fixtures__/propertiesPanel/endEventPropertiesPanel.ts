/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
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

  private async morphToEventType(args: { endEventLocator: Locator; eventType: string }) {
    const box = await args.endEventLocator.boundingBox();
    if (!box) throw new Error("End Event not visible");

    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const morphingToggle = args.endEventLocator.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await morphingToggle.waitFor({ state: "visible", timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingOption = this.page.getByTitle(args.eventType);
    await morphingOption.waitFor({ state: "visible", timeout: 5000 });
    await morphingOption.click({ force: true });
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
  }

  public async setMessageDefinition(args: { messageName: string; endEventLocator: Locator }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Message" });

    const messageInput = this.panel().locator('input[role="combobox"]').first();
    await messageInput.waitFor({ state: "visible", timeout: 10000 });
    await messageInput.click();
    await this.page.keyboard.type(args.messageName);

    const createOption = this.page.getByText(`Create Message "${args.messageName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.messageName, exact: true }).click();
    }
  }

  public async setSignalDefinition(args: { signalName: string; endEventLocator: Locator }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Signal" });

    const signalInput = this.panel().locator('input[role="combobox"]').first();
    await signalInput.waitFor({ state: "visible", timeout: 10000 });
    await signalInput.click();
    await this.page.keyboard.type(args.signalName);

    const createOption = this.page.getByText(`Create Signal "${args.signalName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.signalName, exact: true }).click();
    }
  }

  public async getSignalName(): Promise<string> {
    const signalInput = this.panel().locator('input[role="combobox"]').first();
    await signalInput.waitFor({ state: "visible", timeout: 5000 });
    return (await signalInput.inputValue()) || "";
  }

  public async setErrorDefinition(args: { errorName: string; errorCode?: string; endEventLocator: Locator }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Error" });

    const errorInput = this.panel().locator('input[role="combobox"]').first();
    await errorInput.waitFor({ state: "visible", timeout: 10000 });
    await errorInput.click();
    await this.page.keyboard.type(args.errorName);

    const createOption = this.page.getByText(`Create Error "${args.errorName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.errorName, exact: true }).click();
    }

    if (args.errorCode) {
      const errorCodeInput = this.panel().getByPlaceholder("Error code");
      const isVisible = await errorCodeInput.isVisible().catch(() => false);
      if (isVisible) {
        await errorCodeInput.fill(args.errorCode);
        await errorCodeInput.blur();
      }
    }
  }

  public async getErrorName(): Promise<string> {
    const errorInput = this.panel().locator('input[role="combobox"]').first();
    await errorInput.waitFor({ state: "visible", timeout: 5000 });
    return (await errorInput.inputValue()) || "";
  }

  public async getErrorCode(): Promise<string> {
    const errorCodeInput = this.panel().getByPlaceholder("Error code");
    const isVisible = await errorCodeInput.isVisible().catch(() => false);
    if (!isVisible) return "";
    return (await errorCodeInput.inputValue()) || "";
  }

  public async setEscalationDefinition(args: {
    escalationName: string;
    escalationCode?: string;
    endEventLocator: Locator;
  }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Escalation" });

    const escalationInput = this.panel().locator('input[role="combobox"]').first();
    await escalationInput.waitFor({ state: "visible", timeout: 10000 });
    await escalationInput.click();
    await this.page.keyboard.type(args.escalationName);

    const createOption = this.page.getByText(`Create Escalation "${args.escalationName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.escalationName, exact: true }).click();
    }

    if (args.escalationCode) {
      const escalationCodeInput = this.panel().getByPlaceholder("Escalation code");
      const isVisible = await escalationCodeInput.isVisible().catch(() => false);
      if (isVisible) {
        await escalationCodeInput.fill(args.escalationCode);
        await escalationCodeInput.blur();
      }
    }
  }

  public async getEscalationName(): Promise<string> {
    const escalationInput = this.panel().locator('input[role="combobox"]').first();
    await escalationInput.waitFor({ state: "visible", timeout: 5000 });
    return (await escalationInput.inputValue()) || "";
  }

  public async getEscalationCode(): Promise<string> {
    const escalationCodeInput = this.panel().getByPlaceholder("Escalation code");
    const isVisible = await escalationCodeInput.isVisible().catch(() => false);
    if (!isVisible) return "";
    return (await escalationCodeInput.inputValue()) || "";
  }

  public async setCompensationDefinition(args: { endEventLocator: Locator }) {
    await this.morphToEventType({ endEventLocator: args.endEventLocator, eventType: "Compensation" });
  }

  public async isCompensationDefinitionSet(): Promise<boolean> {
    const compensationSection = this.panel().getByText("Compensation");
    return await compensationSection.isVisible().catch(() => false);
  }
}
