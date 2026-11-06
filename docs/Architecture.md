---
title: System Architecture & Web Audio Engineering
aliases:
  - Technical Spec
  - Engine Architecture
tags:
  - type/architecture
  - tech/web-audio
  - tech/canvas
  - status/evergreen
created: 2026-11-06
updated: 2026-11-06
---

# System Architecture & Technical Specifications

> [!IMPORTANT] Core Philosophy: Radical Simplicity (`/ponytail`)
> "The best code is the code you never wrote."
> The application uses modern standard web standards (HTML5, ES2024 Modules, CSS Custom Properties, Canvas 2D API, Web Audio API) with Vite as an ultra-fast zero-bloat bundler. Zero heavy runtime frameworks (no React, no Next.js overhead, no hydration cost).

## 1. Web Audio API Generative Synthesis Engines
Rather than streaming heavy MP3/WAV files that incur latency, bandwidth costs, and autoplay blocks, The Porni Group's platform synthesizes ambient generative audio and acoustic previews natively in real-time.

### A. Ambient Drone Synthesizer:
```
[ Dual Detuned Oscillators (55Hz / 110.5Hz) ] 
                     │
                     ▼
       [ Resonant Biquad Low-Pass Filter ] ◄─── [ 0.12Hz LFO Modulation ]
                     │
                     ▼
          [ Master Gain Ramp Node ]
                     │
                     ▼
             [ AudioDestination ]
```
- **Oscillator 1**: Sine wave tuned to 55 Hz (A1 sub-bass drone).
- **Oscillator 2**: Triangle wave tuned to 110.5 Hz (A2 + 0.5Hz chorusing detune for analog warmth).
- **Modulation**: A 0.12 Hz low-frequency oscillator modulates the cutoff frequency between 180 Hz and 460 Hz, creating an organic "breathing" sensation.
- **Race Condition Immunity**: Gain scheduling utilizes `cancelScheduledValues` with safe non-zero clamping before ramping, preventing AudioParam collision errors.

### B. Modal Interactive Acoustic Synthesizer:
- **Dual-Oscillator Engine**: Sawtooth lead paired with sub-octave sine reinforcement.
- **Dynamic Resonance Control**: Real-time slider controlling carrier frequencies from 110Hz to 880Hz.
- **Real-Time FFT Analyser**: 128-point FFT buffer feeding a 60 FPS oscilloscope visualizer rendered directly to canvas with cyan-to-magenta spectral coloring.

## 2. Interactive Canvas: Neural Constellation & Particle Wave
- Runs at a locked 60 FPS utilizing `requestAnimationFrame`.
- **HiDPI / Retina Optimization**: Automatically detects `devicePixelRatio` and scales internal canvas backing buffer, preserving crisp lines and particles on Apple Retina and 4K displays.
- **Viewport-Relative Mouse Physics**: Pointer coordinates are calculated relative to `canvas.getBoundingClientRect()`, ensuring accurate mouse repulsion even during page scrolling.
- Dynamic synaptic threshold:
  $$\text{dist} = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$$
- When $\text{dist} < 140\text{px}$, draws a cyan synaptic connection with dynamic opacity proportional to proximity.

## 3. Dedicated Commission Feedback Modal
- Complete separation of concerns: Avoids mutating portfolio lightbox DOM.
- Displays full work order telemetry: Ticket ID, Client Handle, Mediums, Budget Tier, Timeline, Timestamp, and C2PA SHA-256 Provenance Signature.
- Features one-click clipboard extraction with zero-dependency execCommand fallback for unrestricted browser environments.

## 4. GitHub Pages & Zero-Friction Hosting
To ensure complete portability on GitHub Pages and offline viewing:
1. `vite.config.js`: `base: './'` for all asset links.
2. Root `index.html` referencing `./src/main.js` and `./src/style.css`.
3. `.nojekyll` committed to prevent GitHub Pages from bypassing dotfiles or asset bundles.
4. GitHub Actions CI/CD workflow in `.github/workflows/deploy.yml` with automatic artifact upload and deployment.
5. **Standalone Single-File Fallback (`standalone.html`)**: Automatically inlines all CSS and JS bundles so users can double-click and inspect the entire site offline without running an HTTP server.

> [!TIP] Performance Metrics
> - First Contentful Paint (FCP): < 0.4s
> - Time to Interactive (TTI): Instantaneous
> - Zero external runtime dependencies outside build tooling.
