// TODO: TEST this and all the other models
module.exports = function Cart(oldCart) {
	this.items = oldCart.items || {};
	this.totalQty = oldCart.totalQty || 0;
	this.totalPrice = oldCart.totalPrice || 0;

	this.add = (item, id) => {
		let itemGroup = this.items[id];
		if (!itemGroup) itemGroup = this.items[id] = {
			item: item,
			qty: 0,
			price: 0
		};
		++itemGroup.qty;
		itemGroup.price = itemGroup.item.price * itemGroup.qty;
		++this.totalQty;
		this.totalPrice += itemGroup.item.price;
	}

	this.deleteOne = (id) => {
		let itemGroup = this.items[id];
		// decrement itemGroup
		--itemGroup.qty;
		itemGroup.price -= itemGroup.item.price;

		// decrement cart totals
		--this.totalQty;
		this.totalPrice -= itemGroup.item.price;

		// check if the itemGroup should be removed from the cart
		if(itemGroup.qty <= 0) {
			delete this.items[id];
		}
	}

	this.deleteAll = (id) => {
		// decrement cart totals
		this.totalQty -= this.items[id].qty;
		this.totalPrice -= this.items[id].item.price * this.items[id].qty;

		// remove the item group from the cart
		delete this.items[id];
	}

	this.generateArray = () => {
		let arr = [];
		Object.keys(this.items).forEach((item) => {
			arr.push(this.items[item]);
		});
		return arr;
	}
}
