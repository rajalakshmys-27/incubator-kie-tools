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

import { test, expect } from "../__fixtures__/base";

test.beforeEach(async ({ editor }) => {
  await editor.openCustomTasks();
});

test.describe("Add Custom Tasks", () => {
  test.describe("Custom Tasks Palette", () => {
    test("should display custom tasks button in palette", async ({ page }) => {
      const customTasksButton = page.locator(".kie-bpmn-editor--palette-custom-tasks-button");
      await expect(customTasksButton).toBeVisible();
    });

    test("should open custom tasks palette on click", async ({ customTasks, page }) => {
      await customTasks.openPalette();

      const popover = page.locator(".kie-bpmn-editor--palette-nodes-popover.custom-tasks");
      await expect(popover).toBeVisible();
    });

    test("should close custom tasks palette on second click", async ({ customTasks, page }) => {
      await customTasks.openPalette();
      await customTasks.closePalette();

      const popover = page.locator(".kie-bpmn-editor--palette-nodes-popover.custom-tasks");
      await expect(popover).not.toBeVisible();
    });

    test("should list available custom tasks", async ({ customTasks }) => {
      const availableTasks = await customTasks.getAvailableCustomTasks();

      expect(availableTasks.length).toBeGreaterThan(0);
      expect(availableTasks).toContain("Rest API call Task");
      expect(availableTasks).toContain("gRPC API call Task");
    });
  });

  test.describe("Rest API call Task", () => {
    test("should add Rest API call Task from custom tasks palette", async ({ customTasks, nodes, diagram }) => {
      await customTasks.dragCustomTask({
        customTaskName: "Rest API call Task",
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Rest API call Task New",
      });

      await expect(nodes.get({ name: "Rest API call Task New" })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("add-rest-api-call-task-from-palette.png");
    });

    test("should add two Rest API call Tasks from palette", async ({ customTasks, nodes, diagram }) => {
      await customTasks.dragCustomTask({
        customTaskName: "Rest API call Task",
        targetPosition: { x: 200, y: 200 },
        thenRenameTo: "Rest API call Task A",
      });

      await customTasks.dragCustomTask({
        customTaskName: "Rest API call Task",
        targetPosition: { x: 400, y: 300 },
        thenRenameTo: "Rest API call Task B",
      });

      await diagram.resetFocus();

      await expect(nodes.get({ name: "Rest API call Task A" })).toBeAttached();
      await expect(nodes.get({ name: "Rest API call Task B" })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("add-2-rest-api-call-tasks-from-palette.png");
    });

    test("should verify Rest API call Task properties in JSON model", async ({ customTasks, jsonModel }) => {
      await customTasks.dragCustomTask({
        customTaskName: "Rest API call Task",
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "Rest API call Task Props",
      });

      const task = await jsonModel.getFlowElement({ elementIndex: 2 });

      expect(task).toMatchObject({
        __$$element: "task",
        "@_id": expect.any(String),
        "@_name": "Rest API call Task Props",
        "@_drools:taskName": "rest-api-call-task",
      });
    });
  });

  test.describe("gRPC API call Task", () => {
    test("should add gRPC API call Task from custom tasks palette", async ({ customTasks, nodes, diagram }) => {
      await customTasks.dragCustomTask({
        customTaskName: "gRPC API call Task",
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "gRPC API call Task New",
      });

      await expect(nodes.get({ name: "gRPC API call Task New" })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("add-grpc-api-call-task-from-palette.png");
    });

    test("should add two gRPC API call Tasks from palette", async ({ customTasks, nodes, diagram }) => {
      await customTasks.dragCustomTask({
        customTaskName: "gRPC API call Task",
        targetPosition: { x: 200, y: 200 },
        thenRenameTo: "gRPC API call Task A",
      });

      await customTasks.dragCustomTask({
        customTaskName: "gRPC API call Task",
        targetPosition: { x: 400, y: 300 },
        thenRenameTo: "gRPC API call Task B",
      });

      await diagram.resetFocus();

      await expect(nodes.get({ name: "gRPC API call Task A" })).toBeAttached();
      await expect(nodes.get({ name: "gRPC API call Task B" })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("add-2-grpc-api-call-tasks-from-palette.png");
    });

    test("should verify gRPC API call Task properties in JSON model", async ({ customTasks, jsonModel }) => {
      await customTasks.dragCustomTask({
        customTaskName: "gRPC API call Task",
        targetPosition: { x: 300, y: 300 },
        thenRenameTo: "gRPC API call Task Props",
      });

      const task = await jsonModel.getFlowElement({ elementIndex: 2 });

      expect(task).toMatchObject({
        __$$element: "task",
        "@_id": expect.any(String),
        "@_name": "gRPC API call Task Props",
        "@_drools:taskName": "grpc-api-call-task",
      });
    });
  });

  test("should rename custom tasks", async ({ customTasks, nodes }) => {
    await customTasks.dragCustomTask({
      customTaskName: "Rest API call Task",
      targetPosition: { x: 300, y: 300 },
      thenRenameTo: "Fetch User Data",
    });

    await expect(nodes.get({ name: "Fetch User Data" })).toBeAttached();
  });

  test("should delete custom task", async ({ customTasks, nodes }) => {
    await customTasks.dragCustomTask({
      customTaskName: "gRPC API call Task",
      targetPosition: { x: 300, y: 300 },
      thenRenameTo: "gRPC Task to Delete",
    });

    await nodes.delete({ name: "gRPC Task to Delete" });

    await expect(nodes.get({ name: "gRPC Task to Delete" })).not.toBeAttached();
  });

  test("should move custom task to new position", async ({ customTasks, page, diagram }) => {
    await customTasks.dragCustomTask({
      customTaskName: "Rest API call Task",
      targetPosition: { x: 300, y: 300 },
      thenRenameTo: "Move Test Task",
    });

    const task = page.locator(".kie-bpmn-editor--task-node").first();
    await expect(task).toBeAttached();

    await task.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const taskBox = await task.boundingBox();
    if (!taskBox) {
      throw new Error("Custom Task bounding box not found");
    }

    await task.dragTo(diagram.get(), {
      sourcePosition: { x: 20, y: taskBox.height / 2 },
      targetPosition: { x: 500, y: 400 },
      force: true,
    });

    const boxAfter = await task.boundingBox();

    expect(boxAfter?.x).not.toBe(taskBox?.x);
    expect(boxAfter?.y).not.toBe(taskBox?.y);
  });

  test.describe("Custom Tasks in Process Flow", () => {
    test("should create process with Start Event, Rest API call Task, and End Event", async ({
      palette,
      customTasks,
      nodes,
      diagram,
    }) => {
      await palette.dragNewNode({
        type: "node_startEvent" as any,
        targetPosition: { x: 100, y: 200 },
      });

      await customTasks.dragCustomTask({
        customTaskName: "Rest API call Task",
        targetPosition: { x: 300, y: 200 },
        thenRenameTo: "Rest API call Task Flow",
      });

      await palette.dragNewNode({
        type: "node_endEvent" as any,
        targetPosition: { x: 500, y: 200 },
      });

      await diagram.resetFocus();

      await expect(nodes.get({ name: "Rest API call Task Flow" })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("rest-api-call-task-in-process-flow.png");
    });
  });
});
