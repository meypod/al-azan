package com.github.meypod.al_azan.utils;

import android.os.Handler;
import android.os.Looper;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// https://stackoverflow.com/a/73666782/3542461
// with edits
public class Async {

    private static final ExecutorService executorService = Executors.newSingleThreadExecutor();

    private static final Handler handler = new Handler(Looper.getMainLooper());

    public static <T> void execute(Task<T> task) {
        executorService.execute(() -> {
            T t = task.doAsync();
            handler.post(() -> {
                task.doSync(t);
            });
        });
    }

    public interface Task<T> {
        T doAsync();

        void doSync(T t);
    }
}
