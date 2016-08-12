var utils = require('../../utils');
var assert = require('assert');

var communityid = '';
var userId = '';

describe('Communities', function() {

  describe('#create', function() {
    it('Creates a new community', function(done) {

      var user = utils.getTestUser();

      var communityData = {
        "username" : user.name,
        "name" : "Community 1",
        "communityMembers" : [],
        "pendingMembers" : []
      };

      utils.server
        .post('/api/communities/new')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(communityData)
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


  describe('#list', function() {
    it('Listing communities that arent test communities', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/communities')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.length, 1, 'Comapre if we have one real community');
            done();
          }
        });

    });
  });


  describe('#add pending member', function() {
    it('Adding a pending member to the community', function(done) {

      //add a new user to be added as pending
      utils.server
        .post('/api/register')
        .set('Accept', 'application/json')
        .send({"name" : "user2", "email" : "user2@gmail.com", "password" : "123456"})
        .expect(200)
        .end(function(err, res){

          var user = {};
          user.pendingMember = 'user2';

          userId = res.body.id;

          utils.server
            .put('/api/communities/pending/' + communityid)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer ' + utils.getTestUser().token)
            .send(user)
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

  describe('#accept member', function() {
    it('Accepts a member into the community', function(done) {

      var userData = {
        "member" : userId
      };

        utils.server
          .put('/api/communities/accept/' + communityid)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + utils.getTestUser().token)
          .send(userData)
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

  describe('#has canceled community', function() {
    it('Should fail because the user isnt a creator of any community', function(done) {

        utils.server
          .get('/api/communites/canceled/' + userId)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer ' + utils.getTestUser().token)
          .expect(404)
          .end(function(err,res){
            if(err) {
              done(err);
            } else {
              done();
            }
          });

      });

  });

  describe('#add role', function() {
    it('Switches the role of the user from minion to director', function(done) {

      var data = {
        'type' : 'directors'
      };

      utils.server
        .post('/api/communites/' + communityid + '/role/' + userId)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + utils.getTestUser().token)
        .send(data)
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

  describe('#add role', function() {
    it('Switches the role of the user from director to boss', function(done) {

      var data = {
        'type' : 'boss'
      };

      utils.server
        .post('/api/communites/' + communityid + '/role/' + userId)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + utils.getTestUser().token)
        .send(data)
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
