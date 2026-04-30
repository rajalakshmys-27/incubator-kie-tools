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

export class StartEventPropertiesPanel extends PropertiesPanelBase {
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

  private async morphToEventType(args: { startEventLocator: Locator; eventType: string }) {
    const box = await args.startEventLocator.boundingBox();
    if (!box) throw new Error("Start Event not visible");

    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.waitForTimeout(300);

    const morphingToggle = args.startEventLocator.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
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

  public async setMessageDefinition(args: { messageName: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Message" });

    const messageInput = this.panel().locator('input[type="text"]').first();
    await messageInput.waitFor({ state: "visible", timeout: 10000 });
    await messageInput.fill(args.messageName);
    await this.page.keyboard.press("Enter");
  }

  public async setSignalDefinition(args: { signalName: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Signal" });

    const signalInput = this.panel().locator('input[type="text"]').first();
    await signalInput.waitFor({ state: "visible", timeout: 10000 });
    await signalInput.fill(args.signalName);
    await this.page.keyboard.press("Enter");
  }

  public async setConditionalExpression(args: { expression: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Conditional" });

    const expressionInput = this.panel().locator("textarea").first();
    await expressionInput.waitFor({ state: "visible", timeout: 10000 });
    await expressionInput.fill(args.expression);
    await expressionInput.blur();
  }

  public async setErrorDefinition(args: { errorName: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Error" });

    const errorInput = this.panel().locator('input[type="text"]').first();
    await errorInput.waitFor({ state: "visible", timeout: 10000 });
    await errorInput.fill(args.errorName);
    await this.page.keyboard.press("Enter");
  }

  public async setEscalationDefinition(args: { escalationName: string; startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Escalation" });

    const escalationInput = this.panel().locator('input[type="text"]').first();
    await escalationInput.waitFor({ state: "visible", timeout: 10000 });
    await escalationInput.fill(args.escalationName);
    await this.page.keyboard.press("Enter");
  }

  public async setCompensationDefinition(args: { startEventLocator: Locator }) {
    await this.morphToEventType({ startEventLocator: args.startEventLocator, eventType: "Compensation" });
  }
}
