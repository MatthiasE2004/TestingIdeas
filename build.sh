#!/usr/bin/env bash
# Builds learn-courses.apk without Gradle: aapt + javac + dx + zipalign + apksigner (apt packages: aapt dalvik-exchange zipalign apksigner android-sdk-platform-23)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"; OUT="$ROOT/out"; ANDROID_JAR=/usr/lib/android-sdk/platforms/android-23/android.jar
[ -f "$ANDROID_JAR" ] || ANDROID_JAR=/usr/share/java/com.android.android-23.jar
CP_JAR="$OUT/cache/android-all-35.jar"   # API 35 stubs from Maven Central, compile-time only (aapt keeps API 23 for resources)
if [ ! -f "$CP_JAR" ]; then mkdir -p "$OUT/cache"; curl -sSf -o "$CP_JAR" https://repo1.maven.org/maven2/org/robolectric/android-all/15-robolectric-12714715/android-all-15-robolectric-12714715.jar; fi
rm -rf "$OUT/build"; mkdir -p "$OUT/build/classes" "$OUT/build/assets" "$OUT/build/gen"
python3 -I "$ROOT/tools/assemble.py"                       # merges content/parts -> content/*.json and validates
cp -r "$ROOT/app/www" "$OUT/build/assets/www"
rm -f "$OUT/build/assets/www/tool-test.html"; find "$OUT/build/assets/www" -name '*.map' -delete
# R.java is generated but not used; resources = launcher icon only
aapt package -f -M "$ROOT/android/AndroidManifest.xml" -S "$ROOT/android/res" -I "$ANDROID_JAR" -J "$OUT/build/gen" -F "$OUT/build/base.apk" --min-sdk-version 24 --target-sdk-version 33 --version-code 1 --version-name 1.0 -A "$OUT/build/assets" -0 wasm
javac -nowarn --release 8 -classpath "$CP_JAR" -d "$OUT/build/classes" $(find "$ROOT/android/src" "$OUT/build/gen" -name '*.java') 2>&1 | grep -v "JAVA_TOOL_OPTIONS\|^Note:\|warning: \[options\]" || [ "${PIPESTATUS[0]}" = 0 ]
dalvik-exchange --dex --min-sdk-version=24 --output="$OUT/build/classes.dex" "$OUT/build/classes"
( cd "$OUT/build" && aapt add -f base.apk classes.dex >/dev/null )
zipalign -f -p 4 "$OUT/build/base.apk" "$OUT/build/aligned.apk"
KS="$ROOT/android/learn-debug.keystore"
[ -f "$KS" ] || keytool -genkeypair -keystore "$KS" -storepass android -keypass android -alias learn -keyalg RSA -keysize 2048 -validity 36500 -dname "CN=Learn Courses,O=Personal" >/dev/null 2>&1
apksigner sign --ks "$KS" --ks-pass pass:android --key-pass pass:android --ks-key-alias learn --out "$OUT/learn-courses.apk" "$OUT/build/aligned.apk"
apksigner verify --verbose "$OUT/learn-courses.apk" | head -6
aapt dump badging "$OUT/learn-courses.apk" | grep -E "^package|sdkVersion|targetSdk|launchable|uses-permission" 
ls -la "$OUT/learn-courses.apk"
