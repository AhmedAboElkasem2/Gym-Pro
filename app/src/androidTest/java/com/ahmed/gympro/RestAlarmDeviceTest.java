package com.ahmed.gympro;

import static org.junit.Assert.*;
import android.app.NotificationManager;
import android.content.Context;
import android.os.SystemClock;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.UiDevice;
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
  }

  @Test public void lockedScreenAlarmPersistsAndOnlyOkStopsIt() throws Exception {
    try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
      awaitWeb(scenario, "typeof window.VantaLiftRestAlarmActive==='function'");
      assertTrue(controller.schedule(8));
      device.pressHome();
      device.sleep();
      device.executeShellCommand("dumpsys battery unplug");
      device.executeShellCommand("dumpsys deviceidle force-idle");
      long start = SystemClock.elapsedRealtime();
      while (!controller.isActive() && SystemClock.elapsedRealtime() - start < 14_000) {
        SystemClock.sleep(100);
      }
      assertTrue("Alarm missed the locked-screen deadline", controller.isActive());
      SystemClock.sleep(4000);
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
      assertTrue(controller.schedule(2));
      awaitWeb(scenario, "document.querySelector('#modal').dataset.variant==='rest-alarm'");
      assertEquals("true", eval(scenario, "document.querySelector('#modal').textContent.includes('BE HULK')"));
      eval(scenario, "document.querySelector('#restAlarmOk').click()");
      assertFalse(controller.isActive());
    }
  }

  private void awaitWeb(ActivityScenario<MainActivity> scenario, String expression) throws Exception {
    long deadline = SystemClock.elapsedRealtime() + 10_000;
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
    assertTrue(done.await(5, TimeUnit.SECONDS));
    return result.get();
  }
}
