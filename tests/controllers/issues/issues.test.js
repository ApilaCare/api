var utils = require('../../utils');
var assert = require('assert');

describe('Issues', function() {

  var issueid = '';

  describe('#create', function() {
    it('Creates a new issue', function(done) {

      var user = utils.getTestUser();

      var issueData = {
        "title": 'Issue 1',
        "responsibleParty": user.id,
        "resolutionTimeframe": 'Days',
        "description": 'Some description',
        "confidential": false,
        "community": user.community._id
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

  describe('#read', function() {
    it('Reads an issue by its id', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/issues/' + issueid)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            console.log(res.body);
            done();
          }

        });

    });
  });

  describe('#issuesOpenCount', function() {
    it('Number of open issues asigned to a user', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/issues/count/' + user.id + '/id/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            console.log(res.body);
            done();
          }

        });

    });
  });

});
