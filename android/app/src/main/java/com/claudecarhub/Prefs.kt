package com.claudecarhub

import android.content.Context

object Prefs {
    private fun sp(c: Context) = c.applicationContext.getSharedPreferences("hub", Context.MODE_PRIVATE)

    fun url(c: Context): String = (sp(c).getString("url", "") ?: "").trim().trimEnd('/')
    fun token(c: Context): String = (sp(c).getString("token", "") ?: "").trim()
    fun isConfigured(c: Context) = url(c).isNotEmpty() && token(c).isNotEmpty()

    fun save(c: Context, url: String, token: String) {
        val changed = url.trim().trimEnd('/') != url(c)
        val e = sp(c).edit().putString("url", url.trim().trimEnd('/')).putString("token", token.trim())
        if (changed) e.putLong("lastEventId", 0L) // new hub: don't replay its history
        e.apply()
    }

    fun lastEventId(c: Context) = sp(c).getLong("lastEventId", 0L)
    fun setLastEventId(c: Context, id: Long) = sp(c).edit().putLong("lastEventId", id).apply()

    fun watch(c: Context) = sp(c).getBoolean("watch", false)
    fun setWatch(c: Context, on: Boolean) = sp(c).edit().putBoolean("watch", on).apply()

    fun autoSpeak(c: Context) = sp(c).getBoolean("autoSpeak", false)
    fun setAutoSpeak(c: Context, on: Boolean) = sp(c).edit().putBoolean("autoSpeak", on).apply()
}
