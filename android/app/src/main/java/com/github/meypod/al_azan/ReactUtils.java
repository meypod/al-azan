package com.github.meypod.al_azan;

/*
Apache-2.0 License
------------------

Copyright (c) 2016-present Invertase Limited <oss@invertase.io>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this library except in compliance with the License.

You may obtain a copy of the Apache-2.0 License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-----------------------------------------
Changes: Removed methods that were not needed, renamed class from NotifeeReactUtils to ReactUtils.
*/

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.util.SparseArray;
import androidx.annotation.Nullable;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceEventListener;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import com.facebook.react.jstasks.HeadlessJsTaskContext;
import com.facebook.react.jstasks.HeadlessJsTaskEventListener;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ReactUtils {
    private static final SparseArray<GenericCallback> headlessTasks = new SparseArray<>();
    private static final HeadlessJsTaskEventListener headlessTasksListener =
            new HeadlessJsTaskEventListener() {
                @Override
                public void onHeadlessJsTaskStart(int taskId) {}

                @Override
                public void onHeadlessJsTaskFinish(int taskId) {
                    synchronized (headlessTasks) {
                        GenericCallback callback = headlessTasks.get(taskId);
                        if (callback != null) {
                            headlessTasks.remove(taskId);
                            callback.call();
                        }
                    }
                }
            };


    private static @Nullable ReactContext getReactContext() {
        ReactNativeHost reactNativeHost =
                ((ReactApplication) ContextHolder.getApplicationContext()).getReactNativeHost();
        ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
        return reactInstanceManager.getCurrentReactContext();
    }

    private static void initializeReactContext(GenericCallback callback) {
        ReactNativeHost reactNativeHost =
                ((ReactApplication) ContextHolder.getApplicationContext()).getReactNativeHost();

        ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();

        reactInstanceManager.addReactInstanceEventListener(
                new ReactInstanceEventListener() {
                    @Override
                    public void onReactContextInitialized(final ReactContext reactContext) {
                        reactInstanceManager.removeReactInstanceEventListener(this);
                        new Handler(Looper.getMainLooper()).postDelayed(callback::call, 100);
                    }
                });

        if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
            reactInstanceManager.createReactContextInBackground();
        }
    }

    public static void startHeadlessTask(
            String taskName,
            @Nullable WritableMap taskData,
            long taskTimeout,
            @Nullable GenericCallback taskCompletionCallback) {
        GenericCallback callback =
                () -> {
                    HeadlessJsTaskContext taskContext = HeadlessJsTaskContext.getInstance(getReactContext());
                    HeadlessJsTaskConfig taskConfig =
                            new HeadlessJsTaskConfig(taskName,
                                    taskData == null ? Arguments.createMap() : taskData,
                                    taskTimeout,
                                    true);

                    synchronized (headlessTasks) {
                        if (headlessTasks.size() == 0) {
                            taskContext.addTaskEventListener(headlessTasksListener);
                        }
                    }

                    headlessTasks.put(
                            taskContext.startTask(taskConfig),
                            () -> {
                                synchronized (headlessTasks) {
                                    if (headlessTasks.size() == 0) {
                                        taskContext.removeTaskEventListener(headlessTasksListener);
                                    }
                                }
                                if (taskCompletionCallback != null) {
                                    taskCompletionCallback.call();
                                }
                            });
                };

        if (getReactContext() == null) {
            initializeReactContext(callback);
        } else {
            callback.call();
        }
    }

    public static void sendEvent(String eventName, @Nullable Object data) {
        try {
            ReactContext reactContext = getReactContext();

            if (reactContext == null || !reactContext.hasActiveReactInstance()) {
                return;
            }

            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, data);

        } catch (Exception e) {
            Log.e("SEND_EVENT", "", e);
        }
    }

    interface GenericCallback {
        void call();
    }
}