const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, {email: user.email, id: user._id});
	});
});

passport.use(
	'local.register',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		(req, email, password, done) => {
			req.checkBody('email', 'Invalid email').notEmpty().isEmail();
			req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4});
			let errors = req.validationErrors();
			if(errors) {
				let messages = [];
				errors.forEach((error) => {
					messages.push(error.msg);
				});
				return done(null, false, req.flash('error', messages));
			}
			User.findOne({'email': email}, (err, user) => {
				if(err) return done(err);
				else if(user) return done(
					null,
					false,
					{ message: 'E-Mail address is already in use.' }
				);
				else {
					let newUser = new User();
					newUser.email = email;
					newUser.password = newUser.encryptPassword(password);
					newUser.save((err, res) => {
						if(err) return done(err);
						else return done(null, newUser);
					});
				}
			});
		}
	)
);

passport.use(
	'local.login',
	new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		(req, email, password, done) => {
			req.checkBody('email', 'Invalid email').notEmpty().isEmail();
			req.checkBody('password', 'Invalid password').notEmpty();
			let errors = req.validationErrors();
			if(errors) {
				let messages = [];
				errors.forEach((error) => {
					messages.push(error.msg);
				});
				return done(null, false, req.flash('error', messages));
			}
			User.findOne({'email': email}, (err, user) => {
				console.log('------------------------------------------------------------');
				console.log(' ---- AUTHENTICATING USER... ---- ', user);
				console.log('------------------------------------------------------------');
				if(err) return done(err);
				else if(!user) return done(
					null,
					false,
					{ message: 'No user found.' }
				);
				else if(!user.validPassword(password, user.password)) return done(
					null,
					false,
					{ message: 'Wrong password. TODO remaining attempts.' }
				);
				else {
					return done(null, user);
				}
			});
		}
	)
);
