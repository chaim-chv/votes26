<script setup lang="ts">
const { t } = useLocale()
</script>

<template>
  <footer class="mt-12 border-t border-default py-6 text-xs text-muted">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p>
        {{ t('footer.builtByPrefix') }}
        <a
          href="https://chv.ovh/"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-primary hover:underline"
        >
          chaim-chv
          <span class="sr-only">({{ t('a11y.external') }})</span>
        </a>
        · {{ t('footer.madeWith') }}
      </p>
      <nav class="flex flex-wrap items-center gap-x-4 gap-y-1" :aria-label="t('footer.repo')">
        <NuxtLink to="/method" class="font-medium text-primary hover:underline">
          {{ t('nav.method') }}
        </NuxtLink>
        <NuxtLink to="/privacy" class="font-medium text-primary hover:underline">
          {{ t('nav.privacy') }}
        </NuxtLink>
        <a
          href="https://github.com/chaim-chv/votes26"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-primary hover:underline"
        >
          {{ t('footer.repo') }}
          <span class="sr-only">({{ t('a11y.external') }})</span>
        </a>
        <a
          href="https://votes26.bechirot.gov.il/nationalresults?lang=he"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-primary hover:underline"
        >
          {{ t('footer.source') }}
          <span class="sr-only">({{ t('a11y.external') }})</span>
        </a>
        <span class="rounded border border-default px-1.5 py-0.5 font-mono text-[10px]">
          {{ t('footer.license') }}
        </span>
      </nav>
    </div>
  </footer>
</template>
