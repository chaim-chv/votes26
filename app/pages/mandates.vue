<script setup lang="ts">
const { t, locale } = useLocale()
const { number, percent, signedPercent } = useFormat()
const { data } = useResultsState()

const parties = computed(() => data.value?.parties ?? [])
const eligible = computed(() => parties.value.filter((party) => party.passesThreshold))
const below = computed(() => parties.value.filter((party) => !party.passesThreshold))
const meta = computed(() => data.value?.meta)
const insights = computed(() => data.value?.insights)
const comparison = computed(() => data.value?.comparison)
const thresholdVotes = computed(() => insights.value?.thresholdVotes ?? 0)
const belowWithGap = computed(() =>
  [...below.value]
    .sort((a, b) => b.votes - a.votes)
    .map((party) => ({
      ...party,
      missingVotes: Math.max(0, thresholdVotes.value - party.votes),
      missingPct: Math.max(0, (meta.value?.thresholdPct ?? 0) - party.votePct),
    })),
)
const closest = computed(() => belowWithGap.value[0])

useSeoMeta({
  title: () => `${t('nav.mandates')} · votes26`,
  description: () => t('mandates.lede'),
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('mandates.eyebrow')"
      :title="t('mandates.title')"
      :lede="t('mandates.lede')"
    >
      <template #actions>
        <UBadge color="primary" variant="soft" icon="i-lucide-armchair">
          {{ t('common.seatCount', { count: 120 }) }}
        </UBadge>
        <UBadge color="neutral" variant="soft" icon="i-lucide-calculator">
          {{ t('common.estimated') }}
        </UBadge>
      </template>
    </PageHeader>

    <div class="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
      <section class="card-quiet p-4 sm:p-6">
        <h2 class="text-xl font-bold">{{ t('overview.hemicycle.title') }}</h2>
        <p class="mt-1 text-sm leading-6 text-muted">{{ t('overview.hemicycle.caption') }}</p>
        <div class="mt-3">
          <SeatHemicycle :parties="parties" :summary="t('overview.hemicycle.caption')" />
        </div>
      </section>

      <section class="card-quiet p-4 sm:p-6">
        <h2 class="text-lg font-bold">{{ t('overview.coalition.title') }}</h2>
        <p class="mt-1 text-sm leading-6 text-muted">{{ t('overview.coalition.desc') }}</p>
        <div class="mt-4">
          <CoalitionBar :camps="data?.camps ?? []" compact />
        </div>
        <p class="mt-3 text-xs leading-5 text-muted">{{ t('overview.coalition.caveat') }}</p>

        <details class="group mt-4 rounded-xl border border-default">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold">
            <span class="flex items-center gap-2">
              <UIcon name="i-lucide-calculator" class="size-4 text-primary" aria-hidden="true" />
              {{ t('mandates.how.title') }}
            </span>
            <UIcon name="i-lucide-chevron-down" class="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div class="border-t border-default p-3">
            <p class="text-sm leading-6 text-muted">{{ t('mandates.how.body') }}</p>
            <p class="mt-2 text-xs leading-5 text-muted">{{ t('mandates.how.note') }}</p>
          </div>
        </details>
      </section>
    </div>

    <section class="card-quiet overflow-hidden">
      <div class="flex flex-wrap items-end justify-between gap-2 p-4 pb-2 sm:px-6">
        <div>
          <h2 class="text-xl font-bold">{{ t('mandates.table.title') }}</h2>
          <p class="mt-1 text-sm text-muted">{{ t('mandates.table.caption') }}</p>
        </div>
        <div class="text-end">
          <p class="text-xs text-muted">{{ t('common.estimated') }}</p>
          <p v-if="comparison" class="mt-0.5 text-[11px] text-muted">
            {{ t('comparison.currentStatus') }} · {{ t('comparison.previousStatus') }}
          </p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-collapse text-sm">
          <caption class="sr-only">{{ t('mandates.table.caption') }}</caption>
          <thead>
            <tr class="border-y border-default bg-elevated/50 text-start">
              <th scope="col" class="px-4 py-2.5 text-start font-semibold">{{ t('mandates.table.party') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('mandates.table.seats') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('comparison.tableSeat') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('mandates.table.votes') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('mandates.table.votePct') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('mandates.table.delta') }}</th>
              <th scope="col" class="px-4 py-2.5 text-start font-semibold">{{ t('mandates.table.ratio') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="party in eligible"
              :key="party.code"
              class="border-b border-default/70 last:border-0 hover:bg-elevated/40"
            >
              <th scope="row" class="px-4 py-3 text-start font-normal">
                <span class="flex items-center gap-2.5">
                  <PartySwatch :color="party.color" />
                  <span class="min-w-0">
                    <NuxtLink
                      :to="`/parties/${encodeURIComponent(party.code)}`"
                      class="block font-semibold hover:text-primary hover:underline"
                    >
                      {{ locale === 'he' ? party.nameHe : party.nameEn }}
                    </NuxtLink>
                    <span class="block text-[11px] text-muted">{{ t('common.ballot') }} {{ party.ballot }}</span>
                  </span>
                </span>
              </th>
              <td class="px-3 py-3">
                <span class="inline-flex min-w-8 justify-center rounded-md bg-primary/10 px-1.5 py-0.5 font-bold text-primary tabular">
                  {{ number(party.seats) }}
                </span>
              </td>
              <td class="px-3 py-3">
                <template v-if="comparison?.parties[party.code]">
                  <ComparisonDelta
                    v-if="comparison.parties[party.code]?.comparable"
                    :value="comparison.parties[party.code]?.seatChange"
                    format="seats"
                    :unit-label="t('comparison.seatUnit')"
                  />
                  <span
                    v-else-if="comparison.parties[party.code]?.relation === 'new'"
                    class="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {{ t('comparison.newParty') }}
                  </span>
                  <span
                    v-else
                    class="text-xs text-muted"
                    :title="t('comparison.notComparable')"
                  >—</span>
                </template>
                <span v-else class="text-xs text-muted">—</span>
              </td>
              <td class="px-3 py-3 tabular">{{ number(party.votes) }}</td>
              <td class="px-3 py-3 tabular">{{ percent(party.votePct) }}</td>
              <td class="px-3 py-3">
                <span
                  class="rounded-full px-1.5 py-0.5 text-xs font-semibold tabular"
                  :class="
                    party.representationGap >= 0
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                  "
                >
                  {{ signedPercent(party.representationGap) }}
                </span>
              </td>
              <td class="px-4 py-3 tabular">{{ party.votesPerSeat ? number(party.votesPerSeat) : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="comparison" class="border-t border-default p-4 sm:px-6">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h3 class="text-sm font-bold">{{ t('comparison.groupsTitle') }}</h3>
          <p class="text-[11px] text-muted">{{ t('comparison.officialSeatsNote') }}</p>
        </div>
        <ul class="mt-2 grid gap-2 md:grid-cols-3">
          <li
            v-for="group in comparison.groups"
            :key="group.id"
            class="rounded-lg border border-default px-3 py-2 text-xs"
          >
            <p class="font-semibold">{{ locale === 'he' ? group.nameHe : group.nameEn }}</p>
            <p class="mt-1 flex flex-wrap items-center gap-1.5 text-muted">
              <span>2022: {{ number(group.previousSeats) }}</span>
              <ComparisonDelta
                :value="group.seatChange"
                format="seats"
                :unit-label="t('comparison.seatUnit')"
              />
              <span>2026: {{ number(group.currentSeats) }}</span>
            </p>
          </li>
        </ul>
        <p class="mt-2 text-[11px] text-muted">{{ t('comparison.groupsNote') }}</p>
      </div>
    </section>

    <ThresholdSimulator
      :parties="parties"
      :valid-votes="meta?.validVotes ?? 0"
      :current-threshold="meta?.thresholdPct ?? 3.25"
    />

    <section id="below-threshold" class="card-quiet scroll-mt-24 p-4 sm:p-6" aria-labelledby="below-threshold-title">
        <div class="flex items-start gap-3">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" aria-hidden="true">
            <UIcon name="i-lucide-filter" class="size-4" />
          </span>
          <div>
            <h2 id="below-threshold-title" class="text-base font-bold">{{ t('mandates.below.title') }}</h2>
            <p class="mt-1 text-sm leading-6 text-muted">
              {{ t('mandates.below.desc', { votes: number(insights?.wastedVotes) }) }}
            </p>
          </div>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl bg-elevated/60 p-3">
            <p class="text-xs text-muted">{{ t('common.threshold') }}</p>
            <p class="mt-1 font-semibold tabular">
              {{ t('mandates.below.thresholdLine', { pct: percent(meta?.thresholdPct ?? 3.25, 2), votes: number(thresholdVotes) }) }}
            </p>
          </div>
          <div v-if="closest" class="rounded-xl bg-amber-50 p-3 dark:bg-amber-950">
            <p class="text-xs font-medium text-amber-800 dark:text-amber-200">{{ t('mandates.below.closestTitle') }}</p>
            <p class="mt-1 text-sm font-semibold leading-6 text-amber-950 dark:text-amber-100">
              {{
                t('mandates.below.closest', {
                  name: locale === 'he' ? closest.nameHe : closest.nameEn,
                  votes: number(closest.missingVotes),
                  pct: percent(closest.missingPct),
                })
              }}
            </p>
          </div>
        </div>

        <p class="mt-3 text-xs leading-5 text-muted">{{ t('mandates.below.cliff') }}</p>
        <p class="mt-1 text-xs leading-5 text-muted">
          {{ t('mandates.below.simulateHint') }}
          <a href="#threshold-simulator" class="font-medium text-primary hover:underline">
            {{ t('mandates.below.simulate') }}
          </a>
        </p>

        <details class="group mt-4 rounded-xl border border-default">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold">
            <span>{{ t('mandates.below.summary', { count: below.length }) }}</span>
            <UIcon name="i-lucide-chevron-down" class="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div class="overflow-x-auto border-t border-default">
            <table class="w-full min-w-[720px] border-collapse text-sm">
              <caption class="sr-only">{{ t('mandates.below.table.caption') }}</caption>
              <thead>
                <tr class="bg-elevated/50">
                  <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('mandates.below.table.party') }}</th>
                  <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('mandates.below.table.votes') }}</th>
                  <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('mandates.below.table.share') }}</th>
                  <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('mandates.below.table.gap') }}</th>
                  <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('mandates.below.table.progress') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="party in belowWithGap" :key="party.code" class="border-t border-default/70">
                  <th scope="row" class="px-3 py-2 text-start font-normal">
                    <NuxtLink
                      :to="`/parties/${encodeURIComponent(party.code)}`"
                      class="inline-flex items-center gap-2 hover:text-primary hover:underline"
                    >
                      <PartySwatch :color="party.color" size="sm" />
                      {{ locale === 'he' ? party.nameHe : party.nameEn }}
                    </NuxtLink>
                  </th>
                  <td class="px-3 py-2 tabular">{{ number(party.votes) }}</td>
                  <td class="px-3 py-2 tabular">{{ percent(party.votePct) }}</td>
                  <td class="px-3 py-2 tabular">
                    <span class="font-semibold">{{ number(party.missingVotes) }}</span>
                    <span class="text-xs text-muted"> · {{ percent(party.missingPct) }}</span>
                  </td>
                  <td class="px-3 py-2">
                    <div class="flex items-center gap-2">
                      <div class="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                        <div
                          class="h-full rounded-full bg-amber-500"
                          :style="{ width: `${Math.min(100, (party.votes / thresholdVotes) * 100)}%` }"
                          aria-hidden="true"
                        />
                      </div>
                      <span class="text-[11px] text-muted tabular">
                        {{ percent((party.votes / thresholdVotes) * 100) }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </section>

    <p class="text-xs leading-5 text-muted">
      {{ t('mandates.how.note') }} · {{ t('method.notAffiliated') }}
    </p>
  </div>
</template>
