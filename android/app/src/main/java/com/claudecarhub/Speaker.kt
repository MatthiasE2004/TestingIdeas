package com.claudecarhub

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener

/** Reads agent replies aloud through the car speakers. Call from the main thread. */
object Speaker : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var ready = false
    private var pending: String? = null
    private var audio: AudioManager? = null
    private var focus: AudioFocusRequest? = null
    private val attrs: AudioAttributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_ASSISTANT)
        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
        .build()

    fun speak(ctx: Context, text: String) {
        val clean = clean(text)
        if (clean.isBlank()) return
        if (tts == null) {
            audio = ctx.applicationContext.getSystemService(AudioManager::class.java)
            pending = clean
            tts = TextToSpeech(ctx.applicationContext, this)
            return
        }
        if (!ready) {
            pending = clean
            return
        }
        say(clean)
    }

    fun stop() {
        tts?.stop()
        releaseFocus()
    }

    override fun onInit(status: Int) {
        if (status != TextToSpeech.SUCCESS) {
            tts = null
            return
        }
        ready = true
        tts?.setAudioAttributes(attrs)
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) = releaseFocus()
            @Deprecated("Deprecated in Java")
            override fun onError(utteranceId: String?) = releaseFocus()
        })
        pending?.let { say(it) }
        pending = null
    }

    private fun say(text: String) {
        val req = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
            .setAudioAttributes(attrs)
            .build()
        focus = req
        audio?.requestAudioFocus(req)
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "agent-hub")
    }

    private fun releaseFocus() {
        focus?.let { audio?.abandonAudioFocusRequest(it) }
        focus = null
    }

    /** Strip markdown and code so replies sound natural. */
    fun clean(t: String): String {
        var s = t.replace(Regex("```[\\s\\S]*?```"), " (code omitted) ")
        s = s.replace(Regex("`([^`]*)`"), "$1")
        s = s.replace(Regex("\\[([^\\]]+)\\]\\([^)]+\\)"), "$1")
        s = s.replace(Regex("https?://\\S+"), "a link")
        s = s.replace(Regex("[#*_>|~]+"), " ")
        s = s.replace(Regex("\\s+"), " ").trim()
        return if (s.length > 1500) s.take(1500) + "… The rest is on your phone." else s
    }
}
