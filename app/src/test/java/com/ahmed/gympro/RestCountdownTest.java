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

  @Test public void timerUsesNormalChannelAndLargeSystemCountdown() {
    NotificationManager manager = context.getSystemService(NotificationManager.class);
    manager.createNotificationChannel(new NotificationChannel(
      "vantalift_rest_countdown", "Old timer", NotificationManager.IMPORTANCE_LOW));
    Notification n = new RestAlarmNotification(context).build(false, 90_000);
    NotificationChannel channel = manager.getNotificationChannel(n.getChannelId());
    assertEquals(NotificationManager.IMPORTANCE_DEFAULT, channel.getImportance());
    assertNull(channel.getSound());
    assertFalse(channel.shouldVibrate());
    assertNotNull(n.contentView);
    assertNotNull(n.bigContentView);
    android.view.View view = n.contentView.apply(context, new android.widget.FrameLayout(context));
    android.widget.Chronometer timer = view.findViewById(R.id.rest_countdown);
    assertTrue(timer.isCountDown());
    assertTrue(timer.getBase() >= SystemClock.elapsedRealtime() + 89_000);
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
