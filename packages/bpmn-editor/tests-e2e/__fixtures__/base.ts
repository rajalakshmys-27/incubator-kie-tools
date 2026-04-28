/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { test as base } from "@playwright/test";
import { Diagram } from "./diagram";
import { Palette } from "./palette";
import { Nodes } from "./nodes";
import { Editor } from "./editor";
import { Edges } from "./edges";
import { JsonModel } from "./jsonModel";
import { Stories } from "./stories";
import { CustomTasks } from "./customTasks";
import { StartEventPropertiesPanel } from "./propertiesPanel/startEventPropertiesPanel";
import { EndEventPropertiesPanel } from "./propertiesPanel/endEventPropertiesPanel";
import { TaskPropertiesPanel } from "./propertiesPanel/taskPropertiesPanel";
import { GatewayPropertiesPanel } from "./propertiesPanel/gatewayPropertiesPanel";
import { SubProcessPropertiesPanel } from "./propertiesPanel/subProcessPropertiesPanel";
import { IntermediateEventPropertiesPanel } from "./propertiesPanel/intermediateEventPropertiesPanel";
import { SequenceFlowPropertiesPanel } from "./propertiesPanel/sequenceFlowPropertiesPanel";
import { DataObjectPropertiesPanel } from "./propertiesPanel/dataObjectPropertiesPanel";
import { LanePropertiesPanel } from "./propertiesPanel/lanePropertiesPanel";

type BpmnEditorFixtures = {
  customTasks: CustomTasks;
  diagram: Diagram;
  editor: Editor;
  edges: Edges;
  jsonModel: JsonModel;
  nodes: Nodes;
  palette: Palette;
  stories: Stories;
  startEventPropertiesPanel: StartEventPropertiesPanel;
  endEventPropertiesPanel: EndEventPropertiesPanel;
  taskPropertiesPanel: TaskPropertiesPanel;
  gatewayPropertiesPanel: GatewayPropertiesPanel;
  subProcessPropertiesPanel: SubProcessPropertiesPanel;
  intermediateEventPropertiesPanel: IntermediateEventPropertiesPanel;
  sequenceFlowPropertiesPanel: SequenceFlowPropertiesPanel;
  dataObjectPropertiesPanel: DataObjectPropertiesPanel;
  lanePropertiesPanel: LanePropertiesPanel;
};

export const test = base.extend<BpmnEditorFixtures>({
  customTasks: async ({ page, diagram, nodes }, use) => {
    await use(new CustomTasks(page, diagram, nodes));
  },
  diagram: async ({ page }, use) => {
    await use(new Diagram(page));
  },
  editor: async ({ page, baseURL }, use) => {
    await use(new Editor(page, baseURL));
  },
  edges: async ({ page, nodes, diagram }, use) => {
    await use(new Edges(page, nodes, diagram));
  },
  jsonModel: async ({ page, baseURL }, use) => {
    await use(new JsonModel(page, baseURL));
  },
  nodes: async ({ page, diagram, browserName }, use) => {
    await use(new Nodes(page, diagram, browserName));
  },
  palette: async ({ page, diagram, nodes }, use) => {
    await use(new Palette(page, diagram, nodes));
  },
  stories: async ({ baseURL, page }, use) => {
    await use(new Stories(page, baseURL));
  },
  startEventPropertiesPanel: async ({ diagram, page }, use) => {
    await use(new StartEventPropertiesPanel(diagram, page));
  },
  endEventPropertiesPanel: async ({ diagram, page }, use) => {
    await use(new EndEventPropertiesPanel(diagram, page));
  },
  taskPropertiesPanel: async ({ diagram, page }, use) => {
    await use(new TaskPropertiesPanel(diagram, page));
  },
  gatewayPropertiesPanel: async ({ diagram, page }, use) => {
    await use(new GatewayPropertiesPanel(diagram, page));
  },
  subProcessPropertiesPanel: async ({ diagram, page }, use) => {
    await use(new SubProcessPropertiesPanel(diagram, page));
  },
  intermediateEventPropertiesPanel: async ({ diagram, page }, use) => {
    await use(new IntermediateEventPropertiesPanel(diagram, page));
  },
  sequenceFlowPropertiesPanel: async ({ diagram, page }, use) => {
    await use(new SequenceFlowPropertiesPanel(diagram, page));
  },
  dataObjectPropertiesPanel: async ({ diagram, page }, use) => {
    await use(new DataObjectPropertiesPanel(diagram, page));
  },
  lanePropertiesPanel: async ({ diagram, page }, use) => {
    await use(new LanePropertiesPanel(diagram, page));
  },
});

export { expect } from "@playwright/test";
