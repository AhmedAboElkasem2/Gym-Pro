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

### Background countdown and workout recovery (3.1.5)

The foreground service now starts when the user starts rest, not when rest expires.
It uses the exact-alarm holder's systemExempted foreground type while counting down,
and adds mediaPlayback on completion. A system notification chronometer draws the
remaining time without per-second WebView work. The exact AlarmClock remains the
wake-up source, with an in-process deadline callback as a duplicate-safe fallback.
Startup wake locks cover the receiver-to-service handoff (10-second ceiling) and
focus retries (10-second renewable ceiling, released when playback starts or stops).
Playback then uses MediaPlayer's own wake mode. No wake lock is held for countdown.

Notification intents use SINGLE_TOP, so opening one does not rebuild the WebView.
An active-workout repository separately snapshots each edit, including selected
exercises, sets, warmups, notes and original start time. Startup resumes that session;
finish and explicit exit remove it. Stable session IDs also prevent a crash between
history save and snapshot removal from resurrecting a completed workout.

API 35/36 device tests now observe actual active alarm audio before reopening the
app, including with a second APK/UID playing media. The audio-fixture module is
emulator-only; it is never packaged in the delivered app. Tests also verify the
notification chronometer, same-Activity reentry, and recovery after Activity/WebView
recreation. These improve the earlier notification-only background regression test;
real Realme/Spotify behavior still requires a hardware trial.
