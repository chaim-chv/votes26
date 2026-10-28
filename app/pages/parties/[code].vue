<script setup lang="ts">
import type { PartyLocalities } from '~~/shared/election/types'
import { blocName, campName } from '~~/shared/election/parties'

const route = useRoute()
const { t, locale } = useLocale()
const { number, percent, signedPercent } = useFormat()
const { data: national, pending: nationalPending } = useResultsState()
const comparison = computed(() => national.value?.comparison)
const code = computed(() => String(route.params.code ?? ''))

const party = computed(() =>
  national.value?.parties.find((item) => item.code === code.value),
)

const {
  data: localities,
  pending: localitiesPending,
  error: localitiesError,
  refresh: refreshLocalities,
} = useFetch<PartyLocalities>(() => `/api/parties/${encodeURIComponent(code.value)}`, {
  key: `votes26-party-${code.value}`,
  server: true,
})
useLiveResultsRefresh(refreshLocalities)

const thresholdVotes = computed(() => national.value?.insights.thresholdVotes ?? 0)
const gapVotes = computed(() =>
  party.value ? Math.max(0, thresholdVotes.value - party.value.votes) : 0,
)
const gapPct = computed(() =>
  party.value
    ? Math.max(0, (national.value?.meta.thresholdPct ?? 3.25) - party.value.votePct)
    : 0,
)

const partyComparison = computed(() =>
  party.value ? comparison.value?.parties[party.value.code] : undefined,
)

const blocLabel = computed(() =>
  party.value ? blocName(party.value.bloc, locale.value) : '',
)
const campLabel = computed(() =>
  party.value ? campName(party.value.camp, locale.value) : '',
)

const name = computed(() =>
  party.value ? (locale.value === 'he' ? party.value.nameHe : party.value.nameEn) : code.value,
)

