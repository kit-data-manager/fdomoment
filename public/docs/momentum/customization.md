# Module & Template Customization Support

This document explains how to add **new modules** and **new templates** to the FAIR DO
system using configuration. Two applications are affected by the module system:

- **Momentum** (`/momentum`) – creates FAIR Digital Objects through a step-by-step editor.
- **Memento** (`/memento`) – views FAIR Digital Objects stored in the database.

Both applications continue to work after these changes; Memento reads the stored
FDO records directly from the database and does not depend on the editorial module
state.

## Configuration Layers

The customization system lives in `lib/momentum` and is composed of these files:

| File | Purpose |
|------|---------|
| `config.ts` | Type definitions describing modules, properties, templates. |
| `properties.ts` | Re-usable property builders (text, select, url, boolean). |
| `modules.ts` | Module definitions (built-ins + a sample declarative module). |
| `templates.ts` | Template definitions (which modules to combine, step order). |
| `registry.ts` | Runtime wiring: labels, validation, FAIR scoring, record building. |

The UI primitives that render configured properties are:

| Component | Purpose |
|-----------|---------|
| `components/momentum/PropertyField.tsx` | Renders a single configured property + validation. |
| `components/momentum/GenericModule.tsx` | Renders a full declarative module from its config. |

The built-in modules (Core, Data Object, Software, Publication, Additional
Metadata) have specialized behavior and keep their own components. They are
registered in the registry so they compose with config-driven modules and
templates.

## Adding a New Module (by Configuration)

Module and property configuration is **static TypeScript for now** (the
"configuration-driven, code-deployed" approach). To add a new module:

1. Open `lib/momentum/modules.ts`.
2. Declare a `ModuleConfig` with `kind: 'generic'` and a `properties` list.
   Each property declares its widget kind, validation, FAIR-score contribution,
   and the FDO type identifier used when the final record is assembled.

```ts
{
  id: 'project',
  label: 'Project',
  description: 'Project-level context for a FAIR Digital Object.',
  icon: '🧩',
  role: 'enrichment',
  kind: 'generic',
  properties: [
    {
      id: 'projectName',
      label: 'Project Name',
      kind: 'text',           // widget kind
      required: false,
      affectsFairScore: { findable: 10, reusable: 10 },
      fdoType: '0.SIMPLE/PROJECT_NAME',
    },
    {
      id: 'grantedBy',
      label: 'Granted by',
      kind: 'select',
      options: [
        { id: 'helmholtz', label: 'Helmholtz Association' },
        { id: 'dfg', label: 'DFG' },
      ],
      affectsFairScore: { reusable: 10 },
      fdoType: '0.SIMPLE/PROJECT_GRANTEE',
    },
  ],
}
```

3. Include the module in `COMPLETE_MODULE_CONFIGS`.

That alone makes the module:
- **Rendered** by the editor via `GenericModule` + `PropertyField` (no new UI code).
- **Validated** per-property via `registry.validatePropertyConfig` / `computeModuleStatus`.
- **Scored** via the declarative `affectsFairScore` contributions.
- **Folded into the record** via `collectConfigRecordEntries` when it has an
  `fdoType`.
- **Navigated** by the editor and shown in the Navigator sidebar.

### Property / Widget Kinds

Configurable (declared) kinds supported out of the box:

- `text` – free text (`ValidatedInput`)
- `url` – URL with format validation
- `email` – email format validation
- `select` – single choice (`SearchableSelect`, optionally with `quickOptions`)
- `multi-select` – comma-separated values
- `boolean` – checkbox
- `orcid` – ORCiD format check

For attributes with complex behavior (e.g. auto-import, external lookups, creator
lists, typed-attribute registries), keep using a **custom (specialized)** module
component and register it in the registry. This is intentional: configuration
covers declarative attributes; implementation covers bespoke ones.

## Adding a New Template (by Configuration)

1. Open `lib/momentum/templates.ts`.
2. Append a `TemplateDefinition`, referencing existing module ids.

```ts
{
  id: 'project-dataset',
  label: 'Project Dataset',
  description: 'A dataset enriched with project context.',
  icon: '🧩',
  modules: [
    { moduleId: 'core', selectable: false },
    { moduleId: 'dataobject', selectable: false },
    { moduleId: 'project', selectable: true, defaultEnabled: true },
    { moduleId: 'additional', selectable: true, defaultEnabled: true },
  ],
}
```

The template appears automatically in the template-selection UI, drives the
Navigator order, the step-by-step flow, and the `canCreate` requirement logic.

## Specialized (Custom) Modules

A module whose behavior can't be expressed declaratively (e.g. Software's
auto-import, Publication's DOI import, Additional Metadata's type registry) is
declared with `kind: 'custom'` and a `componentId`. The `EditorShell`
dispatches these by id; the registry still provides label / description / role
and can hold a `statusId` used for completeness.

## FAIR Scoring & Record Building

- FAIR-score contributions are declared per property via `affectsFairScore`.
  These are summed by `registry.computeModuleFairScoreContributions` and merged
  into `lib/momentum/fairScore.ts` on top of the built-in module scoring (which
  itself is kept unchanged to avoid regressions).
- Declarative module properties become record entries via their `fdoType`
  through `registry.collectConfigRecordEntries`, folded into the final FAIR
  Digital Object alongside the built-in modules.

## Considerations / Next Steps

- **Runtime (DB-backed) configuration** can be added later by moving the static
  arrays in `modules.ts` / `templates.ts` into the database and hydrating the
  registry at startup. The schema already supports it.
- **Cross-module property reuse**: `lib/momentum/properties.ts` offers builders so
  the same property can be shared across modules. `dependsOn` on a `PropertyConfig`
  lets a property source options from another module's value.
- **Custom FDO type identifiers**: new `fdoType` values may need a corresponding
  entry in `lib/fdo/identifiers.ts` (the `FDO_TYPES` / `FDO_PROFILES` vocabulary).
