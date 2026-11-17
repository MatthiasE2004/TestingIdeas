package com.claudecarhub

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.RemoteInput

/** Receives a (voice) reply typed or dictated on a notification and sends it to the agent. */
class ReplyReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val agentId = intent.getStringExtra(Notifier.EXTRA_AGENT) ?: return
        val title = intent.getStringExtra(Notifier.EXTRA_TITLE) ?: "Agent"
        val text = RemoteInput.getResultsFromIntent(intent)
            ?.getCharSequence(Notifier.KEY_REPLY)?.toString()?.trim()
        if (text.isNullOrEmpty()) return
        val app = context.applicationContext

        if (agentId == Notifier.TEST_AGENT) { // test message from the settings screen
            Notifier.youSaid(app, agentId, title, text)
            Notifier.agentSaid(app, agentId, title, "Voice replies work. I heard: \"$text\"")
            return
        }

        val client = HubClient.from(app) ?: return
        val pending = goAsync()
        Thread {
            try {
                client.send(agentId, text)
                Notifier.youSaid(app, agentId, title, text)
            } catch (e: Exception) {
                Notifier.agentSaid(app, agentId, title, "Couldn't deliver your message: ${e.message}")
            } finally {
                pending.finish()
            }
        }.start()
    }
}

class MarkReadReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val agentId = intent.getStringExtra(Notifier.EXTRA_AGENT) ?: return
        Notifier.clear(context.applicationContext, agentId)
    }
}
