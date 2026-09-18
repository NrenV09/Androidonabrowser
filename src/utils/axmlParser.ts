import { ApkManifest, ApkPermission, ApkActivity } from '../types/apk';

// Known Android permissions database with risk levels
export const KNOWN_PERMISSIONS: Record<string, { desc: string; risk: 'normal' | 'dangerous' | 'signature' }> = {
  'android.permission.INTERNET': {
    desc: 'Allows the app to create network sockets and use custom network protocols.',
    risk: 'normal',
  },
  'android.permission.ACCESS_NETWORK_STATE': {
    desc: 'Allows the app to view information about network connections.',
    risk: 'normal',
  },
  'android.permission.ACCESS_WIFI_STATE': {
    desc: 'Allows the app to view information about Wi-Fi networking.',
    risk: 'normal',
  },
  'android.permission.CAMERA': {
    desc: 'Allows the app to take pictures and record videos using the camera.',
    risk: 'dangerous',
  },
  'android.permission.RECORD_AUDIO': {
    desc: 'Allows the app to record audio using the microphone.',
    risk: 'dangerous',
  },
  'android.permission.ACCESS_FINE_LOCATION': {
    desc: 'Allows the app to access precise GPS location.',
    risk: 'dangerous',
  },
  'android.permission.ACCESS_COARSE_LOCATION': {
    desc: 'Allows the app to access approximate network-based location.',
    risk: 'dangerous',
  },
  'android.permission.READ_EXTERNAL_STORAGE': {
    desc: 'Allows the app to read photos, media, and files on device.',
    risk: 'dangerous',
  },
  'android.permission.WRITE_EXTERNAL_STORAGE': {
    desc: 'Allows the app to modify or delete storage contents.',
    risk: 'dangerous',
  },
  'android.permission.VIBRATE': {
    desc: 'Allows the app to control the vibrator haptic engine.',
    risk: 'normal',
  },
  'android.permission.WAKE_LOCK': {
    desc: 'Allows the app to prevent the processor from sleeping or screen dimming.',
    risk: 'normal',
  },
  'android.permission.BLUETOOTH': {
    desc: 'Allows the app to connect to paired Bluetooth devices.',
    risk: 'normal',
  },
  'android.permission.POST_NOTIFICATIONS': {
    desc: 'Allows the app to display notifications in the status bar.',
    risk: 'dangerous',
  },
  'android.permission.SYSTEM_ALERT_WINDOW': {
    desc: 'Allows the app to display on top of other apps.',
    risk: 'signature',
  },
};

/**
 * Decodes Android Binary XML (AXML) into standard XML text and metadata.
 */
