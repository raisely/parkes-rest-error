/**
  * How to use restErrors
  *
  * In your code, throw a new rest error with a code, message, and status and then
  * describe the error code in this file in the errors array below.
  *
  * Why the split? Since the convention is that title and detail are always the same
  * given the same code, we can keep controller code leaner by just specifying the error
  * code when throwing the error.
  * (This also lends itself to internationalisation in the future)
  *
  * For multiple errors, pass an array of errors, and you can set a default code and/or status
  *
  *	throw new globals.RestError({ status: 404, message: 'Profile could not be found',
  *								 code: 'not found'});
  *
  * // Multiple errors, with defaults for properties
  * throw new globals.RestError({
  *		status: 400,
  *		code: 'invalid syntax',
  *		errors: [
  *			{ message: 'email is not valid' , code: 'validation error' }, // status: 400
  *			{ message: 'public is malformed' }, // code: 'invalid syntax', status: 400,
  *		}],
  *	});
  *
  * // In this file, in the errorCodeMap object
  * ...
  * 'invalid syntax': { title: 'Invalid Syntax', detail: 'Your syntax is not valid' },
  * ...
  */

// Maps from error.code to title and detail
/* eslint quote-props: ["error", "consistent-as-needed"] */
const errorCodeMap = {
	'already exists': { title: 'That resource already exists', detail: 'The resource you tried to create already exists' },
	'empty body': { title: 'Request body cannot be empty',
		detail: 'You did not specify any body for the request, or the data attribute of the JSON body is empty' },
	'forbidden': { title: 'Forbidden', detail: 'You are not permitted to make this request' },
	'internal error': { title: 'Internal error',
		detail: 'Sorry, an internal error has occurred. If the problem persists, please contact support@raisely.com' },
	'invalid token': { title: 'Invalid access token', detail: 'The token you used to authenticate is not valid' },
	'invalid syntax': {
		title: 'Invalid Syntax',
		detail: 'One or more of the values you sent was not of the correct syntax. Please check the format of the values you are sending.',
	},
	'invalid record state': {
		title: 'The record is in an invalid state for that action',
		detail: 'You are attempting an action that is not allowed for the current state of the record',
	},
	'invalid payload': { title: 'Invalid payload', detail: 'The incorrect kind of payload is being sent to a webhook' },
	'invalid value': { title: 'Invalid value', detail: 'The value supplied is not valid' },
	'missing parameter': { title: 'Missing value', detail: 'You did not supply a required value' },
	'not found': { title: 'Not found', detail: 'That record cannot be found' },
	'not logged in': { title: 'You are not logged in', detail: 'This method is only available to logged in users' },
	// FIXME: this should be mapped to missing parameter
	'notnull violation': { title: 'This value cannot be null', detail: 'You have not specified a value that must be specified' },
	'payment gateway error': { title: 'Payment Gateway Error', detail: 'An error occurred with the payment gateway' },
	'restricted field': { title: 'Cannot update restricted field', detail: 'One or more fields that you included are not allowed to be set' },
	'unauthorized': { title: 'You are not authorized', detail: 'You are not permitted to perform that action.' },
	'validation error': { title: 'Invalid value', detail: 'This value is not valid' },
};

/**
  * @description
  * An error containing complete restError details
  * Can contain either a single error, or a list
  * @example
  *	throw new RestError({ status: 404, message: 'Profile could not be found', code: 'not found'});
  *
  * // Multiple errors, with defaults for properties
  * throw new RestError({
  *		status: 400,
  *		code: 'invalid syntax',
  *		errors: [
  *			{ message: 'email is not valid' , code: 'validation error' }, // status: 400
  *			{ message: 'public is malformed' }, // code: 'invalid syntax', status: 400,
  *		}],
  *	});
  */
class RestError extends Error {
	/**
	  * Lookup the title and detail for the given error code
	  * @param {string} code The error code to Lookup
	  * @return {Object} Object containing title and detail keys, found in the errors object above
	  */
	static getDetail(code, status) {
		// Error used if code can't be found in errorCodeMap
		// In non production environments, flag a notice to the developer that
		// the error code requires a description
		const missingCode = process.env.NODE_ENV === 'production' ? {} : {
			title: "ERROR: No title has been specified for this code (or there's no code)",
			detail: `Developer, please add a title and description for the code (${code}) to the errorCodeMap in ${__filename}`,
		};

		if (!errorCodeMap[code]) {
			// If it's a 500 error, use the generic error for 500s
			// otherwise, flag to the developer that  code map is needed
			return (status >= 500) ? errorCodeMap['internal error'] : missingCode;
		}

		return errorCodeMap[code];
	}

	/**
	  * Copy the details found for the error in errorCodeMap into the
	  * errors array
	  */
	static addDetailToJson(json) {
		return {
			status: json.status,
			time: new Date().toISOString(),
			errors: json.errors.map((error) => {
				const details = RestError.getDetail(error.code, error.status);

				return Object.assign({}, error, { detail: details.detail, title: details.title });
			}),
		};
	}

	constructor(details) {
		super();
		const attributes = ['status', 'code', 'message'];
		this.dontReport = details.dontReport;

//		Error.captureStackTrace(this, this.constructor);
		this.name = 'RestError';

		this.status = details.status || 500;

		if (details.errors) {
			if (!details.errors.length) {
				throw new Error("RestError was created with an empty errors array. How can there be an error if there's no errors?");
			}

			this.errors = details.errors;
			this.message = details.errors[0].message;
		} else {
			attributes.forEach((attr) => {
				this[attr] = details[attr];
			});
		}
	}

	/**
	  * Convert the error to JSON array of messages
	  */
	toJSON() {
		const json = {
			status: this.status,
		};

		if (this.errors) {
			json.errors = this.errors.map((error) => {
				return {
					status: error.status || this.status,
					code: error.code || this.code,
					message: error.message,
				};
			});
		} else {
			json.errors = [{
				code: this.code,
				status: this.status,
				message: this.message,
			}];
		}

		return json;
	}
}

module.exports = RestError;
