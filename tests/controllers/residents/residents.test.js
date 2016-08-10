var utils = require('../../utils');
var faker = require('faker');

describe('Residents', function() {

  describe('#create new resident', function() {
    it('Creates a new resident', function(done) {

      var user = utils.getTestUser();

      var residentData = {
        'firstName': faker.name.firstName(),
        'lastName': faker.name.lastName(),
        'birthDate': faker.date.past(),
        'maidenName': faker.name.firstName(),
        'admissionDate': faker.date.past(),
        'buildingStatus': 'Hospital',
        'sex': 'Female',
        'submitBy': user.name,
        'community': user.communityid,
        'administrativeNotes': 'Everything is cool',
        //'movedFrom': req.body.movedFrom
      };

      utils.server
        .post('/api/residents/new')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(residentData)
        .expect(200)
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
