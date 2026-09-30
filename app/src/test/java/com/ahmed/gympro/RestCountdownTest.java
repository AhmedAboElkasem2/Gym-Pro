package com.ahmed.gympro;

import static org.junit.Assert.*;
import static org.robolectric.Shadows.shadowOf;
import android.app.*;
import android.content.*;
import android.os.*;
import org.junit.*;
import org.junit.runner.RunWith;
import org.robolectric.*;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35)
public class RestCountdownTest {
  private Context context;
  @Before public void setup() {
    context = RuntimeEnvironment.getApplication();
    RestAlarmState.prefs(context).edit().clear().commit();
    shadowOf(context.getSystemService(AlarmManager.class)).setCanScheduleExactAlarms(true);
  }

  @Test public void countdownUsesSystemChronometerAndReturnsToSameActivity() {
    Notification n = new RestAlarmNotification(context).build(false, 90_000);
    assertTrue(n.extras.getBoolean(Notification.EXTRA_SHOW_CHRONOMETER));
    assertTrue(n.extras.getBoolean(Notification.EXTRA_CHRONOMETER_COUNT_DOWN));
    assertTrue(n.when > System.currentTimeMillis() + 89_000);
    assertEquals("Rest timer", n.extras.getString(Notification.EXTRA_TITLE));
    assertTrue((RestAlarmNotification.openWorkout(context).getFlags() & Intent.FLAG_ACTIVITY_SINGLE_TOP) != 0);
    Notification ringing = new RestAlarmNotification(context).build(true, 0);
    assertFalse(ringing.extras.getBoolean(Notification.EXTRA_SHOW_CHRONOMETER));
  }

  @Test public void schedulingImmediatelyStartsForegroundCountdown() {
    RestAlarmController controller = new RestAlarmController(context);
    assertTrue(controller.schedule(90));
    Intent start = shadowOf((Application) context).getNextStartedService();
    assertEquals(RestAlarmService.class.getName(), start.getComponent().getClassName());
    assertTrue(RestAlarmState.remainingMillis(context) > 89_000);
    controller.cancel();
    assertEquals(0, RestAlarmState.remainingMillis(context));
    assertFalse(RestAlarmState.hasPending(context));
  }

  @Test public void remainingTimeIsRestoredAcrossControllerInstances() {
    new RestAlarmController(context).schedule(90);
    RestAlarmController restored = new RestAlarmController(context);
    assertTrue(RestAlarmState.remainingMillis(context) > 89_000);
    restored.cancel();
    assertFalse(RestAlarmState.hasPending(context));
  }
}
