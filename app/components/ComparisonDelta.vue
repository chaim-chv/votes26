<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number | null | undefined
    format?: 'seats' | 'pp' | 'decimal' | 'integer'
    unitLabel?: string
    baseline?: string
  }>(),
  {
    format: 'seats',
    unitLabel: '',
    baseline: '2022',
  },
)

const { t } = useLocale()
const { number, decimal, signedPercent } = useFormat()

const display = computed(() => {
  if (props.value == null) return '—'
  if (props.value === 0) {
    if (props.format === 'pp') return signedPercent(0)
    if (props.format === 'decimal') return decimal(0)
    return '0'
  }
  if (props.format === 'pp') return signedPercent(props.value)
  if (props.format === 'decimal') return `${props.value > 0 ? '+' : '−'}${decimal(Math.abs(props.value))}`
  return `${props.value > 0 ? '+' : '−'}${number(Math.abs(props.value))}`
})

const srText = computed(() => {
  if (props.value == null) return t('comparison.notComparable')
  if (props.value === 0) return t('comparison.same')
  const amount =
    props.format === 'pp'
      ? decimal(Math.abs(props.value))
      : props.format === 'decimal'
        ? decimal(Math.abs(props.value))
        : number(Math.abs(props.value))
  return t(props.value > 0 ? 'comparison.more' : 'comparison.fewer', {
    value: amount,
    unit: props.unitLabel,
    baseline: props.baseline,
  })
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular"
    :class="
      value == null || value === 0
        ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
        : value > 0
          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
    "
  >
    <span aria-hidden="true">{{ display }}</span>
    <span class="sr-only">{{ srText }}</span>
  </span>
</template>
