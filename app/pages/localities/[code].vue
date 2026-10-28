<script setup lang="ts">
import type { LocalityDetail } from '~~/shared/election/types'

const route = useRoute()
const { t, locale } = useLocale()
const { number, percent, dateTime } = useFormat()
const code = computed(() => String(route.params.code ?? ''))

const { data, pending, error } = useFetch<LocalityDetail>(
  () => `/api/localities/${code.value}`,
  { key: `votes26-locality-${code.value}`, server: true },
)

const showAllParties = ref(false)
const showAllNeighborhoods = ref(false)
const topParty = computed(() => data.value?.topParty ?? null)
const visibleParties = computed(() => {
  const parties = data.value?.parties ?? []
  return showAllParties.value ? parties : parties.slice(0, 12)
})
const visibleNeighborhoods = computed(() => {
  const neighborhoods = data.value?.neighborhoods ?? []
  return showAllNeighborhoods.value ? neighborhoods : neighborhoods.slice(0, 12)
})
const strongholdParty = computed(() =>
  data.value?.parties.find((party) => party.code === topParty.value?.code),
)

const strongholdText = computed(() => {
  if (!topParty.value) return ''
  return t('localities.detail.strongholdBody', {
    party: locale.value === 'he' ? topParty.value.nameHe : topParty.value.nameEn,
    pct: percent(topParty.value.votePct),
    national: percent(strongholdParty.value?.nationalVotePct ?? 0),
  })
})

