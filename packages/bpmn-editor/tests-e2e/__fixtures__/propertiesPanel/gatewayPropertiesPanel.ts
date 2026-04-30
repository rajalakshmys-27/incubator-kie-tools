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

export class GatewayPropertiesPanel extends PropertiesPanelBase {
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

  public async setDefaultFlow(args: { flowId: string }) {
    const defaultFlowSelect = this.panel().locator("select").first();
    await defaultFlowSelect.waitFor({ state: "visible", timeout: 10000 });
    await defaultFlowSelect.selectOption(args.flowId);
  }

  public async getDefaultFlow(): Promise<string> {
    const defaultFlowSelect = this.panel().locator("select").first();
    await defaultFlowSelect.waitFor({ state: "visible", timeout: 10000 });
    return await defaultFlowSelect.inputValue();
  }

  private async openMorphingPanel() {
    const selectedGateway = this.page.locator(".kie-bpmn-editor--selected-gateway-node").first();
    await selectedGateway.waitFor({ state: "attached", timeout: 5000 });

    const box = await selectedGateway.boundingBox();
    if (!box) throw new Error("Gateway not visible");

    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.waitForTimeout(300);

    const morphingToggle = selectedGateway.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await morphingToggle.waitFor({ state: "visible", timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingPanel = this.page.locator(".kie-bpmn-editor--node-morphing-panel");
    await morphingPanel.waitFor({ state: "visible", timeout: 5000 });

    return morphingPanel;
  }

  public async morphToGateway(args: { type: "Parallel" | "Exclusive" | "Inclusive" | "Event" | "Complex" }) {
    const morphingPanel = await this.openMorphingPanel();
    const gatewayOption = morphingPanel.getByTitle(args.type);
    await gatewayOption.waitFor({ state: "visible", timeout: 5000 });
    await gatewayOption.click({ force: true });
    await this.page.waitForTimeout(500);
  }
}
