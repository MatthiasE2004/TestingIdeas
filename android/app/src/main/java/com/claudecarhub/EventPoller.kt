package com.claudecarhub

import android.content.Context

/**
 * Polls the hub's event feed and turns agent replies into car notifications.
 * Runs while the foreground service or the car screen holds it.
 */
object EventPoller {
    private val holders = HashSet<String>()
    @Volatile private var thread: Thread? = null

    @Synchronized
    fun acquire(ctx: Context, who: String) {
        holders.add(who)
        if (thread == null) {
            val app = ctx.applicationContext
            thread = Thread({ loop(app) }, "agent-hub-poller").apply {
                isDaemon = true
                start()
            }
        }
    }

    @Synchronized
    fun release(who: String) {
        holders.remove(who)
        if (holders.isEmpty()) {
            thread?.interrupt()
            thread = null
        }
    }

    private fun loop(app: Context) {
        val me = Thread.currentThread()
        var delay = 5_000L
        while (thread === me) {
            try {
                val client = HubClient.from(app)
                if (client != null) {
                    val last = Prefs.lastEventId(app)
                    val (events, newest) = client.events(last)
                    // First connection, or hub was reset: skip history instead of replaying it.
                    if (last != 0L && newest >= last) events.forEach { handle(app, it) }
                    Prefs.setLastEventId(app, newest)
                    delay = 5_000L
                }
            } catch (e: InterruptedException) {
                break
            } catch (e: Exception) {
                delay = minOf(delay * 2, 60_000L) // hub offline: back off
            }
            try {
                Thread.sleep(delay)
            } catch (e: InterruptedException) {
                break
            }
        }
    }

    private fun handle(app: Context, e: HubEvent) {
        when (e.type) {
            "reply" -> {
                Notifier.agentSaid(app, e.agentId, e.title, e.text)
                if (Prefs.autoSpeak(app)) Bg.onMain { Speaker.speak(app, "${e.title} says: ${e.text}") }
            }
            "error" -> Notifier.agentSaid(app, e.agentId, e.title, "Error: ${e.text}")
        }
    }
}
