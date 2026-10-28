<script setup lang="ts">
const { t } = useLocale()
const { number, percent, decimal, date } = useFormat()
const { data, pending, error, hasData, refreshNow } = useResultsState()

const meta = computed(() => data.value?.meta)
const parties = computed(() => data.value?.parties ?? [])
const insights = computed(() => data.value?.insights)
const camps = computed(() => data.value?.camps ?? [])

const netanyahu = computed(() => camps.value.find((camp) => camp.id === 'netanyahu'))
const change = computed(() => camps.value.find((camp) => camp.id === 'change'))

useSeoMeta({
  title: () => `${t('nav.overview')} · votes26`,
  description: () => t('app.description'),
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('overview.eyebrow')"
      :title="t('overview.title')"
      :lede="t('overview.lede')"
    >
      <template #actions>
        <UBadge v-if="meta" color="neutral" variant="soft" icon="i-lucide-calendar">
          {{ date(meta.date) }}
        </UBadge>
        <UBadge v-if="meta" color="primary" variant="soft" icon="i-lucide-percent">
          {{ t('common.threshold') }} {{ percent(meta.thresholdPct, 2) }}
        </UBadge>
      </template>
    </PageHeader>

    <UAlert
      color="neutral"
      variant="soft"
      icon="i-lucide-clock"
      :title="t('overview.provisional.title')"
      :description="t('overview.provisional.body')"
    />

    <UAlert
      v-if="error && !hasData"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      :title="t('error.title')"
      :description="t('error.body')"
      :actions="[{ label: t('error.retry'), onClick: refreshNow }]"
    />

    <div v-if="pending && !hasData" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="index in 4" :key="index" class="h-28 animate-pulse rounded-2xl bg-elevated" />
    </div>

    <template v-else-if="meta">
      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" :aria-label="t('nav.overview')">
        <StatCard
          :label="t('overview.status.counted')"
          :value="number(meta.stationsCounted)"
          :hint="t('overview.status.countedHint')"
          icon="i-lucide-vote"
          tone="primary"
        />
        <StatCard
          :label="t('overview.status.valid')"
          :value="number(meta.validVotes)"
          :hint="t('overview.status.validHint')"
          icon="i-lucide-check-check"
        />
        <StatCard
          :label="t('overview.status.turnout')"
          :value="percent(meta.turnoutPct)"
          :hint="t('overview.status.turnoutHint', { eligible: number(meta.eligibleVoters) })"
          icon="i-lucide-users"
        />
        <StatCard
          :label="t('overview.status.invalid')"
          :value="number(meta.invalidVotes)"
          :hint="t('overview.status.invalidHint')"
          icon="i-lucide-ban"
          tone="warning"
        />
      </section>

      <div class="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
        <section class="card-quiet p-4 sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold">{{ t('overview.hemicycle.title') }}</h2>
              <p class="mt-1 max-w-xl text-sm leading-6 text-muted">
                {{ t('overview.hemicycle.desc') }}
              </p>
            </div>
            <UBadge color="neutral" variant="soft" icon="i-lucide-armchair">
              {{ t('common.seatCount', { count: 120 }) }}
            </UBadge>
          </div>

          <div class="mt-4">
            <SeatHemicycle
              :parties="parties"
              :summary="t('overview.hemicycle.caption')"
            />
          </div>

          <div class="mt-4 border-t border-default pt-4">
            <SeatLegend :parties="parties" show-votes />
          </div>
        </section>

        <div class="space-y-4">
          <section class="card-quiet p-4 sm:p-6">
            <h2 class="text-xl font-bold">{{ t('overview.coalition.title') }}</h2>
            <p class="mt-1 text-sm leading-6 text-muted">{{ t('overview.coalition.desc') }}</p>
            <div class="mt-4">
              <CoalitionBar :camps="camps" :total-seats="120" :majority="61" compact />
            </div>
            <p class="mt-3 text-xs leading-5 text-muted">{{ t('overview.coalition.caveat') }}</p>
            <UButton
              to="/blocs"
              color="neutral"
              variant="soft"
              size="sm"
              trailing-icon="i-lucide-arrow-up-right"
              class="mt-3"
            >
              {{ t('nav.blocs') }}
            </UButton>
          </section>

          <section class="card-quiet p-4 sm:p-6">
            <h2 class="text-sm font-semibold text-muted">{{ t('overview.insights.title') }}</h2>
            <dl class="mt-3 space-y-3">
              <div>
                <dt class="flex items-start gap-3">
                  <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" aria-hidden="true">
                    <UIcon name="i-lucide-filter" class="size-4" />
                  </span>
                  <span class="text-sm font-semibold">{{ t('overview.insights.wasted') }}</span>
                </dt>
                <dd class="mt-0.5 ps-12 text-xs leading-5 text-muted">
                  {{ t('overview.insights.wastedBody', { seats: decimal(insights?.wastedSeatsEquivalent) }) }}
                </dd>
              </div>
              <div>
                <dt class="flex items-start gap-3">
                  <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                    <UIcon name="i-lucide-crown" class="size-4" />
                  </span>
                  <span class="text-sm font-semibold">{{ t('overview.insights.largest') }}</span>
                </dt>
                <dd class="mt-0.5 ps-12 text-xs leading-5 text-muted">
                  {{ t('overview.insights.largestBody', { seats: insights?.largestPartySeats ?? 0 }) }}
                </dd>
              </div>
              <div>
                <dt class="flex items-start gap-3">
                  <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300" aria-hidden="true">
                    <UIcon name="i-lucide-scale" class="size-4" />
                  </span>
                  <span class="text-sm font-semibold">{{ t('overview.insights.ratio') }}</span>
                </dt>
                <dd class="mt-0.5 ps-12 text-xs leading-5 text-muted">
                  {{ t('overview.insights.ratioBody', { votes: number(insights?.quota) }) }}
                </dd>
              </div>
            </dl>
            <UButton
              to="/insights"
              color="neutral"
              variant="ghost"
              size="sm"
              trailing-icon="i-lucide-arrow-up-right"
              class="mt-2 px-0"
            >
              {{ t('overview.insights.link') }}
            </UButton>
          </section>
        </div>
      </div>

      <section class="grid gap-4 md:grid-cols-2">
        <NuxtLink
          to="/mandates"
          class="group card-quiet flex gap-4 p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
            <UIcon name="i-lucide-armchair" class="size-5" />
          </span>
          <span class="min-w-0">
            <span class="flex items-center gap-1 text-base font-bold">
              {{ t('overview.realistic.title') }}
              <UIcon name="i-lucide-arrow-up-right" class="size-4 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
            </span>
            <span class="mt-1 block text-sm leading-6 text-muted">{{ t('overview.realistic.body') }}</span>
          </span>
        </NuxtLink>

        <NuxtLink
          to="/votes"
          class="group card-quiet flex gap-4 p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" aria-hidden="true">
            <UIcon name="i-lucide-list" class="size-5" />
          </span>
          <span class="min-w-0">
            <span class="flex items-center gap-1 text-base font-bold">
              {{ t('overview.actual.title') }}
              <UIcon name="i-lucide-arrow-up-right" class="size-4 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
            </span>
            <span class="mt-1 block text-sm leading-6 text-muted">{{ t('overview.actual.body') }}</span>
          </span>
        </NuxtLink>
      </section>
    </template>
  </div>
</template>
