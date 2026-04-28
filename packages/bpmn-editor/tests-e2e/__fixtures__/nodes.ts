/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { expect, Locator, Page } from "@playwright/test";
import { Diagram } from "./diagram";
import { EdgeType } from "./edges";

export enum NodeType {
  START_EVENT = "node_startEvent",
  INTERMEDIATE_CATCH_EVENT = "node_intermediateCatchEvent",
  INTERMEDIATE_THROW_EVENT = "node_intermediateThrowEvent",
  END_EVENT = "node_endEvent",
  TASK = "node_task",
  CALL_ACTIVITY = "node_callActivity",
  SUB_PROCESS = "node_subProcess",
  GATEWAY = "node_gateway",
  DATA_OBJECT = "node_dataObject",
  TEXT_ANNOTATION = "node_textAnnotation",
  GROUP = "node_group",
  LANE = "node_lane",
}

export enum DefaultNodeName {
  START_EVENT = "", // Events use ID as label, not a name
  INTERMEDIATE_CATCH_EVENT = "", // Events use ID as label, not a name
  INTERMEDIATE_THROW_EVENT = "", // Events use ID as label, not a name
  END_EVENT = "", // Events use ID as label, not a name
  TASK = "New Task",
  CALL_ACTIVITY = "New Call Activity",
  SUB_PROCESS = "New Sub-process",
  GATEWAY = "", // Gateways use ID as label when no name is set
  DATA_OBJECT = "New Data Object",
  TEXT_ANNOTATION = "", // Text annotations use their text content
  GROUP = "", // Groups use ID as label
  LANE = "New Lane",
}

export enum NodePosition {
  BOTTOM,
  CENTER,
  LEFT,
  RIGHT,
  TOP,
  TOP_PADDING,
}

export class Nodes {
  constructor(
    public page: Page,
    public diagram: Diagram,
    public browserName: string
  ) {}

  public get(args: { name: string }) {
    return this.page.locator(`div[data-nodelabel="${args.name}"]`);
  }

  public async getId(args: { name: string }): Promise<string> {
    return (await this.get({ name: args.name }).getAttribute("data-nodehref")) ?? "";
  }

  public getByType(type: NodeType) {
    return this.page.locator(`div[data-nodetype="${type}"]`);
  }

  public async getIdByType(type: NodeType): Promise<string> {
    const node = this.getByType(type).first();
    await node.waitFor({ state: "attached" });
    return (await node.getAttribute("data-nodehref")) ?? "";
  }

  public async delete(args: { name: string }) {
    await this.select({ name: args.name, position: NodePosition.TOP_PADDING });
    await this.diagram.get().press("Delete");
  }

  public async deleteMultiple(args: { names: string[] }) {
    await this.selectMultiple({ names: args.names, position: NodePosition.TOP_PADDING });
    await this.diagram.get().press("Delete");
  }

  public async dragNewConnectedEdge(args: { type: EdgeType; from: string; to: string; position?: NodePosition }) {
    const fromIsId = args.from.startsWith("_");
    const toIsId = args.to.startsWith("_");

    const from = fromIsId ? this.getById({ id: args.from }) : this.get({ name: args.from });
    const to = toIsId ? this.getById({ id: args.to }) : this.get({ name: args.to });

    await from.scrollIntoViewIfNeeded();
    await to.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(200);

    if (fromIsId) {
      await this.selectById({ id: args.from, position: NodePosition.TOP });
    } else {
      await this.select({ name: args.from, position: NodePosition.TOP });
    }

    const targetPosition =
      args.position !== undefined
        ? await this.getPositionalNodeHandleCoordinates({ node: to, position: args.position })
        : undefined;

    await from.getByTitle(this.getAddEdgeTitle(args.type)).dragTo(to, {
      targetPosition,
      force: true,
      noWaitAfter: true,
    });

    await this.page.waitForTimeout(1000);
  }

