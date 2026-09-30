#!/usr/bin/env bash
# Preserve OS-level evidence when a device test fails; never turn failures green.
set -uo pipefail
gradle :audio-fixture:installDebug :app:connectedDebugAndroidTest --stacktrace
result=$?
mkdir -p app/build/device-diagnostics
adb pull /data/local/tmp/rest-countdown.png app/build/device-diagnostics/rest-countdown.png || true
if [ "$result" -ne 0 ]; then
  mkdir -p app/build/device-diagnostics
  timeout 20s adb shell dumpsys activity lastanr > app/build/device-diagnostics/last-anr.txt 2>&1 || true
  timeout 20s adb shell dumpsys dropbox --print data_app_anr > app/build/device-diagnostics/dropbox-anr.txt 2>&1 || true
  timeout 20s adb logcat -b all -d > app/build/device-diagnostics/logcat.txt 2>&1 || true
  timeout 20s adb root > app/build/device-diagnostics/adb-root.txt 2>&1 || true
  timeout 20s adb wait-for-device || true
  timeout 20s adb pull /data/anr app/build/device-diagnostics/anr > app/build/device-diagnostics/pull-anr.txt 2>&1 || true
fi
exit "$result"