useSeoMeta({
  title: () =>
    data.value
      ? `${data.value.name} · ${t('nav.localities')} · votes26`
      : `${t('nav.localities')} · votes26`,
  description: () => data.value?.name ?? t('localities.lede'),
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <NuxtLink
        to="/localities"
        class="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" aria-hidden="true" />
        {{ t('localities.detail.back') }}
      </NuxtLink>
    </div>

    <div v-if="pending && !data" class="space-y-4">
      <div class="h-28 animate-pulse rounded-2xl bg-elevated" />
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="index in 4" :key="index" class="h-24 animate-pulse rounded-2xl bg-elevated" />
      </div>
    </div>

    <UAlert
      v-else-if="error || !data"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      :title="t('error.title')"
      :description="t('localities.detail.noData')"
      :actions="[{ label: t('error.retry'), to: '/localities' }]"
    />

    <template v-else>
      <PageHeader
        :eyebrow="t('localities.detail.eyebrow')"
        :title="data.name"
        :lede="t('localities.lede')"
      >
        <template #actions>
          <UBadge color="neutral" variant="soft" icon="i-lucide-hash">
            {{ t('localities.detail.code') }} {{ data.code }}
          </UBadge>
          <UBadge color="primary" variant="soft" icon="i-lucide-users">
            {{ percent(data.turnoutPct) }}
          </UBadge>
          <UBadge color="neutral" variant="soft" icon="i-lucide-clock">
            {{ dateTime(data.generatedAt) }}
          </UBadge>
        </template>
      </PageHeader>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" :aria-label="data.name">
        <StatCard
          :label="t('localities.detail.valid')"
          :value="number(data.validVotes)"
          :hint="t('localities.detail.partiesCaption')"
          icon="i-lucide-check-check"
          tone="primary"
        />
        <StatCard
          :label="t('localities.detail.voters')"
          :value="number(data.voters)"
          :hint="t('localities.detail.eligibleHint', { count: number(data.eligibleVoters) })"
          icon="i-lucide-users"
        />
        <StatCard
          :label="t('localities.detail.turnout')"
          :value="percent(data.turnoutPct)"
          :hint="t('localities.detail.turnoutHint')"
          icon="i-lucide-gauge"
        />
        <StatCard
          :label="t('localities.detail.invalid')"
          :value="number(data.invalidVotes)"
          icon="i-lucide-ban"
          tone="warning"
        />
      </section>

      <div class="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section class="card-quiet overflow-hidden" aria-labelledby="locality-parties-title">
          <div class="p-4 pb-2 sm:px-6">
            <h2 id="locality-parties-title" class="text-xl font-bold">{{ t('localities.detail.parties') }}</h2>
            <p class="mt-1 text-sm text-muted">{{ t('localities.detail.partiesCaption') }}</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[680px] border-collapse text-sm">
              <caption class="sr-only">{{ t('localities.detail.partiesCaption') }}</caption>
              <thead>
                <tr class="border-y border-default bg-elevated/50">
                  <th scope="col" class="px-4 py-2.5 text-start font-semibold">{{ t('localities.detail.party') }}</th>
                  <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('localities.detail.votes') }}</th>
                  <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('localities.detail.share') }}</th>
                  <th scope="col" class="px-3 py-2.5 text-start font-semibold">{{ t('localities.detail.national') }}</th>
                  <th scope="col" class="px-4 py-2.5 text-start font-semibold">{{ t('localities.detail.delta') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="party in visibleParties" :key="party.code" class="border-b border-default/70 last:border-0">
                  <th scope="row" class="px-4 py-2.5 text-start font-normal">
                    <NuxtLink
                      :to="`/parties/${encodeURIComponent(party.code)}`"
                      class="inline-flex items-center gap-2 hover:text-primary hover:underline"
                    >
                      <PartySwatch :color="party.color" size="sm" />
                      <span class="font-medium">{{ locale === 'he' ? party.nameHe : party.nameEn }}</span>
                      <span class="text-[11px] text-muted">({{ party.ballot }})</span>
                    </NuxtLink>
                  </th>
                  <td class="px-3 py-2.5 tabular">{{ number(party.votes) }}</td>
                  <td class="px-3 py-2.5 tabular">{{ percent(party.votePct) }}</td>
                  <td class="px-3 py-2.5 text-muted tabular">{{ percent(party.nationalVotePct) }}</td>
                  <td class="px-4 py-2.5">
                    <span
                      class="rounded-full px-1.5 py-0.5 text-xs font-semibold tabular"
                      :class="
                        party.delta >= 0
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                      "
                    >
                      {{ party.delta >= 0 ? '+' : '−' }}{{ percent(Math.abs(party.delta)) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="(data.parties.length > 12)" class="border-t border-default p-3 text-center">
            <UButton
              color="neutral"
              variant="soft"
              size="sm"
              :icon="showAllParties ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
              @click="showAllParties = !showAllParties"
            >
              {{
                showAllParties
                  ? t('localities.detail.showLessParties')
                  : t('localities.detail.showAllParties', { count: data.parties.length })
              }}
            </UButton>
          </div>
        </section>

        <aside class="space-y-4">
          <section class="card-quiet p-4 sm:p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {{ t('localities.detail.stronghold') }}
            </p>
            <div v-if="topParty" class="mt-3 flex items-center gap-3">
              <PartySwatch :color="topParty.color" size="lg" />
              <div class="min-w-0">
                <h2 class="truncate text-lg font-bold">
                  {{ locale === 'he' ? topParty.nameHe : topParty.nameEn }}
                </h2>
                <p class="text-2xl font-bold tabular">{{ percent(topParty.votePct) }}</p>
              </div>
            </div>
            <p class="mt-3 text-sm leading-6 text-muted">{{ strongholdText }}</p>
            <NuxtLink
              v-if="topParty"
              :to="`/parties/${encodeURIComponent(topParty.code)}`"
              class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {{ t('common.viewParty') }}
              <UIcon name="i-lucide-arrow-up-left" class="size-3.5" aria-hidden="true" />
            </NuxtLink>
          </section>

          <section class="card-quiet p-4 text-sm text-muted sm:p-5">
            <h2 class="text-base font-bold text-default">{{ t('localities.detail.compare') }}</h2>
            <p class="mt-2 leading-6">{{ t('localities.detail.compareBody') }}</p>
            <p class="mt-2 text-xs leading-5">{{ t('localities.detail.turnoutHint') }}</p>
          </section>
        </aside>
      </div>

      <section class="card-quiet p-4 sm:p-6" aria-labelledby="neighborhoods-title">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="neighborhoods-title" class="text-xl font-bold">
              {{ t('localities.detail.neighborhoods') }}
            </h2>
            <p class="mt-1 text-sm text-muted">{{ t('localities.detail.neighborhoodsCaption') }}</p>
          </div>
          <UBadge color="neutral" variant="soft" icon="i-lucide-map-pin">
            {{ number(data.neighborhoods.length) }}
          </UBadge>
        </div>

        <p v-if="data.neighborhoods.length === 0" class="mt-4 text-sm text-muted">
          {{ t('localities.detail.noNeighborhoods') }}
        </p>

        <div v-else class="mt-4 grid gap-2 md:grid-cols-2">
          <details
            v-for="neighborhood in visibleNeighborhoods"
            :key="neighborhood.id"
            class="group rounded-xl border border-default p-3 open:bg-elevated/40"
          >
            <summary class="flex cursor-pointer list-none items-center gap-2">
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-semibold">{{ neighborhood.name }}</span>
                <span class="mt-0.5 block text-[11px] text-muted tabular">
                  {{ number(neighborhood.validVotes) }} {{ t('localities.validVotes') }} ·
                  {{ percent(neighborhood.turnoutPct) }} {{ t('localities.turnout') }}
                </span>
              </span>
              <span v-if="neighborhood.topParty" class="flex max-w-40 items-center gap-1.5 text-xs">
                <PartySwatch :color="neighborhood.topParty.color" size="sm" />
                <span class="truncate text-muted">
                  {{ locale === 'he' ? neighborhood.topParty.nameHe : neighborhood.topParty.nameEn }}
                </span>
                <span class="shrink-0 font-semibold tabular">{{ percent(neighborhood.topParty.votePct) }}</span>
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 text-muted transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>

            <div class="mt-3 border-t border-default pt-3">
              <table class="w-full border-collapse text-xs">
                <caption class="sr-only">
                  {{ t('localities.detail.topParties') }} — {{ neighborhood.name }}
                </caption>
                <thead>
                  <tr>
                    <th scope="col" class="pb-1 text-start font-semibold">{{ t('localities.detail.party') }}</th>
                    <th scope="col" class="pb-1 text-start font-semibold">{{ t('localities.detail.votes') }}</th>
                    <th scope="col" class="pb-1 text-start font-semibold">{{ t('localities.detail.share') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="party in neighborhood.parties" :key="party.code">
                    <th scope="row" class="py-1 text-start font-normal">
                      <NuxtLink
                        :to="`/parties/${encodeURIComponent(party.code)}`"
                        class="inline-flex items-center gap-1.5 hover:text-primary hover:underline"
                      >
                        <PartySwatch :color="party.color" size="sm" />
                        {{ locale === 'he' ? party.nameHe : party.nameEn }}
                      </NuxtLink>
                    </th>
                    <td class="py-1 tabular">{{ number(party.votes) }}</td>
                    <td class="py-1 tabular">{{ percent(party.votePct) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
        <div v-if="data.neighborhoods.length > 12" class="mt-4 text-center">
          <UButton
            color="neutral"
            variant="soft"
            size="sm"
            :icon="showAllNeighborhoods ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            @click="showAllNeighborhoods = !showAllNeighborhoods"
          >
            {{
              showAllNeighborhoods
                ? t('localities.detail.showLessNeighborhoods')
                : t('localities.detail.showAllNeighborhoods', { count: data.neighborhoods.length })
            }}
          </UButton>
        </div>
      </section>
    </template>
  </div>
</template>
