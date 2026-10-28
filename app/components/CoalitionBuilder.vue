<script setup lang="ts">
import type { CampResult, PartyResult } from '~~/shared/election/types'

const props = withDefaults(
  defineProps<{
    parties: PartyResult[]
    camps: CampResult[]
    totalSeats?: number
    majority?: number
    previousCampSeats?: number | null
  }>(),
  { totalSeats: 120, majority: 61, previousCampSeats: null },
)

const { locale, t } = useLocale()
const { number } = useFormat()

const selected = ref<string[]>([])
const byCode = computed(() => new Map(props.parties.map((party) => [party.code, party])))

const campSeats = (id: 'netanyahu' | 'change' | 'unclear') =>
  props.camps.find((camp) => camp.id === id)?.seats ?? 0

const grouped = computed(() => {
  const groups: Array<{ camp: CampResult; parties: PartyResult[] }> = []
  for (const camp of props.camps) {
    const parties = camp.partyCodes
      .map((code) => byCode.value.get(code))
      .filter((party): party is PartyResult => Boolean(party))
    if (parties.length > 0) groups.push({ camp, parties })
  }
  return groups
})

const selectedSeats = computed(() =>
  selected.value.reduce((sum, code) => sum + (byCode.value.get(code)?.seats ?? 0), 0),
)

const shortfall = computed(() => Math.max(0, props.majority - selectedSeats.value))
const reached = computed(() => selectedSeats.value >= props.majority)

const statusText = computed(() =>
  reached.value
    ? t('blocs.builder.ok')
    : t('blocs.builder.short', { count: shortfall.value }),
)

function toggle(code: string) {
  selected.value = selected.value.includes(code)
    ? selected.value.filter((item) => item !== code)
    : [...selected.value, code]
}

function applyPreset(id: 'netanyahu' | 'change') {
  const camp = props.camps.find((item) => item.id === id)
  selected.value = camp ? [...camp.partyCodes] : []
}

function clear() {
  selected.value = []
}

const barWidth = computed(() => (selectedSeats.value / props.totalSeats) * 100)
</script>

<template>
  <section aria-labelledby="coalition-builder-title" class="card-quiet p-4 sm:p-6">
    <div class="max-w-2xl">
      <h2 id="coalition-builder-title" class="text-xl font-bold">
        {{ t('blocs.builder.title') }}
      </h2>
      <p class="mt-1 text-sm leading-6 text-muted">{{ t('blocs.builder.desc') }}</p>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-2">
      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        icon="i-lucide-lock-keyhole"
        @click="applyPreset('netanyahu')"
      >
        {{ t('blocs.builder.presetNetanyahu') }} · {{ number(campSeats('netanyahu')) }}
      </UButton>
      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        icon="i-lucide-refresh-cw"
        @click="applyPreset('change')"
      >
        {{ t('blocs.builder.presetChange') }} · {{ number(campSeats('change')) }}
      </UButton>
      <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" @click="clear">
        {{ t('blocs.builder.clear') }}
      </UButton>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <fieldset class="min-w-0">
        <legend class="sr-only">{{ t('blocs.builder.selectedParties') }}</legend>
        <div class="space-y-4">
          <div v-for="group in grouped" :key="group.camp.id">
            <p class="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
              <span
                class="size-2 rounded-full"
                :style="{ backgroundColor: group.camp.color }"
                aria-hidden="true"
              />
              {{ locale === 'he' ? group.camp.nameHe : group.camp.nameEn }}
            </p>
            <div class="grid gap-1.5 sm:grid-cols-2">
              <label
                v-for="party in group.parties"
                :key="party.code"
                class="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-default px-2.5 py-2 text-sm transition-colors hover:bg-elevated/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="checkbox"
                  class="size-4 shrink-0 accent-primary"
                  :value="party.code"
                  :checked="selected.includes(party.code)"
                  @change="toggle(party.code)"
                />
                <PartySwatch :color="party.color" size="sm" />
                <span class="min-w-0 flex-1 truncate">
                  {{ locale === 'he' ? party.nameHe : party.nameEn }}
                </span>
                <span class="text-xs font-semibold tabular">{{ number(party.seats) }}</span>
              </label>
            </div>
          </div>
        </div>
        <p class="mt-3 text-xs leading-5 text-muted">{{ t('blocs.builder.hint') }}</p>
      </fieldset>

      <div class="self-start rounded-xl bg-elevated/60 p-4">
        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="text-xs font-medium text-muted">{{ t('blocs.builder.selectedLabel') }}</p>
            <p class="mt-1 text-4xl font-bold leading-none tabular">{{ number(selectedSeats) }}</p>
          </div>
          <div class="text-end text-xs text-muted">
            <p>{{ t('blocs.builder.need') }}</p>
            <p class="text-lg font-bold text-default tabular">{{ number(majority) }}</p>
          </div>
        </div>

        <div class="mt-4">
          <div class="relative h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              class="h-full rounded-full transition-[width] duration-300"
              :class="reached ? 'bg-emerald-500' : 'bg-primary'"
              :style="{ width: `${barWidth}%` }"
              aria-hidden="true"
            />
            <div
              class="absolute inset-y-0 w-0.5 bg-neutral-950/80 dark:bg-white"
              :style="{ insetInlineStart: `${(majority / totalSeats) * 100}%` }"
              aria-hidden="true"
            />
            <div
              v-if="previousCampSeats"
              class="absolute inset-y-0 w-px bg-neutral-500/70"
              :style="{ insetInlineStart: `${(previousCampSeats / totalSeats) * 100}%` }"
              :title="t('comparison.coalitionTick')"
              aria-hidden="true"
            />
          </div>
          <p v-if="previousCampSeats" class="mt-1 text-[11px] text-muted">
            {{ t('comparison.coalitionTick') }}: {{ number(previousCampSeats) }}
          </p>
        </div>

        <p
          class="mt-3 min-h-10 text-sm font-medium"
          :class="reached ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'"
          aria-live="polite"
        >
          {{ statusText }}
        </p>

        <div v-if="selected.length" class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="code in selected"
            :key="code"
            class="inline-flex items-center gap-1 rounded-full border border-default px-2 py-0.5 text-[11px]"
          >
            <PartySwatch :color="byCode.get(code)?.color ?? '#64748b'" size="sm" />
            {{ locale === 'he' ? byCode.get(code)?.nameHe : byCode.get(code)?.nameEn }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
