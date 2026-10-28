import type { BlocId, CampId, Locale, PartyMeta } from './types'

export const BLOC_ORDER: BlocId[] = ['right', 'haredi', 'center-left', 'arab', 'other']

export const BLOCS: Record<
  BlocId,
  { nameHe: string; nameEn: string; color: string; icon: string }
> = {
  right: {
    nameHe: 'ימין',
    nameEn: 'Right',
    color: '#1d4ed8',
    icon: 'i-lucide-landmark',
  },
  haredi: {
    nameHe: 'חרדים',
    nameEn: 'Haredi',
    color: '#b45309',
    icon: 'i-lucide-book-open',
  },
  'center-left': {
    nameHe: 'מרכז־שמאל',
    nameEn: 'Center-left',
    color: '#0f766e',
    icon: 'i-lucide-scale',
  },
  arab: {
    nameHe: 'מפלגות ערביות',
    nameEn: 'Arab parties',
    color: '#047857',
    icon: 'i-lucide-users',
  },
  other: {
    nameHe: 'אחר',
    nameEn: 'Other',
    color: '#64748b',
    icon: 'i-lucide-circle-help',
  },
}

export const CAMPS: Record<
  CampId,
  { nameHe: string; nameEn: string; color: string }
> = {
  netanyahu: {
    nameHe: 'גוש נתניהו',
    nameEn: 'Netanyahu bloc',
    color: '#1d4ed8',
  },
  change: {
    nameHe: 'גוש השינוי',
    nameEn: 'Change bloc',
    color: '#0f766e',
  },
  unclear: {
    nameHe: 'לא מסווג',
    nameEn: 'Unclassified',
    color: '#64748b',
  },
}

type MetaInput = Omit<PartyMeta, 'code' | 'ballot'> & { ballot?: string }

const p = (code: string, meta: MetaInput): PartyMeta => ({
  code,
  ballot: meta.ballot ?? code,
  ...meta,
})

/**
 * Party names, colors and groupings.
 *
 * The bloc is a broad political family used for the 120-seat breakdown. The
 * camp is a separate, explicitly editorial classification used only for the
 * coalition-arithmetic panel. Neither is an official designation.
 */
