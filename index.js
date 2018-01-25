const ErrorHandler = require('./lib/errorHandler');
const RestError = require('./lib/restError');
const { addError, addErrors, listErrors } = require('./lib/errorCodes');
const { addFormat, formatError } = require('./lib/formatError');

module.exports = {
	ErrorHandler,
	RestError,
	addError,
	addErrors,
	listErrors,
	addFormat,
	formatError,
};
