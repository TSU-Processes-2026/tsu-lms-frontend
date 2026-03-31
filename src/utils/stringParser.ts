export const formatToInt = (value: string | number): number => {
    if (typeof value === 'number') return value;
    return Number.parseInt(value.toString());
};
