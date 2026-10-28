<script setup lang="ts">
withDefaults(
  defineProps<{
    color: string
    size?: 'sm' | 'md' | 'lg'
    label?: string
  }>(),
  { size: 'md' },
)

const sizeClass = {
  sm: 'size-2.5',
  md: 'size-3.5',
  lg: 'size-5',
} as const
</script>

<template>
  <span
    class="inline-block shrink-0 rounded-full border border-black/15 shadow-sm dark:border-white/25"
    :class="sizeClass[size]"
    :style="{ backgroundColor: color }"
    aria-hidden="true"
  />
</template>
