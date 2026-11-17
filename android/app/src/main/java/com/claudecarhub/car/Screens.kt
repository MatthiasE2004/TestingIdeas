package com.claudecarhub.car

import android.os.Handler
import android.os.Looper
import androidx.car.app.CarContext
import androidx.car.app.CarToast
import androidx.car.app.Screen
import androidx.car.app.constraints.ConstraintManager
import androidx.car.app.model.Action
import androidx.car.app.model.ActionStrip
import androidx.car.app.model.CarColor
import androidx.car.app.model.CarIcon
import androidx.car.app.model.ItemList
import androidx.car.app.model.ListTemplate
import androidx.car.app.model.MessageTemplate
import androidx.car.app.model.Pane
import androidx.car.app.model.PaneTemplate
import androidx.car.app.model.Row
import androidx.car.app.model.Template
import androidx.car.app.versioning.CarAppApiLevels
import androidx.core.graphics.drawable.IconCompat
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.claudecarhub.Agent
import com.claudecarhub.AgentDetail
import com.claudecarhub.Bg
import com.claudecarhub.HubClient
import com.claudecarhub.Notifier
import com.claudecarhub.Prefs
import com.claudecarhub.R
import com.claudecarhub.Speaker

val QUICK_REPLIES = listOf(
    "Status update?",
    "Continue",
    "Looks good, go ahead",
    "Run the tests",
    "Summarize what you did",
    "Stop and wait for me",
)

/** A screen that re-fetches its data every [periodMs] while visible. */
abstract class PollingScreen(carContext: CarContext, private val periodMs: Long) : Screen(carContext) {
    private val handler = Handler(Looper.getMainLooper())
    private val tick = object : Runnable {
        override fun run() {
            refresh()
            handler.postDelayed(this, periodMs)
        }
    }

    init {
        lifecycle.addObserver(object : DefaultLifecycleObserver {
            override fun onStart(owner: LifecycleOwner) {
                handler.post(tick)
            }

            override fun onStop(owner: LifecycleOwner) {
                handler.removeCallbacks(tick)
            }
        })
    }

    abstract fun refresh()

    protected fun toast(msg: String) = CarToast.makeText(carContext, msg, CarToast.LENGTH_LONG).show()
}

class SetupScreen(carContext: CarContext) : Screen(carContext) {
    override fun onGetTemplate(): Template =
        MessageTemplate.Builder("Open Agent Hub on your phone and enter your hub address and token.")
            .setTitle("Agent Hub")
            .setHeaderAction(Action.APP_ICON)
            .addAction(Action.Builder().setTitle("I've done that").setOnClickListener {
                if (Prefs.isConfigured(carContext)) screenManager.push(AgentListScreen(carContext))
                else CarToast.makeText(carContext, "Not set up yet", CarToast.LENGTH_SHORT).show()
            }.build())
            .build()
}

class AgentListScreen(carContext: CarContext) : PollingScreen(carContext, 5_000) {
    private var agents: List<Agent>? = null
    private var error: String? = null
    private var loading = false

    override fun refresh() {
        val client = HubClient.from(carContext) ?: return
        if (loading) return
        loading = true
        Bg.call({ client.agents() }) { r ->
            loading = false
            r.onSuccess { agents = it; error = null }
                .onFailure { error = it.message ?: "Unknown error" }
            invalidate()
        }
    }

    override fun onGetTemplate(): Template {
        val list = agents
        val err = error
        if (list == null && err != null) {
            return MessageTemplate.Builder("Can't reach your hub.\n$err")
                .setTitle("Agent Hub")
                .setHeaderAction(Action.APP_ICON)
                .addAction(Action.Builder().setTitle("Retry").setOnClickListener { refresh() }.build())
                .build()
        }
        val builder = ListTemplate.Builder().setTitle("Your agents").setHeaderAction(Action.APP_ICON)
        if (list == null) return builder.setLoading(true).build()

        val items = ItemList.Builder().setNoItemsMessage("No Claude Code sessions yet")
        for (a in list.take(maxRows())) {
            val row = Row.Builder()
                .setTitle(a.title.ifBlank { "Agent" })
                .addText(statusLabel(a) + if (a.project.isNotBlank()) " · ${a.project}" else "")
                .setImage(dot(statusColor(a)))
                .setOnClickListener { screenManager.push(AgentScreen(carContext, a.id, a.title)) }
            val preview = Speaker.clean(a.preview).take(120)
            row.addText(preview.ifBlank { "—" })
            items.addItem(row.build())
        }
        return builder.setSingleList(items.build()).build()
    }

    private fun maxRows(): Int = try {
        if (carContext.carAppApiLevel >= CarAppApiLevels.LEVEL_2) {
            carContext.getCarService(ConstraintManager::class.java)
                .getContentLimit(ConstraintManager.CONTENT_LIMIT_TYPE_LIST)
        } else 6
    } catch (e: Exception) {
        6
    }

    private fun dot(color: CarColor) = CarIcon.Builder(
        IconCompat.createWithResource(carContext, R.drawable.ic_dot)
    ).setTint(color).build()
}

