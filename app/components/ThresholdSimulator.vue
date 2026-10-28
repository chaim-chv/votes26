<script setup lang="ts">
import type { PartyResult } from '~~/shared/election/types'
import { applyThreshold } from '~~/shared/election/threshold'

const props = withDefaults(
  defineProps<{
    parties: PartyResult[]
    validVotes: number
    currentThreshold: number
    totalSeats?: number
  }>(),
  { totalSeats: 120 },
)

const { t, locale } = useLocale()
const { number, percent } = useFormat()
const id = useId()

const threshold = ref(props.currentThreshold)
const quickPicks = [0, 1, 2, 3.25, 5, 10]

const scenario = computed(() =>
  applyThreshold(props.parties, threshold.value, props.validVotes, props.totalSeats),
)

const currentSeats = computed(
  () => new Map(props.parties.map((party) => [party.code, party.seats])),
)

const affected = computed(() =>
  scenario.value.parties.filter(
    (party) => party.seats > 0 || (currentSeats.value.get(party.code) ?? 0) > 0,
  ),
)

const changed = computed(() =>
  affected.value.filter((party) => party.seats !== (currentSeats.value.get(party.code) ?? 0)),
)

const newSeats = computed(() =>
  scenario.value.parties
    .filter((party) => party.seats > 0 && (currentSeats.value.get(party.code) ?? 0) === 0)
    .reduce((sum, party) => sum + party.seats, 0),
)

const thresholdLabel = computed(() =>
  threshold.value.toFixed(2).replace(/\.?0+$/, ''),
)

const isCurrent = computed(
  () => Math.abs(threshold.value - props.currentThreshold) < 0.001,
)

function setThreshold(value: number) {
  threshold.value = value
}

function reset() {
  threshold.value = props.currentThreshold
}
</script>

