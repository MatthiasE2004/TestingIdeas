package nl.learn.courses;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/** Daily lesson reminder: inexact daily alarm, skipped when a page was already read today; texts come from the app (AI-written). */
public class Reminder extends BroadcastReceiver {
    static final String ACTION = "nl.learn.courses.REMIND";
    static final String CHANNEL = "daily_lesson";

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("learn", Context.MODE_PRIVATE); }

    static String today() { return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()); }

    static PendingIntent alarmIntent(Context c) {
        Intent i = new Intent(c, Reminder.class).setAction(ACTION);
        return PendingIntent.getBroadcast(c, 1, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void schedule(Context c) {
        SharedPreferences p = prefs(c);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        PendingIntent pi = alarmIntent(c);
        am.cancel(pi);
        if (!p.getBoolean("remindOn", false)) return;
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, p.getInt("remindH", 19));
        cal.set(Calendar.MINUTE, p.getInt("remindM", 0));
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis() + 30000) cal.add(Calendar.DAY_OF_YEAR, 1);
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
    }

    @Override
    public void onReceive(Context c, Intent intent) {
        String a = intent.getAction();
        if (ACTION.equals(a)) {
            if (!today().equals(prefs(c).getString("lastRead", ""))) show(c);
        }
        schedule(c); // next day (also after boot / app update)
    }

    static void show(Context c) {
        SharedPreferences p = prefs(c);
        String title = "Time for your daily lesson", body = "One page keeps your streak alive. Tap to continue.", hash = "";
        try {
            JSONObject o = new JSONObject(p.getString("remindMsgs", "{}"));
            hash = o.optString("hash", "");
            JSONArray msgs = o.optJSONArray("msgs");
            if (msgs != null && msgs.length() > 0) {
                int idx = p.getInt("remindIdx", 0) % msgs.length();
                JSONObject m = msgs.getJSONObject(idx);
                title = m.optString("t", title);
                body = m.optString("b", body);
                p.edit().putInt("remindIdx", idx + 1).apply();
            }
        } catch (Exception ignored) { }
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel ch = new NotificationChannel(CHANNEL, "Daily lesson", NotificationManager.IMPORTANCE_HIGH);
        ch.setDescription("Reminds you to do your daily lesson");
        nm.createNotificationChannel(ch);
        Intent open = new Intent(c, MainActivity.class).putExtra("hash", hash).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 2, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(c, CHANNEL)
            .setSmallIcon(R.drawable.ic_notif)
            .setColor(0xFFD71921)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new Notification.BigTextStyle().bigText(body))
            .setContentIntent(pi)
            .setAutoCancel(true)
            .build();
        try { nm.notify(42, n); } catch (SecurityException ignored) { }
    }
}
