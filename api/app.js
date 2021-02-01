const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const jsdocConfig = require('../config/jsdoc');
const dotenv = require('dotenv');
const config_result = dotenv.config();
if (process.env.NODE_ENV != 'production' && config_result.error) {
  throw config_result.error;
}

const swaggerSpec = swaggerJSDoc(jsdocConfig);
const swaggerUIOptions = {
  explorer: true,
};

// ###[  Routers ]###
// const testRoute = require('./routes/check');
const usersRoute = require('./routes/users');
const casesRoute = require('./cases/cases-router');
const tagsRoute = require('./tags/tags-router');
const tagsByCasesRoute = require('./tags_by_cases/tags_by_cases-router');
const mainCategoriesRouter = require('./main_categories/main_categories-router');
const subCategoriesRouter = require('./sub_categories/sub_categories-router');
const collectionsRouter = require('./collections/collections-router');
const casesByCollectionsRouter = require('./cases_by_collections/cases_by_collections-router');
// const dsRouter = require('./dsService/dsRouter');

const app = express();

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
// docs would need to be built and committed
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUIOptions)
);

app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: '*',
  })
);
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// application routes
// app.use('/', testRoute);
app.use(['/api/users', '/user'], usersRoute);
app.use('/api/cases', casesRoute);
app.use('/api/tags', tagsRoute);
app.use('/api/tags_by_cases', tagsByCasesRoute);
app.use('/api/main_categories', mainCategoriesRouter);
app.use('/api/sub_categories', subCategoriesRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/cases_by_collections', casesByCollectionsRouter);

// ds api route
// app.use('/data', dsRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  if (err instanceof createError.HttpError) {
    res.locals.message = err.message;
    res.locals.status = err.statusCode;
    if (process.env.NODE_ENV === 'development') {
      res.locals.error = err;
    }
  }
  console.error(err);
  if (process.env.NODE_ENV === 'production' && !res.locals.message) {
    res.locals.message = 'ApplicationError';
    res.locals.status = 500;
  }
  if (res.locals.status) {
    res.status(res.locals.status || 500);
    const errObject = { error: res.locals.error, message: res.locals.message };
    return res.json(errObject);
  }
  next(err);
});

app.get('/', (req, res) => {
  res.json({ api: 'up' });
});

module.exports = app;
