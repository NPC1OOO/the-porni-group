import { portfolioItems } from './data/portfolio.js';

/* ==========================================================================
   APP STATE & INITIALIZATION
   ========================================================================== */
// Ambient Synthesizer State
let audioCtx = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientFilter = null;
let ambientLfo = null;
let ambientMasterGain = null;
let isAmbientPlaying = false;
let ambientSessionId = 0;

// Grid Acoustic Preview State
let previewAudioCtx = null;
let previewAnalyser = null;
let previewOsc = null;
let previewGain = null;
let isPreviewPlaying = false;
let previewAnimFrame = null;
let activePreviewBtn = null;
let activePreviewCanvas = null;

// Modal Acoustic Synthesizer State
let modalAudioCtx = null;
let modalAnalyser = null;
let modalOsc = null;
let modalSubOsc = null;
let modalGain = null;
let isModalAudioPlaying = false;
let modalAnimFrame = null;
let modalCurrentFreq = 330;

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initCanvas();
  initSoftBodySimulation();
  initTelemetryCounters();
  initGallery();
  initModal();
  initAmbientSynth();
  initPromptExpander();
  initCommissionForm();
  initLatencyTicker();
});

/* ==========================================================================
   CLIPBOARD HELPER (Robust Fallback)
   ========================================================================== */
async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback to execCommand
    }
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {}
  document.body.removeChild(textArea);
  return success;
}

/* ==========================================================================
   HEADER & NAVIGATION
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (toggleBtn && mobileDrawer) {
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('open');
      mobileDrawer.classList.toggle('open');
    });

    mobileDrawer.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        toggleBtn.classList.remove('open');
        mobileDrawer.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   HERO INTERACTIVE CANVAS (High-DPI Neural Constellation & Fluid Nodes)
   ========================================================================== */
function initCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width || window.innerWidth;
    height = rect.height || window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    if (ctx.resetTransform) {
      ctx.resetTransform();
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.scale(dpr, dpr);
  }

  resize();

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 12000), 95);
  const maxDistance = 140;

  const mouse = {
    x: width / 2,
    y: height / 2,
    radius: 180,
    isActive: false,
  };

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.75;
      this.vy = (Math.random() - 0.5) * 0.75;
      this.baseRadius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.4 ? 'rgba(0, 240, 255,' : 'rgba(255, 0, 127,';
      this.alpha = Math.random() * 0.5 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion physics
      if (mouse.isActive) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0.001) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color}${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  window.addEventListener('resize', () => {
    resize();
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.isActive = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.isActive = false;
  });

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting synapses
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   TELEMETRY COUNTERS ANIMATION
   ========================================================================== */
function initTelemetryCounters() {
  const elements = document.querySelectorAll('[data-counter]');
  elements.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;

    let current = 0;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
    }, stepTime);
  });
}

/* ==========================================================================
   AMBIENT AUDIO SYNTHESIZER (Web Audio API - Race Safe)
   ========================================================================== */
function initAmbientSynth() {
  const btn = document.getElementById('ambientAudioToggle');
  const label = document.getElementById('ambientAudioLabel');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    if (!isAmbientPlaying) {
      startAmbientSynth();
      btn.classList.add('active');
      if (label) label.textContent = 'SYNTH AUDIO: ON';
      isAmbientPlaying = true;
      showToast('Neural Audio Stream: Synchronized (432Hz Ambient)');
    } else {
      stopAmbientSynth();
      btn.classList.remove('active');
      if (label) label.textContent = 'SYNTH AUDIO: OFF';
      isAmbientPlaying = false;
      showToast('Neural Audio Stream: Terminated');
    }
  });
}

function startAmbientSynth() {
  ambientSessionId++;
  const now = audioCtx.currentTime;

  ambientMasterGain = audioCtx.createGain();
  ambientMasterGain.gain.setValueAtTime(0.0001, now);
  ambientMasterGain.gain.exponentialRampToValueAtTime(0.09, now + 1.2);
  ambientMasterGain.connect(audioCtx.destination);

  // Filter with slow LFO
  ambientFilter = audioCtx.createBiquadFilter();
  ambientFilter.type = 'lowpass';
  ambientFilter.frequency.setValueAtTime(320, now);
  ambientFilter.Q.setValueAtTime(4, now);
  ambientFilter.connect(ambientMasterGain);

  ambientLfo = audioCtx.createOscillator();
  ambientLfo.frequency.setValueAtTime(0.12, now);
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.setValueAtTime(140, now);
  ambientLfo.connect(lfoGain);
  lfoGain.connect(ambientFilter.frequency);
  ambientLfo.start(now);

  // Deep Sub Oscillator (A1 - 55Hz)
  ambientOsc1 = audioCtx.createOscillator();
  ambientOsc1.type = 'sine';
  ambientOsc1.frequency.setValueAtTime(55, now);
  ambientOsc1.connect(ambientFilter);
  ambientOsc1.start(now);

  // Ethereal Upper Drone (A2 / D3 harmonic shimmer)
  ambientOsc2 = audioCtx.createOscillator();
  ambientOsc2.type = 'triangle';
  ambientOsc2.frequency.setValueAtTime(110.5, now);
  ambientOsc2.connect(ambientFilter);
  ambientOsc2.start(now);
}

function stopAmbientSynth() {
  if (!ambientMasterGain || !audioCtx) return;
  const now = audioCtx.currentTime;

  ambientMasterGain.gain.cancelScheduledValues(now);
  ambientMasterGain.gain.setValueAtTime(Math.max(ambientMasterGain.gain.value, 0.0001), now);
  ambientMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

  const osc1 = ambientOsc1;
  const osc2 = ambientOsc2;
  const lfo = ambientLfo;
  ambientOsc1 = null;
  ambientOsc2 = null;
  ambientLfo = null;

  setTimeout(() => {
    try {
      if (osc1) osc1.stop();
      if (osc2) osc2.stop();
      if (lfo) lfo.stop();
    } catch (e) {}
  }, 450);
}

