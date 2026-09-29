package com.ahmed.gympro;

import android.app.Activity;
import android.webkit.WebView;

final class WindowInsetsHelper {
  private WindowInsetsHelper() {}

  static void applyStatusBarInset(Activity activity, WebView webView) {
    if (webView == null) return;
    int resourceId = activity.getResources().getIdentifier("status_bar_height", "dimen", "android");
    float density = activity.getResources().getDisplayMetrics().density;
    int px = resourceId > 0
      ? activity.getResources().getDimensionPixelSize(resourceId)
      : Math.round(28 * density);
    int topDp = Math.max(24, Math.round(px / density));
    String script = "document.documentElement.style.setProperty('--native-status-top','"
      + topDp + "px')";
    activity.runOnUiThread(() -> webView.evaluateJavascript(script, null));
  }
}
