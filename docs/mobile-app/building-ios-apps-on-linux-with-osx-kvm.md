---
date: 2026-02-13
description: No Mac? No problem. Using QEMU/KVM and OSX-KVM to run macOS Sonoma in a virtual machine on Linux, then building a Capacitor iOS app entirely over SSH. Here's how it went...
---

# Building iOS Apps on Linux with OSX-KVM

In my [previous post](web-app-to-play-store-with-capacitor.md) I mentioned iOS was next. The catch: iOS development requires Xcode, and Xcode requires macOS. I don't own a Mac. What I do have is a Linux box with KVM, and it turns out that's enough.

<!-- more -->

!!! warning "Disclaimer"
    Running macOS on non-Apple hardware is a grey area under Apple's EULA. This is documented for educational purposes. Use at your own risk.

## The Setup

The project is [OSX-KVM](https://github.com/kholia/OSX-KVM) - a well-maintained set of scripts for running macOS in QEMU/KVM. It handles the OpenCore bootloader, OVMF firmware, and QEMU configuration. The host machine needs an Intel or AMD CPU with virtualisation extensions (VT-x/AMD-V).

### Prerequisites

- QEMU and KVM installed (`qemu-system-x86_64`, `/dev/kvm` accessible)
- 16GB+ RAM to spare for the VM
- ~80GB disk space (macOS + Xcode)
- Patience

![macOS Sonoma installer running inside QEMU on Linux](../assets/img/osx-kvm-sonoma-setup.png)

### Getting macOS

```bash
git clone https://github.com/kholia/OSX-KVM.git
cd OSX-KVM
./fetch-macOS-v2.py
```

The script presents a list of macOS versions. Pick **Sonoma (14)** - it supports Xcode 16, which is what you need for current iOS SDK builds. Avoid Tahoe/Sequoia unless you enjoy debugging VM issues.

```bash
dmg2img BaseSystem.dmg BaseSystem.img
qemu-img create -f qcow2 mac_hdd_ng.img 128G
```

### VM Configuration

The default `OpenCore-Boot.sh` works but needs tuning. The key changes I made:

```bash
ALLOCATED_RAM="16384"  # 16GB - Xcode is hungry
CPU_SOCKETS="1"
CPU_CORES="4"
CPU_THREADS="8"
```

For the CPU model, Sonoma works with `Skylake-Client`. If your CPU doesn't support certain features, QEMU will warn you but it still boots fine:

```
qemu-system-x86_64: warning: host doesn't support requested feature: CPUID.pcid
qemu-system-x86_64: warning: host doesn't support requested feature: CPUID.rdseed
```

These are harmless warnings, not errors.

The boot script already includes SSH port forwarding (`hostfwd=tcp::2222-:22`), which becomes important later.

### Apple ID Issues

The default OpenCore image ships with serial numbers shared by thousands of users. Apple's servers know this, so you'll likely hit "this Mac has been used to create too many Apple IDs" during setup.

Fix: generate unique serials with [GenSMBIOS](https://github.com/corpnewt/GenSMBIOS), then update the `config.plist` inside `OpenCore.qcow2`. Use model `iMacPro1,1` for best VM compatibility.

Or just skip the Apple ID entirely during macOS setup - click "Set Up Later". You don't need an Apple ID on the Mac itself.

### OpenCore Debug Text

If you see flickering EFI debug text in the top-left corner of the desktop, that's OpenCore's verbose logging. It's cosmetic. Rebooting usually clears it, or you can set `Target` to `0` under `Misc > Debug` in the OpenCore `config.plist`.

![macOS Sonoma desktop running in QEMU](../assets/img/osx-kvm-sonoma-desktop.png)

## SSH: Skip the GUI

The macOS GUI through QEMU is usable but laggy. The real workflow is SSH. Enable it in the VM:

```bash
sudo systemsetup -setremotelogin on
```

Then from your Linux host:

```bash
ssh user@localhost -p 2222
```

From here on, everything happens over SSH. No more interacting with the sluggish VM window.

## Installing Xcode

You don't need an Apple ID on the Mac to get Xcode. Download it from https://developer.apple.com/download/all/ in your Linux browser (you'll need a free Apple ID to sign into the web portal), then transfer it over:

```bash
scp -P 2222 ~/Downloads/Xcode_16.4.xip user@localhost:~/
```

On the Mac VM:

```bash
xip -x ~/Xcode_16.4.xip
sudo mv Xcode.app /Applications/
sudo xcode-select -s /Applications/Xcode.app
xcodebuild -license accept
sudo xcodebuild -runFirstLaunch
```

You'll also need Node.js for Capacitor:

```bash
curl -o node.pkg "https://nodejs.org/dist/v22.14.0/node-v22.14.0.pkg"
sudo installer -pkg node.pkg -target /
```

## Building the iOS App

With Xcode and Node installed, the actual Capacitor build is straightforward. Clone your project, install dependencies, build the web assets, sync, and build:

```bash
git clone git@github.com:your/repo.git
cd repo/companion
npm install
npm run build
npx cap sync ios
cd ios/App
xcodebuild -project App.xcodeproj -scheme App \
  -destination "generic/platform=iOS" \
  -configuration Debug CODE_SIGNING_ALLOWED=NO
```

`CODE_SIGNING_ALLOWED=NO` lets you verify the build compiles without needing signing certificates. You'll add those when you're ready to submit to the App Store.

The iOS Simulator won't work in a VM (no nested virtualisation for the ARM simulator), so you build for device with `-destination "generic/platform=iOS"`.

![Building an iOS app on Linux - macOS Sonoma running in QEMU with the xcodebuild output in a Linux terminal](../assets/img/osx-kvm-ios-build.png)

## The Workflow

The day-to-day workflow is:

1. Write code on Linux in your normal editor
2. Push to git
3. SSH into the macOS VM
4. `git pull && npm run build && npx cap sync ios`
5. `xcodebuild` from the CLI

The Mac VM is just a build machine. All development happens on Linux.

## What You Don't Need

- **A physical Mac** - KVM handles it
- **An Apple ID on the Mac** - download Xcode from the web, manage your developer account in a browser
- **The Xcode GUI** - CLI builds work fine over SSH
- **The iOS Simulator** - build for device, test with TestFlight or a physical iPhone

## What You Do Need (for App Store)

- **Apple Developer Account** ($99/year) - sign up at developer.apple.com from any browser
- **Signing certificates** - generate in the Apple Developer web portal, import into the VM's keychain
- **A way to upload** - `xcrun altool` or Transporter CLI handles App Store submission

## Was It Worth It

For my use case - building a Capacitor wrapper around an existing web app - this works well. The iOS build is a compile-and-package step, not a development environment. I'm not debugging UIKit layouts or writing Swift all day. I push web code, SSH in, build, and ship.

If you're doing heavy native iOS development, a real Mac (or a cloud Mac service like Codemagic) would be a better experience. But for Capacitor, React Native, or Flutter apps where the Mac is just a build tool, a KVM VM does the job.

```
** BUILD SUCCEEDED **
```