useSeoMeta({
  title: () => `${name.value} · votes26`,
  description: () => t('party.lede', { name: name.value }),
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <NuxtLink
        to="/votes"
        class="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" aria-hidden="true" />
        {{ t('party.viewAll') }}
      </NuxtLink>
    </div>

    <div v-if="nationalPending && !party" class="space-y-4">
      <div class="h-24 animate-pulse rounded-2xl bg-elevated" />
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="index in 4" :key="index" class="h-24 animate-pulse rounded-2xl bg-elevated" />
      </div>
    </div>

    <div v-else-if="!party" class="card-quiet p-6">
      <UAlert
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        :title="t('party.notFound')"
        :description="t('party.error')"
        :actions="[{ label: t('party.viewAll'), to: '/votes' }]"
      />
    </div>

    <template v-else>
      <PageHeader
        :eyebrow="t('party.eyebrow')"
        :title="name"
        :lede="t('party.lede', { name })"
      >
        <template #leading>
          <PartySwatch :color="party.color" size="lg" class="mt-1.5" />
        </template>
        <template #actions>
          <UBadge
            :color="party.passesThreshold ? 'success' : 'warning'"
            variant="soft"
            :icon="party.passesThreshold ? 'i-lucide-check' : 'i-lucide-filter'"
          >
            {{ party.passesThreshold ? t('party.status.passed') : t('party.status.failed') }}
          </UBadge>
          <UBadge color="neutral" variant="soft" icon="i-lucide-users">
            {{ t('party.bloc') }}: {{ blocLabel }}
          </UBadge>
          <UBadge color="neutral" variant="soft" icon="i-lucide-handshake">
            {{ t('party.camp') }}: {{ campLabel }}
          </UBadge>
          <UBadge color="neutral" variant="soft" icon="i-lucide-vote">
            {{ t('party.ballot') }}: {{ party.ballot }}
          </UBadge>
        </template>
      </PageHeader>

      <p v-if="party.fullNameHe" class="text-sm leading-6 text-muted" dir="rtl">
        <span class="font-medium text-default">{{ t('party.officialName') }}:</span>
        {{ party.fullNameHe }}
      </p>
      <p v-if="comparison" class="text-[11px] leading-5 text-muted">
        {{ t('comparison.currentStatus') }} · {{ t('comparison.previousStatus') }} ·
        {{ t('comparison.officialSeatsNote') }}
      </p>

      <section
        class="grid gap-3 sm:grid-cols-2"
        :class="party.passesThreshold ? 'xl:grid-cols-4' : 'xl:grid-cols-3'"
        :aria-label="t('party.national')"
      >
        <StatCard
          :label="t('party.votes')"
          :value="number(party.votes)"
          :hint="t('party.rank') + ' #' + number(party.rank)"
          icon="i-lucide-vote"
          tone="primary"
        >
          <template #hint>
            <p class="mt-1 text-xs text-muted">{{ t('party.rank') }} #{{ number(party.rank) }}</p>
            <p v-if="partyComparison?.comparable" class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <ComparisonDelta
                :value="partyComparison.voteChange"
                format="integer"
                :unit-label="t('comparison.voteUnit')"
              />
              <span>{{ t('comparison.baselineShort') }}: {{ number(partyComparison.previousVotes) }}</span>
            </p>
          </template>
        </StatCard>
        <StatCard
          :label="t('party.voteShare')"
          :value="percent(party.votePct)"
          :hint="t('party.voteShareHint')"
          icon="i-lucide-percent"
        >
          <template #hint>
            <p class="mt-1 text-xs text-muted">{{ t('party.voteShareHint') }}</p>
            <p v-if="partyComparison?.comparable" class="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
              <ComparisonDelta
                :value="partyComparison.voteShareChange"
                format="pp"
                :unit-label="t('comparison.ppUnit')"
              />
              <span>{{ t('comparison.baselineShort') }}: {{ percent(partyComparison.previousVotePct) }}</span>
            </p>
          </template>
        </StatCard>
        <StatCard
          :label="t('party.seats')"
          :value="number(party.seats)"
          :hint="`${t('party.seatShare')} ${percent(party.seatPct)}`"
          icon="i-lucide-armchair"
        >
          <template #hint>
            <p class="mt-1 text-xs text-muted">{{ t('party.seatShare') }} {{ percent(party.seatPct) }}</p>
            <p v-if="partyComparison?.comparable" class="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
              <ComparisonDelta
                :value="partyComparison.seatChange"
                format="seats"
                :unit-label="t('comparison.seatUnit')"
              />
              <span>{{ t('comparison.baselineShort') }}: {{ number(partyComparison.previousSeats) }}</span>
            </p>
            <p v-else-if="partyComparison?.relation === 'new'" class="mt-1 text-xs text-muted">
              {{ t('comparison.newParty') }}
            </p>
          </template>
        </StatCard>
        <StatCard
          v-if="party.passesThreshold"
          :label="t('party.votesPerSeat')"
          :value="party.votesPerSeat ? number(party.votesPerSeat) : '—'"
          :hint="t('party.votesPerSeatHint', { quota: number(national?.insights.quota) })"
          icon="i-lucide-calculator"
        />
      </section>

      <p
        v-if="partyComparison && !partyComparison.comparable && partyComparison.relation !== 'new'"
        class="rounded-xl bg-elevated/60 px-4 py-3 text-xs leading-5 text-muted"
      >
        {{ locale === 'he' ? partyComparison.noteHe : partyComparison.noteEn }}
        <span v-if="partyComparison.previousSeats != null" class="font-semibold text-default">
          · 2022: {{ number(partyComparison.previousSeats) }} {{ t('comparison.seatUnit') }}
        </span>
      </p>

      <section
        v-if="!party.passesThreshold"
        class="card-quiet p-4 sm:p-6"
        aria-labelledby="party-threshold-title"
      >
        <h2 id="party-threshold-title" class="text-xl font-bold">{{ t('party.thresholdGap') }}</h2>
        <p class="mt-2 text-sm leading-6 text-muted">
          {{ t('party.thresholdGapBody', { votes: number(gapVotes), pct: percent(gapPct) }) }}
        </p>

        <div class="mt-4">
          <div class="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              class="h-full rounded-full bg-amber-500"
              :style="{
                width: `${Math.min(100, (party.votePct / (national?.meta.thresholdPct ?? 3.25)) * 100)}%`,
              }"
              aria-hidden="true"
            />
          </div>
          <p class="mt-2 text-xs leading-5 text-muted">
            {{
              t('mandates.below.thresholdLine', {
                pct: percent(national?.meta.thresholdPct ?? 3.25, 2),
                votes: number(thresholdVotes),
              })
            }}
          </p>
        </div>
      </section>

      <section class="card-quiet p-4 sm:p-6" aria-labelledby="party-localities-title">
        <div class="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="party-localities-title" class="text-xl font-bold">{{ t('party.topLocalities') }}</h2>
            <p class="mt-1 text-sm text-muted">{{ t('party.localitiesCaption') }}</p>
          </div>
          <UBadge color="neutral" variant="soft" icon="i-lucide-map-pin">
            {{ number(localities?.localitiesScanned ?? 0) }} {{ t('nav.localities') }}
          </UBadge>
        </div>

        <div v-if="localitiesPending && !localities" class="mt-4 grid gap-3 md:grid-cols-2">
          <div v-for="index in 2" :key="index" class="h-64 animate-pulse rounded-xl bg-elevated" />
        </div>
        <UAlert
          v-else-if="localitiesError && !localities"
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          :title="t('party.error')"
          :description="t('party.noLocalities')"
          class="mt-4"
        />
        <div v-else-if="localities" class="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 class="text-sm font-bold">{{ t('party.topByVotes') }}</h3>
            <ol class="mt-2 divide-y divide-default rounded-xl border border-default">
              <li v-for="locality in localities.topByVotes" :key="locality.code">
                <NuxtLink
                  :to="`/localities/${locality.code}`"
                  class="flex min-h-11 items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-elevated/60"
                >
                  <span class="min-w-0 flex-1 truncate">{{ locality.name }}</span>
                  <span class="text-xs text-muted tabular">{{ number(locality.votes) }}</span>
                  <span class="w-12 text-end font-semibold tabular">{{ percent(locality.votePct) }}</span>
                  <span
                    v-if="locality.voteShareChange != null"
                    class="w-14 text-end rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular"
                    :class="
                      locality.voteShareChange >= 0
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                    "
                  >
                    {{ signedPercent(locality.voteShareChange) }}
                  </span>
                </NuxtLink>
              </li>
            </ol>
          </div>

          <div>
            <h3 class="text-sm font-bold">{{ t('party.topByShare') }}</h3>
            <p class="mt-1 text-[11px] leading-4 text-muted">{{ t('party.shareCaption') }}</p>
            <ol class="mt-2 divide-y divide-default rounded-xl border border-default">
              <li v-for="locality in localities.topByShare" :key="`share-${locality.code}`">
                <NuxtLink
                  :to="`/localities/${locality.code}`"
                  class="flex min-h-11 items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-elevated/60"
                >
                  <span class="min-w-0 flex-1 truncate">{{ locality.name }}</span>
                  <span class="text-xs text-muted tabular">{{ number(locality.votes) }}</span>
                  <span class="w-12 text-end font-semibold tabular">{{ percent(locality.votePct) }}</span>
                  <span
                    v-if="locality.voteShareChange != null"
                    class="w-14 text-end rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular"
                    :class="
                      locality.voteShareChange >= 0
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                    "
                  >
                    {{ signedPercent(locality.voteShareChange) }}
                  </span>
                </NuxtLink>
              </li>
            </ol>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>
