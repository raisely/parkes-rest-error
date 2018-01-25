const {
	RestError,
	addError,
	addErrors,
	listErrors,
	addFormat,
	formatError,
} = require('../index');

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
	it('Can add and list errors', () => {
		const name = 'something thrown';
		const name2 = 'something also thrown';
		const name3 = 'something thrown again';

		const title = 'Hello';
		const detail = 'You can\'t do that';

		addError(name, { title, detail }); // single add
		addErrors({ [name2]: { title, detail } }); // key-pair add
		addErrors([{ [name3]: { title, detail } }]); // list add

		const errors = listErrors();

		expect(errors).to.be.an('array').that.includes(name);
		expect(errors).to.be.an('array').that.includes(name2);
		expect(errors).to.be.an('array').that.includes(name3);
	});
	it('Can add formatters', () => {
		const status = 403;

		const customFormat = e => ({
			status,
			errors: [e],
		});

		addFormat(customFormat);
		const error = formatError(new Error());
		expect(error).to.be.an('object').includes({ status });
	});
});
