import { EmptyValuePipe } from './empty-value.pipe';

describe('EmptyValuePipe', () => {
	let pipe: EmptyValuePipe;

	beforeEach(() => {
		pipe = new EmptyValuePipe();
	});

	it('create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should return "-" for null value', () => {
		const value = null;
		expect(pipe.transform(value)).toEqual('-');
	});

	it('should return "-" for undefined value', () => {
		const value = undefined;
		expect(pipe.transform(value)).toEqual('-');
	});

	it('should return 0 for 0 value', () => {
		const value = 0;
		expect(pipe.transform(value)).toEqual(0);
	});

	it('should return false for false value', () => {
		const value = false;
		expect(pipe.transform(value)).toEqual(false);
	});
});
