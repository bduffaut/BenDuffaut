<!-- Top-down court with keypoints, two detected players and a tracked ball with its trail -->
<template>
  <div class="relative aspect-[16/9] w-full">
    <svg viewBox="0 0 400 225" class="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="trail" x1="0" x2="1">
          <stop offset="0" stop-color="#22d3ee" stop-opacity="0" />
          <stop offset="1" stop-color="#22d3ee" stop-opacity="0.9" />
        </linearGradient>
      </defs>

      <g class="court" fill="none" stroke-width="1">
        <rect x="60" y="30" width="280" height="165" />
        <line x1="60" y1="50" x2="340" y2="50" />
        <line x1="60" y1="175" x2="340" y2="175" />
        <line x1="200" y1="30" x2="200" y2="195" class="net" />
        <line x1="130" y1="50" x2="130" y2="175" />
        <line x1="270" y1="50" x2="270" y2="175" />
        <line x1="130" y1="112.5" x2="270" y2="112.5" />
      </g>

      <!-- Court keypoints, the 15 landmarks the detector finds (a subset drawn) -->
      <g class="kp">
        <circle v-for="(p, i) in KEYPOINTS" :key="i" :cx="p[0]" :cy="p[1]" r="2.2" :style="{ animationDelay: `${i * 0.12}s` }" />
      </g>

      <!-- Player detections -->
      <g class="box box--a">
        <path d="M78 92 h8 M78 92 v8 M110 92 h-8 M110 92 v8 M78 132 h8 M78 132 v-8 M110 132 h-8 M110 132 v-8" />
        <text x="78" y="87">player 0.97</text>
      </g>
      <g class="box box--b">
        <path d="M292 70 h8 M292 70 v8 M322 70 h-8 M322 70 v8 M292 106 h8 M292 106 v-8 M322 106 h-8 M322 106 v-8" />
        <text x="292" y="65">player 0.94</text>
      </g>

      <!-- Ball trajectory and LSTM prediction -->
      <path id="ball-path" d="M100 112 Q 200 40 307 88" fill="none" stroke="url(#trail)" stroke-width="1.5" class="trail" />
      <path d="M307 88 Q 330 110 336 140" fill="none" class="predict" />
      <circle r="4" class="ball">
        <animateMotion dur="2.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1" keyTimes="0;1">
          <mpath href="#ball-path" />
        </animateMotion>
      </circle>
      <text x="312" y="152" class="label">lstm next</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
const KEYPOINTS = [
  [60, 30],
  [340, 30],
  [60, 195],
  [340, 195],
  [60, 50],
  [340, 50],
  [60, 175],
  [340, 175],
  [130, 50],
  [270, 50],
  [130, 175],
  [270, 175],
  [130, 112.5],
  [270, 112.5],
  [200, 112.5],
]
</script>

<style scoped>
.court {
  stroke: rgb(230 237 243 / 0.22);
}

.net {
  stroke: rgb(230 237 243 / 0.45);
  stroke-dasharray: 3 3;
}

.kp circle {
  fill: var(--color-accent);
  filter: drop-shadow(0 0 3px var(--color-accent));
  animation: kp 3s ease-in-out infinite;
}

@keyframes kp {
  50% {
    opacity: 0.35;
  }
}

.box path {
  fill: none;
  stroke: var(--color-accent-strong);
  stroke-width: 1.5;
}

.box text,
.label {
  font-family: var(--font-mono);
  font-size: 8px;
  fill: var(--color-accent-strong);
}

.label {
  fill: var(--color-faint);
}

.box--a {
  animation: track-a 2.6s ease-in-out infinite;
}

.box--b {
  animation: track-b 2.6s ease-in-out infinite;
}

@keyframes track-a {
  50% {
    translate: 0 10px;
  }
}

@keyframes track-b {
  50% {
    translate: 0 -8px;
  }
}

.trail {
  stroke-dasharray: 260;
  animation: trail 2.6s ease-in-out infinite;
}

@keyframes trail {
  from {
    stroke-dashoffset: 260;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.predict {
  stroke: var(--color-warning);
  stroke-width: 1.2;
  stroke-dasharray: 3 4;
  opacity: 0.8;
}

.ball {
  fill: #e4f75a;
  filter: drop-shadow(0 0 5px rgb(228 247 90 / 0.8));
}
</style>
