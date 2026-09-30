package com.ahmed.gympro;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

/** Permission UI is only requested following the user's Start Rest action. */
final class RestAlarmPermissions {
  private RestAlarmPermissions() {}

  static void requestIfNeeded(Activity activity) {
    AlarmManager manager = (AlarmManager) activity.getSystemService(Context.ALARM_SERVICE);
    if (Build.VERSION.SDK_INT >= 31 && manager != null && !manager.canScheduleExactAlarms()) {
      new AlertDialog.Builder(activity)
        .setTitle("Allow precise rest alarms")
        .setMessage("Allow alarms & reminders so rest ends on time with the screen locked. Then start your rest timer again.")
        .setPositiveButton("Open settings", (dialog, which) -> activity.startActivity(
          new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
            Uri.parse("package:" + activity.getPackageName()))))
        .setNegativeButton("Cancel", null).show();
    } else if (Build.VERSION.SDK_INT >= 33 && activity.checkSelfPermission(
        Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
      // Ask once; the alarm still works if notifications are declined.
      android.content.SharedPreferences prefs = RestAlarmState.prefs(activity);
      if (!prefs.getBoolean("notifications-requested", false)) {
        prefs.edit().putBoolean("notifications-requested", true).apply();
        activity.requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 9414);
      }
    }
  }
}
