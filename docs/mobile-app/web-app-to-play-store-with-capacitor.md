---
date: 2026-02-12
description: I had a working web application built with React and Ant Design. Getting it into the Play Store as a native Android app using Capacitor and automated GitOps turned out to be more straightforward than expected, with a few gotchas along the way...
---

# Web App to Play Store with Capacitor

I had a working web application - [TableCommander](/portfolio/#tablecommander), a real-time multiplayer web app for playing Magic: The Gathering. Next.js frontend, NestJS backend. The question was whether I could get it into the Play Store without rewriting everything. Capacitor made that possible, and GitHub Actions made it repeatable.

<!-- more -->

## Why Capacitor

The alternatives were React Native (partial rewrite), Flutter (complete rewrite), or a wrapper like Capacitor that runs your existing web app inside a native shell. Since the app already worked well in mobile browsers, Capacitor was the obvious choice.

Capacitor 8 ships your built web assets inside a native Android (or iOS) project. The web view runs your app, and Capacitor provides a bridge to native APIs - haptics, screen orientation, status bar control, keep-awake.

## The Companion App

Rather than wrapping the entire web application, I built a dedicated companion app. The idea is that players can interact with their game table from their phone - same React and Ant Design stack, but using Ant Design Mobile components optimised for touch interfaces. It shares API clients and types with the main frontend but has its own UI tailored for mobile.

```
/companion
  ├── capacitor.config.ts
  ├── src/          # React + Ant Design Mobile
  ├── android/      # Generated native project
  └── ios/          # Generated but not yet in CI
```

Capacitor generates the Android project once, and from then on you manage it like any native project. Gradle builds, signing configs, the works.

## Android Build Configuration

The Android side needs some attention beyond what Capacitor generates. Signing is the big one - you need a keystore for release builds, and you don't want that in your git repository.

I use a `keystore.properties` file (gitignored) that the Gradle build reads:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

For versioning, rather than manually bumping numbers, I derive them from the CI pipeline - `github.run_number` for the version code (Play Store needs this to be monotonically increasing) and `{package.json version}-{git short sha}` for the version name. Every build traces back to its exact commit.

## GitOps: Two Deployment Strategies

I ended up with two separate pipelines for two different purposes.

### APK Distribution for Testing

The first pipeline builds a debug APK and pushes it to Firebase App Distribution whenever native-layer files change - the Android project, Capacitor config, or package dependencies. Testers get notified and can install the latest build directly.

```yaml
# Triggers on native changes
paths:
  - 'companion/android/**'
  - 'companion/capacitor.config.ts'
  - 'companion/package.json'
```

The pipeline authenticates to GCP using Workload Identity Federation - no service account keys stored as secrets, just a trust relationship between GitHub and GCP. It builds the web assets, syncs them into the Android project with `npx cap sync`, then runs the Gradle build.

### OTA Updates for Web Changes

When only the web layer changes - components, pages, styles - there's no need to rebuild the entire native app. Instead, the second pipeline bundles the built web assets and deploys them to Firebase Hosting.

The app checks for updates on launch using the Capawesome Live Update plugin. If a new bundle is available, it downloads and applies it. Users get the update without going through the Play Store review cycle.

```yaml
# Triggers on web-only changes
paths:
  - 'companion/src/**'
  - 'companion/public/**'
  - 'companion/index.html'
```

In practice this means UI changes deploy in minutes via OTA, while native changes go through the full build pipeline.

## Getting Into the Play Store

The Play Store itself was less painful than expected. The one-time developer fee, some form filling, and a review process that took hours.

The main requirements:

- **Android App Bundle (AAB)** rather than APK - Google prefers these for Play Store distribution
- **Target SDK 36** - Google enforces minimum API levels
- **Privacy policy** - Required even for simple apps
- **Store listing assets** - Screenshots, descriptions, feature graphic

The build already produces an AAB for release, so the technical side was ready. The administrative side - store listing, content ratings, data safety declarations - took longer than the actual development.

## GCP Workload Identity Federation

Traditional CI/CD authentication to cloud providers uses long-lived service account keys stored as GitHub secrets. These don't expire by default and are a security risk if leaked.

Workload Identity Federation lets GitHub Actions authenticate directly with GCP instead. GitHub provides a short-lived OIDC token, GCP validates it against the configured provider, and grants temporary credentials. No keys to rotate, no secrets to leak.

Setup required creating a Workload Identity Pool and Provider in GCP, then granting the GitHub identity permission to impersonate the service account. More work upfront, but no credentials to worry about after that.

## Lessons Learned

The gap between a web app and a native Capacitor wrapper is smaller than I expected. Status bar integration, haptics, screen orientation lock - it adds up to something that feels proper.

Separating native builds from web-only OTA updates was the right call. Being able to push UI fixes without waiting for a Play Store review cycle makes a real difference to iteration speed.

Automating version codes from the pipeline run number saved me from the inevitable forgotten version bump. And Firebase App Distribution was worth setting up for the testing phase - beats sending APKs around manually.

## What's Next

iOS. The Capacitor project already has the iOS structure generated, but the CI/CD pipeline and the Apple Developer fee are still ahead. Apple's review process has a reputation for being stricter, so that'll be its own post.
