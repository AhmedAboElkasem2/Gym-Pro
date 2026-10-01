package com.ahmed.gympro;

import android.app.Activity;
import android.os.SystemClock;
import android.view.ViewGroup;

final class VantaSplashController {
  private static final long MIN_VISIBLE_MS = 720L;
  private static final long FADE_MS = 240L;

  private final Activity activity;
  private VantaSplashView splash;
  private long shownAt;

  VantaSplashController(Activity activity) {
    this.activity = activity;
  }

  void show() {
    if (splash != null) return;
    shownAt = SystemClock.uptimeMillis();
    splash = new VantaSplashView(activity);
    splash.setClickable(true);
    activity.addContentView(
      splash,
      new ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    );
  }

  void dismissWhenReady() {
    if (splash == null) return;
    long delay = Math.max(0L, MIN_VISIBLE_MS - (SystemClock.uptimeMillis() - shownAt));
    VantaSplashView target = splash;
    target.postDelayed(() -> {
      if (target.getParent() == null) return;
      target.animate()
        .alpha(0f)
        .setDuration(FADE_MS)
        .withEndAction(() -> {
          if (target.getParent() instanceof ViewGroup) {
            ((ViewGroup) target.getParent()).removeView(target);
          }
          if (splash == target) splash = null;
        })
        .start();
    }, delay);
  }
}
