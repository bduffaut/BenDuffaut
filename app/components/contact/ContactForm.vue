<script setup lang="ts">
import { Check, LoaderCircle, Send } from 'lucide-vue-next'

const props = defineProps<{ email: string }>()
const { turnstileSiteKey } = useRuntimeConfig().public

const form = reactive({ name: '', email: '', company: '', message: '', website: '' })
const errors = ref<ContactErrors>({})
const state = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const failure = ref('')
const startedAt = ref(0)
const turnstileToken = ref('')
const turnstileEl = useTemplateRef<HTMLElement>('turnstile')

onMounted(() => {
  startedAt.value = Date.now()
  if (turnstileSiteKey) mountTurnstile()
})

// Load Turnstile only when it's configured and this form is on screen
function mountTurnstile() {
  const render = () => {
    const ts = (window as TurnstileWindow).turnstile
    if (!ts || !turnstileEl.value) return
    ts.render(turnstileEl.value, {
      sitekey: turnstileSiteKey,
      theme: 'dark',
      callback: (token: string) => (turnstileToken.value = token),
    })
  }
  if ((window as TurnstileWindow).turnstile) return render()
  const script = document.createElement('script')
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
  script.async = true
  script.onload = render
  document.head.append(script)
}

type TurnstileWindow = Window & {
  turnstile?: { render: (el: HTMLElement, options: Record<string, unknown>) => void; reset: () => void }
}

async function submit() {
  const result = validateContact(form)
  if (!result.ok) {
    errors.value = result.errors
    return
  }
  errors.value = {}
  state.value = 'sending'

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: { ...result.value, website: form.website, startedAt: startedAt.value, turnstileToken: turnstileToken.value },
    })
    state.value = 'sent'
  } catch (error) {
    const data = (error as { data?: { statusMessage?: string; data?: { errors?: ContactErrors } } }).data
    if (data?.data?.errors) errors.value = data.data.errors
    failure.value = data?.statusMessage ?? `Something went wrong. Please email ${props.email} instead.`
    state.value = 'error'
    ;(window as TurnstileWindow).turnstile?.reset()
  }
}

function fieldProps(name: keyof ContactErrors) {
  return {
    id: `contact-${name}`,
    'aria-invalid': errors.value[name] ? true : undefined,
    'aria-describedby': errors.value[name] ? `contact-${name}-error` : undefined,
  }
}
</script>

<template>
  <Transition name="swap" mode="out-in">
    <div v-if="state === 'sent'" class="flex min-h-[420px] flex-col items-center justify-center text-center" role="status">
      <span class="sent-mark"><Check :size="28" /></span>
      <h3 class="mt-6 text-2xl text-text">Message sent</h3>
      <p class="mt-2 max-w-xs text-muted">Thanks for reaching out. I'll get back to you soon at the email you gave me.</p>
    </div>

    <form v-else class="grid gap-5" novalidate @submit.prevent="submit">
      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label for="contact-name" class="label">Name</label>
          <input
            v-model="form.name"
            v-bind="fieldProps('name')"
            class="field"
            autocomplete="name"
            :maxlength="CONTACT_LIMITS.name"
            required
          />
          <p v-if="errors.name" id="contact-name-error" class="error">{{ errors.name }}</p>
        </div>
        <div>
          <label for="contact-email" class="label">Email</label>
          <input
            v-model="form.email"
            v-bind="fieldProps('email')"
            class="field"
            type="email"
            autocomplete="email"
            :maxlength="CONTACT_LIMITS.email"
            required
          />
          <p v-if="errors.email" id="contact-email-error" class="error">{{ errors.email }}</p>
        </div>
      </div>
      <div>
        <label for="contact-company" class="label">Company <span class="text-faint">(optional)</span></label>
        <input
          v-model="form.company"
          v-bind="fieldProps('company')"
          class="field"
          autocomplete="organization"
          :maxlength="CONTACT_LIMITS.company"
        />
        <p v-if="errors.company" id="contact-company-error" class="error">{{ errors.company }}</p>
      </div>
      <div>
        <label for="contact-message" class="label">Message</label>
        <textarea
          v-model="form.message"
          v-bind="fieldProps('message')"
          class="field min-h-36 resize-y"
          :maxlength="CONTACT_LIMITS.message"
          required
        />
        <p v-if="errors.message" id="contact-message-error" class="error">{{ errors.message }}</p>
      </div>

      <!-- Honeypot: invisible to people, irresistible to bots -->
      <div class="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label for="contact-website">Website</label>
        <input id="contact-website" v-model="form.website" tabindex="-1" autocomplete="off" />
      </div>

      <div v-if="turnstileSiteKey" ref="turnstile" />

      <div class="flex flex-wrap items-center gap-4">
        <button type="submit" class="btn btn--primary" :disabled="state === 'sending'">
          <template v-if="state === 'sending'">
            <LoaderCircle :size="16" class="animate-spin" />
            Sending
          </template>
          <template v-else>
            Send message
            <Send :size="15" />
          </template>
        </button>
        <p v-if="state === 'error'" class="text-sm text-[#ec835a]" role="alert">{{ failure }}</p>
      </div>
    </form>
  </Transition>
</template>

<style scoped>
.label {
  display: block;
  margin-bottom: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.error {
  margin-top: 0.4rem;
  font-size: 0.85rem;
  color: #ec835a;
}

.sent-mark {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  color: var(--color-bg-deep);
  background: var(--gradient-signal);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
  filter: drop-shadow(0 0 20px var(--accent-glow));
  animation: pop 0.6s var(--ease-spring);
}

@keyframes pop {
  from {
    scale: 0.4;
    opacity: 0;
  }
}

.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.25s,
    translate 0.35s var(--ease-out-expo);
}

.swap-enter-from {
  opacity: 0;
  translate: 0 10px;
}

.swap-leave-to {
  opacity: 0;
}
</style>
