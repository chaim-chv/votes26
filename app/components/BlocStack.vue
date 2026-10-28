<script setup lang="ts">
import type { BlocResult } from '~~/shared/election/types'

const props = defineProps<{
  blocs: BlocResult[]
  totalSeats: number
}>()

const { locale, t } = useLocale()
const { number, percent } = useFormat()

const visible = computed(() => props.blocs.filter((bloc) => bloc.seats > 0))

const summary = computed(() =>
  visible.value
    .map(
      (bloc) =>
        `${locale.value === 'he' ? bloc.nameHe : bloc.nameEn}: ${bloc.seats} ${t('units.seats')}`,
    )
    .join(', '),
)

function width(bloc: BlocResult) {
  return (bloc.seats / props.totalSeats) * 100
}
</script>

<template>
  <div>
    <div
      class="flex h-10 w-full overflow-hidden rounded-xl border border-default"
      role="img"
      :aria-label="summary"
    >
      <div
        v-for="bloc in visible"
        :key="bloc.id"
        class="flex h-full items-center justify-center overflow-hidden text-[11px] font-bold text-white transition-[width] duration-500"
        :style="{ width: `${width(bloc)}%`, backgroundColor: bloc.color }"
        :title="`${locale === 'he' ? bloc.nameHe : bloc.nameEn}: ${bloc.seats}`"
        aria-hidden="true"
      >
        <span v-if="width(bloc) >= 8">{{ number(bloc.seats) }}</span>
      </div>
    </div>

    <ul class="mt-4 grid gap-2 sm:grid-cols-2">
      <li
        v-for="bloc in visible"
        :key="bloc.id"
        class="flex items-center gap-2.5 rounded-lg border border-default px-3 py-2"
      >
        <span
          class="grid size-8 shrink-0 place-items-center rounded-lg text-white"
          :style="{ backgroundColor: bloc.color }"
          aria-hidden="true"
        >
          <UIcon :name="bloc.icon" class="size-4" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold">
            {{ locale === 'he' ? bloc.nameHe : bloc.nameEn }}
          </span>
          <span class="block text-xs text-muted tabular">
            {{ percent(bloc.votePct) }} {{ t('common.votes') }}
          </span>
        </span>
        <span class="text-end">
          <span class="block text-lg font-bold leading-none tabular">{{ number(bloc.seats) }}</span>
          <span class="block text-[11px] text-muted">{{ t('common.seats') }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>