  public async dragNewConnectedNode(args: {
    type: NodeType;
    from: string;
    targetPosition: { x: number; y: number };
    thenRenameTo?: string;
  }) {
    const isId = args.from.startsWith("_");

    let node: Locator;
    if (isId) {
      await this.selectById({ id: args.from, position: NodePosition.TOP });
      node = this.getById({ id: args.from });
    } else {
      await this.select({ name: args.from, position: NodePosition.TOP });
      node = this.get({ name: args.from });
    }

    const isGateway = await node.evaluate((el) => el.classList.contains("kie-bpmn-editor--gateway-node"));
    if (isGateway) {
      const box = await node.boundingBox();
      if (box) {
        await this.page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
        await this.page.waitForTimeout(500);
      }
    }

    const { addNodeTitle, nodeName } = this.getNewConnectedNodeProperties(args.type);

    await node.getByTitle(addNodeTitle).dragTo(this.diagram.get(), { targetPosition: args.targetPosition });

    if (nodeName === "") {
      await this.page.waitForSelector(`div[data-nodetype="${args.type}"]`, { timeout: 10000, state: "attached" });
      await this.page.waitForTimeout(500);
    } else {
      await this.page.waitForSelector(`div[data-nodelabel="${nodeName}"]`, { timeout: 10000, state: "attached" });
      await this.page.waitForTimeout(500);
    }

    if (args.thenRenameTo) {
      await this.rename({ current: nodeName, new: args.thenRenameTo });
    }
  }

  public getById(args: { id: string }) {
    return this.page.locator(`div[data-nodehref="${args.id}"]`);
  }

  public async selectById(args: { id: string; position?: NodePosition }) {
    const node = this.getById({ id: args.id });
    const coordinates =
      args.position !== undefined
        ? await this.getPositionalNodeHandleCoordinates({ node, position: args.position })
        : undefined;
    await node.click({ position: coordinates, force: true });

    const isGateway = await node.evaluate((el) => el.classList.contains("kie-bpmn-editor--gateway-node"));

    if (isGateway) {
      await this.page.waitForTimeout(300);
    } else {
      await this.waitForNodeToBeFocused({ id: args.id });
    }
  }

  public async renameByLocator(args: {
    nodeLocator: ReturnType<Page["locator"]>;
    newName: string;
    needsSelection?: boolean;
  }) {
    const needsSelection = args.needsSelection ?? true;

    const textbox = args.nodeLocator.getByRole("textbox").first();
    if (await textbox.isVisible()) {
      await textbox.fill(args.newName);
      await this.diagram.get().press("Enter");
      await this.page.locator(`[data-nodelabel="${args.newName}"]`).waitFor({ state: "attached" });
      return;
    }

    await this.page.keyboard.press("Enter");
    await this.page.keyboard.type(args.newName);
    await this.diagram.resetFocus();
    await this.page.locator(`[data-nodelabel="${args.newName}"]`).waitFor({ state: "attached" });
  }

  public async rename(args: { current: string; new: string }) {
    const node = this.get({ name: args.current });

    await this.renameByLocator({
      nodeLocator: node,
      newName: args.new,
      needsSelection: true,
    });
  }

