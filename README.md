# Parkes Rest Error
A minimal framework and middleware for throwing REST-ful errors. Built for Koa 2.

## Getting Started

```bash
npm install --save raisely/parkes-rest-error
```

##### Your server app:

```js
// your server app
const Koa = require('koa');
const { ErrorHandler } = require('parkes-rest-error');

const app = new Koa();
const errorHandler = new ErrorHandler({ log: true });

app.use(errorHandler); // pass the middleware to the app.
// watches for RestError throws and other exceptions
```

##### Somewhere within a koa context/controller:

```js
const { RestError } = require('parkes-rest-error');

async function someKoaContext(ctx) {
  if (somethingAwful === true) throw new RestError({
    status: 403,
    code: 'unauthorized',
    message: 'Who goes there?',
    extra: {
      sound: '*sheep bleating*',
      source: 'http://www.imdb.com/title/tt0205873/quotes?item=qt0247774'
    }
  });
};
```
### How to use RestErrors

In your code, throw a new rest error with a `code`, `message`, and `status` and
then describe the error code in `lib/errorCodes.js`, or by using the custom
`addError` or `addErrors` methods.

Why the split? Since the convention is that title and detail are always the same
given the same `code`, we can keep controller code leaner by just specifying the error
`code` when throwing the error.
(This also lends itself to internationalisation in the future)

For multiple errors, pass an array of errors, and you can set a default code and/or status
```js
throw new RestError({
  status: 404,
  message: 'Profile could not be found',
  code: 'not found',
});
```
// adding multiple error code definitions (as object literal)
addErrors({
  'name of code': { title: 'This is an error', detail: 'something' },
  'name of another code': { title: 'This is an error', detail: 'something' },
});

// adding multiple error code definitions (as object Array)
addErrors([
  { 'name of code': { title: 'This is an error', detail: 'something' }},
  { 'name of another code': { title: 'This is an error', detail: 'something' }},
]);

// the added error codes can then be referenced via the `code` attribute
async function someKoaContext(ctx){
  throw new RestError({
    status: 403,
    message: "I'm sorry Dave, I'm afraid I can't do that",
    code: 'name of code',
  });
}

##### Multiple errors, with defaults for properties
```js
throw new RestError({
  status: 400,
  code: 'invalid syntax',
  errors: [
    { message: 'email is not valid' , code: 'validation error' }, // status: 400
    { message: 'public is malformed' }, // code: 'invalid syntax', status: 400,
  }],
});
```

The `code` attribute will correspond with either a pre-defined error code within
`lib/errorCodes.js`, or by using the custom `.addError` or `.addErrors` methods.

#### Adding custom error codes:
```js
const { addError, addErrors } = require('parkes-rest-error');

// adding a single error code
addError('name of code', { title: 'This is an error', detail: 'something' });

// adding multiple error code definitions (as object literal)
addErrors({
  'name of code': { title: 'This is an error', detail: 'something' },
  'name of another code': { title: 'This is an error', detail: 'something' },
});

// adding multiple error code definitions (as object Array)
addErrors([
  { 'name of code': { title: 'This is an error', detail: 'something' }},
  { 'name of another code': { title: 'This is an error', detail: 'something' }},
]);

// the added error codes can then be referenced via the `code` attribute
async function someKoaContext(ctx){
  throw new RestError({
    status: 403,
    message: "I'm sorry Dave, I'm afraid I can't do that",
    code: 'name of code',
  });
}
```

## Extending the middleware (adding filters)
In a production environment, it is useful to be able to filter out and automatically
catch specific errors, without leaking any unwanted information. The method `addFormat`
provides means of adding custom top-level filters to prune out any errors and specifying
the desired output.

```js
// your server app
const Koa = require('koa');
const { ErrorHandler, addFormat } = require('parkes-rest-error');

const app = new Koa();
const errorHandler = new ErrorHandler({ log: true });

// define custom formatter
addFormat(error => {
  if (e.name === "HE WHO SHALL NOT BE NAMED") {
    return {
      status: 400, // HTTP status code to set,
      errors: [{
        message: 'An error message',
        status: 400, // could be any code
        code: 'internal error code as string',
        title: 'Human readable that is always the same for that exception',
        detail: 'Human readable that is always the same for that exception',
      }]
    };
  };
  return false; // negates filter (since it's not a match)
});

app.use(errorHandler); // pass midleware with custom filter
```

The above code will watch Koa contexts and try to generate useful RestErrors depending
on the error thrown. This allows for more specific control of the kinds of information
passed on exceptions or unexpected event (instead of throwing generic 500 errors).

© 2018 Agency Ventures
