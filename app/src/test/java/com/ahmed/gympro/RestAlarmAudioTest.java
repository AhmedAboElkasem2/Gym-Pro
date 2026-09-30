package com.ahmed.gympro;

import static org.junit.Assert.*;
import static org.robolectric.Shadows.shadowOf;
import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import org.robolectric.shadows.ShadowMediaPlayer;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowAudioManager;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35)
public class RestAlarmAudioTest {
  @Test public void ducksMusicWithoutChangingVolumeAndReturnsFocusOnOk() throws Exception {
    ShadowMediaPlayer.setMediaInfoProvider(source -> new ShadowMediaPlayer.MediaInfo(2000, 0));
    Context context = RuntimeEnvironment.getApplication();
    AudioManager manager = context.getSystemService(AudioManager.class);
    int musicVolume = manager.getStreamVolume(AudioManager.STREAM_MUSIC);
    RestAlarmAudio audio = new RestAlarmAudio(context);
    audio.start();
    ShadowAudioManager.AudioFocusRequest request = shadowOf(manager).getLastAudioFocusRequest();
    assertEquals(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK, request.durationHint);
    assertEquals(AudioAttributes.USAGE_ALARM, request.audioFocusRequest.getAudioAttributes().getUsage());
    assertEquals(musicVolume, manager.getStreamVolume(AudioManager.STREAM_MUSIC));
    java.lang.reflect.Field field = RestAlarmAudio.class.getDeclaredField("player");
    field.setAccessible(true);
    MediaPlayer player = (MediaPlayer) field.get(audio);
    assertNotNull(player);
    assertTrue(player.isLooping());
    assertTrue(player.isPlaying());
    request.listener.onAudioFocusChange(AudioManager.AUDIOFOCUS_LOSS_TRANSIENT);
    assertFalse(player.isPlaying());
    request.listener.onAudioFocusChange(AudioManager.AUDIOFOCUS_GAIN);
    assertTrue(player.isPlaying());
    audio.close();
    assertNull(field.get(audio));
    assertSame(request.audioFocusRequest, shadowOf(manager).getLastAbandonedAudioFocusRequest());
    // A delayed focus grant after OK must not start the output again.
    request.listener.onAudioFocusChange(AudioManager.AUDIOFOCUS_GAIN);
    assertNull(field.get(audio));
    assertEquals(musicVolume, manager.getStreamVolume(AudioManager.STREAM_MUSIC));
  }
}
