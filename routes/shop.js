const express = require('express');
const csurf = require('csurf');
const util = require('util');

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');


const router = express.Router();




/* XXX CONFIG XXX */
const csurfProtection = csurf();
router.use(csurfProtection);

require('dotenv').config();
const STRIPE_PUBLIC = process.env.NODECART_T_STRIPE_PUBLIC;
const STRIPE_SECRET = process.env.NODECART_T_STRIPE_SECRET;
const stripe = require('stripe')(STRIPE_SECRET);




/* XXX ROUTES XXX */
/* GET shop page. */
router.get('/', function(req, res) {
	Product.find((err, products) => {
		if(err) res.render('shop/shop', {
			title: 'Shop',
			error: error
		});
		else res.render('shop/shop', {
			title: 'Shop',
			products: products
		});
	});
});

/* GET checkout. */
router.get('/checkout', (req, res) => {
	if(req.session.cart) {
		let cart = new Cart(req.session.cart);
		let errMsg = req.flash('error')[0];
		res.render('shop/checkout', {
			pubKey: STRIPE_PUBLIC,
			csrfToken: req.csrfToken(),
			title: 'Checkout',
			noError: !errMsg,
			errMsg: errMsg,
			total: cart.totalPrice
		});
	} else {
		res.redirect('/shop/cart');
	}
});

/* POST checkout. */
router.post('/checkout', (req, res) => {
	if(req.session.cart) {
		let cart = new Cart(req.session.cart);
		if(req.isAuthenticated()) {
			let cusName = '';
			let cusAddress = {};
			if(req.body['shipping-address-same-as-billing'] === 'on') {
				cusName = `${req.body['billing-first-name']} ${req.body['billing-last-name']}`;
				cusAddress.line1 = req.body['billing-address-1'];
				cusAddress.line2 = req.body['billing-address-2'];
				cusAddress.city = req.body['billing-city'];
				cusAddress.country = req.body['billing-country'];
				cusAddress.state = req.body['billing-state'];
				cusAddress.postal_code = req.body['billing-zip'];
			} else {
				// TODO: must persist billing AND shipping address to database
				cusName = `${req.body['shipping-first-name']} ${req.body['shipping-last-name']}`;
				cusAddress.line1 = req.body['shipping-address-1'];
				cusAddress.line2 = req.body['shipping-address-2'];
				cusAddress.city = req.body['shipping-city'];
				cusAddress.country = req.body['shipping-country'];
				cusAddress.state = req.body['shipping-state'];
				cusAddress.postal_code = req.body['shipping-zip'];
			}
			// TODO: instead of always creating a new user, check if the currently logged in user has any purchases in the past and if so we can use the database to get their customer.id for stripe
			stripe.customers.create({
				description: 'Customer for nodecart_t',
				email: req.user.email,
				source: req.body.stripeToken,
				shipping: {
					address: cusAddress,
					name: cusName
				}
			}).then((customer) => {
				console.log('customer');
				inspect(customer);
				return stripe.charges.create({
					amount: Math.round(cart.totalPrice * 100),
					currency: 'usd',
					description: 'Order at nodecart_t.demo',
					customer: customer.id
				});
			}).then((charge) => {
				if(charge) {
					console.log('charge');
					inspect(charge);
					console.log('cart');
					inspect(cart);

					// create new order and save to database
					let order = new Order({
						user: req.user.id,
						cart: cart,
						address: cusAddress,
						name: cusName,
						paymentId: charge.id
					});
					return order.save();
				} else {
					req.flash('error', 'Error creating charge...');
					res.redirect('/shop/checkout');
				}
			}).then((saved) => {
				if(saved) {
					req.session.cart = null;
					res.render('shop/success', {
						cart: cart,
						charge: charge
					});
				} else {
					req.flash('error', 'Error saving order! Please contact support.');
					res.redirect('/shop/checkout');
				}
			}).catch((err) => {
				console.error(err);
				if(err) req.flash('error', err.message);
				res.redirect('/shop/checkout');
			});
		} else {
			// TODO: process new user signup on checkout, if req was not authenticated
			console.log('TODO: process new user signup on checkout, if req was not authenticated');
			req.flash('error', 'TODO: process new user signup on checkout, if req was not authenticated');
			res.redirect('/shop/checkout');
		}
	} else {
		res.redirect('/shop/cart');
	}
});

/* GET shop cart. */
router.get('/cart', (req, res) => {
	if(req.session.cart) {
		let cart = new Cart(req.session.cart);
		res.render('shop/cart', {
			products: cart.generateArray(),
			totalPrice: cart.totalPrice
		});
	} else {
		res.render('shop/cart', {
			products: null
		});
	}
});

/* GET shop cart add. */
router.get('/cart/add/:pid', (req, res) => {
	let pid = req.params.pid;
	let cart = new Cart(req.session.cart ? req.session.cart : {});
	Product.findById(pid, (err, product) => {
		if(err) throw err;
		else {
			cart.add(product, product.id);
			req.session.cart = cart;
			inspect(req.session.cart);
			res.redirect('/shop');
		}
	});
});

/* GET shop cart delete one. */
router.get('/cart/delete/one/:pid', (req, res) => {
	let pid = req.params.pid;
	let cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.deleteOne(pid); // TODO: test edge case (empty cart)
	req.session.cart = cart;
	res.redirect('/shop/cart');
});

/* GET shop cart delete all. */
router.get('/cart/delete/all/:pid', (req, res) => {
	let pid = req.params.pid;
	let cart = new Cart(req.session.cart ? req.session.cart : {});

	cart.deleteAll(pid); // TODO: test edge case (empty cart)
	req.session.cart = cart;
	res.redirect('/shop/cart');
});

/* GET shop product. */
router.get('/product/:pid', async (req, res) => {
	let pid = req.params.pid;
	try {
		let product = await Product.findById(pid);
		res.render('shop/product', {
			product: product
		});
	} catch(e) {
		req.flash('error', 'Invalid product id.');
		res.redirect('/shop');
	}
});

module.exports = router;




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
