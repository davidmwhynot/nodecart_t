const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	user: {
		type: String,
		required: true
	},
	cart: {
		type: Object,
		required: true
	},
	address: {
		type: Object,
		required: true
	},
	paymentId: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Order', schema);
