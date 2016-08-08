var assert = require('assert');
var supertest = require('supertest');
var faker = require('faker');

var dbModels = require('../../../models/db');
var userAuth = require('../../../controllers/users/authentication');

var server = supertest.agent("http://localhost:3300");

describe('Authentication', function() {
  describe('#register', function() {
    it('Test if register function will register user', function(done) {

    var userData = {
      "name" : faker.name.firstName(),
      "email": faker.internet.email(),
      "password": faker.internet.password()
    };


    server
      .post('/api/register')
      .set('Accept', 'application/json')
      .send(userData)
      .expect(200)
      .end(function(err,res){
        if(err) {
          done(err);
          console.log(err);
        } else {
          done();
        }


      });

    });
  });
});