export function parseAxml(buffer: ArrayBuffer): { xml: string; manifest: Partial<ApkManifest> } {
  try {
    const data = new DataView(buffer);

    // Check if it's plain text XML first
    const firstChars = new Uint8Array(buffer.slice(0, 10));
    const isPlainText = String.fromCharCode(...firstChars).includes('<?xml') || String.fromCharCode(...firstChars).includes('<man');
    if (isPlainText) {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(buffer);
      return parseTextManifest(text);
    }

    // Binary XML chunk constants
    const CHUNK_AXML_FILE = 0x00080003;
    const CHUNK_STRING_POOL = 0x001C0001;
    const CHUNK_RESOURCE_MAP = 0x00080180;
    const CHUNK_XML_START_TAG = 0x00100102;
    const CHUNK_XML_END_TAG = 0x00100103;
    const CHUNK_XML_TEXT = 0x00100104;

    const fileMagic = data.getUint32(0, true);
    if (fileMagic !== CHUNK_AXML_FILE && fileMagic !== 0x00080000) {
      // Fallback: try reading as text
      const decoder = new TextDecoder('utf-8');
      return parseTextManifest(decoder.decode(buffer));
    }

    let offset = 8;
    const strings: string[] = [];
    const elements: string[] = [];
    let currentIndent = 0;
    const xmlLines: string[] = ['<?xml version="1.0" encoding="utf-8"?>'];

    const manifestData: {
      packageName: string;
      versionCode: number;
      versionName: string;
      minSdkVersion: number;
      targetSdkVersion: number;
      appName: string;
      iconPath?: string;
      permissions: ApkPermission[];
      activities: ApkActivity[];
      launcherActivity?: string;
    } = {
      packageName: 'com.example.androidapp',
      versionCode: 1,
      versionName: '1.0',
      minSdkVersion: 21,
      targetSdkVersion: 34,
      appName: 'Android App',
      permissions: [],
      activities: [],
    };

    let currentActivity: Partial<ApkActivity> | null = null;
    let isInsideIntentFilter = false;
    let hasLauncherCategory = false;
    let hasMainAction = false;

    while (offset < buffer.byteLength) {
      const chunkType = data.getUint32(offset, true);
      const chunkSize = data.getUint32(offset + 4, true);

      if (chunkSize <= 0 || offset + chunkSize > buffer.byteLength + 10) {
        break;
      }

      if (chunkType === CHUNK_STRING_POOL) {
        // Parse string pool
        const stringCount = data.getUint32(offset + 8, true);
        const flags = data.getUint32(offset + 16, true);
        const isUtf8 = (flags & (1 << 8)) !== 0;
        const stringsStart = offset + data.getUint32(offset + 20, true);

        for (let i = 0; i < stringCount; i++) {
          const stringOffset = data.getUint32(offset + 28 + i * 4, true);
          const strPos = stringsStart + stringOffset;

          if (strPos < buffer.byteLength) {
            let str = '';
            if (isUtf8) {
              // Read UTF-8 string
              let len = data.getUint8(strPos);
              let readPos = strPos + 1;
              if (len & 0x80) {
                len = ((len & 0x7f) << 8) | data.getUint8(readPos);
                readPos++;
              }
              const bytes = new Uint8Array(buffer, readPos, Math.min(len, buffer.byteLength - readPos));
              str = new TextDecoder('utf-8').decode(bytes);
            } else {
              // Read UTF-16 string
              let len = data.getUint16(strPos, true);
              let readPos = strPos + 2;
              if (len & 0x8000) {
                len = ((len & 0x7fff) << 16) | data.getUint16(readPos, true);
                readPos += 2;
              }
              const chars: string[] = [];
              for (let c = 0; c < len; c++) {
                if (readPos + c * 2 + 1 < buffer.byteLength) {
                  chars.push(String.fromCharCode(data.getUint16(readPos + c * 2, true)));
                }
              }
              str = chars.join('');
            }
            strings.push(str);
          } else {
            strings.push('');
          }
        }
      } else if (chunkType === CHUNK_XML_START_TAG) {
        const nameIdx = data.getUint32(offset + 20, true);
        const attrCount = data.getUint16(offset + 28, true);
        const tagName = strings[nameIdx] || `tag_${nameIdx}`;
        elements.push(tagName);

        const attrs: { name: string; value: string }[] = [];
        let attrOffset = offset + 36;

        for (let i = 0; i < attrCount; i++) {
          if (attrOffset + 20 <= offset + chunkSize) {
            const attrNameIdx = data.getUint32(attrOffset + 4, true);
            const attrValIdx = data.getUint32(attrOffset + 8, true);
            const attrData = data.getUint32(attrOffset + 16, true);
            const attrDataType = data.getUint32(attrOffset + 12, true) >> 24;

            const aName = strings[attrNameIdx] || `attr_${i}`;
            let aVal = '';

            if (attrValIdx !== 0xffffffff && strings[attrValIdx] !== undefined) {
              aVal = strings[attrValIdx];
            } else if (attrDataType === 18) {
              // Boolean
              aVal = attrData !== 0 ? 'true' : 'false';
            } else if (attrDataType >= 16 && attrDataType <= 31) {
              // Integer
              aVal = attrData.toString();
            } else if (attrDataType === 1) {
              // Resource ID
              aVal = `@0x${attrData.toString(16).padStart(8, '0')}`;
            } else {
              aVal = attrData.toString();
            }

            attrs.push({ name: aName, value: aVal });
            attrOffset += 20;
          }
        }

        // Extract metadata based on tag
        if (tagName === 'manifest') {
          for (const a of attrs) {
            if (a.name === 'package') manifestData.packageName = a.value;
            if (a.name === 'versionCode') manifestData.versionCode = parseInt(a.value) || 1;
            if (a.name === 'versionName') manifestData.versionName = a.value;
          }
        } else if (tagName === 'uses-sdk') {
          for (const a of attrs) {
            if (a.name === 'minSdkVersion') manifestData.minSdkVersion = parseInt(a.value) || 21;
            if (a.name === 'targetSdkVersion') manifestData.targetSdkVersion = parseInt(a.value) || 34;
          }
        } else if (tagName === 'application') {
          for (const a of attrs) {
            if (a.name === 'label') manifestData.appName = a.value;
            if (a.name === 'icon') manifestData.iconPath = a.value;
          }
        } else if (tagName === 'uses-permission') {
          for (const a of attrs) {
            if (a.name === 'name') {
              const pName = a.value;
              const shortName = pName.split('.').pop() || pName;
              const meta = KNOWN_PERMISSIONS[pName] || {
                desc: 'Standard Android application permission request.',
                risk: 'normal',
              };
              manifestData.permissions.push({
                name: pName,
                shortName,
                description: meta.desc,
                risk: meta.risk,
                granted: true,
              });
            }
          }
        } else if (tagName === 'activity') {
          let actName = '';
          let actLabel = '';
          let exported = false;
          for (const a of attrs) {
            if (a.name === 'name') actName = a.value;
            if (a.name === 'label') actLabel = a.value;
            if (a.name === 'exported') exported = a.value === 'true';
          }
          currentActivity = {
            name: actName,
            label: actLabel || manifestData.appName,
            isLauncher: false,
            exported,
          };
          hasMainAction = false;
          hasLauncherCategory = false;
        } else if (tagName === 'intent-filter') {
          isInsideIntentFilter = true;
        } else if (tagName === 'action' && isInsideIntentFilter) {
          for (const a of attrs) {
            if (a.name === 'name' && a.value.includes('android.intent.action.MAIN')) {
              hasMainAction = true;
            }
          }
        } else if (tagName === 'category' && isInsideIntentFilter) {
          for (const a of attrs) {
            if (a.name === 'name' && a.value.includes('android.intent.category.LAUNCHER')) {
              hasLauncherCategory = true;
            }
          }
        }

        const indent = '  '.repeat(currentIndent);
        const attrString = attrs.map((a) => `android:${a.name}="${a.value}"`).join(' ');
        xmlLines.push(`${indent}<${tagName}${attrString ? ' ' + attrString : ''}>`);
        currentIndent++;
      } else if (chunkType === CHUNK_XML_END_TAG) {
        const nameIdx = data.getUint32(offset + 20, true);
        const tagName = strings[nameIdx] || elements.pop() || 'tag';

        if (tagName === 'intent-filter') {
          isInsideIntentFilter = false;
          if (currentActivity && hasMainAction && hasLauncherCategory) {
            currentActivity.isLauncher = true;
            manifestData.launcherActivity = currentActivity.name;
          }
        } else if (tagName === 'activity') {
          if (currentActivity && currentActivity.name) {
            manifestData.activities.push(currentActivity as ApkActivity);
          }
          currentActivity = null;
        }

        currentIndent = Math.max(0, currentIndent - 1);
        const indent = '  '.repeat(currentIndent);
        xmlLines.push(`${indent}</${tagName}>`);
      }

      offset += chunkSize;
    }

    // Default launcher activity if none marked
    if (!manifestData.launcherActivity && manifestData.activities.length > 0) {
      manifestData.activities[0].isLauncher = true;
      manifestData.launcherActivity = manifestData.activities[0].name;
    }

    return {
      xml: xmlLines.join('\n'),
      manifest: manifestData,
    };
  } catch (err) {
    console.warn('AXML parse error, fallback to mock manifest:', err);
    return parseTextManifest('');
  }
}