  public async resize(args: { nodeName: string; xOffset: number; yOffset: number }) {
    const node = this.get({ name: args.nodeName });
    await this.select({ name: args.nodeName, position: NodePosition.CENTER });

    const resizeHandle = node.locator('[data-handlepos="right"]').first();
    const box = await resizeHandle.boundingBox();

    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + box.width / 2 + args.xOffset, box.y + box.height / 2 + args.yOffset);
      await this.page.mouse.up();
    }
  }

  public async select(args: { name: string; position?: NodePosition }) {
    const node = this.get({ name: args.name });

    const position =
      args.position !== undefined
        ? await this.getPositionalNodeHandleCoordinates({ node, position: args.position })
        : undefined;

    // await node.scrollIntoViewIfNeeded();

    await node.click({ position, force: true });
  }

  public async selectMultiple(args: { names: string[]; position?: NodePosition }) {
    if (this.browserName === "webkit") {
      await this.page.keyboard.down("Meta");
    } else {
      await this.page.keyboard.down("Control");
    }

    for (const name of args.names) {
      const node = this.get({ name });

      const position =
        args.position !== undefined
          ? await this.getPositionalNodeHandleCoordinates({ node, position: args.position })
          : undefined;

      await node.click({ position, force: true });
    }

    if (this.browserName === "webkit") {
      await this.page.keyboard.up("Meta");
    } else {
      await this.page.keyboard.up("Control");
    }
  }

  public async waitForNodeToBeFocused(args: { name?: string; id?: string }) {
    if (args.id) {
      await this.page.waitForSelector(`div[data-nodehref="${args.id}"][data-selected="true"]`);
    } else if (args.name !== undefined) {
      await this.page.waitForSelector(`div[data-nodelabel="${args.name}"][data-selected="true"]`);
    } else {
      throw new Error("Either name or id must be provided to waitForNodeToBeFocused");
    }
  }

  /**
   * Morphs a node to a different type using the morphing panel.
   *
   * @param args.nodeLocator - The Playwright locator for the node to morph
   * @param args.targetMorphType - The title of the morphing option to select (e.g., "User task", "Message", "Error")
   * @param args.hoverDelay - Optional delay after hovering (default: 300ms)
   * @param args.exact - Optional flag for exact title matching (default: false)
   *
   * @example
   * const task = page.locator(`[data-nodelabel="${DefaultNodeName.TASK}"]`);
   * await nodes.morphNode({ nodeLocator: task, targetMorphType: "User task" });
   */
  public async morphNode(args: {
    nodeLocator: Locator;
    targetMorphType: string;
    hoverDelay?: number;
    exact?: boolean;
  }): Promise<void> {
    const hoverDelay = args.hoverDelay ?? 300;
    const exact = args.exact ?? false;

    const box = await args.nodeLocator.boundingBox();
    if (!box) {
      throw new Error("Node not visible - cannot retrieve bounding box for morphing");
    }

    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await this.page.waitForTimeout(hoverDelay);

    const morphingToggle = args.nodeLocator.locator(".kie-bpmn-editor--node-morphing-panel-toggle > div");
    await expect(morphingToggle).toBeVisible({ timeout: 5000 });
    await morphingToggle.click({ force: true });

    const morphingOption = this.page.getByTitle(args.targetMorphType, { exact });
    await expect(morphingOption).toBeVisible({ timeout: 5000 });
    await morphingOption.click({ force: true });
  }

  private async getPositionalNodeHandleCoordinates(args: {
    node: Locator;
    position: NodePosition;
  }): Promise<{ x: number; y: number }> {
    const box = await args.node.boundingBox();
    if (!box) {
      throw new Error("Node bounding box not found");
    }

    switch (args.position) {
      case NodePosition.TOP:
        return { x: box.width / 2, y: 5 };
      case NodePosition.BOTTOM:
        return { x: box.width / 2, y: box.height - 5 };
      case NodePosition.LEFT:
        return { x: 5, y: box.height / 2 };
      case NodePosition.RIGHT:
        return { x: box.width - 5, y: box.height / 2 };
      case NodePosition.CENTER:
        return { x: box.width / 2, y: box.height / 2 };
      case NodePosition.TOP_PADDING:
        return { x: box.width / 2, y: 15 };
    }
  }

  private getAddEdgeTitle(type: EdgeType): string {
    switch (type) {
      case EdgeType.SEQUENCE_FLOW:
        return "Add Sequence Flow";
      case EdgeType.ASSOCIATION:
        return "Add Association";
    }
  }

  private getNewConnectedNodeProperties(type: NodeType) {
    switch (type) {
      case NodeType.START_EVENT:
        return { addNodeTitle: "Add Start Event", nodeName: DefaultNodeName.START_EVENT };
      case NodeType.INTERMEDIATE_CATCH_EVENT:
        return { addNodeTitle: "Add Intermediate Catch Event", nodeName: DefaultNodeName.INTERMEDIATE_CATCH_EVENT };
      case NodeType.INTERMEDIATE_THROW_EVENT:
        return { addNodeTitle: "Add Intermediate Throw Event", nodeName: DefaultNodeName.INTERMEDIATE_THROW_EVENT };
      case NodeType.END_EVENT:
        return { addNodeTitle: "Add End Event", nodeName: DefaultNodeName.END_EVENT };
      case NodeType.TASK:
        return { addNodeTitle: "Add Task", nodeName: DefaultNodeName.TASK };
      case NodeType.CALL_ACTIVITY:
        return { addNodeTitle: "Add Call Activity", nodeName: DefaultNodeName.CALL_ACTIVITY };
      case NodeType.SUB_PROCESS:
        return { addNodeTitle: "Add Sub-process", nodeName: DefaultNodeName.SUB_PROCESS };
      case NodeType.GATEWAY:
        return { addNodeTitle: "Add Gateway", nodeName: DefaultNodeName.GATEWAY };
      case NodeType.DATA_OBJECT:
        return { addNodeTitle: "Add Data Object", nodeName: DefaultNodeName.DATA_OBJECT };
      case NodeType.TEXT_ANNOTATION:
        return { addNodeTitle: "Add Text Annotation", nodeName: DefaultNodeName.TEXT_ANNOTATION };
      case NodeType.GROUP:
        return { addNodeTitle: "Add Group", nodeName: DefaultNodeName.GROUP };
      case NodeType.LANE:
        return { addNodeTitle: "Add Lane", nodeName: DefaultNodeName.LANE };
    }
  }
}
