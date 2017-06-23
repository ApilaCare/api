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
            assert.equal(res.body.description, 'Some description', 'If the descriptions are equal we got the right one');
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
            assert.equal(res.body, 2, 'Should be two open issue');
            done();
          }

        });

    });
  });

  describe('#issuesCount', function() {
    it('Number of open issues in a community', function(done) {

      var user = utils.getTestUser();

      utils.server
        .get('/api/issues/issuescount/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal(res.body, 2, 'Should be two open issue');
            done();
          }

        });

    });
  });

  describe('#issuesList', function() {
    it('Gets a list of issues grouped by responsibleParty', function(done) {

      var user = utils.getTestUser();

      var status = 'Open';

      utils.server
        .get('/api/issues/list/' + status + '/id/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal(res.body[0].count, 2, "We have two issues for the first resident");
            done();
          }

        });

    });
  });

  describe('#issuesListByStatus', function() {
    it('List issues in a community by status', function(done) {

      var user = utils.getTestUser();

      var status = 'Open';

      utils.server
        .get('/api/issues/:username/s/' + status + '/id/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal(res.body[0].description, 'Description of our issue', 'If the descriptions are equal we got the right one');
            done();
          }

        });

    });
  });

  describe('#update', function() {
    it('Updates issue by its id', function(done) {

      var user = utils.getTestUser();

      var issueData = {
        "title": 'Issue 1.2',
        "responsibleParty": user.id,
        "resolutionTimeframe": 'Days',
        "description": 'Some description',
        "confidential": false,
        "community": user.community,
        "submitBy" : user.id,
        "status": "Open",
        "due" : new Date(),
        "updateField" : {
          'field' : 'due',
          'old' : '',
          'new' : 'true'
        }
      };

      utils.server
        .put('/api/issues/' + issueid)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(issueData)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }

        });

    });
  });

  describe('#add final plan as a todo item', function() {
    it('Should add a new todo item as a part of an issue', function(done) {

      var user = utils.getTestUser();

      var finalPlanData = {
        "text": 'This is the solution to all of your problems use it wisely',
        "checklist" : false,
        "author": user.id,
        "issueid": issueid,
        "todoid": user.todoid
      };

      utils.server
        .put('/api/issues/' + issueid + '/finalplan')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(finalPlanData)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }

        });

    });
  });


  describe('#dueIssuesList', function() {
    it('List of issues that are due in a community', function(done) {

      var user = utils.getTestUser();

      var status = 'Open';

      utils.server
        .get('/api/issues/due/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal(res.body.length, 1, 'Once updated we have 1 due issue');
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
