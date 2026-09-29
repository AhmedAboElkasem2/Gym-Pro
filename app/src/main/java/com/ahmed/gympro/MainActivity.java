package com.ahmed.gympro;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  private WebView webView;

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    webView = new WebView(this);
    WebSettings s = webView.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDefaultTextEncodingName("UTF-8");

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

  @Override public void onBackPressed() {
    if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
  }
}