# Android 10 (API 29) APK Runner

A high-fidelity browser-based Android 10 (API 29) virtual phone simulation featuring authentic APK sideloading, the official Android 10 Package Installer flow, Scoped Storage sandboxing, Dalvik/ART virtual execution, system settings, interactive ADB terminal, and the official Android 10 Easter Egg puzzle.

---

## 🚀 Automatic Deployment on GitHub Pages

This repository is configured to automatically build and deploy to **GitHub Pages** on every push to the `main` or `master` branch via GitHub Actions (`.github/workflows/deploy.yml`).

### How to Enable GitHub Pages:
1. Push this repository to GitHub (or export via Google AI Studio's **Export to GitHub** menu).
2. On your GitHub repository page, go to **Settings** → **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Any push to `main` or `master` will now automatically build and deploy your applet to `https://<your-username>.github.io/<repo-name>/`.
5. You can also manually trigger a deployment from the **Actions** tab by selecting **Deploy to GitHub Pages** → **Run workflow**.

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
Outputs static assets into the `dist/` folder with relative path resolution (`base: './'`), making it compatible with any subpath hosting including GitHub Pages.

---

## 📱 Features Included
- **Android 10 Runtime**: Simulates a Google Pixel 4 running Android 10 (API Level 29).
- **Package Sideloading**: Upload `.apk` or `.zip` files directly from your desktop.
- **Android 10 Package Installer**: Authentic permission dialogs, unknown source toggles, and install animation.
- **Interactive ADB Terminal**: Run `adb devices`, `adb install`, `adb shell pm list packages`, `adb shell dumpsys battery`, etc.
- **Android 10 Easter Egg**: Interactive Q puzzle game.
