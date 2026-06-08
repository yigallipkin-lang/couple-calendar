# Install Node.js — Step by Step

Node.js is required to run the development servers and Firebase CLI. Here's how to install it on Windows.

---

## Step 1: Download Node.js

1. **Open your browser and go to:**
   ```
   https://nodejs.org/
   ```

2. **You'll see two options:**
   - **LTS** (Long Term Support) — Recommended ✅
   - **Current** (Latest features, less stable)

3. **Click the LTS button** (left side, usually showing a version like "20.x" or "18.x")
   - A `.exe` file will download
   - File name will be something like: `node-v20.10.0-x64.msi`

4. **Wait for the download to complete**

---

## Step 2: Run the Installer

1. **Open your Downloads folder**
   - Press `Win + E` to open File Explorer
   - Click "Downloads" in the sidebar

2. **Find the Node.js installer** (node-v*.msi file)

3. **Double-click the installer**
   - It will ask "Do you want to allow this app to make changes?"
   - Click **"Yes"**

---

## Step 3: Install Node.js

The installer window will open. Follow these steps:

### Screen 1: Welcome
- Click **"Next >"**

### Screen 2: License
- Read the license (or skip)
- Click **"Next >"**

### Screen 3: Installation Path
- Keep the default path (usually `C:\Program Files\nodejs`)
- Click **"Next >"**

### Screen 4: Custom Setup
- You'll see checkboxes for:
  - ✅ **Node.js runtime** (keep checked)
  - ✅ **npm package manager** (keep checked)
  - ✅ **Add to PATH** (keep checked — important!)
  - ✅ **Python** (keep checked)
  - ✅ **Visual Studio Build Tools** (keep checked for native modules)

- **Do NOT uncheck anything** — keep all boxes checked
- Click **"Next >"**

### Screen 5: Ready to Install
- You'll see a summary of what will be installed
- Click **"Install"**

⏳ **Wait 2-5 minutes** for installation to complete

### Screen 6: Finish
- Click **"Finish"**

---

## Step 4: Restart Your Computer

⚠️ **IMPORTANT:** Restart your computer so the PATH changes take effect.

1. Click the Windows Start menu
2. Click the power icon (🔴)
3. Click **"Restart"**
4. Wait for your computer to restart

---

## Step 5: Verify Installation

Once your computer restarts:

1. **Open Command Prompt (CMD):**
   - Press `Win + R`
   - Type `cmd`
   - Press Enter

2. **Type this command:**
   ```
   node --version
   ```
   - Press Enter
   - You should see something like: `v20.10.0`

3. **Type this command:**
   ```
   npm --version
   ```
   - Press Enter
   - You should see something like: `10.2.3`

If both commands show version numbers, **Node.js is installed successfully!** ✅

---

## ❌ If It Doesn't Work

### "node: command not found" or "npm: command not found"
This usually means the PATH wasn't updated. Try:

1. Restart your computer again (if you haven't already)
2. Open a fresh Command Prompt window (not the old one)
3. Try the commands again

### Still not working?
1. Uninstall Node.js:
   - Settings → Apps → Apps & features
   - Find "Node.js"
   - Click it → Uninstall
2. Restart computer
3. Download and install Node.js again from https://nodejs.org/
4. Make sure to check "Add to PATH" during installation

---

## ✅ Next Steps After Installation

Once Node.js is installed and verified:

1. Tell me "Node.js is installed"
2. I'll deploy the Firebase rules
3. We'll test the setup
4. We can start building the authentication flows!

---

## What Just Happened?

You installed:
- **Node.js**: JavaScript runtime (runs JavaScript outside the browser)
- **npm**: Node Package Manager (installs code libraries)
- **Python**: Needed for building native modules
- **Visual Studio Build Tools**: Needed for compiling C++ modules

These are all necessary for:
- Running the development servers
- Installing project dependencies
- Deploying Firebase Cloud Functions
- Building for iOS/Android

---

## Need Help?

If you get stuck:
1. Check Node.js is in your PATH: Open CMD and type `node --version`
2. Restart your computer (it fixes 90% of issues!)
3. Try installing again from scratch

Let me know once you've completed the installation! 🚀
