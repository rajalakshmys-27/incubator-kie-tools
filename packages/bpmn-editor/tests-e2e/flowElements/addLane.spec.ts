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
import { NodeType, DefaultNodeName, NodePosition } from "../__fixtures__/nodes";

test.describe("Add Lane", () => {
  test.beforeEach(async ({ editor }) => {
    await editor.open();
  });

  test("should add lane from palette", async ({ palette, nodes, diagram }) => {
    await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });

    await expect(nodes.get({ name: DefaultNodeName.LANE })).toBeAttached();
    await expect(diagram.get()).toHaveScreenshot("add-lane-node-from-palette.png");
  });

  test.describe("Lane operations", () => {
    test("should delete lane", async ({ palette, nodes, jsonModel }) => {
      await palette.dragNewNode({ type: NodeType.LANE, targetPosition: { x: 300, y: 300 } });
      await nodes.delete({ name: DefaultNodeName.LANE });

      await expect(nodes.get({ name: DefaultNodeName.LANE })).not.toBeAttached();

      // Verify it's removed from JSON model - check the lanes within the laneSet
      const process = await jsonModel.getProcess();
      const laneSet = Array.isArray(process.laneSet) ? process.laneSet[0] : process.laneSet;
      expect(laneSet?.lane?.length || 0).toBe(0);
    });
  });
});
