package nl.learn.courses;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.content.pm.PackageManager;
import android.os.Build;
import android.webkit.WebView;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/** Peer-to-peer progress sync over classic Bluetooth RFCOMM between two already-paired devices. */
public class BtSync {
    static final UUID SERVICE = UUID.fromString("7d1b6a52-3c0e-4c55-9a43-6c0a1e5a7b11");
    static final int MAX = 8 * 1024 * 1024;
    final Activity act;
    final WebView web;
    volatile BluetoothServerSocket server;
    volatile BluetoothSocket socket;
    volatile boolean busy;

    BtSync(Activity a, WebView w) { act = a; web = w; }

    boolean needsPerm() {
        return Build.VERSION.SDK_INT >= 31 && act.checkSelfPermission("android.permission.BLUETOOTH_CONNECT") != PackageManager.PERMISSION_GRANTED;
    }

    /** "unsupported" | "off" | "permission" | "ready" */
    String state() {
        BluetoothAdapter ad = BluetoothAdapter.getDefaultAdapter();
        if (ad == null) return "unsupported";
        if (needsPerm()) return "permission";
        if (!ad.isEnabled()) return "off";
        return "ready";
    }

    void requestPermission() {
        if (Build.VERSION.SDK_INT >= 31) act.requestPermissions(new String[]{"android.permission.BLUETOOTH_CONNECT"}, 77);
    }

    void onPermissionResult(boolean ok) { js("window.onBtPermission&&window.onBtPermission(" + ok + ")"); }

    String pairedJson() {
        BluetoothAdapter ad = BluetoothAdapter.getDefaultAdapter();
        StringBuilder sb = new StringBuilder("[");
        if (ad != null && !needsPerm()) {
            try {
                Set<BluetoothDevice> set = ad.getBondedDevices();
                boolean first = true;
                for (BluetoothDevice d : set) {
                    if (!first) sb.append(',');
                    first = false;
                    sb.append("{\"name\":").append(q(d.getName())).append(",\"address\":").append(q(d.getAddress())).append('}');
                }
            } catch (SecurityException ignored) { }
        }
        return sb.append(']').toString();
    }

    void connect(final String address, final String payload) {
        if (busy) { result(false, "busy", null); return; }
        busy = true;
        new Thread(new Runnable() {
            public void run() {
                BluetoothSocket s = null;
                try {
                    BluetoothAdapter ad = BluetoothAdapter.getDefaultAdapter();
                    BluetoothDevice d = ad.getRemoteDevice(address);
                    ad.cancelDiscovery();
                    s = d.createRfcommSocketToServiceRecord(SERVICE);
                    socket = s;
                    s.connect();
                    String remote = exchange(s, payload, true);
                    result(true, null, remote);
                } catch (Exception e) {
                    result(false, e.getMessage() == null ? e.toString() : e.getMessage(), null);
                } finally {
                    close(s);
                    socket = null;
                    busy = false;
                }
            }
        }, "bt-connect").start();
    }

    void listen(final String payload) {
        if (busy) { result(false, "busy", null); return; }
        busy = true;
        new Thread(new Runnable() {
            public void run() {
                BluetoothSocket s = null;
                try {
                    BluetoothAdapter ad = BluetoothAdapter.getDefaultAdapter();
                    server = ad.listenUsingRfcommWithServiceRecord("LearnSync", SERVICE);
                    // accept() blocks until a peer connects or cancel() closes the server; watchdog stops it after 120s
                    final BluetoothServerSocket srv = server;
                    Thread wd = new Thread(new Runnable() {
                        public void run() {
                            try { Thread.sleep(120000); } catch (InterruptedException e) { return; }
                            try { srv.close(); } catch (IOException ignored) { }
                        }
                    });
                    wd.setDaemon(true);
                    wd.start();
                    s = srv.accept();
                    wd.interrupt();
                    socket = s;
                    String remote = exchange(s, payload, false);
                    result(true, null, remote);
                } catch (Exception e) {
                    result(false, e.getMessage() == null ? e.toString() : e.getMessage(), null);
                } finally {
                    close(s);
                    try { if (server != null) server.close(); } catch (IOException ignored) { }
                    server = null;
                    socket = null;
                    busy = false;
                }
            }
        }, "bt-listen").start();
    }

    /** Both sides send their full state and read the other's; initiator writes first to avoid deadlock. */
    String exchange(BluetoothSocket s, String mine, boolean first) throws IOException {
        DataOutputStream out = new DataOutputStream(s.getOutputStream());
        DataInputStream in = new DataInputStream(s.getInputStream());
        byte[] m = mine.getBytes("UTF-8");
        if (first) { out.writeInt(m.length); out.write(m); out.flush(); }
        int n = in.readInt();
        if (n < 0 || n > MAX) throw new IOException("bad length");
        byte[] r = new byte[n];
        in.readFully(r);
        if (!first) { out.writeInt(m.length); out.write(m); out.flush(); }
        try { Thread.sleep(300); } catch (InterruptedException ignored) { }
        return new String(r, "UTF-8");
    }

    void cancel() {
        try { if (server != null) server.close(); } catch (IOException ignored) { }
        close(socket);
    }

    static void close(BluetoothSocket s) { try { if (s != null) s.close(); } catch (IOException ignored) { } }

    void result(boolean ok, String err, String data) {
        StringBuilder sb = new StringBuilder("window.onBtResult&&window.onBtResult({\"ok\":").append(ok);
        if (err != null) sb.append(",\"error\":").append(q(err));
        if (data != null) sb.append(",\"data\":").append(q(data));
        sb.append("})");
        js(sb.toString());
    }

    void js(final String code) {
        act.runOnUiThread(new Runnable() { public void run() { web.evaluateJavascript(code, null); } });
    }

    static String q(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                case ' ': sb.append("\\u2028"); break;
                case ' ': sb.append("\\u2029"); break;
                default:
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c)); else sb.append(c);
            }
        }
        return sb.append('"').toString();
    }
}
