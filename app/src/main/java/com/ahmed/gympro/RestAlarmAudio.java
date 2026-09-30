package com.ahmed.gympro;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;

/** Owns output only. The foreground service owns this object's lifetime. */
final class RestAlarmAudio implements AutoCloseable {
  private final Context context;
  private final AudioManager manager;
  private final Handler handler = new Handler(Looper.getMainLooper());
  private final AudioAttributes attributes = new AudioAttributes.Builder()
    .setUsage(AudioAttributes.USAGE_ALARM)
    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
  private final AudioManager.OnAudioFocusChangeListener focusListener = this::onFocusChanged;
  private AudioFocusRequest focusRequest;
  private MediaPlayer player;
  private Vibrator vibrator;
  private boolean started;
  private boolean closed;

  RestAlarmAudio(Context context) {
    this.context = context;
    manager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
  }

  void start() {
    if (started || closed) return;
    started = true;
    vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
    if (vibrator != null && vibrator.hasVibrator()) {
      long[] pattern = {0, 450, 220, 450, 220, 900};
      if (Build.VERSION.SDK_INT >= 26) vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
      else vibrator.vibrate(pattern, 0);
    }
    requestFocus();
  }

  private void requestFocus() {
    if (closed || manager == null) return;
    int result;
    if (Build.VERSION.SDK_INT >= 26) {
      focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
        .setAudioAttributes(attributes)
        .setAcceptsDelayedFocusGain(true)
        .setOnAudioFocusChangeListener(focusListener, handler).build();
      result = manager.requestAudioFocus(focusRequest);
    } else {
      result = manager.requestAudioFocus(focusListener, AudioManager.STREAM_ALARM,
        AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK);
    }
    if (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) play();
    else if (result == AudioManager.AUDIOFOCUS_REQUEST_FAILED) {
      // For example, a call can temporarily deny focus. Keep the pending alarm/vibration.
      handler.postDelayed(this::requestFocus, 2000);
    }
  }

  private void onFocusChanged(int change) {
    if (closed) return;
    if (change == AudioManager.AUDIOFOCUS_GAIN) play();
    else if (change == AudioManager.AUDIOFOCUS_LOSS
        || change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
      if (player != null && player.isPlaying()) player.pause();
    }
  }

  private void play() {
    if (closed) return;
    if (player != null) {
      if (!player.isPlaying()) player.start();
      return;
    }
    Uri selected = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
    if (!prepare(selected)) prepare(fallbackUri());
  }

  private Uri fallbackUri() {
    return Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.rest_alarm);
  }

  private boolean prepare(Uri uri) {
    try {
      if (uri == null) return false;
      player = new MediaPlayer();
      player.setAudioAttributes(attributes);
      player.setWakeMode(context, PowerManager.PARTIAL_WAKE_LOCK);
      player.setDataSource(context, uri);
      player.setLooping(true);
      player.setOnErrorListener((failed, what, extra) -> {
        releasePlayer();
        if (!closed && !uri.equals(fallbackUri())) prepare(fallbackUri());
        return true;
      });
      player.prepare();
      player.start();
      return true;
    } catch (Exception error) {
      Log.w("RestAlarm", "Alarm sound unavailable; trying bundled fallback", error);
      releasePlayer();
      return false;
    }
  }

  private void releasePlayer() {
    if (player != null) {
      player.release();
      player = null;
    }
  }

  @Override public void close() {
    closed = true;
    handler.removeCallbacksAndMessages(null);
    if (vibrator != null) vibrator.cancel();
    releasePlayer();
    if (manager != null) {
      if (Build.VERSION.SDK_INT >= 26 && focusRequest != null) manager.abandonAudioFocusRequest(focusRequest);
      else manager.abandonAudioFocus(focusListener);
    }
  }
}
