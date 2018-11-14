$('#sameAsBilling').change((e) => e.target.checked ? $('#shippingAddress').addClass('d-none') : $('#shippingAddress').removeClass('d-none'));
// Create a Stripe client.
let stripe = Stripe($('#payment-form').data('key'));

// Create an instance of Elements.
let elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
let style = {
  base: {
    color: '#32325d',
    lineHeight: '18px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};


// Create an instance of the card Element.
let card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', ({error}) => {
  const displayError = document.getElementById('card-errors');
	console.log('here');
  if (error) {
    displayError.textContent = error.message;
		setErrorState(true);
  } else {
    displayError.textContent = '';
		setErrorState(false);
  }
});

// Handle form submission.
let form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error.
			setErrorState(true);
      let errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server.
      stripeTokenHandler(result.token);
    }
  });
});

function stripeTokenHandler(token) {
  // Insert the token ID into the form so it gets submitted to the server
  let form = document.getElementById('payment-form');
	console.log(form);
  let hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  // Submit the form
  form.submit();
}

function setErrorState(state) {
	if(state) {
		$('#card-errors').removeClass('d-none');
		$('#checkoutSubmit').removeClass('btn-outline-primary');
		$('#checkoutSubmit').addClass('disabled btn-outline-danger');
	} else {
		$('#card-errors').addClass('d-none');
		$('#checkoutSubmit').addClass('btn-outline-primary');
		$('#checkoutSubmit').removeClass('disabled btn-outline-danger');
	}
}
