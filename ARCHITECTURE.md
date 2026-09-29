# VantaLift architecture

VantaLift is a hybrid Android/WebView application with explicit dependency boundaries.

## Web source of truth

All authored JavaScript lives in `app/src/main/web-src` as native ES modules.

- `core/`: DOM handles, session state, utilities, and routing.
- `data/`: immutable seed data and persistent state repository.
- `domain/`: pure training rules and workout-completion logic.
- `services/`: timers and native backup bridge orchestration.
- `ui/`: reusable UI primitives and components.
- `features/`: cross-view feature flows such as the synced exercise library.
- `views/`: screen rendering and event binding.
- `main.mjs`: composition root only.

Production WebView code is bundled with a pinned esbuild version into
`app/src/main/assets/app.bundle.js`. The HTML loads only that bundle, so Android
does not depend on file:// ES-module behavior.

## State boundaries

Persistent application data is owned by `data/store.mjs`. Its object identity is
preserved when restoring a backup so imported consumers never hold stale references.
The compatibility storage key remains `gympro-v2`.

Transient navigation/workout state is isolated in `core/session.mjs`.

Business rules such as the 12+ rep progression threshold, +5 kg suggestion, PR
comparison, streak calculations, and workout completion live outside the DOM layer.

## Native Android

`MainActivity` is an orchestration shell. Native responsibilities are split into:

- `RestAlarmScheduler.java`
- `BackupFileManager.java`
- `GymNativeBridge.java`
- `VantaWebViewClient.java`
- `WindowInsetsHelper.java`

The Android application ID remains `com.ahmed.gympro` and the stable signing cache
key remains `gym-pro-stable-signing-v1`.

## Quality gates

Every release must pass, in order:

1. ES-module bundle compilation.
2. Node unit tests for domain/store behavior.
3. Architecture guard checks.
4. Bundled runtime smoke test.
5. Recovered-backup generation.
6. Android Gradle build.

The architecture guard prevents regression to implicit cross-file globals, a large
composition root, a God Activity, or direct loading of source modules in the WebView.
