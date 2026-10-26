package nl.learn.courses;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/** Thin shell: serves assets/www over https://appassets.androidplatform.net (secure context => WebGPU, Cache API). */
public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    static final String START = "https://" + HOST + "/index.html";
    WebView web;
    BtSync bt;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().setStatusBarColor(Color.parseColor("#ECECEC"));
        getWindow().setNavigationBarColor(Color.parseColor("#ECECEC"));
        if (Build.VERSION.SDK_INT >= 23) {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | (Build.VERSION.SDK_INT >= 26 ? 0x10 : 0));
        }
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        createWeb();
    }

    void createWeb() {
        web = new WebView(this);
        web.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        web.setBackgroundColor(Color.parseColor("#ECECEC"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        WebView.setWebContentsDebuggingEnabled(true);

        if (bt == null) bt = new BtSync(this, web); else bt.web = web;
        web.addJavascriptInterface(new Bridge(), "Android");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) return serve(u);
                return null;
            }

            @Override
            public boolean onRenderProcessGone(WebView v, android.webkit.RenderProcessGoneDetail d) {
                // The renderer died (GPU/memory fault while running the model). Keep the app alive and reload.
                android.util.Log.e("LearnJS", "render process gone, crash=" + d.didCrash());
                android.content.SharedPreferences sp = getSharedPreferences("learn", MODE_PRIVATE);
                sp.edit().putInt("renderGone", sp.getInt("renderGone", 0) + 1).apply();
                try { ((ViewGroup) v.getParent()).removeView(v); v.destroy(); } catch (Exception ignored) { }
                runOnUiThread(new Runnable() { public void run() { createWeb(); } });
                return true;
            }

            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) return false;
                openExternal(u.toString());
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                android.util.Log.d("LearnJS", m.message() + " (" + m.sourceId() + ":" + m.lineNumber() + ")");
                return true;
            }

            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.deny();
            }
        });
        web.loadUrl(START);
    }

    static String mime(String p) {
        String l = p.toLowerCase();
        if (l.endsWith(".html")) return "text/html";
        if (l.endsWith(".js") || l.endsWith(".mjs")) return "text/javascript";
        if (l.endsWith(".css")) return "text/css";
        if (l.endsWith(".json")) return "application/json";
        if (l.endsWith(".wasm")) return "application/wasm";
        if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
        if (l.endsWith(".png")) return "image/png";
        if (l.endsWith(".webp")) return "image/webp";
        if (l.endsWith(".svg")) return "image/svg+xml";
        if (l.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }

    WebResourceResponse serve(Uri u) {
        String path = u.getPath();
        if (path == null || path.equals("/") || path.length() == 0) path = "/index.html";
        try {
            InputStream in = getAssets().open("www" + path);
            String m = mime(path);
            WebResourceResponse r = new WebResourceResponse(m, m.startsWith("text/") || m.equals("application/json") ? "utf-8" : null, in);
            Map<String, String> h = new HashMap<String, String>();
            h.put("Cross-Origin-Opener-Policy", "same-origin");
            h.put("Cross-Origin-Embedder-Policy", "credentialless");
            h.put("Cross-Origin-Resource-Policy", "same-origin");
            h.put("Cache-Control", "no-cache");
            r.setResponseHeaders(h);
            r.setStatusCodeAndReasonPhrase(200, "OK");
            return r;
        } catch (IOException e) {
            WebResourceResponse r = new WebResourceResponse("text/plain", "utf-8", new java.io.ByteArrayInputStream("not found".getBytes()));
            r.setStatusCodeAndReasonPhrase(404, "Not Found");
            return r;
        }
    }

    void openExternal(String url) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        bt.onPermissionResult(res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED);
    }

    @Override
    protected void onDestroy() {
        bt.cancel();
        web.destroy();
        super.onDestroy();
    }

    /** JS-callable API: window.Android.* */
    public class Bridge {
        @android.webkit.JavascriptInterface
        public void openUrl(String url) {
            if (url != null && (url.startsWith("https://") || url.startsWith("http://"))) openExternal(url);
        }

        /** number of renderer crashes since the last call (then reset) */
        @android.webkit.JavascriptInterface
        public int consumeRenderCrashes() {
            android.content.SharedPreferences sp = getSharedPreferences("learn", MODE_PRIVATE);
            int n = sp.getInt("renderGone", 0);
            if (n != 0) sp.edit().putInt("renderGone", 0).apply();
            return n;
        }

        @android.webkit.JavascriptInterface
        public String btState() { return bt.state(); }

        @android.webkit.JavascriptInterface
        public void btRequestPermission() {
            runOnUiThread(new Runnable() { public void run() { bt.requestPermission(); } });
        }

        @android.webkit.JavascriptInterface
        public String btPaired() { return bt.pairedJson(); }

        @android.webkit.JavascriptInterface
        public void btOpenSettings() {
            runOnUiThread(new Runnable() { public void run() {
                try { startActivity(new Intent(android.provider.Settings.ACTION_BLUETOOTH_SETTINGS)); } catch (Exception ignored) { }
            } });
        }

        /** Initiator: connect to a paired device, exchange payloads. Result via window.onBtResult(json). */
        @android.webkit.JavascriptInterface
        public void btConnect(String address, String payload) { bt.connect(address, payload); }

        /** Responder: wait (up to 120s) for a paired device to connect, exchange payloads. */
        @android.webkit.JavascriptInterface
        public void btListen(String payload) { bt.listen(payload); }

        @android.webkit.JavascriptInterface
        public void btCancel() { bt.cancel(); }
    }
}
