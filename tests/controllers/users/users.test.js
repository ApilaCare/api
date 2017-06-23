var utils = require('../../utils');
var assert = require('assert');

//TODO: Upload image and reset funcionalities left to test out

describe('Users', function() {

  var communityid = "";

  describe('#list', function() {
    it('Lists all users in a community', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/users/list/' + user.community._id)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.length, 0, '');
            done();
          }
      });

    });
  });

  describe('#get user', function() {
    it('Get user info by userid', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/users/getuser/' + user.id)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.name, user.name, "Compare if the name of the found user it's the same");
            done();
          }
      });

    });
  });


  describe('#get user', function() {
    it('Show error if userid not specified', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/users/getuser/' + 'undefined')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(404)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            done();
            assert.equal('User not found!', res.body.message, "Testing right message showing");
          }
      });

    });
  });

  describe('#user community', function() {
    it('Gets users community info, by userid', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/users/community/' + user.id)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            communityid = res.body._id;
            done();
          }
      });

    });
  });

  describe('#community users', function() {
    it('Lists all the users in the community', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/users/list/' + communityid)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.length, 2, "Number of users in community should be 2");
            done();
          }
      });

    });
  });

  describe('#user image', function() {
    it('Gets image url of the user', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/users/' + user.id + '/image')
        .set('Authorization', 'Bearer ' + user.token)
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
