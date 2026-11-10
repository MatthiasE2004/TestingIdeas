package nl.learn.courses;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.net.Uri;
import android.app.PendingIntent;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/** Home-screen widget: every course with a dotted progress ring; tapping a row continues that course. */
public class ProgressWidget extends AppWidgetProvider {
    static final int[] ROWS = {R.id.row0, R.id.row1, R.id.row2, R.id.row3, R.id.row4, R.id.row5};
    static final int[] RINGS = {R.id.ring0, R.id.ring1, R.id.ring2, R.id.ring3, R.id.ring4, R.id.ring5};
    static final int[] NAMES = {R.id.name0, R.id.name1, R.id.name2, R.id.name3, R.id.name4, R.id.name5};

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) { render(c, m, ids); }

    static void updateAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        render(c, m, m.getAppWidgetIds(new ComponentName(c, ProgressWidget.class)));
    }

    static void render(Context c, AppWidgetManager m, int[] ids) {
        JSONArray courses = new JSONArray();
        int streak = 0;
        try {
            JSONObject o = new JSONObject(c.getSharedPreferences("learn", Context.MODE_PRIVATE).getString("widget", "{}"));
            if (o.optJSONArray("courses") != null) courses = o.optJSONArray("courses");
            streak = o.optInt("streak", 0);
        } catch (Exception ignored) { }
        for (int id : ids) {
            RemoteViews rv = new RemoteViews(c.getPackageName(), R.layout.widget_progress);
            rv.setTextViewText(R.id.streak, streak > 0 ? streak + " day streak" : "");
            Intent home = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            rv.setOnClickPendingIntent(R.id.title, PendingIntent.getActivity(c, 90, home, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            for (int i = 0; i < ROWS.length; i++) {
                JSONObject co = courses.optJSONObject(i);
                if (co == null) { rv.setViewVisibility(ROWS[i], View.GONE); continue; }
                rv.setViewVisibility(ROWS[i], View.VISIBLE);
                rv.setImageViewBitmap(RINGS[i], ring(co.optInt("pct", 0)));
                rv.setTextViewText(NAMES[i], co.optString("title", ""));
                Intent open = new Intent(c, MainActivity.class).putExtra("hash", co.optString("hash", ""))
                    .setData(Uri.parse("learn://course/" + co.optString("id", "" + i)))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                rv.setOnClickPendingIntent(ROWS[i], PendingIntent.getActivity(c, 100 + i, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            }
            m.updateAppWidget(id, rv);
        }
    }

    /** Nothing-style dotted ring with the percentage in the middle */
    static Bitmap ring(int pct) {
        int s = 120;
        Bitmap b = Bitmap.createBitmap(s, s, Bitmap.Config.ARGB_8888);
        Canvas cv = new Canvas(b);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        int n = 36, filled = Math.round(n * pct / 100f);
        float r = s / 2f - 8;
        for (int i = 0; i < n; i++) {
            double a = -Math.PI / 2 + i * 2 * Math.PI / n;
            float x = (float) (s / 2f + r * Math.cos(a)), y = (float) (s / 2f + r * Math.sin(a));
            boolean on = i < filled, head = i == filled - 1 && filled < n;
            p.setColor(head ? 0xFFD71921 : on ? 0xFFFFFFFF : 0xFF444444);
            cv.drawCircle(x, y, on ? 4.2f : 3f, p);
        }
        p.setColor(0xFFFFFFFF);
        p.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        p.setTextSize(30);
        p.setTextAlign(Paint.Align.CENTER);
        cv.drawText(pct + "%", s / 2f, s / 2f + 11, p);
        return b;
    }
}
