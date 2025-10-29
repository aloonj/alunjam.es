# Installing LineageOS on Lenovo Tab P11 (TB-J606F)

This guide walks through installing LineageOS 20.0 (Android 13) GSI on the Lenovo Tab P11 using Andy Yan's builds. This gives you a clean, bloat-free Android experience without Lenovo's customizations.

## Requirements

- Lenovo Tab P11 (TB-J606F) with unlocked bootloader
- Linux PC (this guide uses Ubuntu/Debian)
- USB cable
- LineageOS GSI image (arm64_bvN variant)
- vbmeta.img to disable verified boot
- 30+ minutes of time

**Warning: This will wipe all data on your tablet. Back up important files first.**

## Preparation

**Install Required Tools:**

```bash
sudo apt install android-tools-adb android-tools-fastboot
```

**Download Required Files:**

1. **LineageOS GSI** - Download from Andy Yan's SourceForge:
   ```bash
   cd ~/Downloads
   wget https://deac-fra.dl.sourceforge.net/project/andyyan-gsi/lineage-20-td/lineage-20.0-20251021-UNOFFICIAL-arm64_bvN.img.gz
   gunzip lineage-20.0-20251021-UNOFFICIAL-arm64_bvN.img.gz
   ```

   **Note:** The file is gzipped (.gz), so you need to extract it first.

   arm64_bvN means: A/B partitions, Vanilla (no Google Apps), No root

   Browse all versions at: [Andy Yan's SourceForge](https://sourceforge.net/projects/andyyan-gsi/files/lineage-20-td/)

2. **vbmeta.img** - Download Google's official empty vbmeta image:
   ```bash
   wget https://dl.google.com/developers/android/qt/images/gsi/vbmeta.img
   ```

   This is an official empty vbmeta.img from Google's GSI images, specifically designed to disable verified boot.

## Installation Steps

**1. Boot into Fastboot Mode**

Power off the tablet, then:

- Hold **Power + Volume Down** together
- Release when you see "FASTBOOT MODE"

Connect the USB cable and verify detection:

```bash
sudo fastboot devices
```

You should see your device serial number.

**2. Disable Verified Boot**

Flash the vbmeta image to both slots to disable Android's verified boot:

```bash
sudo fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img
sudo fastboot --disable-verity --disable-verification flash vbmeta_system vbmeta.img
```

**3. Wipe Data**

Factory reset the device:

```bash
sudo fastboot -w
```

This formats userdata and erases metadata partitions.

**4. Enter Fastbootd Mode**

Modern Android devices with dynamic partitions require fastbootd (userspace fastboot):

```bash
sudo fastboot reboot fastboot
```

Wait 20-30 seconds for the tablet to reboot into fastbootd mode. The screen may show "Fastboot" text.

Verify connection:

```bash
sudo fastboot devices
```

**5. Flash LineageOS System Image**

Flash the LineageOS GSI to the system partition:

```bash
sudo fastboot flash system lineage-20.0-20251021-UNOFFICIAL-arm64_bvN.img
```

This takes 1-2 minutes. You'll see multiple sparse image chunks being flashed.

**6. First Boot**

Reboot the tablet:

```bash
sudo fastboot reboot
```

**First boot takes 2-5 minutes.** The tablet will:

1. Show Lenovo logo briefly
2. Display LineageOS boot animation
3. Eventually reach the LineageOS setup wizard

If the tablet boots to Android Recovery with an error about corrupt system:
- Select **"Factory data reset"**
- Then select **"Reboot system now"**

This clears incompatible cached data and LineageOS will boot properly.

## Post-Installation

**What Works:**

- All hardware functions (WiFi, Bluetooth, cameras, sensors)
- Audio and video playback
- Battery life
- Display and touchscreen

**Optional: Install Google Apps**

LineageOS doesn't include Google services by default. To add them:

1. Download MindTheGapps for Android 13 arm64
2. Boot to fastboot mode
3. Flash: `sudo fastboot flash system system.img` (where system.img is MindTheGapps)

Alternatively, use microG for a privacy-focused open-source alternative.

## Troubleshooting

**Boot Loop After Flashing:**

If tablet continuously reboots to recovery:
- Boot to Android Recovery
- Select "Factory data reset"
- Reboot system

**Stuck at Lenovo Logo:**

If stuck at Lenovo logo for more than 10 minutes:
- Hold power button to force restart
- Boot to fastboot (Power + Volume Down)
- Repeat installation from step 5

**WiFi or Bluetooth Not Working:**

- Ensure you flashed the correct arm64_bvN variant (not arm64_bgN)
- Stock boot.img must remain from original firmware
- Don't mix firmware versions

**Need to Revert to Stock:**

See the [Stock Recovery Guide](lenovo-tab-p11-stock-recovery.md) to restore factory firmware.

## Why GSI Instead of Device-Specific ROM?

GSI (Generic System Image) builds work across many devices without device-specific builds. Benefits:

- Regular updates from Andy Yan's builds
- Clean Android experience
- Works with stock kernel/drivers
- No need for device-specific development

## References

- [Andy Yan's GSI Builds](https://sourceforge.net/projects/andyyan-gsi/)
- [XDA TB-J606F Forum](https://xdaforums.com/f/lenovo-tab-p11.12323/)
- [LineageOS Official Site](https://lineageos.org/)
