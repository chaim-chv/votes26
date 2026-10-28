<script setup lang="ts">
const emit = defineEmits<{
  openMenu: []
  openLegend: []
}>()

const { t, locale, setLocale } = useLocale()
const colorMode = useColorMode()
const { data, isLive, refreshing, refreshNow } = useResultsState()

const meta = computed(() => data.value?.meta)
const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-default bg-default/85 backdrop-blur-lg supports-[backdrop-filter]:bg-default/70"
  >
    <div class="flex h-16 items-center gap-2 px-3 sm:px-5">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-menu"
        square
        class="lg:hidden"
        :aria-label="t('header.openMenu')"
        @click="emit('openMenu')"
      />

      <NuxtLink to="/" class="flex min-w-0 items-center gap-2" aria-label="votes26">
        <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-white">
          <UIcon name="i-lucide-landmark" class="size-5" aria-hidden="true" />
        </span>
        <span class="hidden min-w-0 min-[380px]:block sm:block">
          <span class="block text-sm font-bold leading-none">votes26</span>
          <span class="mt-1 hidden text-[11px] leading-none text-muted sm:block">
            {{ t('app.tagline') }}
          </span>
        </span>
      </NuxtLink>

      <div class="mx-1 hidden h-6 w-px bg-default sm:block" aria-hidden="true" />

      <LiveBadge
        :mode="isLive ? 'live' : 'snapshot'"
        :updated-at="meta?.generatedAt"
        :refreshing="refreshing"
      />

      <div class="ms-auto flex items-center gap-1">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          square
          class="max-sm:hidden"
          :loading="refreshing"
          :aria-label="t('header.refresh')"
          @click="refreshNow"
        />
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-book-open"
          square
          class="hidden sm:inline-flex"
          :aria-label="t('header.legend')"
          @click="emit('openLegend')"
        />
        <UButton
          color="neutral"
          variant="ghost"
          :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
          square
          :aria-label="t('a11y.theme')"
          @click="toggleTheme"
        />
        <div
          class="ms-1 flex items-center rounded-lg border border-default p-0.5"
          role="group"
          :aria-label="t('a11y.language')"
        >
          <button
            v-for="option in (['he', 'en'] as const)"
            :key="option"
            type="button"
            class="min-h-8 rounded-md px-2 text-[11px] font-bold uppercase transition-colors"
            :class="
              locale === option
                ? 'bg-primary text-white dark:text-neutral-950'
                : 'text-muted hover:bg-elevated hover:text-default'
            "
            :aria-pressed="locale === option"
            @click="setLocale(option)"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
