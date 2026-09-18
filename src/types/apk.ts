export interface ApkPermission {
  name: string;
  shortName: string;
  description: string;
  risk: 'normal' | 'dangerous' | 'signature';
  granted: boolean;
}

export interface ApkActivity {
  name: string;
  label?: string;
  isLauncher: boolean;
  exported?: boolean;
}

export interface ApkManifest {
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
  rawXml: string;
  theme?: string;
}

export interface DexInfo {
  header: {
    magic: string;
    checksum: number;
    fileSize: number;
    classDefsSize: number;
    methodIdsSize: number;
    stringIdsSize: number;
    protoIdsSize: number;
    fieldIdsSize: number;
  };
  classes: string[];
  methods: string[];
  strings: string[];
}

export interface ApkFileEntry {
  path: string;
  size: number;
  compressedSize: number;
  isDir: boolean;
  type: 'manifest' | 'dex' | 'res' | 'asset' | 'lib' | 'cert' | 'other';
}

export interface ParsedApk {
  id: string;
  fileName: string;
  fileSize: number;
  manifest: ApkManifest;
  dexInfo?: DexInfo;
  iconUrl?: string;
  files: ApkFileEntry[];
  hasWebAssets: boolean;
  entryHtmlPath?: string;
  entryHtmlContent?: string;
  bundledAssets?: Record<string, string>; // path -> content/blob url
  rawBlob: Blob;
  uploadedAt: number;
  sampleType?: 'flappy' | '2048' | 'calculator' | 'snake' | 'tester' | 'notes' | 'easteregg' | 'custom';
}

export interface AndroidLogEntry {
  id: string;
  timestamp: string;
  level: 'V' | 'D' | 'I' | 'W' | 'E';
  tag: string;
  message: string;
  pid: number;
}

export interface InstalledApp {
  id: string;
  packageName: string;
  name: string;
  iconUrl?: string;
  versionName: string;
  apk: ParsedApk;
  installDate: number;
  isSystem?: boolean;
}

export type NavMode = 'buttons' | 'gestures';
