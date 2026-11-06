---
title: System Architecture & Deformable Physics Engineering
aliases:
  - Technical Spec
  - Engine Architecture
  - Physics & Neural Spec
tags:
  - type/architecture
  - tech/physics-simulation
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

## 1. Deformable Soft-Body & Spring-Lattice Physics Engine
To scientifically validate our core proposition ("Boob Physics"), the platform incorporates an in-browser, real-time 60 FPS deformable soft-body physics engine.

### A. Mathematical Formulation
The soft-body structure is modeled as a discretized non-linear mass-spring-damper network governed by Hooke's Law coupled with viscous drag and hydrostatic pressure:

$$F_{\text{spring}} = -k (\|\mathbf{p}_i - \mathbf{p}_j\| - L_0) \frac{\mathbf{p}_i - \mathbf{p}_j}{\|\mathbf{p}_i - \mathbf{p}_j\|}$$

$$F_{\text{damping}} = -c (\mathbf{v}_i - \mathbf{v}_j)$$

$$F_{\text{pressure}} = \frac{k_p \cdot \Delta A}{L_{\text{edge}}} \cdot \mathbf{n}_{\text{edge}}$$

Where:
- $k$ is the elastic spring stiffness coefficient.
- $L_0$ is the natural unconstrained rest length between vertices $i$ and $j$.
- $c$ is the viscous damping coefficient dissipating kinetic oscillation.
- $k_p$ is the internal pressure conservation coefficient maintaining soft-tissue volume.
- $\Delta A = A_{\text{current}} - A_{\text{target}}$ represents area dilatation computed via the shoelace polygon formula.
- $\mathbf{n}_{\text{edge}}$ is the outward surface normal.

### B. Interactive Features & Rendering Modes
- **Real-Time Vertex Dragging**: Direct pointer interaction with spatial inverse distance weighting.
- **Dynamic Impulse Waves**: Simulated shockwave propagation through the interior structural springs.
- **Wireframe Lattice vs Dermal Surface**: Toggling between mechanical spring-mass telemetry and rendered soft-tissue geometry with normal-based lighting.
- **Stress Heatmap**: Real-time vertex coloration visualizing tensile vs compressive strain.

## 2. Neural Rendering + Physical Simulation Integration
Our long-term computational research tackles the fundamental divide between:
1. **Physical Simulation**: Highly coherent, volume-preserving, physically realistic deformation, but traditionally expensive and geometrically sterile.
2. **Generative Neural Diffusion**: Photorealistic texture and dermal rendering, but plagued by temporal jitter, melting appendages, and lack of physical conservation.

**The Hybrid Approach**:
By conditioning differentiable neural renderers on GPU-simulated deformable geometry skeletons, Porni Group achieves temporal frame-to-frame stability with lifelike soft-tissue dynamics across extended video sequences.

## 3. Web Audio API Generative Synthesis Engines
The platform avoids static audio files by synthesizing acoustic textures natively:
- **Ambient Drone Synthesizer**: Detuned oscillators (55Hz / 110.5Hz) modulated by a 0.12Hz LFO through a resonant biquad lowpass filter.
- **Modal Interactive Synthesizer**: Real-time sawtooth/sine synthesizer with an interactive FFT oscilloscope visualizer.

## 4. Dedicated Investor Allocation Workflow
- Form captures verified investor tickets (£500k to £30,000,000 full round), compute allocation commitments, and LP resilience confirmation.
- Output generates a cryptographically stamped dispatch receipt with immutable SHA-256 tokens and zero-dependency clipboard copying.

---

## Related Notes
- [[Pitch_Memo|Confidential Investor Pitch Memo]]
- [[Brand_Manifesto|The Synthetic Manifesto]]
- [[Pipeline_Guide|Computational & Deformable Simulation Pipeline]]
- [[MOC|Master Map of Content]]
