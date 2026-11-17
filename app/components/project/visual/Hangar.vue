<!-- Hangar's deploy pipeline, told the way Hangar tells it: a push rolls an aircraft out of the
     hangar, down the runway through its four statuses (Holding, Preflight, Taking off, Airborne)
     and into the air. The address only switches to the new version once its health check answers,
     so the old one keeps serving until then. Below, the Control Tower relay: each self-hosted
     server dials out over one socket, with no inbound ports.

     Everything that loops is opacity or transform. Without motion it shows the finished deploy. -->
<template>
  <div class="relative aspect-[16/9] w-full">
    <svg viewBox="0 0 400 225" class="absolute inset-0 h-full w-full">
      <!-- The push that starts it -->
      <g class="push">
        <rect x="14" y="16" width="82" height="20" rx="3" class="chip" />
        <text x="22" y="29" class="chip-text">git push main</text>
        <text x="14" y="48" class="label">tail a1b2c3d</text>
      </g>
      <path d="M55 52 V 68" class="wire" />

      <!-- The hangar, after its logo: an arch in linework with the aircraft inside -->
      <path d="M28 126 V100 C28 82 41 70 58 70 S88 82 88 100 V126" class="hangar" />
      <rect x="38" y="104" width="40" height="22" class="bay" />
      <rect x="38" y="104" width="40" height="22" class="bay-glow" />
      <text x="58" y="96" text-anchor="middle" class="label">build</text>

      <!-- Runway: edges, centerline, and lights that chase toward takeoff -->
      <line x1="14" y1="126" x2="386" y2="126" class="ground" />
      <line x1="96" y1="112" x2="300" y2="112" class="edge" />
      <line x1="96" y1="126" x2="300" y2="126" class="edge" />
      <line x1="100" y1="119" x2="296" y2="119" class="centerline" />
      <circle v-for="(x, i) in LIGHTS" :key="x" :cx="x" cy="119" r="1.4" class="light" :style="{ animationDelay: `${i * 0.09}s` }" />

      <!-- The new version: taxis out, takes off, climbs to its address -->
      <g class="plane">
        <polygon points="50,113 70,119 50,125 55,119" class="aircraft" />
      </g>

      <!-- The address: v12 keeps serving until v13 answers its health check -->
      <path d="M300 112 C 318 100 322 80 326 70" class="wire wire--route" />
      <rect x="262" y="16" width="124" height="48" rx="3" class="card" />
      <text x="272" y="31" class="address">app.yourdomain.com</text>
      <circle cx="275" cy="48" r="3" class="dot dot--live" />
      <text x="284" y="51" class="version version--old">v12 airborne</text>
      <text x="284" y="51" class="version version--new">v13 airborne</text>
      <text x="376" y="51" text-anchor="end" class="check">200 ok</text>

      <!-- The route through Hangar's statuses -->
      <line x1="110" y1="148" x2="296" y2="148" class="route" />
      <g v-for="(stage, i) in STAGES" :key="stage.label">
        <circle :cx="stage.x" cy="148" r="3.2" class="stop" />
        <circle :cx="stage.x" cy="148" r="3.2" class="stop-lit" :class="`stop-lit--${i}`" />
        <text :x="stage.x" y="162" text-anchor="middle" class="label">{{ stage.label }}</text>
      </g>

      <!-- Control Tower relay: one outbound socket per server, nothing listening on them -->
      <line x1="14" y1="178" x2="386" y2="178" class="divider" />
      <rect x="18" y="191" width="78" height="18" rx="9" class="tower" />
      <text x="57" y="203" text-anchor="middle" class="tower-text">control tower</text>
      <line x1="96" y1="200" x2="346" y2="200" class="socket" />
      <circle
        v-for="(s, i) in SERVERS"
        :key="`p-${s.x}`"
        :cx="s.x - 14"
        cy="200"
        r="1.6"
        class="packet"
        :style="{ '--d': `${s.x - 110}px`, animationDelay: `${i * -0.7}s` }"
      />
      <g v-for="s in SERVERS" :key="s.x">
        <rect :x="s.x - 12" y="192" width="24" height="16" rx="2" class="server" />
        <line :x1="s.x - 7" y1="197" :x2="s.x + 7" y2="197" class="server-line" />
        <line :x1="s.x - 7" y1="201" :x2="s.x + 7" y2="201" class="server-line" />
        <text :x="s.x" y="219" text-anchor="middle" class="label">{{ s.label }}</text>
      </g>
      <text x="125" y="192" class="label">outbound only, 0 inbound ports</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
