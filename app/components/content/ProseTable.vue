<!-- Markdown tables scroll sideways on small screens. The wrapper is focusable so keyboard
     users can scroll it too. -->
<template>
  <div class="table-scroll" tabindex="0" role="region" aria-label="Table, scrolls horizontally">
    <table>
      <slot />
    </table>
  </div>
</template>
