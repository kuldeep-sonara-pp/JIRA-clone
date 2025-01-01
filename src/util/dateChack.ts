export const dateCheck = (startDate: string | undefined, endDate: string | undefined): string | null => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return 'Start date cannot be later than end date.';
    }
    return null;
};
