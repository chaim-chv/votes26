<script setup lang="ts">
import type { LocalitiesPayload } from '~~/shared/election/types'

const { t, locale } = useLocale()
const { number, percent, dateTime } = useFormat()
const { data, pending, error, refresh } = useFetch<LocalitiesPayload>('/api/localities', {
  key: 'votes26-localities',
  server: true,
})
useLiveResultsRefresh(refresh)

const search = ref('')
const visibleCount = ref(24)

const filtered = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('he')
  const localities = data.value?.localities ?? []
  if (!query) return localities
  return localities.filter(
    (locality) =>
      locality.name.toLocaleLowerCase('he').includes(query) || locality.code.includes(query),
  )
})

const visible = computed(() => filtered.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filtered.value.length)

watch(search, () => {
  visibleCount.value = 24
})

useSeoMeta({
  title: () => `${t('nav.localities')} · votes26`,
  description: () => t('localities.lede'),
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('localities.eyebrow')"
      :title="t('localities.title')"
      :lede="t('localities.lede')"
    >
      <template #actions>
        <UBadge color="primary" variant="soft" icon="i-lucide-map-pin">
          {{ t('localities.count', { count: number(data?.total ?? 0) }) }}
        </UBadge>
        <UBadge v-if="data" color="neutral" variant="soft" icon="i-lucide-clock">
          {{ t('header.updated', { time: dateTime(data.generatedAt) }) }}
        </UBadge>
      </template>
    </PageHeader>

    <section class="card-quiet p-4 sm:p-5" aria-labelledby="localities-search-title">
      <h2 id="localities-search-title" class="text-sm font-semibold">{{ t('common.search') }}</h2>
      <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <UInput
          v-model="search"
          type="search"
          size="lg"
          icon="i-lucide-search"
          :aria-label="t('localities.search.label')"
          :placeholder="t('localities.search.placeholder')"
          class="w-full sm:max-w-md"
        />
        <p class="text-xs text-muted" aria-live="polite">
          {{
            t('localities.showing', {
              shown: number(visible.length),
              total: number(filtered.length),
            })
          }}
        </p>
      </div>
    </section>

    <div v-if="pending && !data" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="index in 6" :key="index" class="h-36 animate-pulse rounded-2xl bg-elevated" />
    </div>

    <UAlert
      v-else-if="error && !data"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      :title="t('error.title')"
      :description="t('error.body')"
    />

    <template v-else>
      <div v-if="filtered.length === 0" class="card-quiet p-6 text-center">
        <p class="text-sm font-medium">{{ t('localities.noResults') }}</p>
        <UButton color="neutral" variant="soft" size="sm" class="mt-3" @click="search = ''">
          {{ t('localities.reset') }}
        </UButton>
      </div>

      <ul v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" :aria-label="t('localities.caption')">
        <li v-for="locality in visible" :key="locality.code">
          <NuxtLink
            :to="`/localities/${locality.code}`"
            class="card-quiet flex h-full flex-col p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h2 class="truncate text-base font-bold">{{ locality.name }}</h2>
                <p class="mt-0.5 text-[11px] text-muted">{{ t('localities.detail.code') }} {{ locality.code }}</p>
              </div>
              <UIcon name="i-lucide-arrow-up-left" class="size-4 shrink-0 text-muted" aria-hidden="true" />
            </div>

            <div v-if="locality.topParty" class="mt-3 flex items-center gap-2 rounded-lg bg-elevated/60 px-2.5 py-2">
              <PartySwatch :color="locality.topParty.color" size="sm" />
              <span class="min-w-0 flex-1 truncate text-sm font-medium">
                {{ locale === 'he' ? locality.topParty.nameHe : locality.topParty.nameEn }}
              </span>
              <span class="text-sm font-bold tabular">{{ percent(locality.topParty.votePct) }}</span>
            </div>

            <dl class="mt-auto grid grid-cols-3 gap-2 pt-3 text-xs">
              <div>
                <dt class="text-muted">{{ t('localities.validVotes') }}</dt>
                <dd class="mt-0.5 font-semibold tabular">{{ number(locality.validVotes) }}</dd>
              </div>
              <div>
                <dt class="text-muted">{{ t('localities.turnout') }}</dt>
                <dd class="mt-0.5 font-semibold tabular">{{ percent(locality.turnoutPct) }}</dd>
              </div>
              <div>
                <dt class="text-muted">{{ t('localities.neighborhoodsLabel') }}</dt>
                <dd class="mt-0.5 font-semibold tabular">{{ number(locality.neighborhoodCount) }}</dd>
              </div>
            </dl>
          </NuxtLink>
        </li>
      </ul>

      <div v-if="hasMore" class="text-center">
        <UButton color="neutral" variant="soft" @click="visibleCount += 24">
          {{ t('localities.showMore') }}
        </UButton>
      </div>
    </template>
  </div>
</template>
