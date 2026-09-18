import React from 'react';
import { useAndroidSystem } from '../runtime/AndroidSystemContext';
import { FlappyDroidApp } from './builtin-apps/FlappyDroidApp';
import { App2048 } from './builtin-apps/App2048';
import { MaterialCalculatorApp } from './builtin-apps/MaterialCalculatorApp';
import { RetroSnakeApp } from './builtin-apps/RetroSnakeApp';
import { HardwareTesterApp } from './builtin-apps/HardwareTesterApp';
import { QuickNotesApp } from './builtin-apps/QuickNotesApp';
import { Android10EasterEggApp } from './builtin-apps/Android10EasterEggApp';
import { GenericApkRunner } from './builtin-apps/GenericApkRunner';
import { SystemSettingsApp } from './SystemSettingsApp';

export function AppRunnerContainer() {
  const { activeAppId, installedApps } = useAndroidSystem();

  if (!activeAppId) return null;

  if (activeAppId === 'system_settings') {
    return <SystemSettingsApp />;
  }

  if (activeAppId === 'android10_easteregg') {
    return <Android10EasterEggApp />;
  }

  const currentApp = installedApps.find((a) => a.id === activeAppId);
  if (!currentApp) return null;

  const sampleType = currentApp.apk.sampleType;

  switch (sampleType) {
    case 'easteregg':
      return <Android10EasterEggApp />;
    case 'flappy':
      return <FlappyDroidApp />;
    case '2048':
      return <App2048 />;
    case 'calculator':
      return <MaterialCalculatorApp />;
    case 'snake':
      return <RetroSnakeApp />;
    case 'tester':
      return <HardwareTesterApp />;
    case 'notes':
      return <QuickNotesApp />;
    default:
      return <GenericApkRunner apk={currentApp.apk} />;
  }
}
