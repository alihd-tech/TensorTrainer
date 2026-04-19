# Danamam - TensorTrainer

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3-00DC82?style=flat-square&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![Universal Sentence Encoder](https://img.shields.io/badge/Universal_Sentence_Encoder-4285F4?style=flat-square&logo=tensorflow&logoColor=white)](https://github.com/tensorflow/tfjs-models/tree/master/universal-sentence-encoder)
[![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-2-00DC82?style=flat-square&logo=nuxt.js&logoColor=white)](https://ui.nuxt.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Pinia](https://img.shields.io/badge/Pinia-ffd859?style=flat-square&logo=pinia&logoColor=000000)](https://pinia.vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](https://opensource.org/licenses/MIT)

**Danamam - TensorTrainer** is a **browser-only trainer** for a small conversational buddy. You add question–answer pairs, train a lightweight classifier on top of sentence embeddings, then chat and optionally **export the trained weights** as JSON.

No server-side AI is required: **TensorFlow.js** and **[Universal Sentence Encoder](https://github.com/tensorflow/tfjs-models/tree/master/universal-sentence-encoder)** run entirely in the client.

---

## Features

- **Q/A training pairs** with add, list, and remove (before training)
- **Semantic encoding** of questions (512-dim embeddings)
- **Small classifier** (dense + dropout + softmax) trained in the browser
- **Chat** after training, with optional **session history** and clear
- **Export** trained model as `danamam-model.json` (architecture, weights, answer list, metadata)
- **Nuxt 3**, **Vue 3** (Composition API), **Nuxt UI**, toasts, and loading states

---

## How it works

1. On load, the app downloads **Universal Sentence Encoder** (first visit may take a while).
2. You enter **Question** and **Answer** fields and click **Add pair**. Repeat; you need **at least two pairs** to enable **Start training**.
3. **Start training** embeds all questions, one-hot encodes answers (one class per **distinct answer string**), and fits a small `tf.sequential` model for 100 epochs with a validation split.
4. After training, use **Chat with your buddy**; the app embeds your message and picks the softmax argmax over your answer set.
5. **Download model (JSON)** saves everything needed to reconstruct the buddy offline (you would still need compatible loader code and the USE model for inference).

This is **answer selection**, not open-ended text generation: replies always come from answers you trained on.

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Framework | [Nuxt 3](https://nuxt.com/) |
| UI | [Nuxt UI](https://ui.nuxt.com/) + Tailwind CSS |
| ML | [TensorFlow.js](https://www.tensorflow.org/js), [@tensorflow-models/universal-sentence-encoder](https://www.npmjs.com/package/@tensorflow-models/universal-sentence-encoder) |
| State | [Pinia](https://pinia.vuejs.org/) via `@pinia/nuxt` (ready for stores; main flow lives in `app.vue`) |

---

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- A **modern desktop browser** (training and embedding are CPU/WebGPU dependent; large batches can feel slow on low-end devices)

---

## Installation

```bash
git clone <your-repo-url> danamam-tensor-trainer
cd danamam-tensor-trainer
npm install
```

If you use **pnpm**:

```bash
pnpm install
```

---

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The main UI is defined in **`app.vue`** (root app component).

---

## Build and preview

```bash
npm run build
npm run preview
```

---

## Static hosting

```bash
npm run generate
```

Output can be deployed to static hosts (for example Netlify, Cloudflare Pages, GitHub Pages, or Vercel). Ensure hosting supports **client-side** WASM and JavaScript assets used by TensorFlow.js and CDN fetches for the sentence encoder.

---

## Export format (`danamam-model.json`)

The download includes:

- **`architecture`** — `model.toJSON()` from TensorFlow.js  
- **`weights`** — serialized weight tensors  
- **`answers`** — ordered list of unique answer strings (output index alignment)  
- **`metadata`** — for example ISO timestamp and pair count  

Importing this file back into an app is **not** implemented in this repository; the export is for backup, experimentation, or a custom loader you build.

---

## Project layout

```
app.vue              # Main trainer + chat UI and TF.js logic
nuxt.config.ts       # Nuxt config (SSR noExternal for TF packages)
assets/css/main.css  # Tailwind entry
public/logo.svg      # Brand logo
tailwind.config.js   # Theme extensions (primary / secondary)
package.json
```

There is no `pages/index.vue` in this project; routing defaults to the root **`app.vue`** experience.

---

## Limitations

- Replies are limited to **answers seen in training** (classification over your answer set).
- **Minimum two** Q/A pairs.
- **Distinct answers** define the number of classes; duplicate answer text across questions shares one class.
- Large datasets or weak hardware can make **training and first encoder load** slow or memory-heavy.

---

## Possible extensions

- Confidence threshold and an “I don’t know” bucket  
- Persist pairs in `localStorage`  
- Import previously exported JSON for inference-only mode  
- Dataset editor (CSV import, reorder, bulk delete)

---

## License

MIT License

---

## One-line pitch

**Shape a tiny, personal responder in the browser—no API keys, no backend ML stack—just pairs, embeddings, and a small trainable head.**
