var utils = require('../../utils');
var assert = require('assert');

describe('Users', function() {

  describe('#list', function() {
    it('Lists all users', function(done) {

      var token = utils.getUserToken();

      utils.server
        .get('/api/users')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.length, 2, 'Has two users, one from auth test another at setup');
            done();
          }
          });
    });
  });

});
