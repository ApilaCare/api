
const stripe = require('stripe')(process.env.STRIPE_KEY);

const STANDARD_PLAN_ID = require('./constants').STANDARD_PLAN_ID;

const PLAN_PER_USER = require('./constants').PLAN_PER_USER;

//TODO: consistent callback params

exports.createPlan = async (amount, name, id) => {

  const plan = {
    amount: amount, 
    interval: "month",
    currency: "usd",
    id: id,
    name: name
  };

  try {
    const planResp = await stripe.plans.create(plan);

    return planResp;
  } catch(err) {
    console.log(err);

  }
}

//save credit card info
exports.saveCreditCard = async (stripeToken, email) =>  {

  const data = {
    source: stripeToken,
    description: email
  };

  try {
    const costumer = await stripe.customers.create(data);

    return costumer;

  } catch(err) {
    console.log(err);
  }

};

// returns customer information by its id
exports.getCustomer = async (customer) => {

  try {

    const cust = await stripe.customers.retrieve(customer);

    return cust;

  } catch(err) {
    console.log(err);
    return null;
  }
  
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
exports.subscribeToPlan = async (customerid) => {

  const subscription = {
    customer: customerid,
    plan: PLAN_PER_USER
  };

  try {
    const sub = await stripe.subscriptions.create(subscription); 
    return sub;

  } catch(err) {
    console.log(err);
    return null;
  }

};

exports.updateSubscription = async (subscriptionId, quantity) => {
  
  try {

    const sub = await stripe.subscriptions.update(subscriptionId, {
                                              quantity: quantity});

    return sub;

  } catch(err) {
    console.log(err);
    return null;
  }

};

// returns standard plan information
exports.getStandardPlan = function(callback) {
  stripe.plans.retrieve(
    STANDARD_PLAN_ID,
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
