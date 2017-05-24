const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const sanitize = require('mongo-sanitize');

require('../controllers/issues/schedule');

const multiparty = require('connect-multiparty');
const multipartyMiddleware = multiparty({uploadDir: "./"});

const authorization = require('../services/authorization');

const onlyBoss = authorization({ boss: true });
const onlyDirector = authorization({ director: true });
const sameCommunity = authorization({ community: true });
const sameUser = authorization({ user: true});

const auth = jwt({
    // set secret using same environment variable as before
    secret: process.env.JWT_SECRET,
    // define property on req to be payload
    userProperty: 'payload'
});

var sanitizeInput = function(req, res, next) {
  req.body = sanitize(req.body);
  req.params = sanitize(req.params);
  next();
};

// control variables

var nodemailer = require('../services/email');

// issues
var ctrlIssues = require('../controllers/issues/issues');
var ctrlIssueRecovery = require('../controllers/issues/issueRecovery');
var ctrlIssueComments = require('../controllers/issues/issueComments');
var ctrlIssueChecklists = require('../controllers/issues/issueChecklists');
var ctrlIssueLabels = require('../controllers/issues/issueLabels');
var ctrlIssueAttachments = require('../controllers/issues/issueAttachments');

// residents
var ctrlResidents = require('../controllers/residents/residents');

// users
var ctrlUsers = require('../controllers/users/users');
var ctrlAuth = require('../controllers/users/authentication');
var ctrlPayment = require('../controllers/users/payment');

// appointments
var ctrlAppointments = require('../controllers/appointments/appointments');
var ctrlAppointmentComments = require('../controllers/appointments/appointmentComments');

// communities
var ctrlCommunities = require('../controllers/communities/communities');

// todos
var ctrlToDos = require('../controllers/todos/todos');

// activity
var ctrlActivity = require('../controllers/activities/activities');

// logs
const ctrlLogs = require('../controllers/communities/logs');

// communities
router.get('/communities/', sanitizeInput, auth, ctrlCommunities.communitiesList);
router.get('/communities/canceled/:userid', sanitizeInput , auth, ctrlCommunities.hasCanceledCommunity);
router.post('/communities/new', ctrlCommunities.communitiesCreate);
router.post('/communities/:communityid/role/:userid', sanitizeInput , auth, ctrlCommunities.addRole);
router.post('/communities/:communityid/restore/:userid', sanitizeInput , auth, ctrlCommunities.restoreCommunity);
router.post('/communities/:communityid/roomstyle', sanitizeInput, auth, ctrlCommunities.createRoomStyle);
router.post('/communities/:communityid/floor', sanitizeInput, auth, ctrlCommunities.addFloor);
router.post('/communities/:communityid/logo', sanitizeInput , auth, multipartyMiddleware, ctrlCommunities.uploadLogo);
router.put('/communities/accept/:communityid/', sanitizeInput , auth, ctrlCommunities.acceptMember);
router.put('/communities/:communityid/floor', sanitizeInput, auth, ctrlCommunities.updateFloor);
router.put('/communities/decline/:communityid/', sanitizeInput , auth, ctrlCommunities.declineMember);
router.put('/communities/pending/:communityid/', sanitizeInput , auth, ctrlCommunities.addPendingMember);
router.put('/communities/:communityid/roomstyle/:roomid', sanitizeInput, auth, ctrlCommunities.updateRoomStyle);
router.put('/communities/:communityid/contactinfo', sanitizeInput, auth, ctrlCommunities.updateContactAndRoomInfo);
router.put('/communities/update/:communityid/', sanitizeInput , auth, ctrlCommunities.communitiesUpdateOne);
router.put('/communities/:communityid/units', sanitizeInput , auth, ctrlCommunities.updateUnits);
router.delete('/communities/:communityid/roomstyle/:roomid', sanitizeInput, auth, ctrlCommunities.deleteRoomStyle);
router.delete('/communities/:communityid/user/:userid/', sanitizeInput , auth, ctrlCommunities.removeMember);
router.delete('/communities/:communityid/', sanitizeInput , auth, ctrlCommunities.communitiesDeleteOne);

