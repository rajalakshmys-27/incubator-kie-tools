# BPMN Editor Extension Points and Conventions

## Overview

This document comprehensively describes all extension points and conventions used by the BPMN Editor beyond the standard BPMN 2.0 specification. These extensions, implemented through the `drools:` namespace, provide additional capabilities to support executable business processes in the Drools/jBPM runtime environment. The extensions enable process-level configuration, task-specific behaviors, data type specifications, runtime scripting capabilities, and custom metadata.

**Scope**: This documentation covers ALL extension points defined in the BPMN marshaller. Any extension point not documented here should be treated as a bug.

The BPMN Editor extensions are implemented through:

- **Custom XML namespace**: `drools:` (namespace URI: `http://www.jboss.org/drools`)
- **Namespace registration**: Extensions are registered into the BPMN 2.0 namespace map via [`bpmn20ns.set()`](packages/bpmn-marshaller/src/drools-extension.ts:227-228)
- **Meta merging**: Extension metadata is merged with BPMN 2.0 metadata using [`mergeMetas()`](packages/bpmn-marshaller/src/drools-extension.ts:230) from `@kie-tools/xml-parser-ts`
- **TypeScript module augmentation**: Extension types are declared through module augmentation of BPMN 2.0 types
- **Runtime metadata registration**: Extension capabilities are registered at module initialization using the [`MetaType`](packages/bpmn-marshaller/src/drools-extension.ts:355-387) builder pattern

This approach allows the BPMN Editor marshaller to seamlessly parse and serialize BPMN documents containing both standard BPMN 2.0 elements and editor-specific extensions, while maintaining full type safety and backward compatibility.

---

## Namespace Declarations

### Primary Namespace

| Constant                                                                            | Value                           | Description                                                                              |
| ----------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| [`DROOLS_NS`](packages/bpmn-marshaller/src/drools-extension.ts:35)                  | `"drools:"`                     | The current namespace prefix used for all Drools extensions in BPMN documents            |
| [`DROOLS_NS__PRE_GWT_REMOVAL`](packages/bpmn-marshaller/src/drools-extension.ts:34) | `"http://www.jboss.org/drools"` | Legacy namespace URI maintained for backward compatibility with pre-GWT removal versions |

### Namespace Registration

The Drools namespace is bidirectionally registered with the BPMN 2.0 namespace map:

```typescript
bpmn20ns.set(DROOLS_NS, drools10ns.get("")!);
bpmn20ns.set(drools10ns.get("")!, DROOLS_NS);
```

This registration enables the XML parser to recognize and properly handle `drools:` prefixed attributes and elements within BPMN documents.

---

## Custom Attributes by Element

### tProcess

Process-level attributes that configure the overall workflow behavior.

| Attribute                                                                      | XSD Type      | Array | Description                                                                                                      |
| ------------------------------------------------------------------------------ | ------------- | ----- | ---------------------------------------------------------------------------------------------------------------- |
| [`@_drools:packageName`](packages/bpmn-marshaller/src/drools-extension.ts:112) | `xsd:string`  | No    | The Java package name for the generated process class. Used for organizing processes in the runtime environment. |
| [`@_drools:version`](packages/bpmn-marshaller/src/drools-extension.ts:113)     | `xsd:string`  | No    | Version identifier for the process definition. Enables versioning and migration of process instances.            |
| [`@_drools:adHoc`](packages/bpmn-marshaller/src/drools-extension.ts:114)       | `xsd:boolean` | No    | Indicates whether the process is ad-hoc, allowing dynamic task execution order rather than strict sequencing.    |

### tCallActivity

Attributes controlling subprocess invocation behavior.

| Attribute                                                                            | XSD Type      | Array | Description                                                                                                                    |
| ------------------------------------------------------------------------------------ | ------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| [`@_drools:independent`](packages/bpmn-marshaller/src/drools-extension.ts:180)       | `xsd:boolean` | No    | When `true`, the called process runs independently with its own lifecycle. When `false`, it shares the parent process context. |
| [`@_drools:waitForCompletion`](packages/bpmn-marshaller/src/drools-extension.ts:181) | `xsd:boolean` | No    | Determines whether the calling process waits for the subprocess to complete before continuing.                                 |

