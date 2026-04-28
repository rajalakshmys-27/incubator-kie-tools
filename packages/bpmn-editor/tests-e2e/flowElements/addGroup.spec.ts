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
import { NodeType } from "../__fixtures__/nodes";

test.beforeEach(async ({ editor }) => {
  await editor.open();
});

test.describe("Add node - Group", () => {
  test.describe("Add from palette", () => {
    test("should add Group node from palette", async ({ palette, diagram }) => {
      await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 100, y: 100 } });

      await expect(diagram.get()).toHaveScreenshot("add-group-node-from-palette.png");
    });

    test("should add two Group nodes from palette in a row", async ({ palette, diagram }) => {
      await palette.dragNewNode({
        type: NodeType.GROUP,
        targetPosition: { x: 100, y: 100 },
      });
      await palette.dragNewNode({
        type: NodeType.GROUP,
        targetPosition: { x: 300, y: 300 },
      });

      await diagram.resetFocus();

      await expect(diagram.get()).toHaveScreenshot("add-2-group-nodes-from-palette.png");
    });
  });

  test.describe("Group operations", () => {
    test("should delete group", async ({ palette, jsonModel, page }) => {
      await palette.dragNewNode({ type: NodeType.GROUP, targetPosition: { x: 300, y: 300 } });

      await page.keyboard.press("Delete");

      const process = await jsonModel.getProcess();
      expect(process.artifact?.length || 0).toBe(0);
    });
  });
});