class AgentScreen(
    carContext: CarContext,
    private val agentId: String,
    private var title: String,
) : PollingScreen(carContext, 4_000) {
    private var detail: AgentDetail? = null
    private var error: String? = null
    private var loading = false

    override fun refresh() {
        val client = HubClient.from(carContext) ?: return
        if (loading) return
        loading = true
        Bg.call({ client.agent(agentId) }) { r ->
            loading = false
            r.onSuccess { detail = it; error = null; title = it.agent.title }
                .onFailure { error = it.message ?: "Unknown error" }
            invalidate()
        }
    }

    override fun onGetTemplate(): Template {
        val d = detail
        val err = error
        if (d == null && err != null) {
            return MessageTemplate.Builder(err)
                .setTitle(title)
                .setHeaderAction(Action.BACK)
                .addAction(Action.Builder().setTitle("Retry").setOnClickListener { refresh() }.build())
                .build()
        }
        val pane = Pane.Builder()
        val strip = ActionStrip.Builder().addAction(
            Action.Builder().setTitle("Quick").setOnClickListener {
                screenManager.push(QuickReplyScreen(carContext, agentId, title))
            }.build()
        )
        if (d == null) {
            pane.setLoading(true)
        } else {
            val a = d.agent
            val working = a.status == "working"
            val detailLine = when {
                working -> d.activity ?: "Working…"
                a.lastError != null -> "Error: ${a.lastError}"
                else -> a.project.ifBlank { " " }
            }
            // Always the same 3 rows so Android Auto treats updates as refreshes, not new screens.
            pane.addRow(Row.Builder().setTitle(statusLabel(a)).addText(oneLine(detailLine)).build())

            val lastReply = d.messages.lastOrNull { it.role == "assistant" }
            val replyText = lastReply?.let { m -> m.text.ifBlank { m.tools.lastOrNull()?.let { "Used $it" } ?: "" } } ?: ""
            pane.addRow(Row.Builder().setTitle("Agent").addText(oneLine(replyText.ifBlank { "No reply yet" })).build())
            val lastYou = d.messages.lastOrNull { it.role == "user" }?.text ?: ""
            pane.addRow(Row.Builder().setTitle("You").addText(oneLine(lastYou.ifBlank { "—" })).build())

            pane.addAction(Action.Builder().setTitle("Read aloud").setOnClickListener {
                Speaker.speak(carContext, replyText.ifBlank { "There's no reply to read yet." })
            }.build())
            pane.addAction(Action.Builder().setTitle("Reply").setOnClickListener {
                Notifier.askForReply(carContext, agentId, title)
                toast("Open the new message and tap Reply to speak")
            }.build())

        }
        strip.addAction(Action.Builder().setTitle("Stop").setOnClickListener {
            if (detail?.agent?.status == "working") stop() else toast("This agent isn't running")
        }.build())
        return PaneTemplate.Builder(pane.build())
            .setTitle(title)
            .setHeaderAction(Action.BACK)
            .setActionStrip(strip.build())
            .build()
    }

    private fun stop() {
        val client = HubClient.from(carContext) ?: return
        Bg.call({ client.stop(agentId) }) { r ->
            toast(if (r.isSuccess) "Stopped" else "Couldn't stop: ${r.exceptionOrNull()?.message}")
            refresh()
        }
    }

    private fun oneLine(s: String) = Speaker.clean(s).take(160).ifBlank { " " }
}

class QuickReplyScreen(
    carContext: CarContext,
    private val agentId: String,
    private val title: String,
) : Screen(carContext) {
    private var sending = false

    override fun onGetTemplate(): Template {
        val builder = ListTemplate.Builder().setTitle("Tell $title").setHeaderAction(Action.BACK)
        if (sending) return builder.setLoading(true).build()
        val items = ItemList.Builder()
        for (text in QUICK_REPLIES) {
            items.addItem(Row.Builder().setTitle(text).setOnClickListener { send(text) }.build())
        }
        return builder.setSingleList(items.build()).build()
    }

    private fun send(text: String) {
        val client = HubClient.from(carContext) ?: return
        sending = true
        invalidate()
        Bg.call({ client.send(agentId, text) }) { r ->
            sending = false
            if (r.isSuccess) {
                CarToast.makeText(carContext, "Sent", CarToast.LENGTH_SHORT).show()
                screenManager.pop()
            } else {
                CarToast.makeText(carContext, r.exceptionOrNull()?.message ?: "Failed", CarToast.LENGTH_LONG).show()
                invalidate()
            }
        }
    }
}

fun statusLabel(a: Agent): String = when {
    a.status == "working" -> "Working"
    a.lastError != null -> "Needs attention"
    a.status == "waiting" -> "Waiting for you"
    a.status == "busy" -> "Active on your computer"
    else -> "Idle"
}

fun statusColor(a: Agent): CarColor = when {
    a.status == "working" -> CarColor.YELLOW
    a.lastError != null -> CarColor.RED
    a.status == "waiting" -> CarColor.GREEN
    a.status == "busy" -> CarColor.BLUE
    else -> CarColor.DEFAULT
}
