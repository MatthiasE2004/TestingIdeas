package app.dooralarm;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.view.MotionEvent;
import android.view.View;

import java.util.HashMap;
import java.util.Map;

/** The whole screen, drawn in a Nothing-OS style: pure black, white dot-matrix type, a ring of dots and one red accent. */
class NothingView extends View {
    interface Listener { void onToggle(); void onSound(); void onPick(int index); }

    private static final int RED = Color.parseColor("#D71921"), DIM = Color.parseColor("#2C2C2C"), GREY = Color.parseColor("#8A8A8A");
    private static final Map<Character, String[]> FONT = new HashMap<>();

    private final Paint dot = new Paint(Paint.ANTI_ALIAS_FLAG), line = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final RectF pill = new RectF();
    private Listener listener;
    private int state = AlarmService.OFF;
    private String soundName = "";
    private float cx, cy, radius;
    private boolean enabled = true;
    private String[] pickerItems;      // non-null while the sound list is open
    private int pickerChecked = -1;
    private final RectF[] rows = new RectF[8];

    NothingView(Context c) {
        super(c);
        line.setStyle(Paint.Style.STROKE);
    }

    void setListener(Listener l) { listener = l; }

    void set(int state, String soundName) {
        this.state = state;
        this.soundName = soundName;
        enabled = state == AlarmService.OFF;
        invalidate();
    }

    void openPicker(String[] items, int checked) {
        pickerItems = items;
        pickerChecked = checked;
        invalidate();
    }

    /** @return true if the list was open */
    boolean closePicker() {
        if (pickerItems == null) return false;
        pickerItems = null;
        invalidate();
        return true;
    }

    private void drawPicker(Canvas c, float w, float d) {
        text(c, "SOUND", 28 * d, 56 * d, 2.6f * d, Color.WHITE, false);
        float rowH = 72 * d, top = 120 * d;
        for (int i = 0; i < pickerItems.length; i++) {
            rows[i] = new RectF(24 * d, top + i * rowH, w - 24 * d, top + (i + 1) * rowH - 8 * d);
            line.setStrokeWidth(1.5f * d);
            line.setColor(i == pickerChecked ? RED : DIM);
            c.drawRoundRect(rows[i], 18 * d, 18 * d, line);
            String n = pickerItems[i].toUpperCase();
            float unit = Math.min(3f * d, (rows[i].width() - 80 * d) / (n.length() * 6f));
            if (i == pickerChecked) { dot.setColor(RED); c.drawCircle(rows[i].left + 28 * d, rows[i].centerY(), 6 * d, dot); }
            text(c, n, rows[i].left + 52 * d, rows[i].centerY(), unit, Color.WHITE, false);
        }
        text(c, "BACK TO CLOSE", w / 2, getHeight() - 48 * d, 2f * d, GREY, true);
    }

    @Override protected void onDraw(Canvas c) {
        float w = getWidth(), h = getHeight(), d = getResources().getDisplayMetrics().density;
        c.drawColor(Color.BLACK);
        if (pickerItems != null) { drawPicker(c, w, d); return; }
        long t = System.currentTimeMillis();
        boolean flash = state == AlarmService.RINGING && (t / 250) % 2 == 0;

        // header: status LED + title
        dot.setColor(state == AlarmService.OFF ? DIM : RED);
        c.drawCircle(28 * d, 56 * d, 5 * d, dot);
        text(c, "DOOR ALARM", 44 * d, 56 * d, 2.6f * d, Color.WHITE, false);

        // ring of dots
        radius = Math.min(w * 0.40f, h * 0.27f);
        cx = w / 2;
        cy = h * 0.43f;
        float sweep = (t % 2400) / 2400f;
        if (state == AlarmService.ARMING) sweep = (t % 700) / 700f;
        ring(c, radius, 72, 3.2f * d, sweep, flash);
        ring(c, radius * 0.80f, 56, 2.4f * d, -sweep, flash);
        ring(c, radius * 0.60f, 40, 1.8f * d, sweep, flash);

        String label, status;
        int fg = Color.WHITE;
        switch (state) {
            case AlarmService.ARMING: label = "WAIT"; status = "ARMING... PUT IT ON THE DOOR"; break;
            case AlarmService.ARMED: label = "OFF"; status = "ARMED"; break;
            case AlarmService.RINGING: label = "STOP"; status = "MOTION DETECTED"; fg = flash ? RED : Color.WHITE; break;
            default: label = "ON"; status = "ALARM IS OFF";
        }
        float unit = radius * 0.058f;
        text(c, label, cx, cy, unit, fg, true);
        text(c, status, cx, cy + radius + 56 * d, Math.min(3f * d, (w - 48 * d) / (status.length() * 6f)), state == AlarmService.RINGING ? RED : GREY, true);

        // sound picker pill
        float ph = 84 * d, pt = h - ph - 56 * d;
        pill.set(24 * d, pt, w - 24 * d, pt + ph);
        line.setStrokeWidth(1.5f * d);
        line.setColor(enabled ? Color.WHITE : DIM);
        c.drawRoundRect(pill, ph / 2, ph / 2, line);
        text(c, "SOUND", w / 2, pt + 26 * d, 2f * d, GREY, true);
        String n = soundName.toUpperCase();
        text(c, n, w / 2, pt + 54 * d, Math.min(3.2f * d, (pill.width() - 56 * d) / (Math.max(1, n.length()) * 6f)), enabled ? Color.WHITE : DIM, true);

        if (state != AlarmService.OFF) postInvalidateOnAnimation();
    }

