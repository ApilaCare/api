(function() {
  'use strict';

  var stripe = require('stripe')('pk_test_PDxs7SyxPARytJkKUeS6NOS8');

  //save credit card info
  exports.saveCreditCard = function(stripeToken, email, callback) {
    stripe.customer.create({
      source: stripeToken,
      description: email
    }).then(function(customer) {
      console.log(customer);
      callback(true);

    }).catch(function(customer) {
      console.log("Error while saving the credit card");
      callback(false);
    });

  }

  //given the stripes customerId, charge the user, specify amout in cents
  exports.chargeUser = function(customerId, amount, callback) {
    stripe.charges.create({
      "amount" : amount,
      "currency" : "usd",
      "customer" : customerId
    })
    .then(function(charge) {
      console.log(charge);
      callback(true);
    })
    .catch(function(charge) {
      console.log(charge);
      callback(false);
    });
  }


})();
