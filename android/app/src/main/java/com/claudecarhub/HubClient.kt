package com.claudecarhub

import android.content.Context
import android.net.Uri
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

class HubException(message: String) : IOException(message)

data class Agent(
    val id: String,
    val title: String,
    val project: String,
    val status: String, // working | waiting | busy | idle
    val preview: String,
    val lastError: String?,
)

data class ChatMessage(val role: String, val text: String, val tools: List<String>)

data class AgentDetail(val agent: Agent, val messages: List<ChatMessage>, val activity: String?)

data class HubEvent(val id: Long, val type: String, val agentId: String, val title: String, val text: String)

/** Talks to hub.py over HTTP. All calls block: use them from a background thread. */
class HubClient(baseUrl: String, private val token: String) {
    private val base = baseUrl.trim().trimEnd('/')

    /** Returns true if the hub accepted the token. Throws if the hub can't be reached. */
    fun ping(): Boolean = request("GET", "/api/ping").optBoolean("authed", false)

    fun agents(): List<Agent> {
        val arr = request("GET", "/api/agents").optJSONArray("agents") ?: JSONArray()
        return (0 until arr.length()).map { parseAgent(arr.getJSONObject(it)) }
    }

    fun agent(id: String): AgentDetail {
        val o = request("GET", "/api/agents/${Uri.encode(id)}?limit=20")
        val msgs = o.optJSONArray("messages") ?: JSONArray()
        val list = (0 until msgs.length()).map { i ->
            val m = msgs.getJSONObject(i)
            val t = m.optJSONArray("tools")
            ChatMessage(
                role = m.str("role"),
                text = m.str("text"),
                tools = if (t == null) emptyList() else (0 until t.length()).map { t.optString(it) },
            )
        }
        val activity = o.optJSONObject("live")?.str("activity")?.takeIf { it.isNotBlank() }
        return AgentDetail(parseAgent(o), list, activity)
    }

    fun send(id: String, text: String) {
        request("POST", "/api/agents/${Uri.encode(id)}/messages", JSONObject().put("text", text))
    }

    fun stop(id: String) {
        request("POST", "/api/agents/${Uri.encode(id)}/stop", JSONObject())
    }

    fun events(after: Long): Pair<List<HubEvent>, Long> {
        val o = request("GET", "/api/events?after=$after")
        val arr = o.optJSONArray("events") ?: JSONArray()
        val list = (0 until arr.length()).map { i ->
            val e = arr.getJSONObject(i)
            HubEvent(e.optLong("id"), e.str("type"), e.str("agent_id"), e.str("title", "Agent"), e.str("text"))
        }
        return list to o.optLong("last_id", after)
    }

    private fun parseAgent(o: JSONObject) = Agent(
        id = o.str("id"),
        title = o.str("title", "Agent"),
        project = o.str("project"),
        status = o.str("status", "idle"),
        preview = o.str("preview"),
        lastError = o.str("last_error").ifBlank { null },
    )

    private fun request(method: String, path: String, body: JSONObject? = null): JSONObject {
        val conn = URL(base + path).openConnection() as HttpURLConnection
        try {
            conn.requestMethod = method
            conn.connectTimeout = 8_000
            conn.readTimeout = 15_000
            conn.setRequestProperty("Authorization", "Bearer $token")
            conn.setRequestProperty("Accept", "application/json")
            if (body != null) {
                conn.doOutput = true
                conn.setRequestProperty("Content-Type", "application/json; charset=utf-8")
                conn.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            }
            val code = conn.responseCode
            val stream = if (code in 200..299) conn.inputStream else conn.errorStream
            val text = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() } ?: ""
            val json = try { JSONObject(text) } catch (e: Exception) { JSONObject() }
            if (code !in 200..299) {
                throw HubException(json.str("error").ifBlank { "Hub answered HTTP $code" })
            }
            return json
        } finally {
            conn.disconnect()
        }
    }

    companion object {
        fun from(c: Context): HubClient? =
            if (Prefs.isConfigured(c)) HubClient(Prefs.url(c), Prefs.token(c)) else null
    }
}

/** org.json returns the text "null" for JSON nulls; this doesn't. */
internal fun JSONObject.str(key: String, def: String = ""): String =
    if (isNull(key)) def else optString(key, def)
