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
import android.os.SystemClock;

/** Watches the motion sensors while armed and plays the chosen sound at full alarm volume when the phone moves. */
public class AlarmService extends Service implements SensorEventListener {
    static final int OFF = AlarmCore.OFF, ARMING = AlarmCore.ARMING, ARMED = AlarmCore.ARMED, RINGING = AlarmCore.RINGING;
    static final String ACTION_START = "app.dooralarm.START", ACTION_STOP = "app.dooralarm.STOP";
    private static final String CHANNEL = "door_alarm";

    static volatile int state = OFF;

    private final Handler main = new Handler(Looper.getMainLooper());
    private SensorManager sensors;
    private PowerManager.WakeLock wake;
    private MediaPlayer player;
    private AudioManager audio;
    private AlarmCore core;

    @Override public IBinder onBind(Intent i) { return null; }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            shutdown();
            return START_NOT_STICKY;
        }
        if (core == null) arm();
        return START_STICKY;
    }

    private void arm() {
        audio = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        startForeground(1, notification("Put the phone on the door and step away"));
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wake = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "dooralarm:watch");
        wake.acquire();
        core = new AlarmCore(new AlarmCore.Callback() {
            @Override public void onStateChanged(int s) { onCoreState(s); }
        });
        sensors = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        Sensor acc = sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        Sensor gyro = sensors.getDefaultSensor(Sensor.TYPE_GYROSCOPE);
        if (acc == null && gyro == null) {
            update("This phone has no motion sensors");
            shutdown();
            return;
        }
        core.start(SystemClock.elapsedRealtime());
        if (acc != null) sensors.registerListener(this, acc, SensorManager.SENSOR_DELAY_GAME);
        if (gyro != null) sensors.registerListener(this, gyro, SensorManager.SENSOR_DELAY_GAME);
        main.postDelayed(tick, AlarmCore.ARM_DELAY_MS + 100);
    }

    private final Runnable tick = new Runnable() {
        @Override public void run() {
            if (core != null) core.tick(SystemClock.elapsedRealtime());
        }
    };

    private void onCoreState(int s) {
        state = s;
        if (s == ARMED) update("Armed - alarm sounds if the phone moves");
        else if (s == RINGING) ring();
    }

    @Override public void onSensorChanged(SensorEvent e) {
        if (core == null) return;
        long now = SystemClock.elapsedRealtime();
        float[] v = e.values;
        if (e.sensor.getType() == Sensor.TYPE_ACCELEROMETER) core.onAccelerometer(now, v[0], v[1], v[2]);
        else if (e.sensor.getType() == Sensor.TYPE_GYROSCOPE) core.onGyroscope(now, v[0], v[1], v[2]);
    }

    private void ring() {
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
        core = null;
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
