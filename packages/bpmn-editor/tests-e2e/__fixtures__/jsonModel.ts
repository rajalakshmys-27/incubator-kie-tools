/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Page } from "@playwright/test";

export class JsonModel {
  constructor(
    public page: Page,
    public baseURL?: string
  ) {}

  public async getModel(): Promise<any> {
    const modelElement = this.page.locator('[data-testid="storybook--bpmn-editor-model"]');
    await modelElement.waitFor({ state: "attached", timeout: 10000 });

    const modelText = await modelElement.textContent();
    return modelText ? JSON.parse(modelText) : undefined;
  }

  public async getDefinitions(): Promise<any> {
    const model = await this.getModel();
    return model?.definitions;
  }

  public async getProcess(processIndex: number = 0): Promise<any> {
    const definitions = await this.getDefinitions();
    const processes = definitions?.rootElement || definitions?.process;
    return Array.isArray(processes) ? processes[processIndex] : processes;
  }

  public async getFlowElement(args: { processIndex?: number; elementIndex: number }): Promise<any> {
    const process = await this.getProcess(args.processIndex ?? 0);
    return process?.flowElement?.[args.elementIndex];
  }

  public async getDiagram(diagramIndex: number = 0): Promise<any> {
    const definitions = await this.getDefinitions();
    return definitions?.["bpmndi:BPMNDiagram"]?.[diagramIndex];
  }

  public async getPlane(diagramIndex: number = 0): Promise<any> {
    const diagram = await this.getDiagram(diagramIndex);
    return diagram?.["bpmndi:BPMNPlane"];
  }

  public async getShape(args: { diagramIndex?: number; shapeIndex: number }): Promise<any> {
    const plane = await this.getPlane(args.diagramIndex ?? 0);
    return plane?.["di:DiagramElement"]?.[args.shapeIndex];
  }

  public async getBounds(args: { diagramIndex?: number; shapeIndex: number }): Promise<any> {
    const shape = await this.getShape(args);
    return shape?.["dc:Bounds"];
  }
}
