<!--
  IBM Confidential
  PID 5900-AR4
  Copyright IBM Corp. 2026
-->

# BPMN Editor E2E Tests

This directory contains end-to-end tests for the BPMN Editor using Playwright.

## Prerequisites

Before running the tests, ensure you have:

1. Node.js and pnpm installed
2. All dependencies installed: `pnpm install` (from repository root)
3. Storybook running on the configured port

## Running Tests

### Step 1: Start Storybook

In one terminal, start the Storybook server:

```bash
cd packages-bamoe/bpmn-editor
pnpm start
```

Wait for Storybook to fully start. You should see output like:

```
Local:   http://localhost:9002/
```

### Step 2: Run Tests

In a **separate terminal**, run the tests:

```bash
cd packages-bamoe/bpmn-editor

# Run all tests
pnpm test-e2e:run

# Run specific test file
pnpm exec playwright test tests-e2e/flowElements/addTask.spec.ts

# Run tests in headed mode (see browser)
pnpm exec playwright test --headed

# Run tests in debug mode
pnpm exec playwright test --debug

# Run specific test by name
pnpm exec playwright test -g "should add task from palette"
```

### Step 3: View Test Results

After tests complete, view the HTML report:

```bash
pnpm test-e2e:open
```

## Test Structure

```
tests-e2e/
├── __fixtures__/          # Reusable test utilities
│   ├── base.ts           # Base test configuration with fixtures
│   ├── diagram.ts        # Diagram interaction utilities
│   ├── editor.ts         # Editor setup utilities
│   ├── edges.ts          # Edge/connection utilities
│   ├── jsonModel.ts      # BPMN JSON model utilities
│   ├── nodes.ts          # Node interaction utilities
│   └── palette.ts        # Palette interaction utilities
│
└── flowElements/         # Test files organized by feature
    ├── addTask.spec.ts
    ├── addTaskTypes.spec.ts
    ├── addCallActivity.spec.ts
    ├── addGateway.spec.ts
    ├── gatewayTypes.spec.ts
    ├── gatewayMorphing.spec.ts
    ├── addStartEvent.spec.ts
    ├── addEndEvent.spec.ts
    ├── addIntermediateEvents.spec.ts
    ├── addSubProcess.spec.ts
    ├── addBoundaryEvent.spec.ts
    ├── addDataObject.spec.ts
    ├── addLane.spec.ts
    ├── nodeOperations.spec.ts
    └── edgeOperations.spec.ts
```

## Test Coverage

### Implemented Tests (119 test cases)

#### Tasks & Activities

- ✅ Generic tasks (6 tests)
- ✅ Task types: Service, User, Script, Business Rule (8 tests)
- ✅ Call Activities (9 tests)

#### Gateways

- ✅ Gateway types: Exclusive, Parallel, Inclusive, Event-Based, Complex (11 tests)
- ✅ Gateway morphing/conversion (14 tests)

#### Events

- ✅ Start events (existing)
- ✅ End events (existing)
- ✅ Intermediate events (existing)
- ✅ Boundary events with all event definitions (11 tests)

#### Data & Artifacts

- ✅ Data objects and associations (14 tests)
- ✅ Lanes and swimlanes (14 tests)

#### Operations

- ✅ Node operations: Delete, Move, Resize, Copy/Paste, Select, Undo/Redo (32 tests)
- ✅ Edge operations (existing)

### Not Implemented

- ❌ Message flows & Pools (not yet in editor palette)

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from "../__fixtures__/base";
import { NodeType, DefaultNodeName } from "../__fixtures__/nodes";

test.describe("My Feature", () => {
  test.beforeEach(async ({ editor }) => {
    await editor.open();
  });

  test("should do something", async ({ palette, nodes, diagram }) => {
    // Create a node
    await palette.dragNewNode({
      type: NodeType.TASK,
      targetPosition: { x: 300, y: 300 },
    });

    // Assert it exists
    await expect(nodes.get({ name: DefaultNodeName.TASK })).toBeAttached();

    // Take screenshot
    await expect(diagram.get()).toHaveScreenshot("my-feature.png");
  });
});
```

### Available Fixtures

- **`editor`**: Open/navigate to editor
- **`diagram`**: Interact with diagram canvas
- **`palette`**: Drag nodes from palette
- **`nodes`**: Select, rename, delete, move, resize nodes
- **`edges`**: Create, delete, query connections
- **`jsonModel`**: Validate BPMN JSON structure
- **`page`**: Raw Playwright page object

## Troubleshooting

### Tests Fail Immediately

**Problem**: All tests fail with timeout errors

**Solution**: Make sure Storybook is running first!

```bash
# Terminal 1
cd packages-bamoe/bpmn-editor
pnpm start

# Terminal 2 (after Storybook starts)
pnpm test-e2e:run
```

### Port Already in Use

**Problem**: Storybook won't start because port is in use

**Solution**: Kill the process using the port or change the port in build configuration

### Screenshot Mismatches

**Problem**: Tests fail due to screenshot differences

**Solution**: Update screenshots if changes are intentional:

```bash
pnpm exec playwright test --update-snapshots
```

### Flaky Tests

**Problem**: Tests pass sometimes but fail other times

**Solution**:

- Ensure proper `await` on all async operations
- Use `waitFor` instead of fixed delays
- Check for race conditions in test logic

## CI/CD Integration

For containerized testing in CI/CD:

```bash
# Run tests in container
pnpm test-e2e:container:run

# Clean up container
pnpm test-e2e:container:clean
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/PDF)
- [Project Test Guidelines](../../../docs/TEST.md)
