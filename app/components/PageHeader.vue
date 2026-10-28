<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  lede?: string
}>()
</script>

<template>
  <header class="max-w-3xl">
    <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
      {{ eyebrow }}
    </p>
    <div class="mt-2 flex items-start gap-3">
      <slot name="leading" />
      <h1 class="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {{ title }}
      </h1>
    </div>
    <p v-if="lede" class="mt-3 text-base leading-7 text-muted sm:text-lg sm:leading-8">
      {{ lede }}
    </p>
    <div v-if="$slots.actions" class="mt-5 flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
