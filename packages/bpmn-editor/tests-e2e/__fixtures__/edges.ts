/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Locator, Page } from "@playwright/test";
import { Diagram } from "./diagram";
import { Nodes } from "./nodes";

export enum EdgeType {
  SEQUENCE_FLOW = "edge_sequenceFlow",
  ASSOCIATION = "edge_association",
}

export class Edges {
  constructor(
    public page: Page,
    public nodes: Nodes,
    public diagram: Diagram
  ) {}

  public async get(args: { from: string; to: string }): Promise<Locator> {
    const fromId = args.from.startsWith("_") ? args.from : await this.nodes.getId({ name: args.from });

    const toId = args.to.startsWith("_") ? args.to : await this.nodes.getId({ name: args.to });

    await this.page.locator(".react-flow__edge").first().waitFor({ state: "attached", timeout: 15000 });

    const allEdges = this.page.locator(".react-flow__edge");
    const edgeCount = await allEdges.count();

    if (edgeCount === 1) {
      return allEdges.first();
    }

    const fromNode = this.nodes.getById({ id: fromId });
    const toNode = this.nodes.getById({ id: toId });

    const fromBox = await fromNode.boundingBox();
    const toBox = await toNode.boundingBox();

    if (!fromBox || !toBox) {
      throw new Error(`Could not get bounding boxes for nodes ${fromId} and ${toId}`);
    }

    const toCenter = { x: toBox.x + toBox.width / 2, y: toBox.y + toBox.height / 2 };

    let bestMatch: { edge: Locator; distance: number } | null = null;

    for (let i = 0; i < edgeCount; i++) {
      const edge = allEdges.nth(i);

      const pathElement = edge.locator("path.xyflow-react-kie-diagram--edge").first();
      const pathBox = await pathElement.boundingBox();

      if (!pathBox) continue;

      const edgeEndX = pathBox.x + pathBox.width;
      const edgeEndY = pathBox.y + pathBox.height / 2;

      const distanceToTarget = Math.sqrt(Math.pow(edgeEndX - toCenter.x, 2) + Math.pow(edgeEndY - toCenter.y, 2));

      if (!bestMatch || distanceToTarget < bestMatch.distance) {
        bestMatch = { edge, distance: distanceToTarget };
      }
    }

    if (bestMatch) {
      return bestMatch.edge;
    }

    throw new Error(
      `Could not find edge from ${args.from} (${fromId}) to ${args.to} (${toId}). Found ${edgeCount} edges.`
    );
  }

  public async getType(args: { from: string; to: string }): Promise<EdgeType> {
    const edge = await this.get(args);
    const type = await edge.getAttribute("data-edgetype");
    return type as EdgeType;
  }

  public async delete(args: { from: string; to: string }) {
    const edge = await this.get(args);
    await edge.click();
    await this.diagram.get().press("Delete");
  }

  public async moveWaypoint(args: {
    from: string;
    to: string;
    waypointIndex: number;
    targetPosition: { x: number; y: number };
  }) {
    const edge = await this.get(args);
    const waypoint = edge.locator(`[data-waypointindex="${args.waypointIndex}"]`);
    await waypoint.dragTo(this.diagram.get(), { targetPosition: args.targetPosition });
  }

  public async deleteWaypoint(args: { from: string; to: string; waypointIndex: number }) {
    const edge = await this.get(args);
    const waypoint = edge.locator(`[data-waypointindex="${args.waypointIndex}"]`);
    await waypoint.click({ button: "right" });
    await this.page.getByText("Delete waypoint").click();
  }
}
