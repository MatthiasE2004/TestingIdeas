package com.claudecarhub

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.Person
import androidx.core.app.RemoteInput
import androidx.core.content.ContextCompat

/**
 * Agent replies are posted as messaging-style conversations, one per agent.
 * Android Auto shows these in the car, reads them aloud and lets you reply by voice.
 */
object Notifier {
    const val CHANNEL_REPLIES = "agent_replies"
    const val CHANNEL_SERVICE = "hub_service"
    const val KEY_REPLY = "reply_text"
    const val EXTRA_AGENT = "agent_id"
    const val EXTRA_TITLE = "agent_title"
    const val SERVICE_NOTIFICATION_ID = 1
    const val TEST_AGENT = "test-agent"

    private data class Line(val fromAgent: Boolean, val text: String, val time: Long)

    private val history = HashMap<String, MutableList<Line>>()

    fun ensureChannels(ctx: Context) {
        val nm = ctx.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_REPLIES, "Agent replies", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Messages from your Claude Code agents"
            }
        )
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_SERVICE, "Hub connection", NotificationManager.IMPORTANCE_MIN)
        )
    }

    fun agentSaid(ctx: Context, agentId: String, title: String, text: String) {
        add(agentId, Line(true, text, System.currentTimeMillis()))
        post(ctx, agentId, title, alert = true)
    }

    fun youSaid(ctx: Context, agentId: String, title: String, text: String) {
        add(agentId, Line(false, text, System.currentTimeMillis()))
        post(ctx, agentId, title, alert = false)
    }

    /** Used by the car "Reply" button: pops up a message you can answer by voice. */
    fun askForReply(ctx: Context, agentId: String, title: String) =
        agentSaid(ctx, agentId, title, "What should I tell this agent? Reply to this message.")

    fun clear(ctx: Context, agentId: String) {
        synchronized(history) { history.remove(agentId) }
        NotificationManagerCompat.from(ctx).cancel(notifId(agentId))
    }

    private fun notifId(agentId: String) = 1000 + (agentId.hashCode() and 0x0fffffff)

    private fun add(agentId: String, line: Line) = synchronized(history) {
        val list = history.getOrPut(agentId) { mutableListOf() }
        list.add(line.copy(text = if (line.text.length > 1500) line.text.take(1500) + "…" else line.text))
        while (list.size > 6) list.removeAt(0)
    }

    private fun post(ctx: Context, agentId: String, title: String, alert: Boolean) {
        if (Build.VERSION.SDK_INT >= 33 &&
            ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) return

        val agent = Person.Builder().setName(title).setKey(agentId).setBot(true).build()
        val me = Person.Builder().setName("You").setKey("me").build()
        val style = NotificationCompat.MessagingStyle(me).setGroupConversation(false)
        val lines = synchronized(history) { history[agentId]?.toList() ?: emptyList() }
        for (l in lines) {
            style.addMessage(NotificationCompat.MessagingStyle.Message(l.text, l.time, if (l.fromAgent) agent else null))
        }

        val id = notifId(agentId)
        val replyIntent = Intent(ctx, ReplyReceiver::class.java)
            .setAction("reply:$agentId")
            .putExtra(EXTRA_AGENT, agentId)
            .putExtra(EXTRA_TITLE, title)
        val replyPi = PendingIntent.getBroadcast(
            ctx, id, replyIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
        val reply = NotificationCompat.Action.Builder(R.drawable.ic_reply, "Reply", replyPi)
            .addRemoteInput(RemoteInput.Builder(KEY_REPLY).setLabel("Message $title").build())
            .setSemanticAction(NotificationCompat.Action.SEMANTIC_ACTION_REPLY)
            .setShowsUserInterface(false)
            .build()

        val readIntent = Intent(ctx, MarkReadReceiver::class.java)
            .setAction("read:$agentId")
            .putExtra(EXTRA_AGENT, agentId)
        val readPi = PendingIntent.getBroadcast(
            ctx, id, readIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val markRead = NotificationCompat.Action.Builder(R.drawable.ic_check, "Mark as read", readPi)
            .setSemanticAction(NotificationCompat.Action.SEMANTIC_ACTION_MARK_AS_READ)
            .setShowsUserInterface(false)
            .build()

        val open = PendingIntent.getActivity(
            ctx, 0, Intent(ctx, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE
        )

        val n = NotificationCompat.Builder(ctx, CHANNEL_REPLIES)
            .setSmallIcon(R.drawable.ic_agent)
            .setStyle(style)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(open)
            .addAction(reply)
            .addInvisibleAction(markRead)
            .setSilent(!alert)
            .setAutoCancel(true)
            .build()
        try {
            NotificationManagerCompat.from(ctx).notify(id, n)
        } catch (_: SecurityException) {
        }
    }
}
