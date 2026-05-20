# Engineering Notes

## Tradeoffs

- **App-specific schema over formal JSON Schema**: faster to build and easier to hydrate for this UI, but less interoperable with external schema tooling.
- **Safe custom-rule registry over arbitrary JavaScript**: less flexible for power users, but safer to import from JSON and easier to audit.
- **Single visibility condition per field**: covers the core interaction cleanly, but a production rules engine would need grouped AND/OR logic, dependency warnings, and cycle detection.
- **localStorage persistence over backend storage**: enough to demonstrate state persistence, but not enough for ownership, collaboration, audit history, or cross-device access.
- **Mock submission over real API integration**: useful for demonstrating loading and error states without backend setup. The demo currently varies success and failure responses locally; production behavior would need deterministic API contracts and observability.
- **Focused verification over exhaustive coverage**: unit tests cover schema utilities and dynamic validation, while Playwright covers the core builder-hydrate-submit flow. Broader accessibility and visual regression coverage would come next.

## Production Path

If this were moving toward production, the next steps would be:

- Add schema version migrations with compatibility tests for older saved forms.
- Persist forms to a backend with ownership, sharing, audit history, and restore points.
- Expand conditional logic into a rules model with compound predicates and dependency-cycle detection.
- Add undo/redo, field duplication, keyboard-first reordering polish, and bulk option editing.
- Add a formal accessibility pass across the builder, schema drawer, and rendered forms.
- Add visual regression coverage for the core layout and generated form controls.
- Support multi-page forms, reusable sections, and field templates for larger workflows.
