Coming soon

# Usage

```
npm install -S parkes-rest-errors
```

```js
const Koa = require();
const { ErrorHandler } = require('parkes-rest-errors');
const errorCodes = require('./settings/errorCodes');
const errorTransforms = require('./settings/errorTransforms');

const app = new Koa();
const errorHandler = new ErrorHandler({ errorCodes, errorTransforms });

app.use(errorHandler);

// Your app
...
```

© 2017 Agency Ventures
