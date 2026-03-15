/**
 * Formats a date string into a human-readable form for post display.
 *
 * The function returns:
 * - "Сегодня, HH:mm" if the date is today
 * - "Вчера, HH:mm" if the date is yesterday
 * - "DD.MM.YYYY, HH:mm" for other dates
 *
 * @param dateString ISO date string (e.g., "2026-03-16T09:30:00Z")
 * @param timezone Optional IANA timezone string (e.g., "Europe/Moscow"). If not provided, uses browser timezone.
 * @returns {string} Formatted date string
 * @throws {Error} If the input is not a valid date string
 */
export function formatPostDate(dateString: string, timezone?: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
    }

    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const dateInTz = new Date(
        date.toLocaleString('en-US', { timeZone: tz })
    );
    const now = new Date(
        new Date().toLocaleString('en-US', { timeZone: tz })
    );

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const postDay = new Date(dateInTz.getFullYear(), dateInTz.getMonth(), dateInTz.getDate());

    const diffDays = Math.floor((today.getTime() - postDay.getTime()) / (1000 * 60 * 60 * 24));

    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(dateInTz.getHours())}:${pad(dateInTz.getMinutes())}`;

    if (diffDays === 0) {
        return `Сегодня, ${time}`;
    } else if (diffDays === 1) {
        return `Вчера, ${time}`;
    } else {
        return `${pad(dateInTz.getDate())}.${pad(dateInTz.getMonth() + 1)}.${dateInTz.getFullYear()}, ${time}`;
    }
}
