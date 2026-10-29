package app.dooralarm;

import android.content.Context;
import android.content.SharedPreferences;
import android.media.RingtoneManager;
import android.net.Uri;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

/** The selectable alarm sounds. Generated sounds are written once as WAV files into the app's files dir. */
final class Sounds {
    static final String[] IDS = {"siren", "beep", "pulse", "alarm", "ringtone"};
    static final String[] NAMES = {"Siren", "Fast beeps", "Police pulse", "Phone alarm tone", "Phone ringtone"};
    private static final String PREFS = "door_alarm", KEY = "sound";

    static String selected(Context c) {
        return prefs(c).getString(KEY, "siren");
    }

    static void select(Context c, String id) {
        prefs(c).edit().putString(KEY, id).apply();
    }

    /** Human readable name of an id; "uri:..." entries are sounds picked from the phone. */
    static String name(Context c, String id) {
        for (int i = 0; i < IDS.length; i++) if (IDS[i].equals(id)) return NAMES[i];
        if (id.startsWith("uri:")) {
            try {
                android.media.Ringtone r = RingtoneManager.getRingtone(c, Uri.parse(id.substring(4)));
                if (r != null) return r.getTitle(c);
            } catch (Exception ignored) {
            }
            return "Chosen sound";
        }
        return id;
    }

    static Uri uri(Context c, String id) throws IOException {
        if (id.startsWith("uri:")) return Uri.parse(id.substring(4));
        switch (id) {
            case "alarm": return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            case "ringtone": return RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            default: return Uri.fromFile(generated(c, id));
        }
    }

    private static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static File generated(Context c, String id) throws IOException {
        File f = new File(c.getFilesDir(), id + "-v1.wav");
        if (f.exists()) return f;
        final int rate = 22050;
        short[] pcm;
        switch (id) {
            case "beep": pcm = beeps(rate); break;
            case "pulse": pcm = pulse(rate); break;
            default: pcm = siren(rate);
        }
        ByteBuffer b = ByteBuffer.allocate(44 + pcm.length * 2).order(ByteOrder.LITTLE_ENDIAN);
        b.put("RIFF".getBytes()).putInt(36 + pcm.length * 2).put("WAVE".getBytes()).put("fmt ".getBytes())
                .putInt(16).putShort((short) 1).putShort((short) 1).putInt(rate).putInt(rate * 2)
                .putShort((short) 2).putShort((short) 16).put("data".getBytes()).putInt(pcm.length * 2);
        for (short s : pcm) b.putShort(s);
        File tmp = new File(f.getPath() + ".tmp");
        try (FileOutputStream o = new FileOutputStream(tmp)) {
            o.write(b.array());
        }
        if (!tmp.renameTo(f)) throw new IOException("cannot write sound");
        return f;
    }

    /** Rising and falling sweep, 400-1400 Hz, 1.6 s (loops seamlessly because phase is continuous and ends at the start pitch). */
    private static short[] siren(int rate) {
        int n = (int) (rate * 1.6);
        short[] out = new short[n];
        double phase = 0;
        for (int i = 0; i < n; i++) {
            double t = (double) i / n;
            double f = 900 - 500 * Math.cos(2 * Math.PI * t);
            phase += 2 * Math.PI * f / rate;
            out[i] = (short) (Math.signum(Math.sin(phase)) * 0.55 * 32767 + Math.sin(phase) * 0.4 * 32767);
        }
        return out;
    }

    /** 3 kHz beeps, 0.1 s on / 0.1 s off. */
    private static short[] beeps(int rate) {
        int on = rate / 10, n = on * 4;
        short[] out = new short[n];
        for (int i = 0; i < on; i++) {
            double s = Math.sin(2 * Math.PI * 3000 * i / rate);
            out[i] = out[2 * on + i] = (short) (Math.signum(s) * 0.95 * 32767);
        }
        return out;
    }

    /** Two alternating tones, 0.35 s each. */
    private static short[] pulse(int rate) {
        int seg = (int) (rate * 0.35), n = seg * 2;
        short[] out = new short[n];
        for (int i = 0; i < n; i++) {
            double f = i < seg ? 960 : 770;
            double s = Math.sin(2 * Math.PI * f * i / rate);
            out[i] = (short) (Math.signum(s) * 0.95 * 32767);
        }
        return out;
    }

    private Sounds() {
    }
}
