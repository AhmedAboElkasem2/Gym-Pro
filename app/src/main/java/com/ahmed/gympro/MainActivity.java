package com.ahmed.gympro;

import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;

import org.json.JSONObject;

public class MainActivity extends Activity {
  private WebView webView;
  private RestAlarmScheduler restAlarmScheduler;
  private BackupFileManager backupFileManager;

  @Override
  protected void onCreate(Bundle state) {
    super.onCreate(state);

    webView = new WebView(this);
    configureWebView(webView);

    restAlarmScheduler = new RestAlarmScheduler(this);
    backupFileManager = new BackupFileManager(this);

    GymNativeBridge bridge = new GymNativeBridge(
      this,
      restAlarmScheduler,
      backupFileManager,
      this::reportBackupError
    );
    webView.addJavascriptInterface(bridge, "GymNative");
    webView.setWebViewClient(new VantaWebViewClient(this, this::applyWindowInsets));

    setContentView(webView);
    webView.loadUrl("file:///android_asset/index.html");
  }

  private void configureWebView(WebView view) {
    WebSettings settings = view.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setCacheMode(WebSettings.LOAD_DEFAULT);
    settings.setDefaultTextEncodingName("UTF-8");

    view.setWebChromeClient(new WebChromeClient());
    view.setLayerType(View.LAYER_TYPE_HARDWARE, null);
    view.setOverScrollMode(View.OVER_SCROLL_NEVER);
    view.setVerticalScrollBarEnabled(false);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      view.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, true);
    }
  }

  private void applyWindowInsets() {
    WindowInsetsHelper.applyStatusBarInset(this, webView);
  }

  private void jsCallback(String script) {
    if (webView == null) return;
    runOnUiThread(() -> webView.evaluateJavascript(script, null));
  }

  private void reportBackupError(String message) {
    jsCallback(
      "window.GymProBackupError&&window.GymProBackupError("
        + JSONObject.quote(message)
        + ")"
    );
  }

  @Override
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (resultCode != RESULT_OK || data == null || data.getData() == null) return;

    try {
      if (requestCode == BackupFileManager.CREATE_REQUEST) {
        backupFileManager.write(data.getData());
        jsCallback("window.GymProBackupSaved&&window.GymProBackupSaved()");
      } else if (requestCode == BackupFileManager.OPEN_REQUEST) {
        String raw = backupFileManager.read(data.getData());
        jsCallback(
          "window.GymProImportBackup&&window.GymProImportBackup("
            + JSONObject.quote(raw)
            + ")"
        );
      }
    } catch (Exception ignored) {
      reportBackupError(
        requestCode == BackupFileManager.CREATE_REQUEST
          ? "Could not save backup file"
          : "Could not read backup file"
      );
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
    if (webView == null) return;
    applyWindowInsets();
    webView.evaluateJavascript(
      "if(window.GymProResume){window.GymProResume();}",
      null
    );
  }

  private void exitFromSystemBack() {
    super.onBackPressed();
  }

  @Override
  public void onBackPressed() {
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
