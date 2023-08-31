export const sortCaseInsensitive = <T>(data: T, sortHeaderId: string): string | number => {
	const value = data[sortHeaderId];

	return typeof value === 'string' ? value.toUpperCase() : value;
};
