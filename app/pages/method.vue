<script setup lang="ts">
const { t } = useLocale()

const sections = computed(() => [
  { icon: 'i-lucide-history', title: t('method.comparison.title'), body: t('method.comparison.body') },
  { icon: 'i-lucide-database', title: t('method.source.title'), body: t('method.source.body') },
  { icon: 'i-lucide-clock', title: t('method.update.title'), body: t('method.update.body') },
  { icon: 'i-lucide-filter', title: t('method.threshold.title'), body: t('method.threshold.body') },
  { icon: 'i-lucide-calculator', title: t('method.seats.title'), body: t('method.seats.body') },
  { icon: 'i-lucide-users', title: t('method.blocs.title'), body: t('method.blocs.body') },
  { icon: 'i-lucide-accessibility', title: t('method.accessibility.title'), body: t('method.accessibility.body') },
  { icon: 'i-lucide-scale', title: t('method.license.title'), body: t('method.license.body') },
])

useSeoMeta({
  title: () => `${t('nav.method')} · votes26`,
  description: () => t('method.lede'),
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('method.eyebrow')"
      :title="t('method.title')"
      :lede="t('method.lede')"
    />

    <div class="grid gap-3 md:grid-cols-2">
      <a
        href="https://votes26.bechirot.gov.il/nationalresults?lang=he"
        target="_blank"
        rel="noopener noreferrer"
        class="card-quiet flex items-center gap-3 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
          <UIcon name="i-lucide-landmark" class="size-5" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-bold">{{ t('method.source.official') }}</span>
          <span class="block truncate text-xs text-muted">votes26.bechirot.gov.il</span>
        </span>
        <UIcon name="i-lucide-arrow-up-right" class="ms-auto size-4 text-muted" aria-hidden="true" />
      </a>

      <a
        href="https://elections.govmap.gov.il/"
        target="_blank"
        rel="noopener noreferrer"
        class="card-quiet flex items-center gap-3 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" aria-hidden="true">
          <UIcon name="i-lucide-map" class="size-5" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-bold">{{ t('method.source.govmap') }}</span>
          <span class="block truncate text-xs text-muted">elections.govmap.gov.il</span>
        </span>
        <UIcon name="i-lucide-arrow-up-right" class="ms-auto size-4 text-muted" aria-hidden="true" />
      </a>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <article
        v-for="section in sections"
        :key="section.title"
        class="card-quiet p-4 sm:p-5"
      >
        <span class="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
          <UIcon :name="section.icon" class="size-4" />
        </span>
        <h2 class="mt-3 text-base font-bold">{{ section.title }}</h2>
        <p class="mt-1 text-sm leading-6 text-muted">{{ section.body }}</p>
      </article>
    </div>

  </div>
</template>