/* ==========================================================================
   GALLERY & SHOWCASE CARDS
   ========================================================================== */
function initGallery() {
  const grid = document.getElementById('showcaseGrid');
  const tabs = document.querySelectorAll('.filter-tab');
  if (!grid) return;

  function render(items) {
    grid.innerHTML = items
      .map((item) => {
        const aspectClass = item.aspect === '16:9' ? 'ratio-16-9' : item.aspect === '3:2' ? 'ratio-3-2' : 'ratio-3-4';
        const isAudio = item.audioSample;

        return `
        <article class="showcase-card" data-id="${item.id}" data-category="${item.category}">
          <div class="showcase-thumb-wrap ${aspectClass}">
            <img src="${item.image}" alt="${item.title}" class="showcase-img" loading="lazy" />
            <div class="card-badges">
              <span class="model-badge">${item.modelBadge}</span>
              <span class="category-tag">${item.categoryLabel}</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">${item.title}</h3>
            <p class="card-prompt-snippet">${item.promptSnippet}</p>

            ${
              isAudio
                ? `
                <div class="mini-audio-player">
                  <button class="mini-play-btn" data-audio-preview="true" title="Generate & Listen to Neural Acoustics" aria-label="Play acoustic preview">
                    ▶
                  </button>
                  <canvas class="waveform-canvas" width="200" height="24"></canvas>
                </div>
              `
                : ''
            }

            <div class="card-action-bar">
              <button class="card-inspect-btn" data-inspect="${item.id}">
                INSPECT LATENT MATRIX ↗
              </button>
              <div class="card-c2pa-indicator" title="C2PA Authenticity Cryptographically Sealed">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>C2PA SEALED</span>
              </div>
            </div>
          </div>
        </article>
      `;
      })
      .join('');

    // Attach inspect triggers
    grid.querySelectorAll('[data-inspect]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-inspect');
        openModal(id);
      });
    });

    // Attach card clicks
    grid.querySelectorAll('.showcase-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('canvas')) return;
        const id = card.getAttribute('data-id');
        openModal(id);
      });
    });

    // Attach audio preview buttons
    grid.querySelectorAll('[data-audio-preview]').forEach((playBtn) => {
      const card = playBtn.closest('.showcase-card');
      const canvas = card.querySelector('.waveform-canvas');
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAcousticPreview(playBtn, canvas);
      });
    });
  }

  render(portfolioItems);

  // Tab Filtering (Stops any running preview first)
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      stopAcousticPreview();
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      if (filter === 'all') {
        render(portfolioItems);
      } else {
        const filtered = portfolioItems.filter((i) => i.category === filter);
        render(filtered);
      }
    });
  });
}

/* ==========================================================================
   GRID ACOUSTIC PREVIEW (Generative Waveform Synthesizer)
   ========================================================================== */
function toggleAcousticPreview(btn, canvas) {
  if (isPreviewPlaying && activePreviewBtn === btn) {
    stopAcousticPreview();
  } else {
    stopAcousticPreview();
    startAcousticPreview(btn, canvas);
  }
}

