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

export class TaskPropertiesPanel extends PropertiesPanelBase {
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

  public async setActors(args: { actors: string }) {
    const actorsInput = this.panel().getByPlaceholder(/Enter actors/i);
    await actorsInput.waitFor({ state: "visible", timeout: 5000 });
    await actorsInput.fill(args.actors);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  public async setGroups(args: { groups: string }) {
    const groupsInput = this.panel().getByPlaceholder(/Enter groups/i);
    await groupsInput.waitFor({ state: "visible", timeout: 5000 });
    await groupsInput.fill(args.groups);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  public async setTaskName(args: { taskName: string }) {
    const taskNameInput = this.panel().getByPlaceholder(/Enter task name/i);
    await taskNameInput.waitFor({ state: "visible", timeout: 5000 });
    await taskNameInput.fill(args.taskName);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  public async setImplementation(args: { implementation: string }) {
    const implButton = this.panel().getByRole("button", { name: args.implementation, exact: true });
    await implButton.waitFor({ state: "visible", timeout: 10000 });
    await implButton.click();
    await this.page.waitForTimeout(300);
  }

  public async setInterface(args: { interfaceName: string }) {
    const interfaceInput = this.panel().getByPlaceholder(/Enter an interface/i);
    await interfaceInput.waitFor({ state: "visible", timeout: 10000 });
    await interfaceInput.fill(args.interfaceName);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  public async setOperation(args: { operationName: string }) {
    const operationInput = this.panel().getByPlaceholder(/Enter an operation/i);
    await operationInput.waitFor({ state: "visible", timeout: 10000 });
    await operationInput.fill(args.operationName);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  public async setScript(args: { script: string }) {
    const scriptTextarea = this.panel().getByPlaceholder(/Enter code/i);
    await scriptTextarea.waitFor({ state: "visible", timeout: 10000 });
    await scriptTextarea.fill(args.script);
    await scriptTextarea.blur();
    await this.page.waitForTimeout(300);
  }

  public async setRuleFlowGroup(args: { ruleFlowGroup: string }) {
    const drlButton = this.panel().getByRole("button", { name: "DRL", exact: true });
    await drlButton.waitFor({ state: "visible", timeout: 10000 });
    await drlButton.click();
    await this.page.waitForTimeout(300);

    const ruleFlowInput = this.panel().getByPlaceholder(/Enter a Rule flow group/i);
    await ruleFlowInput.waitFor({ state: "visible", timeout: 10000 });
    await ruleFlowInput.fill(args.ruleFlowGroup);
    await ruleFlowInput.blur();
    await this.page.waitForTimeout(300);
  }

  public async setDmnModel(args: { relativePath: string; namespace: string; modelName: string }) {
    const dmnButton = this.panel().getByRole("button", { name: "DMN", exact: true });
    await dmnButton.waitFor({ state: "visible", timeout: 10000 });
    await dmnButton.click();
    await this.page.waitForTimeout(300);

    const relativePathInput = this.panel().getByPlaceholder(/Enter a relative path/i);
    await relativePathInput.waitFor({ state: "visible", timeout: 10000 });
    await relativePathInput.fill(args.relativePath);
    await relativePathInput.blur();
    await this.page.waitForTimeout(300);

    const namespaceInput = this.panel().getByLabel("DMN model namespace");
    await namespaceInput.waitFor({ state: "visible", timeout: 10000 });
    await namespaceInput.fill(args.namespace);
    await namespaceInput.blur();
    await this.page.waitForTimeout(300);

    const modelNameInput = this.panel().getByLabel("DMN model name", { exact: true });
    await modelNameInput.waitFor({ state: "visible", timeout: 10000 });
    await modelNameInput.fill(args.modelName);
    await modelNameInput.blur();
    await this.page.waitForTimeout(300);
  }

  public async setMultiInstance(args: { type: "parallel" | "sequential" }) {
    const multiInstanceCheckbox = this.panel().locator(
      'input[id="kie-bpmn-editor--properties-panel--multi-instance-checkbox"]'
    );
    await multiInstanceCheckbox.waitFor({ state: "visible", timeout: 10000 });

    const isChecked = await multiInstanceCheckbox.isChecked();
    if (!isChecked) {
      await multiInstanceCheckbox.click();
      await this.page.waitForTimeout(500);
    }

    const executionModeButton = this.panel().getByRole("button", {
      name: args.type === "parallel" ? "Parallel" : "Sequential",
      exact: true,
    });
    await executionModeButton.waitFor({ state: "visible", timeout: 10000 });
    await executionModeButton.click();
    await this.page.waitForTimeout(300);
  }

  public async setCollectionExpression(args: { expression: string }) {
    const collectionFormGroup = this.panel()
      .locator("div.pf-v5-c-form__group")
      .filter({ hasText: /Collection input/i });
    const collectionInput = collectionFormGroup.locator('input[type="text"]').first();
    await collectionInput.waitFor({ state: "visible", timeout: 10000 });
    await collectionInput.fill(args.expression);
    await this.page.keyboard.press("Enter");
    await this.page.waitForTimeout(300);
  }

  public async setCompletionCondition(args: { condition: string }) {
    const conditionTextarea = this.panel().getByLabel("Completion condition");
    await conditionTextarea.waitFor({ state: "visible", timeout: 10000 });
    await conditionTextarea.fill(args.condition);
    await conditionTextarea.blur();
    await this.page.waitForTimeout(300);
  }

  public async openDataMappingModal() {
    const dataMappingSection = this.panel().getByLabel(/⇆Data mapping/i);
    const dataMappingButton = dataMappingSection.getByRole("button", { name: "Manage" });
    await dataMappingButton.waitFor({ state: "visible", timeout: 10000 });
    await dataMappingButton.click();
    await this.page.waitForTimeout(500);
  }

  public async closeDataMappingModal() {
    const saveButton = this.page.getByRole("button", { name: "Save" });
    await saveButton.click();
    await this.page.waitForTimeout(500);
  }

  public async addDataInputInModal(args: { name: string }) {
    const addInputButton = this.page.getByRole("button", { name: /Add Input data mapping/i });
    const isVisible = await addInputButton.isVisible().catch(() => false);

    if (isVisible) {
      await addInputButton.click();
      await this.page.waitForTimeout(300);
    } else {
      const inputsSection = this.page
        .locator("div")
        .filter({ hasText: /^Inputs$/ })
        .first()
        .locator("..");
      const plusButton = inputsSection
        .locator("button")
        .filter({ has: this.page.locator("svg") })
        .first();
      await plusButton.waitFor({ state: "visible", timeout: 10000 });
      await plusButton.click();
      await this.page.waitForTimeout(300);
    }

    const nameInput = this.page.locator('input[placeholder*="name"]').last();
    await nameInput.fill(args.name);
    await this.page.waitForTimeout(300);
  }

  public async addDataOutputInModal(args: { name: string }) {
    const addOutputButton = this.page.getByRole("button", { name: /Add Output data mapping/i });
    const isVisible = await addOutputButton.isVisible().catch(() => false);

    if (isVisible) {
      await addOutputButton.click();
      await this.page.waitForTimeout(300);
    } else {
      const outputsSection = this.page
        .locator("div")
        .filter({ hasText: /^Outputs$/ })
        .first()
        .locator("..");
      const plusButton = outputsSection
        .locator("button")
        .filter({ has: this.page.locator("svg") })
        .first();
      await plusButton.waitFor({ state: "visible", timeout: 10000 });
      await plusButton.click();
      await this.page.waitForTimeout(300);
    }

    const nameInput = this.page.locator('input[placeholder*="name"]').last();
    await nameInput.fill(args.name);
    await this.page.waitForTimeout(300);
  }

  public async addDataInput(args: { name: string }) {
    await this.openDataMappingModal();
    await this.addDataInputInModal(args);
    await this.closeDataMappingModal();
  }

  public async addDataOutput(args: { name: string }) {
    await this.openDataMappingModal();
    await this.addDataOutputInModal(args);
    await this.closeDataMappingModal();
  }

  public async setAsync(args: { isAsync: boolean }) {
    const asyncCheckbox = this.panel().locator('input[type="checkbox"][id*="async"]');
    const isChecked = await asyncCheckbox.isChecked();

    if (isChecked !== args.isAsync) {
      await asyncCheckbox.click();
      await this.page.waitForTimeout(300);
    }
  }
}
