Coming soon

# Usage

```bash
npm install -S parkes-rest-error
```

```js
const Koa = require();
const { ErrorHandler } = require('parkes-rest-error');
const errorCodes = require('./settings/errorCodes');
const errorTransforms = require('./settings/errorTransforms');

const app = new Koa();
const errorHandler = new ErrorHandler({ errorCodes, errorTransforms });

app.use(errorHandler);

// Your app
...
```

```js
const { RestError } = require('parkes-rest-error');

throw new RestError({
  status: 403,
  code: 'unauthorized',
  message: 'Who goes there?',
  extra: {
    sound: '*sheep bleating*',
    source: 'http://www.imdb.com/title/tt0205873/quotes?item=qt0247774'
  }
})
```

© 2017 Agency Ventures
