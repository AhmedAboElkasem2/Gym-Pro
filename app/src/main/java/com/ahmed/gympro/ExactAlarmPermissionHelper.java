package com.ahmed.gympro;

import android.app.Activity;
import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

final class ExactAlarmPermissionHelper {
  private ExactAlarmPermissionHelper() {}

  static void requestIfNeeded(Activity activity) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return;

    AlarmManager alarmManager =
      (AlarmManager) activity.getSystemService(Context.ALARM_SERVICE);

    if (alarmManager == null || alarmManager.canScheduleExactAlarms()) return;

    try {
      Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
      intent.setData(Uri.parse("package:" + activity.getPackageName()));
      activity.startActivity(intent);
    } catch (Exception ignored) {
    }
  }
}
