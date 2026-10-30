package app.dooralarm;

import static org.junit.Assert.*;

import java.util.Random;
import org.junit.Before;
import org.junit.Test;

/** Simulated sensor streams (50 Hz, like SENSOR_DELAY_GAME) through the real detector and state machine. */
public class MotionTest {
    private static final long DT = 20;               // ms between readings
    private static final float G = 9.81f;
    private final Random rnd = new Random(42);
    private int[] states;
    private int rings;
    private AlarmCore core;
    private long now;

    @Before public void setUp() {
        rings = 0;
        now = 1_000_000;
        core = new AlarmCore(s -> { if (s == AlarmCore.RINGING) rings++; });
    }

    private float noise(float amp) { return (rnd.nextFloat() - 0.5f) * 2 * amp; }

    /** Phone lying still for `ms`: tiny sensor noise on a vertical-door orientation (gravity on y). */
    private void still(long ms) {
        for (long t = 0; t < ms; t += DT) {
            now += DT;
            core.onAccelerometer(now, noise(0.04f), G + noise(0.04f), noise(0.04f));
            core.onGyroscope(now, noise(0.004f), noise(0.004f), noise(0.004f));
        }
    }

    private void armed() {
        core.start(now);
        assertEquals(AlarmCore.ARMING, core.state());
        still(AlarmCore.ARM_DELAY_MS + 200);
        assertEquals("armed after the grace period", AlarmCore.ARMED, core.state());
        still(5000);
        assertEquals("still phone must not ring", AlarmCore.ARMED, core.state());
    }

    // ---- state machine -------------------------------------------------------------------------------------------

    @Test public void startsOffAndArmsAfterDelay() {
        assertEquals(AlarmCore.OFF, core.state());
        core.start(now);
        assertEquals(AlarmCore.ARMING, core.state());
        still(AlarmCore.ARM_DELAY_MS - 500);
        assertEquals(AlarmCore.ARMING, core.state());
        still(1000);
        assertEquals(AlarmCore.ARMED, core.state());
    }

    @Test public void armsEvenWithoutSensorReadingsViaTimer() {
        core.start(now);
        core.tick(now + AlarmCore.ARM_DELAY_MS + 1);
        assertEquals(AlarmCore.ARMED, core.state());
    }

    @Test public void handlingThePhoneDuringTheDelayDoesNotRing() {
        core.start(now);
        for (long t = 0; t < 6000; t += DT) {            // picking it up, walking to the door
            now += DT;
            core.onAccelerometer(now, noise(4f), G + noise(4f), noise(4f));
            core.onGyroscope(now, noise(2f), noise(2f), noise(2f));
        }
        assertEquals(AlarmCore.ARMING, core.state());
        assertEquals(0, rings);
    }

    @Test public void cancelDuringArmingAndRearm() {
        core.start(now);
        core.stop();
        assertEquals(AlarmCore.OFF, core.state());
        core.tick(now + 20_000);
        assertEquals(AlarmCore.OFF, core.state());
        armed();
    }

    // ---- detection -----------------------------------------------------------------------------------------------

    @Test public void doorSlamRings() {
        armed();
        for (int i = 0; i < 25; i++) {                    // sharp shake of 0.5 s
            now += DT;
            float s = (i % 2 == 0) ? 1 : -1;
            core.onAccelerometer(now, 5 * s, G + 4 * s, 2 * s);
            core.onGyroscope(now, 0.3f * s, 0.2f, 0);
        }
        assertEquals(AlarmCore.RINGING, core.state());
        assertEquals("rings exactly once", 1, rings);
    }

    @Test public void gentleDoorSwingAroundHingeRingsViaGyro() {
        armed();
        // door rotating slowly about the vertical axis (phone's y axis): 0.25 rad/s (14 deg/s), no acceleration, no tilt
        for (int i = 0; i < 100 && core.state() == AlarmCore.ARMED; i++) {
            now += DT;
            core.onAccelerometer(now, noise(0.04f), G + noise(0.04f), noise(0.04f));
            core.onGyroscope(now, 0, 0.25f, 0);
        }
        assertEquals(AlarmCore.RINGING, core.state());
    }

    @Test public void slowTiltRings() {
        armed();
        // phone rotated about its x axis by 10 degrees over 5 seconds
        int steps = 250;
        for (int i = 0; i <= steps && core.state() == AlarmCore.ARMED; i++) {
            double a = Math.toRadians(10.0 * i / steps);
            now += DT;
            core.onAccelerometer(now, noise(0.03f), (float) (G * Math.cos(a)), (float) (G * Math.sin(a)));
        }
        assertEquals(AlarmCore.RINGING, core.state());
    }

