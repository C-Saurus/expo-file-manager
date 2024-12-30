package com.martymfly.expofilemanager.nativemodules;

import android.app.Activity;
import android.app.RecoverableSecurityException;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.DocumentsContract;
import android.provider.MediaStore;
import android.util.Log;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.app.ComponentActivity;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.util.Collection;

public class FileDeletionNativeModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "FileDeletionNativeModule";
    private static final int DIRECTORY_PICKER_REQUEST_CODE = 1002;
    private ActivityResultLauncher<Intent> directoryPickerLauncher;
    private ActivityResultLauncher<IntentSenderRequest> intentSenderLauncher;
    public FileDeletionNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public void initialize() {
        super.initialize();
        // initializeActivityResultLauncher();
    }

//    private void initializeActivityResultLauncher() {
//        final ReactApplicationContext context = getReactApplicationContext();
//
//        if (context.getCurrentActivity() instanceof ComponentActivity) {
//            ComponentActivity activity = (ComponentActivity) context.getCurrentActivity();
//
//            intentSenderLauncher = getCurrentActivity().registerForActivityResult(
//                    new ActivityResultContracts.StartIntentSenderForResult(),
//                    result -> {
//                        if (result.getResultCode() == Activity.RESULT_OK) {
//
//                        } else {
//
//                        }
//                    }
//            );
//        }
//    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void deleteMediaFile(String filePath, Callback callback) {
        try {
            File file = new File(filePath);
            Uri contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
            Long mediaId = getMediaId(file);
            if (mediaId == null) {
                Log.d(getName(), "Không thể tìm thấy media ID cho file: " + filePath);
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
    public void deleteFile(String filePath, Callback callback) {
        try {
            Context context = getReactApplicationContext();

            // Xóa file qua MediaStore
            if (deleteFileFromMediaStore(context, filePath)) {
                callback.invoke(true);
                return;
            }

            // Xóa file qua SAF
            if (deleteFileWithSAF(context, filePath)) {
                callback.invoke(true);
                return;
            }

            File file = new File(filePath);
            if (file.exists()) {
                file.delete();
                Log.d(getName(), "filePath" + filePath);
                callback.invoke(true);
                return;
            }

            // Nếu cả hai cách đều thất bại
            callback.invoke(false);
        } catch (Exception e) {
            Log.d(getName(), "Error while deleting file: " + e.getMessage());
            callback.invoke(false);
        }
    }

    private boolean deleteFileFromMediaStore(Context context, String filePath) {
        Uri contentUri = null;

        if (filePath.contains("/Movies") || filePath.contains("/Videos")) {
            Log.d(getName(), "DCIM Video");
            contentUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
        } else if (filePath.contains("/Call") || filePath.contains("/Music")) {
            contentUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
        } else if (filePath.contains("/DCIM") || filePath.contains("/Pictures")) {
            Log.d(getName(), "DCIM Images");
            contentUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        }

        if (contentUri != null) {
            String selection = MediaStore.MediaColumns.DATA + "=?";
            String[] selectionArgs = new String[]{filePath};

            int rowsDeleted = context.getContentResolver().delete(contentUri, selection, selectionArgs);
            Log.d(getName(), "rowsDeleted: " + rowsDeleted);
            return rowsDeleted > 0;
        }


//        try {
//            context.getContentResolver().delete(contentUri, null, null);
//        } catch (SecurityException e) {
//            IntentSender intentSender = null;
//            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
//                intentSender = MediaStore.createDeleteRequest(context.getContentResolver(), (Collection<Uri>) contentUri).getIntentSender();
//            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
//                RecoverableSecurityException recoverableSecurityException = (RecoverableSecurityException) e;
//                if (recoverableSecurityException != null
//                        && recoverableSecurityException.getUserAction() != null
//                        && recoverableSecurityException.getUserAction().getActionIntent() != null) {
//                    intentSender = recoverableSecurityException.getUserAction().getActionIntent().getIntentSender();
//                }
//            }
//            if (intentSender != null) {
//                IntentSenderRequest request = new IntentSenderRequest.Builder(intentSender).build();
//                intentSenderLauncher.launch(request);
//            }
//        }

        return false;
    }

    private boolean deleteFileWithSAF(Context context, String filePath) {
        SharedPreferences preferences = context.getSharedPreferences("DirectoryPermissions", Context.MODE_PRIVATE);
        String rootUriString = preferences.getString("rootUri", null);

        if (rootUriString != null) {
            Uri rootUri = Uri.parse(rootUriString);
            Uri documentUri = DocumentsContract.buildDocumentUriUsingTree(
                    rootUri,
                    DocumentsContract.getTreeDocumentId(rootUri) + filePath.replace(rootUri.getPath(), "")
            );

            try {
                context.getContentResolver().delete(documentUri, null, null);
                return true;
            } catch (Exception e) {
                Log.e(getName(), "Error deleting file with SAF: " + e.getMessage());
            }
        }

        return false;
    }

    @ReactMethod
    public void openDirectoryPicker(String initialUri, Promise promise) {
        try {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION |
                    Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
                    Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
            if (initialUri != null) {
                intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, Uri.parse(initialUri));
            }
            getCurrentActivity().startActivityForResult(intent, DIRECTORY_PICKER_REQUEST_CODE);
            promise.resolve("SAF Directory Picker opened.");
        } catch (Exception e) {
            promise.reject("ERROR_OPENING_DIRECTORY_PICKER", "Failed to open directory picker: " + e.getMessage());
        }
    }

//    @Override
//    public void onActivityResult(int requestCode, int resultCode, Intent data) {
//        if (requestCode == DIRECTORY_PICKER_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
//            Uri uri = data.getData();
//            getReactApplicationContext().getContentResolver()
//                    .takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
//
//            SharedPreferences preferences = getReactApplicationContext()
//                    .getSharedPreferences("DirectoryPermissions", Context.MODE_PRIVATE);
//            preferences.edit().putString("rootUri", uri.toString()).apply();
//        }
//    }
}
