<template>
  <div>
    <Head>
      <Title>Danamam - Buddy Maker</Title>
      <Meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <div class="min-h-screen bg-dark p-4" dir="rtl">
      <div class="container mx-auto px-4">
        <div class="text-center flex justify-center items-center">
          <img src="/logo.svg" width="60" alt="logo" class="drop-shadow-lg"/>
        </div>
       </div>

      <main class="container mx-auto p-6">
        <!-- Training Section -->
        <div class="mb-8   rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
          <div v-if="!trained">
            <div class="grid gap-6 mb-6">
              <div class="space-y-2">
                <label class="block text-lg font-medium text-primary-700">Q :</label>
                <UTextarea
                    v-model="newQuestion"
                    placeholder="Add A Question"
                    class="w-full shadow-sm"
                />
              </div>
              <div class="space-y-2">
                <label class="block text-lg font-medium text-primary-700">A :</label>
                <UTextarea
                    v-model="newAnswer"
                    placeholder="Define The Answer"
                    class="w-full shadow-sm"
                />
              </div>
            </div>

            <div class="flex gap-4">
              <UButton
                  @click="addTrainingPair"
                  color="primary"
                  size="lg"
                  icon="i-heroicons-plus"
                  class="shadow-md hover:shadow-lg transition-all"
              >
                Add Pair
              </UButton>
              <UButton
                  @click="trainModel"
                  :disabled="trainingPairs.length < 2"
                  variant="soft"
                  color="primary"
                  size="lg"
                  class="shadow-md hover:shadow-lg transition-all"
                  :class="{ 'opacity-50 cursor-not-allowed': trainingPairs.length < 2 }"
              >
                Start Training
              </UButton>
            </div>
          </div>

          <!-- Export Model Button -->
          <div v-if="trained" class="mt-6">
            <UButton
                @click="exportModel"
                color="primary"
                size="lg"
                icon="i-heroicons-arrow-down-tray"
                class="shadow-md hover:shadow-lg transition-all"
            >
              Download The Blackbox
            </UButton>
          </div>

          <!-- Training Pairs Display -->
          <div v-if="trainingPairs.length > 0" class="mt-10">
            <h3 class="text-xl font-bold mb-6 text-primary-800 flex items-center gap-2">
              <span>Pairs</span>
              <UBadge :label="trainingPairs.length.toString()" color="primary" class="text-sm" />
            </h3>
            <div class="space-y-4">
              <UCard
                  v-for="(pair, index) in trainingPairs"
                  :key="index"
                  class="  transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <div class="space-y-3">
                  <div>
                    <span class="text-primary-700 font-semibold">Q:</span>
                    <p class="mt-1">{{ pair.question }}</p>
                  </div>
                  <div>
                    <span class="text-primary-700 font-semibold">A:</span>
                    <p class="mt-1">{{ pair.answer }}</p>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>

        <!-- Chat Interface -->
        <div v-if="trained" class="mb-8  rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
          <h2 class="text-2xl font-bold mb-6 text-primary-600">Talk To Buddy</h2>
          <div class="flex gap-3">
            <UInput
                v-model="userQuestion"
                placeholder="What's On Your Mind"
                @keyup.enter="askQuestion"
                class="flex-1 shadow-sm"
                size="lg"
            />
            <UButton
                @click="askQuestion"
                color="primary"
                icon="i-heroicons-paper-airplane"
                size="lg"
                class="shadow-md hover:shadow-lg transition-all"
            >
              Submit
            </UButton>
          </div>
        </div>

        <!-- Chat History -->
        <div v-if="chatHistory.length > 0" class="mb-8  rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-90">
          <h2 class="text-2xl font-bold mb-6 text-primary-700">History Log</h2>
          <div class="space-y-4">
            <UCard
                v-for="(message, index) in chatHistory"
                :key="index"
                :ui="{
                  base: message.type === 'user'
                    ? 'bg-primary-50 shadow-md hover:shadow-lg transition-all duration-200'
                    : 'bg-secondary-50 shadow-md hover:shadow-lg transition-all duration-200',
                  ring: ''
                }"
            >
              <div class="space-y-2">
                <p class="font-bold" :class="message.type === 'user' ? 'text-primary-700' : 'text-secondary-700'">
                  {{ message.type === 'user' ? 'You' : 'The Thing' }}:
                </p>
                <p class="text-gray-200">{{ message.text }}</p>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Loading State -->
        <UModal v-model="loading">
          <UCard class="p-6">
            <div class="text-center">
              <UProgress animation="carousel" class="mb-4" />
              <p class="text-lg text-primary-700">{{ loadingMessage }}</p>
            </div>
          </UCard>
        </UModal>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as tf from '@tensorflow/tfjs'
