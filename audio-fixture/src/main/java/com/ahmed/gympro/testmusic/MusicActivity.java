package com.ahmed.gympro.testmusic;
public final class MusicActivity extends android.app.Activity {
  @Override public void onCreate(android.os.Bundle state) {
    super.onCreate(state);
    android.widget.TextView text = new android.widget.TextView(this);
    text.setText("Competing music app — emulator test only");
    setContentView(text);
    startForegroundService(new android.content.Intent(this, MusicService.class));
  }
}
