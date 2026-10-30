#!/usr/bin/env bash
# Builds door-alarm.apk without Gradle (apt: aapt apksigner zipalign dalvik-exchange android-sdk-platform-23, JDK).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"; OUT="$ROOT/out"; ANDROID_JAR=/usr/lib/android-sdk/platforms/android-23/android.jar
CP_JAR="$OUT/cache/android-all-35.jar"   # API 35 stubs, compile-time only
if [ ! -f "$CP_JAR" ]; then mkdir -p "$OUT/cache"; curl -sSf -o "$CP_JAR" https://repo1.maven.org/maven2/org/robolectric/android-all/15-robolectric-12714715/android-all-15-robolectric-12714715.jar; fi
rm -rf "$OUT/build"; mkdir -p "$OUT/build/classes" "$OUT/build/gen"
aapt package -f -M "$ROOT/AndroidManifest.xml" -S "$ROOT/res" -I "$ANDROID_JAR" -J "$OUT/build/gen" -F "$OUT/build/base.apk" --min-sdk-version 26 --target-sdk-version 33 --version-code 1 --version-name 1.0
javac -nowarn --release 8 -classpath "$CP_JAR" -d "$OUT/build/classes" $(find "$ROOT/src" "$OUT/build/gen" -name '*.java') 2>&1 | grep -v "JAVA_TOOL_OPTIONS\|^Note:\|warning: \[options\]" || [ "${PIPESTATUS[0]}" = 0 ]
dalvik-exchange --dex --min-sdk-version=26 --output="$OUT/build/classes.dex" "$OUT/build/classes"
( cd "$OUT/build" && aapt add -f base.apk classes.dex >/dev/null )
zipalign -f -p 4 "$OUT/build/base.apk" "$OUT/build/aligned.apk"
KS="$ROOT/door-alarm.keystore"
[ -f "$KS" ] || keytool -genkeypair -keystore "$KS" -storepass android -keypass android -alias dooralarm -keyalg RSA -keysize 2048 -validity 36500 -dname "CN=Door Alarm,O=Personal" >/dev/null 2>&1
apksigner sign --ks "$KS" --ks-pass pass:android --key-pass pass:android --ks-key-alias dooralarm --out "$OUT/door-alarm.apk" "$OUT/build/aligned.apk"
apksigner verify --verbose "$OUT/door-alarm.apk" | head -3
aapt dump badging "$OUT/door-alarm.apk" | grep -E "^package|sdkVersion|targetSdk|launchable|uses-permission"
mkdir -p "$ROOT/dist" && cp "$OUT/door-alarm.apk" "$ROOT/dist/door-alarm.apk" && ls -la "$ROOT/dist/door-alarm.apk"