// issues
router.get('/issues/list/:status/id/:communityid', sanitizeInput , auth, ctrlIssues.issuesList);
router.get('/issues/:username/s/:status/id/:communityid', sanitizeInput , auth, ctrlIssues.issuesListByStatus);
router.get('/issues/count/:userid/id/:communityid', sanitizeInput , auth, ctrlIssues.issuesOpenCount);
router.get('/issues/issuescount/:communityid', sanitizeInput , auth, ctrlIssues.issuesCount);
router.get('/issues/due/:communityid', sanitizeInput , auth, ctrlIssues.dueIssuesList);
router.get('/issues/:issueid', sanitizeInput , auth, ctrlIssues.issuesReadOne);
router.get('/issues/:issueid/populate', sanitizeInput, auth, ctrlIssues.issuesPopulateOne);
router.get('/issues/:issueid/updateinfo', sanitizeInput, auth, ctrlIssues.issueUpdateInfo);
router.post('/issues/new', sanitizeInput , auth, ctrlIssues.issuesCreate);
router.put('/issues/:issueid', sanitizeInput , auth, ctrlIssues.issuesUpdateOne);
router.put('/issues/:issueid/updateinfo', sanitizeInput, auth, ctrlIssues.addUpdateInfo);
router.put('/issues/:issueid/finalplan', sanitizeInput, auth, ctrlIssues.addFinalPlan);
router.put('/issues/:issueid/plan/:planid', sanitizeInput, auth, ctrlIssues.updateFinalPlan);
router.put('/issues/:issueid/confidential', sanitizeInput, auth, ctrlIssues.updateConfidential);
router.delete('/issues/:issueid', sanitizeInput , auth, ctrlIssues.issuesDeleteOne);

// issue comments
router.post('/issues/:issueid/comments/new', sanitizeInput , auth, ctrlIssueComments.issueCommentsCreate);
router.put('/issues/:issueid/comments/update', sanitizeInput, auth, ctrlIssueComments.issueCommentsUpdate);
router.get('/issues/:issueid/comments/', sanitizeInput, auth, ctrlIssueComments.issueCommentsList);

// issue checklists
router.post('/issues/:issueid/checklists/new', sanitizeInput , auth, ctrlIssueChecklists.issueChecklistsCreate);
router.put('/issues/:issueid/checklists/:checklistid', sanitizeInput , auth, ctrlIssueChecklists.issueChecklistsUpdateOne);
router.delete('/issues/:issueid/checklists/:checklistid', sanitizeInput , auth, ctrlIssueChecklists.issueChecklistsDeleteOne);

// issue labels
router.post('/issues/labels/:communityid', sanitizeInput, auth, ctrlIssueLabels.createLabel);
router.post('/issues/:issueid/labels/:labelid', sanitizeInput , auth, ctrlIssueLabels.addLabelToCard);
router.put('/issues/:communityid/labels/:labelname', sanitizeInput , auth, ctrlIssueLabels.updateLabel);
router.delete('/issues/:issueid/labels/:labelname', sanitizeInput , auth, ctrlIssueLabels.removeLabelFromCard);
router.delete('/community/:communityid/labels/:labelname', sanitizeInput , auth, ctrlIssueLabels.deleteLabel);

// issue attachments
router.post('/issues/:issueid/attachments/new', sanitizeInput , auth, multipartyMiddleware, ctrlIssueAttachments.issueAttachmentsCreate);
router.put('/issues/:issueid/attachments/restore', sanitizeInput , auth, ctrlIssueAttachments.restoreAttachment);
router.delete('/issues/:issueid/attachments/:attachmentid', sanitizeInput , auth, ctrlIssueAttachments.issueAttachmentsDeleteOne);

// issues recovery
router.post('/issues/recovery/:communityid', sanitizeInput , auth, ctrlIssueRecovery.createMemberRecovery);
router.post('/issues/recovery/verify/:userid', sanitizeInput , auth, ctrlIssueRecovery.confirmPassword);

// appointments
router.get('/appointments/:communityid/month/:month', sanitizeInput , auth, ctrlAppointments.appointmentsList);
router.get('/appointments/today/:communityid', sanitizeInput , auth, ctrlAppointments.appointmentsToday);
router.get('/appointments/locations/:communityid', sanitizeInput, auth, ctrlAppointments.appointmentsLocations);
router.post('/appointments/new', sanitizeInput , auth, ctrlAppointments.appointmentsCreate);
router.put('/appointments/update/:appointmentid', sanitizeInput , auth, ctrlAppointments.appointmentsUpdateOne);
router.delete('/appointments/:appointmentid', sanitizeInput , auth, ctrlAppointments.appointmentsDeleteOne);

