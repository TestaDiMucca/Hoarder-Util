export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns a zero-based index
    const day = date.getDate();

    // Pad the month and day with leading zeros if needed
    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');

    return `${year}-${paddedMonth}-${paddedDay}`;
}

export function slugify(text: string): string {
    return (
        text
            // Convert to lowercase
            .toLowerCase()
            // Replace spaces with -
            .replace(/\s+/g, '-')
            // Remove all non-word chars except for - and _
            .replace(/[^a-z0-9\-_]+/g, '')
            // Replace multiple - or _ with a single -
            .replace(/-+/g, '-')
            // Trim - from start and end of text
            .trim()
    );
}
