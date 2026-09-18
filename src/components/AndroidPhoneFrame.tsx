import React, { useState, useEffect } from 'react';
import { useAndroidSystem } from '../runtime/AndroidSystemContext';
import { AndroidHomeScreen } from './AndroidHomeScreen';
import { AppRunnerContainer } from './AppRunnerContainer';
import { RecentAppsView } from './RecentAppsView';
import { Android10PackageInstallerModal } from './Android10PackageInstallerModal';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Volume2,
  VolumeX,
  Sliders,
  Sun,
  Moon,
  Plane,
  Bluetooth,
  Flashlight,
  Bell,
  X,
  ChevronDown,
  RotateCw,
} from 'lucide-react';

export function AndroidPhoneFrame() {
  const {
    isPowerOn,
    togglePower,
    brightness,
    setBrightness,
    batteryLevel,
    isCharging,
    toggleCharging,
    wifiEnabled,
    toggleWifi,
    bluetoothEnabled,
    toggleBluetooth,
    airplaneMode,
    toggleAirplaneMode,
    flashlightOn,
    toggleFlashlight,
    isDarkMode,
    volume,
    adjustVolume,
    showVolumeSlider,
    navMode,
    pressBack,
    pressHome,
    openRecents,
    isRecentsOpen,
    activeAppId,
    launchApp,
    activeToast,
    notifications,
    dismissNotification,
    clearAllNotifications,
    isNotificationShadeOpen,
    setNotificationShadeOpen,
    pendingInstallApk,
    setPendingInstallApk,
  } = useAndroidSystem();

  const [timeString, setTimeString] = useState('');

  // Clock in status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).replace(/\s?[AP]M/, '')
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="android_virtual_phone" className="relative flex items-center justify-center p-2 select-none">
      {/* Physical Hardware Buttons on Bezel Outer Rim */}
      <div className="relative flex items-center justify-center">
        {/* Left Side: Volume Up / Down */}
        <div className="absolute -left-2.5 top-28 flex flex-col gap-3 z-0">
          <button
            id="hw_btn_vol_up"
            onClick={() => adjustVolume(10)}
            title="Hardware Volume Up"
            className="w-2.5 h-12 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-l-md shadow-md transition-all active:translate-x-0.5"
          />
          <button
            id="hw_btn_vol_down"
            onClick={() => adjustVolume(-10)}
            title="Hardware Volume Down"
            className="w-2.5 h-12 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-l-md shadow-md transition-all active:translate-x-0.5"
          />
        </div>

        {/* Right Side: Power Button */}
        <div className="absolute -right-2.5 top-24 z-0">
          <button
            id="hw_btn_power"
            onClick={togglePower}
            title={isPowerOn ? 'Power Off / Sleep' : 'Wake / Power On'}
            className="w-2.5 h-14 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-r-md shadow-md transition-all active:-translate-x-0.5"
          />
        </div>

        {/* Outer Phone Chassis */}
        <div className="relative w-[360px] h-[720px] bg-slate-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1),0_0_0_8px_#1e293b] border-2 border-slate-700/60 overflow-hidden flex flex-col">
          
          {/* Flashlight Indicator on rear chassis simulation */}
          {flashlightOn && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-amber-300 shadow-[0_0_20px_10px_rgba(252,211,77,0.8)] rounded-full z-50 pointer-events-none" />
          )}

          {/* Screen Bezel / Display Container */}
          <div
            className="relative flex-1 w-full rounded-[38px] overflow-hidden flex flex-col bg-black transition-all"
            style={{
              filter: isPowerOn ? `brightness(${brightness}%)` : 'none',
            }}
          >
            {isPowerOn ? (
              <>
                {/* Android Status Bar */}
                <div
                  id="android_status_bar"
                  onClick={() => setNotificationShadeOpen(!isNotificationShadeOpen)}
                  className="relative z-40 w-full h-8 px-5 flex items-center justify-between text-white text-[11px] font-semibold bg-transparent cursor-pointer hover:bg-white/5 transition"
                >
                  {/* Left: Clock */}
                  <span className="font-mono tracking-tight">{timeString}</span>

                  {/* Center: Camera Punch Hole */}
                  <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center pointer-events-none shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-emerald-950/40" />
                  </div>

                  {/* Right: Icons (Wifi, Battery, etc.) */}
                  <div className="flex items-center gap-1.5">
                    {airplaneMode ? (
                      <Plane size={11} className="text-amber-400" />
                    ) : (
                      <>
                        <span className="text-[10px] font-mono tracking-tighter">5G</span>
                        {wifiEnabled ? <Wifi size={11} /> : <WifiOff size={11} className="text-slate-500" />}
                      </>
                    )}
                    {bluetoothEnabled && <Bluetooth size={10} className="text-blue-400" />}
                    
                    {/* Battery indicator */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCharging();
                      }}
                      title="Click to toggle USB charging"
                      className="flex items-center gap-0.5 cursor-pointer ml-0.5"
                    >
                      <span className="text-[10px] font-mono">{batteryLevel}%</span>
                      {isCharging ? (
                        <BatteryCharging size={13} className="text-emerald-400" />
                      ) : (
                        <Battery size={13} className={batteryLevel <= 20 ? 'text-rose-400' : 'text-white'} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Screen Body */}
                <div className="relative flex-1 w-full overflow-hidden">
                  {/* Active Screen View */}
                  {activeAppId ? <AppRunnerContainer /> : <AndroidHomeScreen />}

                  {/* Android 10 Package Installer Modal */}
                  {pendingInstallApk && (
                    <Android10PackageInstallerModal
                      apk={pendingInstallApk}
                      onCancel={() => setPendingInstallApk(null)}
                      onInstalled={(appId) => {
                        setPendingInstallApk(null);
                        launchApp(appId);
                      }}
                    />
                  )}

                  {/* Multitasking Recents Overview Overlay */}
                  {isRecentsOpen && <RecentAppsView />}

                  {/* Volume Slider HUD Overlay */}
                  {showVolumeSlider && (
                    <div className="absolute top-24 right-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col items-center gap-2 z-50 animate-in fade-in slide-in-from-right-2 duration-150">
                      <Volume2 size={16} className="text-slate-300" />
                      <div className="w-3 h-24 bg-slate-700 rounded-full relative overflow-hidden">
                        <div
                          className="w-full bg-emerald-500 absolute bottom-0 transition-all rounded-full"
                          style={{ height: `${volume}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-300">{volume}%</span>
                    </div>
                  )}

                  {/* Android Floating Toast Notification */}
                  {activeToast && (
                    <div className="absolute bottom-16 left-4 right-4 flex justify-center z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
                      <div className="bg-slate-900/95 text-slate-100 text-xs px-4 py-2 rounded-full shadow-2xl border border-slate-700/80 max-w-[260px] text-center font-medium backdrop-blur-md">
                        {activeToast}
                      </div>
                    </div>
                  )}

                  {/* Quick Settings & Notification Drawer */}
                  {isNotificationShadeOpen && (
                    <div
                      id="notification_shade"
                      className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col p-4 text-white animate-in slide-in-from-top duration-200"
                    >
                      {/* Top bar */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                          Quick Settings
                        </span>
                        <button
                          onClick={() => setNotificationShadeOpen(false)}
                          className="p-1 rounded-full text-slate-400 hover:text-white"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>

                      {/* Quick Setting Tiles Grid */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <button
                          onClick={toggleWifi}
                          className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition ${
                            wifiEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Wifi size={17} />
                          <span className="text-[10px] font-medium">Internet</span>
                        </button>
                        <button
                          onClick={toggleBluetooth}
                          className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition ${
                            bluetoothEnabled ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Bluetooth size={17} />
                          <span className="text-[10px] font-medium">Bluetooth</span>
                        </button>
                        <button
                          onClick={toggleAirplaneMode}
                          className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition ${
                            airplaneMode ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Plane size={17} />
                          <span className="text-[10px] font-medium">Airplane</span>
                        </button>
                        <button
                          onClick={toggleFlashlight}
                          className={`p-2.5 rounded-2xl flex flex-col items-center gap-1.5 transition ${
                            flashlightOn ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Flashlight size={17} />
                          <span className="text-[10px] font-medium">Torch</span>
                        </button>
                      </div>

                      {/* Brightness Slider */}
                      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center gap-3 mb-4">
                        <Sun size={15} className="text-slate-400" />
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={brightness}
                          onChange={(e) => setBrightness(parseInt(e.target.value))}
                          className="flex-1 accent-emerald-500"
                        />
                        <span className="text-xs font-mono text-slate-300 w-8 text-right">{brightness}%</span>
                      </div>

                      {/* Notifications List */}
                      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                          <span className="text-xs font-semibold text-slate-400">Notifications</span>
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-[11px] text-emerald-400 hover:underline"
                            >
                              Clear all
                            </button>
                          )}
                        </div>

                        {notifications.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                            <Bell size={24} className="opacity-30 mb-2" />
                            <span>No new notifications</span>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={n.onAction}
                              className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex items-start justify-between gap-2 cursor-pointer hover:border-slate-700 transition"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                                  <span className="font-semibold text-slate-300">{n.appName}</span>
                                  <span>•</span>
                                  <span>{n.time}</span>
                                </div>
                                <h5 className="font-bold text-xs text-white truncate">{n.title}</h5>
                                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{n.message}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(n.id);
                                }}
                                className="text-slate-500 hover:text-slate-300 p-1"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Android Navigation Bar */}
                <div
                  id="android_nav_bar"
                  className="relative z-40 w-full h-10 px-8 flex items-center justify-around bg-slate-950/90 border-t border-white/5 text-slate-400"
                >
                  {navMode === 'buttons' ? (
                    <>
                      {/* Back Button (Triangle) */}
                      <button
                        id="nav_back_btn"
                        onClick={pressBack}
                        title="Back"
                        className="w-10 h-8 flex items-center justify-center hover:text-white active:scale-90 transition"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <polygon points="19,4 7,12 19,20" />
                        </svg>
                      </button>

                      {/* Home Button (Circle) */}
                      <button
                        id="nav_home_btn"
                        onClick={pressHome}
                        title="Home"
                        className="w-10 h-8 flex items-center justify-center hover:text-white active:scale-90 transition"
                      >
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
                      </button>

                      {/* Recents Button (Square) */}
                      <button
                        id="nav_recents_btn"
                        onClick={openRecents}
                        title="Overview / Recents"
                        className="w-10 h-8 flex items-center justify-center hover:text-white active:scale-90 transition"
                      >
                        <div className="w-3.5 h-3.5 rounded-xs border-2 border-current" />
                      </button>
                    </>
                  ) : (
                    /* Gesture Navigation Pill */
                    <div
                      id="nav_gesture_bar"
                      onClick={pressHome}
                      className="w-28 h-1 bg-slate-400 hover:bg-white rounded-full cursor-pointer transition active:scale-95"
                    />
                  )}
                </div>
              </>
            ) : (
              /* Screen Powered Off View */
              <div
                onClick={togglePower}
                className="w-full h-full bg-black flex flex-col items-center justify-center text-slate-600 p-6 text-center cursor-pointer select-none"
              >
                <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center mb-3 text-slate-700">
                  <span className="text-xl font-bold">●</span>
                </div>
                <span className="text-xs font-medium text-slate-500">Screen Off</span>
                <p className="text-[11px] text-slate-600 mt-1">Tap screen or power button to wake up</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
