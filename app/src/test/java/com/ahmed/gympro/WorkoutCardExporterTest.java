package com.ahmed.gympro;

import static org.junit.Assert.*;
import static org.robolectric.Shadows.shadowOf;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import java.io.File;
import org.junit.*;
import org.junit.runner.RunWith;
import org.robolectric.*;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(sdk = 35)
public class WorkoutCardExporterTest {
  private static final String PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";

  @Test public void shareUsesReadOnlyContentUriAndPreservesPng() throws Exception {
    Activity activity = Robolectric.buildActivity(Activity.class).setup().get();
    new WorkoutCardExporter(activity).export(PNG, true);
    Intent chooser = shadowOf(activity).getNextStartedActivity();
    assertEquals(Intent.ACTION_CHOOSER, chooser.getAction());
    Intent send = chooser.getParcelableExtra(Intent.EXTRA_INTENT);
    Uri uri = send.getParcelableExtra(Intent.EXTRA_STREAM);
    assertEquals("content", uri.getScheme());
    assertEquals("image/png", send.getType());
    assertTrue((send.getFlags() & Intent.FLAG_GRANT_READ_URI_PERMISSION) != 0);
    try (java.io.InputStream input = activity.getContentResolver().openInputStream(uri)) {
      assertEquals(137, input.read());
    }
  }

  @Test public void saveUsesDocumentPickerAndWritesPng() throws Exception {
    Activity activity = Robolectric.buildActivity(Activity.class).setup().get();
    WorkoutCardExporter exporter = new WorkoutCardExporter(activity);
    exporter.export(PNG, false);
    assertEquals(Intent.ACTION_CREATE_DOCUMENT, shadowOf(activity).getNextStartedActivityForResult().intent.getAction());
    File output = new File(activity.getCacheDir(), "saved-test.png");
    exporter.saveTo(Uri.fromFile(output));
    assertTrue(output.length() > 8);
  }
}
