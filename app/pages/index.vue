<template>
  <div>
    <!-- The hero hydrates with the page. Everything below the fold is server-rendered like the
         rest, but hydrates only as it scrolls into view, so the first screen isn't kept waiting
         on JavaScript for sections no one can see yet. The contact form hydrates eagerly so
         it always works by the time anyone reaches it.

         defer-render (motion.css) also skips styling and laying out those sections until
         they're near the screen. Not on Projects: its containment would trap the board's
         fixed-position edit dock and drag ghost inside the section -->
    <HomeHero />
    <LazyHomeExperience class="defer-render" hydrate-on-visible />
    <LazyHomeProjects hydrate-on-visible />
    <LazyHomeAbout class="defer-render" hydrate-on-visible />
    <LazyHomeSkills class="defer-render" hydrate-on-visible />
    <LazyHomeBeyond class="defer-render" hydrate-on-visible />
    <HomeContact class="defer-render" />
  </div>
</template>
