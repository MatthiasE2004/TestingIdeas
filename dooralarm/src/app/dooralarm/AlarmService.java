package app.dooralarm;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;

/** Watches the motion sensors while armed and plays the chosen sound at full alarm volume when the phone moves. */
public class AlarmService extends Service implements SensorEventListener {
    static final int OFF = 0, ARMING = 1, ARMED = 2, RINGING = 3;
    static final String ACTION_START = "app.dooralarm.START", ACTION_STOP = "app.dooralarm.STOP";
    private static final String CHANNEL = "door_alarm";
    private static final int ARM_DELAY_MS = 8000;       // time to put the phone on the door and walk away
    private static final float ACCEL_LIMIT = 1.2f;      // m/s^2 beyond gravity (high-pass filtered)
    private static final float TILT_LIMIT_DEG = 7f;     // change in orientation compared to when armed
    private static final float TURN_LIMIT = 0.45f;      // rad/s of rotation

    static volatile int state = OFF;

    private final Handler main = new Handler(Looper.getMainLooper());
    private SensorManager sensors;
    private PowerManager.WakeLock wake;
    private MediaPlayer player;
    private AudioManager audio;
    private float[] gravity = new float[3], reference;
    private boolean haveGravity;
    private int hits;

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            shutdown();
            return START_NOT_STICKY;
        }
        if (state == OFF) arm();
        return START_STICKY;
    }

    private void arm() {
        audio = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        startForeground(1, notification("Put the phone on the door and step away"));
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "dooralarm:watch");
        wake.acquire();
        state = ARMING;
        haveGravity = false;
        reference = null;
        hits = 0;
        sensors = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        Sensor acc = sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        Sensor gyro = sensors.getDefaultSensor(Sensor.TYPE_GYROSCOPE);
        sensors.registerListener(this, acc, SensorManager.SENSOR_DELAY_GAME);
        if (gyro != null) sensors.registerListener(this, gyro, SensorManager.SENSOR_DELAY_GAME);
        main.postDelayed(() -> {
            if (state != ARMING) return;
            reference = gravity.clone();
            hits = 0;
            state = ARMED;
            update("Armed - alarm sounds if the phone moves");
        }, ARM_DELAY_MS);
    }

    @Override public void onSensorChanged(SensorEvent e) {
        if (e.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            float[] v = e.values;
            if (!haveGravity) {
                gravity = v.clone();
                haveGravity = true;
                return;
            }
            // low-pass = gravity, remainder = movement
            float a = 0.9f, lx, ly, lz;
            gravity[0] = a * gravity[0] + (1 - a) * v[0];
            gravity[1] = a * gravity[1] + (1 - a) * v[1];
            gravity[2] = a * gravity[2] + (1 - a) * v[2];
            lx = v[0] - gravity[0];
            ly = v[1] - gravity[1];
            lz = v[2] - gravity[2];
            boolean moved = Math.sqrt(lx * lx + ly * ly + lz * lz) > ACCEL_LIMIT;
            if (reference != null && angle(reference, gravity) > TILT_LIMIT_DEG) moved = true;
            check(moved);
        } else if (e.sensor.getType() == Sensor.TYPE_GYROSCOPE) {
            float[] v = e.values;
            check(Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) > TURN_LIMIT);
        }
    }

    /** Needs a few readings in a row so a single sensor glitch or a bump on the table does not trigger it. */
    private void check(boolean moved) {
        if (state != ARMED) return;
        hits = moved ? hits + 1 : Math.max(0, hits - 1);
        if (hits >= 3) ring();
    }

    private static float angle(float[] a, float[] b) {
        double dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        double na = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
        double nb = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]);
        if (na == 0 || nb == 0) return 0;
        return (float) Math.toDegrees(Math.acos(Math.max(-1, Math.min(1, dot / (na * nb)))));
    }

    private void ring() {
        state = RINGING;
        update("ALARM! Open the app to stop it");
        try {
            player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
            player.setDataSource(this, Sounds.uri(this, Sounds.selected(this)));
            player.setLooping(true);
            player.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            player.prepare();
            maxVolume();
            player.start();
        } catch (Exception ex) {
            fallbackSound();
        }
        Intent open = new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try { startActivity(open); } catch (Exception ignored) { }
        main.post(volumeKeeper);
    }

    /** If the chosen sound cannot be played use the generated siren instead. */
    private void fallbackSound() {
        try {
            if (player != null) player.release();
            player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build());
            player.setDataSource(this, Sounds.uri(this, "siren"));
            player.setLooping(true);
            player.prepare();
            maxVolume();
            player.start();
        } catch (Exception ignored) {
        }
    }

    private void maxVolume() {
        audio.setStreamVolume(AudioManager.STREAM_ALARM, audio.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0);
        if (player != null) player.setVolume(1f, 1f);
    }

    /** Someone could turn the volume down while it rings, so push it back to full every second. */
    private final Runnable volumeKeeper = new Runnable() {
        @Override public void run() {
            if (state != RINGING) return;
            try { maxVolume(); } catch (Exception ignored) { }
            main.postDelayed(this, 1000);
        }
    };

    private void shutdown() {
        state = OFF;
        main.removeCallbacksAndMessages(null);
        if (sensors != null) sensors.unregisterListener(this);
        if (player != null) {
            try { player.stop(); } catch (Exception ignored) { }
            player.release();
            player = null;
        }
        if (wake != null && wake.isHeld()) wake.release();
        stopForeground(true);
        stopSelf();
    }

    @Override public void onDestroy() {
        if (state != OFF) shutdown();
    }

    @Override public void onAccuracyChanged(Sensor s, int a) { }

    private Notification notification(String text) {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        nm.createNotificationChannel(new NotificationChannel(CHANNEL, "Door alarm", NotificationManager.IMPORTANCE_LOW));
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class),
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        return new Notification.Builder(this, CHANNEL).setContentTitle("Door Alarm").setContentText(text)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentIntent(open).setOngoing(true).build();
    }

    private void update(String text) {
        ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).notify(1, notification(text));
    }
}
