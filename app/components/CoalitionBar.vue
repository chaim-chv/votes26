<script setup lang="ts">
import type { CampResult } from '~~/shared/election/types'

const props = withDefaults(
  defineProps<{
    camps: CampResult[]
    totalSeats?: number
    majority?: number
    compact?: boolean
  }>(),
  { totalSeats: 120, majority: 61 },
)

const { locale, t } = useLocale()
const { number } = useFormat()

const visible = computed(() => props.camps.filter((camp) => camp.seats > 0))
const summary = computed(() =>
  visible.value
    .map(
      (camp) =>
        `${locale.value === 'he' ? camp.nameHe : camp.nameEn}: ${camp.seats} ${t('units.seats')}`,
    )
    .join(', '),
)

function width(camp: CampResult) {
  return (camp.seats / props.totalSeats) * 100
}

function shortfall(camp: CampResult) {
  return Math.max(0, props.majority - camp.seats)
}
</script>

<template>
  <div>
    <div class="relative pt-5">
      <div
        class="absolute top-0 z-10 -translate-x-1/2 text-[10px] font-bold text-primary rtl:translate-x-1/2"
        :style="{ insetInlineStart: `${(majority / totalSeats) * 100}%` }"
        aria-hidden="true"
      >
        61
      </div>
      <div
        class="relative flex h-11 w-full overflow-hidden rounded-xl border border-default"
        role="img"
        :aria-label="summary"
      >
        <div
          v-for="camp in visible"
          :key="camp.id"
          class="flex h-full items-center justify-center text-xs font-bold text-white transition-[width] duration-500"
          :style="{ width: `${width(camp)}%`, backgroundColor: camp.color }"
          :title="`${locale === 'he' ? camp.nameHe : camp.nameEn}: ${camp.seats}`"
          aria-hidden="true"
        >
          <span v-if="width(camp) >= 9">{{ number(camp.seats) }}</span>
        </div>
        <div
          class="absolute inset-y-0 w-0.5 bg-neutral-950/80 dark:bg-white"
          :style="{ insetInlineStart: `${(majority / totalSeats) * 100}%` }"
          aria-hidden="true"
        />
      </div>
    </div>

    <ul :class="compact ? 'mt-3 grid gap-2' : 'mt-4 grid gap-2 sm:grid-cols-2'">
      <li
        v-for="camp in visible"
        :key="camp.id"
        class="flex items-center gap-2.5 rounded-lg border border-default px-3 py-2"
      >
        <span
          class="size-2.5 shrink-0 rounded-full"
          :style="{ backgroundColor: camp.color }"
          aria-hidden="true"
        />
        <span class="min-w-0 flex-1 truncate text-sm font-medium">
          {{ locale === 'he' ? camp.nameHe : camp.nameEn }}
        </span>
        <span class="text-sm font-bold tabular">{{ number(camp.seats) }}</span>
        <span
          v-if="shortfall(camp) > 0"
          class="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          {{ t('blocs.camp.short', { count: shortfall(camp) }) }}
        </span>
        <span
          v-else
          class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {{ t('blocs.camp.reached') }}
        </span>
      </li>
    </ul>
  </div>
</template>
