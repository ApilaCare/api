var utils = require('../utils');
var assert = require('assert');

var stripe = require('stripe')(process.env.STRIPE_KEY);
var stripeService = require('../../services/stripe');

describe('Stripe', function() {

  var customerid = "";

  describe('#save credit card', function() {
    it('Saves cc info to stripe', function(done) {

      var user = utils.getTestUser();

      this.timeout(5000);

      stripe.tokens.create({
        card: {
          "number": '4242424242424242',
          "exp_month": 12,
          "exp_year": 2019,
          "cvc": '123'
        }
      }, function(err, token) {
          stripeService.saveCreditCard(token.id, user.email, function(customer) {
            if(customer) {
              customerid = customer;
              done();
            } else {
              done("Customer credit card info not saved");
            }
          });
      });

    });

  });

  describe('#get plan', function() {
    it('Gets the standard plan from stripe', function(done) {

      var user = utils.getTestUser();

      stripeService.getStandardPlan(function(plan) {
        if(plan) {
          assert.equal(plan.name, 'standard', "Check if we get the standard plan");
          done();
        } else {
          done("Unable to get standard stripe plan");
        }
      });

    });

  });



});
