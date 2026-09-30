package com.ahmed.gympro;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

/** Starts during the user's rest action, stays foreground through countdown and ringing. */
public final class RestAlarmService extends Service {
  private final Handler handler = new Handler(Looper.getMainLooper());
  private RestAlarmNotification notification;
  private RestAlarmAudio audio;

  static void start(Context context) {
    Intent intent = new Intent(context, RestAlarmService.class);
    if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(intent);
    else context.startService(intent);
  }

  static void stop(Context context) {
    context.stopService(new Intent(context, RestAlarmService.class));
  }

  @Override public void onCreate() {
    super.onCreate();
    notification = new RestAlarmNotification(this);
  }

  @Override public int onStartCommand(Intent intent, int flags, int startId) {
    refresh();
    return RestAlarmState.isActive(this) || RestAlarmState.hasPending(this) ? START_STICKY : START_NOT_STICKY;
  }

  private void refresh() {
    synchronized (RestAlarmState.class) {
      handler.removeCallbacksAndMessages(null);
      if (RestAlarmState.hasPending(this) && RestAlarmState.remainingMillis(this) == 0) {
        RestAlarmState.claim(this, RestAlarmState.pendingToken(this));
      }
      boolean ringing = RestAlarmState.isActive(this);
      long remaining = RestAlarmState.remainingMillis(this);
      // Even stale startForegroundService requests must complete the foreground handshake.
      if (Build.VERSION.SDK_INT >= 34) {
        int type = ServiceInfo.FOREGROUND_SERVICE_TYPE_SYSTEM_EXEMPTED;
        if (ringing) type |= ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK;
        startForeground(RestAlarmNotification.ID, notification.build(ringing, remaining), type);
      } else {
        startForeground(RestAlarmNotification.ID, notification.build(ringing, remaining));
      }
      if (ringing) {
        if (audio == null) audio = new RestAlarmAudio(this);
        // Let the system observe the foreground promotion before requesting audio focus.
        handler.post(() -> { if (RestAlarmState.isActive(this)) audio.start(); });
      } else if (RestAlarmState.hasPending(this)) {
        handler.postDelayed(this::refresh, Build.VERSION.SDK_INT >= 24 ? Math.max(1, remaining) : Math.min(1000, Math.max(1, remaining)));
      } else {
        stopForeground(true);
        stopSelf();
      }
    }
  }

  @Override public void onDestroy() {
    handler.removeCallbacksAndMessages(null);
    if (audio != null) audio.close();
    super.onDestroy();
  }

  @Override public IBinder onBind(Intent intent) { return null; }
}
