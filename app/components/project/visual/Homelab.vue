<!-- The home server as a network map: the internet on the left, the home LAN on the right, the
     router on the boundary with nothing open. Visitors reach the site through the outbound tunnel,
     Plex streams out to the TV, backups flow in from the desktop and phone, and admin access
     comes over Tailscale. Moving dashes show which way traffic goes on each link. -->
<template>
  <div class="relative aspect-[16/9] w-full">
    <svg viewBox="0 0 400 225" class="absolute inset-0 h-full w-full">
      <!-- Network boundary -->
      <line x1="106" y1="12" x2="106" y2="213" class="boundary" />
      <text x="100" y="22" text-anchor="end" class="label">internet</text>
      <text x="112" y="22" class="label">home lan</text>

      <!-- Links: a faint base line with moving packets on top -->
      <g fill="none">
        <path v-for="link in LINKS" :key="link.id" :d="link.d" class="link" :class="`link--${link.kind}`" />
        <path
          v-for="(link, i) in LINKS"
          :key="`${link.id}-flow`"
          :d="link.d"
          class="flow"
          :class="[`link--${link.kind}`, link.inbound ? 'flow--in' : 'flow--out']"
          :style="{ animationDelay: `${i * -0.35}s` }"
        />
      </g>

      <!-- Visitors -->
      <circle v-for="y in [50, 82, 114]" :key="y" cx="10" :cy="y" r="2" class="dot" />

      <!-- Cloudflare edge -->
      <polygon points="46,66 60,74 60,90 46,98 32,90 32,74" class="node node--edge" />
      <text x="46" y="85" text-anchor="middle" class="node-text">edge</text>
      <text x="46" y="112" text-anchor="middle" class="label">cloudflare</text>

      <!-- Router, on the boundary, nothing open -->
      <rect x="86" y="150" width="40" height="20" rx="3" class="node" />
      <text x="106" y="163" text-anchor="middle" class="node-text">router</text>
      <text x="106" y="184" text-anchor="middle" class="label label--warn">0 open ports</text>
      <text x="113" y="128" class="label">tunnel</text>

      <!-- Tailscale, private admin access -->
      <rect x="178" y="18" width="52" height="14" rx="7" class="node node--tail" />
      <text x="204" y="28" text-anchor="middle" class="node-text">tailscale</text>
      <text x="211" y="58" class="label">ssh</text>

      <!-- The laptop -->
      <rect x="168" y="78" width="72" height="46" rx="3" class="node node--server" />
      <path d="M160 124 h88 l-6 8 h-76 z" class="node node--server" />
      <g v-for="(service, i) in SERVICES" :key="service" :transform="`translate(176 ${86 + i * 12})`">
        <rect width="56" height="8" rx="1.5" class="module" />
        <circle cx="5" cy="4" r="1.6" class="led" :style="{ animationDelay: `${i * 0.6}s` }" />
        <text x="11" y="6.2" class="module-text">{{ service }}</text>
      </g>
      <text x="204" y="146" text-anchor="middle" class="label label--strong">homeserver</text>
      <text x="204" y="157" text-anchor="middle" class="label">ubuntu · docker</text>

      <!-- Devices on the LAN -->
      <rect x="319" y="45" width="34" height="22" rx="2" class="node" />
      <line x1="330" y1="71" x2="342" y2="71" class="node-line" />
      <text x="336" y="84" text-anchor="middle" class="label">tv</text>

      <rect x="321" y="106" width="30" height="20" rx="2" class="node" />
      <line x1="336" y1="126" x2="336" y2="131" class="node-line" />
      <line x1="330" y1="131" x2="342" y2="131" class="node-line" />
      <text x="336" y="144" text-anchor="middle" class="label">desktop</text>

      <rect x="330" y="165" width="12" height="22" rx="2.5" class="node" />
      <text x="336" y="200" text-anchor="middle" class="label">phone</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
const SERVICES = ['site', 'plex', 'backups']

// kind sets the color, inbound sets which way the packets move (paths are drawn from the server out)
const LINKS = [
  { id: 'visitors-1', kind: 'web', inbound: false, d: 'M12 50 L32 78' },
  { id: 'visitors-2', kind: 'web', inbound: false, d: 'M12 82 L32 82' },
  { id: 'visitors-3', kind: 'web', inbound: false, d: 'M12 114 L32 86' },
  { id: 'tunnel-lan', kind: 'web', inbound: true, d: 'M168 104 C 140 104 146 160 126 160' },
  { id: 'tunnel-wan', kind: 'web', inbound: true, d: 'M86 160 C 56 160 46 130 46 99' },
  { id: 'tailscale', kind: 'admin', inbound: false, d: 'M204 32 L204 78' },
  { id: 'plex', kind: 'media', inbound: false, d: 'M240 92 C 280 92 290 56 319 56' },
  { id: 'backup-desktop', kind: 'backup', inbound: true, d: 'M240 101 C 280 101 290 116 321 116' },
  { id: 'backup-phone', kind: 'backup', inbound: true, d: 'M240 110 C 280 110 292 176 330 176' },
]
</script>

<style scoped>
.boundary {
  stroke: color-mix(in srgb, var(--color-text) 16%, transparent);
  stroke-dasharray: 2 4;
}

.label,
.node-text,
.module-text {
  font-family: var(--font-meta);
  fill: var(--color-faint);
}

.label {
  font-size: 8px;
}

.label--strong {
  fill: var(--color-text);
}

.label--warn {
  fill: var(--color-warning);
}

.node-text {
  font-size: 7px;
  fill: var(--color-muted);
}

.module-text {
  font-size: 6px;
  fill: var(--color-accent-strong);
}

.node {
  fill: var(--color-surface-2);
  stroke: color-mix(in srgb, var(--color-text) 28%, transparent);
  stroke-width: 1;
}

.node-line {
  stroke: color-mix(in srgb, var(--color-text) 28%, transparent);
}

.node--edge,
.node--tail {
  stroke: color-mix(in srgb, var(--color-accent) 55%, transparent);
}

.node--server {
  stroke: color-mix(in srgb, var(--color-accent) 70%, transparent);
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--color-accent) 25%, transparent));
}

.module {
  fill: color-mix(in srgb, var(--color-accent) 8%, transparent);
  stroke: color-mix(in srgb, var(--color-accent) 30%, transparent);
  stroke-width: 0.6;
}

.led {
  fill: var(--color-good);
  filter: drop-shadow(0 0 2px var(--color-good));
  animation: led 2.4s steps(1) infinite;
}

.dot {
  fill: var(--color-accent);
}

/* One color per kind of traffic */
.link--web {
  --link: var(--color-accent);
}

.link--media {
  --link: var(--color-data);
}

.link--backup {
  --link: var(--color-accent-alt);
}

.link--admin {
  --link: var(--color-accent-strong);
}

.link {
  stroke: var(--link);
  stroke-width: 1;
  opacity: 0.22;
}

.flow {
  stroke: var(--link);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-dasharray: 2 10;
  filter: drop-shadow(0 0 2px var(--link));
  animation: flow-out 1.2s linear infinite;
}

/* Paths start at the server, so a growing offset moves packets toward it */
.flow--in {
  animation-name: flow-in;
}

/* Dash patterns must divide 24 (the animation distance), or the loop visibly jumps */
.link--admin.flow {
  stroke-dasharray: 1 3;
}

@keyframes flow-out {
  to {
    stroke-dashoffset: -24;
  }
}

@keyframes flow-in {
  to {
    stroke-dashoffset: 24;
  }
}

@keyframes led {
  50% {
    opacity: 0.3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flow,
  .led {
    animation: none;
  }
}
</style>
