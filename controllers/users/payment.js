var mongoose = require('mongoose');

var User = mongoose.model('User');

var stripeService = require('../../services/stripe');

module.exports.saveCreditCard = function(req, res) {
  console.log(req.body);
}