export const PARTY_META: Record<string, PartyMeta> = {
  מחל: p('מחל', {
    nameHe: 'הליכוד',
    nameEn: 'Likud',
    fullNameHe: 'הליכוד בהנהגת בנימין נתניהו לראשות הממשלה',
    color: '#1B0FFF',
    ballot: 'מחל',
    bloc: 'right',
    camp: 'netanyahu',
    order: 10,
  }),
  ב: p('ב', {
    nameHe: 'עוצמה יהודית',
    nameEn: 'Otzma Yehudit',
    fullNameHe: 'עוצמה יהודית בראשות איתמר בן גביר',
    color: '#F5F53F',
    ballot: 'ב',
    bloc: 'right',
    camp: 'netanyahu',
    order: 11,
  }),
  ט: p('ט', {
    nameHe: 'הציונות הדתית וזהות',
    nameEn: 'Religious Zionism–Zehut',
    fullNameHe: "הציונות הדתית בראשות בצלאל סמוטריץ' וזהות בראשות משה פייגלין",
    color: '#994106',
    ballot: 'ט',
    bloc: 'right',
    camp: 'netanyahu',
    order: 12,
  }),
  ל: p('ל', {
    nameHe: 'ישראל ביתנו',
    nameEn: 'Yisrael Beiteinu',
    fullNameHe: 'ישראל ביתנו בראשות אביגדור ליברמן',
    color: '#E66EB0',
    ballot: 'ל',
    bloc: 'right',
    camp: 'change',
    order: 13,
  }),
  ני: p('ני', {
    nameHe: 'נעם',
    nameEn: 'Noam',
    color: '#AD932D',
    ballot: 'ני',
    bloc: 'right',
    camp: 'netanyahu',
    order: 14,
  }),
  ז: p('ז', {
    nameHe: 'בטח',
    nameEn: 'Betach',
    color: '#8B1E2D',
    ballot: 'ז',
    bloc: 'right',
    camp: 'unclear',
    order: 15,
  }),
  י: p('י', {
    nameHe: 'ישראל תחילה',
    nameEn: 'Israel First',
    color: '#6B6A67',
    ballot: 'י',
    bloc: 'right',
    camp: 'unclear',
    order: 16,
  }),
  נץ: p('נץ', {
    nameHe: 'ביטחון אישי',
    nameEn: 'Personal Security',
    color: '#FF84BA',
    ballot: 'נץ',
    bloc: 'right',
    camp: 'unclear',
    order: 17,
  }),
  צבי: p('צבי', {
    nameHe: 'תנועת אחי',
    nameEn: 'Achi Movement',
    color: '#2F39A9',
    ballot: 'צבי',
    bloc: 'right',
    camp: 'unclear',
    order: 18,
  }),
  ק: p('ק', {
    nameHe: 'תקומה',
    nameEn: 'Redemption',
    color: '#F7D6D0',
    ballot: 'ק',
    bloc: 'right',
    camp: 'unclear',
    order: 19,
  }),
  ך: p('ך', {
    nameHe: 'עמך ישראל',
    nameEn: 'Amcha Yisrael',
    color: '#35E0F0',
    ballot: 'ך',
    bloc: 'right',
    camp: 'unclear',
    order: 20,
  }),
  בי: p('בי', {
    nameHe: 'צומת בית ישראל',
    nameEn: 'Tzomet–Beit Yisrael',
    color: '#08C26B',
    ballot: 'בי',
    bloc: 'right',
    camp: 'unclear',
    order: 21,
  }),
  קך: p('קך', {
    nameHe: 'סדר חדש',
    nameEn: 'New Order',
    color: '#F2A900',
    ballot: 'קך',
    bloc: 'right',
    camp: 'unclear',
    order: 22,
  }),
  ג: p('ג', {
    nameHe: 'יהדות התורה',
    nameEn: 'United Torah Judaism',
    fullNameHe: 'יהדות התורה והשבת אגודת ישראל — דגל התורה',
    color: '#0F0F0E',
    ballot: 'ג',
    bloc: 'haredi',
    camp: 'netanyahu',
    order: 30,
  }),
  שס: p('שס', {
    nameHe: 'ש"ס',
    nameEn: 'Shas',
    fullNameHe: 'התאחדות הספרדים שומרי תורה — תנועתו של מרן הרב עובדיה יוסף זצ"ל',
    color: '#FA9703',
    ballot: 'שס',
    bloc: 'haredi',
    camp: 'netanyahu',
    order: 31,
  }),
  זך: p('זך', {
    nameHe: 'הציבור החרדי',
    nameEn: 'The Haredi Public',
    color: '#BC0202',
    ballot: 'זך',
    bloc: 'haredi',
    camp: 'unclear',
    order: 32,
  }),
  נר: p('נר', {
    nameHe: 'צבע שחור',
    nameEn: 'The Color Black',
    color: '#4B5694',
    ballot: 'נר',
    bloc: 'haredi',
    camp: 'unclear',
    order: 33,
  }),
  רץ: p('רץ', {
    nameHe: 'הקהל',
    nameEn: 'HaKahal',
    color: '#AEEA94',
    ballot: 'רץ',
    bloc: 'haredi',
    camp: 'unclear',
    order: 34,
  }),
  דרך: p('דרך', {
    nameHe: 'ישר',
    nameEn: 'Yashar',
    fullNameHe: 'ישר! עם איזנקוט לראשות הממשלה — מאחדים את ישראל',
    color: '#248231',
    ballot: 'דרך',
    bloc: 'center-left',
    camp: 'change',
    order: 40,
  }),
  רק: p('רק', {
    nameHe: 'ביחד',
    nameEn: 'Together',
    fullNameHe: 'ביחד בראשות נפתלי בנט',
    color: '#9513BD',
    ballot: 'רק',
    bloc: 'center-left',
    camp: 'change',
    order: 41,
  }),
  אמת: p('אמת', {
    nameHe: 'הדמוקרטים',
    nameEn: 'The Democrats',
    fullNameHe: 'הדמוקרטים בראשות יאיר גולן',
    color: '#EB1D1D',
    ballot: 'אמת',
    bloc: 'center-left',
    camp: 'change',
    order: 42,
  }),
  די: p('די', {
    nameHe: 'המילואימניקים והכלכלית',
    nameEn: 'The Reservists–Economic Party',
    fullNameHe: 'המילואימניקים והכלכלית בראשות יועז הנדל וירון זליכה',
    color: '#CCCBC9',
    ballot: 'די',
    bloc: 'center-left',
    camp: 'change',
    order: 43,
  }),
  כן: p('כן', {
    nameHe: 'כחול לבן',
    nameEn: 'Blue and White',
    color: '#6C8EBF',
    ballot: 'כן',
    bloc: 'center-left',
    camp: 'unclear',
    order: 44,
  }),
  ד: p('ד', {
    nameHe: 'השותפות לכולם',
    nameEn: 'Partnership for All',
    color: '#FFC0DE',
    ballot: 'ד',
    bloc: 'center-left',
    camp: 'unclear',
    order: 45,
  }),
  ודם: p('ודם', {
    nameHe: 'הרשימה המשותפת',
    nameEn: 'The Joint List',
    fullNameHe: 'הרשימה המשותפת',
    color: '#1BF513',
    ballot: 'ודם',
    bloc: 'arab',
    camp: 'change',
    order: 50,
  }),
  עם: p('עם', {
    nameHe: 'רע"ם',
    nameEn: "Ra'am",
    fullNameHe: 'רע"ם — הרשימה הערבית המאוחדת',
    color: '#065214',
    ballot: 'עם',
    bloc: 'arab',
    camp: 'change',
    order: 51,
  }),
  בד: p('בד', {
    nameHe: 'ביחד נצליח',
    nameEn: 'Together We Will Succeed',
    color: '#C90661',
    ballot: 'בד',
    bloc: 'arab',
    camp: 'change',
    order: 52,
  }),
  בקר: p('בקר', {
    nameHe: 'אורות השחר',
    nameEn: "Dawn's Light",
    color: '#1591DC',
    ballot: 'בקר',
    bloc: 'other',
    camp: 'unclear',
    order: 60,
  }),
  ה: p('ה', {
    nameHe: 'גן עדן',
    nameEn: 'Garden of Eden',
    color: '#D10056',
    ballot: 'ה',
    bloc: 'other',
    camp: 'unclear',
    order: 61,
  }),
  זץ: p('זץ', {
    nameHe: 'ברית עולם',
    nameEn: 'Eternal Covenant',
    color: '#2D0000',
    ballot: 'זץ',
    bloc: 'other',
    camp: 'unclear',
    order: 62,
  }),
  יק: p('יק', {
    nameHe: 'גה"ת',
    nameEn: 'The Bible Bloc',
    color: '#FFC0DE',
    ballot: 'יק',
    bloc: 'other',
    camp: 'unclear',
    order: 63,
  }),
  נף: p('נף', {
    nameHe: 'שמע',
    nameEn: 'Shema',
    color: '#C9CAAC',
    ballot: 'נף',
    bloc: 'other',
    camp: 'unclear',
    order: 64,
  }),
  נקי: p('נקי', {
    nameHe: 'התיקון לשיטת הבחירות והממשל',
    nameEn: 'Fixing the Electoral and Governing System',
    color: '#DEC384',
    ballot: 'נקי',
    bloc: 'other',
    camp: 'unclear',
    order: 65,
  }),
  פה: p('פה', {
    nameHe: 'אני ואתה',
    nameEn: 'Ani VeAta',
    color: '#4D2A00',
    ballot: 'פה',
    bloc: 'other',
    camp: 'unclear',
    order: 66,
  }),
  צדק: p('צדק', {
    nameHe: 'שרשר',
    nameEn: 'Sharshar',
    color: '#C4E2F5',
    ballot: 'צדק',
    bloc: 'other',
    camp: 'unclear',
    order: 67,
  }),
  צף: p('צף', {
    nameHe: 'הפיראטים',
    nameEn: 'The Pirates',
    color: '#8B639B',
    ballot: 'צף',
    bloc: 'other',
    camp: 'unclear',
    order: 68,
  }),
  קה: p('קה', {
    nameHe: 'קול הנשים',
    nameEn: "Women's Voice",
    color: '#70FFD2',
    ballot: 'קה',
    bloc: 'other',
    camp: 'unclear',
    order: 69,
  }),
  קץ: p('קץ', {
    nameHe: 'משפט צדק',
    nameEn: 'Just Law',
    color: '#FFEDB9',
    ballot: 'קץ',
    bloc: 'other',
    camp: 'unclear',
    order: 70,
  }),
}

const FALLBACK_COLOR = '#64748b'

export function partyMeta(code: string): PartyMeta {
  return (
    PARTY_META[code] ?? {
      code,
      nameHe: code || 'אחר',
      nameEn: code || 'Other',
      color: FALLBACK_COLOR,
      ballot: code,
      bloc: 'other',
      camp: 'unclear',
      order: 99,
    }
  )
}

export function partyName(party: Pick<PartyMeta, 'nameHe' | 'nameEn'>, locale: Locale) {
  return locale === 'he' ? party.nameHe : party.nameEn
}

export function blocName(bloc: BlocId, locale: Locale) {
  return locale === 'he' ? BLOCS[bloc].nameHe : BLOCS[bloc].nameEn
}

export function campName(camp: CampId, locale: Locale) {
  return locale === 'he' ? CAMPS[camp].nameHe : CAMPS[camp].nameEn
}
