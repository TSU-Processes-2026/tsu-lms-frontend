export const formatToInt = (value: string | number | undefined): number => {
    if (typeof value === undefined) return 0;
    if (typeof value === 'number') return value;
    return Number.parseInt(value.toString());
};
