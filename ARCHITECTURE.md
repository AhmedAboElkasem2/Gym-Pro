# VantaLift architecture

VantaLift uses a feature-first, layered web architecture inside the Android WebView.

- `core/`: DOM references, application state, navigation policy, and utilities.
- `data/`: immutable starter data, persistence, migrations, and local snapshots.
- `domain/`: business transactions that do not own presentation.
- `services/`: timers, native bridge orchestration, and backup I/O.
- `ui/`: reusable presentation primitives and components.
- `views/`: page-level rendering and user interactions.
- `app.js`: composition root only.

Compatibility contracts:
- Android applicationId remains `com.ahmed.gympro`.
- Persistent storage key remains `gympro-v2`.
- Stable signing cache key remains `gym-pro-stable-signing-v1`.
- Backup import migrates legacy state rather than replacing the storage contract.

Rules:
1. New business rules belong in domain/data modules, not views.
2. Views render state and dispatch actions; they do not own persistence.
3. Native Android behavior stays behind the Java bridge/services.
4. `app.js` stays small and only wires startup events.
5. Every release must pass runtime smoke tests, architecture checks, and Android build.
