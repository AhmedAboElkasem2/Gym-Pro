package com.ahmed.gympro;

import static org.junit.Assert.*;
import static org.robolectric.Shadows.shadowOf;
import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = {31, 35})
public class RestAlarmTest {
  private Context context;
  private AlarmManager alarms;
  private RestAlarmController controller;

  @Before public void setup() {
    context = RuntimeEnvironment.getApplication();
    RestAlarmState.prefs(context).edit().clear().commit();
    alarms = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    shadowOf(alarms).setCanScheduleExactAlarms(true);
    controller = new RestAlarmController(context);
  }

  @Test public void schedulesAnExactAlarmClockOutsideWebViewLifetime() {
    long now = System.currentTimeMillis();
    assertTrue(controller.schedule(60));
    assertNotNull(alarms.getNextAlarmClock());
    assertTrue(alarms.getNextAlarmClock().getTriggerTime() >= now + 60_000);
    assertTrue(alarms.getNextAlarmClock().getTriggerTime() < now + 61_000);
  }

  @Test public void deniedPermissionDoesNotPretendTimerIsScheduled() {
    shadowOf(alarms).setCanScheduleExactAlarms(false);
    assertFalse(controller.schedule(60));
    assertNull(alarms.getNextAlarmClock());
  }

  @Test public void cancelBeforeDeadlineInvalidatesEvenAlreadyDeliveredBroadcast() {
    controller.schedule(60);
    String token = RestAlarmState.prefs(context).getString("pending", null);
    controller.cancel();
    new RestAlarmReceiver().onReceive(context, new Intent().putExtra("token", token));
    assertFalse(controller.isActive());
    assertNull(alarms.getNextAlarmClock());
  }

  @Test public void replacingTimerRejectsOldCompletion() {
    controller.schedule(60);
    String old = RestAlarmState.prefs(context).getString("pending", null);
    controller.schedule(120);
    assertFalse(RestAlarmState.claim(context, old));
    assertFalse(controller.isActive());
  }

  @Test public void completionSurvivesCancelAndCannotBeReplacedUntilOk() {
    controller.schedule(60);
    String token = RestAlarmState.prefs(context).getString("pending", null);
    assertTrue(RestAlarmState.claim(context, token));
    controller.cancel();
    assertTrue(new RestAlarmController(context).isActive());
    assertFalse(controller.schedule(90));
    assertTrue(controller.isActive());
    controller.acknowledge();
    assertFalse(controller.isActive());
    assertFalse(RestAlarmState.claim(context, token));
    assertTrue(controller.schedule(90));
  }

  @Test public void duplicateCompletionCannotRestartAcknowledgedAlarm() {
    RestAlarmState.pending(context, "same-timer");
    assertTrue(RestAlarmState.claim(context, "same-timer"));
    controller.acknowledge();
    new RestAlarmReceiver().onReceive(context, new Intent().putExtra("token", "same-timer"));
    assertFalse(controller.isActive());
  }
}