import * as use from '@tensorflow-models/universal-sentence-encoder'

const trained = ref(false)
const loading = ref(false)
const loadingMessage = ref('')
const newQuestion = ref('')
const newAnswer = ref('')
const userQuestion = ref('')
const trainingPairs = ref([])
const chatHistory = ref([])

let encoder = null
let model = null

// Initialize the Universal Sentence Encoder
onMounted(async () => {
  loading.value = true
  loadingMessage.value = 'Loading The Model'
  encoder = await use.load()
  loading.value = false
})

// Add a new training pair
const addTrainingPair = () => {
  if (newQuestion.value.trim() && newAnswer.value.trim()) {
    trainingPairs.value.push({
      question: newQuestion.value.trim(),
      answer: newAnswer.value.trim()
    })
    newQuestion.value = ''
    newAnswer.value = ''
  }
}

// Train the model
const trainModel = async () => {
  if (trainingPairs.value.length < 2) return

  loading.value = true
  loadingMessage.value = 'Loading In Progress'

  try {
    // Encode all questions
    const questions = trainingPairs.value.map(pair => pair.question)
    const questionEmbeddings = await encoder.embed(questions)

    // Create one-hot encoded answers
    const uniqueAnswers = [...new Set(trainingPairs.value.map(pair => pair.answer))]
    const answerMap = Object.fromEntries(uniqueAnswers.map((answer, i) => [answer, i]))
    const answers = tf.oneHot(
        trainingPairs.value.map(pair => answerMap[pair.answer]),
        uniqueAnswers.length
    )

    // Create and train the model
    loadingMessage.value = 'Training The Model ...'
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
        onEpochEnd: (epoch, logs) => {
          loadingMessage.value = `Learning ... Cycling ${epoch + 1}/100`
        }
      }
    })

    // Save answer mapping for predictions
    model.answers = uniqueAnswers
    trained.value = true
  } catch (error) {
    console.error('Error training model:', error)
  } finally {
    loading.value = false
  }
}

// Export the trained model
const exportModel = async () => {
  if (!model) return

  loading.value = true
  loadingMessage.value = 'Getting Ready For Output'

  try {
    // Save the model architecture and weights
    const modelJson = model.toJSON()
    const weights = await Promise.all(
        model.weights.map(async w => ({
          name: w.name,
          data: Array.from(await w.val.data())
        }))
    )

    // Create a complete model package
    const modelPackage = {
      architecture: modelJson,
      weights: weights,
      answers: model.answers,
      metadata: {
        created: new Date().toISOString(),
        trainingPairs: trainingPairs.value.length
      }
    }

    // Convert to JSON and create download link
    const blob = new Blob([JSON.stringify(modelPackage)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'danamam-model.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting model:', error)
  }

  loading.value = false
}

// Make a prediction
const askQuestion = async () => {
  if (!userQuestion.value.trim() || !model || !encoder) return

  const question = userQuestion.value.trim()
  chatHistory.value.push({ type: 'user', text: question })

  loading.value = true
  loadingMessage.value = 'Analyzing'

  try {
    // Encode the question and make prediction
    const embedding = await encoder.embed([question])
    const prediction = model.predict(embedding)
    const answerIndex = (await prediction.argMax(1).data())[0]
    const answer = model.answers[answerIndex]

    chatHistory.value.push({ type: 'bot', text: answer })
    userQuestion.value = ''

    // Cleanup tensors
    embedding.dispose()
    prediction.dispose()
  } catch (error) {
    console.error('Error making prediction:', error)
    chatHistory.value.push({ type: 'bot', text: 'Shit Hitted The Fan' })
  } finally {
    loading.value = false
  }
}
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
}
 
</style>