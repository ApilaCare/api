require('../models/db');
const faker = require('faker');

const mongoose = require('mongoose');
const Appoint = mongoose.model('Appointment');

const userId = "58528db24502e67a14da3721";
const community = "5858fb85edf1df6c6bb30ad6";
const residentId = "5857ed74539ca36e2671ca51";

const NUM_APPOINTMENTS = 200;

(function createAppointments() {
  console.log("Creating appointments...");

  for(let i = 0; i < NUM_APPOINTMENTS; ++i) {
    Appoint.create({
      reason: faker.lorem.sentence(),
      locationName: faker.address.streetAddress(),
      locationDoctor: faker.name.firstName() + " " + faker.name.lastName(),
      residentGoing: residentId,
      appointmentDate: faker.date.between('2017-05-01', '2017-05-30'),
      hours: faker.random.number(12),
      minutes: faker.random.number(60),
      isAm: Math.random() >= 0.5,
      submitBy: userId,
      transportation: faker.lorem.sentence(),
      community: community
    });

  }

  console.log("Finishing closing appointments...");

})();
