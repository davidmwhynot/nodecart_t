/* XXX IMPORTS XXX */
const passport = require('passport');
const csurf = require('csurf');
const express = require('express');
const util = require('util');

const Order = require('../models/Order');
const Cart = require('../models/Cart');




/* XXX CONFIG XXX ... TODO: abstract away and import using {object, syntax}*/
const router = express.Router();
const csurfProtection = csurf();
router.use(csurfProtection);




/* XXX ROUTES XXX */
/* GET user account. */
router.get('/', isLoggedIn, (req, res) => {
	Order.find({
		user: req.user.id
	}).then((orders) => {
		let cart;
		orders.forEach((order) => {
			cart = new Cart(order.cart);
			order.items = cart.generateArray();
		});
		log('orders');
		inspect(orders);
		res.render('user/account', {
			orders: orders
		});
	}).catch((err) => {
		if(err) {
			console.error(err);
			res.render('/'); // TODO: handle errors gracefully
		} else {
			res.redirect('/');
		}
	});
});

/* GET user orders. */
router.get('/orders', isLoggedIn, (req, res) => {
	res.render('user/orders');
});

/* GET user logout. */
router.get('/logout', isLoggedIn, (req, res) => {
	req.logout();
	res.redirect('/');
});

/* PROTECT routes from authenticated users. */
router.use('/', notLoggedIn, (req, res, next) => {
	next();
});

/* GET user register. */
router.get('/register', function(req, res, next) {
	let messages = req.flash('error');
	res.render('user/register', {
		csrfToken: req.csrfToken(),
		messages: messages,
		hasErrors: messages.length > 0
	});
});

/* POST user register. */
router.post(
	'/register',
	passport.authenticate('local.register', {
		failureRedirect: '/user/register',
		failureFlash: true
	}),
	(req, res, next) => {
		if(req.session.oldUrl) {
			let oldUrl = req.session.oldUrl;
			req.session.oldUrl = null;
			res.redirect(oldUrl);
		} else {
			res.redirect('/user/profile');
		}
	}
);

/* GET user login. */
router.get('/login', (req, res) => {
	let messages = req.flash('error');
	res.render('user/login', {
		csrfToken: req.csrfToken(),
		messages: messages,
		hasErrors: messages.length > 0
	});
});

/* POST user login. */
router.post(
	'/login',
	passport.authenticate('local.login', {
		failureRedirect: '/user/login',
		failureFlash: true
	}),
	(req, res, next) => {
		if(req.session.oldUrl) {
			let oldUrl = req.session.oldUrl;
			req.session.oldUrl = null;
			res.redirect(oldUrl);
		} else {
			res.redirect('/user/account');
		}
	}
);

module.exports = router;




/* XXX FUNCTIONS XXX */
function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/user/login');
	}
}
function notLoggedIn(req, res, next) {
	if(!req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/');
	}
}
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
