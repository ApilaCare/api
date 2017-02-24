const mongoose = require('mongoose');
const faker = require('faker');
const Resid = mongoose.model('Resident');
const Appoint = mongoose.model('Appointment');
const Iss = mongoose.model('Issue');
const moment = require('moment');


module.exports.populateTestCommunity = async (community, user) => {
  const resident = new Resid({
    community: community._id,
    submitBy: user._id,
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

  await resident.save();

  const appoint = new Appoint({
    reason: faker.lorem.sentence(),
    locationName: faker.address.streetAddress(),
    locationDoctor: faker.name.firstName() + " " + faker.name.lastName(),
    residentGoing: resident._id,
    appointmentDate: faker.date.between('2017-02-01', '2017-02-28'),
    hours: faker.random.number(12),
    minutes: faker.random.number(60),
    isAm: Math.random() >= 0.5,
    submitBy: user._id,
    transportation: faker.lorem.sentence(),
    community: community._id,
    currMonth: moment('2017-02-01').format("YYYY M")
  });

  await appoint.save();

  const issue = new Iss({
    title: "Having an Issue",
    responsibleParty: user._id,
    resolutionTimeframe: 'Week',
    description: faker.lorem.sentence(),
    submitBy: user._id,
    community: community._id
  });

  await issue.save();

}

function createAppointments(numTimes) {
  for(let i = 0; i < numTimes; ++i) {

  }
}