function startAcousticPreview(btn, canvas) {
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!previewAudioCtx) {
    previewAudioCtx = new AudioCtxClass();
  }
  if (previewAudioCtx.state === 'suspended') {
    previewAudioCtx.resume();
  }

  activePreviewBtn = btn;
  activePreviewCanvas = canvas;

  const now = previewAudioCtx.currentTime;
  previewAnalyser = previewAudioCtx.createAnalyser();
  previewAnalyser.fftSize = 64;

  previewGain = previewAudioCtx.createGain();
  previewGain.gain.setValueAtTime(0.001, now);
  previewGain.gain.exponentialRampToValueAtTime(0.12, now + 0.3);

  // Generative melody arpeggio
  previewOsc = previewAudioCtx.createOscillator();
  previewOsc.type = 'sawtooth';
  previewOsc.frequency.setValueAtTime(220, now);

  const notes = [220, 277.18, 329.63, 440, 554.37, 659.25];
  notes.forEach((freq, idx) => {
    previewOsc.frequency.setValueAtTime(freq, now + idx * 0.4);
  });

  const filter = previewAudioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(6, now);

  previewOsc.connect(filter);
  filter.connect(previewGain);
  previewGain.connect(previewAnalyser);
  previewAnalyser.connect(previewAudioCtx.destination);

  previewOsc.start(now);
  isPreviewPlaying = true;
  btn.textContent = '⏹';
  btn.style.background = 'var(--accent-cyan)';

  // Waveform visualization
  const ctx = canvas.getContext('2d');
  const bufferLength = previewAnalyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function drawWaveform() {
    if (!isPreviewPlaying) return;
    previewAnimFrame = requestAnimationFrame(drawWaveform);
    previewAnalyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillStyle = `rgb(${dataArray[i]}, 240, 255)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
      x += barWidth;
    }
  }

  drawWaveform();

  // Auto-stop after cycle
  setTimeout(() => {
    if (isPreviewPlaying && activePreviewBtn === btn) {
      stopAcousticPreview();
    }
  }, 2600);
}

function stopAcousticPreview() {
  if (!isPreviewPlaying && !previewOsc) return;

  const btn = activePreviewBtn;
  const canvas = activePreviewCanvas;
  activePreviewBtn = null;
  activePreviewCanvas = null;

  if (previewAudioCtx && previewGain) {
    const now = previewAudioCtx.currentTime;
    previewGain.gain.cancelScheduledValues(now);
    previewGain.gain.setValueAtTime(Math.max(previewGain.gain.value, 0.0001), now);
    previewGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  }

  const osc = previewOsc;
  previewOsc = null;
  cancelAnimationFrame(previewAnimFrame);

  setTimeout(() => {
    try {
      if (osc) osc.stop();
    } catch (e) {}
  }, 180);

  if (canvas) {
    try {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } catch (e) {}
  }

  if (btn) {
    btn.textContent = '▶';
    btn.style.background = 'var(--accent-magenta)';
  }

  isPreviewPlaying = false;
}

/* ==========================================================================
   MODAL / LIGHTBOX VIEW & INTERACTIVE ACOUSTIC SYNTHESIZER
   ========================================================================== */
function initModal() {
  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (!modal) return;

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    stopModalAudio();
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Copy Buttons inside Modal
  modal.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const textEl = document.getElementById(targetId);
      if (textEl) {
        copyToClipboard(textEl.textContent.trim()).then(() => {
          showToast('Copied to clipboard');
          btn.textContent = 'COPIED!';
          setTimeout(() => {
            btn.textContent = 'COPY';
          }, 1500);
        });
      }
    });
  });
}

function openModal(id) {
  const modal = document.getElementById('lightboxModal');
  const item = portfolioItems.find((p) => p.id === id);
  if (!modal || !item) return;

  document.getElementById('modalImage').src = item.image;
  document.getElementById('modalImage').alt = item.title;
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalCategory').textContent = item.categoryLabel;
  document.getElementById('modalModel').textContent = item.specs.model;
  document.getElementById('modalSeed').textContent = item.specs.seed;
  document.getElementById('modalSteps').textContent = item.specs.steps;
  document.getElementById('modalCfg').textContent = item.specs.cfg;
  document.getElementById('modalSampler').textContent = item.specs.sampler;
  document.getElementById('modalAspect').textContent = item.aspect || '16:9';
  document.getElementById('modalResolution').textContent = item.specs.resolution;
  document.getElementById('modalC2paHash').textContent = item.specs.c2paHash;

  document.getElementById('modalPositivePrompt').textContent = item.positivePrompt;
  document.getElementById('modalNegativePrompt').textContent = item.negativePrompt;

  // Acoustic Waveform Synthesizer in Modal
  const audioPanel = document.getElementById('modalAudioPanel');
  if (item.audioSample) {
    if (audioPanel) audioPanel.style.display = 'flex';
    setupModalAudioPlayer();
  } else {
    if (audioPanel) audioPanel.style.display = 'none';
    stopModalAudio();
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function setupModalAudioPlayer() {
  const playBtn = document.getElementById('modalAudioPlayBtn');
  const pitchSlider = document.getElementById('modalPitchSlider');
  const pitchVal = document.getElementById('modalPitchVal');
  const canvas = document.getElementById('modalWaveformCanvas');

  stopModalAudio();

  if (pitchSlider && pitchVal) {
    pitchSlider.value = 330;
    pitchVal.textContent = '330Hz';
    pitchSlider.oninput = (e) => {
      modalCurrentFreq = parseFloat(e.target.value);
      pitchVal.textContent = `${modalCurrentFreq}Hz`;
      if (modalOsc && modalAudioCtx) {
        modalOsc.frequency.setValueAtTime(modalCurrentFreq, modalAudioCtx.currentTime);
        if (modalSubOsc) {
          modalSubOsc.frequency.setValueAtTime(modalCurrentFreq / 2, modalAudioCtx.currentTime);
        }
      }
    };
  }

  if (playBtn) {
    playBtn.onclick = () => {
      if (isModalAudioPlaying) {
        stopModalAudio();
      } else {
        startModalAudio(canvas);
      }
    };
  }
}

function startModalAudio(canvas) {
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!modalAudioCtx) {
    modalAudioCtx = new AudioCtxClass();
  }
  if (modalAudioCtx.state === 'suspended') {
    modalAudioCtx.resume();
  }

  const now = modalAudioCtx.currentTime;
  modalAnalyser = modalAudioCtx.createAnalyser();
  modalAnalyser.fftSize = 128;

  modalGain = modalAudioCtx.createGain();
  modalGain.gain.setValueAtTime(0.0001, now);
  modalGain.gain.exponentialRampToValueAtTime(0.14, now + 0.3);

  // Dual oscillator: Harmonic Lead + Sub Bass
  modalOsc = modalAudioCtx.createOscillator();
  modalOsc.type = 'sawtooth';
  modalOsc.frequency.setValueAtTime(modalCurrentFreq, now);

  modalSubOsc = modalAudioCtx.createOscillator();
  modalSubOsc.type = 'sine';
  modalSubOsc.frequency.setValueAtTime(modalCurrentFreq / 2, now);

  const filter = modalAudioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(5, now);

  modalOsc.connect(filter);
  modalSubOsc.connect(filter);
  filter.connect(modalGain);
  modalGain.connect(modalAnalyser);
  modalAnalyser.connect(modalAudioCtx.destination);

  modalOsc.start(now);
  modalSubOsc.start(now);
  isModalAudioPlaying = true;

  const playIcon = document.getElementById('modalAudioPlayIcon');
  const playText = document.getElementById('modalAudioPlayText');
  const statusEl = document.getElementById('modalAudioStatus');
  if (playIcon) playIcon.textContent = '⏹';
  if (playText) playText.textContent = 'TERMINATE STREAM';
  if (statusEl) {
    statusEl.textContent = 'STREAMING // 48kHz';
    statusEl.style.color = 'var(--accent-cyan)';
  }

  // Waveform visualization on modal canvas
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const bufferLength = modalAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function drawModalWaveform() {
      if (!isModalAudioPlaying) return;
      modalAnimFrame = requestAnimationFrame(drawModalWaveform);
      modalAnalyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height - 6);
        const hue = 180 + (i / bufferLength) * 120; // Cyan to Magenta gradient
        ctx.fillStyle = `hsl(${hue}, 100%, 55%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    }
    drawModalWaveform();
  }
}

