package com.ahmed.gympro;

import android.app.Activity;
import android.webkit.JavascriptInterface;

final class GymNativeBridge {
  interface ErrorReporter {
    void report(String message);
  }

  private final Activity activity;
  private final RestAlarmController restAlarmController;
  private final BackupFileManager backupFileManager;
  private final ErrorReporter errorReporter;

  GymNativeBridge(
    Activity activity,
    RestAlarmController restAlarmController,
    BackupFileManager backupFileManager,
    ErrorReporter errorReporter
  ) {
    this.activity = activity;
    this.restAlarmController = restAlarmController;
    this.backupFileManager = backupFileManager;
    this.errorReporter = errorReporter;
  }

  @JavascriptInterface
  public boolean startRestAlarm(int seconds) {
    activity.runOnUiThread(() -> RestAlarmPermissions.requestIfNeeded(activity));
    return restAlarmController.schedule(seconds);
  }

  @JavascriptInterface
  public long getRestRemainingMillis() {
    return RestAlarmState.remainingMillis(activity);
  }

  @JavascriptInterface
  public void cancelRestAlarm() {
    restAlarmController.cancel();
  }

  @JavascriptInterface
  public void acknowledgeRestAlarm() {
    restAlarmController.acknowledge();
  }

  @JavascriptInterface
  public boolean isRestAlarmActive() {
    return restAlarmController.isActive();
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
