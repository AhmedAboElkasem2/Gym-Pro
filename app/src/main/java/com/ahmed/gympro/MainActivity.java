package com.ahmed.gympro;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  private WebView webView;
  private static final int REST_ALARM_REQUEST = 9411;

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    webView = new WebView(this);
    WebSettings s = webView.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDefaultTextEncodingName("UTF-8");
    webView.setWebChromeClient(new WebChromeClient());
    webView.addJavascriptInterface(new GymNativeBridge(), "GymNative");

    webView.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri uri = request.getUrl();
        if ("http".equals(uri.getScheme()) || "https".equals(uri.getScheme())) {
          try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
            return true;
          } catch (Exception ignored) {}
        }
        return false;
      }

      @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
          try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            return true;
          } catch (Exception ignored) {}
        }
        return false;
      }
    });

    setContentView(webView);
    webView.loadUrl("file:///android_asset/index.html");
  }

  private PendingIntent restAlarmIntent() {
    Intent intent = new Intent(this, RestAlarmReceiver.class);
    intent.setAction("com.ahmed.gympro.REST_COMPLETE");
    int flags = PendingIntent.FLAG_UPDATE_CURRENT;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
    return PendingIntent.getBroadcast(this, REST_ALARM_REQUEST, intent, flags);
  }

  private void cancelRestAlarmInternal() {
    AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
    if (alarmManager != null) alarmManager.cancel(restAlarmIntent());
  }

  private class GymNativeBridge {
    @JavascriptInterface
    public boolean startRestAlarm(int seconds) {
      try {
        seconds = Math.max(1, seconds);
        AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return false;
        cancelRestAlarmInternal();
        long triggerAt = System.currentTimeMillis() + (seconds * 1000L);
        PendingIntent pi = restAlarmIntent();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
          alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        } else {
          alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        }
        return true;
      } catch (Exception ignored) {
        return false;
      }
    }

    @JavascriptInterface
    public void cancelRestAlarm() {
      cancelRestAlarmInternal();
    }
  }

  @Override protected void onResume() {
    super.onResume();
    if (webView != null) webView.evaluateJavascript("if(window.GymProResume){window.GymProResume();}", null);
  }

  @Override public void onBackPressed() {
    if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
  }
}
