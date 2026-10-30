package app.dooralarm;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.WindowManager;
import android.widget.Toast;

/** One big on/off button and a button to change the sound, in a Nothing-OS look (see NothingView). */
public class MainActivity extends Activity {
    private static final int PICK_SOUND = 7;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private NothingView view;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        CrashLog.install(this);
        if (CrashLog.show(this, new Runnable() {
            @Override public void run() { start(); }
        })) return;
        start();
    }

    private void start() {
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 27) {   // show over the lock screen when the alarm goes off
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }
        view = new NothingView(this);
        view.setListener(new NothingView.Listener() {
            @Override public void onToggle() { MainActivity.this.onToggle(); }
            @Override public void onSound() { openPicker(); }
            @Override public void onPick(int index) { pick(index); }
        });
        setContentView(view);
        render();
        ui.post(refresh);

        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1);
        }
    }

    @Override protected void onResume() {
        super.onResume();
        if (view != null) {
            ui.removeCallbacks(refresh);
            ui.post(refresh);
        }
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
        view.set(AlarmService.state, Sounds.name(this, Sounds.selected(this)));
    }

    private void onToggle() {
        Intent i = new Intent(this, AlarmService.class);
        try {
            if (AlarmService.state == AlarmService.OFF) {
                i.setAction(AlarmService.ACTION_START);
                startForegroundService(i);   // the service sets the state to ARMING itself
            } else {
                i.setAction(AlarmService.ACTION_STOP);
                startService(i);
            }
        } catch (RuntimeException e) {
            Toast.makeText(this, "Could not start the alarm: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private void openPicker() {
        String[] items = new String[Sounds.NAMES.length + 1];
        System.arraycopy(Sounds.NAMES, 0, items, 0, Sounds.NAMES.length);
        items[items.length - 1] = "Pick from phone";
        String cur = Sounds.selected(this);
        int checked = -1;
        for (int i = 0; i < Sounds.IDS.length; i++) if (Sounds.IDS[i].equals(cur)) checked = i;
        view.openPicker(items, checked);
    }

    private void pick(int index) {
        if (index < 0) return;                       // closed without choosing
        if (index < Sounds.IDS.length) {
            Sounds.select(this, Sounds.IDS[index]);
            render();
            return;
        }
        try {
            Intent p = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER);
            p.putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALL);
            p.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);
            startActivityForResult(p, PICK_SOUND);
        } catch (RuntimeException e) {
            Toast.makeText(this, "This phone has no sound picker", Toast.LENGTH_LONG).show();
        }
    }

    @Override protected void onActivityResult(int req, int res, Intent data) {
        if (req == PICK_SOUND && res == RESULT_OK && data != null) {
            Uri u = data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI);
            if (u != null) Sounds.select(this, "uri:" + u);
            render();
        }
    }

    @Override public void onBackPressed() {
        if (view != null && view.closePicker()) return;
        super.onBackPressed();
    }
}
