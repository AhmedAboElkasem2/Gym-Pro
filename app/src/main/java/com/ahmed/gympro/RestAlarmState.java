package com.ahmed.gympro;

import android.content.Context;
import android.content.SharedPreferences;

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

  static void pending(Context context, String token) {
    prefs(context).edit().putString(PENDING, token).apply();
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
