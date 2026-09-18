import JSZip from 'jszip';
import { ParsedApk } from '../types/apk';
import { parseApkFile } from './apkParser';

export interface SampleApkDef {
  id: string;
  name: string;
  packageName: string;
  versionName: string;
  category: string;
  description: string;
  sizeFormatted: string;
  color: string;
  iconSvg: string;
  sampleType: 'flappy' | '2048' | 'calculator' | 'snake' | 'tester' | 'notes' | 'easteregg';
}

export const SAMPLE_APKS: SampleApkDef[] = [
  {
    id: 'sample_easteregg',
    name: 'Android 10 Easter Egg',
    packageName: 'com.android.egg',
    versionName: '10.0.0',
    category: 'System Easter Egg',
    description: 'Official Android 10 (Q) interactive number puzzle and Bugdroid nonogram picross solver.',
    sizeFormatted: '1.4 MB',
    color: '#00875A',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#00875A"/><text x="24" y="32" font-size="18" font-weight="900" font-family="system-ui, sans-serif" fill="#fff" text-anchor="middle">10</text></svg>`,
    sampleType: 'easteregg',
  },
  {
    id: 'sample_flappy',
    name: 'Flappy Droid',
    packageName: 'com.google.android.flappydroid',
    versionName: '2.4.1',
    category: 'Arcade Game',
    description: 'Fly the little Android green robot through retro obstacles with tap physics and sounds.',
    sizeFormatted: '3.4 MB',
    color: '#34A853',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#3DDC84"/><path d="M14 26a10 10 0 0 1 20 0v10a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V26Z" fill="#fff"/><circle cx="20" cy="24" r="2" fill="#3DDC84"/><circle cx="28" cy="24" r="2" fill="#3DDC84"/><path d="M19 16l-3-4m13 4l3-4" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
    sampleType: 'flappy',
  },
  {
    id: 'sample_2048',
    name: '2048 Android',
    packageName: 'com.gabrielecirulli.app2048',
    versionName: '1.8.0',
    category: 'Puzzle Game',
    description: 'Classic sliding puzzle game for Android. Join tiles to reach the 2048 tile!',
    sizeFormatted: '2.1 MB',
    color: '#EDC22E',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#EDC22E"/><text x="24" y="30" font-size="14" font-weight="900" font-family="system-ui, sans-serif" fill="#fff" text-anchor="middle">2048</text></svg>`,
    sampleType: '2048',
  },
  {
    id: 'sample_calculator',
    name: 'Material Calculator',
    packageName: 'com.google.android.calculator',
    versionName: '8.6.0',
    category: 'Productivity',
    description: 'Android Material 3 scientific calculator with history, memory, and smooth operations.',
    sizeFormatted: '4.8 MB',
    color: '#4285F4',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#1A73E8"/><path d="M15 17h18M15 31h18M24 15v18M15 24h6M27 24h6" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    sampleType: 'calculator',
  },
  {
    id: 'sample_snake',
    name: 'Retro Snake 97',
    packageName: 'com.android.retro.snake',
    versionName: '3.0.2',
    category: 'Arcade Classic',
    description: 'Nostalgic dot-matrix snake with responsive directional touch controls and arcade sound effects.',
    sizeFormatted: '1.9 MB',
    color: '#889e24',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#889e24"/><circle cx="16" cy="18" r="3" fill="#202e08"/><circle cx="24" cy="18" r="3" fill="#202e08"/><circle cx="32" cy="18" r="3" fill="#202e08"/><circle cx="32" cy="26" r="3" fill="#202e08"/><circle cx="32" cy="34" r="3" fill="#202e08"/><circle cx="24" cy="34" r="3" fill="#202e08"/><circle cx="16" cy="34" r="3.5" fill="#f00"/></svg>`,
    sampleType: 'snake',
  },
  {
    id: 'sample_tester',
    name: 'Hardware & Sensors',
    packageName: 'com.android.hardware.tester',
    versionName: '4.2.0',
    category: 'Tools & Diagnostics',
    description: 'Diagnostics tool testing virtual multitouch points, gyroscope tilt, battery, speaker, and vibration.',
    sizeFormatted: '5.2 MB',
    color: '#0F9D58',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0F9D58"/><circle cx="24" cy="24" r="12" stroke="#fff" stroke-width="2" fill="none"/><line x1="24" y1="12" x2="24" y2="36" stroke="#fff" stroke-width="2"/><line x1="12" y1="24" x2="36" y2="24" stroke="#fff" stroke-width="2"/><circle cx="24" cy="24" r="4" fill="#fff"/></svg>`,
    sampleType: 'tester',
  },
  {
    id: 'sample_notes',
    name: 'Android Notes',
    packageName: 'com.android.notes',
    versionName: '2.1.0',
    category: 'Productivity',
    description: 'Quick scratchpad and rich note-taking app with color tags, search, and instant persistence.',
    sizeFormatted: '2.7 MB',
    color: '#F4B400',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#F4B400"/><rect x="14" y="14" width="20" height="20" rx="3" fill="#fff"/><line x1="18" y1="20" x2="28" y2="20" stroke="#F4B400" stroke-width="2"/><line x1="18" y1="25" x2="30" y2="25" stroke="#F4B400" stroke-width="2"/><line x1="18" y1="30" x2="24" y2="30" stroke="#F4B400" stroke-width="2"/></svg>`,
    sampleType: 'notes',
  },
];

