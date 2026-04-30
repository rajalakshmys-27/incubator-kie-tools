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

import { expect, Page } from "@playwright/test";
import { PropertiesPanelBase } from "./propertiesPanelBase";
import { Diagram } from "../diagram";
import { NameProperties } from "./parts/nameProperties";
import { DocumentationProperties } from "./parts/documentationProperties";

export class IntermediateEventPropertiesPanel extends PropertiesPanelBase {
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

  public async selectEventDefinition(args: { eventType: string }) {
    const selectedNode = this.page
      .locator(".kie-bpmn-editor--intermediate-catch-event-node, .kie-bpmn-editor--intermediate-throw-event-node")
      .first();

    await expect(selectedNode).toBeVisible({ timeout: 5000 });

    const morphingToggle = selectedNode.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = this.page.locator(".kie-bpmn-editor--node-morphing-panel");
    const eventTypeOption = morphingPanel.getByTitle(args.eventType);
    await expect(eventTypeOption).toBeVisible({ timeout: 5000 });
    await eventTypeOption.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  public async setTimerDefinition(args: { type: "date" | "duration" | "cycle"; value: string }) {
    if (args.type === "duration") {
      await this.panel().getByLabel("Fire once after duration").click();
      const valueInput = this.panel().locator("#fire-once-input");
      await valueInput.fill(args.value);
    } else if (args.type === "cycle") {
      await this.panel().getByLabel("Fire multiple times").click();
      const valueInput = this.panel().locator("#fire-multiple-input");
      await valueInput.fill(args.value);
    } else {
      await this.panel().getByLabel("Fire at a specific date").click();
      const valueInput = this.panel().locator("#specific-date-input");
      await valueInput.fill(args.value);
    }

    await this.page.keyboard.press("Enter");
  }

  public async setMessageDefinition(args: { messageName: string }) {
    await this.selectEventDefinition({ eventType: "Message" });

    const messageInput = this.panel().locator('input[role="combobox"]').first();
    await messageInput.click();
    await this.page.keyboard.type(args.messageName);

    const createOption = this.page.getByText(`Create Message "${args.messageName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.messageName, exact: true }).click();
    }
  }

  public async setSignalDefinition(args: {
    signalName: string;
    scope?: "default" | "processInstance" | "project" | "external";
  }) {
    await this.selectEventDefinition({ eventType: "Signal" });

    const signalInput = this.panel().locator('input[role="combobox"]').first();
    await signalInput.click();
    await this.page.keyboard.type(args.signalName);

    const createOption = this.page.getByText(`Create Signal "${args.signalName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.signalName, exact: true }).click();
    }

    if (args.scope) {
      const scopeSelect = this.panel().locator("select").first();
      await scopeSelect.waitFor({ state: "visible", timeout: 10000 });
      await scopeSelect.selectOption(args.scope);
    }
  }

  public async setConditionalExpression(args: { expression: string }) {
    await this.selectEventDefinition({ eventType: "Conditional" });

    const expressionInput = this.panel().locator("textarea").first();
    await expressionInput.waitFor({ state: "visible", timeout: 10000 });
    await expressionInput.fill(args.expression);
    await expressionInput.blur();
  }

  public async setLinkDefinition(args: { linkName: string }) {
    await this.selectEventDefinition({ eventType: "Link" });

    const linkInput = this.panel().locator('input[type="text"]').first();
    await linkInput.waitFor({ state: "visible", timeout: 10000 });
    await linkInput.fill(args.linkName);
    await linkInput.blur();
  }

  public async setErrorDefinition(args: { errorName: string; errorCode?: string }) {
    await this.selectEventDefinition({ eventType: "Error" });

    const errorInput = this.panel().locator('input[role="combobox"]').first();
    await errorInput.click();
    await this.page.keyboard.type(args.errorName);

    const createOption = this.page.getByText(`Create Error "${args.errorName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.errorName, exact: true }).click();
    }

    if (args.errorCode) {
      const errorCodeInput = this.panel().locator('input[type="text"]').nth(1);
      await errorCodeInput.fill(args.errorCode);
      await errorCodeInput.blur();
    }
  }

  public async setEscalationDefinition(args: { escalationName: string; escalationCode?: string }) {
    await this.selectEventDefinition({ eventType: "Escalation" });

    const escalationInput = this.panel().locator('input[role="combobox"]').first();
    await escalationInput.click();
    await this.page.keyboard.type(args.escalationName);

    const createOption = this.page.getByText(`Create Escalation "${args.escalationName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.escalationName, exact: true }).click();
    }

    if (args.escalationCode) {
      const escalationCodeInput = this.panel().locator('input[type="text"]').nth(1);
      await escalationCodeInput.fill(args.escalationCode);
      await escalationCodeInput.blur();
    }
  }

  public async setCompensationDefinition(args: { activityRef?: string }) {
    await this.selectEventDefinition({ eventType: "Compensation" });

    if (args.activityRef) {
      const activityInput = this.panel().locator('input[role="combobox"]').first();
      await activityInput.click();
      await this.page.keyboard.type(args.activityRef);

      const option = this.page.getByRole("option", { name: args.activityRef, exact: true });
      if (await option.isVisible().catch(() => false)) {
        await option.click();
      }
    }
  }

  public async setCancelActivity(args: { cancelActivity: boolean }) {
    const cancelCheckbox = this.panel().locator('input[type="checkbox"][id*="cancel-activity"]');
    const isChecked = await cancelCheckbox.isChecked();

    if (isChecked !== args.cancelActivity) {
      await cancelCheckbox.click();
    }
  }

  public async getCancelActivity(): Promise<boolean> {
    const cancelCheckbox = this.panel().locator('input[type="checkbox"][id*="cancel-activity"]');
    return await cancelCheckbox.isChecked();
  }
}