const LIGHTS = Array.from({ length: 13 }, (_, i) => 104 + i * 16)

const STAGES = [
  { label: 'holding', x: 110 },
  { label: 'preflight', x: 172 },
  { label: 'taking off', x: 234 },
  { label: 'airborne', x: 296 },
]

const SERVERS = [
  { label: 'laptop', x: 230 },
  { label: 'mini pc', x: 290 },
  { label: 'pi', x: 350 },
]
</script>

<style scoped>
/* One deploy every 8 seconds. The stages below share these percentages:
   holding 4–14%, preflight 14–38%, taking off 38–56%, airborne from 56% */
.push,
.plane,
.bay-glow,
.stop-lit,
.check,
.version,
.light,
.packet {
  animation-duration: 8s;
  animation-iteration-count: infinite;
}

.label,
.chip-text,
.address,
.version,
.check,
.tower-text {
  font-family: var(--font-meta);
}

.label {
  font-size: 8px;
  fill: var(--color-faint);
}

.chip {
  fill: color-mix(in srgb, var(--color-accent) 10%, transparent);
  stroke: color-mix(in srgb, var(--color-accent) 55%, transparent);
}

.chip-text {
  font-size: 8px;
  fill: var(--color-accent-strong);
}

.push {
  animation-name: push;
}

.wire {
  fill: none;
  stroke: color-mix(in srgb, var(--color-text) 22%, transparent);
  stroke-dasharray: 2 3;
}

.wire--route {
  stroke: color-mix(in srgb, var(--color-accent) 40%, transparent);
}

.hangar {
  fill: none;
  stroke: var(--color-text);
  stroke-width: 2.4;
  stroke-linejoin: round;
  opacity: 0.85;
}

.bay {
  fill: var(--color-bg-deep);
}

/* The build running inside the hangar */
.bay-glow {
  fill: color-mix(in srgb, var(--color-data) 22%, transparent);
  opacity: 0;
  animation-name: build;
}

.ground {
  stroke: color-mix(in srgb, var(--color-text) 30%, transparent);
  stroke-width: 1.2;
}

.edge {
  stroke: color-mix(in srgb, var(--color-text) 14%, transparent);
}

.centerline {
  stroke: color-mix(in srgb, var(--color-text) 18%, transparent);
  stroke-dasharray: 6 6;
}

.light {
  fill: var(--color-accent);
  opacity: 0.25;
  animation-name: light;
  animation-duration: 1.2s;
}

.aircraft {
  fill: var(--color-accent);
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--color-accent) 60%, transparent));
}

/* Static state: in the air, on its way to the address */
.plane {
  transform: translate(250px, -40px);
  opacity: 0;
  animation-name: fly;
  animation-timing-function: ease-in;
}

.card {
  fill: var(--color-surface-2);
  stroke: color-mix(in srgb, var(--color-accent) 45%, transparent);
}

.address {
  font-size: 8.5px;
  fill: var(--color-text);
}

.dot--live {
  fill: var(--color-good);
  filter: drop-shadow(0 0 3px var(--color-good));
}

.version {
  font-size: 8px;
  fill: var(--color-muted);
}

.version--old {
  opacity: 0;
  animation-name: old;
}

.version--new {
  animation-name: new;
}

.check {
  font-size: 7.5px;
  fill: var(--color-good);
  opacity: 0;
  animation-name: check;
}

.route {
  stroke: color-mix(in srgb, var(--color-text) 18%, transparent);
}

.stop {
  fill: var(--color-surface-2);
  stroke: color-mix(in srgb, var(--color-text) 30%, transparent);
}

/* Each status lights when the deploy reaches it and stays lit until the next push */
.stop-lit {
  animation-name: stop-0;
}

.stop-lit--0 {
  fill: var(--color-faint);
}

