<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t, locale, dir } = useLocale()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() =>
  isNotFound.value ? t('error.notFound.title') : t('error.server.title'),
)
const body = computed(() =>
  isNotFound.value ? t('error.notFound.body') : t('error.server.body'),
)

useHead(() => ({
  title: `${title.value} · votes26`,
  htmlAttrs: {
    lang: locale.value,
    dir: dir.value,
  },
}))

function goHome() {
  return clearError({ redirect: '/' })
}
</script>

<template>
  <UApp>
    <main id="main-content" class="grid min-h-screen place-items-center bg-default px-4 py-10">
      <div class="w-full max-w-md">
        <NuxtLink to="/" class="mb-5 inline-flex items-center gap-2 text-sm font-bold">
          <span class="grid size-9 place-items-center rounded-xl bg-primary text-white">
            <UIcon name="i-lucide-landmark" class="size-5" aria-hidden="true" />
          </span>
          votes26
        </NuxtLink>

        <section class="card-quiet p-6 text-center">
          <p class="text-sm font-semibold text-primary tabular">{{ error.statusCode }}</p>
          <h1 class="mt-1 text-2xl font-bold">{{ title }}</h1>
          <p class="mt-3 text-sm leading-6 text-muted">{{ body }}</p>
          <UButton class="mt-5 justify-center" icon="i-lucide-arrow-right" @click="goHome">
            {{ t('error.home') }}
          </UButton>
        </section>
      </div>
    </main>
  </UApp>
</template>
