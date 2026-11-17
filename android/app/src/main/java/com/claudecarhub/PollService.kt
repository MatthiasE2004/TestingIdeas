package com.claudecarhub

import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat

/** Keeps polling the hub in the background so replies reach the car even when the app isn't open. */
class PollService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val open = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE
        )
        val n = NotificationCompat.Builder(this, Notifier.CHANNEL_SERVICE)
            .setSmallIcon(R.drawable.ic_agent)
            .setContentTitle("Watching your agents")
            .setContentText("Replies will show up in the car.")
            .setOngoing(true)
            .setContentIntent(open)
            .build()
        val type = if (Build.VERSION.SDK_INT >= 34) ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE else 0
        ServiceCompat.startForeground(this, Notifier.SERVICE_NOTIFICATION_ID, n, type)
        EventPoller.acquire(this, "service")
        return START_STICKY
    }

    override fun onDestroy() {
        EventPoller.release("service")
        super.onDestroy()
    }

    companion object {
        fun start(c: Context) = ContextCompat.startForegroundService(c, Intent(c, PollService::class.java))
        fun stop(c: Context) {
            c.stopService(Intent(c, PollService::class.java))
        }
    }
}
