<template>
  <div>
    <Head>
      <Title>Danamam — Buddy Maker</Title>
      <Meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta
        name="description"
        content="Train a small browser-based buddy: Q&A pairs, TensorFlow.js, Universal Sentence Encoder."
      />
    </Head>

    <UNotifications />

    <div class="app-shell min-h-screen p-4 sm:p-6 lg:p-8">
      <div class="app-gradient" aria-hidden="true" />

      <div class="relative z-10 mx-auto max-w-3xl">
        <!-- Hero -->
        <header class="mb-10 text-center">
          <div class="mb-6 flex justify-center">
            <div class="logo-ring rounded-2xl p-3 shadow-2xl">
              <img src="/logo.svg" width="64" height="64" alt="Danamam logo" class="drop-shadow-md" />
            </div>
          </div>
          <p class="mb-2 text-sm font-medium uppercase tracking-widest text-primary-300/90">
            TensorFlow.js · in your browser
          </p>
          <h1 class="hero-title mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Danamam
          </h1>
          <p class="mx-auto max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Teach a lightweight buddy from your own Q&amp;A pairs: questions become sentence embeddings, then a small classifier picks the closest answer after quick on-device training.
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-2">
            <UBadge color="primary" variant="subtle" size="md">Universal Sentence Encoder</UBadge>
            <UBadge color="gray" variant="subtle" size="md">Private — no server</UBadge>
          </div>
        </header>

        <main class="flex flex-col gap-8">
          <!-- Encoder status -->
          <UAlert
            v-if="encoderReady"
            icon="i-heroicons-cpu-chip-20-solid"
            color="emerald"
            variant="soft"
            title="Ready to train"
            description="The sentence encoder is loaded. Add question and answer pairs to get started."
          />
          <UAlert
            v-else-if="!loading"
            icon="i-heroicons-exclamation-triangle-20-solid"
            color="amber"
            variant="soft"
            title="Model failed to load"
            description="Reload the page or check your connection."
          />

          <!-- How it works -->
          <section class="panel rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl sm:p-10">
            <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 class="text-xl font-bold text-white sm:text-2xl">How it works</h2>
                <p class="mt-1 max-w-2xl text-sm text-slate-400">
                  A short walkthrough of the flow and the idea behind it — kept simple.
                </p>
              </div>
            </div>

            <ol class="mb-8 space-y-4">
              <li
                v-for="(step, i) in quickSteps"
                :key="i"
                class="flex gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:border-primary-500/20"
              >
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/20 text-sm font-bold text-primary-200"
                >
                  {{ i + 1 }}
                </span>
                <div>
                  <p class="font-semibold text-slate-100">{{ step.title }}</p>
                  <p class="mt-1 text-sm leading-relaxed text-slate-400">{{ step.body }}</p>
                </div>
              </li>
            </ol>

            <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              More detail
            </h3>
            <UAccordion :items="guideAccordionItems" multiple />
          </section>

          <!-- Training -->
          <section class="panel rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl sm:p-10">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-white sm:text-2xl">Train your buddy</h2>
              <p class="mt-1 text-sm text-slate-400">
                Add a question and the answer you want tied to it. Repeat with different phrasings for the same intent to improve generalization.
              </p>
            </div>

            <div v-if="!trained">
              <div class="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div class="mb-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Pair progress</span>
                  <span>{{ trainingPairs.length }} pair(s) · minimum 2</span>
                </div>
                <UProgress
                  :value="Math.min(100, (trainingPairs.length / 2) * 100)"
                  color="primary"
                  size="sm"
                />
                <p v-if="trainingPairs.length < 2" class="mt-2 text-xs text-amber-200/90">
                  Add at least two pairs to enable Start training.
                </p>
                <p v-else class="mt-2 text-xs text-emerald-200/90">You can start training.</p>
              </div>

              <div class="grid gap-6 mb-6">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-primary-200" for="q-input">Question</label>
                  <UTextarea
                    id="q-input"
                    v-model="newQuestion"
                    placeholder="e.g. How are you?"
                    :rows="3"
                    class="w-full"
                    size="lg"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-primary-200" for="a-input">Answer</label>
                  <UTextarea
                    id="a-input"
                    v-model="newAnswer"
                    placeholder="The reply you want the buddy to give"
                    :rows="3"
                    class="w-full"
                    size="lg"
                  />
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <UButton
                  color="primary"
                  size="lg"
                  icon="i-heroicons-plus-circle-20-solid"
                  class="shadow-lg transition-shadow hover:shadow-primary-500/25"
                  @click="addTrainingPair"
                >
                  Add pair
                </UButton>
                <UButton
                  :disabled="!canTrain"
                  variant="soft"
                  color="primary"
                  size="lg"
                  icon="i-heroicons-play-20-solid"
                  :class="{ 'opacity-50': !canTrain }"
                  class="shadow-md"
                  @click="trainModel"
                >
                  Start training
                </UButton>
              </div>
            </div>

            <div v-else class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p class="text-sm font-medium text-emerald-100">Training complete</p>
              <p class="mt-1 text-xs text-emerald-200/80">
                Chat below or export the model as JSON (architecture + weights + answers).
              </p>
              <UButton
                class="mt-4 shadow-md"
                color="primary"
                size="lg"
                icon="i-heroicons-arrow-down-tray-20-solid"
                @click="exportModel"
              >
                Download model (JSON)
              </UButton>
            </div>

            <!-- Pairs list -->
            <div v-if="trainingPairs.length > 0" class="mt-10">
              <div class="mb-4 flex items-center justify-between gap-3">
                <h3 class="flex items-center gap-2 text-lg font-bold text-slate-100">
                  Saved pairs
                  <UBadge :label="String(trainingPairs.length)" color="primary" variant="subtle" />
                </h3>
              </div>

              <div class="space-y-3">
                <UCard
                  v-for="(pair, index) in trainingPairs"
                  :key="index"
                  :ui="{
                    base: 'border border-white/10 bg-white/[0.03] overflow-hidden',
                    ring: '',
                    shadow: 'shadow-md'
                  }"
                >
                  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0 flex-1 space-y-3">
                      <div>
                        <span class="text-xs font-semibold uppercase tracking-wide text-primary-300">Q</span>
                        <p class="mt-1 whitespace-pre-wrap text-slate-200">{{ pair.question }}</p>
                      </div>
                      <div>
                        <span class="text-xs font-semibold uppercase tracking-wide text-secondary-300">A</span>
                        <p class="mt-1 whitespace-pre-wrap text-slate-200">{{ pair.answer }}</p>
                      </div>
                    </div>
                    <UButton
                      color="gray"
                      variant="ghost"
                      icon="i-heroicons-trash-20-solid"
                      size="sm"
                      :disabled="trained"
                      :title="trained ? 'Cannot remove pairs after training' : 'Remove pair'"
                      @click="removePair(index)"
                    />
                  </div>
                </UCard>
              </div>
            </div>

            <div
              v-else
              class="mt-8 flex flex-col items-center rounded-xl border border-dashed border-white/15 py-12 text-center"
            >
              <UIcon name="i-heroicons-inbox-stack-20-solid" class="mb-3 h-10 w-10 text-slate-600" />
              <p class="text-sm font-medium text-slate-400">No pairs yet</p>
              <p class="mt-1 max-w-xs text-xs text-slate-500">Enter a question and answer, then click Add pair.</p>
            </div>
          </section>

          <!-- Chat -->
          <section
            v-if="trained"
            class="panel rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl sm:p-10"
          >
            <h2 class="mb-2 text-xl font-bold text-white sm:text-2xl">Chat with your buddy</h2>
            <p class="mb-6 text-sm text-slate-400">
              Phrase questions similarly to your training examples. The system matches meaning, not only exact text.
            </p>
            <div class="flex flex-col gap-3 sm:flex-row">
              <UInput
                v-model="userQuestion"
                placeholder="What do you want to ask?"
                size="lg"
                class="min-w-0 flex-1"
                @keyup.enter="askQuestion"
              />
              <UButton
                color="primary"
                size="lg"
                icon="i-heroicons-paper-airplane-20-solid"
                class="shrink-0 shadow-md sm:w-auto"
                @click="askQuestion"
              >
                Send
              </UButton>
            </div>
          </section>

          <!-- History -->
          <section
            v-if="chatHistory.length > 0"
            class="panel rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl sm:p-10"
          >
            <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-xl font-bold text-white sm:text-2xl">Chat history</h2>
                <p class="mt-1 text-sm text-slate-400">Recent questions and replies in this session.</p>
              </div>
              <UButton color="gray" variant="soft" size="sm" icon="i-heroicons-x-mark-20-solid" @click="clearHistory">
                Clear history
              </UButton>
            </div>
            <div class="space-y-3">
              <div
                v-for="(message, index) in chatHistory"
                :key="index"
                class="chat-bubble rounded-2xl border p-4"
                :class="
                  message.type === 'user'
                    ? 'border-primary-500/25 bg-primary-500/10'
                    : 'border-secondary-500/25 bg-secondary-500/10'
                "
              >
                <p
                  class="mb-2 text-xs font-bold uppercase tracking-wide"
                  :class="message.type === 'user' ? 'text-primary-300' : 'text-secondary-300'"
                >
                  {{ message.type === 'user' ? 'You' : 'Buddy' }}
                </p>
                <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{{ message.text }}</p>
              </div>
            </div>
          </section>
        </main>

        <footer class="mt-12 pb-8 text-center text-xs text-slate-500">
          Danamam — local training with
          <a
            class="text-primary-400 underline-offset-2 hover:underline"
            href="https://www.tensorflow.org/js"
            target="_blank"
            rel="noopener noreferrer"
          >TensorFlow.js</a>
          and
          <a
            class="text-primary-400 underline-offset-2 hover:underline"
            href="https://github.com/tensorflow/tfjs-models/tree/master/universal-sentence-encoder"
            target="_blank"
            rel="noopener noreferrer"
          >Universal Sentence Encoder</a>.
        </footer>
      </div>

      <UModal v-model="loading" :prevent-close="true">
        <UCard class="p-6 sm:p-8">
          <div class="text-center">
            <UProgress animation="carousel" class="mb-4" />
            <p class="text-base font-medium text-slate-200">{{ loadingMessage }}</p>
            <p class="mt-2 text-xs text-slate-500">Loading or training may take tens of seconds depending on your device.</p>
          </div>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const toast = useToast()

