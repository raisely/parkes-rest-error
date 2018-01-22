// Maps from error.code to title and detail
/* eslint quote-props: ["error", "consistent-as-needed"] */
/* eslint-disable object-curly-newline */
const errorCodeMap = {
	'already exists': { title: 'That resource already exists', detail: 'The resource you tried to create already exists' },
	'empty body': { title: 'Request body cannot be empty',
		detail: 'You did not specify any body for the request, or the data attribute of the JSON body is empty' },
	'forbidden': { title: 'Forbidden', detail: 'You are not permitted to do that.' },
	'internal error': { title: 'Internal error',
		detail: 'Sorry, an internal error has occurred.' },
	'invalid token': { title: 'Invalid access token', detail: 'The token you used to authenticate is not valid' },
	'invalid record state': {
		title: 'The record is in an invalid state for that action',
		detail: 'You are attempting an action that is not allowed for the current state of the record',
	},
	'invalid value': { title: 'Invalid value', detail: 'The value supplied is not valid' },
	'missing parameter': { title: 'Missing value', detail: 'You did not supply a required value' },
	'not found': { title: 'Not found', detail: 'That record cannot be found' },
	'not logged in': { title: 'You are not logged in', detail: 'This method is only available to logged in users' },
	// FIXME: this should be mapped to missing parameter
	'notnull violation': { title: 'This value cannot be null', detail: 'You have not specified a value that must be specified' },
	'restricted field': { title: 'Cannot update restricted field', detail: 'One or more fields that you included are not allowed to be set' },
	'unauthorized': { title: 'You are not authorized', detail: 'You are not permitted to perform that action.' },
	'validation error': { title: 'Invalid value', detail: 'This value is not valid' },
};

// adds (or overrides) an error code to the errorCodes map
function addErrorCode(name, meta = {}) {
	if (typeof name !== 'string') {
		return console.warn('RestError: custom ErrorCode name must be of type string');
	}
	if (typeof meta !== 'object' || !meta.title || !meta.detail) {
		return console.warn('RestError: custom ErrorCode metadata must be object with title and detail');
	}
	errorCodeMap[name] = meta;
}

module.exports = { addErrorCode, errorCodeMap };
