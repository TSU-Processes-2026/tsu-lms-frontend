export const dateTimeFormatter = (dateTimeString: string | null | undefined): string => {
    if (!dateTimeString) return dateTimeFormatter(new Date().toISOString());

    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
        .format(date)
        .replace('г.', '')
        .trim();
};
