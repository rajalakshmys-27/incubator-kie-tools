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

import { Page } from "@playwright/test";
import { PropertiesPanelBase } from "./propertiesPanelBase";
import { Diagram } from "../diagram";
import { NameProperties } from "./parts/nameProperties";
import { DocumentationProperties } from "./parts/documentationProperties";

export class SequenceFlowPropertiesPanel extends PropertiesPanelBase {
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

  public async setConditionExpression(args: { expression: string }) {
    const expressionInput = this.panel().getByPlaceholder("Enter code...");
    await expressionInput.waitFor({ state: "visible", timeout: 10000 });
    await expressionInput.fill(args.expression);
    await expressionInput.blur();
  }

  public async getConditionExpression(): Promise<string> {
    const expressionInput = this.panel().getByPlaceholder("Enter code...");
    return await expressionInput.inputValue();
  }

  public async setPriority(args: { priority: string }) {
    const priorityInput = this.panel().locator('input[type="text"]').first();
    await priorityInput.waitFor({ state: "visible", timeout: 10000 });
    await priorityInput.fill(args.priority);
    await priorityInput.blur();
  }

  public async getPriority(): Promise<string> {
    const priorityInput = this.panel().locator('input[type="text"]').first();
    return await priorityInput.inputValue();
  }

  public async setImmediate(args: { immediate: boolean }) {
    const immediateCheckbox = this.panel().locator('input[type="checkbox"][id*="immediate"]');
    const isChecked = await immediateCheckbox.isChecked();

    if (isChecked !== args.immediate) {
      await immediateCheckbox.click();
    }
  }

  public async getImmediate(): Promise<boolean> {
    const immediateCheckbox = this.panel().locator('input[type="checkbox"][id*="immediate"]');
    return await immediateCheckbox.isChecked();
  }
}
