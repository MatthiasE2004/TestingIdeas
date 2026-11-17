package com.claudecarhub.car

import android.content.Intent
import androidx.car.app.CarAppService
import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.car.app.validation.HostValidator
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.claudecarhub.EventPoller
import com.claudecarhub.Prefs

class AgentCarAppService : CarAppService() {
    // Personal sideloaded app: accept any Android Auto host.
    override fun createHostValidator(): HostValidator = HostValidator.ALLOW_ALL_HOSTS_VALIDATOR

    override fun onCreateSession(): Session = AgentSession()
}

class AgentSession : Session() {
    override fun onCreateScreen(intent: Intent): Screen {
        // While the car screen is up, poll for replies even if background notifications are off.
        EventPoller.acquire(carContext, "car")
        lifecycle.addObserver(object : DefaultLifecycleObserver {
            override fun onDestroy(owner: LifecycleOwner) {
                EventPoller.release("car")
            }
        })
        return if (Prefs.isConfigured(carContext)) AgentListScreen(carContext) else SetupScreen(carContext)
    }
}
