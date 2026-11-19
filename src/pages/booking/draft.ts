export type BookingDraft = { teacherId: string; start: string; duration: number }

const KEY = 'thv_booking_draft'

export const saveDraft = (draft: BookingDraft) => sessionStorage.setItem(KEY, JSON.stringify(draft))
export const clearDraft = () => sessionStorage.removeItem(KEY)
export function readDraft(): BookingDraft | null {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}
