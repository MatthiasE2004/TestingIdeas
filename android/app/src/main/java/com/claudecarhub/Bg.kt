package com.claudecarhub

import android.os.Handler
import android.os.Looper
import java.util.concurrent.Executors

/** Run network work off the main thread and deliver the result back on it. */
object Bg {
    private val pool = Executors.newCachedThreadPool()
    private val handler = Handler(Looper.getMainLooper())

    fun <T> call(work: () -> T, done: (Result<T>) -> Unit) {
        pool.execute {
            val r = runCatching(work)
            handler.post { done(r) }
        }
    }

    fun onMain(block: () -> Unit) {
        handler.post(block)
    }
}
