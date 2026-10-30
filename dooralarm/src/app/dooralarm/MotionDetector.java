package app.dooralarm;

/**
 * Decides from raw accelerometer / gyroscope readings whether the phone has been moved.
 * Pure Java so it can be tested with simulated sensor streams. Feed it every reading; it only
 * reports movement after {@link #lock()} has been called (that is when the phone is "armed").
 */
final class MotionDetector {
    static final float ACCEL_LIMIT = 0.9f;   // m/s^2 of movement on top of gravity (high-pass filtered)
    static final float TILT_LIMIT_DEG = 5f;  // change of orientation compared to the moment of locking
    static final float TURN_LIMIT = 0.15f;   // rad/s (about 9 degrees per second) of rotation
    static final int HITS_NEEDED = 3;        // consecutive over-limit readings, so one glitch does not count
    private static final float GRAVITY_FILTER = 0.9f;

    private final float[] gravity = new float[3];
    private float[] reference;
    private boolean haveGravity, locked;
    private int accelHits, gyroHits;

    /** Forget everything (called when arming starts). */
    void reset() {
        haveGravity = false;
        locked = false;
        reference = null;
        accelHits = gyroHits = 0;
    }

    /** From now on movement is reported; the current orientation is the reference. */
    void lock() {
        locked = true;
        accelHits = gyroHits = 0;
        reference = haveGravity ? gravity.clone() : null;
    }

    /** @return true if this reading means the phone is being moved (only after lock()). */
    boolean onAccelerometer(float x, float y, float z) {
        if (!haveGravity) {
            gravity[0] = x;
            gravity[1] = y;
            gravity[2] = z;
            haveGravity = true;
            if (locked && reference == null) reference = gravity.clone();
            return false;
        }
        gravity[0] = GRAVITY_FILTER * gravity[0] + (1 - GRAVITY_FILTER) * x;
        gravity[1] = GRAVITY_FILTER * gravity[1] + (1 - GRAVITY_FILTER) * y;
        gravity[2] = GRAVITY_FILTER * gravity[2] + (1 - GRAVITY_FILTER) * z;
        if (!locked) return false;
        if (reference == null) reference = gravity.clone();
        float lx = x - gravity[0], ly = y - gravity[1], lz = z - gravity[2];
        boolean moved = Math.sqrt(lx * lx + ly * ly + lz * lz) > ACCEL_LIMIT
                || angleDeg(reference, gravity) > TILT_LIMIT_DEG;
        accelHits = moved ? accelHits + 1 : Math.max(0, accelHits - 1);
        return accelHits >= HITS_NEEDED;
    }

    boolean onGyroscope(float x, float y, float z) {
        if (!locked) return false;
        boolean moved = Math.sqrt(x * x + y * y + z * z) > TURN_LIMIT;
        gyroHits = moved ? gyroHits + 1 : Math.max(0, gyroHits - 1);
        return gyroHits >= HITS_NEEDED;
    }

    static float angleDeg(float[] a, float[] b) {
        double dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        double na = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
        double nb = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]);
        if (na == 0 || nb == 0) return 0;
        return (float) Math.toDegrees(Math.acos(Math.max(-1, Math.min(1, dot / (na * nb)))));
    }
}
