const { RestError } = require('../index');
const { expect } = require('chai');

describe('RestError', () => {
	it('Can instantiate', () => {
		expect(() => {
			const error = new RestError({
				code: 'test',
				message: 'Testing instantiation',
				status: 200,
			});
		}).to.not.throw();
	});
});
