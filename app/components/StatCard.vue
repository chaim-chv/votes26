<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string
    hint?: string
    icon?: string
    tone?: 'default' | 'primary' | 'warning'
  }>(),
  { tone: 'default' },
)

const toneClass = {
  default: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
} as const
</script>

<template>
  <article class="card-quiet flex items-start gap-3 p-4 sm:p-5">
    <span
      v-if="icon"
      class="grid size-10 shrink-0 place-items-center rounded-xl"
      :class="toneClass[tone]"
      aria-hidden="true"
    >
      <UIcon :name="icon" class="size-5" />
    </span>
    <div class="min-w-0">
      <p class="text-xs font-medium text-muted">{{ label }}</p>
      <p class="mt-1 text-2xl font-bold tracking-tight tabular">{{ value }}</p>
      <p v-if="hint" class="mt-1 text-xs leading-5 text-muted">{{ hint }}</p>
    </div>
  </article>
</template>
