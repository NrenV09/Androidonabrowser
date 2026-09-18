import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { InstalledApp, ParsedApk, AndroidLogEntry, NavMode } from '../types/apk';
import { generateSampleApk, SAMPLE_APKS } from '../utils/sampleApks';

export interface AndroidNotification {
  id: string;
  title: string;
  message: string;
  appName: string;
  time: string;
  icon?: string;
  onAction?: () => void;
}

interface AndroidSystemContextType {
  // Power & Display
  isPowerOn: boolean;
  togglePower: () => void;
  restartDevice: () => void;
  brightness: number;
  setBrightness: (val: number) => void;
  isDarkMode: boolean;
  setDarkMode: (val: boolean) => void;

  // Connectivity & Hardware
  wifiEnabled: boolean;
  toggleWifi: () => void;
  bluetoothEnabled: boolean;
  toggleBluetooth: () => void;
  airplaneMode: boolean;
  toggleAirplaneMode: () => void;
  flashlightOn: boolean;
  toggleFlashlight: () => void;
  batteryLevel: number;
  setBatteryLevel: (val: number) => void;
  isCharging: boolean;
  toggleCharging: () => void;
  volume: number;
  setVolume: (val: number) => void;
  adjustVolume: (delta: number) => void;
  showVolumeSlider: boolean;

  // Navigation & Multi-tasking
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
  activeAppId: string | null;
  runningApps: string[];
  isRecentsOpen: boolean;
  openRecents: () => void;
  closeRecents: () => void;
  clearAllRecents: () => void;
  pressBack: () => void;
  pressHome: () => void;

  // Notifications & Shade
  notifications: AndroidNotification[];
  dismissNotification: (id: string) => void;
  addNotification: (notification: Omit<AndroidNotification, 'id' | 'time'>) => void;
  clearAllNotifications: () => void;
  isNotificationShadeOpen: boolean;
  setNotificationShadeOpen: (open: boolean) => void;

  // Apps Management
  installedApps: InstalledApp[];
  installApk: (apk: ParsedApk) => Promise<InstalledApp>;
  uninstallApp: (appId: string) => void;
  launchApp: (appId: string) => void;
  closeApp: (appId: string) => void;
  inspectedApk: ParsedApk | null;
  setInspectedApk: (apk: ParsedApk | null) => void;

  // Android 10 Sideloading & Security
  allowUnknownSources: boolean;
  setAllowUnknownSources: (val: boolean) => void;
  pendingInstallApk: ParsedApk | null;
  setPendingInstallApk: (apk: ParsedApk | null) => void;
  sideloadApkPrompt: (apk: ParsedApk) => void;

  // ADB Shell execution
  executeAdbCommand: (cmd: string) => string;

  // Toasts & Haptics
  activeToast: string | null;
  showToast: (msg: string) => void;
  vibrateDevice: (ms?: number) => void;

  // Logcat
  logs: AndroidLogEntry[];
  addLog: (level: AndroidLogEntry['level'], tag: string, message: string) => void;
  clearLogs: () => void;

  // Loading state
  isInitializing: boolean;
}

const AndroidSystemContext = createContext<AndroidSystemContextType | undefined>(undefined);

