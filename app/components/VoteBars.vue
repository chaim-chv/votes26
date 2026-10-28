<script setup lang="ts">
import type { PartyResult } from '~~/shared/election/types'

const props = defineProps<{
  parties: PartyResult[]
}>()

const { locale, t } = useLocale()
const { number, percent } = useFormat()

const maxPct = computed(() =>
  Math.max(1, ...props.parties.map((party) => party.votePct)),
)

function width(party: PartyResult) {
  return Math.max(0.6, (party.votePct / maxPct.value) * 100)
}
</script>

<template>
  <ol class="space-y-1" :aria-label="t('common.partyList')">
    <li
      v-for="party in parties"
      :key="party.code"
      class="group rounded-xl px-2 py-2 transition-colors hover:bg-elevated/60"
    >
      <div class="flex items-center gap-2.5">
        <span class="w-5 shrink-0 text-end text-xs text-muted tabular">{{ party.rank }}</span>
        <PartySwatch :color="party.color" />
        <div class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span class="font-semibold">{{ locale === 'he' ? party.nameHe : party.nameEn }}</span>
          <span class="text-xs text-muted">({{ party.ballot }})</span>
          <UBadge
            v-if="!party.passesThreshold"
            color="neutral"
            variant="soft"
            size="xs"
            class="ms-auto sm:ms-0"
          >
            {{ t('votes.table.failed') }}
          </UBadge>
        </div>
        <span class="shrink-0 text-xs tabular sm:text-sm">{{ number(party.votes) }}</span>
        <span class="w-14 shrink-0 text-end text-sm font-semibold tabular">
          {{ percent(party.votePct) }}
        </span>
      </div>
      <div class="mt-1.5 flex items-center gap-2.5 ps-7">
        <div class="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            class="bar-fill h-full rounded-full"
            :style="{ width: `${width(party)}%`, backgroundColor: party.color }"
            aria-hidden="true"
          />
        </div>
      </div>
      <span class="sr-only">
        {{ number(party.votes) }} {{ t('units.votes') }}, {{ percent(party.votePct) }}
      </span>
    </li>
  </ol>
</template>