// appointment comments
router.post('/appointments/:appointmentid/comments', sanitizeInput , auth, ctrlAppointmentComments.appointmentCommentsCreate);
router.get('/appointments/:appointmentid/comments/:commentid', sanitizeInput , auth, ctrlAppointmentComments.appointmentCommentsReadOne);
router.put('/appointments/:appointmentid/comments/:commentid', sanitizeInput , auth, ctrlAppointmentComments.appointmentCommentsUpdateOne);
router.delete('/appointments/:appointmentid/comments/:commentid', sanitizeInput , auth, ctrlAppointmentComments.appointmentCommentsDeleteOne);

// users
router.get('/users/getuser/:userid',sanitizeInput , auth, sameUser, ctrlUsers.getUser);
router.get('/users/list/:community', sanitizeInput, auth, ctrlUsers.usersInCommunity);
router.get('/users/community/:userid', sanitizeInput , auth, sameUser, ctrlUsers.userCommunity);
router.get('/users/:userid/image', ctrlUsers.userImage);
router.post('/users/:userid/upload', sanitizeInput , auth, sameUser, multipartyMiddleware, ctrlUsers.uploadImage);
router.post('/users/forgotpassowrd/:email', ctrlUsers.forgotPassword); //TODO is this secure?
router.post('/users/reset/:token', ctrlUsers.resetPassword);
router.post('/users/verify/:token', ctrlUsers.verifyEmail);
router.post('/users/:userid/verify_email', ctrlUsers.sendVerifyEmail);
router.put('/users/change/:userid', sanitizeInput , auth, sameUser, ctrlUsers.updateUsername);

//users payment
router.post('/users/:userid/savecard', sanitizeInput , auth, ctrlPayment.saveCreditCard);
router.get('/users/:userid/customer', sanitizeInput , auth, ctrlPayment.getCustomer);
router.delete('/users/:userid/subscription', sanitizeInput , auth, ctrlPayment.cancelSubscription);
router.put('/users/:userid/update', sanitizeInput , auth, ctrlPayment.updateCustomer);

//users authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// todos
router.get('/todos/:todoid', sanitizeInput, auth, ctrlToDos.listTasks);
router.get('/todos/:todoid/activecount', sanitizeInput, auth, ctrlToDos.activeTasksCount);
router.post('/todos/:todoid', sanitizeInput, auth, ctrlToDos.addTask);
router.put('/todos/:todoid/task/:taskid', sanitizeInput, auth, ctrlToDos.updateTask);
router.delete('/todos/:todoid/task/:taskid', sanitizeInput, auth, ctrlToDos.deleteTask);

// Activity
router.post('/activity/:todoid', sanitizeInput, auth, ctrlActivity.createToDoActivity);

// logs
router.get('/logs/:communityid', sanitizeInput, auth, ctrlLogs.listLogs);
router.get('/user_logs/:communityid/user/:userid', sanitizeInput, auth, ctrlLogs.listUserLogs);

// residents
router.get('/residents/list/:communityid', sanitizeInput , auth, ctrlResidents.residentsList);
router.get('/residents/full-list/:communityid', sanitizeInput, auth, ctrlResidents.residentsFullList);
router.get('/residents/:residentid', sanitizeInput , auth, ctrlResidents.residentById);
router.get('/residents/count/:communityid', sanitizeInput , auth, ctrlResidents.residentsCount);
router.get('/residents/:communityid/locations', sanitizeInput , auth, ctrlResidents.getLocations);
router.get('/residents/average_age/:communityid', sanitizeInput , auth,  ctrlResidents.getAverageAge);
router.get('/residents/average_stay/:communityid', sanitizeInput , auth, ctrlResidents.averageStayTime);
router.post('/residents/new', sanitizeInput , auth, ctrlResidents.residentsCreate);
router.post('/residents/:residentid/contact', sanitizeInput, auth, ctrlResidents.addContact);
router.post('/residents/:residentid/image', sanitizeInput, auth, multipartyMiddleware, ctrlResidents.uploadResidentImage);
router.post('/residents/:residentid/upload', sanitizeInput, auth, multipartyMiddleware, ctrlResidents.uploadOutsideAgencyAssesment);
router.put('/residents/update/:residentid', sanitizeInput , auth,  ctrlResidents.residentsUpdateOne);
router.put('/residents/:residentid/listitem', sanitizeInput , auth, ctrlResidents.updateListItem);
router.delete('/residents/:residentid', sanitizeInput , auth, onlyBoss, ctrlResidents.residentsDeleteOne);

module.exports = router;