export function AndroidSystemProvider({ children }: { children: ReactNode }) {
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [brightness, setBrightness] = useState(90);
  const [isDarkMode, setDarkMode] = useState(false);

  // Connectivity
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isCharging, setIsCharging] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Navigation
  const [navMode, setNavMode] = useState<NavMode>('buttons');
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [runningApps, setRunningApps] = useState<string[]>([]);
  const [isRecentsOpen, setIsRecentsOpen] = useState(false);
  const [isNotificationShadeOpen, setNotificationShadeOpen] = useState(false);

  // Android 10 Sideloading & Security
  const [allowUnknownSources, setAllowUnknownSources] = useState(true);
  const [pendingInstallApk, setPendingInstallApk] = useState<ParsedApk | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<AndroidNotification[]>([
    {
      id: 'notif_welcome',
      title: 'Android 10 (API 29) Ready',
      message: 'Google Pixel 4 virtual runtime running Android 10 (Quince Tart).',
      appName: 'System',
      time: 'Just now',
    },
  ]);

  // Toast
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Logcat
  const [logs, setLogs] = useState<AndroidLogEntry[]>([]);

  // Apps
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [inspectedApk, setInspectedApk] = useState<ParsedApk | null>(null);

  const addLog = useCallback((level: AndroidLogEntry['level'], tag: string, message: string) => {
    const entry: AndroidLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        '.' + (Date.now() % 1000).toString().padStart(3, '0'),
      level,
      tag,
      message,
      pid: 1482,
    };
    setLogs((prev) => [entry, ...prev.slice(0, 499)]);
  }, []);

  const showToast = useCallback((msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast((curr) => (curr === msg ? null : curr));
    }, 2800);
  }, []);

  const vibrateDevice = useCallback((ms: number = 40) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // ignore in iframe
      }
    }
  }, []);

  // Initialize pre-installed sample apps on boot
  useEffect(() => {
    async function initApps() {
      addLog('I', 'AndroidRuntime', 'Booting Android 10.0.0_r41 (Quince Tart - API 29)...');
      addLog('I', 'ActivityManager', 'Starting System Services: WindowManager, PackageManager, AudioService, BiometricService');

      try {
        // Load initial popular samples (Easter Egg, Flappy Droid, 2048, Calculator, Snake, Tester, Notes)
        const easterEgg = await generateSampleApk(SAMPLE_APKS[0]);
        const flappy = await generateSampleApk(SAMPLE_APKS[1]);
        const app2048 = await generateSampleApk(SAMPLE_APKS[2]);
        const calc = await generateSampleApk(SAMPLE_APKS[3]);
        const snake = await generateSampleApk(SAMPLE_APKS[4]);
        const tester = await generateSampleApk(SAMPLE_APKS[5]);
        const notes = await generateSampleApk(SAMPLE_APKS[6]);

        const apps: InstalledApp[] = [
          {
            id: easterEgg.id,
            packageName: easterEgg.manifest.packageName,
            name: easterEgg.manifest.appName,
            iconUrl: easterEgg.iconUrl,
            versionName: easterEgg.manifest.versionName,
            apk: easterEgg,
            installDate: Date.now() - 1000000,
          },
          {
            id: flappy.id,
            packageName: flappy.manifest.packageName,
            name: flappy.manifest.appName,
            iconUrl: flappy.iconUrl,
            versionName: flappy.manifest.versionName,
            apk: flappy,
            installDate: Date.now() - 3600000,
          },
          {
            id: app2048.id,
            packageName: app2048.manifest.packageName,
            name: app2048.manifest.appName,
            iconUrl: app2048.iconUrl,
            versionName: app2048.manifest.versionName,
            apk: app2048,
            installDate: Date.now() - 7200000,
          },
          {
            id: calc.id,
            packageName: calc.manifest.packageName,
            name: calc.manifest.appName,
            iconUrl: calc.iconUrl,
            versionName: calc.manifest.versionName,
            apk: calc,
            installDate: Date.now() - 10000000,
          },
          {
            id: snake.id,
            packageName: snake.manifest.packageName,
            name: snake.manifest.appName,
            iconUrl: snake.iconUrl,
            versionName: snake.manifest.versionName,
            apk: snake,
            installDate: Date.now() - 12000000,
          },
          {
            id: tester.id,
            packageName: tester.manifest.packageName,
            name: tester.manifest.appName,
            iconUrl: tester.iconUrl,
            versionName: tester.manifest.versionName,
            apk: tester,
            installDate: Date.now() - 14000000,
          },
          {
            id: notes.id,
            packageName: notes.manifest.packageName,
            name: notes.manifest.appName,
            iconUrl: notes.iconUrl,
            versionName: notes.manifest.versionName,
            apk: notes,
            installDate: Date.now() - 16000000,
          },
        ];

        setInstalledApps(apps);
        setInspectedApk(easterEgg); // Initial inspect Easter Egg
        addLog('I', 'PackageManager', `Loaded ${apps.length} pre-installed Android 10 packages.`);
      } catch (e) {
        console.error('Failed to initialize sample APKs:', e);
      } finally {
        setIsInitializing(false);
      }
    }

    initApps();
  }, [addLog]);

  const launchApp = useCallback((appId: string) => {
    const target = installedApps.find((a) => a.id === appId);
    if (!target) return;

    vibrateDevice(20);
    setIsRecentsOpen(false);
    setNotificationShadeOpen(false);
    setActiveAppId(appId);
    setRunningApps((prev) => {
      const filtered = prev.filter((id) => id !== appId);
      return [appId, ...filtered];
    });

    addLog('I', 'ActivityManager', `START u0 {act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] cmp=${target.packageName}/${target.apk.manifest.launcherActivity || '.MainActivity'}}`);
    setInspectedApk(target.apk);
  }, [installedApps, addLog, vibrateDevice]);

  const closeApp = useCallback((appId: string) => {
    setRunningApps((prev) => prev.filter((id) => id !== appId));
    if (activeAppId === appId) {
      setActiveAppId(null);
    }
    addLog('I', 'ActivityManager', `Force stopping ${appId} app process`);
  }, [activeAppId, addLog]);

  const installApk = useCallback(async (apk: ParsedApk): Promise<InstalledApp> => {
    addLog('I', 'PackageManager', `Verifying APK package: ${apk.manifest.packageName} (v${apk.manifest.versionName})`);
    
    // Check if already installed
    const existingIndex = installedApps.findIndex((a) => a.packageName === apk.manifest.packageName);
    const newApp: InstalledApp = {
      id: apk.id,
      packageName: apk.manifest.packageName,
      name: apk.manifest.appName,
      iconUrl: apk.iconUrl,
      versionName: apk.manifest.versionName,
      apk,
      installDate: Date.now(),
    };

    if (existingIndex >= 0) {
      setInstalledApps((prev) => {
        const next = [...prev];
        next[existingIndex] = newApp;
        return next;
      });
      addLog('I', 'PackageManager', `Updated package: ${apk.manifest.packageName}`);
      showToast(`Updated ${apk.manifest.appName}`);
    } else {
      setInstalledApps((prev) => [...prev, newApp]);
      addLog('I', 'PackageManager', `Successfully installed: ${apk.manifest.packageName}`);
      showToast(`Installed ${apk.manifest.appName}`);
    }

    setInspectedApk(apk);
    addNotification({
      title: 'Package Installed',
      message: `${apk.manifest.appName} is ready to run.`,
      appName: 'Package Installer',
      onAction: () => launchApp(newApp.id),
    });

    return newApp;
  }, [installedApps, addLog, showToast, launchApp]);

  const uninstallApp = useCallback((appId: string) => {
    const target = installedApps.find((a) => a.id === appId);
    if (!target) return;

    if (activeAppId === appId) {
      setActiveAppId(null);
    }
    setRunningApps((prev) => prev.filter((id) => id !== appId));
    setInstalledApps((prev) => prev.filter((a) => a.id !== appId));
    addLog('I', 'PackageManager', `Uninstalled package: ${target.packageName}`);
    showToast(`Uninstalled ${target.name}`);
  }, [installedApps, activeAppId, addLog, showToast]);

  const pressHome = useCallback(() => {
    vibrateDevice(20);
    setActiveAppId(null);
    setIsRecentsOpen(false);
    setNotificationShadeOpen(false);
    addLog('D', 'PhoneWindowManager', 'Home button pressed -> Launching com.google.android.apps.nexuslauncher');
  }, [vibrateDevice, addLog]);

  const pressBack = useCallback(() => {
    vibrateDevice(20);
    if (isNotificationShadeOpen) {
      setNotificationShadeOpen(false);
      return;
    }
    if (isRecentsOpen) {
      setIsRecentsOpen(false);
      return;
    }
    if (activeAppId) {
      setActiveAppId(null);
      addLog('D', 'InputDispatcher', 'Back key consumed by activity -> returning to launcher');
    }
  }, [isNotificationShadeOpen, isRecentsOpen, activeAppId, vibrateDevice, addLog]);

  const openRecents = useCallback(() => {
    vibrateDevice(25);
    setIsRecentsOpen(true);
    setNotificationShadeOpen(false);
    addLog('D', 'StatusBar', 'Recents button triggered -> Showing Overview Task Manager');
  }, [vibrateDevice, addLog]);

  const closeRecents = useCallback(() => {
    setIsRecentsOpen(false);
  }, []);

  const clearAllRecents = useCallback(() => {
    setRunningApps([]);
    setActiveAppId(null);
    setIsRecentsOpen(false);
    showToast('All apps cleared');
    addLog('I', 'ActivityManager', 'Cleared all background recent tasks');
  }, [showToast, addLog]);

  const adjustVolume = useCallback((delta: number) => {
    setVolume((v) => {
      const next = Math.max(0, Math.min(100, v + delta));
      return next;
    });
    setShowVolumeSlider(true);
    vibrateDevice(15);
    setTimeout(() => {
      setShowVolumeSlider(false);
    }, 2400);
  }, [vibrateDevice]);

  const togglePower = useCallback(() => {
    vibrateDevice(30);
    setIsPowerOn((p) => !p);
  }, [vibrateDevice]);

  const restartDevice = useCallback(() => {
    vibrateDevice(50);
    setIsPowerOn(false);
    setActiveAppId(null);
    setRunningApps([]);
    showToast('Restarting Android...');
    setTimeout(() => {
      setIsPowerOn(true);
      addLog('I', 'PowerManager', 'Reboot complete. Kernel 4.14.150-android-10-q up.');
    }, 1200);
  }, [vibrateDevice, showToast, addLog]);

  const sideloadApkPrompt = useCallback((apk: ParsedApk) => {
    vibrateDevice(25);
    setPendingInstallApk(apk);
    setInspectedApk(apk);
    addLog('I', 'PackageInstaller', `Staged ${apk.manifest.packageName} for Android 10 installation`);
  }, [vibrateDevice, addLog]);

  const executeAdbCommand = useCallback((rawCmd: string): string => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return '';

    let cmd = trimmed;
    if (cmd.startsWith('adb ')) {
      cmd = cmd.slice(4).trim();
    }

    addLog('D', 'adbd', `ADB command: ${rawCmd}`);

    if (cmd === 'devices' || cmd === 'adb devices') {
      return `List of devices attached\nemulator-5554\tdevice\t(Google Pixel 4 - Android 10 - API 29)\n`;
    }

    if (cmd === 'version') {
      return `Android Debug Bridge version 1.0.41\nVersion 29.0.6-5983831\nInstalled as /system/bin/adb\n`;
    }

    if (cmd === 'reboot') {
      restartDevice();
      return `Rebooting virtual Android 10 device...\n`;
    }

    if (cmd.startsWith('install')) {
      if (inspectedApk) {
        setPendingInstallApk(inspectedApk);
        return `Performing Streamed Install\nSuccess: Package ${inspectedApk.manifest.packageName} staged in PackageInstaller.\n`;
      }
      return `Performing Streamed Install\nFailure [INSTALL_FAILED_INVALID_APK: No APK loaded in inspector]\n`;
    }

    if (cmd.startsWith('uninstall')) {
      const parts = cmd.split(/\s+/);
      const pkg = parts[parts.length - 1];
      const target = installedApps.find((a) => a.packageName === pkg || a.id === pkg);
      if (target) {
        uninstallApp(target.id);
        return `Success: Uninstalled ${pkg}\n`;
      }
      return `Failure [DELETE_FAILED_INTERNAL_ERROR: package not found]\n`;
    }

    if (cmd === 'logcat' || cmd === 'shell logcat') {
      const recent = logs.slice(0, 15).map((l) => `${l.timestamp}  ${l.pid}  ${l.pid} ${l.level} ${l.tag.padEnd(16)}: ${l.message}`).join('\n');
      return `--------- beginning of main\n${recent}\n`;
    }

    if (cmd.startsWith('shell') || !cmd.includes(' ')) {
      const shellCmd = cmd.startsWith('shell ') ? cmd.slice(6).trim() : cmd;

      if (shellCmd === 'getprop ro.build.version.release' || shellCmd.includes('ro.build.version.release')) {
        return `10\n`;
      }
      if (shellCmd === 'getprop ro.build.version.sdk' || shellCmd.includes('ro.build.version.sdk')) {
        return `29\n`;
      }
      if (shellCmd === 'getprop ro.product.model' || shellCmd.includes('ro.product.model')) {
        return `Pixel 4\n`;
      }
      if (shellCmd === 'getprop ro.build.id' || shellCmd.includes('ro.build.id')) {
        return `QQ3A.200805.001\n`;
      }
      if (shellCmd.startsWith('getprop')) {
        return `[ro.build.version.release]: [10]\n[ro.build.version.sdk]: [29]\n[ro.product.model]: [Pixel 4]\n[ro.product.manufacturer]: [Google]\n[ro.build.id]: [QQ3A.200805.001]\n[ro.dalvik.vm.isa.arm64]: [arm64-v8a]\n`;
      }
      if (shellCmd === 'pm list packages' || shellCmd.startsWith('pm list packages')) {
        return installedApps.map((a) => `package:${a.packageName}`).join('\n') + '\n';
      }
      if (shellCmd.startsWith('am start')) {
        const match = shellCmd.match(/([a-zA-Z0-9_.]+)/g);
        if (match) {
          const app = installedApps.find((a) => match.includes(a.packageName));
          if (app) {
            launchApp(app.id);
            return `Starting: Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] cmp=${app.packageName}/.MainActivity }\n`;
          }
        }
        return `Starting: Intent { act=android.intent.action.MAIN cmp=${shellCmd} }\n`;
      }
      if (shellCmd === 'dumpsys battery') {
        return `Current Battery Service state:\n  AC powered: false\n  USB powered: ${isCharging}\n  status: ${isCharging ? 'Charging' : 'Discharging'}\n  health: Good\n  present: true\n  level: ${batteryLevel}\n  scale: 100\n  voltage: 4120mV\n  temperature: 284 (28.4 C)\n  technology: Li-ion\n`;
      }
      if (shellCmd === 'uname -a') {
        return `Linux localhost 4.14.150-android-10-q #1 SMP PREEMPT Thu Aug 6 00:15:00 UTC 2020 aarch64 Android\n`;
      }
      if (shellCmd === 'whoami' || shellCmd === 'id') {
        return `uid=2000(shell) gid=2000(shell) groups=2000(shell),1004(input),1007(log),1015(sdcard_rw),1028(sdcard_r),3003(inet) context=u:r:shell:s0\n`;
      }
      if (shellCmd === 'ls /sdcard' || shellCmd === 'ls /storage/emulated/0') {
        return `Android  DCIM  Download  Movies  Music  Pictures  Podcasts\n`;
      }
    }

    if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
      return `Android Debug Bridge (ADB) Command Reference:
  adb devices                         - List attached Android 10 emulator instances
  adb install <path/file.apk>         - Sideload and install an APK package
  adb uninstall <package_name>        - Uninstall an application package
  adb shell pm list packages          - List all installed Android packages
  adb shell am start -n <pkg>/<act>   - Launch activity
  adb shell getprop [prop]            - Query system build properties (release, sdk, model)
  adb shell dumpsys battery           - Query battery status
  adb shell whoami / uname -a         - System information
  adb logcat                          - Stream Android 10 Logcat buffer
  adb reboot                          - Restart the Android runtime
`;
    }

    return `adb: unknown command '${rawCmd}'. Type 'adb help' for available commands.\n`;
  }, [restartDevice, inspectedApk, installedApps, uninstallApp, logs, launchApp, isCharging, batteryLevel, addLog]);

  const addNotification = useCallback((n: Omit<AndroidNotification, 'id' | 'time'>) => {
    const item: AndroidNotification = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications((prev) => [item, ...prev]);
    vibrateDevice(30);
  }, [vibrateDevice]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleWifi = useCallback(() => setWifiEnabled((w) => !w), []);
  const toggleBluetooth = useCallback(() => setBluetoothEnabled((b) => !b), []);
  const toggleAirplaneMode = useCallback(() => setAirplaneMode((a) => !a), []);
  const toggleFlashlight = useCallback(() => setFlashlightOn((f) => !f), []);
  const toggleCharging = useCallback(() => setIsCharging((c) => !c), []);
  const clearLogs = useCallback(() => setLogs([]), []);

  return (
    <AndroidSystemContext.Provider
      value={{
        isPowerOn,
        togglePower,
        restartDevice,
        brightness,
        setBrightness,
        isDarkMode,
        setDarkMode,
        wifiEnabled,
        toggleWifi,
        bluetoothEnabled,
        toggleBluetooth,
        airplaneMode,
        toggleAirplaneMode,
        flashlightOn,
        toggleFlashlight,
        batteryLevel,
        setBatteryLevel,
        isCharging,
        toggleCharging,
        volume,
        setVolume,
        adjustVolume,
        showVolumeSlider,
        navMode,
        setNavMode,
        activeAppId,
        runningApps,
        isRecentsOpen,
        openRecents,
        closeRecents,
        clearAllRecents,
        pressBack,
        pressHome,
        notifications,
        dismissNotification,
        addNotification,
        clearAllNotifications,
        isNotificationShadeOpen,
        setNotificationShadeOpen,
        installedApps,
        installApk,
        uninstallApp,
        launchApp,
        closeApp,
        inspectedApk,
        setInspectedApk,
        allowUnknownSources,
        setAllowUnknownSources,
        pendingInstallApk,
        setPendingInstallApk,
        sideloadApkPrompt,
        executeAdbCommand,
        activeToast,
        showToast,
        vibrateDevice,
        logs,
        addLog,
        clearLogs,
        isInitializing,
      }}
    >
      {children}
    </AndroidSystemContext.Provider>
  );
}

export function useAndroidSystem() {
  const ctx = useContext(AndroidSystemContext);
  if (!ctx) throw new Error('useAndroidSystem must be used within AndroidSystemProvider');
  return ctx;
}
