<script setup lang="ts">
const { t } = useLocale()

useSeoMeta({
  title: () => `${t('nav.privacy')} · votes26`,
  description: () => t('privacy.lede'),
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :eyebrow="t('privacy.eyebrow')"
      :title="t('privacy.title')"
      :lede="t('privacy.lede')"
    />

    <article class="card-quiet max-w-3xl p-4 sm:p-5">
      <p class="text-sm leading-6 text-muted">{{ t('privacy.body') }}</p>
    </article>
  </div>
</template>
