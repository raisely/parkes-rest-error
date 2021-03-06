const { formatError } = require('./formatError');

function ErrorHandler(options = {}) {
	return async function errorHandler(ctx, next) {
		try {
			await next();
		} catch (err) {
			ctx.app.emit('error', err, this);

			// Format the error for rest output
			const formatted = formatError(err);
			ctx.status = formatted.status;

			if (options.log) {
				if (options.log === true || formatted.status >= 500 || process.env.NODE_ENV === 'test') {
					console.error(err);
				}
			}

			ctx.body = formatted;
		}
	};
}

module.exports = ErrorHandler;
