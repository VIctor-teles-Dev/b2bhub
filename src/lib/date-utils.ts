export function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'N/A') return null
  // Format: DD/MM/YYYY
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
}

export function parseDateTime(dateTimeStr: string): Date | null {
  if (!dateTimeStr || dateTimeStr === 'N/A') return null
  // Format: DD/MM/YYYY, HH:mm:ss
  // We only care about the date part for comparison in most cases here
  const [datePart] = dateTimeStr.split(',')
  return parseDate(datePart)
}

export function isSentBeforeDistributed(sent: string, distributed: string): boolean {
  const sentDate = parseDateTime(sent)
  const distDate = parseDate(distributed)

  if (!sentDate || !distDate) return false
  
  // Reset hours to compare only dates
  sentDate.setHours(0, 0, 0, 0)
  distDate.setHours(0, 0, 0, 0)

  return sentDate < distDate
}