### tServiceTask

Attributes defining service task implementation details.

| Attribute                                                                                | XSD Type     | Array | Description                                                                                                                                                              |
| ---------------------------------------------------------------------------------------- | ------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`@_drools:serviceimplementation`](packages/bpmn-marshaller/src/drools-extension.ts:186) | `xsd:string` | No    | Specifies the implementation type (e.g., "Java", "WebService"). See [`SERVICE_TASK_IMPLEMENTATIONS`](packages/bpmn-marshaller/src/drools-extension.ts:97-100) constants. |
| [`@_drools:serviceinterface`](packages/bpmn-marshaller/src/drools-extension.ts:187)      | `xsd:string` | No    | The fully qualified interface name for Java implementations or WSDL location for web services.                                                                           |
| [`@_drools:serviceoperation`](packages/bpmn-marshaller/src/drools-extension.ts:188)      | `xsd:string` | No    | The specific method or operation name to invoke on the service interface.                                                                                                |

### tBusinessRuleTask

Attributes for business rule task configuration.

| Attribute                                                                        | XSD Type     | Array | Description                                                                                       |
| -------------------------------------------------------------------------------- | ------------ | ----- | ------------------------------------------------------------------------------------------------- |
| [`@_drools:ruleFlowGroup`](packages/bpmn-marshaller/src/drools-extension.ts:193) | `xsd:string` | No    | The rule flow group name that identifies which rules should be activated when this task executes. |

### tTask

Generic task attributes for custom task types.

| Attribute                                                                   | XSD Type     | Array | Description                                                                                                      |
| --------------------------------------------------------------------------- | ------------ | ----- | ---------------------------------------------------------------------------------------------------------------- |
| [`@_drools:taskName`](packages/bpmn-marshaller/src/drools-extension.ts:171) | `xsd:string` | No    | Custom task type identifier. Used to specify specialized task behaviors (e.g., "Milestone" for milestone tasks). |

### tDataInput

Data input parameter type specification.

| Attribute                                                                | XSD Type     | Array | Description                                                                                       |
| ------------------------------------------------------------------------ | ------------ | ----- | ------------------------------------------------------------------------------------------------- |
| [`@_drools:dtype`](packages/bpmn-marshaller/src/drools-extension.ts:198) | `xsd:string` | No    | The Java data type for the input parameter (e.g., "String", "Integer", "com.example.CustomType"). |

### tDataOutput

Data output parameter type specification.

| Attribute                                                                | XSD Type     | Array | Description                                                                                        |
| ------------------------------------------------------------------------ | ------------ | ----- | -------------------------------------------------------------------------------------------------- |
| [`@_drools:dtype`](packages/bpmn-marshaller/src/drools-extension.ts:203) | `xsd:string` | No    | The Java data type for the output parameter (e.g., "String", "Integer", "com.example.CustomType"). |

### tSequenceFlow

Sequence flow priority configuration.

| Attribute                                                                   | XSD Type     | Array | Description                                                                                                                        |
| --------------------------------------------------------------------------- | ------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`@_drools:priority`](packages/bpmn-marshaller/src/drools-extension.ts:223) | `xsd:string` | No    | Numeric priority value for sequence flow evaluation. Higher priority flows are evaluated first when multiple outgoing flows exist. |

### tMessageEventDefinition

Message event reference configuration.

| Attribute                                                                 | XSD Type     | Array | Description                                                                 |
| ------------------------------------------------------------------------- | ------------ | ----- | --------------------------------------------------------------------------- |
| [`@_drools:msgref`](packages/bpmn-marshaller/src/drools-extension.ts:208) | `xsd:string` | No    | Reference to the message structure or identifier used by the message event. |

### tEscalationEventDefinition

Escalation event code specification.

| Attribute                                                                  | XSD Type     | Array | Description                                                                        |
| -------------------------------------------------------------------------- | ------------ | ----- | ---------------------------------------------------------------------------------- |
| [`@_drools:esccode`](packages/bpmn-marshaller/src/drools-extension.ts:213) | `xsd:string` | No    | The escalation code that identifies the type of escalation being thrown or caught. |

