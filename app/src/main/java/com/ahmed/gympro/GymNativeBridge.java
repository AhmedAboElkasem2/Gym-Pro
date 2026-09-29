package com.ahmed.gympro;

import android.app.Activity;
import android.webkit.JavascriptInterface;

final class GymNativeBridge {
  interface ErrorReporter {
    void report(String message);
  }

  private final Activity activity;
  private final RestAlarmScheduler restAlarmScheduler;
  private final BackupFileManager backupFileManager;
  private final ErrorReporter errorReporter;

  GymNativeBridge(
    Activity activity,
    RestAlarmScheduler restAlarmScheduler,
    BackupFileManager backupFileManager,
    ErrorReporter errorReporter
  ) {
    this.activity = activity;
    this.restAlarmScheduler = restAlarmScheduler;
    this.backupFileManager = backupFileManager;
    this.errorReporter = errorReporter;
  }

  @JavascriptInterface
  public boolean startRestAlarm(int seconds) {
    return restAlarmScheduler.schedule(seconds);
  }

  @JavascriptInterface
  public void cancelRestAlarm() {
    restAlarmScheduler.cancel();
  }

  @JavascriptInterface
  public void saveBackupFile(String json) {
    activity.runOnUiThread(() -> {
      try {
        backupFileManager.requestSave(json);
      } catch (Exception ignored) {
        errorReporter.report("Could not open file saver");
      }
    });
  }

  @JavascriptInterface
  public void openBackupFile() {
    activity.runOnUiThread(() -> {
      try {
        backupFileManager.requestOpen();
      } catch (Exception ignored) {
        errorReporter.report("Could not open file picker");
      }
    });
  }
}
