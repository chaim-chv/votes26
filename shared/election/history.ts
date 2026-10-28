import type { BlocId, CampId, ComparisonRelation } from './types'

export const HISTORY_ELECTION = 25 as const
export const HISTORY_DATE = '2022-11-01'
export const HISTORY_LABEL_HE = 'בחירות 2022'
export const HISTORY_LABEL_EN = '2022 election'

export interface HistoryLink {
  relation: ComparisonRelation
  previousCodes: string[]
  groupId?: string
  noteHe?: string
  noteEn?: string
}

export interface HistoryGroup {
  id: string
  nameHe: string
  nameEn: string
  currentCodes: string[]
  previousCodes: string[]
}

export const HISTORY_GROUPS: HistoryGroup[] = [
  {
    id: 'labor-meretz',
    nameHe: 'הדמוקרטים (עבודה + מרץ)',
    nameEn: 'The Democrats (Labor + Meretz)',
    currentCodes: ['אמת'],
    previousCodes: ['אמת', 'מרץ'],
  },
  {
    id: 'rz-stream',
    nameHe: 'הציונות הדתית + עוצמה יהודית',
    nameEn: 'Religious Zionist stream + Otzma Yehudit',
    currentCodes: ['ט', 'ב'],
    previousCodes: ['ט'],
  },
  {
    id: 'joint-list',
    nameHe: 'הרשימה המשותפת (חד"ש-תע"ל + בל"ד)',
    nameEn: 'The Joint List (Hadash–Ta\'al + Balad)',
    currentCodes: ['ודם'],
    previousCodes: ['ום', 'ד'],
  },
]

const groupByCurrentCode = new Map<string, HistoryGroup>()
for (const group of HISTORY_GROUPS) {
  for (const code of group.currentCodes) groupByCurrentCode.set(code, group)
}

/** Current party code -> historical lineage. Never join on the code alone. */
export const CURRENT_HISTORY_LINKS: Record<string, HistoryLink> = {
  מחל: { relation: 'same', previousCodes: ['מחל'] },
  ג: { relation: 'same', previousCodes: ['ג'] },
  שס: { relation: 'same', previousCodes: ['שס'] },
  ל: { relation: 'same', previousCodes: ['ל'] },
  עם: { relation: 'same', previousCodes: ['עם'] },
  אמת: {
    relation: 'merged',
    previousCodes: ['אמת', 'מרץ'],
    groupId: 'labor-meretz',
    noteHe: 'הדמוקרטים היא מפלגה ממזגת של העבודה ומרץ.',
    noteEn: 'The Democrats is a merger of Labor and Meretz.',
  },
  ט: {
    relation: 'split',
    previousCodes: ['ט'],
    groupId: 'rz-stream',
    noteHe: 'בבחירות 2022 הציונות הדתית, עוצמה יהודית ונעם רצו ברשימה משותפת.',
    noteEn: 'In 2022 Religious Zionism, Otzma Yehudit and Noam ran as one list.',
  },
  ב: {
    relation: 'split',
    previousCodes: ['ט'],
    groupId: 'rz-stream',
    noteHe: 'בבחירות 2022 הציונות הדתית, עוצמה יהודית ונעם רצו ברשימה משותפת.',
    noteEn: 'In 2022 Religious Zionism, Otzma Yehudit and Noam ran as one list.',
  },
  ודם: {
    relation: 'merged',
    previousCodes: ['ום', 'ד'],
    groupId: 'joint-list',
    noteHe: 'הרשימה המשותפת מאחדת את חד"ש-תע"ל ובל"ד.',
    noteEn: 'The Joint List combines Hadash–Ta\'al and Balad.',
  },
}

export function historyLink(code: string): HistoryLink {
  const group = groupByCurrentCode.get(code)
  if (group && !CURRENT_HISTORY_LINKS[code]) {
    return { relation: 'merged', previousCodes: group.previousCodes, groupId: group.id }
  }
  return CURRENT_HISTORY_LINKS[code] ?? { relation: 'new', previousCodes: [] }
}

export function historyGroup(id: string): HistoryGroup | undefined {
  return HISTORY_GROUPS.find((group) => group.id === id)
}

/** Applied retroactively to the 2022 result. Editorial, not official. */
export const HISTORY_BLOC_BY_CODE: Record<string, BlocId> = {
  מחל: 'right',
  ט: 'right',
  ב: 'right',
  ל: 'right',
  כן: 'center-left',
  פה: 'center-left',
  אמת: 'center-left',
  מרץ: 'center-left',
  שס: 'haredi',
  ג: 'haredi',
  עם: 'arab',
  ום: 'arab',
  ד: 'arab',
}

export const HISTORY_CAMP_BY_CODE: Record<string, CampId> = {
  מחל: 'netanyahu',
  שס: 'netanyahu',
  ג: 'netanyahu',
  ט: 'netanyahu',
  פה: 'change',
  כן: 'change',
  ל: 'change',
  אמת: 'change',
  מרץ: 'change',
  עם: 'change',
  ום: 'change',
  ד: 'change',
}
