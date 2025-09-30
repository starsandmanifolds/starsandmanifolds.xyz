export function formatDate(dateString: string): string {
  // Date string from filename is already in YYYY-MM-DD format
  // Return as-is to avoid timezone issues with Date parsing
  return dateString;
}