/** Set in onMounted via dynamic import so SSR / Node never initializes TF.js. */
let tf = null

const ENCODER_LOAD_TIMEOUT_MS = 120_000

async function withTimeout(promise, ms, message) {
  let id
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        id = setTimeout(() => reject(new Error(message)), ms)
      })
    ])
  } finally {
    clearTimeout(id)
  }
}

const encoderReady = ref(false)
const trained = ref(false)
const loading = ref(false)
const loadingMessage = ref('')
const newQuestion = ref('')
const newAnswer = ref('')
const userQuestion = ref('')
const trainingPairs = ref([])
const chatHistory = ref([])

const canTrain = computed(() => trainingPairs.value.length >= 2)

const quickSteps = [
  {
    title: 'Load the sentence encoder',
    body: 'Universal Sentence Encoder runs in the browser and turns each question into a 512-dimensional vector that captures meaning.'
  },
  {
    title: 'Collect question / answer pairs',
    body: 'Each pair teaches the buddy: when a question is similar to this, return this answer. More examples improve separation between answers.'
  },
  {
    title: 'Train a classifier head',
    body: 'A small network (Dense + Dropout + Softmax) learns to map the question vector to one of the unique answers in your data — it selects an answer, it does not freely generate text.'
  },
  {
    title: 'Chat and export',
    body: 'After training you can ask questions and get the closest answer. Export saves weights, architecture, and the answer list to a JSON file.'
  }
]

