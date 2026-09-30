package com.ahmed.gympro;

import static org.junit.Assert.*;
import static org.robolectric.Shadows.shadowOf;
import android.app.*;
import android.content.*;
import org.junit.*;
import org.junit.runner.RunWith;
import org.robolectric.*;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35)
public class RestTimerActionsTest {
  private Context context;
  @Before public void setup() {
    context = RuntimeEnvironment.getApplication();
    RestAlarmState.prefs(context).edit().clear().commit();
    shadowOf(context.getSystemService(AlarmManager.class)).setCanScheduleExactAlarms(true);
  }

  @Test public void extendThenSkipUpdatesNativeDeadlineWithoutRinging() {
    new RestAlarmController(context).schedule(90);
    new RestTimerActionReceiver().onReceive(context, new Intent(RestTimerActionReceiver.EXTEND)
      .putExtra("token", RestAlarmState.pendingToken(context)));
    assertTrue(RestAlarmState.remainingMillis(context) >= 119000);
    new RestTimerActionReceiver().onReceive(context, new Intent(RestTimerActionReceiver.SKIP)
      .putExtra("token", RestAlarmState.pendingToken(context)));
    assertFalse(RestAlarmState.hasPending(context));
    assertFalse(RestAlarmState.isActive(context));
  }

  @Test public void oldControlsCannotChangeAnotherCountdownOrAnActiveAlarm() {
    new RestAlarmController(context).schedule(90);
    new RestTimerActionReceiver().onReceive(context, new Intent(RestTimerActionReceiver.SKIP).putExtra("token", "old"));
    assertTrue(RestAlarmState.hasPending(context));
    String token = RestAlarmState.pendingToken(context);
    RestAlarmState.claim(context, token);
    new RestTimerActionReceiver().onReceive(context, new Intent(RestTimerActionReceiver.SKIP).putExtra("token", token));
    assertTrue(RestAlarmState.isActive(context));
  }

  @Test public void notificationExposesThreeCountdownActionsButNoRingingSkip() {
    Notification countdown = new RestAlarmNotification(context).build(false, 90000);
    assertEquals(3, countdown.actions.length);
    assertEquals("+30 sec", countdown.actions[0].title.toString());
    assertNull(new RestAlarmNotification(context).build(true, 0).actions);
  }
}
