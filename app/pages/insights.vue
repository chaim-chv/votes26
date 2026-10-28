<script setup lang="ts">
const { t, locale } = useLocale()
const { number, percent, decimal } = useFormat()
const { data } = useResultsState()
const insights = computed(() => data.value?.insights)
const camps = computed(() => data.value?.camps ?? [])
const netanyahu = computed(() => camps.value.find((camp) => camp.id === 'netanyahu'))
const change = computed(() => camps.value.find((camp) => camp.id === 'change'))

const comparison = computed(() => data.value?.comparison)


useSeoMeta({
  title: () => `${t('nav.insights')} · votes26`,
  description: () => t('insights.lede'),
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('insights.eyebrow')"
      :title="t('insights.title')"
      :lede="t('insights.lede')"
    >
      <template #actions>
        <UBadge color="neutral" variant="soft" icon="i-lucide-calculator">
          {{ t('common.estimated') }}
        </UBadge>
      </template>
    </PageHeader>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article class="card-quiet p-5">
        <div class="flex items-start gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" aria-hidden="true">
            <UIcon name="i-lucide-filter" class="size-5" />
          </span>
          <div>
            <h2 class="text-base font-bold">{{ t('insights.wasted.title') }}</h2>
            <p class="mt-1 text-3xl font-bold leading-none tabular">
              {{ percent(insights?.wastedPct) }}
            </p>
          </div>
        </div>
        <p class="mt-3 text-sm leading-6 text-muted">
          {{ t('insights.wasted.body', {
            votes: number(insights?.wastedVotes),
            seats: decimal(insights?.wastedSeatsEquivalent),
          }) }}
        </p>
        <p class="mt-2 text-xs leading-5 text-muted">{{ t('insights.wasted.note') }}</p>
        <p v-if="comparison" class="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <ComparisonDelta :value="comparison.system.wastedPct.change" format="pp" :unit-label="t('comparison.ppUnit')" />
          <span>{{ t('comparison.baselineShort') }}: {{ percent(comparison.system.wastedPct.previous) }}</span>
        </p>
      </article>

      <article class="card-quiet p-5">
        <div class="flex items-start gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
            <UIcon name="i-lucide-scale" class="size-5" />
          </span>
          <div>
            <h2 class="text-base font-bold">{{ t('insights.gallagher.title') }}</h2>
            <p class="mt-1 text-3xl font-bold leading-none tabular">
              {{ decimal(insights?.gallagher) }}
            </p>
          </div>
        </div>
        <p class="mt-3 text-sm leading-6 text-muted">
          {{ t('insights.gallagher.body') }}
        </p>
        <p class="mt-2 text-xs leading-5 text-muted">{{ t('insights.gallagher.note') }}</p>
        <p v-if="comparison" class="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <ComparisonDelta :value="comparison.system.gallagher.change" format="decimal" :unit-label="t('comparison.pointsUnit')" />
          <span>{{ t('comparison.baselineShort') }}: {{ decimal(comparison.system.gallagher.previous) }}</span>
        </p>
      </article>

      <article class="card-quiet p-5">
        <div class="flex items-start gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300" aria-hidden="true">
            <UIcon name="i-lucide-users" class="size-5" />
          </span>
          <div>
            <h2 class="text-base font-bold">{{ t('insights.effective.title') }}</h2>
            <p class="mt-1 text-3xl font-bold leading-none tabular">
              {{ decimal(insights?.effectivePartiesSeats) }}
            </p>
            <p class="mt-1 text-[11px] text-muted">{{ t('insights.effective.seatsLabel') }}</p>
          </div>
        </div>
        <p class="mt-3 text-sm leading-6 text-muted">
          {{ t('insights.effective.body', { votes: decimal(insights?.effectivePartiesVotes) }) }}
        </p>
        <p class="mt-2 text-xs leading-5 text-muted">{{ t('insights.effective.note') }}</p>
        <p v-if="comparison" class="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <ComparisonDelta :value="comparison.system.effectivePartiesSeats.change" format="decimal" :unit-label="t('comparison.partiesUnit')" />
          <span>{{ t('comparison.baselineShort') }}: {{ decimal(comparison.system.effectivePartiesSeats.previous) }}</span>
        </p>
      </article>

      <article v-if="comparison" class="card-quiet p-5">
        <div class="flex items-start gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
            <UIcon name="i-lucide-check-check" class="size-5" />
          </span>
          <div>
            <h2 class="text-base font-bold">{{ t('comparison.eligibleParties') }}</h2>
            <p class="mt-1 text-3xl font-bold leading-none tabular">
              {{ number(comparison.system.eligibleParties.current) }}
            </p>
          </div>
        </div>
        <p class="mt-3 text-sm leading-6 text-muted">{{ t('comparison.eligibleBody') }}</p>
        <p class="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <ComparisonDelta :value="comparison.system.eligibleParties.change" format="integer" :unit-label="t('comparison.partiesUnit')" />
          <span>{{ t('comparison.baselineShort') }}: {{ number(comparison.system.eligibleParties.previous) }}</span>
        </p>
      </article>
    </div>

    <p v-if="comparison" class="text-[11px] leading-5 text-muted">
      {{ t('comparison.label') }} · {{ t('comparison.currentStatus') }} · {{ t('comparison.previousStatus') }} ·
      {{ t('comparison.officialSeatsNote') }}
    </p>

    <section class="card-quiet p-4 sm:p-6">
      <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <h2 class="text-xl font-bold">{{ t('insights.threshold.title') }}</h2>
          <p class="mt-2 text-sm leading-6 text-muted">
            {{ t('insights.threshold.body', {
              pct: percent(data?.meta?.thresholdPct, 2),
              votes: number(insights?.thresholdVotes),
            }) }}
          </p>
        </div>
        <div class="rounded-xl bg-elevated/60 p-4 md:min-w-56">
          <p class="text-xs font-medium text-muted">{{ t('insights.ratio.title') }}</p>
          <p class="mt-1 text-2xl font-bold tabular">{{ number(insights?.quota) }}</p>
          <p class="mt-1 text-xs leading-5 text-muted">
            {{ t('insights.ratio.body', { votes: number(insights?.quota) }) }}
          </p>
        </div>
      </div>
    </section>

    <UAlert
      color="primary"
      variant="soft"
      icon="i-lucide-sparkles"
      :title="t('insights.takeaway.title')"
      :description="
        t('insights.takeaway.body', {
          netanyahu: number(netanyahu?.seats),
          change: number(change?.seats),
        })
      "
    />

    <p class="text-xs leading-5 text-muted">
      {{ t('common.learnMore') }} —
      <NuxtLink to="/method" class="font-medium text-primary hover:underline">
        {{ t('nav.method') }}
      </NuxtLink>
    </p>
  </div>
</template>
