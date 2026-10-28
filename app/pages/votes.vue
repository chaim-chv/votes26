<script setup lang="ts">
const { t } = useLocale()
const { number, percent, decimal } = useFormat()
const { data } = useResultsState()

const showAll = ref(false)
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


  </div>
</template>
