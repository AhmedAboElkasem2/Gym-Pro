package com.ahmed.gympro;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.SystemClock;

final class RestAlarmState {
  private static final String PREFS = "vantalift-rest-alarm";
  private static final String ACTIVE = "active";
  private static final String PENDING = "pending";

  private RestAlarmState() {}

  static boolean isActive(Context context) {
    return prefs(context).getBoolean(ACTIVE, false);
  }

  static void activate(Context context) {
    prefs(context).edit().putBoolean(ACTIVE, true).apply();
  }

  static void deactivate(Context context) {
    prefs(context).edit().putBoolean(ACTIVE, false).apply();
  }

  static void pending(Context context, String token) { pending(context, token, 0); }

  static void pending(Context context, String token, long durationMillis) {
    prefs(context).edit().putString(PENDING, token)
      .putLong("deadline-elapsed", token == null ? 0 : SystemClock.elapsedRealtime() + durationMillis).apply();
  }

  static String pendingToken(Context context) { return prefs(context).getString(PENDING, null); }

  static boolean hasPending(Context context) { return pendingToken(context) != null; }

  static long remainingMillis(Context context) {
    return hasPending(context) ? Math.max(0, prefs(context).getLong("deadline-elapsed", 0) - SystemClock.elapsedRealtime()) : 0;
  }

  static boolean claim(Context context, String token) {
    if (token == null || !token.equals(prefs(context).getString(PENDING, ""))) return false;
    prefs(context).edit().remove(PENDING).putBoolean(ACTIVE, true).apply();
    return true;
  }

  static SharedPreferences prefs(Context context) {
    return context.getApplicationContext()
      .getSharedPreferences(PREFS, Context.MODE_PRIVATE);
  }
}
