var utils = require('../../utils');
var assert = require('assert');

describe('Issue Comments', function() {

  var issueid = '';
  var commentId = '';

  describe('#create', function() {
    it('Creates a new issue', function(done) {

      var user = utils.getTestUser();

      var issueData = {
        "title": 'Issue 2',
        "responsibleParty": user.id,
        "resolutionTimeframe": 'Days',
        "description": 'Some description',
        "confidential": false,
        "community": user.community
      };

      utils.server
        .post('/api/issues/new')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(issueData)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            issueid = res.body._id;
            done();
          }

        });

    });
  });

  describe('#create', function() {
    it('Creates a new issue comment', function(done) {

      var user = utils.getTestUser();

      var commentData = {
        "author": user.id,
        "commentText": "This is a very good test good job buddy",
      };

      utils.server
        .post('/api/issues/' + issueid +  '/comments/new')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(commentData)
        .expect(201)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            commentId = res.body._id;
            assert.equal('This is a very good test good job buddy', res.body.commentText, "Same text");
            done();
          }

        });

    });
  });

  describe('#update', function() {
    it('Update issue comment', function(done) {

      var user = utils.getTestUser();

      var commentData = {
        "author": user.id,
        "commentText": "This isn't a very good test, shame on you.",
        "_id" : commentId
      };

      //this.timeout(5000);

      utils.server
        .put('/api/issues/' + issueid +  '/comments/update')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(commentData)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal("This isn't a very good test, shame on you.", res.body.commentText, "Same text");
            done();
          }

        });

    });
  });

  describe('#delete', function() {
    it('Delte an issue by id', function(done) {

      var user = utils.getTestUser();

      utils.server
        .delete('/api/issues/' + issueid)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }

        });

    });
  });


});
