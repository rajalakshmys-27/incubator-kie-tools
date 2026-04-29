/*
 * IBM Confidential
 * PID 5900-AR4
 * Copyright IBM Corp. 2025, 2026
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

      // Verify we have custom tasks available (Rest API call Task and gRPC API call Task)
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

  // test.describe("Mixed Custom Tasks", () => {
  //   test("should add multiple different custom tasks", async ({ customTasks, nodes, diagram }) => {
  //     await customTasks.dragCustomTask({
  //       customTaskName: "Rest API call Task",
  //       targetPosition: { x: 200, y: 200 },
  //       thenRenameTo: "Rest API call Task Mixed",
  //     });

  //     await customTasks.dragCustomTask({
  //       customTaskName: "gRPC API call Task",
  //       targetPosition: { x: 450, y: 200 },
  //       thenRenameTo: "gRPC API call Task Mixed",
  //     });

  //     await diagram.resetFocus();

  //     await expect(nodes.get({ name: "Rest API call Task Mixed" })).toBeAttached();
  //     await expect(nodes.get({ name: "gRPC API call Task Mixed" })).toBeAttached();
  //     await expect(diagram.get()).toHaveScreenshot("add-mixed-custom-tasks.png");
  //   });

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

  //   test("should copy and paste custom task", async ({ customTasks, nodes, jsonModel, page }) => {
  //     await customTasks.dragCustomTask({
  //       customTaskName: "Rest API call Task",
  //       targetPosition: { x: 300, y: 300 },
  //       thenRenameTo: "API Task",
  //     });

  //     const task = nodes.get({ name: "API Task" });
  //     await task.click();

  //     await page.keyboard.press("ControlOrMeta+C");
  //     await page.keyboard.press("ControlOrMeta+V");

  //     const flowElements = await jsonModel.getProcess();
  //     expect(flowElements.flowElement?.length).toBe(2);
  //     expect(flowElements.flowElement?.[0].__$$element).toBe("task");
  //     expect(flowElements.flowElement?.[1].__$$element).toBe("task");
  //   });
  // });

  test.describe("Custom Tasks in Process Flow", () => {
    test("should create process with Start Event, Rest API call Task, and End Event", async ({
      palette,
      customTasks,
      nodes,
      diagram,
    }) => {
      // Add Start Event
      await palette.dragNewNode({
        type: "node_startEvent" as any,
        targetPosition: { x: 100, y: 200 },
      });

      // Add Rest API call Task
      await customTasks.dragCustomTask({
        customTaskName: "Rest API call Task",
        targetPosition: { x: 300, y: 200 },
        thenRenameTo: "Rest API call Task Flow",
      });

      // Add End Event
      await palette.dragNewNode({
        type: "node_endEvent" as any,
        targetPosition: { x: 500, y: 200 },
      });

      await diagram.resetFocus();

      await expect(nodes.get({ name: "Rest API call Task Flow" })).toBeAttached();
      await expect(diagram.get()).toHaveScreenshot("rest-api-call-task-in-process-flow.png");
    });
  });

  // The following tests are for Gen AI Task, AI Agent Task, and Milestone
  // which are available in the Canvas application (bpmn-editor-envelope-for-bamoe)
  // but not in the standalone bpmn-editor Storybook.
  //
  // To enable these tests:
  // 1. Create similar tests in packages-bamoe/canvas/tests-e2e/
  // 2. Run tests against the Canvas application instead of Storybook
  //

  //   test.describe("Gen AI Task", () => {
  //     test("should add Gen AI Task from custom tasks palette", async ({ customTasks, nodes, page }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Gen AI Task",
  //         targetPosition: { x: 300, y: 300 },
  //       });
  //
  //       await expect(nodes.get({ name: "Gen AI Task" })).toBeAttached();
  //       await expect(page).toHaveScreenshot("add-gen-ai-task-from-palette.png");
  //     });
  //
  //     test("should add two Gen AI Tasks from palette", async ({ customTasks, nodes, diagram, page }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Gen AI Task",
  //         targetPosition: { x: 200, y: 200 },
  //       });
  //
  //       await nodes.rename({ current: "Gen AI Task", new: "Gen AI Task A" });
  //
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Gen AI Task",
  //         targetPosition: { x: 400, y: 300 },
  //       });
  //
  //       await nodes.rename({ current: "Gen AI Task", new: "Gen AI Task B" });
  //
  //       await diagram.resetFocus();
  //
  //       await expect(nodes.get({ name: "Gen AI Task A" })).toBeAttached();
  //       await expect(nodes.get({ name: "Gen AI Task B" })).toBeAttached();
  //       await expect(page).toHaveScreenshot("add-2-gen-ai-tasks-from-palette.png");
  //     });
  //
  //     test("should verify Gen AI Task properties in JSON model", async ({ customTasks, jsonModel }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Gen AI Task",
  //         targetPosition: { x: 300, y: 300 },
  //       });
  //
  //       const task = await jsonModel.getFlowElement({ elementIndex: 0 });
  //
  //       expect(task).toMatchObject({
  //         __$$element: "task",
  //         "@_id": expect.any(String),
  //         "@_name": "Gen AI Task",
  //         "@_drools:taskName": "Gen AI Task",
  //       });
  //     });
  //   });
  //
  //   test.describe("AI Agent Task", () => {
  //     test("should add AI Agent Task from custom tasks palette", async ({ customTasks, nodes, page }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "AI Agent Task",
  //         targetPosition: { x: 300, y: 300 },
  //       });
  //
  //       await expect(nodes.get({ name: "AI Agent Task" })).toBeAttached();
  //       await expect(page).toHaveScreenshot("add-ai-agent-task-from-palette.png");
  //     });
  //
  //     test("should add two AI Agent Tasks from palette", async ({ customTasks, nodes, diagram, page }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "AI Agent Task",
  //         targetPosition: { x: 200, y: 200 },
  //       });
  //
  //       await nodes.rename({ current: "AI Agent Task", new: "AI Agent Task A" });
  //
  //       await customTasks.dragCustomTask({
  //         customTaskName: "AI Agent Task",
  //         targetPosition: { x: 400, y: 300 },
  //       });
  //
  //       await nodes.rename({ current: "AI Agent Task", new: "AI Agent Task B" });
  //
  //       await diagram.resetFocus();
  //
  //       await expect(nodes.get({ name: "AI Agent Task A" })).toBeAttached();
  //       await expect(nodes.get({ name: "AI Agent Task B" })).toBeAttached();
  //       await expect(page).toHaveScreenshot("add-2-ai-agent-tasks-from-palette.png");
  //     });
  //
  //     test("should verify AI Agent Task properties in JSON model", async ({ customTasks, jsonModel }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "AI Agent Task",
  //         targetPosition: { x: 300, y: 300 },
  //       });
  //
  //       const task = await jsonModel.getFlowElement({ elementIndex: 0 });
  //
  //       expect(task).toMatchObject({
  //         __$$element: "task",
  //         "@_id": expect.any(String),
  //         "@_name": "AI Agent Task",
  //         "@_drools:taskName": "AI Agent Task",
  //       });
  //     });
  //   });
  //
  //   test.describe("Milestone", () => {
  //     test("should add Milestone from custom tasks palette", async ({ customTasks, nodes, page }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Milestone",
  //         targetPosition: { x: 300, y: 300 },
  //       });
  //
  //       await expect(nodes.get({ name: "Milestone" })).toBeAttached();
  //       await expect(page).toHaveScreenshot("add-milestone-from-palette.png");
  //     });
  //
  //     test("should add two Milestones from palette", async ({ customTasks, nodes, diagram, page }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Milestone",
  //         targetPosition: { x: 200, y: 200 },
  //       });
  //
  //       await nodes.rename({ current: "Milestone", new: "Milestone A" });
  //
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Milestone",
  //         targetPosition: { x: 400, y: 300 },
  //       });
  //
  //       await nodes.rename({ current: "Milestone", new: "Milestone B" });
  //
  //       await diagram.resetFocus();
  //
  //       await expect(nodes.get({ name: "Milestone A" })).toBeAttached();
  //       await expect(nodes.get({ name: "Milestone B" })).toBeAttached();
  //       await expect(page).toHaveScreenshot("add-2-milestones-from-palette.png");
  //     });
  //
  //     test("should verify Milestone properties in JSON model", async ({ customTasks, jsonModel }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Milestone",
  //         targetPosition: { x: 300, y: 300 },
  //       });
  //
  //       const task = await jsonModel.getFlowElement({ elementIndex: 0 });
  //
  //       expect(task).toMatchObject({
  //         __$$element: "task",
  //         "@_id": expect.any(String),
  //         "@_name": "Milestone",
  //         "@_drools:taskName": "Milestone",
  //       });
  //     });
  //   });
  //   test.describe("Mixed Custom Tasks", () => {
  //     test("should add multiple different custom tasks", async ({ customTasks, nodes, diagram, page }) => {
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Gen AI Task",
  //         targetPosition: { x: 150, y: 200 },
  //       });

  //       await customTasks.dragCustomTask({
  //         customTaskName: "AI Agent Task",
  //         targetPosition: { x: 350, y: 200 },
  //       });

  //       await customTasks.dragCustomTask({
  //         customTaskName: "Milestone",
  //         targetPosition: { x: 550, y: 200 },
  //       });

  //       await diagram.resetFocus();

  //       await expect(nodes.get({ name: "Gen AI Task" })).toBeAttached();
  //       await expect(nodes.get({ name: "AI Agent Task" })).toBeAttached();
  //       await expect(nodes.get({ name: "Milestone" })).toBeAttached();
  //       await expect(page).toHaveScreenshot("add-mixed-custom-tasks.png");
  //     });

  // test("should rename custom tasks", async ({ customTasks, nodes }) => {
  //   await customTasks.dragCustomTask({
  //     customTaskName: "Gen AI Task",
  //     targetPosition: { x: 300, y: 300 },
  //   });

  //   await nodes.rename({ current: "Gen AI Task", new: "Generate Report" });

  //   await expect(nodes.get({ name: "Generate Report" })).toBeAttached();
  // });

  //   test("should delete custom task", async ({ customTasks, nodes }) => {
  //     await customTasks.dragCustomTask({
  //       customTaskName: "AI Agent Task",
  //       targetPosition: { x: 300, y: 300 },
  //     });

  //     await nodes.delete({ name: "AI Agent Task" });

  //     await expect(nodes.get({ name: "AI Agent Task" })).not.toBeAttached();
  //   });
  // });

  //   test.describe("Custom Tasks in Process Flow", () => {
  //     test("should create process with Start Event, Gen AI Task, and End Event", async ({
  //       palette,
  //       customTasks,
  //       nodes,
  //       diagram,
  //       page,
  //     }) => {
  //       // Add Start Event
  //       await palette.dragNewNode({
  //         type: "node_startEvent" as any,
  //         targetPosition: { x: 100, y: 200 },
  //       });

  //       // Add Gen AI Task
  //       await customTasks.dragCustomTask({
  //         customTaskName: "Gen AI Task",
  //         targetPosition: { x: 300, y: 200 },
  //       });

  //       // Add End Event
  //       await palette.dragNewNode({
  //         type: "node_endEvent" as any,
  //         targetPosition: { x: 500, y: 200 },
  //       });

  //       await diagram.resetFocus();

  //       await expect(nodes.get({ name: "Gen AI Task" })).toBeAttached();
  //       await expect(page).toHaveScreenshot("gen-ai-task-in-process-flow.png");
  //     });
  //   });
});
