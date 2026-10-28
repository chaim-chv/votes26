<script setup lang="ts">
const { t, locale } = useLocale()
const { number, percent, signedPercent } = useFormat()
const { data } = useResultsState()

const parties = computed(() => data.value?.parties ?? [])
const eligible = computed(() => parties.value.filter((party) => party.passesThreshold))
const below = computed(() => parties.value.filter((party) => !party.passesThreshold))
const meta = computed(() => data.value?.meta)
const insights = computed(() => data.value?.insights)

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

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" :aria-label="t('nav.mandates')">
      <StatCard
        :label="t('mandates.stats.total')"
        :value="number(meta?.totalSeats)"
        icon="i-lucide-landmark"
        tone="primary"
      />
      <StatCard
        :label="t('mandates.stats.eligible')"
        :value="number(insights?.eligibleParties)"
        icon="i-lucide-check"
      />
      <StatCard
        :label="t('mandates.stats.below')"
        :value="number(insights?.belowThresholdParties)"
        icon="i-lucide-filter"
        tone="warning"
      />
      <StatCard
        :label="t('mandates.stats.threshold')"
        :value="percent(meta?.thresholdPct, 2)"
        icon="i-lucide-percent"
      />
    </section>

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
      </section>
    </div>

    <section class="card-quiet overflow-hidden">
      <div class="flex flex-wrap items-end justify-between gap-2 p-4 pb-2 sm:px-6">
        <div>
          <h2 class="text-xl font-bold">{{ t('mandates.table.party') }}</h2>
          <p class="mt-1 text-sm text-muted">{{ t('mandates.table.caption') }}</p>
        </div>
        <p class="text-xs text-muted">{{ t('common.estimated') }}</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] border-collapse text-sm">
          <caption class="sr-only">{{ t('mandates.table.caption') }}</caption>
          <thead>
            <tr class="border-y border-default bg-elevated/50 text-start">
              <th scope="col" class="px-4 py-2.5 text-start font-semibold">{{ t('mandates.table.party') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('mandates.table.votes') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('mandates.table.votePct') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('mandates.table.seats') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('mandates.table.seatPct') }}</th>
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
                    <span class="block font-semibold">
                      {{ locale === 'he' ? party.nameHe : party.nameEn }}
                    </span>
                    <span class="block text-[11px] text-muted">{{ t('common.ballot') }} {{ party.ballot }}</span>
                  </span>
                </span>
              </th>
              <td class="px-3 py-3 tabular">{{ number(party.votes) }}</td>
              <td class="px-3 py-3 tabular">{{ percent(party.votePct) }}</td>
              <td class="px-3 py-3">
                <span class="inline-flex min-w-8 justify-center rounded-md bg-primary/10 px-1.5 py-0.5 font-bold text-primary tabular">
                  {{ number(party.seats) }}
                </span>
              </td>
              <td class="px-3 py-3 tabular">{{ percent(party.seatPct) }}</td>
              <td class="px-3 py-3">
                <span
                  class="rounded-full px-1.5 py-0.5 text-xs font-semibold tabular"
                  :class="
                    party.seatDelta >= 0
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                  "
                >
                  {{ signedPercent(party.seatDelta) }}
                </span>
              </td>
              <td class="px-4 py-3 tabular">{{ party.votesPerSeat ? number(party.votesPerSeat) : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <details class="card-quiet group p-4 open:pb-5 sm:p-6">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-3">
          <span class="flex items-center gap-2.5">
            <span class="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
              <UIcon name="i-lucide-calculator" class="size-4" />
            </span>
            <span class="text-base font-bold">{{ t('mandates.how.title') }}</span>
          </span>
          <UIcon name="i-lucide-chevron-down" class="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p class="mt-3 text-sm leading-6 text-muted">{{ t('mandates.how.body') }}</p>
        <p class="mt-2 text-xs leading-5 text-muted">{{ t('mandates.how.note') }}</p>
      </details>

      <details class="card-quiet group p-4 open:pb-5 sm:p-6">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-3">
          <span class="flex items-center gap-2.5">
            <span class="grid size-9 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" aria-hidden="true">
              <UIcon name="i-lucide-filter" class="size-4" />
            </span>
            <span class="text-base font-bold">{{ t('mandates.below.title') }}</span>
          </span>
          <UIcon name="i-lucide-chevron-down" class="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <p class="mt-3 text-sm leading-6 text-muted">
          {{ t('mandates.below.desc', { votes: number(insights?.wastedVotes) }) }}
        </p>
        <p class="mt-2 text-xs font-medium text-muted">
          {{ t('mandates.below.summary', { count: below.length }) }}
        </p>
        <ul class="mt-2 max-h-64 space-y-0.5 overflow-y-auto pe-1">
          <li v-for="party in below" :key="party.code" class="flex items-center gap-2 rounded-lg py-1 text-sm">
            <PartySwatch :color="party.color" size="sm" />
            <span class="min-w-0 flex-1 truncate">{{ locale === 'he' ? party.nameHe : party.nameEn }}</span>
            <span class="text-xs text-muted tabular">{{ number(party.votes) }}</span>
            <span class="w-12 text-end text-xs tabular">{{ percent(party.votePct) }}</span>
          </li>
        </ul>
      </details>
    </section>

    <p class="text-xs leading-5 text-muted">
      {{ t('mandates.how.note') }} · {{ t('method.notAffiliated') }}
    </p>
  </div>
</template>
