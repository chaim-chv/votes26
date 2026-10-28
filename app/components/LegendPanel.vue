<script setup lang="ts">
import type { MessageKey } from '~/i18n/messages'

const { t } = useLocale()

const items: Array<{ icon: string; title: MessageKey; body: MessageKey; color: string }> = [
  { icon: 'i-lucide-armchair', title: 'legend.seat.title', body: 'legend.seat.body', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  { icon: 'i-lucide-filter', title: 'legend.threshold.title', body: 'legend.threshold.body', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  { icon: 'i-lucide-check', title: 'legend.valid.title', body: 'legend.valid.body', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  { icon: 'i-lucide-palette', title: 'legend.party.title', body: 'legend.party.body', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300' },
  { icon: 'i-lucide-users', title: 'legend.bloc.title', body: 'legend.bloc.body', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
  { icon: 'i-lucide-gauge', title: 'legend.realistic.title', body: 'legend.realistic.body', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  { icon: 'i-lucide-list', title: 'legend.actual.title', body: 'legend.actual.body', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
  { icon: 'i-lucide-handshake', title: 'legend.majority.title', body: 'legend.majority.body', color: 'bg-primary/10 text-primary' },
]
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm leading-6 text-muted">{{ t('legend.desc') }}</p>

    <dl class="space-y-2.5">
      <div v-for="item in items" :key="item.title" class="rounded-xl border border-default p-3">
        <dt class="flex items-center gap-3">
          <span
            class="grid size-9 shrink-0 place-items-center rounded-lg"
            :class="item.color"
            aria-hidden="true"
          >
            <UIcon :name="item.icon" class="size-4.5" />
          </span>
          <span class="text-sm font-semibold">{{ t(item.title) }}</span>
        </dt>
        <dd class="mt-1 ps-12 text-xs leading-5 text-muted">{{ t(item.body) }}</dd>
      </div>
    </dl>

    <div class="rounded-xl bg-elevated/60 p-3 text-xs leading-5 text-muted">
      <p class="flex items-center gap-1.5 font-semibold text-default">
        <UIcon name="i-lucide-info" class="size-4" aria-hidden="true" />
        {{ t('common.caveat') }}
      </p>
      <p class="mt-1">{{ t('method.caveats.body') }}</p>
    </div>
  </div>
</template>
