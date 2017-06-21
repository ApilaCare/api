const mongoose = require('mongoose');
const utils = require('../../services/utils');

const ToDo = mongoose.model('ToDo');
const TaskService = require('./task_update');

const _ = require('lodash');
const moment = require('moment');

const occurrence = require('../../services/constants').occurrence;
const taskState = require('../../services/constants').taskState;
const activitiesService = require('../../services/activities');

// creates an empty todo object called when a user is registered
module.exports.createEmptyToDo = async () => {

  try {
    let task = new ToDo({
      tasks: [],
      completed: [],
      notCompleted: []
    });

    let savedTask = await task.save();

    return savedTask.id;

  } catch(err) {
    console.log(err);
    return null;
  }

};

//GET /todos/:todoid - List all the tasks from the todo
module.exports.listTasks = async (req, res) => {

  const todoId = req.params.todoid;

  if (utils.checkParams(req, res, ['todoid'])) {
    return;
  }

  try {

    const todo = await ToDo.findById(todoId)
                       .populate("tasks.responsibleParty", "_id name")
                       .populate("tasks.submitBy", "_id name")
                       .exec();

    //before listing tasks check if any tasks are completed
    await TaskService.updateTasks(todo);
  
    utils.sendJSONresponse(res, 200, todo.tasks);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

//POST /todos/:todoid/task/:taskid - Creates a new task (todo item)
module.exports.addTask = async (req, res) => {

  const todoId = req.params.todoid;

  if (utils.checkParams(req, res, ['todoid'])) {
    return;
  }

  try {

    const userId = req.payload._id;

    const newTask = {
      text: req.body.text,
      occurrence: req.body.occurrence,
      state: "current",
      activeDays: req.body.activeDays,
      activeWeeks: req.body.activeWeeks,
      activeMonths: req.body.activeMonths,
      hourStart: req.body.hourStart,
      hourEnd: req.body.hourEnd,
      everyWeek: req.body.everyWeek,
      everyMonth: req.body.everyMonth,
      cycleDate : new Date(),
      selectedWeekDay: req.body.selectedWeekDay,
      daysInMonth: req.body.daysInMonth,
      selectDay: req.body.selectDay,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      weekStartTime: req.body.weekStartTime,
      weekEndTime: req.body.weekEndTime,
      submitBy: userId,
      responsibleParty: req.body.responsibleParty
    };


    const todo = await ToDo.findById(todoId).exec();
    
    if(!todo) {
      throw "ToDo not found";
    }

    todo.tasks.push(newTask);

    const savedToDo = await todo.save();

    activitiesService.addActivity(" created a task " + newTask.text,
                            userId, "task-create", req.body.communityId, "user");

    // Adding the task to the responsible party todo
    if(userId !== req.body.responsibleParty) {

      if(req.body.responsibleTodoid) {
        const responsibleTodo = await ToDo.findById(req.body.responsibleTodoid).exec();

        responsibleTodo.tasks.push(todo.tasks[todo.tasks.length - 1]);

        await responsibleTodo.save();
      }

    }

    utils.sendJSONresponse(res, 200, todo.tasks[todo.tasks.length - 1]);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

  

};

//PUT /todos/:todoid/task/:taskid - Update a specific task
module.exports.updateTask = async (req, res) => {

  const todoId = req.params.todoid;
  const taskId = req.params.taskid;

  if (utils.checkParams(req, res, ['todoid', 'taskid'])) {
    return;
  }

  try {

    const updatedTask = await updateTask(req.body, todoId, taskId);

    const userId = req.payload._id;

    //responsible party has been changed
    if(req.body.oldResponsibleTodoid) {
      //remove the task from oldResponsibleParty
      await removeTaskForResponsibleParty(task._id, req.body.oldResponsibleTodoid);

      //add the task to newResponsibleParty
      await addTaskForResponsibleParty(req.body.responsibleTodoid, task);
    }

    const responsible = req.body.responsibleParty._id ? req.body.responsibleParty._id : req.body.responsibleParty;
    const submitBy = req.body.submitBy._id ? req.body.submitBy._id : req.body.submitBy;

    //different responsibleParty? Update the other task as well
    if(submitBy !== responsible) {

      let currtodoid = req.body.responsibleTodoid;

      if(userId === req.body.responsibleParty) {
        currtodoid = req.body.creatorsTodoid;
      }

      await updateTask(req.body, currtodoid, taskId);
    }

    utils.sendJSONresponse(res, 200, updatedTask);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};

//DELETE todos/:todoid/task/:taskid - Delete a specific task
module.exports.deleteTask = async (req, res) => {

  const todoId = req.params.todoid;
  const taskId = req.params.taskid;

  if (utils.checkParams(req, res, ['todoid', 'taskid'])) {
    return;
  }

  try {
    const todo = await ToDo.findById(todoId).exec();

    const task = todo.tasks.id(taskId);

    if(!task) {
      throw "Task for deletion not found";
    }

    task.remove();

    const savedToDo = await todo.save();

    utils.sendJSONresponse(res, 200, savedToDo);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};


// GET /todos/:todoid/activecount - Gets the number of active tasks
module.exports.activeTasksCount = async (req, res) => {

  const todoid = req.params.todoid;

  try {

    const todo = await ToDo.find({'_id': todoid}).exec();

    if(!todo[0]) {
      utils.sendJSONresponse(res, 200, 0);
    }

    const tasks = _.filter(todo[0].tasks, function(d) {
      if(d.state === "current"){
        return true;
      }
    });

    utils.sendJSONresponse(res, 200, tasks.length);

  } catch(err) {
    console.log(err);
    utils.sendJSONresponse(res, 500, err);
  }

};


//////////////////////////// HELPER FUNCTION /////////////////////////////////

async function updateTask(updateTask, todoId, taskId) {
  try {

    const currentTime = await TaskService.loadMockTime();

    const todo = await ToDo.findById(todoId).exec();

    //console.log(todoId, todo);

    const index = todo.tasks.indexOf(todo.tasks.id(taskId));
    const task = updateTask;

    if(index === -1) {
      throw "Task to update not found";
    }

    if(task.state === taskState.COMPLETE) {
      task.cycleDate = currentTime.toDate();
      task.completed.push({updatedOn: currentTime.toDate()});
    }

    // if we switched occurrence, reset other active set fields
    if(todo.tasks[index].occurrence !== task.occurrence) {
      resetOtherOccurrences(task);
    }

    todo.tasks.set(index, task);

    await todo.save();

    return todo.tasks[todo.tasks.length - 1];

  } catch(err) {
    console.log(err);
    throw err;
  }
}

async function addTaskForResponsibleParty(responsibleid, task) {
   if(responsibleid) {
      const responsibleTodo = await ToDo.findById(responsibleid).exec();

      responsibleTodo.tasks.push(task);

      return await responsibleTodo.save();
    }
}

async function removeTaskForResponsibleParty(taskId, responsibleid) {
   if(responsibleid) {
      const responsibleTodo = await ToDo.findById(responsibleid).exec();

      const task = responsibleTodo.tasks.id(taskId);

      task.remove();

      return await responsibleTodo.save();
    }
}

function resetOtherOccurrences(task) {
  switch(task.occurrence) {
    case occurrence.HOURLY:
      setToDefault(task, ["daily", "weekly", "monthly"]);
    break;

    case occurrence.DAILY:
      setToDefault(task, ["hourly", "weekly", "monthly"]);
    break;

    case occurrence.WEEKLY:
      setToDefault(task, ["daily", "hourly", "monthly"]);
    break;

    case occurrence.MONTHLY:
      setToDefault(task, ["daily", "weekly", "hourly"]);
    break;
  }
}

function setToDefault(task, activeCycles) {
  _.forEach(activeCycles, function(cycle) {
    switch(cycle) {
      case "hourly" :
        task.hourStart = 0;
        task.hourEnd = 23;
      break;

      case "daily" :
        task.activeDays = [true, true, true, true, true, false, false];
        task.startTime = "";
        task.endTime = "";
      break;

      case "weekly" :
        task.everyWeek = false;
        task.activeWeeks = [false, false, false, false, false];
        task.weekStartTime = "";
        task.weekEndTime = "";
        task.selectDay = "";
      break;

      case "monthly" :
        task.everyMonth = false;
        task.daysInMonth = null;
        task.selectedWeekDay = null;
        task.activeMonths = [false, false, false, false, false, false, false, false, false, false, false, false];
      break;
    }
  });
}
