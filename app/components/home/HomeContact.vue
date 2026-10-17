<script setup lang="ts">
import { Mail } from 'lucide-vue-next'

const profile = await useRequiredProfile()
</script>

<template>
  <section id="contact" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:px-8">
    <div class="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
      <div>
        <UiSectionHeading index="06" label="Contact" title="Let's talk" />
        <p v-reveal class="-mt-4 text-lg text-muted">
          I'm looking for full-time software engineering roles. If you're hiring, have a question about something I've built, or just want
          to say hi, send me a message.
        </p>
        <ul v-reveal="100" class="mt-8 space-y-2">
          <li>
            <a :href="`mailto:${profile.email}`" class="contact-link">
              <Mail :size="18" />
              {{ profile.email }}
            </a>
          </li>
          <li>
            <a :href="profile.links.linkedin" class="contact-link" target="_blank" rel="noopener">
              <UiBrandIcon name="linkedin" />
              {{ displayUrl(profile.links.linkedin) }}
            </a>
          </li>
          <li>
            <a :href="profile.links.github" class="contact-link" target="_blank" rel="noopener">
              <UiBrandIcon name="github" />
              {{ displayUrl(profile.links.github) }}
            </a>
          </li>
        </ul>
      </div>

      <div v-reveal="120" v-spotlight class="panel panel--raised relative p-6 md:p-8">
        <ContactForm :email="profile.email" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.35rem 0;
  font-family: var(--font-mono);
  font-size: 0.92rem;
  color: var(--color-muted);
  transition:
    color 0.2s,
    translate 0.3s var(--ease-spring);
}

.contact-link svg {
  color: var(--color-accent);
}

.contact-link:hover {
  color: var(--color-text);
  translate: 4px 0;
}
</style>