function stopModalAudio() {
  if (!modalAudioCtx || !isModalAudioPlaying) {
    isModalAudioPlaying = false;
    resetModalAudioUI();
    return;
  }
  const now = modalAudioCtx.currentTime;
  if (modalGain) {
    modalGain.gain.cancelScheduledValues(now);
    modalGain.gain.setValueAtTime(Math.max(modalGain.gain.value, 0.0001), now);
    modalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  }
  const osc = modalOsc;
  const sub = modalSubOsc;
  modalOsc = null;
  modalSubOsc = null;
  cancelAnimationFrame(modalAnimFrame);

  setTimeout(() => {
    try {
      if (osc) osc.stop();
      if (sub) sub.stop();
    } catch (e) {}
  }, 220);

  isModalAudioPlaying = false;
  resetModalAudioUI();
}

function resetModalAudioUI() {
  const playIcon = document.getElementById('modalAudioPlayIcon');
  const playText = document.getElementById('modalAudioPlayText');
  const statusEl = document.getElementById('modalAudioStatus');
  const canvas = document.getElementById('modalWaveformCanvas');
  if (playIcon) playIcon.textContent = '▶';
  if (playText) playText.textContent = 'SYNTHESIZE ACOUSTIC STREAM';
  if (statusEl) {
    statusEl.textContent = 'STATUS: STANDBY';
    statusEl.style.color = 'var(--text-muted)';
  }
  if (canvas) {
    try {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } catch (e) {}
  }
}

/* ==========================================================================
   AI PROMPT MATRIX EXPANDER (Investor Allocation & Term Sheet Notes)
   ========================================================================== */
function initPromptExpander() {
  const expanderBtn = document.getElementById('btnExpandPrompt');
  const textarea = document.getElementById('projectBrief');
  if (!expanderBtn || !textarea) return;

  const styleEnhancements = [
    ', syndicate allocation of £5,000,000 with 1,024 NVIDIA H100 GPU cluster access, zero corporate bureaucracy, and absolute immunity from Microsoft Teams productivity coaching',
    ', our LP investment committee has been pre-briefed on "boob physics" and has formally pledged to review technical milestones without making nervous eye contact',
    ', lead seed term sheet with pro-rata rights, dedicated CUDA kernel optimization engineers, and zero unsolicited advice on choosing website shades of blue',
    ', sovereign compute partnership: high-density liquid-cooled B200 reservation for real-time deformable soft-body simulations and anatomical neural rendering',
    ', founder-friendly terms: no liquidation ratchets, non-blocking board observer, and full alignment with aggressive digital entertainment commercialization'
  ];

  let enhancementIdx = 0;

  expanderBtn.addEventListener('click', () => {
    const currentText = textarea.value.trim();
    const addition = styleEnhancements[enhancementIdx % styleEnhancements.length];
    enhancementIdx++;

    if (!currentText) {
      textarea.value = 'Seed allocation thesis for Porni Group frontier research' + addition;
    } else {
      textarea.value = currentText + addition;
    }

    textarea.focus();
    showToast('AI Prompt Matrix: Investor Covenants Injected');
  });
}

/* ==========================================================================
   COMMISSION INQUIRY FORM & DEDICATED FEEDBACK MODAL (Investor Allocation)
   ========================================================================== */
