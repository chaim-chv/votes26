<script setup lang="ts">
import type { PartyResult } from '~~/shared/election/types'

const props = withDefaults(
  defineProps<{
    parties: PartyResult[]
    totalSeats?: number
    summary?: string
  }>(),
  { totalSeats: 120 },
)

const { locale, t } = useLocale()
const { number } = useFormat()
const uid = useId()

const ordered = computed(() =>
  [...props.parties]
    .filter((party) => party.seats > 0)
    .sort((a, b) => a.order - b.order || b.seats - a.seats),
)

const seatList = computed(() =>
  ordered.value.flatMap((party) =>
    Array.from({ length: party.seats }, (_, index) => ({
      key: `${party.code}-${index}`,
      code: party.code,
      name: locale.value === 'he' ? party.nameHe : party.nameEn,
      color: party.color,
      order: party.order,
    })),
  ),
)

const chartSummary = computed(() => {
  if (props.summary) return props.summary
  return ordered.value
    .map((party) => `${locale.value === 'he' ? party.nameHe : party.nameEn}: ${party.seats}`)
    .join(', ')
})

const rows = 12
const innerRadius = 100
const outerRadius = 266
const centerX = 300
const centerY = 316
const dotRadius = 9.6

const counts = computed(() => {
  const weights = Array.from({ length: rows }, (_, index) => {
    const ratio = index / (rows - 1)
    return innerRadius + (outerRadius - innerRadius) * ratio
  })
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0)
  const raw = weights.map((weight) => (weight / weightSum) * props.totalSeats)
  const base = raw.map((value) => Math.floor(value))
  let remaining = props.totalSeats - base.reduce((sum, value) => sum + value, 0)
  const fractions = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction)
  let index = 0
  while (remaining > 0 && fractions.length > 0) {
    base[fractions[index % fractions.length]!.index]! += 1
    remaining -= 1
    index += 1
  }
  return base
})

const positions = computed(() => {
  const points: Array<{ x: number; y: number; angle: number }> = []
  counts.value.forEach((count, rowIndex) => {
    const ratio = rowIndex / (rows - 1)
    const radius = innerRadius + (outerRadius - innerRadius) * ratio
    for (let seat = 0; seat < count; seat += 1) {
      const angle = Math.PI - ((seat + 0.5) / count) * Math.PI
      points.push({
        x: Math.round((centerX + radius * Math.cos(angle)) * 1000) / 1000,
        y: Math.round((centerY - radius * Math.sin(angle)) * 1000) / 1000,
        angle: Math.round(angle * 1_000_000) / 1_000_000,
      })
    }
  })
  return points.sort((a, b) => a.angle - b.angle)
})

const dots = computed(() =>
  positions.value.slice(0, Math.min(positions.value.length, seatList.value.length)).map(
    (point, index) => ({
      ...point,
      ...seatList.value[index]!,
    }),
  ),
)
</script>

<template>
  <figure class="w-full">
    <div class="relative mx-auto max-w-[620px]">
      <svg
        :viewBox="`0 0 600 330`"
        class="h-auto w-full"
        role="img"
        :aria-labelledby="`${uid}-title ${uid}-desc`"
      >
        <title :id="`${uid}-title`">{{ t('overview.hemicycle.title') }}</title>
        <desc :id="`${uid}-desc`">{{ chartSummary }}</desc>
        <g aria-hidden="true">
          <circle
            v-for="dot in dots"
            :key="dot.key"
            :cx="dot.x"
            :cy="dot.y"
            :r="dotRadius"
            :fill="dot.color"
            class="hemicycle-seat stroke-neutral-900/25 dark:stroke-white/30"
            stroke-width="1.2"
          >
            <title>{{ dot.name }} · {{ t('common.seat') }}</title>
          </circle>
        </g>
        <g aria-hidden="true">
          <text
            :x="centerX"
            :y="centerY - 56"
            text-anchor="middle"
            class="fill-neutral-500 text-[11px] font-semibold tracking-wide dark:fill-neutral-400"
          >
            {{ t('common.seats') }}
          </text>
          <text
            :x="centerX"
            :y="centerY - 20"
            text-anchor="middle"
            class="fill-neutral-900 text-[38px] font-bold tabular dark:fill-neutral-100"
          >
            {{ number(totalSeats) }}
          </text>
          <text
            :x="centerX"
            :y="centerY + 6"
            text-anchor="middle"
            class="fill-neutral-500 text-[11px] dark:fill-neutral-400"
          >
            {{ t('mandates.stats.total') }}
          </text>
        </g>
      </svg>
    </div>
    <figcaption class="sr-only">{{ chartSummary }}</figcaption>
  </figure>
</template>
