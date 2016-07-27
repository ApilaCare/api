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

  // gets customers stripe id and subscrips him to out standard plan
  exports.subscribeToPlan = function(customerid, callback) {
    stripe.subscriptions.create({
      customer: customerid,
      plan: constants.STANDARD_PLAN_ID
    }, function(err, subscription) {
        if(err) {
          callback(null);
        } else {
          callback(subscription);
        }
      }
    );
  }

  // returns standard plan information
  exports.getStandardPlan = function(callback) {
    stripe.plans.retrieve(
      constants.STANDARD_PLAN_ID,
      function(err, plan) {
        if(!err) {
          callback(plan);
        } else {
          callback(null);
        }
      }
    );
  }

  // returns subscription information
  exports.getSubscription = function(subscription, callback) {
    stripe.subscriptions.retrieve(
      subscription,
      function(err, subscription) {
        if(!err) {
          callback(subscription);
        } else {
          callback(null);
        }
      }
    );
  }

  // cancels the description
  exports.calncelSubscription = function(subscription, callback) {
    stripe.subscriptions.del(
      subscription,
      function(err, confirmation) {
        if(!err) {
          callback(confirmation);
        } else {
          callback(null);
        }
      }
    );
  }


})();
