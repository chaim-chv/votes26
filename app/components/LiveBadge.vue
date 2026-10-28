<script setup lang="ts">
const props = defineProps<{
  mode: 'live' | 'snapshot'
  updatedAt?: string
  refreshing?: boolean
}>()

const { t } = useLocale()
const { time } = useFormat()

const label = computed(() =>
  props.mode === 'live' ? t('header.live') : t('header.snapshot'),
)
const shortLabel = computed(() =>
  props.mode === 'live' ? t('header.liveShort') : t('header.snapshotShort'),
)
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold"
    :class="
      mode === 'live'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
        : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200'
    "
  >
    <span
      class="size-1.5 rounded-full"
      :class="mode === 'live' ? 'bg-emerald-500' : 'bg-amber-500'"
      aria-hidden="true"
    />
    <UIcon
      :name="mode === 'live' ? 'i-lucide-radio' : 'i-lucide-database'"
      class="hidden size-3.5 sm:block"
      aria-hidden="true"
    />
    <span class="sm:hidden">{{ shortLabel }}</span>
    <span class="hidden sm:inline">{{ label }}</span>
    <span v-if="refreshing" class="sr-only">{{ t('header.refreshing') }}</span>
    <span v-if="updatedAt" class="hidden sm:inline">
      · {{ time(updatedAt) }}
    </span>
  </span>
</template>
