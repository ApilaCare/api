var mongoose = require('mongoose');
var utils = require('../../utils');
var assert = require('assert');

var faker = require('faker');



var resident = {};
var appointmentid = '';

describe('Appointment', function() {

  describe('#create', function() {
    it('Creates a new appointment', function(done) {

      createResident(function(err) {

        var user = utils.getTestUser();

        var appointData = {
          'reason': 'My head hurts from all this tests',
          'locationName': 'Hell',
          'locationDoctor': 'Dr. Who',
          'residentId': resident._id,
          'appointmentDate': new Date(),
          'hours': 10,
          'minutes': 15,
          'timezone': 0,
          'currMonth': '2017 5',
          'isAm': true,
          'submitBy': user.name,
          'transportation': 'They have their transportation',
          'community' : user.community
        };

        utils.server
          .post('/api/appointments/new')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + user.token)
          .send(appointData)
          .expect(200)
          .end(function(err,res){
            if(err) {
              done(err);
            } else {
              done();
              appointmentid = res.body._id;
            }
          });

      });



    });
  });

  describe('#list', function() {
    it('List all appointments of a commnity for a 2017 5', function(done) {

        var user = utils.getTestUser();

        utils.server
          .get('/api/appointments/' +  user.community._id + '/month/2017 5')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + user.token)
          .expect(200)
          .end(function(err,res){
            if(err) {
              done(err);
            } else {
              console.log(res.body);
              done();
            }
          });

    });
  });

  describe('#appointmentsToday', function() {
    it('Number of appointments for today', function(done) {

        var user = utils.getTestUser();

        utils.server
          .get('/api/appointments/today/' + user.community._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + user.token)
          .expect(200)
          .end(function(err,res){
            if(err) {
              done(err);
            } else {
              assert.equal(res.body, 1, 'We should have 1 appointment today');
              done();
            }
          });

    });
  });


  describe('#update', function() {
    it('Update appointment by its id', function(done) {

        var user = utils.getTestUser();

        var appointData = {
          'reason': 'No problemo',
          'locationName': 'Hell',
          'locationDoctor': 'Dr. Who',
          'residentId': resident._id,
          'appointmentDate': new Date(),
          'hours': 10,
          'minutes': 15,
          'timezone': 0,
          'isAm': true,
          'submitBy': user.name,
          'transportation': 'They have their transportation',
          'community' : user.community,
          'modifiedBy' : user.name,
          'modifiedDate' : new Date(),
          'updateField' : {
            'field' : 'reason',
            'old' : 'My head hurts from all this tests',
            'new' : 'No problemo'
          }
        };

        utils.server
          .put('/api/appointments/update/' + appointmentid)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + user.token)
          .send(appointData)
          .expect(200)
          .end(function(err,res){
            if(err) {
              done(err);
            } else {
              assert.equal(res.body.reason, 'No problemo', 'Comparing if the reason got updated');
              done();
            }
          });

    });
  });

  describe('#delete', function() {
    it('Delete an appointment by its id', function(done) {

        var user = utils.getTestUser();

        utils.server
          .delete('/api/appointments/' + appointmentid)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + user.token)
          .expect(204)
          .end(function(err,res){
            if(err) {
              done(err);
            } else {
              done();
            }
          });

    });
  });

  //reseting residents collection so other resident test can work with clean data
  after(function(done) {
    mongoose.connection.collections['residents'].drop(function() {
      done();
    });
  });


});


// HELPER FUNCTIONS
function createResident(callback) {
  var user = utils.getTestUser();

  var residentData = {
    'firstName': faker.name.firstName(),
    'lastName': faker.name.lastName(),
    'birthDate': faker.date.past(),
    'maidenName': faker.name.firstName(),
    'admissionDate': faker.date.recent(),
    'buildingStatus': 'In Building',
    'sex': 'Female',
    'submitBy': user.name,
    'community': user.community,
    'administrativeNotes': 'Everything is cool',
    'movedFrom': {
      'name': 'Denver, CO, USA',
      'longitude': '-104.990251',
      'latitude': '39.7392358'
    }
  };

  utils.server
    .post('/api/residents/new')
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + user.token)
    .send(residentData)
    .expect(200)
    .end(function(err,res){
      if(err) {
        callback(err);
      } else {
        resident = res.body;
        callback();
      }

    });

}
