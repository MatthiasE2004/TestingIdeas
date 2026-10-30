package app.dooralarm;

/**
 * The alarm's state machine: OFF -> ARMING (grace period) -> ARMED -> RINGING -> OFF.
 * No Android classes, time is passed in, so it is unit-tested directly.
 */
final class AlarmCore {
    static final int OFF = 0, ARMING = 1, ARMED = 2, RINGING = 3;
    static final long ARM_DELAY_MS = 8000;   // time to put the phone on the door and walk away

    interface Callback { void onStateChanged(int state); }

    private final MotionDetector detector = new MotionDetector();
    private final Callback callback;
    private int state = OFF;
    private long armedAt;

    AlarmCore(Callback callback) { this.callback = callback; }

    int state() { return state; }

    void start(long now) {
        if (state != OFF) return;
        detector.reset();
        armedAt = now + ARM_DELAY_MS;
        set(ARMING);
    }

    void stop() {
        if (state == OFF) return;
        set(OFF);
    }

    /** Call regularly (timer and on every sensor reading): ends the grace period when it is over. */
    void tick(long now) {
        if (state == ARMING && now >= armedAt) {
            detector.lock();
            set(ARMED);
        }
    }

    void onAccelerometer(long now, float x, float y, float z) {
        tick(now);
        if (state == OFF || state == RINGING) { return; }
        if (detector.onAccelerometer(x, y, z) && state == ARMED) set(RINGING);
    }

    void onGyroscope(long now, float x, float y, float z) {
        tick(now);
        if (state != ARMED) return;
        if (detector.onGyroscope(x, y, z)) set(RINGING);
    }

    private void set(int s) {
        state = s;
        callback.onStateChanged(s);
    }
}
