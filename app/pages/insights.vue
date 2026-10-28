<script setup lang="ts">
import type { PartyResult } from '~~/shared/election/types'
const { t, locale } = useLocale()
const { number, percent, signedPercent, decimal } = useFormat()
const { data } = useResultsState()
const insights = computed(() => data.value?.insights)
const parties = computed(() => data.value?.parties ?? [])
const camps = computed(() => data.value?.camps ?? [])
const byCode = computed(() => new Map(parties.value.map((party) => [party.code, party])))

const over = computed(() =>
  (insights.value?.overrepresented ?? [])
    .map((entry) => byCode.value.get(entry.code))
    .filter((party): party is PartyResult => Boolean(party)),
)
const under = computed(() =>
  (insights.value?.underrepresented ?? [])
    .map((entry) => byCode.value.get(entry.code))
    .filter((party): party is PartyResult => Boolean(party)),
)

const netanyahu = computed(() => camps.value.find((camp) => camp.id === 'netanyahu'))
const change = computed(() => camps.value.find((camp) => camp.id === 'change'))

const eligible = computed(() =>
  [...parties.value]
    .filter((party) => party.seats > 0)
    .sort((a, b) => b.seatDelta - a.seatDelta),
)

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

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article class="card-quiet p-5 md:col-span-2 xl:col-span-1">
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
            pct: percent(insights?.wastedPct),
            seats: decimal(insights?.wastedSeatsEquivalent),
          }) }}
        </p>
        <p class="mt-2 text-xs leading-5 text-muted">{{ t('insights.wasted.note') }}</p>
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
          {{ t('insights.gallagher.body', { value: decimal(insights?.gallagher) }) }}
        </p>
        <p class="mt-2 text-xs leading-5 text-muted">{{ t('insights.gallagher.note') }}</p>
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
          </div>
        </div>
        <p class="mt-3 text-sm leading-6 text-muted">
          {{ t('insights.effective.body', {
            votes: decimal(insights?.effectivePartiesVotes),
            seats: decimal(insights?.effectivePartiesSeats),
          }) }}
        </p>
        <p class="mt-2 text-xs leading-5 text-muted">{{ t('insights.effective.note') }}</p>
      </article>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <section class="card-quiet p-4 sm:p-6">
        <h2 class="text-xl font-bold">{{ t('insights.representation.title') }}</h2>
        <p class="mt-1 text-sm leading-6 text-muted">{{ t('insights.representation.body') }}</p>
        <p class="mt-1 text-xs leading-5 text-muted">{{ t('insights.representation.note') }}</p>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <UIcon name="i-lucide-trending-up" class="size-4" aria-hidden="true" />
              {{ t('insights.representation.over') }}
            </h3>
            <ul class="space-y-1.5">
              <li v-for="party in over" :key="party.code" class="flex items-center gap-2 text-sm">
                <PartySwatch :color="party.color" size="sm" />
                <span class="min-w-0 flex-1 truncate">{{ locale === 'he' ? party.nameHe : party.nameEn }}</span>
                <span class="font-semibold text-emerald-700 tabular dark:text-emerald-300">
                  {{ signedPercent(party.seatDelta) }}
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-300">
              <UIcon name="i-lucide-trending-down" class="size-4" aria-hidden="true" />
              {{ t('insights.representation.under') }}
            </h3>
            <ul class="space-y-1.5">
              <li v-for="party in under" :key="party.code" class="flex items-center gap-2 text-sm">
                <PartySwatch :color="party.color" size="sm" />
                <span class="min-w-0 flex-1 truncate">{{ locale === 'he' ? party.nameHe : party.nameEn }}</span>
                <span class="font-semibold text-rose-700 tabular dark:text-rose-300">
                  {{ signedPercent(party.seatDelta) }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="card-quiet p-4 sm:p-6">
        <h2 class="text-xl font-bold">{{ t('insights.threshold.title') }}</h2>
        <p class="mt-2 text-sm leading-6 text-muted">
          {{ t('insights.threshold.body', {
            pct: percent(data?.meta?.thresholdPct, 2),
            votes: number(insights?.thresholdVotes),
          }) }}
        </p>
        <div class="mt-4 rounded-xl bg-elevated/60 p-4">
          <p class="text-xs font-medium text-muted">{{ t('insights.ratio.title') }}</p>
          <p class="mt-1 text-2xl font-bold tabular">{{ number(insights?.quota) }}</p>
          <p class="mt-1 text-xs leading-5 text-muted">
            {{ t('insights.ratio.body', { votes: number(insights?.quota) }) }}
          </p>
        </div>
      </section>
    </div>

    <section class="card-quiet overflow-hidden">
      <div class="p-4 pb-2 sm:px-6">
        <h2 class="text-xl font-bold">{{ t('insights.table.party') }}</h2>
        <p class="mt-1 text-sm text-muted">{{ t('insights.representation.body') }}</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[620px] border-collapse text-sm">
          <caption class="sr-only">{{ t('insights.representation.title') }}</caption>
          <thead>
            <tr class="border-y border-default bg-elevated/50">
              <th scope="col" class="px-4 py-2.5 text-start font-semibold">{{ t('insights.table.party') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('insights.table.votes') }}</th>
              <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('insights.table.seats') }}</th>
              <th scope="col" class="px-4 py-2.5 text-start font-semibold">{{ t('insights.table.delta') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="party in eligible" :key="party.code" class="border-b border-default/70 last:border-0">
              <th scope="row" class="px-4 py-2.5 text-start font-normal">
                <span class="flex items-center gap-2">
                  <PartySwatch :color="party.color" size="sm" />
                  <NuxtLink
                    :to="`/parties/${encodeURIComponent(party.code)}`"
                    class="font-medium hover:text-primary hover:underline"
                  >
                    {{ locale === 'he' ? party.nameHe : party.nameEn }}
                  </NuxtLink>
                  <span class="text-xs text-muted">({{ party.ballot }})</span>
                </span>
              </th>
              <td class="px-3 py-2.5 tabular">{{ percent(party.votePct) }}</td>
              <td class="px-3 py-2.5 tabular">{{ percent(party.seatPct) }}</td>
              <td class="px-4 py-2.5">
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
            </tr>
          </tbody>
        </table>
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
