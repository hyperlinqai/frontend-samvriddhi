require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');

// Import routers
const indexRouter = require('./routes/index');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Layout setup
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // Default layout

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);

// Catch 404 and render dedicated 404 page
app.use((req, res, next) => {
  res.status(404);
  res.render('pages/404', {
    title: 'Page Not Found',
    layout: 'layouts/main'
  });
});

// Error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const status = err.status || 500;
  res.status(status);

  // Render dedicated 403 page for forbidden errors
  if (status === 403) {
    return res.render('pages/403', {
      title: 'Access Denied',
      layout: 'layouts/main'
    });
  }

  // Render dedicated 404 page
  if (status === 404) {
    return res.render('pages/404', {
      title: 'Page Not Found',
      layout: 'layouts/main'
    });
  }

  // Generic error page for everything else
  res.render('pages/error', {
    title: 'Error',
    layout: 'layouts/main',
    error: err
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});

module.exports = app;
