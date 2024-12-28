package com.martymfly.expofilemanager.nativemodules;

import android.content.ContentUris;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

public class FileDeletionNativeModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "FileDeletionNativeModule";

    public FileDeletionNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void deleteMediaFile(String filePath, Callback callback) {
        try {
            File file = new File(filePath);
            Uri contentUri = MediaStore.Files.getContentUri("external");

            Long mediaId = getMediaId(file);
            if (mediaId == null) {
                Log.d(getName(), "Không thể tìm thấy media ID cho file: " + filePath);
                callback.invoke(false);
                return;
            }
            Log.d((getName()), mediaId.toString());

            Uri itemUri = ContentUris.withAppendedId(contentUri, mediaId);

            int rows = getReactApplicationContext().getContentResolver().delete(itemUri, null, null);
            Log.d((getName()), "Deleted successfully: " + rows);
            if (rows > 0) {
                Log.d(getName(), "Deleted successfully: " + filePath);
                callback.invoke(true);
            } else {
                Log.d(getName(), "Delete Error: Không thể xóa file: " + filePath);
                callback.invoke(false);
            }
        } catch (Exception e) {
            Log.d(getName(), "Delete Error: Lỗi khi xóa file: " + e.getMessage());
            callback.invoke(false);
        }
    }

    private Long getMediaId(File file) {
        Uri uri = MediaStore.Files.getContentUri("external");

        // Đặt điều kiện để truy vấn
        String[] projection = {MediaStore.Files.FileColumns._ID};
        String selection = MediaStore.Files.FileColumns.DATA + " = ?";
        String[] selectionArgs = {file.getAbsolutePath()};

        // Truy vấn
        Cursor cursor = getReactApplicationContext().getContentResolver().query(
                uri,
                projection,
                selection,
                selectionArgs,
                null
        );

        // Lấy media ID từ cursor
        if (cursor != null) {
            try {
                if (cursor.moveToFirst()) {
                    return cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Files.FileColumns._ID));
                }
            } finally {
                cursor.close();
            }
        }
        return null;
    }
}
