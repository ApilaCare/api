require('../models/db');

const moment = require('moment');
const faker = require('faker');

const mongoose = require('mongoose');
const Appoint = mongoose.model('Appointment');
const Resid = mongoose.model('Resident');

const userId = "58b40605e254ca288fcad8f5";
const community = "58b54e33cb93860a87df099d";
const residentId = "5857ed74539ca36e2671ca51";

const NUM_APPOINTMENTS = 300;
const NUM_RESIDENTS = 300;

function createResidents() {

  for(let i = 0; i < NUM_RESIDENTS; ++i) {
    Resid.create({
      community: community,
      submitBy: userId,
      submitDate: new Date(),
      firstName: faker.name.firstName(),
      aliasName: faker.name.firstName(),
      middleName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      room: faker.random.number(60),
      birthDate: faker.date.past(faker.random.number({min: 50, max: 100})),
      admissionDate: faker.date.past(faker.random.number({min: 1, max: 20})),
      sex: (Math.random() >= 0.5) ? "male" : "female", // male, female, other
      veteran: Math.random() >= 0.5,
      administrativeNotes: faker.lorem.sentence(),
      religion: faker.lorem.paragraph(),
      education: faker.lorem.paragraph(),
      occupation: faker.lorem.paragraph(),
      contribution: faker.lorem.paragraph(),
      buildingStatus: "In Building",
      supportGroup: Math.random() >= 0.5,
      extensionCord: Math.random() >= 0.5,
      microwave: Math.random() >= 0.5,
      heatingPad: Math.random() >= 0.5,
      carePoints: faker.random.number({min: 50, max: 100}),
      frequencyOfBathing: faker.random.number(4)
    });
  }


  console.log("Created Residents!");
}

if(process.argv.length > 2) {

  if(process.argv[2] === "appointments") {
    createAppointments();
  } else if(process.argv[2] === "residents") {
    createResidents();
  }

} else {
  console.log("Specify if you want to populate appointments or residents");
}

function createAppointments() {
  console.log("Creating appointments...");

  for(let i = 0; i < NUM_APPOINTMENTS; ++i) {
    Appoint.create({
      reason: faker.lorem.sentence(),
      locationName: faker.address.streetAddress(),
      locationDoctor: faker.name.firstName() + " " + faker.name.lastName(),
      residentGoing: residentId,
      appointmentDate: faker.date.between('2017-04-01', '2017-04-30'),
      hours: faker.random.number(12),
      minutes: faker.random.number(60),
      isAm: Math.random() >= 0.5,
      submitBy: userId,
      transportation: faker.lorem.sentence(),
      community: community,
      currMonth: moment('2017-04-01').format("YYYY M")
    });

  }

  console.log("Finishing closing appointments...");

}
