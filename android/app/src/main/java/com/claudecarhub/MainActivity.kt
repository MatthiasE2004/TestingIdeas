package com.claudecarhub

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.InputType
import android.util.TypedValue
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast

/** Phone-side setup: hub address, token, and background notifications. */
class MainActivity : Activity() {
    private lateinit var urlField: EditText
    private lateinit var tokenField: EditText
    private lateinit var status: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(20), dp(20), dp(32))
        }

        col.addView(text("Agent Hub", 26f))
        col.addView(text("Connect this phone to the hub running on your computer. Your Claude Code agents then show up in Android Auto.", 14f))

        col.addView(text("Hub address", 13f, top = 20))
        urlField = EditText(this).apply {
            hint = "http://100.101.102.103:8787"
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_URI
            setText(Prefs.url(this@MainActivity))
        }
        col.addView(urlField)

        col.addView(text("Access token (printed by hub.py)", 13f, top = 12))
        tokenField = EditText(this).apply {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
            setText(Prefs.token(this@MainActivity))
        }
        col.addView(tokenField)

        col.addView(Button(this).apply {
            text = "Save & test connection"
            setOnClickListener { saveAndTest() }
        })
        status = text("", 14f)
        col.addView(status)

        col.addView(Switch(this).apply {
            text = "Notify me in the car when an agent replies"
            isChecked = Prefs.watch(this@MainActivity)
            setPadding(0, dp(16), 0, dp(8))
            setOnCheckedChangeListener { _, on ->
                Prefs.setWatch(this@MainActivity, on)
                if (on) PollService.start(this@MainActivity) else PollService.stop(this@MainActivity)
            }
        })
        col.addView(Switch(this).apply {
            text = "Read replies aloud automatically"
            isChecked = Prefs.autoSpeak(this@MainActivity)
            setPadding(0, dp(8), 0, dp(8))
            setOnCheckedChangeListener { _, on -> Prefs.setAutoSpeak(this@MainActivity, on) }
        })

        col.addView(Button(this).apply {
            text = "Send a test message to the car"
            setOnClickListener {
                Notifier.agentSaid(
                    this@MainActivity, Notifier.TEST_AGENT, "Agent Hub",
                    "This is how agent replies look in your car. Tap Reply and say something to test voice replies."
                )
            }
        })
        col.addView(Button(this).apply {
            text = "Open full dashboard"
            setOnClickListener {
                val url = Prefs.url(this@MainActivity)
                if (url.isEmpty()) return@setOnClickListener toast("Save the hub address first")
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("$url/?token=" + Uri.encode(Prefs.token(this@MainActivity)))))
            }
        })

        col.addView(text(
            "In the car: open Agent Hub from the Android Auto launcher. If it isn't there, enable " +
                "Android Auto developer mode and turn on \"Unknown sources\" (see README).",
            13f, top = 20
        ))

        setContentView(ScrollView(this).apply {
            fitsSystemWindows = true
            addView(col)
        })

        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
        }
    }

    private fun saveAndTest() {
        val url = urlField.text.toString().trim()
        val token = tokenField.text.toString().trim()
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            status.text = "The address should start with http:// (for example http://100.101.102.103:8787)"
            return
        }
        Prefs.save(this, url, token)
        status.text = "Testing…"
        val client = HubClient(url, token)
        Bg.call({ if (client.ping()) client.agents().size else -1 }) { r ->
            status.text = r.fold(
                onSuccess = { n -> if (n < 0) "Hub reached, but the token is wrong." else "Connected. $n agent sessions found." },
                onFailure = { e -> "Couldn't reach the hub: ${e.message}" },
            )
        }
    }

    private fun text(t: String, size: Float, top: Int = 4) = TextView(this).apply {
        text = t
        setTextSize(TypedValue.COMPLEX_UNIT_SP, size)
        setPadding(0, dp(top), 0, dp(4))
    }

    private fun toast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()

    private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()
}
