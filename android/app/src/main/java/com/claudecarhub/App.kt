package com.claudecarhub

import android.app.Application

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        Notifier.ensureChannels(this)
        if (Prefs.watch(this) && Prefs.isConfigured(this)) {
            // May be refused if the process was started in the background; the car session polls anyway.
            try { PollService.start(this) } catch (_: Exception) { }
        }
    }
}
