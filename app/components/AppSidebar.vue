<script setup lang="ts">
const emit = defineEmits<{
  openLegend: []
  navigate: []
}>()

const { t, locale } = useLocale()
const { number, dateTime } = useFormat()
const route = useRoute()
const {
  data,
  isLive,
  autoRefresh,
  refreshing,
  refreshNow,
} = useResultsState()

const navItems = computed(() => [
  { to: '/', key: 'nav.overview' as const, icon: 'i-lucide-layout-dashboard' },
  { to: '/mandates', key: 'nav.mandates' as const, icon: 'i-lucide-armchair' },
  { to: '/votes', key: 'nav.votes' as const, icon: 'i-lucide-vote' },
  { to: '/blocs', key: 'nav.blocs' as const, icon: 'i-lucide-users' },
  { to: '/localities', key: 'nav.localities' as const, icon: 'i-lucide-map-pin' },
  { to: '/insights', key: 'nav.insights' as const, icon: 'i-lucide-sparkles' },
])

const meta = computed(() => data.value?.meta)
const updated = computed(() => meta.value?.generatedAt)
const blocs = computed(() => data.value?.blocs ?? [])

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <nav :aria-label="t('a11y.menu')" class="min-h-0 flex-1 overflow-y-auto px-2">
      <p class="px-2 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {{ t('nav.explore') }}
      </p>
      <ul class="space-y-0.5">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors"
            :class="
              isActive(item.to)
                ? 'bg-primary/10 text-primary'
                : 'text-muted hover:bg-elevated hover:text-default'
            "
            @click="emit('navigate')"
          >
            <UIcon :name="item.icon" class="size-4.5 shrink-0" aria-hidden="true" />
            {{ t(item.key) }}
          </NuxtLink>
        </li>
      </ul>

      <p class="px-2 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {{ t('nav.about') }}
      </p>
      <NuxtLink
        to="/method"
        class="flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors"
        :class="
          isActive('/method')
            ? 'bg-primary/10 text-primary'
            : 'text-muted hover:bg-elevated hover:text-default'
        "
        @click="emit('navigate')"
      >
        <UIcon name="i-lucide-book-open" class="size-4.5 shrink-0" aria-hidden="true" />
        {{ t('nav.method') }}
      </NuxtLink>
      <NuxtLink
        to="/privacy"
        class="flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors"
        :class="
          isActive('/privacy')
            ? 'bg-primary/10 text-primary'
            : 'text-muted hover:bg-elevated hover:text-default'
        "
        @click="emit('navigate')"
      >
        <UIcon name="i-lucide-shield-check" class="size-4.5 shrink-0" aria-hidden="true" />
        {{ t('nav.privacy') }}
      </NuxtLink>
    </nav>

    <div class="mt-3 space-y-3 border-t border-default px-3 pt-3">
      <div>
        <div class="mb-1.5 flex items-center justify-between gap-2">
          <span class="text-[11px] font-medium text-muted">{{ t('overview.status.counted') }}</span>
          <span class="text-[11px] font-semibold tabular">
            {{ number(meta?.stationsCounted) }}
          </span>
        </div>
        <p class="mt-1 text-[11px] text-muted tabular">
          {{ updated ? t('header.updated', { time: dateTime(updated) }) : t('loading.data') }}
        </p>
      </div>

      <USwitch
        v-model="autoRefresh"
        size="sm"
        :label="t('header.auto')"
        :description="t('header.autoHint')"
      />

      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        icon="i-lucide-refresh-cw"
        :loading="refreshing"
        class="w-full justify-center"
        @click="refreshNow"
      >
        {{ t('header.refresh') }}
      </UButton>

      <div v-if="blocs.length" class="rounded-xl bg-elevated/60 p-2.5">
        <p class="mb-2 flex items-center justify-between text-[11px] font-semibold">
          <span>{{ t('legend.bloc.title') }}</span>
          <span class="font-normal text-muted">{{ t('common.seats') }}</span>
        </p>
        <ul class="space-y-1.5">
          <li
            v-for="bloc in blocs.filter((item) => item.seats > 0)"
            :key="bloc.id"
            class="flex items-center gap-2 text-[11px]"
          >
            <span
              class="size-2 rounded-full"
              :style="{ backgroundColor: bloc.color }"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1 truncate">
              {{ locale === 'he' ? bloc.nameHe : bloc.nameEn }}
            </span>
            <span class="font-semibold tabular">{{ number(bloc.seats) }}</span>
          </li>
        </ul>
        <button
          type="button"
          class="mt-2 flex min-h-8 w-full items-center justify-center gap-1 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary/5"
          @click="emit('openLegend')"
        >
          {{ t('header.legend') }}
          <UIcon name="i-lucide-arrow-up-right" class="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <p class="pb-2 text-[11px] leading-4 text-muted">
        {{ isLive ? t('header.live') : t('header.snapshot') }} ·
        <a
          :href="meta?.officialUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-primary hover:underline"
        >
          {{ t('common.source') }}
          <span class="sr-only">({{ t('a11y.external') }})</span>
        </a>
      </p>
    </div>
  </div>
</template>
