package app.dooralarm;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** One big on/off button and a button to change the sound. */
public class MainActivity extends Activity {
    private static final int PICK_SOUND = 7;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private Button toggle, sound;
    private TextView status;
    private int shown = -1;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 27) {   // show over the lock screen when the alarm goes off
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        int pad = dp(24);
        root.setPadding(pad, pad, pad, pad);
        root.setBackgroundColor(Color.parseColor("#101418"));

        status = new TextView(this);
        status.setTextColor(Color.WHITE);
        status.setTextSize(20);
        status.setGravity(Gravity.CENTER);
        status.setPadding(0, 0, 0, dp(24));

        toggle = new Button(this);
        toggle.setTextSize(30);
        toggle.setTypeface(Typeface.DEFAULT_BOLD);
        toggle.setAllCaps(true);
        toggle.setTextColor(Color.WHITE);
        toggle.setOnClickListener(v -> onToggle());

        sound = new Button(this);
        sound.setTextSize(16);
        sound.setAllCaps(false);
        sound.setTextColor(Color.WHITE);
        sound.setBackground(round("#2B3540", 14));
        sound.setOnClickListener(v -> chooseSound());

        root.addView(status, new LinearLayout.LayoutParams(-1, -2));
        root.addView(toggle, new LinearLayout.LayoutParams(-1, dp(220)));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, dp(64));
        lp.topMargin = dp(24);
        root.addView(sound, lp);
        setContentView(root);

        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        }
    }

    @Override protected void onResume() {
        super.onResume();
        shown = -1;
        ui.post(refresh);
    }

    @Override protected void onPause() {
        super.onPause();
        ui.removeCallbacks(refresh);
    }

    private final Runnable refresh = new Runnable() {
        @Override public void run() {
            render();
            ui.postDelayed(this, 300);
        }
    };

    private void render() {
        int s = AlarmService.state;
        sound.setText("Sound: " + Sounds.name(this, Sounds.selected(this)) + "  (change)");
        sound.setEnabled(s == AlarmService.OFF);
        sound.setAlpha(s == AlarmService.OFF ? 1f : 0.4f);
        if (s == shown) return;
        shown = s;
        String label, info, color;
        switch (s) {
            case AlarmService.ARMING:
                label = "Cancel"; info = "Put the phone on the door.\nArming in a few seconds..."; color = "#B8860B"; break;
            case AlarmService.ARMED:
                label = "Turn off"; info = "ALARM ON\nIt rings if the phone moves."; color = "#2E7D32"; break;
            case AlarmService.RINGING:
                label = "Stop alarm"; info = "MOTION DETECTED!"; color = "#C62828"; break;
            default:
                label = "Turn on"; info = "Alarm is off"; color = "#1565C0";
        }
        toggle.setText(label);
        toggle.setBackground(round(color, 28));
        status.setText(info);
    }

    private void onToggle() {
        Intent i = new Intent(this, AlarmService.class);
        if (AlarmService.state == AlarmService.OFF) {
            i.setAction(AlarmService.ACTION_START);
            AlarmService.state = AlarmService.ARMING;   // reflect instantly; service confirms
            startForegroundService(i);
        } else {
            i.setAction(AlarmService.ACTION_STOP);
            startService(i);
            AlarmService.state = AlarmService.OFF;
        }
        shown = -1;
        render();
    }

    private void chooseSound() {
        String[] items = new String[Sounds.NAMES.length + 1];
        System.arraycopy(Sounds.NAMES, 0, items, 0, Sounds.NAMES.length);
        items[items.length - 1] = "Pick from phone...";
        String cur = Sounds.selected(this);
        int checked = -1;
        for (int i = 0; i < Sounds.IDS.length; i++) if (Sounds.IDS[i].equals(cur)) checked = i;
        new AlertDialog.Builder(this).setTitle("Alarm sound")
                .setSingleChoiceItems(items, checked, (d, which) -> {
                    d.dismiss();
                    if (which < Sounds.IDS.length) {
                        Sounds.select(this, Sounds.IDS[which]);
                        render();
                    } else {
                        Intent p = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER);
                        p.putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALL);
                        p.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);
                        startActivityForResult(p, PICK_SOUND);
                    }
                }).setNegativeButton("Cancel", null).show();
    }

    @Override protected void onActivityResult(int req, int res, Intent data) {
        if (req == PICK_SOUND && res == RESULT_OK && data != null) {
            Uri u = data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI);
            if (u != null) Sounds.select(this, "uri:" + u);
            shown = -1;
            render();
        }
    }

    private GradientDrawable round(String color, int radiusDp) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(Color.parseColor(color));
        g.setCornerRadius(dp(radiusDp));
        return g;
    }

    private int dp(int v) {
        return (int) (v * getResources().getDisplayMetrics().density);
    }
}
