var utils = require('../../utils');
var faker = require('faker');
var assert = require('assert');
var moment = require('moment');

//TODO: figure out update testing

var residentid = '';
var residentDate1 = '1980-01-01';
var residentDate2 = '1970-01-01';

var admissionDate1 = '2016-01-01';
var admissionDate2 = '2016-05-01';

describe('Residents', function() {

  describe('#create new resident', function() {
    it('Creates a new resident', function(done) {

      createResident(residentDate1, admissionDate1, done);

    });
  });

  describe('#list residents', function() {
    it('Listing all the residents in a community', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/residents/list/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.length, 1, 'If we have one resident in a community');
            done();
          }

        });

    });
  });


  describe('#residents count', function() {
    it('Count the number of residents in building', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/residents/count/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body, 1, 'Check if we have one resident in a building');
            done();
          }

        });

    });
  });

  describe('#get resident', function() {
    it('Get resident info by id', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/residents/' + residentid)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(residentid, res.body._id, 'Same id of the user');
            done();
          }

        });

    });
  });

  describe('#get locations', function() {
    it('Get residents location (movedFrom info)', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/residents/' + user.community._id +'/locations')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body[0].movedFrom.name, 'Denver, CO, USA',
                                    'Same name from the location info');
            done();

          }

        });

    });
  });

  describe('#create new resident', function() {
    it('Creates another resident for testing', function(done) {

      createResident(residentDate2, admissionDate2, done);

    });
  });

  describe('#get average age', function() {
    it('Gets the average age of residents in building', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/residents/average_age/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            var age1 = moment().diff(residentDate1, 'years');
            var age2 = moment().diff(residentDate2, 'years');

            var sum = (age1 + age2) / 2;

            assert.equal(res.body, sum, 'Check if the average age sum for two users is the same');
            done();

          }

        });

    });
  });


  describe('#get average stay', function() {
    it('Gets average stay of residents in the building', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/residents/average_stay/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {

            var stay1 = moment().diff(admissionDate1, 'days');
            var stay2 = moment().diff(admissionDate2, 'days');

            var sum = (stay1 + stay2) / 2;

            console.log(stay1);
            console.log(stay2);

            assert.equal(res.body, sum, 'Check if the average stay time is equal');

            done();

          }

        });

    });
  });


  describe('#get average stay', function() {
    it('Gets average stay of residents in the building', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/residents/average_stay/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {

            var stay1 = moment().diff(admissionDate1, 'days');
            var stay2 = moment().diff(admissionDate2, 'days');

            var sum = (stay1 + stay2) / 2;

            assert.equal(res.body, sum, 'Check if the average stay time is equal');

            done();

          }

        });

    });
  });

  describe('#delete resident', function() {
    it('Deletes a resident by his id', function(done) {

      var user = utils.getTestUser();

      utils.server
        .delete('/api/residents/' + residentid)
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

});


// HELPER FUNCTIONS
function createResident(yearDate, admissionDate, callback) {
  var user = utils.getTestUser();

  var residentData = {
    'firstName': faker.name.firstName(),
    'lastName': faker.name.lastName(),
    'birthDate': yearDate,
    'maidenName': faker.name.firstName(),
    'admissionDate': admissionDate,
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
        residentid = res.body._id;
        callback();
      }

    });

}
