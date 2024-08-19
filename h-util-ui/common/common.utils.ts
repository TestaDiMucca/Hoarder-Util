export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns a zero-based index
    const day = date.getDate();

    // Pad the month and day with leading zeros if needed
    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');

    return `${year}-${paddedMonth}-${paddedDay}`;
}
