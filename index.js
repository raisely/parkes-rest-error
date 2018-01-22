const ErrorHandler = require('./lib/errorHandler');
const RestError = require('./lib/restError');
const { addErrorCode } = require('./lib/errorCodes');
const { addFormat } = require('./lib/formatError');

module.exports = { ErrorHandler, RestError, addErrorCode, addFormat };
