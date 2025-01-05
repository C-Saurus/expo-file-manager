package com.martymfly.expofilemanager.nativemodules;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class IntentLauncherModules extends ReactContextBaseJavaModule {
    public IntentLauncherModules(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "IntentLauncherModules";
    }

    @ReactMethod
    public void openManageAllFilesAccess() {
        Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
        Uri uri = Uri.parse("package:" + getReactApplicationContext().getPackageName());
        intent.setData(uri);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getReactApplicationContext().startActivity(intent);
    }
}
