const stripe = require('stripe')(process.env.STRIPE_KEY);

const PLAN_PER_USER = require('./constants').PLAN_PER_USER;

//creates a new plan (Currently not needed)
exports.createPlan = async (amount, name, id) => {

  const plan = {
    amount: amount, 
    interval: "month",
    currency: "usd",
    id: id,
    name: name
  };

  try {

    return await stripe.plans.create(plan);

  } catch(err) {
    console.log(err);
    return null;
  }
}

//save credit card info
exports.saveCreditCard = async (stripeToken, email) =>  {

  const data = {
    source: stripeToken,
    description: email
  };

  try {

    return await stripe.customers.create(data);

  } catch(err) {
    console.log(err);
    return null;
  }

};

// returns customer information by its id
exports.getCustomer = async (customer) => {

  try {

    return await stripe.customers.retrieve(customer);

  } catch(err) {
    console.log(err);
    return null;
  }
  
};

// gets customers stripe id and subscription and set a 31 day trail period
exports.subscribeToPlan = async (customerid) => {

  const subscription = {
    customer: customerid,
    plan: PLAN_PER_USER,
    trial_period_days: 31
  };

  try {
    return await stripe.subscriptions.create(subscription); 

  } catch(err) {
    console.log(err);
    return null;
  }

};

//Updates the quantity (how many plans to apply) to a subscription
exports.updateSubscription = async (subscriptionId, quantity) => {
  
  try {
    return await stripe.subscriptions.update(subscriptionId, {quantity: quantity});

  } catch(err) {
    console.log(err);
    return null;
  }

};

// returns subscription information
exports.getSubscription = async (subscription) => {

  try {

    return await stripe.subscriptions.retrieve(subscription);

  } catch(err) {
    console.log(err);
    return null;
  }

};

// cancels the description
exports.cancelSubscription = async (subscription) => {

  try {
    return await stripe.subscriptions.del(subscription);

  } catch(err) {
    console.log(err);
    return null;
  }
};

//Updates customers cc info
exports.updateCustomer = async (customerid, token)  => {

  try {
    const customer = await stripe.customers.update(customerid, {
      "source" : token
    });

    return customer;

  } catch(err) {
    console.log(err);
    return null;
  }
};
