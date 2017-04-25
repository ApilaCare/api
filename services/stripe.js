
const stripe = require('stripe')(process.env.STRIPE_KEY);

const STANDARD_PLAN_ID = require('./constants').STANDARD_PLAN_ID;

const PRICE_PER_USER = 500; //$5 in cents

//TODO: consistent callback params

exports.createPlan = async (numUsers, name, id) => {

  const plan = {
    amount: numUsers * PRICE_PER_USER, 
    interval: "month",
    currency: "usd",
    id: id,
    name: name
  };

  const planResp = await stripe.plans.create(plan);

  console.log(planResp);

  return planResp;
}

//save credit card info
exports.saveCreditCard = function(stripeToken, email, callback) {

  stripe.customers.create({
    source: stripeToken,
    description: email
  }).then(function(customer) {
    callback(true, customer.id);

  }).catch(function(customer) {
    callback(false);
  });

};

// retunts customer information by it's id
exports.getCustomer = function(customer, callback) {
  stripe.customers.retrieve(
    customer,
    function(err, customer) {
      if(err) {
        callback(false, customer);
      } else {
        callback(true, customer);
      }
    }
  );
};


//given the stripes customerId, charge the user, specify amout in cents
exports.chargeUser = function(customerId, amount, callback) {
  stripe.charges.create({
    "amount" : amount,
    "currency" : "usd",
    "customer" : customerId
  })
  .then(function(charge) {
    callback(true);
  })
  .catch(function(charge) {
    callback(false);
  });
};

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
};

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
};

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
};

// cancels the description
exports.cancelSubscription = function(subscription, callback) {
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
};

exports.updateCustomer = function(customerid, token, callback) {
  stripe.customers.update(customerid, {
    "source" : token
  }, function(err, customer) {
      if(err) {
        callback(null);
      } else {
        callback(customer);
      }
  });
};
