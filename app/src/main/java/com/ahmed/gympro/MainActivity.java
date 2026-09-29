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

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
  private WebView webView;
  private static final int REST_ALARM_REQUEST = 9411;
  private static final int CREATE_BACKUP_REQUEST = 9412;
  private static final int OPEN_BACKUP_REQUEST = 9413;
  private String pendingBackupJson = null;

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    webView = new WebView(this);
    WebSettings s = webView.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDefaultTextEncodingName("UTF-8");
    webView.setWebChromeClient(new WebChromeClient());
    webView.addJavascriptInterface(new GymNativeBridge(), "GymNative");
    webView.setOnApplyWindowInsetsListener((view, insets) -> {
      int topInset = insets.getSystemWindowInsetTop();
      int extraTop = (int) (10 * getResources().getDisplayMetrics().density);
      view.setPadding(view.getPaddingLeft(), topInset + extraTop, view.getPaddingRight(), view.getPaddingBottom());
      return insets;
    });

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

  private void jsCallback(String script) {
    if (webView == null) return;
    runOnUiThread(() -> webView.evaluateJavascript(script, null));
  }

  private String readText(Uri uri) throws Exception {
    InputStream input = getContentResolver().openInputStream(uri);
    if (input == null) throw new Exception("Could not open backup file");
    BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8));
    StringBuilder out = new StringBuilder();
    String line;
    while ((line = reader.readLine()) != null) out.append(line).append('\n');
    reader.close();
    return out.toString();
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

    @JavascriptInterface
    public void saveBackupFile(String json) {
      pendingBackupJson = json;
      runOnUiThread(() -> {
        try {
          Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
          intent.addCategory(Intent.CATEGORY_OPENABLE);
          intent.setType("application/json");
          intent.putExtra(Intent.EXTRA_TITLE, "VantaLift-Backup.json");
          startActivityForResult(intent, CREATE_BACKUP_REQUEST);
        } catch (Exception e) {
          jsCallback("window.GymProBackupError&&window.GymProBackupError(" + JSONObject.quote("Could not open file saver") + ")");
        }
      });
    }

    @JavascriptInterface
    public void openBackupFile() {
      runOnUiThread(() -> {
        try {
          Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
          intent.addCategory(Intent.CATEGORY_OPENABLE);
          intent.setType("*/*");
          startActivityForResult(intent, OPEN_BACKUP_REQUEST);
        } catch (Exception e) {
          jsCallback("window.GymProBackupError&&window.GymProBackupError(" + JSONObject.quote("Could not open file picker") + ")");
        }
      });
    }
  }

  @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (resultCode != RESULT_OK || data == null || data.getData() == null) return;
    Uri uri = data.getData();

    if (requestCode == CREATE_BACKUP_REQUEST) {
      try {
        OutputStream out = getContentResolver().openOutputStream(uri, "w");
        if (out == null) throw new Exception("Could not create backup file");
        byte[] bytes = (pendingBackupJson == null ? "{}" : pendingBackupJson).getBytes(StandardCharsets.UTF_8);
        out.write(bytes);
        out.flush();
        out.close();
        pendingBackupJson = null;
        jsCallback("window.GymProBackupSaved&&window.GymProBackupSaved()");
      } catch (Exception e) {
        jsCallback("window.GymProBackupError&&window.GymProBackupError(" + JSONObject.quote("Could not save backup file") + ")");
      }
    } else if (requestCode == OPEN_BACKUP_REQUEST) {
      try {
        String raw = readText(uri);
        jsCallback("window.GymProImportBackup&&window.GymProImportBackup(" + JSONObject.quote(raw) + ")");
      } catch (Exception e) {
        jsCallback("window.GymProBackupError&&window.GymProBackupError(" + JSONObject.quote("Could not read backup file") + ")");
      }
    }
  }

  @Override protected void onResume() {
    super.onResume();
    if (webView != null) webView.evaluateJavascript("if(window.GymProResume){window.GymProResume();}", null);
  }

  private void exitFromSystemBack() {
    super.onBackPressed();
  }

  @Override public void onBackPressed() {
    if (webView == null) {
      exitFromSystemBack();
      return;
    }
    webView.evaluateJavascript(
      "window.VantaLiftHandleBack ? window.VantaLiftHandleBack() : false",
      handled -> {
        if (!"true".equals(handled)) exitFromSystemBack();
      }
    );
  }
}
