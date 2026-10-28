<script setup lang="ts">
import type { PartyResult } from '~~/shared/election/types'

const props = defineProps<{
  parties: PartyResult[]
}>()

const { locale, t } = useLocale()
const { percent, signedPercent } = useFormat()

const eligible = computed(() =>
  [...props.parties]
    .filter((party) => party.seats > 0)
    .sort((a, b) => b.seats - a.seats),
)

const maxPct = computed(() =>
  Math.max(1, ...eligible.value.map((party) => Math.max(party.votePct, party.seatPct))),
)

function width(value: number) {
  return Math.max(0.8, (value / maxPct.value) * 100)
}
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted">
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2 w-5 rounded-full bg-neutral-400 pattern-dots dark:bg-neutral-500" aria-hidden="true" />
        {{ t('votes.compare.voteShare') }}
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="h-2 w-5 rounded-full bg-primary" aria-hidden="true" />
        {{ t('votes.compare.seatShare') }}
      </span>
    </div>

    <ol class="space-y-2" :aria-label="t('votes.compare.title')">
      <li
        v-for="party in eligible"
        :key="party.code"
        class="grid items-center gap-2 rounded-lg px-1.5 py-1.5 sm:grid-cols-[minmax(7rem,11rem)_1fr_auto]"
      >
        <div class="flex items-center gap-2">
          <PartySwatch :color="party.color" size="sm" />
          <NuxtLink
            :to="`/parties/${encodeURIComponent(party.code)}`"
            class="truncate text-sm font-medium hover:text-primary hover:underline"
          >
            {{ locale === 'he' ? party.nameHe : party.nameEn }}
          </NuxtLink>
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="sr-only">{{ t('votes.compare.voteShare') }}</span>
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                class="bar-fill h-full rounded-full bg-neutral-400 pattern-dots dark:bg-neutral-500"
                :style="{ width: `${width(party.votePct)}%` }"
                aria-hidden="true"
              />
            </div>
            <span class="w-14 text-end text-xs text-muted tabular">{{ percent(party.votePct) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="sr-only">{{ t('votes.compare.seatShare') }}</span>
            <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                class="bar-fill h-full rounded-full"
                :style="{ width: `${width(party.seatPct)}%`, backgroundColor: party.color }"
                aria-hidden="true"
              />
            </div>
            <span class="w-14 text-end text-xs font-semibold tabular">{{ percent(party.seatPct) }}</span>
          </div>
        </div>
        <span
          class="justify-self-start rounded-full px-2 py-0.5 text-xs font-semibold tabular sm:justify-self-end"
          :class="
            party.representationGap >= 0
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
          "
          :title="t('mandates.table.delta')"
        >
          {{ signedPercent(party.representationGap) }}
        </span>
      </li>
    </ol>
    <p class="sr-only">{{ t('votes.compare.caption') }}</p>
  </div>
</template>
