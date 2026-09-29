package com.ahmed.gympro;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  private WebView webView;
  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    webView=new WebView(this);
    WebSettings s=webView.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDefaultTextEncodingName("UTF-8");
    webView.setWebViewClient(new WebViewClient());
    setContentView(webView);
    webView.loadUrl("file:///android_asset/index.html");
  }
  @Override public void onBackPressed() {
    if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
  }
}
