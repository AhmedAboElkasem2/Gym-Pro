package com.ahmed.gympro;

import android.content.Context;
import android.widget.ImageView;

/**
 * Full-screen VantaLift launch artwork.
 *
 * The complete approved splash composition is stored as one image so the
 * emblem, smoke, lighting, wordmark and floor reflection always remain
 * visually integrated. Nothing is composited on top of a separate background.
 */
final class VantaSplashView extends ImageView {
  VantaSplashView(Context context) {
    super(context);
    setBackgroundColor(0xFF050608);
    setScaleType(ScaleType.CENTER_CROP);
    setAdjustViewBounds(false);
    setImageResource(R.drawable.vantalift_splash_approved);
    setContentDescription(null);
    setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
  }
}