/**
 * Creates a real, structured APK file (ZIP) on the fly for any sample.
 */
export async function generateSampleApk(def: SampleApkDef): Promise<ParsedApk> {
  const zip = new JSZip();

  // Create clean AndroidManifest.xml
  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${def.packageName}"
    android:versionCode="${def.versionName.replace(/\./g, '')}"
    android:versionName="${def.versionName}">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="29" />
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    ${def.sampleType === 'tester' ? '<uses-permission android:name="android.permission.CAMERA" />\n    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />' : ''}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${def.name}"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  zip.file('AndroidManifest.xml', manifestXml);

  // Add dummy / structured classes.dex
  // Header: dex 035 magic
  const dexHeader = new Uint8Array(112);
  const magic = [0x64, 0x65, 0x78, 0x0a, 0x30, 0x33, 0x35, 0x00]; // "dex\n035\0"
  dexHeader.set(magic, 0);
  zip.file('classes.dex', dexHeader);

  // Add res/ and assets/
  zip.file('res/mipmap-xxhdpi/ic_launcher.png', def.iconSvg);
  zip.file('res/layout/activity_main.xml', `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">
    <TextView
        android:id="@+id/titleText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="${def.name}" />
</LinearLayout>`);

  zip.file('assets/app_config.json', JSON.stringify({
    name: def.name,
    package: def.packageName,
    version: def.versionName,
    builtWith: 'Android SDK 29.0.3 (Android 10 Q)',
    type: def.sampleType,
  }, null, 2));

  zip.file('META-INF/CERT.RSA', new Uint8Array([0x30, 0x82, 0x02, 0x5a]));
  zip.file('META-INF/MANIFEST.MF', `Manifest-Version: 1.0\nCreated-By: 17.0.8 (OpenJDK)\n`);

  // Generate real Blob
  const blob = await zip.generateAsync({ type: 'blob' });
  const parsed = await parseApkFile(blob, `${def.name.replace(/\s+/g, '_')}.apk`);

  // Attach icon data URL and sample type
  const iconDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(def.iconSvg)}`;
  parsed.iconUrl = iconDataUrl;
  parsed.sampleType = def.sampleType;
  parsed.manifest.appName = def.name;
  parsed.manifest.packageName = def.packageName;
  parsed.manifest.versionName = def.versionName;

  return parsed;
}
