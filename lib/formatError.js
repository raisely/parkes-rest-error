'use strict';

const RestError = require('./restError');
const _ = require('lodash');

/**
  * This module does it's best to map exceptions thrown by the application
  * to the preferred format of:
		errors: [{
			message: 'An error message',
			status: <HTTP STATUS CODE>,
			code: 'internal error code as string',
			title: 'Human readable that is always the same for that exception',
			detail: 'Human readable that is always the same for that exception',
		}],
  *
  * This also hides internal error details on production
  *
  * To add an error formatter, create a function based on this prototype,
  * and add it to the array of errorFormats below (before generic500)

function customFilter(error) {
	if (error.message === 'Your error') {
		return {
			status: 400, // HTTP status code to set,
			errors: [{
				message: 'An error message',
				status: <HTTP STATUS CODE>,
				code: 'internal error code as string',
				title: 'Human readable that is always the same for that exception',
				detail: 'Human readable that is always the same for that exception',
			}]
		};
	}
	// It must return false or it will block other filters
	return false;
}

  */

const errorFormats = [
	authorisationError,
	stripeError,
	restError,
	invalidSyntax,
	nestedErrors,
	generic500,
	genericError,
];

/**
  * Authorisation error thrown by CanCan
  */
function authorisationError(error) {
	if (error.name === 'AuthorizationError') {
		const errorDetail = {
			message: 'You are not authorized to do that',
			status: 403,
			code: 'unauthorized',
		};

		if (process.env.NODE_ENV !== 'production') errorDetail.permissionRequested = error.details;

		return {
			status: 403,
			errors: [errorDetail],
		};
	}

	return false;
}

function stripeError(error) {
	if (error.type && error.type.startsWith('Stripe')) {
		const stripeTypeCode = {
			// Card problem
			StripeCardError: 400,
			// Probably a problem with the data we're sending
			StripeInvalidRequestError: 400,
			// Stripe internal error
			StripeAPIError: 500,
			// A problem with the connection between Raisely & Stripe
			StripeConnectionError: 500,
			// Bad token
			StripeAuthenticationError: 400,
			StripeRateLimitError: 429,
		}

		const status = stripeTypeCode[error.type] || 500;

		return {
			status,
			errors: [{
				status,
				message: error.message,
				code: 'payment gateway error',
				stripeError: _.pick(error, ['code', 'detail', 'message', 'param',
					'raw', 'requestId', 'statusCode', 'type']),
			}],
		};
	}
	return false;
}

/**
  * Provide a full error object for sequelize invalid input syntax
  */
function invalidSyntax(error) {
	if (error.message.startsWith('invalid input syntax for')) {
		return {
			status: 400,
			errors: [{
				message: error.message,
				status: 400,
				code: 'invalid syntax',
			}],
		};
	}

	return false;
}

/**
  * Sequelize validation errors provide error.errors which can be mapped
  * straight into the errors array
  */
function nestedErrors(error) {
	if (error.errors) {
		error.errors.forEach((err) => {
			if (!err.code) err.code = err.type.toLowerCase();
			if (!err.status) err.status = 400;
		});

		return {
			status: 400,
			errors: error.errors,
		};
	}

	return false;
}

function restError(error) {
	if (error instanceof RestError) {
		return error.toJSON();
	}
	return false;
}

/**
  * For production, hides the details of internal errors
  */
function generic500(error) {
	// If it's a 500 and we're in production, give a generic error
	if ((process.env.NODE_ENV === 'production') && (!error.status || (error.status >= 500))) {
		const status = error.status || 500;
		const timestamp = new Date().toISOString();
		return {
			status,
			errors: [{
				status,
				timestamp,
				message: 'Internal server error at ' + timestamp,
				code: 'internal error',
			}],
		};
	}

	return false;
}

/*
 * Formats any outstanding error generically
 */
function genericError(error) {
	const status = error.status || 500;
	return {
		status,
		errors: [{
			status,
			message: error.message,
			code: error.code,
			title: error.title,
			detail: error.detail,
		}],
	};
}

function formatError(error) {
	let result;

	for (let i = 0; i < errorFormats.length; i++) {
		result = errorFormats[i](error);
		if (result) {
			result = RestError.addDetailToJson(result);
			break;
		}
	}

	return result || error;
}

module.exports = formatError;
