<script setup lang="ts">
import type { PartyResult } from '~~/shared/election/types'
const { t, locale } = useLocale()
const { number, percent } = useFormat()
const { data } = useResultsState()
const blocs = computed(() => data.value?.blocs ?? [])
const parties = computed(() => data.value?.parties ?? [])
const camps = computed(() => data.value?.camps ?? [])
const comparison = computed(() => data.value?.comparison)
const byCode = computed(() => new Map(parties.value.map((party) => [party.code, party])))

function blocParties(codes: string[]) {
  return codes
    .map((code) => byCode.value.get(code))
    .filter((party): party is PartyResult => party != null && party.seats > 0)
}

useSeoMeta({
  title: () => `${t('nav.blocs')} · votes26`,
  description: () => t('blocs.lede'),
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('blocs.eyebrow')"
      :title="t('blocs.title')"
      :lede="t('blocs.lede')"
    >
      <template #actions>
        <UBadge color="neutral" variant="soft" icon="i-lucide-users">
          {{ t('common.seatCount', { count: 120 }) }}
        </UBadge>
        <UBadge color="neutral" variant="soft" icon="i-lucide-info">
          {{ t('common.caveat') }}
        </UBadge>
      </template>
    </PageHeader>

    <p v-if="comparison" class="text-[11px] leading-5 text-muted">
      {{ t('comparison.label') }} · {{ t('comparison.currentStatus') }} ·
      {{ t('comparison.previousStatus') }} · {{ t('comparison.officialSeatsNote') }}
    </p>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" :aria-label="t('nav.blocs')">
      <article
        v-for="bloc in blocs.filter((item) => item.seats > 0)"
        :key="bloc.id"
        class="card-quiet p-4"
      >
        <div class="flex items-start gap-3">
          <span
            class="grid size-10 shrink-0 place-items-center rounded-xl text-white"
            :style="{ backgroundColor: bloc.color }"
            aria-hidden="true"
          >
            <UIcon :name="bloc.icon" class="size-5" />
          </span>
          <div class="min-w-0">
            <h2 class="text-sm font-bold">{{ locale === 'he' ? bloc.nameHe : bloc.nameEn }}</h2>
            <p class="mt-1 flex items-center gap-2 text-2xl font-bold leading-none tabular">
              {{ number(bloc.seats) }}
              <ComparisonDelta
                v-if="comparison"
                :value="comparison.blocs[bloc.id]?.seatChange"
                format="seats"
                :unit-label="t('comparison.seatUnit')"
              />
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ t('common.seats') }} · {{ percent(bloc.seatPct) }}
            </p>
          </div>
        </div>
        <p class="mt-3 text-xs text-muted">
          {{ t('blocs.cards.votes', { count: number(bloc.votes) }) }} · {{ percent(bloc.votePct) }}
        </p>
        <ul class="mt-2 space-y-1">
          <li v-for="party in blocParties(bloc.partyCodes)" :key="party.code">
            <NuxtLink
              :to="`/parties/${encodeURIComponent(party.code)}`"
              class="-mx-1 flex min-h-7 items-center gap-1.5 rounded px-1 text-xs hover:bg-elevated/60 hover:text-primary"
            >
              <PartySwatch :color="party.color" size="sm" />
              <span class="min-w-0 flex-1 truncate">
                {{ locale === 'he' ? party.nameHe : party.nameEn }}
              </span>
              <span class="font-semibold tabular">{{ number(party.seats) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </article>
    </section>

    <CoalitionBuilder
      :parties="parties"
      :camps="camps"
      :previous-camp-seats="comparison?.camps.netanyahu?.previousSeats ?? null"
    />

    <p class="text-xs leading-5 text-muted">{{ t('blocs.camp.caveat') }}</p>
  </div>
</template>