### tErrorEventDefinition

Error event reference configuration.

| Attribute                                                                   | XSD Type     | Array | Description                                                                     |
| --------------------------------------------------------------------------- | ------------ | ----- | ------------------------------------------------------------------------------- |
| [`@_drools:erefname`](packages/bpmn-marshaller/src/drools-extension.ts:218) | `xsd:string` | No    | The error reference name that identifies the error type being thrown or caught. |

---

## Extension Elements

Extension elements appear within `<extensionElements>` blocks and provide additional process metadata and scripting capabilities.

### drools:metaData

**Supported Elements**: All executable BPMN elements (see [Elements Supporting Metadata](#elements-supporting-metadata))

**Type**: [`drools__GLOBAL__metaData`](packages/bpmn-marshaller/src/drools-extension.ts:29)

**Array**: Yes (multiple metadata entries allowed)

**Description**: Provides key-value metadata pairs for process elements. Used for custom properties, documentation, and runtime configuration that doesn't fit standard BPMN attributes.

**Example Use Cases**:

- Custom element properties
- Integration metadata
- Documentation annotations
- Tool-specific configuration

### drools:import

**Supported Elements**: [`tProcess`](packages/bpmn-marshaller/src/drools-extension.ts:118)

**Type**: [`drools__GLOBAL__import`](packages/bpmn-marshaller/src/drools-extension.ts:28)

**Array**: Yes (multiple imports allowed)

**Description**: Declares Java class imports available to the process. Similar to Java import statements, these make classes available for use in scripts, expressions, and data type declarations throughout the process.

### drools:global

**Supported Elements**: [`tProcess`](packages/bpmn-marshaller/src/drools-extension.ts:119)

**Type**: [`drools__GLOBAL__global`](packages/bpmn-marshaller/src/drools-extension.ts:27)

**Array**: Yes (multiple globals allowed)

**Description**: Declares global variables accessible throughout the process execution. Globals are shared across all process instances and can be used in scripts and expressions.

### drools:onEntry-script

**Supported Elements**: All executable BPMN elements (see [Elements Supporting Entry/Exit Scripts](#elements-supporting-entryexit-scripts))

**Type**: [`drools__GLOBAL__onEntry_script`](packages/bpmn-marshaller/src/drools-extension.ts:30)

**Array**: No (single script per element)

**Description**: Script executed when entering the element (before the element's main action). Used for initialization, logging, variable manipulation, or pre-conditions.

**Constraints**: Only one entry script per element.

### drools:onExit-script

**Supported Elements**: All executable BPMN elements (see [Elements Supporting Entry/Exit Scripts](#elements-supporting-entryexit-scripts))

**Type**: [`drools__GLOBAL__onExit_script`](packages/bpmn-marshaller/src/drools-extension.ts:31)

**Array**: No (single script per element)

**Description**: Script executed when exiting the element (after the element's main action completes). Used for cleanup, logging, variable updates, or post-conditions.

**Constraints**: Only one exit script per element.

---

## Constants & Reserved Names

### BUSINESS_RULE_TASK_IMPLEMENTATIONS

[`BUSINESS_RULE_TASK_IMPLEMENTATIONS`](packages/bpmn-marshaller/src/drools-extension.ts:40-43)

Defines valid implementation types for Business Rule Tasks.

| Key      | Value                                | Description                                       |
| -------- | ------------------------------------ | ------------------------------------------------- |
| `drools` | `"http://www.jboss.org/drools/rule"` | Drools rule engine implementation using DRL rules |
| `dmn`    | `"http://www.jboss.org/drools/dmn"`  | DMN (Decision Model and Notation) implementation  |

**Usage**: Set as the task's implementation attribute to specify which rule engine to use.

### SERVICE_TASK_IMPLEMENTATIONS

[`SERVICE_TASK_IMPLEMENTATIONS`](packages/bpmn-marshaller/src/drools-extension.ts:97-100)

Defines valid implementation types for Service Tasks.

| Key          | Value          | Description                      |
| ------------ | -------------- | -------------------------------- |
| `java`       | `"Java"`       | Java class method invocation     |
| `webService` | `"WebService"` | SOAP/REST web service invocation |

**Usage**: Set as [`@_drools:serviceimplementation`](packages/bpmn-marshaller/src/drools-extension.ts:186) attribute value.

### BUSINESS_RULE_TASK_IO_SPECIFICATION_DATA_INPUTS_CONSTANTS_FOR_DMN_BINDING

[`BUSINESS_RULE_TASK_IO_SPECIFICATION_DATA_INPUTS_CONSTANTS_FOR_DMN_BINDING`](packages/bpmn-marshaller/src/drools-extension.ts:45-49)

Reserved data input names for DMN-based Business Rule Tasks.

| Constant     | Value         | Description               |
| ------------ | ------------- | ------------------------- |
| `FILE_PATH`  | `"fileName"`  | Path to the DMN file      |
| `NAMESPACE`  | `"namespace"` | DMN model namespace URI   |
| `MODEL_NAME` | `"model"`     | DMN model name identifier |

**Usage**: These names must be used for data inputs when binding a Business Rule Task to a DMN decision.

### USER_TASK_IO_SPECIFICATION_DATA_INPUTS_CONSTANTS_FOR_DMN_BINDING

[`USER_TASK_IO_SPECIFICATION_DATA_INPUTS_CONSTANTS_FOR_DMN_BINDING`](packages/bpmn-marshaller/src/drools-extension.ts:51-65)

Reserved data input names for User Task configuration.

| Constant                   | Value                     | Description                         |
| -------------------------- | ------------------------- | ----------------------------------- |
| `TASK_NAME`                | `"TaskName"`              | Display name for the user task      |
| `SKIPPABLE`                | `"Skippable"`             | Whether the task can be skipped     |
| `GROUP_ID`                 | `"GroupId"`               | Group(s) assigned to the task       |
| `COMMENT`                  | `"Comment"`               | Task comment/description            |
| `DESCRIPTION`              | `"Description"`           | Detailed task description           |
| `PRIORITY`                 | `"Priority"`              | Task priority level                 |
| `CREATED_BY`               | `"CreatedBy"`             | User who created the task           |
| `CONTENT`                  | `"Content"`               | Task content data                   |
| `NOT_STARTED_REASSIGN`     | `"NotStartedReassign"`    | Reassignment rules if not started   |
| `NOT_COMPLETED_REASSIGN`   | `"NotCompletedReassign"`  | Reassignment rules if not completed |
| `NOT_STARTED_NOTIFY`       | `"NotStartedNotify"`      | Notification rules if not started   |
| `NOT_COMPLETELY_NOTIFY`    | `"NotCompletedNotify"`    | Notification rules if not completed |
| `MULTI_INSTANCE_ITEM_TYPE` | `"multiInstanceItemType"` | Data type for multi-instance items  |

**Usage**: These names are reserved for standard user task properties and should not be used for custom data inputs.

### MILESTONE_TASK_IO_SPECIFICATION_DATA_INPUTS_CONSTANTS

[`MILESTONE_TASK_IO_SPECIFICATION_DATA_INPUTS_CONSTANTS`](packages/bpmn-marshaller/src/drools-extension.ts:67-70)

Reserved data input names for Milestone Tasks.

| Constant    | Value         | Description                                    |
| ----------- | ------------- | ---------------------------------------------- |
| `CONDITION` | `"Condition"` | Condition expression for milestone achievement |
| `TASK_NAME` | `"TaskName"`  | Name of the milestone task                     |

**Usage**: Required data inputs for milestone task configuration.

### MILESTONE_TASK_VALUES

[`MILESTONE_TASK_VALUES`](packages/bpmn-marshaller/src/drools-extension.ts:72-74)

Default values for Milestone Tasks.

| Constant          | Value         | Description                                 |
| ----------------- | ------------- | ------------------------------------------- |
| `TASK_NAME_VALUE` | `"Milestone"` | Default task name value for milestone tasks |

**Usage**: Used to identify and configure milestone task types.

### DATA_INPUT_RESERVED_NAMES

[`DATA_INPUT_RESERVED_NAMES`](packages/bpmn-marshaller/src/drools-extension.ts:76-95)

A `Set<string>` containing all reserved data input names from the above constants. This set includes all values from:

- `BUSINESS_RULE_TASK_IO_SPECIFICATION_DATA_INPUTS_CONSTANTS_FOR_DMN_BINDING`
- `USER_TASK_IO_SPECIFICATION_DATA_INPUTS_CONSTANTS_FOR_DMN_BINDING`
- `MILESTONE_TASK_IO_SPECIFICATION_DATA_INPUTS_CONSTANTS`

**Usage**: Use this set to validate that custom data input names don't conflict with reserved system names.

---

## Intentionally Omitted Extensions

The following BPMN elements are **explicitly excluded** from Drools extensions because they are **non-executable** elements. As noted in the [source code comment](packages/bpmn-marshaller/src/drools-extension.ts:127-132):

> "Some sequenceFlow elements are commented on purpose. They're here for completeness, but they're not currently relevant by this BPMN marshaller, since none of those are executable."

### Excluded Elements

| Element                                                                        | Reason for Exclusion                                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| [`tManualTask`](packages/bpmn-marshaller/src/drools-extension.ts:152)          | Non-executable: requires human intervention outside the system                  |
| [`tReceiveTask`](packages/bpmn-marshaller/src/drools-extension.ts:154)         | Non-executable: passive message reception without system action                 |
| [`tSendTask`](packages/bpmn-marshaller/src/drools-extension.ts:156)            | Non-executable: message sending without complex logic                           |
| [`tCallChoreography`](packages/bpmn-marshaller/src/drools-extension.ts:138)    | Non-executable: choreography elements are not supported in executable processes |
| [`tChoreographyTask`](packages/bpmn-marshaller/src/drools-extension.ts:139)    | Non-executable: choreography elements are not supported in executable processes |
| [`tSubChoreography`](packages/bpmn-marshaller/src/drools-extension.ts:160)     | Non-executable: choreography elements are not supported in executable processes |
| [`tDataObjectReference`](packages/bpmn-marshaller/src/drools-extension.ts:142) | Non-executable: reference element without runtime behavior                      |
| [`tDataStoreReference`](packages/bpmn-marshaller/src/drools-extension.ts:143)  | Non-executable: reference element without runtime behavior                      |
| [`tImplicitThrowEvent`](packages/bpmn-marshaller/src/drools-extension.ts:148)  | Non-executable: implicit events are handled by the engine automatically         |

These elements are commented out in both the TypeScript interface declarations and the [`MetaType`](packages/bpmn-marshaller/src/drools-extension.ts:355-387) registration calls.

---

## Elements Supporting Extensions

### Elements Supporting Metadata

The following elements support [`drools:metaData`](packages/bpmn-marshaller/src/drools-extension.ts:108-109) extension elements:

**Process Elements**:

- [`tProcess`](packages/bpmn-marshaller/src/drools-extension.ts:428) (process-level metadata only, no entry/exit scripts)
- [`tProperty`](packages/bpmn-marshaller/src/drools-extension.ts:431) (metadata only)
- [`tLane`](packages/bpmn-marshaller/src/drools-extension.ts:434) (metadata only)

**Executable Elements** (with entry/exit scripts):

- [`tAdHocSubProcess`](packages/bpmn-marshaller/src/drools-extension.ts:392)
- [`tBoundaryEvent`](packages/bpmn-marshaller/src/drools-extension.ts:393)
- [`tBusinessRuleTask`](packages/bpmn-marshaller/src/drools-extension.ts:394)
- [`tCallActivity`](packages/bpmn-marshaller/src/drools-extension.ts:395)
- [`tComplexGateway`](packages/bpmn-marshaller/src/drools-extension.ts:398)
- [`tDataObject`](packages/bpmn-marshaller/src/drools-extension.ts:399)
- [`tEndEvent`](packages/bpmn-marshaller/src/drools-extension.ts:402)
- [`tEvent`](packages/bpmn-marshaller/src/drools-extension.ts:403)
- [`tEventBasedGateway`](packages/bpmn-marshaller/src/drools-extension.ts:404)
- [`tExclusiveGateway`](packages/bpmn-marshaller/src/drools-extension.ts:405)
- [`tInclusiveGateway`](packages/bpmn-marshaller/src/drools-extension.ts:407)
- [`tIntermediateCatchEvent`](packages/bpmn-marshaller/src/drools-extension.ts:408)
- [`tIntermediateThrowEvent`](packages/bpmn-marshaller/src/drools-extension.ts:409)
- [`tParallelGateway`](packages/bpmn-marshaller/src/drools-extension.ts:411)
- [`tScriptTask`](packages/bpmn-marshaller/src/drools-extension.ts:413)
- [`tSequenceFlow`](packages/bpmn-marshaller/src/drools-extension.ts:415)
- [`tServiceTask`](packages/bpmn-marshaller/src/drools-extension.ts:416)
- [`tStartEvent`](packages/bpmn-marshaller/src/drools-extension.ts:417)
- [`tSubProcess`](packages/bpmn-marshaller/src/drools-extension.ts:419)
- [`tTask`](packages/bpmn-marshaller/src/drools-extension.ts:420)
- [`tTransaction`](packages/bpmn-marshaller/src/drools-extension.ts:421)
- [`tUserTask`](packages/bpmn-marshaller/src/drools-extension.ts:422)
- [`tAssociation`](packages/bpmn-marshaller/src/drools-extension.ts:423)
- [`tGroup`](packages/bpmn-marshaller/src/drools-extension.ts:424)
- [`tTextAnnotation`](packages/bpmn-marshaller/src/drools-extension.ts:425)

### Elements Supporting Entry/Exit Scripts

All elements listed in the "Executable Elements" section above support both:

- [`drools:onEntry-script`](packages/bpmn-marshaller/src/drools-extension.ts:123)
- [`drools:onExit-script`](packages/bpmn-marshaller/src/drools-extension.ts:124)

These are registered via the [`MetaType.hasEntryAndExitScripts()`](packages/bpmn-marshaller/src/drools-extension.ts:372-386) method.

---

## MetaType Helper Class

The [`MetaType`](packages/bpmn-marshaller/src/drools-extension.ts:355-387) class is an internal builder pattern used to register extension capabilities onto BPMN element types at runtime.

### Purpose

The `MetaType` class dynamically adds extension element metadata to the BPMN 2.0 meta schema, enabling the XML parser to recognize and properly handle Drools-specific extensions.

### API

#### `MetaType.of(typeName)`

[`MetaType.of()`](packages/bpmn-marshaller/src/drools-extension.ts:356-358)

**Parameters**: `typeName: keyof typeof bpmn20meta` - The BPMN element type name

**Returns**: `MetaType` instance for method chaining

**Description**: Factory method that creates a new `MetaType` instance for the specified BPMN element type.

#### `hasMetadata()`

[`hasMetadata()`](packages/bpmn-marshaller/src/drools-extension.ts:362-370)

**Returns**: `this` (for method chaining)

**Description**: Registers support for [`drools:metaData`](packages/bpmn-marshaller/src/drools-extension.ts:108-109) extension elements on the target type. Adds the following metadata to the element's schema:

```typescript
{
  type: "drools__GLOBAL__metaData",
  isArray: true,
  xsdType: "// local type",
  fromType: this.typeName
}
```

#### `hasEntryAndExitScripts()`

[`hasEntryAndExitScripts()`](packages/bpmn-marshaller/src/drools-extension.ts:372-386)

**Returns**: `this` (for method chaining)

**Description**: Registers support for both [`drools:onEntry-script`](packages/bpmn-marshaller/src/drools-extension.ts:123) and [`drools:onExit-script`](packages/bpmn-marshaller/src/drools-extension.ts:124) extension elements on the target type. Adds metadata for both script types to the element's schema.

### Usage Pattern

The typical usage pattern is method chaining:

```typescript
MetaType.of("BPMN20__tServiceTask__extensionElements").hasEntryAndExitScripts().hasMetadata();
```

This pattern:

1. Creates a `MetaType` instance for the Service Task extension elements
2. Registers entry/exit script support
3. Registers metadata support
4. Returns the instance (though the return value is typically unused)

### Registration Timing

All `MetaType` registrations occur at module initialization time (lines [392-434](packages/bpmn-marshaller/src/drools-extension.ts:392-434)), ensuring the extensions are available before any BPMN documents are parsed.

---

## Implementation Notes

### Namespace Handling

The marshaller supports both the current namespace prefix (`drools:`) and the legacy namespace URI (`http://www.jboss.org/drools`) for backward compatibility. The bidirectional namespace registration ensures documents using either format can be parsed correctly.

### Type Safety

All extension attributes and elements are strongly typed through TypeScript module augmentation (lines [106-225](packages/bpmn-marshaller/src/drools-extension.ts:106-225)), providing compile-time type checking and IDE autocomplete support.

### Metadata Schema

Extension metadata is registered using a consistent schema format:

```typescript
{
  type: string,        // TypeScript type name
  isArray: boolean,    // Whether multiple values are allowed
  xsdType: string,     // XSD type or "// local type"
  fromType: string     // Source BPMN element type
}
```

This schema enables the XML parser to correctly serialize and deserialize extension data.

---

## Maintenance Guidelines

### Adding New Extensions

To add a new Drools extension:

1. **Declare the TypeScript interface** in the module augmentation section
2. **Register the metadata** using direct assignment or `MetaType` builder
3. **Update this documentation** with the new extension details

### Removing Extensions

Extensions should never be removed for backward compatibility. Instead, mark them as deprecated in documentation.

### Testing Extensions

Any extension point not documented here should be treated as a bug. When adding new extensions, ensure:

- Complete documentation is added to this file
- Type definitions are properly augmented
- Metadata is correctly registered
- Backward compatibility is maintained

---

## BPMN Editor Conventions

### Naming Conventions

All BPMN Editor extension attributes follow the pattern:

- **Attributes**: `@_drools:attributeName` (e.g., `@_drools:packageName`)
- **Elements**: `drools:elementName` (e.g., `drools:metaData`)

### Extension Element Placement

Extension elements must be placed within `<extensionElements>` blocks of their parent BPMN element:

```xml
<bpmn2:process id="Process_1" drools:packageName="com.example" drools:version="1.0">
  <bpmn2:extensionElements>
    <drools:import name="com.example.MyClass" />
    <drools:global identifier="logger" type="org.slf4j.Logger" />
    <drools:metaData name="customProperty">
      <drools:metaValue>customValue</drools:metaValue>
    </drools:metaData>
  </bpmn2:extensionElements>
  <!-- process content -->
</bpmn2:process>
```

### Executable vs Non-Executable Elements

The BPMN Editor only extends **executable** BPMN elements. Non-executable elements (choreography tasks, manual tasks, etc.) are intentionally excluded as they don't participate in process execution. See [Intentionally Omitted Extensions](#intentionally-omitted-extensions) for the complete list.

### Data Type Specifications

The `@_drools:dtype` attribute on data inputs and outputs accepts:

- **Primitive types**: `String`, `Integer`, `Boolean`, `Float`, `Object`
- **Fully qualified class names**: `com.example.CustomType`
- **Collection types**: `java.util.List`, `java.util.Map`

### Reserved Names

The BPMN Editor reserves specific data input names for system use. Custom data inputs must not use these reserved names. See [`DATA_INPUT_RESERVED_NAMES`](#data_input_reserved_names) for the complete set.

---

## Version History

This documentation reflects the BPMN Editor extension schema as of the current codebase version. The extensions are based on:

- **BPMN 2.0 specification**: Standard BPMN elements and attributes
- **Drools 1.0 schema**: Runtime-specific extension types
- **Legacy compatibility**: Support for pre-GWT removal namespace format
- **Editor conventions**: BPMN Editor-specific patterns and practices

---

## References

- Source file: [`packages/bpmn-marshaller/src/drools-extension.ts`](packages/bpmn-marshaller/src/drools-extension.ts)
- BPMN 2.0 schema: `packages/bpmn-marshaller/src/schemas/bpmn-2_0/`
- Drools 1.0 schema: `packages/bpmn-marshaller/src/schemas/drools-1_0/`
- XML Parser: `@kie-tools/xml-parser-ts`