.stop-lit--1 {
  fill: var(--color-data);
  animation-name: stop-1;
}

.stop-lit--2 {
  fill: var(--color-accent);
  animation-name: stop-2;
}

.stop-lit--3 {
  fill: var(--color-good);
  filter: drop-shadow(0 0 3px var(--color-good));
  animation-name: stop-3;
}

.divider {
  stroke: color-mix(in srgb, var(--color-text) 10%, transparent);
  stroke-dasharray: 2 4;
}

.tower {
  fill: color-mix(in srgb, var(--color-accent) 10%, transparent);
  stroke: color-mix(in srgb, var(--color-accent) 60%, transparent);
}

.tower-text {
  font-size: 7.5px;
  fill: var(--color-accent-strong);
}

.socket {
  stroke: color-mix(in srgb, var(--color-accent-alt) 35%, transparent);
}

.server {
  fill: var(--color-surface-2);
  stroke: color-mix(in srgb, var(--color-text) 30%, transparent);
}

.server-line {
  stroke: color-mix(in srgb, var(--color-text) 25%, transparent);
}

/* Messages travel from each server to the tower: the servers dial out */
.packet {
  fill: var(--color-accent-alt);
  filter: drop-shadow(0 0 2px var(--color-accent-alt));
  animation-name: packet;
  animation-duration: 2.1s;
  animation-timing-function: linear;
}

@keyframes push {
  0% {
    opacity: 0.35;
  }
  4%,
  92% {
    opacity: 1;
  }
  100% {
    opacity: 0.35;
  }
}

@keyframes build {
  0%,
  14% {
    opacity: 0;
  }
  20%,
  32% {
    opacity: 1;
  }
  38%,
  100% {
    opacity: 0;
  }
}

@keyframes light {
  0%,
  100% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
}

@keyframes fly {
  0%,
  4% {
    transform: translate(0, 0);
    opacity: 0;
  }
  8%,
  14% {
    transform: translate(0, 0);
    opacity: 1;
  }
  38% {
    transform: translate(70px, 0);
    opacity: 1;
  }
  56% {
    transform: translate(210px, 0);
    opacity: 1;
  }
  70% {
    transform: translate(262px, -48px);
    opacity: 0;
  }
  100% {
    transform: translate(262px, -48px);
    opacity: 0;
  }
}

@keyframes check {
  0%,
  48% {
    opacity: 0;
  }
  52%,
  64% {
    opacity: 1;
  }
  70%,
  100% {
    opacity: 0;
  }
}

/* The swap happens only after the check: v12 serves until 56% */
@keyframes old {
  0%,
  55% {
    opacity: 1;
  }
  57%,
  100% {
    opacity: 0;
  }
}

@keyframes new {
  0%,
  55% {
    opacity: 0;
  }
  57%,
  100% {
    opacity: 1;
  }
}

@keyframes stop-0 {
  0%,
  4% {
    opacity: 0;
  }
  6%,
  92% {
    opacity: 1;
  }
  96%,
  100% {
    opacity: 0;
  }
}

@keyframes stop-1 {
  0%,
  14% {
    opacity: 0;
  }
  16%,
  92% {
    opacity: 1;
  }
  96%,
  100% {
    opacity: 0;
  }
}

@keyframes stop-2 {
  0%,
  38% {
    opacity: 0;
  }
  40%,
  92% {
    opacity: 1;
  }
  96%,
  100% {
    opacity: 0;
  }
}

@keyframes stop-3 {
  0%,
  56% {
    opacity: 0;
  }
  58%,
  92% {
    opacity: 1;
  }
  96%,
  100% {
    opacity: 0;
  }
}

@keyframes packet {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  10%,
  85% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(var(--d) * -1));
    opacity: 0;
  }
}

/* Without motion: the finished deploy. All statuses lit, v13 serving, plane already gone */
@media (prefers-reduced-motion: reduce) {
  .push,
  .plane,
  .bay-glow,
  .stop-lit,
  .check,
  .version,
  .light,
  .packet {
    animation: none;
  }

  .packet {
    opacity: 0;
  }

  .plane {
    transform: translate(150px, 0);
    opacity: 1;
  }
}
</style>
