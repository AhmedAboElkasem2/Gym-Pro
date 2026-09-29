package com.ahmed.gympro;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

final class VantaWebViewClient extends WebViewClient {
  private final Activity activity;
  private final Runnable onPageReady;

  VantaWebViewClient(Activity activity, Runnable onPageReady) {
    this.activity = activity;
    this.onPageReady = onPageReady;
  }

  @Override
  public void onPageFinished(WebView view, String url) {
    super.onPageFinished(view, url);
    onPageReady.run();
  }

  @Override
  public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
    return openExternal(request.getUrl());
  }

  @Override
  public boolean shouldOverrideUrlLoading(WebView view, String url) {
    return url != null && openExternal(Uri.parse(url));
  }

  private boolean openExternal(Uri uri) {
    String scheme = uri.getScheme();
    if (!"http".equals(scheme) && !"https".equals(scheme)) return false;
    try {
      activity.startActivity(new Intent(Intent.ACTION_VIEW, uri));
      return true;
    } catch (Exception ignored) {
      return false;
    }
  }
}
