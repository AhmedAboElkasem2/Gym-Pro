package com.ahmed.gympro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class RestAlarmReceiver extends BroadcastReceiver {
  static final String ACTION_REST_COMPLETE = "com.ahmed.gympro.REST_COMPLETE";

  @Override
  public void onReceive(Context context, Intent intent) {
    if (intent == null || !ACTION_REST_COMPLETE.equals(intent.getAction())) return;
    RestAlarmPlayer.playAsync(context.getApplicationContext(), goAsync());
  }
}
