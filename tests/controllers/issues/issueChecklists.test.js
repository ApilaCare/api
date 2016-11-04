var utils = require('../../utils');
var assert = require('assert');

describe('Issue Comments', function() {

  var issueid = '';
  var checklistId = '';

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
    it('Creates a new checklist', function(done) {

      var user = utils.getTestUser();

      var checklistData = {
        checklistName: "Checklist 1",
        author: user._id
      };

      utils.server
        .post('/api/issues/' + issueid + '/checklists/new')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(checklistData)
        .expect(201)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            checklistId = res.body._id;
            assert.equal("Checklist 1", res.body.checklistName, "Is the nae there?");
            done();
          }

        });

    });
  });

  // describe('#create', function() {
  //   it('Creates a new checkitem', function(done) {
  //
  //     var user = utils.getTestUser();
  //
  //     var checkitemData = {
  //       checklistName: "Checklist 1",
  //       author: user._id
  //     };
  //
  //     utils.server
  //       .post('/api/issues/' + issueid + '/checklists/new')
  //       .set('Accept', 'application/json')
  //       .set('Authorization', 'Bearer ' + user.token)
  //       .send(checkitemData)
  //       .expect(201)
  //       .end(function(err, res) {
  //         if (err) {
  //           done(err);
  //         } else {
  //           checklistId = res.body._id;
  //           assert.equal("Checklist 1", res.body.checklistName, "Is the nae there?");
  //           done();
  //         }
  //
  //       });
  //
  //   });
  // });


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
