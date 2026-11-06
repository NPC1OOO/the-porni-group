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
   AI PROMPT MATRIX EXPANDER (Commission Form)
   ========================================================================== */
function initPromptExpander() {
  const expanderBtn = document.getElementById('btnExpandPrompt');
  const textarea = document.getElementById('projectBrief');
  if (!expanderBtn || !textarea) return;

  const styleEnhancements = [
    ', shot on Arri Alexa 65, 35mm anamorphic prime lens, volumetric god rays, hyper-detailed subsurface scattering, 8k resolution, photorealistic masterwork, chromatic dispersion, Octane 2026 render',
    ', haute-couture aesthetic, liquid titanium cybernetic accents, dramatic chiaroscuro lighting, Hasselblad 100mm f/2.2, zero film grain, raw photo, award-winning editorial',
    ', surreal biomechanical architecture, bioluminescent neon cyan and acidic lime rim lighting, Blade Runner 2049 atmosphere, raytraced reflections, Unreal Engine 5.4 cinematic sequence',
    ', neural audio spectrum harmonic integration, binaural 3D spatial resonance, pristine studio acoustic treatment, 96kHz 24-bit dynamic fidelity',
    ', autonomous virtual persona rig, photorealistic iris micro-geometry, microscopic dermal pores, hyper-consistent character LoRA weights, cinematic depth of field',
  ];

  let enhancementIdx = 0;

  expanderBtn.addEventListener('click', () => {
    const currentText = textarea.value.trim();
    const addition = styleEnhancements[enhancementIdx % styleEnhancements.length];
    enhancementIdx++;

    if (!currentText) {
      textarea.value = 'Cinematic concept with futuristic themes' + addition;
    } else {
      textarea.value = currentText + addition;
    }

    textarea.focus();
    showToast('AI Prompt Matrix: Synthetic Modifiers Injected');
  });
}

/* ==========================================================================
   COMMISSION INQUIRY FORM & DEDICATED FEEDBACK MODAL
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
    const budget = budgetSelect ? budgetSelect.options[budgetSelect.selectedIndex].text : '$25,000 — $50,000';
    const timelineSelect = document.getElementById('timeline');
    const timeline = timelineSelect ? timelineSelect.options[timelineSelect.selectedIndex].text : 'Standard Production';
    const brief = document.getElementById('projectBrief').value.trim();

    if (!name || !email || !brief) {
      alert('Please fill out all required fields (Name, Email/Handle, and Project Brief).');
      return;
    }

    const selectedTypes = Array.from(document.querySelectorAll('.type-pill.selected')).map(
      (p) => p.textContent.trim()
    );
    const mediumsList = selectedTypes.length ? selectedTypes.join(', ') : 'Synthetic Cinema (Video)';

    const ticketId = `TPG-${Math.floor(100000 + Math.random() * 900000)}-C2PA`;
    const dispatchTime = new Date().toISOString();
    const c2paHash = `c2pa:sha256:${ticketId.toLowerCase()}`;

    const receiptHtml = `
      <div class="receipt-row">
        <span class="receipt-label">Work Order ID:</span>
        <span class="receipt-val glow-text-cyan">${ticketId}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Client / Org:</span>
        <span class="receipt-val">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Selected Mediums:</span>
        <span class="receipt-val" style="color: var(--accent-magenta);">${escapeHtml(mediumsList)}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Budget Tier:</span>
        <span class="receipt-val">${escapeHtml(budget)}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Timeline:</span>
        <span class="receipt-val">${escapeHtml(timeline)}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Timestamp:</span>
        <span class="receipt-val">${dispatchTime}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Provenance Signature:</span>
        <span class="receipt-val glow-text-lime">${c2paHash}</span>
      </div>
      <div style="margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid rgba(255, 255, 255, 0.08);">
        <span class="receipt-label" style="display: block; margin-bottom: 0.25rem;">Prompt Matrix Seed:</span>
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
        const plainReceipt = `THE PORNI GROUP // DISPATCH RECEIPT\nTicket: ${ticketId}\nClient: ${name} (${email})\nMediums: ${mediumsList}\nBudget: ${budget}\nTimeline: ${timeline}\nSignature: ${c2paHash}\nBrief: ${brief}`;
        copyToClipboard(plainReceipt).then(() => {
          showToast('Work order receipt copied to clipboard');
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
    showToast('Work order sealed and dispatched!');
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
