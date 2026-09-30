package com.ahmed.gympro;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.OutputStream;

/** PNG export lives outside the Activity and never requests broad storage permissions. */
final class WorkoutCardExporter {
  static final int SAVE_REQUEST = 9420;
  private final Activity activity;
  private final File directory;

  WorkoutCardExporter(Activity activity) {
    this.activity = activity;
    directory = new File(activity.getCacheDir(), "workout-cards");
  }

  void export(String dataUrl, boolean share) throws Exception {
    String prefix = "data:image/png;base64,";
    if (dataUrl == null || !dataUrl.startsWith(prefix) || dataUrl.length() > 8_000_000)
      throw new IllegalArgumentException("Invalid image");
    byte[] png = Base64.decode(dataUrl.substring(prefix.length()), Base64.DEFAULT);
    if (png.length < 8 || png[0] != (byte) 137 || png[1] != 80 || png[2] != 78 || png[3] != 71)
      throw new IllegalArgumentException("Invalid PNG");
    if (!directory.exists() && !directory.mkdirs()) throw new IllegalStateException("No cache space");
    File file = new File(directory, share ? "workout-" + System.currentTimeMillis() + ".png" : "pending-save.png");
    File[] oldFiles = directory.listFiles();
    if (oldFiles != null) for (File old : oldFiles) {
      if (System.currentTimeMillis() - old.lastModified() > 86_400_000L) old.delete();
    }
    try (FileOutputStream output = new FileOutputStream(file)) { output.write(png); }
    if (share) {
      Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".cards", file);
      Intent send = new Intent(Intent.ACTION_SEND).setType("image/png")
        .putExtra(Intent.EXTRA_STREAM, uri).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
      send.setClipData(ClipData.newRawUri("Workout card", uri));
      activity.startActivity(Intent.createChooser(send, "Share workout card"));
    } else {
      Intent save = new Intent(Intent.ACTION_CREATE_DOCUMENT).setType("image/png")
        .addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_TITLE, "VantaLift-workout.png");
      activity.startActivityForResult(save, SAVE_REQUEST);
    }
  }

  void saveTo(Uri uri) throws Exception {
    try (FileInputStream input = new FileInputStream(new File(directory, "pending-save.png"));
         OutputStream output = activity.getContentResolver().openOutputStream(uri)) {
      if (output == null) throw new IllegalStateException("Destination unavailable");
      byte[] buffer = new byte[8192];
      int count;
      while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
    }
  }
}