function initCommissionForm() {
  const form = document.getElementById('commissionForm');
  const pills = document.querySelectorAll('.type-pill');
  const feedbackModal = document.getElementById('commissionFeedbackModal');
  const feedbackCloseBtn = document.getElementById('feedbackCloseBtn');
  const dismissBtn = document.getElementById('dismissFeedbackBtn');
  const copyReceiptBtn = document.getElementById('copyReceiptBtn');
  const receiptBody = document.getElementById('feedbackReceiptBody');
  if (!form) return;

  function closeFeedback() {
    if (feedbackModal) {
      feedbackModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (feedbackCloseBtn) feedbackCloseBtn.addEventListener('click', closeFeedback);
  if (dismissBtn) dismissBtn.addEventListener('click', closeFeedback);
  if (feedbackModal) {
    feedbackModal.addEventListener('click', (e) => {
      if (e.target === feedbackModal) closeFeedback();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && feedbackModal && feedbackModal.classList.contains('active')) {
      closeFeedback();
    }
  });

  // Multi-select pill toggles with keyboard accessibility
  pills.forEach((pill) => {
    pill.setAttribute('role', 'checkbox');
    pill.setAttribute('tabindex', '0');
    pill.setAttribute('aria-checked', pill.classList.contains('selected') ? 'true' : 'false');

    const toggle = () => {
      pill.classList.toggle('selected');
      pill.setAttribute('aria-checked', pill.classList.contains('selected') ? 'true' : 'false');
    };

    pill.addEventListener('click', toggle);
    pill.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const budgetSelect = document.getElementById('budgetTier');
    const budget = budgetSelect ? budgetSelect.options[budgetSelect.selectedIndex].text : '£30,000,000 — Take the Entire Seed Round (Preferred)';
    const timelineSelect = document.getElementById('timeline');
    const timeline = timelineSelect ? timelineSelect.options[timelineSelect.selectedIndex].text : 'Immediate Allocation (Closing in 14 Days)';
    const brief = document.getElementById('projectBrief').value.trim();

    if (!name || !email || !brief) {
      alert('Please fill out all required fields (Name, Email/Handle, and Investor Notes).');
      return;
    }

    const selectedTypes = Array.from(document.querySelectorAll('.type-pill.selected')).map(
      (p) => p.textContent.trim()
    );
    const mediumsList = selectedTypes.length ? selectedTypes.join(', ') : 'GPU Soft-Body Physics, Deformable Geometry';

    const ticketId = `TPG-SEED-${Math.floor(100000 + Math.random() * 900000)}-C2PA`;
    const dispatchTime = new Date().toISOString();
    const c2paHash = `c2pa:sha256:${ticketId.toLowerCase()}`;

    const receiptHtml = `
      <div class="receipt-row">
        <span class="receipt-label">Seed Allocation Ticket:</span>
        <span class="receipt-val glow-text-cyan">${ticketId}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Partner / Entity:</span>
        <span class="receipt-val">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Research Focus Pillars:</span>
        <span class="receipt-val" style="color: var(--accent-magenta);">${escapeHtml(mediumsList)}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Proposed Seed Ticket:</span>
        <span class="receipt-val glow-text-lime">${escapeHtml(budget)}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Commitment Horizon:</span>
        <span class="receipt-val">${escapeHtml(timeline)}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Timestamp:</span>
        <span class="receipt-val">${dispatchTime}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">C2PA Cryptographic Signature:</span>
        <span class="receipt-val glow-text-lime">${c2paHash}</span>
      </div>
      <div style="margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid rgba(255, 255, 255, 0.08);">
        <span class="receipt-label" style="display: block; margin-bottom: 0.25rem;">Value-Add & Compute Notes:</span>
        <div style="color: var(--text-muted); font-size: 0.75rem; line-height: 1.5; font-style: italic;">
          "${escapeHtml(brief)}"
        </div>
      </div>
    `;

    if (receiptBody) {
      receiptBody.innerHTML = receiptHtml;
    }

    if (feedbackModal) {
      feedbackModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    if (copyReceiptBtn) {
      copyReceiptBtn.onclick = () => {
        const plainReceipt = `THE PORNI GROUP // INVESTOR ALLOCATION RECEIPT\nTicket: ${ticketId}\nPartner / Entity: ${name} (${email})\nResearch Focus: ${mediumsList}\nProposed Allocation: ${budget}\nHorizon: ${timeline}\nProvenance Hash: ${c2paHash}\nValue-Add & Compute Notes: ${brief}`;
        copyToClipboard(plainReceipt).then(() => {
          showToast('Allocation receipt copied to clipboard');
          const span = copyReceiptBtn.querySelector('span');
          if (span) {
            span.textContent = 'COPIED!';
            setTimeout(() => {
              span.textContent = 'Copy Dispatch Receipt';
            }, 1500);
          }
        });
      };
    }

    form.reset();
    pills.forEach((p) => {
      p.classList.remove('selected');
      p.setAttribute('aria-checked', 'false');
    });
    if (pills[0]) {
      pills[0].classList.add('selected');
      pills[0].setAttribute('aria-checked', 'true');
    }
    showToast('Term sheet request sealed & dispatched!');
  });
}

function escapeHtml(string) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(string).replace(/[&<>"']/g, (s) => entityMap[s]);
}

/* ==========================================================================
   LATENCY & SYSTEM TICKER
   ========================================================================== */
function initLatencyTicker() {
  const latencyEl = document.getElementById('systemLatency');
  if (!latencyEl) return;

  setInterval(() => {
    const ping = Math.floor(14 + Math.random() * 8);
    latencyEl.textContent = `${ping}ms`;
  }, 3500);
}

/* ==========================================================================
   TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}


/* ==========================================================================
   DEFORMABLE SOFT-BODY & SPRING LATTICE SIMULATION ENGINE
   ========================================================================== */
function initSoftBodySimulation() {
  const canvas = document.getElementById('softBodyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width || 800;
    height = rect.height || 520;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    if (ctx.resetTransform) {
      ctx.resetTransform();
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize);

  // Simulation parameters
  let stiffness = 0.08;
  let damping = 0.982;
  let gravity = 0.12;
  let pressureKp = 0.06;
  let renderMode = 'wireframe'; // 'wireframe', 'dermal', 'heatmap'

  // Slider bindings
  const stiffnessSlider = document.getElementById('simStiffness');
  const dampingSlider = document.getElementById('simDamping');
  const pressureSlider = document.getElementById('simPressure');
  const gravitySlider = document.getElementById('simGravity');

  const stiffnessVal = document.getElementById('stiffnessVal');
  const dampingVal = document.getElementById('dampingVal');
  const pressureVal = document.getElementById('pressureVal');
  const gravityVal = document.getElementById('gravityVal');

  if (stiffnessSlider) {
    stiffnessSlider.addEventListener('input', (e) => {
      stiffness = parseFloat(e.target.value);
      if (stiffnessVal) stiffnessVal.textContent = stiffness.toFixed(2);
    });
  }
  if (dampingSlider) {
    dampingSlider.addEventListener('input', (e) => {
      damping = parseFloat(e.target.value);
      if (dampingVal) dampingVal.textContent = damping.toFixed(3);
    });
  }
  if (pressureSlider) {
    pressureSlider.addEventListener('input', (e) => {
      pressureKp = parseFloat(e.target.value);
      if (pressureVal) pressureVal.textContent = pressureKp.toFixed(2);
    });
  }
  if (gravitySlider) {
    gravitySlider.addEventListener('input', (e) => {
      gravity = parseFloat(e.target.value);
      if (gravityVal) gravityVal.textContent = `${gravity.toFixed(2)} G`;
    });
  }

  // Render mode buttons
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderMode = btn.getAttribute('data-mode') || 'wireframe';
    });
  });

  // Action buttons
  const btnImpulse = document.getElementById('btnSimImpulse');
  const btnHyperJiggle = document.getElementById('btnSimHyperJiggle');
  const btnReset = document.getElementById('btnSimReset');

  // HUD elements
  const hudFps = document.getElementById('hudFps');
  const hudStrain = document.getElementById('hudStrain');
  const hudEnergy = document.getElementById('hudEnergy');
  const hudPressure = document.getElementById('hudPressure');

  // Vertices and Springs Data
  let vertices = [];
  let springs = [];
  let lobes = [];

  class Vertex {
    constructor(x, y, isPinned = false, lobeIndex = 0) {
      this.x = x;
      this.y = y;
      this.initX = x;
      this.initY = y;
      this.vx = 0;
      this.vy = 0;
      this.fx = 0;
      this.fy = 0;
      this.mass = isPinned ? Infinity : 1.0;
      this.isPinned = isPinned;
      this.lobeIndex = lobeIndex;
    }

    reset() {
      this.x = this.initX;
      this.y = this.initY;
      this.vx = 0;
      this.vy = 0;
      this.fx = 0;
      this.fy = 0;
    }
  }

  class Spring {
    constructor(v1, v2, kMultiplier = 1.0) {
      this.v1 = v1;
      this.v2 = v2;
      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      this.restLength = Math.sqrt(dx * dx + dy * dy);
      this.kMultiplier = kMultiplier;
      this.strain = 0;
    }

    update() {
      const dx = this.v2.x - this.v1.x;
      const dy = this.v2.y - this.v1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      const delta = dist - this.restLength;
      this.strain = Math.abs(delta) / this.restLength;

      const force = delta * stiffness * this.kMultiplier;
      const nx = dx / dist;
      const ny = dy / dist;

      if (!this.v1.isPinned) {
        this.v1.fx += nx * force;
        this.v1.fy += ny * force;
      }
      if (!this.v2.isPinned) {
        this.v2.fx -= nx * force;
        this.v2.fy -= ny * force;
      }
    }
  }

  function setupGeometry() {
    vertices = [];
    springs = [];
    lobes = [];

    const centerX = width / 2;
    const centerY = height * 0.44;
    const lobeRadius = Math.min(width * 0.17, 115);
    const lobeSpacing = lobeRadius * 1.55;

    // Anchor Base (Rigid mounting points)
    const anchorLeft = new Vertex(centerX - lobeSpacing * 0.7, centerY - lobeRadius * 1.05, true, -1);
    const anchorCenter = new Vertex(centerX, centerY - lobeRadius * 1.15, true, -1);
    const anchorRight = new Vertex(centerX + lobeSpacing * 0.7, centerY - lobeRadius * 1.05, true, -1);
    vertices.push(anchorLeft, anchorCenter, anchorRight);

    // Build Dual Soft-Tissue Lobes (Left and Right)
    const lobeOffsets = [-lobeSpacing * 0.52, lobeSpacing * 0.52];
    const numPerimeter = 14;

    lobeOffsets.forEach((offset, lobeIdx) => {
      const lx = centerX + offset;
      const ly = centerY;
      const core = new Vertex(lx, ly, false, lobeIdx);
      vertices.push(core);

      const lobePerimeter = [];

      for (let i = 0; i < numPerimeter; i++) {
        const angle = (i / numPerimeter) * Math.PI * 2;
        // Natural anatomical soft-body tear-drop contour
        const rx = lobeRadius * (1.0 + Math.sin(angle) * 0.12);
        const ry = lobeRadius * (1.1 + Math.cos(angle) * 0.15);
        const px = lx + Math.cos(angle) * rx;
        const py = ly + Math.sin(angle) * ry;

        const v = new Vertex(px, py, false, lobeIdx);
        vertices.push(v);
        lobePerimeter.push(v);

        // Radial spring from core to perimeter
        springs.push(new Spring(core, v, 1.1));
      }

      // Circumferential springs
      for (let i = 0; i < numPerimeter; i++) {
        const next = (i + 1) % numPerimeter;
        springs.push(new Spring(lobePerimeter[i], lobePerimeter[next], 1.25));

        // Shear cross springs (i to i+2)
        const cross = (i + 2) % numPerimeter;
        springs.push(new Spring(lobePerimeter[i], lobePerimeter[cross], 0.65));
      }

      // Compute Rest Area for Hydrostatic Pressure (Shoelace formula)
      let restArea = 0;
      for (let i = 0; i < numPerimeter; i++) {
        const next = (i + 1) % numPerimeter;
        restArea += lobePerimeter[i].x * lobePerimeter[next].y - lobePerimeter[next].x * lobePerimeter[i].y;
      }
      restArea = Math.abs(restArea) / 2;

      lobes.push({
        core,
        perimeter: lobePerimeter,
        restArea,
      });

      // Anchor connections
      const targetAnchor = lobeIdx === 0 ? anchorLeft : anchorRight;
      springs.push(new Spring(targetAnchor, core, 0.95));
      springs.push(new Spring(anchorCenter, core, 0.85));
      springs.push(new Spring(targetAnchor, lobePerimeter[Math.floor(numPerimeter * 0.75)], 1.1));
      springs.push(new Spring(anchorCenter, lobePerimeter[Math.floor(numPerimeter * 0.85)], 0.9));
    });

    // Inter-lobe coupling springs (cleavage bridge resonance)
    const leftPerimeter = lobes[0].perimeter;
    const rightPerimeter = lobes[1].perimeter;
    springs.push(new Spring(lobes[0].core, lobes[1].core, 0.5));
    springs.push(new Spring(leftPerimeter[0], rightPerimeter[Math.floor(numPerimeter / 2)], 0.75));
    springs.push(new Spring(leftPerimeter[1], rightPerimeter[Math.floor(numPerimeter / 2) - 1], 0.65));
  }

  setupGeometry();

  // Mouse & Touch Interaction
  const mouse = {
    x: width / 2,
    y: height / 2,
    isDown: false,
    draggedVertex: null,
    prevX: width / 2,
    prevY: height / 2,
  };

  function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function onPointerDown(e) {
    const pos = getPointerPos(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
    mouse.prevX = pos.x;
    mouse.prevY = pos.y;
    mouse.isDown = true;

    // Find nearest vertex within 75px
    let nearest = null;
    let minDist = 75;

    vertices.forEach((v) => {
      if (v.isPinned) return;
      const dx = v.x - mouse.x;
      const dy = v.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = v;
      }
    });

    mouse.draggedVertex = nearest;
  }

  function onPointerMove(e) {
    const pos = getPointerPos(e);
    mouse.x = pos.x;
    mouse.y = pos.y;
  }

  function onPointerUp() {
    if (mouse.draggedVertex) {
      const flingX = (mouse.x - mouse.prevX) * 0.8;
      const flingY = (mouse.y - mouse.prevY) * 0.8;
      mouse.draggedVertex.vx += flingX;
      mouse.draggedVertex.vy += flingY;
    }
    mouse.isDown = false;
    mouse.draggedVertex = null;
  }

  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onPointerDown(e);
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (mouse.isDown) {
      onPointerMove(e);
    }
  }, { passive: false });

  window.addEventListener('touchend', onPointerUp);

  canvas.addEventListener('dblclick', () => {
    triggerImpulse();
  });

  function triggerImpulse() {
    vertices.forEach((v) => {
      if (v.isPinned) return;
      v.vx += (Math.random() - 0.5) * 16;
      v.vy += -(Math.random() * 14 + 6);
    });
    showToast('Simulation: Radial Impulse Shockwave Injected');
  }

  let hyperJiggleActive = false;
  let hyperJiggleFrames = 0;

  function triggerHyperJiggle() {
    hyperJiggleActive = true;
    hyperJiggleFrames = 180;
    showToast('Simulation: High-Frequency Resonance Perturbation Active');
  }

  if (btnImpulse) btnImpulse.addEventListener('click', triggerImpulse);
  if (btnHyperJiggle) btnHyperJiggle.addEventListener('click', triggerHyperJiggle);
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      vertices.forEach((v) => v.reset());
      showToast('Simulation: Equilibrium Restored');
    });
  }

  // Animation Loop & Physics Solver
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTime = lastTime;
  let currentFps = 60;

  function solvePhysics() {
    const subSteps = 3;
    const dt = 1.0 / subSteps;

    for (let step = 0; step < subSteps; step++) {
      // 1. Reset forces & apply gravity
      vertices.forEach((v) => {
        v.fx = 0;
        v.fy = v.isPinned ? 0 : gravity * 1.4;
      });

      // 2. Hyper-Jiggle periodic harmonic drive
      if (hyperJiggleActive) {
        hyperJiggleFrames--;
        if (hyperJiggleFrames <= 0) hyperJiggleActive = false;
        lobes.forEach((l, idx) => {
          const osc = Math.sin(performance.now() * 0.02 + idx * Math.PI) * 1.8;
          l.core.fy += osc;
          l.perimeter.forEach((p, pIdx) => {
            p.fx += Math.cos(pIdx + performance.now() * 0.015) * 0.9;
          });
        });
      }

      // 3. Mouse dragging spring constraint
      if (mouse.isDown && mouse.draggedVertex) {
        const dx = mouse.x - mouse.draggedVertex.x;
        const dy = mouse.y - mouse.draggedVertex.y;
        mouse.draggedVertex.fx += dx * 0.45;
        mouse.draggedVertex.fy += dy * 0.45;
        mouse.draggedVertex.vx *= 0.75;
        mouse.draggedVertex.vy *= 0.75;
      }

      // 4. Update springs
      springs.forEach((s) => s.update());

      // 5. Hydrostatic Area Preservation (Volume Pressure)
      lobes.forEach((l) => {
        let currentArea = 0;
        const n = l.perimeter.length;
        for (let i = 0; i < n; i++) {
          const next = (i + 1) % n;
          currentArea += l.perimeter[i].x * l.perimeter[next].y - l.perimeter[next].x * l.perimeter[i].y;
        }
        currentArea = Math.abs(currentArea) / 2;

        const deltaArea = l.restArea - currentArea;
        const pressureForce = deltaArea * pressureKp;

        for (let i = 0; i < n; i++) {
          const next = (i + 1) % n;
          const p1 = l.perimeter[i];
          const p2 = l.perimeter[next];

          const edgeX = p2.x - p1.x;
          const edgeY = p2.y - p1.y;
          const edgeLen = Math.sqrt(edgeX * edgeX + edgeY * edgeY) || 1;

          // Outward normal vector
          const normX = edgeY / edgeLen;
          const normY = -edgeX / edgeLen;

          const f = pressureForce * (edgeLen / l.restArea) * 45;

          if (!p1.isPinned) {
            p1.fx += normX * f * 0.5;
            p1.fy += normY * f * 0.5;
          }
          if (!p2.isPinned) {
            p2.fx += normX * f * 0.5;
            p2.fy += normY * f * 0.5;
          }
        }
      });

      // 6. Integrate motion & apply damping
      vertices.forEach((v) => {
        if (v.isPinned) return;
        v.vx = (v.vx + v.fx * dt) * damping;
        v.vy = (v.vy + v.fy * dt) * damping;

        // Velocity clamping for numerical stability
        const speed = Math.sqrt(v.vx * v.vx + v.vy * v.vy);
        if (speed > 28) {
          v.vx = (v.vx / speed) * 28;
          v.vy = (v.vy / speed) * 28;
        }

        v.x += v.vx * dt;
        v.y += v.vy * dt;

        // Soft collision boundary with floor and walls
        const margin = 20;
        if (v.x < margin) { v.x = margin; v.vx *= -0.5; }
        if (v.x > width - margin) { v.x = width - margin; v.vx *= -0.5; }
        if (v.y > height - margin) { v.y = height - margin; v.vy *= -0.5; v.vx *= 0.85; }
        if (v.y < margin) { v.y = margin; v.vy *= -0.5; }
      });
    }

    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Background cyber grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridStep = 40;
    for (let x = 0; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Render Lobes based on mode
    if (renderMode === 'dermal') {
      lobes.forEach((l) => {
        ctx.beginPath();
        const p = l.perimeter;
        const n = p.length;
        ctx.moveTo((p[0].x + p[n - 1].x) / 2, (p[0].y + p[n - 1].y) / 2);

        for (let i = 0; i < n; i++) {
          const next = (i + 1) % n;
          const midX = (p[i].x + p[next].x) / 2;
          const midY = (p[i].y + p[next].y) / 2;
          ctx.quadraticCurveTo(p[i].x, p[i].y, midX, midY);
        }
        ctx.closePath();

        // Organic biological radial gradient
        const radGrad = ctx.createRadialGradient(l.core.x, l.core.y - 10, 10, l.core.x, l.core.y + 20, 130);
        radGrad.addColorStop(0, 'rgba(255, 0, 127, 0.45)');
        radGrad.addColorStop(0.5, 'rgba(30, 20, 36, 0.95)');
        radGrad.addColorStop(1, 'rgba(12, 12, 18, 0.98)');
        ctx.fillStyle = radGrad;
        ctx.fill();

        // Luminous glowing rim
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Subsurface specular highlight
        ctx.beginPath();
        ctx.arc(l.core.x - 18, l.core.y - 25, 22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fill();
      });
    }

    // Springs rendering
    springs.forEach((s) => {
      ctx.beginPath();
      ctx.moveTo(s.v1.x, s.v1.y);
      ctx.lineTo(s.v2.x, s.v2.y);

      if (renderMode === 'wireframe') {
        const strainVal = Math.min(s.strain * 3.5, 1.0);
        if (s.strain > 0.15) {
          ctx.strokeStyle = `rgba(255, 0, 127, ${0.4 + strainVal * 0.6})`;
          ctx.lineWidth = 1.6;
        } else {
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 + (1 - strainVal) * 0.35})`;
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();
      } else if (renderMode === 'heatmap') {
        let strokeColor = '#00f0ff';
        if (s.strain > 0.28) {
          strokeColor = '#dfff00';
        } else if (s.strain > 0.14) {
          strokeColor = '#ff007f';
        } else if (s.strain > 0.05) {
          strokeColor = '#a0ff55';
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.8 + Math.min(s.strain * 4, 3);
        ctx.stroke();
      }
    });

    // Vertices rendering
    if (renderMode !== 'dermal') {
      vertices.forEach((v) => {
        ctx.beginPath();
        if (v.isPinned) {
          ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#dfff00';
          ctx.fill();
          ctx.strokeStyle = 'rgba(223, 255, 0, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          const isLobeCore = lobes.some((l) => l.core === v);
          const radius = isLobeCore ? 6 : 3.5;
          ctx.arc(v.x, v.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = isLobeCore ? '#ff007f' : '#00f0ff';
          ctx.fill();
        }
      });
    }

    // Active drag constraint line
    if (mouse.isDown && mouse.draggedVertex) {
      ctx.beginPath();
      ctx.moveTo(mouse.draggedVertex.x, mouse.draggedVertex.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = 'rgba(223, 255, 0, 0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 9, 0, Math.PI * 2);
      ctx.strokeStyle = '#dfff00';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Update Telemetry Metrics
    frameCount++;
    const now = performance.now();
    if (now - fpsTime >= 500) {
      currentFps = Math.round((frameCount * 1000) / (now - fpsTime));
      frameCount = 0;
      fpsTime = now;
      if (hudFps) hudFps.textContent = currentFps;
    }

    let totalStrain = 0;
    springs.forEach((s) => { totalStrain += s.strain; });
    const avgStrain = springs.length ? (totalStrain / springs.length) * 100 : 0;
    if (hudStrain) hudStrain.textContent = `${avgStrain.toFixed(1)}%`;

    let totalKineticEnergy = 0;
    vertices.forEach((v) => {
      if (!v.isPinned) {
        totalKineticEnergy += 0.5 * (v.vx * v.vx + v.vy * v.vy);
      }
    });
    if (hudEnergy) hudEnergy.textContent = `${(totalKineticEnergy * 0.01).toFixed(2)} J`;

    if (lobes.length && hudPressure) {
      let currentAreaSum = 0;
      let restAreaSum = 0;
      lobes.forEach((l) => {
        restAreaSum += l.restArea;
        const n = l.perimeter.length;
        let a = 0;
        for (let i = 0; i < n; i++) {
          const next = (i + 1) % n;
          a += l.perimeter[i].x * l.perimeter[next].y - l.perimeter[next].x * l.perimeter[i].y;
        }
        currentAreaSum += Math.abs(a) / 2;
      });
      const ratio = restAreaSum > 0 ? currentAreaSum / restAreaSum : 1.0;
      const kpa = (101.3 * ratio).toFixed(1);
      hudPressure.textContent = `${kpa} kPa`;
    }
  }

  function loop() {
    solvePhysics();
    draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
