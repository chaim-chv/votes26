<script setup lang="ts">
import type { PartyResult } from '~~/shared/election/types'

defineProps<{
  parties: PartyResult[]
  showVotes?: boolean
}>()

const { locale, t } = useLocale()
const { number, percent } = useFormat()
</script>

<template>
  <ol class="grid gap-1.5 sm:grid-cols-2" :aria-label="t('common.partyList')">
    <li
      v-for="party in parties.filter((item) => item.seats > 0)"
      :key="party.code"
      class="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm"
    >
      <PartySwatch :color="party.color" size="sm" />
      <span class="min-w-0 flex-1 truncate">
        {{ locale === 'he' ? party.nameHe : party.nameEn }}
      </span>
      <span v-if="showVotes" class="text-xs text-muted tabular">
        {{ percent(party.votePct) }}
      </span>
      <span class="min-w-7 text-end font-bold tabular">{{ number(party.seats) }}</span>
    </li>
  </ol>
</template>
