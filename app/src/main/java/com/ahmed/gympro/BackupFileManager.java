package com.ahmed.gympro;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

final class BackupFileManager {
  static final int CREATE_REQUEST = 9412;
  static final int OPEN_REQUEST = 9413;

  private final Activity activity;
  private String pendingJson;

  BackupFileManager(Activity activity) {
    this.activity = activity;
  }

  void requestSave(String json) {
    pendingJson = json;
    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType("application/json");
    intent.putExtra(Intent.EXTRA_TITLE, "VantaLift-Backup.json");
    activity.startActivityForResult(intent, CREATE_REQUEST);
  }

  void requestOpen() {
    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
    intent.addCategory(Intent.CATEGORY_OPENABLE);
    intent.setType("*/*");
    activity.startActivityForResult(intent, OPEN_REQUEST);
  }

  void write(Uri uri) throws Exception {
    OutputStream output = activity.getContentResolver().openOutputStream(uri, "w");
    if (output == null) throw new Exception("Could not create backup file");
    byte[] bytes = (pendingJson == null ? "{}" : pendingJson).getBytes(StandardCharsets.UTF_8);
    output.write(bytes);
    output.flush();
    output.close();
    pendingJson = null;
  }

  String read(Uri uri) throws Exception {
    InputStream input = activity.getContentResolver().openInputStream(uri);
    if (input == null) throw new Exception("Could not open backup file");
    BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8));
    StringBuilder output = new StringBuilder();
    String line;
    while ((line = reader.readLine()) != null) output.append(line).append('\n');
    reader.close();
    return output.toString();
  }
}
