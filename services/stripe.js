(function() {
  'use strict';

  var stripe = require('stripe')(process.env.STRIPE_KEY);

  var constants = require('./constants');

  //save credit card info
  exports.saveCreditCard = function(stripeToken, email, callback) {

    stripe.customers.create({
      source: stripeToken,
      description: email
    }).then(function(customer) {
      console.log(customer);
      callback(true, customer.id);

    }).catch(function(customer) {
      console.log("Error while saving the credit card");
      console.log(customer);
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

  exports.subscribeToPlan = function(userid) {

  }

  exports.createPlan = function() {
    stripe.plans.create({
      amount: constants.MONTHLY_CHARGE,
      interval: "month",
      name: "standard",
      currency: "usd",
      id: "gold"
    }, function(err, plan) {
      console.log(plan);
    });
  }


})();
