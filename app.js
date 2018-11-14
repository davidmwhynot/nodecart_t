/*

	title: app.js
	desc: Entry point for node server application
	author: David Whynot
	email: davidmwhynot@gmail.com
	Project: nodecart_t
	Created: 10/25/18
	Updated: 10/27/18

*/


/* XXX IMPORTS XXX */
const util = require('util');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const validator = require('express-validator');
const logger = require('morgan');
const mongoose = require('mongoose');
const store = require('connect-mongo')(session);
const exphbs = require('express-handlebars');
const hbs = require('handlebars');
const hbsHelpers = require('handlebars-helpers')(
	['comparison'],
	{
		handlebars: hbs
	}
);

// routers
const indexRouter = require('./routes/index');
const shopRouter = require('./routes/shop');
const userRouter = require('./routes/user');




/* XXX CONFIG XXX */
require('dotenv').config();
const CREDS = {
	host: process.env.NODECART_T_DB_HOST,
	user: process.env.NODECART_T_DB_USERNAME,
	password: process.env.NODECART_T_DB_PASSWORD,
	database: process.env.NODECART_T_DB_DATABASE
};
const databaseURI = `mongodb://${CREDS.user}:${CREDS.password}@${CREDS.host}/${CREDS.database}`;




/* XXX INIT XXX */
const app = express();
mongoose.connect(databaseURI, { useNewUrlParser: true });
require('./config/passport');




/* XXX MIDDLEWARE XXX */
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// view engine setup
app.engine('hbs', exphbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', 'hbs');

// morgan
app.use(logger('dev'));

// bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// validator
app.use(validator());

// sessions
app.use(session({
	secret: 'secret',
	resave: false,
	store: new store({
		mongooseConnection: mongoose.connection
	}),
	cookie: {
		maxAge: 180 * 60 * 1000
	},
	saveUninitialized: false
}));

// flash messages
app.use(flash());

// passportjs
app.use(passport.initialize());
app.use(passport.session());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));




/* XXX GLOBALS XXX */
app.use((req, res, next) => {
	if(req.isAuthenticated()) {
		res.locals.username = req.user.email;
		res.locals.auth = true;
	} else {
		res.locals.auth = false;
	}

	res.locals.session = req.session;
	log('============================================================');
	log('------------------------ res.locals ------------------------');
	inspect(res.locals);
	log('------------------------- req.user -------------------------');
	inspect(req.user);
	log('------------------------ req.session -----------------------');
	inspect(req.session);
	log('------------------------- req.body -------------------------');
	inspect(req.body);
	log('============================================================');
	next();
});




/* XXX ROUTES XXX */
app.use('/user', userRouter);
app.use('/shop', shopRouter);
app.use('/', indexRouter);




/* XXX ERRORS XXX */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;




/* XXX FUNCTIONS XXX */
function log(s) {
	console.log(s);
}
function inspect(o) {
	log(util.inspect(o, {
		colors: true,
		showProxy: true,
		compact: false
	}));
}
