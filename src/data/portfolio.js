export const portfolioItems = [
  {
    id: "TPG-CINEMA-001",
    title: "TEMPORAL COHERENCE: DYNAMIC ANATOMY BENCHMARK",
    category: "cinema",
    categoryLabel: "Synthetic Cinema",
    image: "./assets/media/synthetic_cinema_megacity.jpg",
    aspect: "16:9",
    modelBadge: "KLING 1.5 + RIG",
    promptSnippet: "Extended sequence temporal coherence stress-test, dynamic camera motion with zero anatomical hallucination or frame drift...",
    positivePrompt: "Cinematographic wide anamorphic shot from an anatomical simulation research sequence, surreal zero-gravity cybernetic metropolis with deformable soft-tissue structures, 35mm anamorphic lens flare, Blade Runner 2049 aesthetic, volumetric fog and mist, 8k resolution, photorealistic",
    negativePrompt: "lowres, cartoon, plastic, overexposed, low detail, jitter, temporal blur, artifacts, oversaturated, watermark, signature",
    specs: {
      model: "Kling 1.5 Pro + Deformable Rig LoRA",
      seed: "8849102941",
      steps: "50 Steps",
      cfg: "7.0",
      sampler: "FlowMatch Euler (Temporal Locked)",
      resolution: "3840 x 2160 (Native Neural 4K)",
      c2paHash: "c2pa:sha256:7f9a12b84d93021ef9a33bb71900aef1c9b634827011082"
    },
    audioSample: false
  },
  {
    id: "TPG-STILL-001",
    title: "DEFORMABLE LATTICE: SOFT-TISSUE VOLUMETRIC STRESS",
    category: "stills",
    categoryLabel: "Neural Stills",
    image: "./assets/media/hero_cyber_android.jpg",
    aspect: "16:9",
    modelBadge: "FLUX.1 [DEV]",
    promptSnippet: "Mass-spring soft-body simulation integrated with neural rendering, simulating realistic biological tissue deformation...",
    positivePrompt: "Cinematic 8k photorealistic sci-fi scene, ultra sleek biomechanical humanoid android draped in iridescent obsidian silk, bathed in volumetric neon magenta and cyan rim light, minimalist brutalist architectural backdrop, octane render, Ray Traced Reflections, Hasselblad 100mm f2.8",
    negativePrompt: "amateur, bad anatomy, deformed limbs, floating artifacts, noise, blurry, dull lighting, lowres",
    specs: {
      model: "Flux.1 [dev] + High-Rank LoRA v4.2",
      seed: "4920194812",
      steps: "40 Steps",
      cfg: "3.5",
      sampler: "Euler Ancestral / Simple",
      resolution: "3840 x 2160 (ESRGAN-Ultra Upscaled)",
      c2paHash: "c2pa:sha256:1a84f39cd91039bc0283f619902047f884210a12e3458"
    },
    audioSample: false
  },
  {
    id: "TPG-STILL-002",
    title: "EPIDERMAL SUBSURFACE: ANATOMICAL ACCURACY TEST",
    category: "stills",
    categoryLabel: "Neural Stills",
    image: "./assets/media/neural_still_couture.jpg",
    aspect: "3:2",
    modelBadge: "MIDJOURNEY V6.1",
    promptSnippet: "High-density dermal elasticity test, sub-dermal scattering with accurate anatomical proportions and zero visual artifacts...",
    positivePrompt: "Ultra-luxurious avant-garde haute couture fashion editorial, synthetic model with porcelain skin and crystalline gold nanofiber embellishments, wearing sculptural obsidian dress, studio lighting, hyper-detailed texture, Vogue Runway 2026, Hasselblad 8k photo",
    negativePrompt: "cgi looking, plastic skin, doll face, flat lighting, watermark, poorly rendered hands, blurry",
    specs: {
      model: "Midjourney v6.1 (Fine-tuned Fashion Matrix)",
      seed: "3019847192",
      steps: "60 Steps",
      cfg: "6.0",
      sampler: "Neural Diffusion v6.1",
      resolution: "3000 x 2000 (3:2 Aspect Ratio)",
      c2paHash: "c2pa:sha256:9c84e11fa3b019823f668201a0bc19207e40938210492"
    },
    audioSample: false
  },
  {
    id: "TPG-PERSONA-001",
    title: "VALKYRIE-09: SOVEREIGN SYNTHETIC HUMAN RIG",
    category: "personas",
    categoryLabel: "Virtual Personas",
    image: "./assets/media/persona_valkyrie_09.jpg",
    aspect: "3:4",
    modelBadge: "LIVEPORTRAIT + FLUX",
    promptSnippet: "High-fidelity synthetic character generation with neural rigging, facial dynamics and temporal soft-tissue consistency...",
    positivePrompt: "Close-up portrait of an ultra-photorealistic synthetic AI virtual influencer persona, named VALKYRIE-09, piercing bio-luminescent eyes, sleek titanium subcutaneous cybernetic cheek implants, wet slicked-back platinum hair, cinematic studio rim lighting with cyan and magenta glows, 8k beauty editorial",
    negativePrompt: "uncanny valley, plastic sheen, asymmetric eyes, low resolution, bad skin texture, artifacts",
    specs: {
      model: "Flux.1 Latent + LivePortrait Neural Rigging",
      seed: "5910283411",
      steps: "45 Steps",
      cfg: "4.0",
      sampler: "DPM++ 2M SDE Karras",
      resolution: "2400 x 3200 (Portrait 3:4)",
      c2paHash: "c2pa:sha256:3e4b78901cfa4982bb6170293da82019ff21038914830"
    },
    audioSample: false
  },
  {
    id: "TPG-AUDIO-001",
    title: "SYNAPSE HARMONICS: ACOUSTIC BIOPHYSICS",
    category: "acoustic",
    categoryLabel: "Acoustic Synthesis",
    image: "./assets/media/acoustic_frequency_matrix.jpg",
    aspect: "16:9",
    modelBadge: "ELEVENLABS + UDIO",
    promptSnippet: "Neural acoustic frequency matrix, spatial sound design paired with simulated biomechanical resonances...",
    positivePrompt: "Abstract 3D soundwave data sculpture made of luminous glass filaments, neon cyan and violet particulate frequencies vibrating in zero-gravity obsidian void, cinematic depth of field, Raytraced reflections, hyper-detailed acoustic resonance visualization",
    negativePrompt: "flat 2d, clip art, low dynamic range, compression artifacts, dull gradient",
    specs: {
      model: "ElevenLabs v3 Neural Vocalizer + Udio 1.5 Spatial Engine",
      seed: "4481029411",
      steps: "64 Steps",
      cfg: "7.5",
      sampler: "Neural Waveform Diffusion 48kHz/24-bit",
      resolution: "3840 x 2160 (Spatial Wave Vector)",
      c2paHash: "c2pa:sha256:fa9012bb45601938ee1820491823791a84f39cd91039b"
    },
    audioSample: true
  },
  {
    id: "TPG-STILL-003",
    title: "XENO-BIOMORPH: ORGANIC ELASTICITY MATRIX",
    category: "stills",
    categoryLabel: "Neural Stills",
    image: "./assets/media/neural_still_biomorph.jpg",
    aspect: "3:2",
    modelBadge: "FLUX.1 BIOMORPH",
    promptSnippet: "Deformable organic structures testing non-linear elastic boundary conditions under simulated physical forces...",
    positivePrompt: "Hyper-detailed macro photograph of a synthetic bioluminescent crystal organism blooming with glowing lime-green and cyan filaments, alien botany, deep black background, Octane 8k render, photorealistic macro lens",
    negativePrompt: "blurry foreground, out of focus, pixelation, muddy colors, cartoon render, distorted macro",
    specs: {
      model: "Flux.1 [dev] + Organic Lattice LoRA",
      seed: "9019284712",
      steps: "52 Steps",
      cfg: "4.8",
      sampler: "Euler Simple (4-step latent Denoise)",
      resolution: "3000 x 2000 (3:2 Macro)",
      c2paHash: "c2pa:sha256:883910cbe7729103bf478120c90918efda1083921b72a"
    },
    audioSample: false
  },
  {
    id: "TPG-PERSONA-002",
    title: "AGENT CHRONOS: SKELETAL-TO-DEFORMABLE RETARGETING",
    category: "personas",
    categoryLabel: "Virtual Personas",
    image: "./assets/media/persona_agent_chronos.jpg",
    aspect: "3:4",
    modelBadge: "SD 3.5 LARGE",
    promptSnippet: "Hybrid physical simulation coupling rigid bone kinematic joints with soft-body deformable tissue mesh...",
    positivePrompt: "Sleek autonomous AI robotic agent, polished dark chrome and carbon fiber chassis, subtle amber-gold sensor optical band, high fashion studio portrait, minimalist luxury aesthetic, 8k resolution, Hasselblad lighting",
    negativePrompt: "scratched, toy robot, retro clunky, low poly, noisy background, over-saturated, blurry",
    specs: {
      model: "Stable Diffusion 3.5 Large (Titanium LoRA Checkpoint)",
      seed: "7102948291",
      steps: "38 Steps",
      cfg: "5.5",
      sampler: "UniPC 2M Multistep",
      resolution: "2400 x 3200 (Portrait 3:4)",
      c2paHash: "c2pa:sha256:d891b2c41938fe102837bc901a84f39cd91039bc0283f"
    },
    audioSample: false
  }
];
