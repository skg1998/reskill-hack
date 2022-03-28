require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const favicon = require('serve-favicon');

const db = require('./models');
const errorHandler = require('./middleware/error');


// Routes File
const IndexRoutes = require('./routes/index.routes');
const UserRoutes = require('./routes/User.routes');

let app = express();

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(logger('dev'));
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(favicon(path.join(__dirname, '../public', 'favicon/favicon.ico')));
app.use(express.static(path.join(__dirname, '../public')));

app.use(function (req, res, next) {
    res.setHeader(
        'Content-Security-Policy-Report-Only',
        "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self' https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.min.js; style-src 'self' https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css ; frame-src 'self';"
    );
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'pug');

//all API
app.use('/', IndexRoutes);
app.use('/api/v1/users', UserRoutes);

app.use(errorHandler);

module.exports = app;


