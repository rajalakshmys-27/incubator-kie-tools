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
import { Nodes } from "../nodes";
import { NameProperties } from "./parts/nameProperties";
import { DocumentationProperties } from "./parts/documentationProperties";

export class StartEventPropertiesPanel extends PropertiesPanelBase {
  private nameProperties: NameProperties;
  private documentationProperties: DocumentationProperties;

  constructor(
    public diagram: Diagram,
    public page: Page,
    public nodes: Nodes
  ) {
    super(diagram, page);
    this.nameProperties = new NameProperties(this.panel(), page);
    this.documentationProperties = new DocumentationProperties(this.panel(), page);
  }

  private async morphToEventType(args: { startEventLocator: Locator; eventType: string }) {
    await this.nodes.morphNode({
      nodeLocator: args.startEventLocator,
      targetMorphType: args.eventType,
    });
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

  public async setInterrupting(args: { isInterrupting: boolean }) {
    const checkbox = this.panel().locator('input[id="cancel-activity"]');
    const isChecked = await checkbox.isChecked();
    if (isChecked !== args.isInterrupting) {
      await checkbox.click();
    }
  }

  public async getInterrupting(): Promise<boolean> {
    const checkbox = this.panel().locator('input[id="cancel-activity"]');
    return await checkbox.isChecked();
  }

  public async isInterruptingVisible(): Promise<boolean> {
    const checkbox = this.panel().locator('input[id="cancel-activity"]');
    return await checkbox.isVisible();
  }

  public async setTimerDefinition(args: {
    type: "date" | "duration" | "cycle";
    value: string;
    startEventLocator: Locator;
  }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Timer" });

    const timerTypeMap = {
      date: { label: "Fire at a specific date", placeholder: "date value" },
      duration: { label: "Fire once after duration", placeholder: "duration" },
      cycle: { label: "Fire multiple times", placeholder: "time cycle" },
    };

    const { label, placeholder } = timerTypeMap[args.type];

    const radioButton = this.panel().getByLabel(label);
    await radioButton.waitFor({ state: "visible", timeout: 5000 });
    await radioButton.click();

    const valueInput = this.panel().locator(`input[placeholder*="${placeholder}"]`);
    await valueInput.waitFor({ state: "visible", timeout: 5000 });
    await valueInput.fill(args.value);
    await valueInput.blur();
  }

  public async getTimerDefinition(): Promise<{ type: string; value: string }> {
    const dateRadio = this.panel().getByLabel("Fire at a specific date");
    const durationRadio = this.panel().getByLabel("Fire once after duration");
    const cycleRadio = this.panel().getByLabel("Fire multiple times");

    let type = "";
    let placeholder = "";

    if (await dateRadio.isChecked()) {
      type = "date";
      placeholder = "date value";
    } else if (await durationRadio.isChecked()) {
      type = "duration";
      placeholder = "duration";
    } else if (await cycleRadio.isChecked()) {
      type = "cycle";
      placeholder = "time cycle";
    }

    const valueInput = this.panel().locator(`input[placeholder*="${placeholder}"]`);
    await valueInput.waitFor({ state: "visible", timeout: 5000 });
    const value = (await valueInput.inputValue()) || "";

    return { type, value };
  }

  public async setMessageDefinition(args: { messageName: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Message" });

    await this.panel().getByRole("combobox").first().click();
    await this.page.keyboard.type(args.messageName);

    const createOption = this.page.getByText(`Create Message "${args.messageName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.messageName, exact: true }).click();
    }
  }

  public async setSignalDefinition(args: { signalName: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Signal" });

    await this.panel().getByRole("combobox").first().click();
    await this.page.keyboard.type(args.signalName);

    const createOption = this.page.getByText(`Create Signal "${args.signalName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.signalName, exact: true }).click();
    }
  }

  public async setConditionalExpression(args: { expression: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Conditional" });

    const expressionInput = this.panel().locator("textarea").first();
    await expressionInput.waitFor({ state: "visible", timeout: 10000 });
    await expressionInput.fill(args.expression);
    await expressionInput.blur();
  }

  public async getConditionalExpression(): Promise<string> {
    const expressionInput = this.panel().locator("textarea").first();
    await expressionInput.waitFor({ state: "visible", timeout: 5000 });
    return (await expressionInput.inputValue()) || "";
  }

  public async setErrorDefinition(args: { errorName: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Error" });

    await this.panel().getByRole("combobox").first().click();
    await this.page.keyboard.type(args.errorName);

    const createOption = this.page.getByText(`Create Error "${args.errorName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.errorName, exact: true }).click();
    }
  }

  public async getErrorName(): Promise<string> {
    const errorInput = this.panel().getByRole("combobox").first();
    await errorInput.waitFor({ state: "visible", timeout: 5000 });
    return (await errorInput.inputValue()) || "";
  }

  public async setEscalationDefinition(args: { escalationName: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Escalation" });

    await this.panel().getByRole("combobox").first().click();
    await this.page.keyboard.type(args.escalationName);

    const createOption = this.page.getByText(`Create Escalation "${args.escalationName}"`, { exact: true });
    if (await createOption.isVisible().catch(() => false)) {
      await createOption.click();
    } else {
      await this.page.getByRole("option", { name: args.escalationName, exact: true }).click();
    }
  }

  public async getEscalationName(): Promise<string> {
    const escalationInput = this.panel().getByRole("combobox").first();
    await escalationInput.waitFor({ state: "visible", timeout: 5000 });
    return (await escalationInput.inputValue()) || "";
  }

  public async setCompensationDefinition(args: { startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Compensation" });
  }

  public async isCompensationDefinitionSet(): Promise<boolean> {
    return await this.panel()
      .isVisible()
      .catch(() => false);
  }
}
