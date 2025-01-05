package com.martymfly.expofilemanager.nativemodules;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Intent;
import android.content.IntentSender;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.util.ArrayList;

public class FileDeletionNativeModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "FileDeletionNativeModule";
    private static final int DELETE_REQUEST_CODE = 1001;
    private Callback deleteCallback;
    public FileDeletionNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(activityEventListener);
    }

    @Override
    public void initialize() {
        super.initialize();
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void deleteMediaFile(String filePath, Callback callback) {
        try {
            deleteCallback = callback;
            File file = new File(filePath);
            Uri contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
            Long mediaId = getMediaId(file);
            if (mediaId == null) {
                Log.d(getName(), "Can not found file id: " + filePath);
                callback.invoke(false);
                return;
            }
            Log.d((getName()), mediaId.toString());

            Log.d(getName(), "filePath" + filePath);
            Uri itemUri = ContentUris.withAppendedId(contentUri, mediaId);

            int rows = getReactApplicationContext().getContentResolver().delete(itemUri, null, null);
            Log.d((getName()), "Deleted successfully: " + rows);
            if (rows > 0) {
                Log.d(getName(), "Deleted successfully: " + filePath);
                callback.invoke(true);
            } else {
                Log.d(getName(), "Delete file error: " + filePath);
                callback.invoke(false);
            }
        } catch (Exception e) {
            Log.d(getName(), "Delete file error with exception: " + e.getMessage());
            callback.invoke(false);
        }
    }

    private Long getMediaId(File file) {
        Uri uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        String[] projection = {MediaStore.Files.FileColumns._ID};
        String selection = MediaStore.Files.FileColumns.DATA + " = ?";
        String[] selectionArgs = {file.getAbsolutePath()};

        Cursor cursor = getReactApplicationContext().getContentResolver().query(
                uri,
                projection,
                selection,
                selectionArgs,
                null
        );

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

    @ReactMethod
    public void deleteFileMedia(String filePath, String fileType, Callback callback) throws IntentSender.SendIntentException {
        File file = new File(filePath);
        Uri contentUri = null;
        deleteCallback = callback;
        switch (fileType) {
            case "image":
                contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                break;
            case "video":
                contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                break;
            case "audio":
                contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                break;
            default:
                contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        }

        // Lấy Media ID từ file
        Long mediaId = getMediaId(file);
        if (mediaId == null) {
            Log.d(getName(), "Can not found file id: " + filePath);
            callback.invoke(false);
            return;
        }

        Uri itemUri = ContentUris.withAppendedId(contentUri, mediaId);
        ContentResolver contentResolver = getReactApplicationContext().getContentResolver();

        try {
            PendingIntent pendingIntent = null;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                ArrayList<Uri> collection = new ArrayList<>();
                collection.add(itemUri);
                pendingIntent = MediaStore.createDeleteRequest(contentResolver, collection);

                if (pendingIntent != null) {
                    Activity activity = getCurrentActivity();
                    if (activity != null) {
                        Log.d(getName(), "Need permission to delete file: " + itemUri);
                        activity.startIntentSenderForResult(
                                pendingIntent.getIntentSender(),
                                1001, // Request code
                                null,
                                0,
                                0,
                                0
                        );
                    } else {
                        Log.d(getName(), "Current activity is null: " + itemUri);
                    }
                }
            }
            else {
                int rowsDeleted = contentResolver.delete(itemUri, null, null);
                if (rowsDeleted > 0) {
                    Log.d(getName(), "Deleted successfully: " + filePath);
                    callback.invoke(true);
                } else {
                    Log.d(getName(), "Delete file error: " + filePath);
                    callback.invoke(false);
                }
            }
        } catch (SecurityException e) {
            PendingIntent pendingIntent = null;

            // Xử lý ngoại lệ cho Android Q
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (e instanceof android.app.RecoverableSecurityException) {
                    android.app.RecoverableSecurityException exception = (android.app.RecoverableSecurityException) e;
                    pendingIntent = exception.getUserAction().getActionIntent();
                }
            }

            // Nếu cần xử lý quyền
            if (pendingIntent != null) {
                Activity activity = getCurrentActivity();
                if (activity != null) {
                    activity.startIntentSenderForResult(
                            pendingIntent.getIntentSender(),
                            1001, // Request code
                            null,
                            0,
                            0,
                            0
                    );
                    Log.d(getName(), "Action require to delete file: " + itemUri);
                }
            } else {
                Log.d(getName(), "SecurityException can not resolve: " + e.getMessage());
                callback.invoke(false);
            }
        }
    }

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == DELETE_REQUEST_CODE) {
                if (resultCode == Activity.RESULT_OK) {
                    Log.d(getName(), "Permission granted.");
                    if (deleteCallback != null) {
                        deleteCallback.invoke(true);
                    }
                } else {
                    Log.d(getName(), "Permission denied.");
                    if (deleteCallback != null) {
                        deleteCallback.invoke(false);
                    }
                }
                deleteCallback = null;
            }
        }
    };

}
