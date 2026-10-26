#!/usr/bin/env bash
# Builds learn-courses.apk without Gradle: aapt + javac + dx + zipalign + apksigner (apt packages: aapt dalvik-exchange zipalign apksigner android-sdk-platform-23)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"; OUT="$ROOT/out"; ANDROID_JAR=/usr/lib/android-sdk/platforms/android-23/android.jar
[ -f "$ANDROID_JAR" ] || ANDROID_JAR=/usr/share/java/com.android.android-23.jar
CP_JAR="$OUT/cache/android-all-35.jar"   # API 35 stubs from Maven Central, compile-time only (aapt keeps API 23 for resources)
if [ ! -f "$CP_JAR" ]; then mkdir -p "$OUT/cache"; curl -sSf -o "$CP_JAR" https://repo1.maven.org/maven2/org/robolectric/android-all/15-robolectric-12714715/android-all-15-robolectric-12714715.jar; fi
ORT_VER=1.20.0; GSON_VER=2.10.1; mkdir -p "$OUT/cache"
fetch() { [ -f "$2" ] || curl -sSf -o "$2" "$1"; }
fetch https://repo1.maven.org/maven2/com/microsoft/onnxruntime/onnxruntime-android/$ORT_VER/onnxruntime-android-$ORT_VER.aar "$OUT/cache/ort-android-$ORT_VER.aar"
fetch https://repo1.maven.org/maven2/com/google/code/gson/gson/$GSON_VER/gson-$GSON_VER.jar "$OUT/cache/gson.jar"
fetch https://repo1.maven.org/maven2/com/microsoft/onnxruntime/onnxruntime/$ORT_VER/onnxruntime-$ORT_VER.jar "$OUT/cache/onnxruntime-desktop-$ORT_VER.jar"   # only used by tests/jvm/run.sh
if [ ! -f "$OUT/cache/ort-classes-$ORT_VER.jar" ]; then ( cd "$OUT/cache" && rm -rf aar && mkdir aar && unzip -qo ort-android-$ORT_VER.aar -d aar && cp aar/classes.jar ort-classes-$ORT_VER.jar ); fi
# dx cannot read multi-release / module-info entries
if [ ! -f "$OUT/cache/gson-dex.jar" ]; then cp "$OUT/cache/gson.jar" "$OUT/cache/gson-dex.jar"; zip -q -d "$OUT/cache/gson-dex.jar" 'META-INF/versions/*' module-info.class 2>/dev/null || true; fi
rm -rf "$OUT/build"; mkdir -p "$OUT/build/classes" "$OUT/build/assets" "$OUT/build/gen"
python3 -I "$ROOT/tools/assemble.py"                       # merges content/parts -> content/*.json and validates
cp -r "$ROOT/app/www" "$OUT/build/assets/www"
rm -f "$OUT/build/assets/www/tool-test.html"; find "$OUT/build/assets/www" -name '*.map' -delete
# R.java is generated but not used; resources = launcher icon only
aapt package -f -M "$ROOT/android/AndroidManifest.xml" -S "$ROOT/android/res" -I "$ANDROID_JAR" -J "$OUT/build/gen" -F "$OUT/build/base.apk" --min-sdk-version 26 --target-sdk-version 33 --version-code 1 --version-name 1.0 -A "$OUT/build/assets" -0 wasm
javac -nowarn --release 8 -classpath "$CP_JAR:$OUT/cache/ort-classes-$ORT_VER.jar:$OUT/cache/gson.jar" -d "$OUT/build/classes" $(find "$ROOT/android/src" "$OUT/build/gen" -name '*.java') 2>&1 | grep -v "JAVA_TOOL_OPTIONS\|^Note:\|warning: \[options\]" || [ "${PIPESTATUS[0]}" = 0 ]
dalvik-exchange --dex --min-sdk-version=26 --output="$OUT/build/classes.dex" "$OUT/build/classes" "$OUT/cache/ort-classes-$ORT_VER.jar" "$OUT/cache/gson-dex.jar"
mkdir -p "$OUT/build/apkroot/lib/arm64-v8a" && cp "$OUT/cache/aar/jni/arm64-v8a/"*.so "$OUT/build/apkroot/lib/arm64-v8a/" && cp "$OUT/build/classes.dex" "$OUT/build/apkroot/"
( cd "$OUT/build/apkroot" && aapt add -f ../base.apk classes.dex lib/arm64-v8a/libonnxruntime.so lib/arm64-v8a/libonnxruntime4j_jni.so >/dev/null )
zipalign -f -p 4 "$OUT/build/base.apk" "$OUT/build/aligned.apk"
KS="$ROOT/android/learn-debug.keystore"
[ -f "$KS" ] || keytool -genkeypair -keystore "$KS" -storepass android -keypass android -alias learn -keyalg RSA -keysize 2048 -validity 36500 -dname "CN=Learn Courses,O=Personal" >/dev/null 2>&1
apksigner sign --ks "$KS" --ks-pass pass:android --key-pass pass:android --ks-key-alias learn --out "$OUT/learn-courses.apk" "$OUT/build/aligned.apk"
apksigner verify --verbose "$OUT/learn-courses.apk" | head -6
aapt dump badging "$OUT/learn-courses.apk" | grep -E "^package|sdkVersion|targetSdk|launchable|uses-permission" 
ls -la "$OUT/learn-courses.apk"