<template>
  <section
    id="threshold-simulator"
    class="card-quiet scroll-mt-24 p-4 sm:p-6"
    aria-labelledby="threshold-simulator-title"
  >
    <div class="max-w-3xl">
      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {{ t('threshold.eyebrow') }}
      </p>
      <h2 id="threshold-simulator-title" class="mt-1 text-xl font-bold sm:text-2xl">
        {{ t('threshold.title') }}
      </h2>
      <p class="mt-1 text-sm leading-6 text-muted">{{ t('threshold.lede') }}</p>
    </div>

    <div class="mt-5 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div>
        <label :for="id" class="text-sm font-semibold">{{ t('threshold.label') }}</label>
        <div dir="ltr" class="mt-2 flex items-center gap-3">
          <input
            :id="id"
            v-model.number="threshold"
            type="range"
            min="0"
            max="10"
            step="0.25"
            class="h-2 w-full cursor-pointer accent-primary"
            :aria-valuetext="`${thresholdLabel}%`"
          />
          <output
            :for="id"
            class="min-w-20 rounded-lg border border-default bg-elevated/60 px-2.5 py-1.5 text-center text-lg font-bold tabular"
          >
            {{ thresholdLabel }}%
          </output>
        </div>
        <div dir="ltr" class="mt-1 flex justify-between text-[11px] text-muted" aria-hidden="true">
          <span>0%</span>
          <span>10%</span>
        </div>

        <div class="mt-4">
          <p class="mb-2 text-xs font-medium text-muted">{{ t('threshold.quick') }}</p>
          <div class="flex flex-wrap gap-1.5">
            <UButton
              v-for="pick in quickPicks"
              :key="pick"
              size="xs"
              :color="Math.abs(threshold - pick) < 0.001 ? 'primary' : 'neutral'"
              variant="soft"
              :class="Math.abs(threshold - pick) < 0.001 ? 'ring-2 ring-primary' : ''"
              :aria-pressed="Math.abs(threshold - pick) < 0.001"
              @click="setThreshold(pick)"
            >
              {{ pick }}%
            </UButton>
            <UButton
              v-if="!isCurrent"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-rotate-ccw"
              @click="reset"
            >
              {{ t('threshold.reset') }}
            </UButton>
          </div>
        </div>

        <dl class="mt-5 grid grid-cols-3 gap-2">
          <div class="rounded-xl bg-elevated/60 p-3">
            <dt class="text-[11px] leading-4 text-muted">{{ t('threshold.passed') }}</dt>
            <dd class="mt-1 text-xl font-bold tabular">{{ number(scenario.eligibleCodes.length) }}</dd>
          </div>
          <div class="rounded-xl bg-elevated/60 p-3">
            <dt class="text-[11px] leading-4 text-muted">{{ t('threshold.wasted') }}</dt>
            <dd class="mt-1 text-xl font-bold tabular">{{ number(scenario.wastedVotes) }}</dd>
            <dd class="text-[11px] text-muted tabular">{{ percent(scenario.wastedPct) }}</dd>
          </div>
          <div class="rounded-xl bg-elevated/60 p-3">
            <dt class="text-[11px] leading-4 text-muted">{{ t('threshold.seats') }}</dt>
            <dd class="mt-1 text-xl font-bold tabular">{{ number(newSeats) }}</dd>
          </div>
        </dl>

        <p class="sr-only" aria-live="polite">
          {{ t('threshold.value', { value: thresholdLabel }) }}.
          {{ t('threshold.passed') }}: {{ scenario.eligibleCodes.length }}.
          {{ t('threshold.wasted') }}: {{ percent(scenario.wastedPct) }}.
        </p>

        <p v-if="threshold === 0" class="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          {{ t('threshold.zeroNote') }}
        </p>
      </div>

      <div class="min-w-0 rounded-xl border border-default p-3">
        <SeatHemicycle :parties="scenario.parties" :summary="t('threshold.table.caption')" />
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      <span class="font-medium text-default">{{ t('threshold.current') }}</span>
      <span>{{ t('mandates.below.thresholdLine', { pct: percent(scenario.thresholdPct, 2), votes: number(scenario.thresholdVotes) }) }}</span>
    </div>

    <p class="mt-3 text-xs leading-5 text-muted">{{ t('threshold.caveat') }}</p>

    <details class="group mt-4 rounded-xl border border-default">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold">
        <span>{{ t('threshold.table.title') }}</span>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-4 text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div class="overflow-x-auto border-t border-default">
        <table class="w-full min-w-[560px] border-collapse text-sm">
          <caption class="sr-only">{{ t('threshold.table.caption') }}</caption>
          <thead>
            <tr class="bg-elevated/50">
              <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('threshold.table.party') }}</th>
              <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('threshold.table.seats') }}</th>
              <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('threshold.table.delta') }}</th>
              <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('threshold.table.votePct') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="party in affected" :key="party.code" class="border-t border-default/70">
              <th scope="row" class="px-3 py-2 text-start font-normal">
                <NuxtLink
                  :to="`/parties/${encodeURIComponent(party.code)}`"
                  class="inline-flex items-center gap-2 hover:text-primary hover:underline"
                >
                  <PartySwatch :color="party.color" size="sm" />
                  {{ locale === 'he' ? party.nameHe : party.nameEn }}
                </NuxtLink>
              </th>
              <td class="px-3 py-2 tabular">{{ number(party.seats) }}</td>
              <td class="px-3 py-2">
                <span
                  v-if="party.seats !== (currentSeats.get(party.code) ?? 0)"
                  class="rounded-full px-1.5 py-0.5 text-xs font-semibold tabular"
                  :class="
                    party.seats > (currentSeats.get(party.code) ?? 0)
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                  "
                >
                  {{ party.seats > (currentSeats.get(party.code) ?? 0) ? '+' : '−'
                  }}{{ Math.abs(party.seats - (currentSeats.get(party.code) ?? 0)) }}
                </span>
                <span v-else class="text-xs text-muted">—</span>
              </td>
              <td class="px-3 py-2 tabular">{{ percent(party.votePct) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="changed.length === 0" class="border-t border-default p-3 text-xs text-muted">
        {{ t('threshold.noChange') }}
      </p>
    </details>
  </section>
</template>
