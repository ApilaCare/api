var utils = require('../../utils');
var faker = require('faker');

var userAuth = require('../../../controllers/users/authentication');

describe('Authentication', function() {

  var currentUser = {};

  describe('#register', function() {
    it('Test if register function will register user', function(done) {

    var userData = {
      "name" : faker.name.firstName(),
      "email": "test@gmail.com",
      "password": faker.internet.password()
    };


    utils.server
      .post('/api/register')
      .set('Accept', 'application/json')
      .send(userData)
      .expect(200)
      .end(function(err,res){
        if(err) {
          done(err);
        } else {
          currentUser.email = userData.email;
          currentUser.password = userData.password;
          done();
        }

      });

    });

  });

  describe("#register ", function() {

    var userData = {
      "name" : faker.name.firstName(),
      "email": "test@gmail.com",
      "password": faker.internet.password()
    };

    it("Test if register with alredy existing email fails", function(done) {
      utils.server
        .post('/api/register')
        .set('Accept', 'application/json')
        .send(userData)
        .expect(404)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            done(err);
          }
        });
    });
  });

  describe("#login", function() {
    it("Test if login of the user works", function(done) {
      utils.server
        .post('/api/login')
        .set('Accept', 'application/json')
        .send(currentUser)
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
