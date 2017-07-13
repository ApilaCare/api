const utils = require('../../utils');
const assert = require('assert');

describe('Issues Stats', function() {

  const issueid = '';

  describe('#issues open count', function() {
    it('Number of open issues', function(done) {

      const user = utils.getTestUser();

       utils.server
        .get('/api/issues/issuescount/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal(res.body, 1, 'Number of open issues is 1');
            done();
          }

        });

    })
  });


describe('#issues open count for user', function() {
    it('Number of open issues for a specific user', function(done) {

      const user = utils.getTestUser();

       utils.server
        .get('/api/issues/count/' + user.id + '/id/' + user.community._id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal(res.body, 1, 'Number of open issues is 1');
            done();
          }

        });

    })
  });

  describe('#add activity rate', function() {
    it('Adds a new activity rate entry', function(done) {

      const user = utils.getTestUser();

      const activityData = {
        date: new Date(),
        issueActivityRate: 99,
        user: user.id,
        name: user.name
      };

       utils.server
        .post('/api/issues/' + user.community._id + '/activityrate')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(activityData)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal(res.body.issueActivityRate, 99, "Added activity rate");
            done();
          }

        });

    })
  });

describe('#users Activity Rankings', function() {
    it('Get a list of user rankings for a community', function(done) {

      const user = utils.getTestUser();

       utils.server
        .get('/api/issues/' +  user.community._id + '/rankings')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            console.log(res.body);
            assert.equal(res.body.first[0].issueActivityRate, 99);
            done();
          }

        });

    })
  });

  describe('#get activity rates', function() {
    it('Gets all the activity rates for the user', function(done) {

      const user = utils.getTestUser();

       utils.server
        .get('/api/issues/' + user.community._id + '/activityrate/' + user.id)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            console.log(res.body);
            assert.equal(res.body.length, 1, "Listed activity score");
            done();
          }

        });

    })
  });

  describe('#post Adds a new label stats info', function() {
    it('Adds a new entry for the label stats', function(done) {

      const user = utils.getTestUser();

      const labelData = {
        "firstLabel" : 3,
        "secondLabel": 4
      };

       utils.server
        .post('/api/issues/' + user.community._id + '/labelstats')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .send(labelData)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal(res.body.name, 'secondLabel', "Label stats added");
            done();
          }

        });

    })
  });

   describe('#get list of label stats', function() {
    it('Returns a list of label stats for a community', function(done) {

      const user = utils.getTestUser();

       utils.server
        .get('/api/issues/' + user.community._id + '/labelstats')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            done(err);
          } else {
            assert.equal(res.body.length, 2, "Returns a list of label stats");
            done();
          }

        });

    })
  });

});