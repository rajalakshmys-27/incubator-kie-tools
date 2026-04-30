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

export class SubProcessPropertiesPanel extends PropertiesPanelBase {
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

  public async setMultiInstance(args: { type: "parallel" | "sequential" }) {
    const executionModeButton = this.panel().getByRole("button", {
      name: args.type === "parallel" ? "Parallel" : "Sequential",
      exact: true,
    });
    await executionModeButton.waitFor({ state: "visible", timeout: 10000 });
    await executionModeButton.click();
  }

  public async setCollectionExpression(args: { expression: string }) {
    const collectionInputFormGroup = this.panel()
      .locator("div.pf-v5-c-form__group")
      .filter({ hasText: /Collection input/i });
    const collectionInput = collectionInputFormGroup.locator('input[type="text"]').first();
    await collectionInput.waitFor({ state: "visible", timeout: 10000 });
    await collectionInput.fill(args.expression);
    await this.page.keyboard.press("Enter");
  }

  public async setCompletionCondition(args: { condition: string }) {
    const conditionTextarea = this.panel().getByLabel("Completion condition");
    await conditionTextarea.waitFor({ state: "visible", timeout: 10000 });
    await conditionTextarea.fill(args.condition);
    await conditionTextarea.blur();
  }

  public async setAdHocOrdering(args: { ordering: "Parallel" | "Sequential" }) {
    const orderingFormGroup = this.panel()
      .locator("div.pf-v5-c-form__group")
      .filter({ hasText: /Ad-hoc ordering/i });
    const orderingSelect = orderingFormGroup.locator("select").first();
    await orderingSelect.waitFor({ state: "visible", timeout: 10000 });
    await orderingSelect.selectOption(args.ordering);
  }

  public async setAdHocCompletionCondition(args: { condition: string }) {
    const completionConditionFormGroup = this.panel()
      .locator("div.pf-v5-c-form__group")
      .filter({ hasText: /Ad-hoc completion condition/i });
    const conditionTextarea = completionConditionFormGroup.locator("textarea").first();
    await conditionTextarea.waitFor({ state: "visible", timeout: 10000 });
    await conditionTextarea.fill(args.condition);
    await conditionTextarea.blur();
  }
  private async openMorphingPanel() {
    const selectedSubProcess = this.page.locator(".kie-bpmn-editor--selected-sub-process-node").first();
    await selectedSubProcess.waitFor({ state: "attached", timeout: 5000 });

    const box = await selectedSubProcess.boundingBox();
    if (!box) throw new Error("Sub-Process not visible");

    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.waitForTimeout(300);

    const morphingToggle = selectedSubProcess.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await morphingToggle.waitFor({ state: "visible", timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = this.page.locator(".kie-bpmn-editor--node-morphing-panel");
    await morphingPanel.waitFor({ state: "visible", timeout: 5000 });

    return morphingPanel;
  }

  public async morphToMultiInstanceSubProcess() {
    const morphingPanel = await this.openMorphingPanel();
    const multiInstanceOption = morphingPanel.getByTitle("Multi-instance");
    await multiInstanceOption.waitFor({ state: "visible", timeout: 5000 });
    await multiInstanceOption.click({ force: true });
    await this.page.waitForTimeout(500);
  }

  public async morphToAdHocSubProcess() {
    const morphingPanel = await this.openMorphingPanel();
    const adHocOption = morphingPanel.getByTitle("Ad-hoc");
    await adHocOption.waitFor({ state: "visible", timeout: 5000 });
    await adHocOption.click({ force: true });
    await this.page.waitForTimeout(500);
  }
}
