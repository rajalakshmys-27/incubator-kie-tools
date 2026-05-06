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
import { Diagram } from "./diagram";
import { DefaultNodeName, Nodes, NodeType } from "./nodes";

export class Palette {
  constructor(
    public page: Page,
    public diagram: Diagram,
    public nodes: Nodes
  ) {}

  public async dragNewNode(args: { type: NodeType; targetPosition: { x: number; y: number }; thenRenameTo?: string }) {
    const { cssClass, nodeName } = this.getNewNodeProperties(args.type);

    await this.page
      .locator(`.kie-bpmn-editor--palette-button.${cssClass}`)
      .dragTo(this.diagram.get(), { targetPosition: args.targetPosition });

    if (nodeName) {
      await this.nodes.get({ name: nodeName }).waitFor({ state: "attached" });
    }

    if (args.thenRenameTo && nodeName) {
      await this.nodes.rename({ current: nodeName, new: args.thenRenameTo });
    }
  }

  public async openProcessVariables() {
    const variablesPanel = this.page.locator(".kie-bpmn-editor--palette-nodes-popover.variables");
    const isPanelVisible = await variablesPanel.isVisible().catch(() => false);

    if (isPanelVisible) {
      return;
    }

    const toggle = this.page.getByTitle("Process Variables");
    await toggle.waitFor({ state: "visible", timeout: 10000 });
    await toggle.click();
    await variablesPanel.waitFor({ state: "visible", timeout: 10000 });
  }

  public async closeProcessVariables() {
    const variablesPanel = this.page.locator(".kie-bpmn-editor--palette-nodes-popover.variables");
    const isPanelVisible = await variablesPanel.isVisible().catch(() => false);

    if (!isPanelVisible) {
      return;
    }

    const toggle = this.page.getByTitle("Process Variables");
    await toggle.waitFor({ state: "visible", timeout: 10000 });
    await toggle.click();
    await variablesPanel.waitFor({ state: "hidden", timeout: 10000 });
  }

  public async addProcessVariable(args: { name: string; dataType?: string }) {
    await this.openProcessVariables();

    const variablesPanel = this.page.locator(".kie-bpmn-editor--palette-nodes-popover.variables");
    const emptyStateAddButton = this.page.getByRole("button", { name: "Add Variable", exact: true });
    const isEmptyState = await emptyStateAddButton.isVisible().catch(() => false);

    if (isEmptyState) {
      await emptyStateAddButton.click();
    } else {
      const addButton = variablesPanel.locator("button.pf-m-plain").filter({ has: this.page.locator("svg") });
      await addButton.first().waitFor({ state: "visible", timeout: 10000 });
      await addButton.first().click();
    }

    const variableNameInput = variablesPanel.getByPlaceholder("Name...").last();
    await variableNameInput.waitFor({ state: "visible", timeout: 10000 });
    await variableNameInput.fill(args.name);

    if (args.dataType) {
      const variableEntries = variablesPanel.locator(".kie-bpmn-editor--properties-panel--variables-entry");
      const lastEntry = variableEntries.last();
      const dataTypeInput = lastEntry.locator('input[role="combobox"]').first();

      await dataTypeInput.waitFor({ state: "visible", timeout: 10000 });
      await dataTypeInput.click();
      await this.page.keyboard.type(args.dataType);

      const dataTypeOption = this.page.getByRole("option", { name: args.dataType, exact: true });
      await dataTypeOption.waitFor({ state: "visible", timeout: 10000 });
      await dataTypeOption.click();
      await this.page.waitForTimeout(500);

      const selectedValue = await dataTypeInput.inputValue();
      if (!selectedValue || selectedValue === "<Undefined>") {
        await dataTypeOption.click();
        await this.page.waitForTimeout(300);
      }

      return;
    }

    await variableNameInput.press("Tab");
  }

  private getNewNodeProperties(type: NodeType) {
    switch (type) {
      case NodeType.START_EVENT:
        return { cssClass: "start-event", nodeName: DefaultNodeName.START_EVENT };
      case NodeType.INTERMEDIATE_CATCH_EVENT:
        return { cssClass: "intermediate-catch-event", nodeName: DefaultNodeName.INTERMEDIATE_CATCH_EVENT };
      case NodeType.INTERMEDIATE_THROW_EVENT:
        return { cssClass: "intermediate-throw-event", nodeName: DefaultNodeName.INTERMEDIATE_THROW_EVENT };
      case NodeType.END_EVENT:
        return { cssClass: "end-event", nodeName: DefaultNodeName.END_EVENT };
      case NodeType.TASK:
        return { cssClass: "task", nodeName: DefaultNodeName.TASK };
      case NodeType.CALL_ACTIVITY:
        return { cssClass: "callActivity", nodeName: DefaultNodeName.CALL_ACTIVITY };
      case NodeType.SUB_PROCESS:
        return { cssClass: "subProcess", nodeName: DefaultNodeName.SUB_PROCESS };
      case NodeType.GATEWAY:
        return { cssClass: "gateway", nodeName: DefaultNodeName.GATEWAY };
      case NodeType.DATA_OBJECT:
        return { cssClass: "data-object", nodeName: DefaultNodeName.DATA_OBJECT };
      case NodeType.TEXT_ANNOTATION:
        return { cssClass: "text-annotation", nodeName: DefaultNodeName.TEXT_ANNOTATION };
      case NodeType.GROUP:
        return { cssClass: "group", nodeName: DefaultNodeName.GROUP };
      case NodeType.LANE:
        return { cssClass: "lane", nodeName: DefaultNodeName.LANE };
    }
  }
}
