/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
 */

import { Page } from "@playwright/test";
import { Diagram } from "./diagram";
import { Nodes } from "./nodes";

export class CustomTasks {
  constructor(
    public page: Page,
    public diagram: Diagram,
    public nodes: Nodes
  ) {}

  public async openPalette() {
    const customTasksButton = this.page.locator(".kie-bpmn-editor--palette-custom-tasks-button");
    await customTasksButton.click();
    await this.page.locator(".kie-bpmn-editor--palette-nodes-popover.custom-tasks").waitFor({ state: "visible" });
  }

  public async closePalette() {
    const customTasksButton = this.page.locator(".kie-bpmn-editor--palette-custom-tasks-button");
    await customTasksButton.click();
    await this.page.locator(".kie-bpmn-editor--palette-nodes-popover.custom-tasks").waitFor({ state: "hidden" });
  }

  /**
   * Drags a custom task from the palette to the diagram
   * @param customTaskName - The display name of the custom task (e.g., "Gen AI Task")
   * @param targetPosition - The position to drop the task
   * @param thenRenameTo - Optional: Immediately rename the task after creation
   */
  public async dragCustomTask(args: {
    customTaskName: string;
    targetPosition: { x: number; y: number };
    thenRenameTo?: string;
  }) {
    const popover = this.page.locator(".kie-bpmn-editor--palette-nodes-popover.custom-tasks");
    const isVisible = await popover.isVisible().catch(() => false);

    if (!isVisible) {
      await this.openPalette();
    }

    const customTaskElement = this.page
      .locator(".kie-bpmn-editor--custom-tasks-palette--custom-task")
      .filter({ hasText: args.customTaskName });

    await customTaskElement.waitFor({ state: "visible" });

    await customTaskElement.dragTo(this.diagram.get(), { targetPosition: args.targetPosition });

    const newNode = this.page.locator(`[data-nodelabel="${args.customTaskName}"]`).last();
    await newNode.waitFor({ state: "attached" });

    if (args.thenRenameTo) {
      const nodeId = await newNode.getAttribute("data-nodehref");

      if (!nodeId) {
        throw new Error("Node ID not found after creation");
      }

      const specificNode = this.page.locator(`[data-nodehref="${nodeId}"]`);

      await this.nodes.renameByLocator({
        nodeLocator: specificNode,
        newName: args.thenRenameTo,
        needsSelection: false,
      });
    }
  }

  public async getAvailableCustomTasks(): Promise<string[]> {
    await this.openPalette();

    const customTaskElements = this.page.locator(".kie-bpmn-editor--custom-tasks-palette--custom-task--name");
    const count = await customTaskElements.count();

    const taskNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await customTaskElements.nth(i).textContent();
      if (text) {
        taskNames.push(text.trim());
      }
    }

    return taskNames;
  }

  public async isCustomTaskAvailable(customTaskName: string): Promise<boolean> {
    const availableTasks = await this.getAvailableCustomTasks();
    return availableTasks.includes(customTaskName);
  }
}
