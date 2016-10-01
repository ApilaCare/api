// var utils = require('../utils');
// var assert = require('assert');
//
// var stripe = require('stripe')(process.env.STRIPE_KEY);
// var stripeService = require('../../services/stripe');
//
// describe('Stripe', function() {
//
//   var customerid = '';
//   var subscriptionid = '';
//
//   describe('#save credit card', function() {
//     it('Saves cc info to stripe', function(done) {
//
//       var user = utils.getTestUser();
// 
//       this.timeout(5000);
//
//       stripe.tokens.create({
//         card: {
//           "number": '4242424242424242',
//           "exp_month": 12,
//           "exp_year": 2019,
//           "cvc": '123'
//         }
//       }, function(err, token) {
//           stripeService.saveCreditCard(token.id, user.email, function(customer, id) {
//             if(customer) {
//               customerid = id;
//               done();
//             } else {
//               done("Customer credit card info not saved");
//             }
//           });
//       });
//
//     });
//
//   });
//
//   describe('#get plan', function() {
//     it('Gets the standard plan from stripe', function(done) {
//
//       this.timeout(5000);
//
//       var user = utils.getTestUser();
//
//       stripeService.getStandardPlan(function(plan) {
//         if(plan) {
//           assert.equal(plan.name, 'standard', "Check if we get the standard plan");
//           done();
//         } else {
//           done("Unable to get standard stripe plan");
//         }
//       });
//
//     });
//
//   });
//
//
//   describe('#get customer', function() {
//     it('Gets the customer from stripe using customer id', function(done) {
//
//       this.timeout(5000);
//
//       stripeService.getCustomer(customerid, function(status, customer) {
//         if(status) {
//           assert.equal(customer.id, customerid, 'Compares customers id');
//           done();
//         } else {
//           done('Unable to get customer info');
//         }
//       });
//
//     });
//
//   });
//
//
//   describe('#charge customer', function() {
//     it('Given a customer id chrage a customer an amount of money', function(done) {
//
//       this.timeout(5000);
//
//       stripeService.chargeUser(customerid, 50, function(status) {
//         if(status) {
//           done();
//         } else {
//           done('Error while charging user');
//         }
//       });
//
//     });
//   });
//
//   describe('#subscribe to plan', function() {
//     it('Subscribe the user to standard plan', function(done) {
//
//       this.timeout(5000);
//
//       stripeService.subscribeToPlan(customerid, function(subscription) {
//         if(subscription) {
//           subscriptionid = subscription.id;
//           done();
//         } else {
//           done('Unable to subscribe customer to plan');
//         }
//       });
//
//     });
//
//   });
//
//   describe('#get subscription', function() {
//     it('Gets subscription info by its id', function(done) {
//
//       this.timeout(5000);
//
//       stripeService.getSubscription(subscriptionid, function(subscription) {
//         if(subscription) {
//           assert.equal(subscription.id, subscriptionid, 'comapring subsciption ids');
//           done();
//         } else {
//           done('Unable to get subscription info');
//         }
//       });
//
//     });
//
//   });
//
//
//   describe('#update customer token', function() {
//     it('Updates customer token', function(done) {
//
//       var user = utils.getTestUser();
//
//       this.timeout(5000);
//
//       stripe.tokens.create({
//         card: {
//           "number": '4242424242424242',
//           "exp_month": 12,
//           "exp_year": 2019,
//           "cvc": '123'
//         }
//       }, function(err, token) {
//           stripeService.updateCustomer(customerid, token.id,  function(customer) {
//             if(customer) {
//               assert.equal(customer.id, customerid, 'Compares customers id');
//               done();
//             } else {
//               done("Error while updating customer");
//             }
//           });
//       });
//
//     });
//
//   });
//
//
//   describe('#cancel subscription', function() {
//     it('Cancels a users standard subscription', function(done) {
//
//       this.timeout(5000);
//
//       stripeService.cancelSubscription(subscriptionid, function(customer) {
//         if(customer) {
//           done();
//         } else {
//           done('Error while canceling subscription');
//         }
//       });
//
//     });
//
//   });
//
// });