/**
 * Fallback parser for text or unknown manifests
 */
export function parseTextManifest(text: string): { xml: string; manifest: Partial<ApkManifest> } {
  const pkgMatch = text.match(/package\s*=\s*["']([^"']+)["']/i);
  const vCodeMatch = text.match(/versionCode\s*=\s*["']?(\d+)["']?/i);
  const vNameMatch = text.match(/versionName\s*=\s*["']([^"']+)["']/i);
  const minSdkMatch = text.match(/minSdkVersion\s*=\s*["']?(\d+)["']?/i);
  const targetSdkMatch = text.match(/targetSdkVersion\s*=\s*["']?(\d+)["']?/i);
  const appLabelMatch = text.match(/android:label\s*=\s*["']([^"']+)["']/i);

  const permissions: ApkPermission[] = [];
  const permRegex = /<uses-permission[^>]+android:name=["']([^"']+)["']/gi;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = permRegex.exec(text)) !== null) {
    const pName = pMatch[1];
    const shortName = pName.split('.').pop() || pName;
    const meta = KNOWN_PERMISSIONS[pName] || {
      desc: 'Standard Android application permission.',
      risk: 'normal' as const,
    };
    permissions.push({
      name: pName,
      shortName,
      description: meta.desc,
      risk: meta.risk,
      granted: true,
    });
  }

  const activities: ApkActivity[] = [];
  const actRegex = /<activity[^>]+android:name=["']([^"']+)["'][^>]*>/gi;
  let aMatch: RegExpExecArray | null;
  while ((aMatch = actRegex.exec(text)) !== null) {
    activities.push({
      name: aMatch[1],
      isLauncher: activities.length === 0,
    });
  }

  return {
    xml: text.trim() || generateDefaultXmlManifest(),
    manifest: {
      packageName: pkgMatch ? pkgMatch[1] : 'com.android.app',
      versionCode: vCodeMatch ? parseInt(vCodeMatch[1]) : 1,
      versionName: vNameMatch ? vNameMatch[1] : '1.0',
      minSdkVersion: minSdkMatch ? parseInt(minSdkMatch[1]) : 21,
      targetSdkVersion: targetSdkMatch ? parseInt(targetSdkMatch[1]) : 34,
      appName: appLabelMatch ? appLabelMatch[1] : 'Android Application',
      permissions,
      activities,
      launcherActivity: activities.length > 0 ? activities[0].name : undefined,
    },
  };
}

export function generateDefaultXmlManifest(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.androidapp"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:label="Android App"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault.Light">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
}
