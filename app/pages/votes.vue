<script setup lang="ts">
const { t, locale } = useLocale()
const { number, percent, decimal } = useFormat()
const { data } = useResultsState()

const showAll = ref(true)
const parties = computed(() => data.value?.parties ?? [])
const eligible = computed(() => parties.value.filter((party) => party.passesThreshold))
const visible = computed(() => (showAll.value ? parties.value : eligible.value))
const meta = computed(() => data.value?.meta)
const insights = computed(() => data.value?.insights)

useSeoMeta({
  title: () => `${t('nav.votes')} · votes26`,
  description: () => t('votes.lede'),
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('votes.eyebrow')"
      :title="t('votes.title')"
      :lede="t('votes.lede')"
    >
      <template #actions>
        <UBadge color="primary" variant="soft" icon="i-lucide-check">
          {{ number(meta?.validVotes) }} {{ t('common.votes') }}
        </UBadge>
        <UBadge color="neutral" variant="soft" icon="i-lucide-filter">
          {{ t('common.threshold') }} {{ percent(meta?.thresholdPct, 2) }}
        </UBadge>
      </template>
    </PageHeader>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" :aria-label="t('nav.votes')">
      <StatCard
        :label="t('overview.status.valid')"
        :value="number(meta?.validVotes)"
        icon="i-lucide-check-check"
        tone="primary"
      />
      <StatCard
        :label="t('mandates.stats.eligible')"
        :value="number(insights?.eligibleParties)"
        icon="i-lucide-list"
      />
      <StatCard
        :label="t('mandates.stats.below')"
        :value="number(insights?.belowThresholdParties)"
        icon="i-lucide-filter"
        tone="warning"
      />
      <StatCard
        :label="t('overview.insights.wasted')"
        :value="percent(insights?.wastedPct)"
        :hint="`${number(insights?.wastedVotes)} ${t('common.votes')}`"
        icon="i-lucide-ban"
        tone="warning"
      />
    </section>

    <section class="card-quiet p-4 sm:p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold">{{ t('common.partyList') }}</h2>
          <p class="mt-1 text-sm text-muted">{{ t('votes.table.caption') }}</p>
        </div>
        <div class="flex rounded-lg border border-default p-0.5" role="group" :aria-label="t('votes.filter.label')">
          <button
            type="button"
            class="min-h-9 rounded-md px-3 text-xs font-semibold transition-colors"
            :class="showAll ? 'bg-primary text-white dark:text-neutral-950' : 'text-muted hover:bg-elevated hover:text-default'"
            :aria-pressed="showAll"
            @click="showAll = true"
          >
            {{ t('votes.filter.all') }}
          </button>
          <button
            type="button"
            class="min-h-9 rounded-md px-3 text-xs font-semibold transition-colors"
            :class="!showAll ? 'bg-primary text-white dark:text-neutral-950' : 'text-muted hover:bg-elevated hover:text-default'"
            :aria-pressed="!showAll"
            @click="showAll = false"
          >
            {{ t('votes.filter.eligible') }}
          </button>
        </div>
      </div>

      <div class="mt-4">
        <VoteBars :parties="visible" />
      </div>
    </section>

    <section class="card-quiet p-4 sm:p-6">
      <h2 class="text-xl font-bold">{{ t('votes.compare.title') }}</h2>
      <p class="mt-1 max-w-2xl text-sm leading-6 text-muted">{{ t('votes.compare.desc') }}</p>
      <div class="mt-4">
        <VoteSeatCompare :parties="parties" />
      </div>
    </section>

    <UAlert
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      :title="t('votes.insight.title')"
      :description="
        t('votes.insight.body', {
          votes: number(insights?.wastedVotes),
          pct: percent(insights?.wastedPct),
          seats: decimal(insights?.wastedSeatsEquivalent),
        })
      "
    />

    <details class="card-quiet group p-4 open:pb-5 sm:p-6">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-3">
        <span class="flex items-center gap-2.5">
          <span class="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
            <UIcon name="i-lucide-table" class="size-4" />
          </span>
          <span class="text-base font-bold">{{ t('a11y.dataTable') }}</span>
        </span>
        <UIcon name="i-lucide-chevron-down" class="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[640px] border-collapse text-sm">
          <caption class="sr-only">{{ t('votes.table.caption') }}</caption>
          <thead>
            <tr class="border-y border-default bg-elevated/50">
              <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('common.party') }}</th>
              <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('common.votes') }}</th>
              <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('common.votePct') }}</th>
              <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('votes.table.status') }}</th>
              <th scope="col" class="px-3 py-2 text-start font-semibold">{{ t('common.seats') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="party in parties" :key="party.code" class="border-b border-default/70 last:border-0">
              <th scope="row" class="px-3 py-2 text-start font-normal">
                <span class="flex items-center gap-2">
                  <PartySwatch :color="party.color" size="sm" />
                  {{ locale === 'he' ? party.nameHe : party.nameEn }}
                </span>
              </th>
              <td class="px-3 py-2 tabular">{{ number(party.votes) }}</td>
              <td class="px-3 py-2 tabular">{{ percent(party.votePct) }}</td>
              <td class="px-3 py-2">
                <span :class="party.passesThreshold ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted'">
                  {{ party.passesThreshold ? t('votes.table.passed') : t('votes.table.failed') }}
                </span>
              </td>
              <td class="px-3 py-2 font-semibold tabular">{{ number(party.seats) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>
