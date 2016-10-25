var utils = require('../../utils');
var assert = require('assert');


describe('Todos', function() {

  var user = utils.getTestUser();

  describe('#add todo task', function() {
    it("Should add a new task", function(done) {

      var taskData = {
        "text" : "Go walk the dog...",
        "occurrence" : 1,
        "state" : "current",
        "activeDays" : [true, true, true, true, true, true, true],
        "cycleDate" : new Date(),
        "completed": [],
        "overDue": [],
        "notCompleted": []
      };

      var todoid = utils.getToDoId();

      utils.server
        .post('/api/todos/' + todoid)
        .set('Authorization', 'Bearer ' + user.token)
        .send(taskData)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            taskid = res.body._id;
            assert.equal(taskData.text, res.body.text, "Are the text set equal");
            done();
          }
      });

    });
  });

  describe('#add todo task', function() {
    it("Should fail to add the new task because its empty", function(done) {

      var todoid = utils.getToDoId();

      utils.server
        .post('/api/todos/' + todoid)
        .set('Authorization', 'Bearer ' + user.token)
        .send({})
        .expect(500)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.name, "ValidationError",
                      "We get a validation error because te fields are required");
            done();
          }
      });

    });
  });

  describe('#list all of the tasks', function() {
    it('Should list the one task we just added', function(done) {

      var todoid = utils.getToDoId();

      utils.server
        .get('/api/todos/' + todoid)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.length, 1, "We have one todo task we listed out");
            done();
          }
      });

    });
  });

  describe('#update todo task', function() {
    it("Should update the text and occurrence of the task", function(done) {

      var todoid = utils.getToDoId();

      var taskData = {
        "text" : "Go walk the dog and the cat, dont forget the cat",
        "occurrence" : 1,
        "state" : "current"
      };

      utils.server
        .put('/api/todos/' + todoid + '/task/' + taskid)
        .send(taskData)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.text, taskData.text, "Check if we updateted the text");
            assert.equal(res.body.occurrence, taskData.occurrence, "Check if updated occurrence");
            taskid = res.body._id;
            done();
          }
      });

    });
  });

  describe('#set task as done', function() {
    it("Should upate the task completed status as done", function(done) {

      var todoid = utils.getToDoId();

      var taskData = {
        "text" : "Go walk the dog and the cat, dont forget the cat",
        "occurrence" : 1,
        "state" : "complete",
        "completed": [],
        "overDue": [],
        "notCompleted": []
      };

      utils.server
        .put('/api/todos/' + todoid + '/task/' + taskid)
        .send(taskData)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.state, "complete", "Is the task set as completed");
            taskid = res.body._id;
            done();
          }
      });

    });
  });

  describe('#delete a task', function() {
    it('Should fail deleting a task beacuse of wrong taskid', function(done) {

      var todoid = utils.getToDoId();
      var wrongId = "wrong";

      utils.server
        .delete('/api/todos/' + todoid + '/task/' + wrongId)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(500)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.message, 'Invalid task id');
            done();
          }
      });
    });
  });

  describe('#delete a task', function() {
    it('Should delete the task by its id', function(done) {

      var todoid = utils.getToDoId();

      utils.server
        .delete('/api/todos/' + todoid + '/task/' + taskid)
        .set('Authorization', 'Bearer ' + user.token)
        .expect(200)
        .end(function(err,res){
          if(err) {
            done(err);
          } else {
            assert.equal(res.body.tasks.length, 0, "There should be zero tasks now");
            done();
          }
      });
    });
  });


});
