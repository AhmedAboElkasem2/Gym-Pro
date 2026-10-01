package com.ahmed.gympro;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RadialGradient;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.view.View;

/**
 * Premium launch artwork rendered natively so the splash stays sharp,
 * scales safely across aspect ratios, and visually blends into the app.
 */
final class VantaSplashView extends View {
  private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
  private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
  private final Bitmap emblem;
  private final Rect emblemSource = new Rect();

  VantaSplashView(Context context) {
    super(context);
    setBackgroundColor(0xFF050608);
    setLayerType(View.LAYER_TYPE_SOFTWARE, null);

    emblem = BitmapFactory.decodeResource(getResources(), R.drawable.vantalift_app_icon);
    if (emblem != null) {
      int insetX = Math.round(emblem.getWidth() * 0.115f);
      int insetY = Math.round(emblem.getHeight() * 0.115f);
      emblemSource.set(insetX, insetY, emblem.getWidth() - insetX, emblem.getHeight() - insetY);
    }

    textPaint.setTypeface(Typeface.create("sans-serif-light", Typeface.NORMAL));
    textPaint.setTextAlign(Paint.Align.LEFT);
  }

  @Override
  protected void onDraw(Canvas canvas) {
    super.onDraw(canvas);

    final float w = getWidth();
    final float h = getHeight();
    if (w <= 0 || h <= 0) return;

    canvas.drawColor(Color.rgb(5, 6, 8));
    drawAtmosphere(canvas, w, h);
    drawEmblem(canvas, w, h);
    drawWordmark(canvas, w, h);
    drawReflection(canvas, w, h);
  }

  private void drawAtmosphere(Canvas canvas, float w, float h) {
    paint.setStyle(Paint.Style.FILL);

    paint.setShader(new RadialGradient(
      w * 0.18f, h * 0.42f, w * 0.72f,
      new int[]{0x66F04444, 0x22F04444, 0x00000000},
      new float[]{0f, 0.46f, 1f},
      Shader.TileMode.CLAMP
    ));
    canvas.drawRect(0, 0, w, h, paint);

    paint.setShader(new RadialGradient(
      w * 0.82f, h * 0.42f, w * 0.72f,
      new int[]{0x558D72FF, 0x228D72FF, 0x00000000},
      new float[]{0f, 0.47f, 1f},
      Shader.TileMode.CLAMP
    ));
    canvas.drawRect(0, 0, w, h, paint);

    Path leftBeam = new Path();
    leftBeam.moveTo(w * 0.05f, 0);
    leftBeam.lineTo(w * 0.18f, 0);
    leftBeam.lineTo(w * 0.47f, h * 0.39f);
    leftBeam.lineTo(w * 0.42f, h * 0.42f);
    leftBeam.close();

    paint.setShader(new LinearGradient(
      0, 0, w * 0.5f, h * 0.45f,
      0x00F04444, 0x33F04444, Shader.TileMode.CLAMP
    ));
    canvas.drawPath(leftBeam, paint);

    Path rightBeam = new Path();
    rightBeam.moveTo(w * 0.82f, 0);
    rightBeam.lineTo(w * 0.95f, 0);
    rightBeam.lineTo(w * 0.58f, h * 0.42f);
    rightBeam.lineTo(w * 0.53f, h * 0.39f);
    rightBeam.close();

    paint.setShader(new LinearGradient(
      w, 0, w * 0.5f, h * 0.45f,
      0x008D72FF, 0x338D72FF, Shader.TileMode.CLAMP
    ));
    canvas.drawPath(rightBeam, paint);

    paint.setShader(null);
  }

  private void drawEmblem(Canvas canvas, float w, float h) {
    if (emblem == null) return;

    float size = Math.min(w * 0.49f, h * 0.245f);
    float cx = w * 0.5f;
    float cy = h * 0.395f;
    RectF dst = new RectF(
      cx - size * 0.5f,
      cy - size * 0.5f,
      cx + size * 0.5f,
      cy + size * 0.5f
    );

    paint.setShader(new RadialGradient(
      cx, cy, size * 0.72f,
      new int[]{0x44F04444, 0x228D72FF, 0x00000000},
      new float[]{0f, 0.52f, 1f},
      Shader.TileMode.CLAMP
    ));
    canvas.drawCircle(cx, cy, size * 0.78f, paint);
    paint.setShader(null);

    paint.setAlpha(255);
    canvas.drawBitmap(emblem, emblemSource, dst, paint);
  }

  private void drawWordmark(Canvas canvas, float w, float h) {
    float textSize = Math.min(w * 0.093f, h * 0.044f);
    textPaint.setTextSize(textSize);

    String left = "Vanta";
    String right = "Lift";

    float leftWidth = textPaint.measureText(left);
    float rightWidth = textPaint.measureText(right);
    float startX = (w - leftWidth - rightWidth) * 0.5f;
    float baseline = h * 0.565f;

    textPaint.setColor(0xFFF0F1F4);
    textPaint.setShadowLayer(textSize * 0.18f, 0, 0, 0x553C3F48);
    canvas.drawText(left, startX, baseline, textPaint);

    textPaint.setColor(0xFFFF5158);
    textPaint.setShadowLayer(textSize * 0.20f, 0, 0, 0x88F04444);
    canvas.drawText(right, startX + leftWidth, baseline, textPaint);

    textPaint.clearShadowLayer();

    float lineY = baseline + textSize * 0.52f;
    float halfLine = (leftWidth + rightWidth) * 0.37f;
    paint.setShader(new LinearGradient(
      w * 0.5f - halfLine, lineY,
      w * 0.5f + halfLine, lineY,
      new int[]{0x00F04444, 0xCCF04444, 0xCC8D72FF, 0x008D72FF},
      null,
      Shader.TileMode.CLAMP
    ));
    canvas.drawRoundRect(
      new RectF(w * 0.5f - halfLine, lineY - 1.5f, w * 0.5f + halfLine, lineY + 1.5f),
      2f, 2f, paint
    );
    paint.setShader(null);

    paint.setColor(0xFFF4E9FF);
    canvas.drawCircle(w * 0.5f, lineY, Math.max(2.2f, w * 0.004f), paint);
  }

  private void drawReflection(Canvas canvas, float w, float h) {
    float floorY = h * 0.79f;

    paint.setShader(new LinearGradient(
      0, floorY, 0, h,
      new int[]{0x2213161D, 0x88040508, 0xFF020304},
      new float[]{0f, 0.35f, 1f},
      Shader.TileMode.CLAMP
    ));
    canvas.drawRect(0, floorY, w, h, paint);

    paint.setShader(new RadialGradient(
      w * 0.29f, floorY + h * 0.10f, w * 0.33f,
      new int[]{0x44F04444, 0x11F04444, 0x00000000},
      new float[]{0f, 0.52f, 1f},
      Shader.TileMode.CLAMP
    ));
    canvas.drawRect(0, floorY, w, h, paint);

    paint.setShader(new RadialGradient(
      w * 0.71f, floorY + h * 0.10f, w * 0.33f,
      new int[]{0x448D72FF, 0x118D72FF, 0x00000000},
      new float[]{0f, 0.52f, 1f},
      Shader.TileMode.CLAMP
    ));
    canvas.drawRect(0, floorY, w, h, paint);

    paint.setShader(null);
    paint.setColor(0x22FFFFFF);
    canvas.drawRect(0, floorY, w, floorY + 1f, paint);
  }
}