const guideAccordionItems = [
  {
    label: 'Why at least two pairs?',
    content:
      'Learning needs more than one class or enough examples to tie vectors to answers. With only one pair there is not enough structure to generalize.'
  },
  {
    label: 'What are “unique answers”?',
    content:
      'If you reuse the same answer for several different questions, it counts as one class. The model output size equals the number of distinct answer strings you used.'
  },
  {
    label: 'Does it work in multiple languages?',
    content:
      'The encoder is multilingual; quality depends on how you phrase training data. Use phrasings close to what end users will type.'
  },
  {
    label: 'Does data leave my device?',
    content:
      'No — load, train, and inference all run in the browser. Export only happens when you click download.'
  }
]

let encoder = null
let model = null

onMounted(async () => {
  loading.value = true
  loadingMessage.value = 'Loading TensorFlow.js…'
  try {
    tf = await import('@tensorflow/tfjs')
    await tf.ready()
    loadingMessage.value = 'Loading sentence encoder…'
    const useEncoder = await import('@tensorflow-models/universal-sentence-encoder')
    encoder = await withTimeout(
      useEncoder.load(),
      ENCODER_LOAD_TIMEOUT_MS,
      `Encoder did not finish loading within ${ENCODER_LOAD_TIMEOUT_MS / 1000}s`
    )
    encoderReady.value = true
  } catch (e) {
    console.error(e)
    encoderReady.value = false
    encoder = null
    toast.add({
      title: 'Could not load encoder',
      description: e instanceof Error ? e.message : 'Check your network or try again.',
      color: 'amber',
      timeout: 8000
    })
  } finally {
    loading.value = false
  }
})

