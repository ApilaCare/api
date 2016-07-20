var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

 var multiparty = require('connect-multiparty');
 var multipartyMiddleware = multiparty({uploadDir: "./"});

var auth = jwt({
    // set secret using same environment variable as before
    secret: process.env.JWT_SECRET,
    // define property on req to be payload
    userProperty: 'payload'
});

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

// appointments
var ctrlAppointments = require('../controllers/appointments/appointments');
var ctrlAppointmentComments = require('../controllers/appointments/appointmentComments');

// communities
var ctrlCommunities = require('../controllers/communities/communities');


// communities
router.post('/communities/new', ctrlCommunities.communitiesCreate);
router.get('/communities/', auth, ctrlCommunities.communitiesList);
router.post('/communites/:communityid/role/:userid', auth, ctrlCommunities.addRole);
router.put('/communities/accept/:communityid/', auth, ctrlCommunities.acceptMember);
router.put('/communities/decline/:communityid/', auth, ctrlCommunities.declineMember);
router.put('/communities/pending/:communityid/', auth, ctrlCommunities.addPendingMember);
router.put('/communities/update/:communityid/', auth, ctrlCommunities.communitiesUpdateOne);
router.delete('/communites/:communityid/user/:userid/submitby/:username', auth, ctrlCommunities.removeMember);
router.delete('/communities/:communityid/', auth, ctrlCommunities.communitiesDeleteOne);

// issues
router.get('/issues/list/:status/id/:communityid', auth, ctrlIssues.issuesList);
router.get('/issues/:username/s/:status/id/:communityid', auth, ctrlIssues.issuesListByUsername);
router.get('/issues/count/:username/id/:communityid', auth, ctrlIssues.issuesOpenCount);
router.get('/issues/issuescount/:communityid', auth, ctrlIssues.issuesCount);
router.get('/issues/due/:communityid', auth, ctrlIssues.dueIssuesList);
router.post('/issues/new', auth, ctrlIssues.issuesCreate);
router.get('/issues/:issueid', auth, ctrlIssues.issuesReadOne);
router.put('/issues/:issueid', auth, ctrlIssues.issuesUpdateOne);
router.delete('/issues/:issueid', auth, ctrlIssues.issuesDeleteOne);

// issue comments
router.post('/issues/:issueid/comments/new', auth, ctrlIssueComments.issueCommentsCreate);
router.get('/issues/:issueid/comments/:commentid',auth,  ctrlIssueComments.issueCommentsReadOne);
router.put('/issues/:issueid/comments/:commentid', auth, ctrlIssueComments.issueCommentsUpdateOne);
router.delete('/issues/:issueid/comments/:commentid', auth, ctrlIssueComments.issueCommentsDeleteOne);

// issue checklists
router.post('/issues/:issueid/checklists/new', auth, ctrlIssueChecklists.issueChecklistsCreate);
router.get('/issues/:issueid/checklists/:checklistid',auth,  ctrlIssueChecklists.issueChecklistsReadOne);
router.put('/issues/:issueid/checklists/newitem/:listid', auth, ctrlIssueChecklists.issueChecklistAddItem);
router.put('/issues/:issueid/checklists/:checklistid', auth, ctrlIssueChecklists.issueChecklistsUpdateOne);
router.delete('/issues/:issueid/checklists/:checklistid', auth, ctrlIssueChecklists.issueChecklistsDeleteOne);

// issue labels
router.post('/issues/:issueid/labels/new', auth, ctrlIssueLabels.issueLabelsCreate);
router.get('/issues/:issueid/labels/:labelid', auth, ctrlIssueLabels.issueLabelsReadOne);
router.put('/issues/:issueid/labels/:labelid', auth, ctrlIssueLabels.issueLabelsUpdateOne);
router.delete('/issues/:issueid/labels/:labelid', auth, ctrlIssueLabels.issueLabelsDeleteOne);

// issue attachments
//router.post('/issues/:issueid/attachments/upload', auth, multipartyMiddleware, ctrlIssueAttachments.issueAttachmentsUpload);
router.post('/issues/:issueid/attachments/new', auth, multipartyMiddleware, ctrlIssueAttachments.issueAttachmentsCreate);
router.get('/issues/:issueid/attachments/:attachmentid', auth, ctrlIssueAttachments.issueAttachmentsReadOne);
router.put('/issues/:issueid/attachments/:attachmentid', auth, ctrlIssueAttachments.issueAttachmentsUpdateOne);
router.delete('/issues/:issueid/attachments/:attachmentid', auth, ctrlIssueAttachments.issueAttachmentsDeleteOne);

// issues recovery
router.post('/issues/recovery/:communityid', auth, ctrlIssueRecovery.createMemberRecovery);
router.post('/issues/recovery/verify/:userid', auth, ctrlIssueRecovery.confirmPassword);

// appointments
router.get('/appointments/:communityid', auth, ctrlAppointments.appointmentsList);
//router.get('/appointments/:month', auth,  ctrlAppointments.appointmentsListByMonth);
router.get('/appointments/today/:communityid', auth,  ctrlAppointments.appointmentsToday);
router.get('/appointments/:appointmentid', auth, ctrlAppointments.appointmentsReadOne);
router.put('/appointments/update/:appointmentid', auth, ctrlAppointments.appointmentsUpdateOne);
router.delete('/appointments/:appointmentid', auth, ctrlAppointments.appointmentsDeleteOne);
router.post('/appointments/new', auth, ctrlAppointments.appointmentsCreate);

// appointment comments
router.post('/appointments/:appointmentid/comments', auth, ctrlAppointmentComments.appointmentCommentsCreate);
router.get('/appointments/:appointmentid/comments/:commentid', auth, ctrlAppointmentComments.appointmentCommentsReadOne);
router.put('/appointments/:appointmentid/comments/:commentid', auth, ctrlAppointmentComments.appointmentCommentsUpdateOne);
router.delete('/appointments/:appointmentid/comments/:commentid', auth, ctrlAppointmentComments.appointmentCommentsDeleteOne);

// users
router.get('/users', auth, ctrlUsers.usersList);
router.put('/users/change/:username', auth, ctrlUsers.updateUsername);
router.post('/users/:username/upload', auth, multipartyMiddleware, ctrlUsers.uploadImage);
router.get('/users/:username/image', ctrlUsers.userImage);
router.post('/users/forgotpassowrd/:email', ctrlUsers.forgotPassword);
router.post('/users/reset/:token', ctrlUsers.resetPassword);
router.get('/users/community/:username', auth, ctrlUsers.userCommunity);
router.get('/users/list/:community', auth, ctrlUsers.usersInCommunity);
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// residents
router.get('/residents/list/:communityid', auth, ctrlResidents.residentsList);
router.get('/residents/birthday/:communityid', auth, ctrlResidents.residentBirthday);
router.get('/residents/:residentid', auth, ctrlResidents.residentById);
router.get('/residents/count/:communityid', auth, ctrlResidents.residentsCount);
router.put('/residents/update/:residentid', auth, ctrlResidents.residentsUpdateOne);
router.delete('/residents/:residentid', auth, ctrlResidents.residentsDeleteOne);
router.post('/residents/new', auth, ctrlResidents.residentsCreate);
router.get('/residents/average_age/:communityid', auth, ctrlResidents.getAverageAge);

module.exports = router;
