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

## Rest alarm lifecycle

The native AlarmClock is the authority while the WebView is paused. Each scheduled
rest has a persisted token: cancelled/replaced deliveries are rejected. Pending
and ringing states are separate; cancelling a countdown or ending a workout never
acknowledges a ringing alarm. Only the dialog's explicit OK does that.

RestAlarmService owns the foreground notification and the lifetime of RestAlarmAudio.
RestAlarmAudio loops the device alarm (with an original bundled fallback), requests
transient MAY_DUCK audio focus, and releases focus/resources on acknowledgement.
System audio focus interruptions pause sound until focus returns. Music stream
volume is never manually changed. The Activity observes persisted completion while
visible and rechecks on resume; merely opening the app does not stop the sound.

Exact-alarm access is checked before starting, with permission guidance rather than
a misleading web-timer fallback. Android 12/12L and 13+ permissions are declared.
Force-stop, a powered-off phone, alarm volume/DND restrictions and manufacturer
background restrictions remain outside the app's guarantee. Do not claim universal
operation or that actual Spotify/OEM hardware was tested by emulator CI.

CI additionally requires native state/focus unit tests, Android lint, and API 35/36
device tests (locked-screen/Doze delivery, persistent notification, foreground dialog,
Back handling and explicit OK acknowledgement) before publishing the verified APK.
The existing application ID, workout storage and stable signing key are unchanged.
