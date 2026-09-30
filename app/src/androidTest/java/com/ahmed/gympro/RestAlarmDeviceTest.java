package com.ahmed.gympro;

import static org.junit.Assert.*;
import android.app.NotificationManager;
import android.app.Notification;
import android.media.AudioManager;
import android.media.AudioAttributes;
import android.content.Context;
import android.os.SystemClock;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.Until;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class RestAlarmDeviceTest {
  private Context context;
  private UiDevice device;
  private RestAlarmController controller;

  @Before public void setup() throws Exception {
    context = InstrumentationRegistry.getInstrumentation().getTargetContext();
    device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
    controller = new RestAlarmController(context);
    controller.acknowledge();
    device.executeShellCommand("pm grant com.ahmed.gympro android.permission.POST_NOTIFICATIONS");
    device.wakeUp();
    device.executeShellCommand("wm dismiss-keyguard");
  }

  @After public void cleanup() throws Exception {
    controller.acknowledge();
    device.executeShellCommand("dumpsys deviceidle unforce");
    device.executeShellCommand("dumpsys battery reset");
    device.wakeUp();
    device.executeShellCommand("am force-stop com.ahmed.gympro.testmusic");
  }

  @Test public void lockedScreenAlarmPersistsAndOnlyOkStopsIt() throws Exception {
    try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
      awaitWeb(scenario, "typeof window.VantaLiftRestAlarmActive==='function'");
      awaitVisualFrame(scenario);
      assertTrue(controller.schedule(8));
      backgroundToLauncher();
      device.sleep();
      device.executeShellCommand("dumpsys battery unplug");
      device.executeShellCommand("dumpsys deviceidle force-idle");
      long start = SystemClock.elapsedRealtime();
      while (!controller.isActive() && SystemClock.elapsedRealtime() - start < 14_000) {
        SystemClock.sleep(100);
      }
      assertTrue("Alarm missed the locked-screen deadline", controller.isActive());
      awaitAudio(AudioAttributes.USAGE_ALARM, true);
      SystemClock.sleep(4000);
      assertTrue("Alarm audio stopped before OK", isAudioActive(AudioAttributes.USAGE_ALARM));
      NotificationManager notifications = context.getSystemService(NotificationManager.class);
      assertEquals("Ringing foreground notification must persist", 1, notifications.getActiveNotifications().length);
      controller.cancel(); // Finishing/exiting a workout must not acknowledge a ringing alarm.
      assertTrue(controller.isActive());
      device.wakeUp();
      device.executeShellCommand("wm dismiss-keyguard");
      context.startActivity(context.getPackageManager().getLaunchIntentForPackage(context.getPackageName()));
      awaitWeb(scenario, "document.querySelector('#modal').dataset.variant==='rest-alarm'");
      eval(scenario, "window.VantaLiftHandleBack()");
      assertEquals("true", eval(scenario, "document.querySelector('#modal').classList.contains('persistent-modal')"));
      assertTrue(controller.isActive());
      eval(scenario, "document.querySelector('#restAlarmOk').click()");
      assertFalse(controller.isActive());
      long stop = SystemClock.elapsedRealtime() + 3000;
      while (notifications.getActiveNotifications().length > 0 && SystemClock.elapsedRealtime() < stop) SystemClock.sleep(50);
      assertEquals(0, notifications.getActiveNotifications().length);
    }
  }

  @Test public void completionWhileForegroundImmediatelyShowsDialog() throws Exception {
    try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
      awaitWeb(scenario, "typeof window.VantaLiftRestAlarmActive==='function'");
      awaitVisualFrame(scenario);
      assertTrue(controller.schedule(2));
      awaitWeb(scenario, "document.querySelector('#modal').dataset.variant==='rest-alarm'");
      assertEquals("true", eval(scenario, "document.querySelector('#modal').textContent.includes('BE HULK')"));
      eval(scenario, "document.querySelector('#restAlarmOk').click()");
      assertFalse(controller.isActive());
    }
  }

  @Test public void musicKeepsPlayingWhileLockedAlarmStartsBeforeOpeningApp() throws Exception {
    try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
      awaitWeb(scenario, "typeof window.VantaLiftRestAlarmActive==='function'");
      awaitVisualFrame(scenario);
      assertTrue(controller.schedule(12));
      device.executeShellCommand("am start -W -n com.ahmed.gympro.testmusic/.MusicActivity");
      awaitAudio(AudioAttributes.USAGE_MEDIA, true);
      int volume = context.getSystemService(AudioManager.class).getStreamVolume(AudioManager.STREAM_MUSIC);
      device.sleep();
      awaitAudio(AudioAttributes.USAGE_ALARM, true);
      assertTrue(controller.isActive());
      assertTrue("Music must continue underneath alarm", isAudioActive(AudioAttributes.USAGE_MEDIA));
      SystemClock.sleep(4000);
      assertTrue("Alarm must loop while app stays backgrounded", isAudioActive(AudioAttributes.USAGE_ALARM));
      assertEquals(volume, context.getSystemService(AudioManager.class).getStreamVolume(AudioManager.STREAM_MUSIC));
      controller.acknowledge();
      awaitAudio(AudioAttributes.USAGE_ALARM, false);
      assertTrue("Music must continue after focus is returned", isAudioActive(AudioAttributes.USAGE_MEDIA));
    }
  }

  @Test public void countdownNotificationOpensSameWorkoutAndRecreationRestoresAllEdits() throws Exception {
    try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
      awaitWeb(scenario, "typeof window.VantaLiftRestAlarmActive==='function'");
      awaitVisualFrame(scenario);
      eval(scenario, "localStorage.removeItem('vantalift-active-workout-v1');location.reload()");
      awaitWeb(scenario, "!!document.querySelector('[data-start]')");
      eval(scenario, "document.querySelector('[data-start]').click()");
      awaitWeb(scenario, "!!document.querySelector('#workoutNote')");
      eval(scenario, "var w=document.querySelector('[data-f=w]');w.value='67.5';w.dispatchEvent(new Event('input'));var r=document.querySelector('[data-f=reps]');r.value='9';r.dispatchEvent(new Event('input'));var n=document.querySelector('#workoutNote');n.value='Saved workout note';n.dispatchEvent(new Event('input'));document.querySelector('[data-f=done]').click()");
      String saved = eval(scenario, "localStorage.getItem('vantalift-active-workout-v1')");
      assertTrue(saved.contains("67.5"));
      NotificationManager manager = context.getSystemService(NotificationManager.class);
      long waitUntil = SystemClock.elapsedRealtime() + 3000;
      while (manager.getActiveNotifications().length == 0 && SystemClock.elapsedRealtime() < waitUntil) SystemClock.sleep(50);
      Notification countdown = manager.getActiveNotifications()[0].getNotification();
      assertEquals("Rest timer", countdown.extras.getString(Notification.EXTRA_TITLE));
      assertTrue(countdown.extras.getBoolean(Notification.EXTRA_SHOW_CHRONOMETER));
      assertTrue(countdown.extras.getBoolean(Notification.EXTRA_CHRONOMETER_COUNT_DOWN));
      assertTrue(countdown.when > System.currentTimeMillis());
      AtomicReference<MainActivity> original = new AtomicReference<>();
      scenario.onActivity(original::set);
      backgroundToLauncher();
      device.openNotification();
      assertTrue(device.wait(Until.hasObject(By.text("RECOVERY")), 5000));
      device.waitForIdle();
      device.takeScreenshot(new java.io.File(context.getExternalFilesDir(null), "rest-countdown.png"));
      device.executeShellCommand("cp " + new java.io.File(context.getExternalFilesDir(null), "rest-countdown.png").getAbsolutePath() + " /data/local/tmp/rest-countdown.png");
      device.findObject(By.text("RECOVERY")).click();
      awaitWeb(scenario, "!!document.querySelector('#workoutNote')");
      scenario.onActivity(activity -> assertSame("Notification must reuse Activity", original.get(), activity));
      assertEquals(saved, eval(scenario, "localStorage.getItem('vantalift-active-workout-v1')"));
      scenario.recreate();
      awaitWeb(scenario, "!!document.querySelector('#workoutNote')");
      assertEquals("\"67.5\"", eval(scenario, "document.querySelector('[data-f=w]').value"));
      assertEquals("true", eval(scenario, "document.querySelector('[data-f=done]').checked"));
      assertEquals("\"Saved workout note\"", eval(scenario, "document.querySelector('#workoutNote').value"));
      assertEquals(saved, eval(scenario, "localStorage.getItem('vantalift-active-workout-v1')"));
      eval(scenario, "document.querySelector('#exit').click();document.querySelector('#exitWorkoutNow').click()");
      assertEquals("null", eval(scenario, "localStorage.getItem('vantalift-active-workout-v1')"));
    }
  }

  @Test public void focusNotesAlternativesAndAchievementCardWorkTogether() throws Exception {
    try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
      awaitWeb(scenario, "typeof window.VantaLiftRestAlarmActive==='function'");
      awaitVisualFrame(scenario);
      eval(scenario, "localStorage.removeItem('vantalift-active-workout-v1');location.reload()");
      awaitWeb(scenario, "!!document.querySelector('[data-start]')");
      eval(scenario, "document.querySelector('[data-start]').click()");
      awaitWeb(scenario, "!!document.querySelector('#focusToggle')");
      eval(scenario, "var note=document.querySelector('[data-personal-note]');note.value='Seat 4';note.dispatchEvent(new Event('input'));document.querySelector('#focusToggle').click()");
      assertEquals("1", eval(scenario, "document.querySelectorAll('[data-f=w]').length"));
      eval(scenario, "document.querySelector('[data-swap]').click()");
      awaitWeb(scenario, "!!document.querySelector('[data-swap-index]')");
      eval(scenario, "document.querySelector('[data-swap-index]').click();var w=document.querySelector('[data-f=w]');w.value='25';w.dispatchEvent(new Event('input'));var r=document.querySelector('[data-f=reps]');r.value='8';r.dispatchEvent(new Event('input'));document.querySelector('[data-f=done]').click()");
      eval(scenario, "document.querySelector('#finish').click();document.querySelector('#workoutCard').click()");
      awaitWeb(scenario, "!!document.querySelector('#workoutCardCanvas')");
      assertEquals("1080", eval(scenario, "document.querySelector('#workoutCardCanvas').width"));
      assertEquals("1920", eval(scenario, "document.querySelector('#workoutCardCanvas').height"));
      assertEquals("true", eval(scenario, "document.querySelector('#workoutCardCanvas').toDataURL().startsWith('data:image/png;base64,')"));
      assertEquals("true", eval(scenario, "Object.values(JSON.parse(localStorage.getItem('gympro-v2')).exerciseNotes).includes('Seat 4')"));
    }
  }

  private void backgroundToLauncher() throws Exception {
    // Wait for the launcher transition instead of racing injected HOME/SLEEP key events
    // against the first cold WebView frame on a freshly booted CI emulator.
    device.executeShellCommand("am start -W -a android.intent.action.MAIN -c android.intent.category.HOME");
    device.waitForIdle(2000);
  }

  private void awaitVisualFrame(ActivityScenario<MainActivity> scenario) throws Exception {
    CountDownLatch rendered = new CountDownLatch(1);
    scenario.onActivity(activity -> {
      WebView view = (WebView) ((android.view.ViewGroup) activity.findViewById(android.R.id.content)).getChildAt(0);
      view.postVisualStateCallback(0, new WebView.VisualStateCallback() {
        @Override public void onComplete(long requestId) { rendered.countDown(); }
      });
    });
    assertTrue("Initial WebView frame did not render", rendered.await(20, TimeUnit.SECONDS));
    device.waitForIdle(2000);
  }

  private boolean isAudioActive(int usage) {
    return context.getSystemService(AudioManager.class).getActivePlaybackConfigurations().stream()
      .anyMatch(config -> config.getAudioAttributes().getUsage() == usage);
  }

  private void awaitAudio(int usage, boolean active) throws Exception {
    long deadline = SystemClock.elapsedRealtime() + 18_000;
    while (SystemClock.elapsedRealtime() < deadline) {
      if (isAudioActive(usage) == active) return;
      SystemClock.sleep(100);
    }
    fail("Actual audio playback usage=" + usage + " expected=" + active + "\n" + device.executeShellCommand("dumpsys audio"));
  }

  private void awaitWeb(ActivityScenario<MainActivity> scenario, String expression) throws Exception {
    long deadline = SystemClock.elapsedRealtime() + 30_000;
    while (SystemClock.elapsedRealtime() < deadline) {
      if ("true".equals(eval(scenario, expression))) return;
      SystemClock.sleep(100);
    }
    fail("WebView condition timed out: " + expression);
  }

  private String eval(ActivityScenario<MainActivity> scenario, String script) throws Exception {
    AtomicReference<String> result = new AtomicReference<>();
    CountDownLatch done = new CountDownLatch(1);
    scenario.onActivity(activity -> {
      WebView view = (WebView) ((android.view.ViewGroup) activity.findViewById(android.R.id.content)).getChildAt(0);
      view.evaluateJavascript(script, value -> { result.set(value); done.countDown(); });
    });
    assertTrue("WebView did not respond after initialization", done.await(15, TimeUnit.SECONDS));
    return result.get();
  }
}