    @Test public void smallTiltBelowLimitDoesNotRing() {
        armed();
        for (int i = 0; i < 200; i++) {                  // settles 3 degrees
            double a = Math.toRadians(3.0);
            now += DT;
            core.onAccelerometer(now, noise(0.03f), (float) (G * Math.cos(a)), (float) (G * Math.sin(a)));
        }
        assertEquals(AlarmCore.ARMED, core.state());
    }

    @Test public void singleGlitchDoesNotRing() {
        armed();
        now += DT;
        core.onAccelerometer(now, 6, G + 6, 3);
        core.onGyroscope(now, 1.5f, 0, 0);
        still(3000);
        assertEquals(AlarmCore.ARMED, core.state());
    }

    @Test public void gyroStillnessDoesNotCancelAccelerometerMotion() {
        armed();
        // accelerometer and gyroscope readings interleave; calm gyro readings between shaky accel ones must not hide the shake
        for (int i = 0; i < 12 && core.state() == AlarmCore.ARMED; i++) {
            now += DT;
            float s = (i % 2 == 0) ? 1 : -1;
            core.onAccelerometer(now, 3 * s, G + 3 * s, 0);
            core.onGyroscope(now, 0.001f, 0.001f, 0.001f);
        }
        assertEquals(AlarmCore.RINGING, core.state());
    }

    @Test public void tableVibrationAndSmallBumpsDoNotRing() {
        armed();
        for (int i = 0; i < 500; i++) {                  // 10 s of light vibration (a truck passing)
            now += DT;
            core.onAccelerometer(now, noise(0.25f), G + noise(0.25f), noise(0.25f));
            core.onGyroscope(now, noise(0.03f), noise(0.03f), noise(0.03f));
        }
        assertEquals(AlarmCore.ARMED, core.state());
    }

    @Test public void reorientationDuringArmingIsTheNewReference() {
        // phone is lying flat while arming starts, then put against the door (gravity moves from z to y) before the delay ends
        core.start(now);
        for (long t = 0; t < 3000; t += DT) { now += DT; core.onAccelerometer(now, 0, 0.1f, G); }
        for (long t = 0; t < 6000; t += DT) { now += DT; core.onAccelerometer(now, noise(0.03f), G + noise(0.03f), noise(0.03f)); }
        assertEquals(AlarmCore.ARMED, core.state());
        still(5000);
        assertEquals(AlarmCore.ARMED, core.state());
    }

    @Test public void worksWithAccelerometerOnly() {
        core.start(now);
        for (long t = 0; t < 9000; t += DT) { now += DT; core.onAccelerometer(now, 0, G, 0); }
        assertEquals(AlarmCore.ARMED, core.state());
        for (int i = 0; i < 10 && core.state() == AlarmCore.ARMED; i++) { now += DT; core.onAccelerometer(now, 4 * (i % 2 * 2 - 1), G, 0); }
        assertEquals(AlarmCore.RINGING, core.state());
    }

    @Test public void worksWithGyroscopeOnly() {
        core.start(now);
        core.tick(now + 9000);
        now += 9000;
        assertEquals(AlarmCore.ARMED, core.state());
        for (int i = 0; i < 10 && core.state() == AlarmCore.ARMED; i++) { now += DT; core.onGyroscope(now, 0, 0.5f, 0); }
        assertEquals(AlarmCore.RINGING, core.state());
    }

    @Test public void stopSilencesAndCanRearm() {
        armed();
        for (int i = 0; i < 12; i++) { now += DT; core.onAccelerometer(now, 4 * (i % 2 * 2 - 1), G, 0); }
        assertEquals(AlarmCore.RINGING, core.state());
        core.stop();
        assertEquals(AlarmCore.OFF, core.state());
        core.onAccelerometer(now, 9, 9, 9);              // late readings after stopping change nothing
        assertEquals(AlarmCore.OFF, core.state());
        armed();
    }

    @Test public void doesNotRetriggerWhileRinging() {
        armed();
        for (int i = 0; i < 200; i++) { now += DT; core.onAccelerometer(now, 4 * (i % 2 * 2 - 1), G, 0); }
        assertEquals(1, rings);
    }
}