const addTrainingPair = () => {
  const q = newQuestion.value.trim()
  const a = newAnswer.value.trim()
  if (!q || !a) {
    toast.add({
      title: 'Missing fields',
      description: 'Enter both a question and an answer before adding.',
      color: 'amber'
    })
    return
  }
  trainingPairs.value.push({ question: q, answer: a })
  newQuestion.value = ''
  newAnswer.value = ''
  toast.add({ title: 'Pair added', description: 'New pair is in the list.', color: 'green', timeout: 2000 })
}

const removePair = (index) => {
  if (trained.value) return
  trainingPairs.value.splice(index, 1)
}

const clearHistory = () => {
  chatHistory.value = []
}

const trainModel = async () => {
  if (trainingPairs.value.length < 2 || !encoder || !tf) return

  loading.value = true
  loadingMessage.value = 'Preparing data…'

  try {
    const questions = trainingPairs.value.map((pair) => pair.question)
    const questionEmbeddings = await encoder.embed(questions)

    const uniqueAnswers = [...new Set(trainingPairs.value.map((pair) => pair.answer))]
    const answerMap = Object.fromEntries(uniqueAnswers.map((answer, i) => [answer, i]))
    const answers = tf.oneHot(
      trainingPairs.value.map((pair) => answerMap[pair.answer]),
      uniqueAnswers.length
    )

    loadingMessage.value = 'Training model…'
    model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 128, activation: 'relu', inputShape: [512] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: uniqueAnswers.length, activation: 'softmax' })
      ]
    })

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })

    await model.fit(questionEmbeddings, answers, {
      epochs: 100,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch) => {
          loadingMessage.value = `Learning… epoch ${epoch + 1} / 100`
        }
      }
    })

    model.answers = uniqueAnswers
    trained.value = true
    toast.add({
      title: 'Training complete',
      description: 'You can chat or export the model.',
      color: 'green'
    })
  } catch (error) {
    console.error('Error training model:', error)
    toast.add({
      title: 'Training error',
      description: 'See the browser console for details.',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

const exportModel = async () => {
  if (!model) return

  loading.value = true
  loadingMessage.value = 'Preparing file…'

  try {
    const modelJson = model.toJSON()
    const weights = await Promise.all(
      model.weights.map(async (w) => ({
        name: w.name,
        data: Array.from(await w.val.data())
      }))
    )

    const modelPackage = {
      architecture: modelJson,
      weights,
      answers: model.answers,
      metadata: {
        created: new Date().toISOString(),
        trainingPairs: trainingPairs.value.length
      }
    }

    const blob = new Blob([JSON.stringify(modelPackage)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'danamam-model.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.add({ title: 'Downloaded', description: 'danamam-model.json', color: 'green', timeout: 2500 })
  } catch (error) {
    console.error('Error exporting model:', error)
    toast.add({ title: 'Export failed', description: 'Please try again.', color: 'red' })
  }

  loading.value = false
}

const askQuestion = async () => {
  if (!userQuestion.value.trim() || !model || !encoder) return

  const question = userQuestion.value.trim()
  chatHistory.value.push({ type: 'user', text: question })

  loading.value = true
  loadingMessage.value = 'Analyzing…'

  try {
    const embedding = await encoder.embed([question])
    const prediction = model.predict(embedding)
    const answerIndex = (await prediction.argMax(1).data())[0]
    const answer = model.answers[answerIndex]

    chatHistory.value.push({ type: 'bot', text: answer })
    userQuestion.value = ''

    embedding.dispose()
    prediction.dispose()
  } catch (error) {
    console.error('Error making prediction:', error)
    chatHistory.value.push({
      type: 'bot',
      text: 'Could not get a reply. Check the console or try again.'
    })
    toast.add({ title: 'Inference error', color: 'red' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.app-shell {
  position: relative;
  background: #0a0f1a;
  color: #e2e8f0;
}

.app-gradient {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(41, 144, 255, 0.22), transparent),
    radial-gradient(ellipse 60% 40% at 100% 50%, rgba(82, 133, 181, 0.12), transparent),
    radial-gradient(ellipse 50% 30% at 0% 80%, rgba(26, 113, 242, 0.1), transparent);
  z-index: 0;
}

.logo-ring {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
}

.hero-title {
  background: linear-gradient(135deg, #fff 0%, #8accff 55%, #52b1ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.panel {
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(16px);
}

.chat-bubble {
  backdrop-filter: blur(8px);
}
</style>