    private void ring(Canvas c, float r, int n, float size, float sweep, boolean flash) {
        for (int i = 0; i < n; i++) {
            double a = 2 * Math.PI * i / n - Math.PI / 2;
            float phase = ((float) i / n - sweep) % 1f;
            if (phase < 0) phase += 1f;
            int col;
            switch (state) {
                case AlarmService.ARMING: col = blend(DIM, Color.WHITE, Math.max(0, 1 - phase * 3f)); break;
                case AlarmService.ARMED: col = blend(Color.parseColor("#6A6A6A"), Color.WHITE, Math.max(0, 1 - phase * 2f)); break;
                case AlarmService.RINGING: col = flash ? RED : DIM; break;
                default: col = DIM;
            }
            dot.setColor(col);
            c.drawCircle(cx + (float) Math.cos(a) * r, cy + (float) Math.sin(a) * r, size, dot);
        }
    }

    private static int blend(int a, int b, float t) {
        return Color.rgb((int) (Color.red(a) + (Color.red(b) - Color.red(a)) * t),
                (int) (Color.green(a) + (Color.green(b) - Color.green(a)) * t),
                (int) (Color.blue(a) + (Color.blue(b) - Color.blue(a)) * t));
    }

    /** Dot-matrix text: every character is a 5x7 grid of dots, `unit` is the grid pitch. x,y = centre (or left/middle when !center). */
    private void text(Canvas c, String s, float x, float y, float unit, int color, boolean center) {
        float width = s.length() * 6 * unit - unit;
        float left = center ? x - width / 2 : x;
        float top = y - 3.5f * unit + unit / 2;
        dot.setColor(color);
        for (int i = 0; i < s.length(); i++) {
            String[] g = FONT.get(s.charAt(i));
            if (g == null) continue;
            for (int row = 0; row < 7; row++)
                for (int col = 0; col < 5; col++)
                    if (g[row].charAt(col) == '1')
                        c.drawCircle(left + (i * 6 + col) * unit + unit / 2, top + row * unit, unit * 0.42f, dot);
        }
    }

    @Override public boolean onTouchEvent(MotionEvent e) {
        if (e.getAction() == MotionEvent.ACTION_UP && listener != null && pickerItems != null) {
            int hit = -1;
            for (int i = 0; i < pickerItems.length; i++) if (rows[i] != null && rows[i].contains(e.getX(), e.getY())) hit = i;
            pickerItems = null;
            invalidate();
            listener.onPick(hit);
        } else if (e.getAction() == MotionEvent.ACTION_UP && listener != null) {
            float dx = e.getX() - cx, dy = e.getY() - cy;
            if (dx * dx + dy * dy <= radius * radius * 1.2f) listener.onToggle();
            else if (enabled && pill.contains(e.getX(), e.getY())) listener.onSound();
        }
        return true;
    }

    private static void g(char ch, String rows) { FONT.put(ch, rows.split(",")); }

    static {
        g('A', "01110,10001,10001,11111,10001,10001,10001"); g('B', "11110,10001,10001,11110,10001,10001,11110");
        g('C', "01110,10001,10000,10000,10000,10001,01110"); g('D', "11110,10001,10001,10001,10001,10001,11110");
        g('E', "11111,10000,10000,11110,10000,10000,11111"); g('F', "11111,10000,10000,11110,10000,10000,10000");
        g('G', "01110,10001,10000,10111,10001,10001,01111"); g('H', "10001,10001,10001,11111,10001,10001,10001");
        g('I', "01110,00100,00100,00100,00100,00100,01110"); g('J', "00111,00010,00010,00010,00010,10010,01100");
        g('K', "10001,10010,10100,11000,10100,10010,10001"); g('L', "10000,10000,10000,10000,10000,10000,11111");
        g('M', "10001,11011,10101,10101,10001,10001,10001"); g('N', "10001,11001,10101,10011,10001,10001,10001");
        g('O', "01110,10001,10001,10001,10001,10001,01110"); g('P', "11110,10001,10001,11110,10000,10000,10000");
        g('Q', "01110,10001,10001,10001,10101,10010,01101"); g('R', "11110,10001,10001,11110,10100,10010,10001");
        g('S', "01111,10000,10000,01110,00001,00001,11110"); g('T', "11111,00100,00100,00100,00100,00100,00100");
        g('U', "10001,10001,10001,10001,10001,10001,01110"); g('V', "10001,10001,10001,10001,10001,01010,00100");
        g('W', "10001,10001,10001,10101,10101,11011,10001"); g('X', "10001,10001,01010,00100,01010,10001,10001");
        g('Y', "10001,10001,01010,00100,00100,00100,00100"); g('Z', "11111,00001,00010,00100,01000,10000,11111");
        g('0', "01110,10001,10011,10101,11001,10001,01110"); g('1', "00100,01100,00100,00100,00100,00100,01110");
        g('2', "01110,10001,00001,00010,00100,01000,11111"); g('3', "11110,00001,00001,01110,00001,00001,11110");
        g('4', "00010,00110,01010,10010,11111,00010,00010"); g('5', "11111,10000,11110,00001,00001,10001,01110");
        g('6', "00110,01000,10000,11110,10001,10001,01110"); g('7', "11111,00001,00010,00100,01000,01000,01000");
        g('8', "01110,10001,10001,01110,10001,10001,01110"); g('9', "01110,10001,10001,01111,00001,00010,01100");
        g('!', "00100,00100,00100,00100,00100,00000,00100"); g('.', "00000,00000,00000,00000,00000,00110,00110");
        g('-', "00000,00000,00000,11111,00000,00000,00000"); g(':', "00000,00110,00110,00000,00110,00110,00000");
        g('?', "01110,10001,00001,00010,00100,00000,00100"); g('(', "00010,00100,01000,01000,01000,00100,00010");
        g(')', "01000,00100,00010,00010,00010,00100,01000");
    }
}
