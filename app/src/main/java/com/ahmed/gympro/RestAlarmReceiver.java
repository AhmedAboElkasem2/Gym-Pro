package com.ahmed.gympro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public final class RestAlarmReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    synchronized (RestAlarmState.class) {
      if (!RestAlarmState.claim(context, intent.getStringExtra("token"))) return;
      // AlarmManager releases its wake lock when onReceive returns. Cover service handoff.
      android.os.PowerManager power = context.getSystemService(android.os.PowerManager.class);
      android.os.PowerManager.WakeLock handoff = power.newWakeLock(
        android.os.PowerManager.PARTIAL_WAKE_LOCK, "vantalift:alarm-handoff");
      handoff.acquire(10_000);
      try {
        RestAlarmService.start(context.getApplicationContext());
      } catch (RuntimeException error) {
        // Keep completion pending for the next foreground launch; never silently lose it.
        Log.e("RestAlarm", "Could not start alarm output; completion remains pending", error);
      }
    }
  }
}
