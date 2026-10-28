<script setup lang="ts">
import { RESULTS_KEY, useResults } from '~/composables/useResults'

const { t, locale, dir } = useLocale()
const { dateTime } = useFormat()
const results = useResults()
provide(RESULTS_KEY, results)

const mobileNavOpen = ref(false)
const legendOpen = ref(false)
const snapshotMode = computed(() => results.data.value?.meta.mode === 'snapshot')
const snapshotDate = computed(() => results.data.value?.meta.generatedAt)

const overlaySide = computed<'right' | 'left'>(() =>
  locale.value === 'he' ? 'right' : 'left',
)

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
    dir: dir.value,
  },
}))

function openLegend() {
  legendOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-default">
    <a href="#main-content" class="skip-link">{{ t('header.skip') }}</a>

    <AppHeader
      @open-menu="mobileNavOpen = true"
      @open-legend="openLegend"
    />

    <div class="mx-auto flex w-full max-w-[1560px]">
      <aside
        class="sticky top-16 hidden h-[calc(100dvh-4rem)] w-72 shrink-0 border-e border-default p-3 lg:block"
        :aria-label="t('a11y.menu')"
      >
        <AppSidebar @open-legend="openLegend" />
      </aside>

      <main
        id="main-content"
        tabindex="-1"
        class="min-w-0 flex-1 px-4 pb-4 pt-6 focus:outline-none sm:px-6 lg:px-8"
      >
        <UAlert
          v-if="snapshotMode"
          color="warning"
          variant="soft"
          icon="i-lucide-database"
          :title="t('header.snapshot')"
          :description="t('error.snapshot', { date: dateTime(snapshotDate) })"
          class="mb-5"
        />
        <p class="sr-only" aria-live="polite">
          {{
            results.data.value
              ? t('header.updated', { time: dateTime(results.data.value.meta.generatedAt) })
              : t('loading.data')
          }}
        </p>
        <slot />
        <AppFooter />
      </main>
    </div>

    <USlideover
      v-model:open="mobileNavOpen"
      :side="overlaySide"
      :title="t('header.menu')"
    >
      <template #body>
        <div tabindex="0" class="focus:outline-none">
          <AppSidebar
            @navigate="mobileNavOpen = false"
            @open-legend="mobileNavOpen = false; openLegend()"
          />
        </div>
      </template>
    </USlideover>

    <USlideover
      v-model:open="legendOpen"
      :side="overlaySide"
      :title="t('legend.title')"
    >
      <template #body>
        <div tabindex="0" class="focus:outline-none">
          <LegendPanel />
        </div>
      </template>
    </USlideover>
  </div>
</template>
