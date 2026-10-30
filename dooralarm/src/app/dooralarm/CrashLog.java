package app.dooralarm;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.view.Gravity;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.FileWriter;

/** Saves the stack trace of a crash and shows it on the next start, so a crash on a phone can be diagnosed. */
final class CrashLog {
    static void install(Activity a) {
        final File f = new File(a.getFilesDir(), "last-crash.txt");
        final Thread.UncaughtExceptionHandler old = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override public void uncaughtException(Thread t, Throwable e) {
                try (PrintWriter w = new PrintWriter(new FileWriter(f))) {
                    StringWriter sw = new StringWriter();
                    e.printStackTrace(new PrintWriter(sw));
                    w.print(sw);
                } catch (Exception ignored) {
                }
                if (old != null) old.uncaughtException(t, e);
            }
        });
    }

    /** Shows the previous crash, if any. @return true when the crash screen is showing (the app waits for "continue"). */
    static boolean show(Activity a, Runnable proceed) {
        File f = new File(a.getFilesDir(), "last-crash.txt");
        if (!f.exists()) return false;
        String text;
        try (java.util.Scanner s = new java.util.Scanner(f).useDelimiter("\\A")) {
            text = s.hasNext() ? s.next() : "";
        } catch (Exception e) {
            text = "";
        }
        f.delete();
        if (text.isEmpty()) return false;
        LinearLayout root = new LinearLayout(a);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.BLACK);
        root.setPadding(32, 64, 32, 32);
        TextView t = new TextView(a);
        t.setTextColor(Color.WHITE);
        t.setTypeface(Typeface.MONOSPACE);
        t.setTextSize(11);
        t.setText("The app crashed last time. Send this text to the developer:\n\n" + text);
        ScrollView sv = new ScrollView(a);
        sv.addView(t);
        Button go = new Button(a);
        go.setText("Continue");
        go.setOnClickListener(new android.view.View.OnClickListener() {
            @Override public void onClick(android.view.View v) { proceed.run(); }
        });
        root.addView(sv, new LinearLayout.LayoutParams(-1, 0, 1f));
        root.addView(go, new LinearLayout.LayoutParams(-1, -2));
        root.setGravity(Gravity.TOP);
        a.setContentView(root);
        return true;
    }

    private CrashLog() { }
}
