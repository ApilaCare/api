var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

 var multiparty = require('connect-multiparty');
 var multipartyMiddleware = multiparty({uploadDir: "./upload_storage"});

var auth = jwt({
    // set secret using same environment variable as before
    secret: process.env.JWT_SECRET,
    // define property on req to be payload
    userProperty: 'payload'
});

// control variables
// issues
var ctrlIssues = require('../controllers/issues/issues');
var ctrlIssueComments = require('../controllers/issues/issueComments');
var ctrlIssueChecklists = require('../controllers/issues/issueChecklists');
var ctrlIssueLabels = require('../controllers/issues/issueLabels');
var ctrlIssueAttachments = require('../controllers/issues/issueAttachments');

// residents
var ctrlResidents = require('../controllers/residents/residents');

// users
var ctrlUsers = require('../controllers/users/users');

// appointments
var ctrlAppointments = require('../controllers/appointments/appointments');
var ctrlAppointmentComments = require('../controllers/appointments/appointmentComments');

// users
var ctrlAuth = require('../controllers/authentication');


// routes
// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// issues
router.get('/issues/list/:status', ctrlIssues.issuesList);
router.get('/issues/:username/s/:status', ctrlIssues.issuesListByUsername);
router.get('/issues/count/:username', ctrlIssues.issuesOpenCount);
router.post('/issues/new', auth, ctrlIssues.issuesCreate);
router.get('/issues/:issueid', ctrlIssues.issuesReadOne);
router.put('/issues/:issueid', ctrlIssues.issuesUpdateOne);
router.delete('/issues/:issueid', ctrlIssues.issuesDeleteOne);

// issue comments
router.post('/issues/:issueid/comments/new', auth, ctrlIssueComments.issueCommentsCreate);
router.get('/issues/:issueid/comments/:commentid', ctrlIssueComments.issueCommentsReadOne);
router.put('/issues/:issueid/comments/:commentid', auth, ctrlIssueComments.issueCommentsUpdateOne);
router.delete('/issues/:issueid/comments/:commentid', auth, ctrlIssueComments.issueCommentsDeleteOne);

// issue checklists
router.post('/issues/:issueid/checklists/new', auth, ctrlIssueChecklists.issueChecklistsCreate);
router.get('/issues/:issueid/checklists/:checklistid', ctrlIssueChecklists.issueChecklistsReadOne);
router.put('/issues/:issueid/checklists/newitem/:listid', ctrlIssueChecklists.issueChecklistAddItem);
router.put('/issues/:issueid/checklists/:checklistid', auth, ctrlIssueChecklists.issueChecklistsUpdateOne);
router.delete('/issues/:issueid/checklists/:checklistid', auth, ctrlIssueChecklists.issueChecklistsDeleteOne);

// issue labels
router.post('/issues/:issueid/labels/new', auth, ctrlIssueLabels.issueLabelsCreate);
router.get('/issues/:issueid/labels/:labelid', ctrlIssueLabels.issueLabelsReadOne);
router.put('/issues/:issueid/labels/:labelid', auth, ctrlIssueLabels.issueLabelsUpdateOne);
router.delete('/issues/:issueid/labels/:labelid', auth, ctrlIssueLabels.issueLabelsDeleteOne);

// issue attachments
//router.post('/issues/:issueid/attachments/upload', auth, multipartyMiddleware, ctrlIssueAttachments.issueAttachmentsUpload);
router.post('/issues/:issueid/attachments/new', auth, multipartyMiddleware, ctrlIssueAttachments.issueAttachmentsCreate);
router.get('/issues/:issueid/attachments/:attachmentid', ctrlIssueAttachments.issueAttachmentsReadOne);
router.put('/issues/:issueid/attachments/:attachmentid', auth, ctrlIssueAttachments.issueAttachmentsUpdateOne);
router.delete('/issues/:issueid/attachments/:attachmentid', auth, ctrlIssueAttachments.issueAttachmentsDeleteOne);

// appointments
router.get('/appointments', ctrlAppointments.appointmentsList);
router.get('/appointments/:month', ctrlAppointments.appointmentsListByMonth);
router.get('/appointments/:appointmentid', ctrlAppointments.appointmentsReadOne);
router.put('/appointments/update/:appointmentid', ctrlAppointments.appointmentsUpdateOne);
router.delete('/appointments/:appointmentid', ctrlAppointments.appointmentsDeleteOne);
router.post('/appointments/new', auth, ctrlAppointments.appointmentsCreate);

// appointment comments
router.post('/appointments/:appointmentid/comments', auth, ctrlAppointmentComments.appointmentCommentsCreate);
router.get('/appointments/:appointmentid/comments/:commentid', ctrlAppointmentComments.appointmentCommentsReadOne);
router.put('/appointments/:appointmentid/comments/:commentid', ctrlAppointmentComments.appointmentCommentsUpdateOne);
router.delete('/appointments/:appointmentid/comments/:commentid', ctrlAppointmentComments.appointmentCommentsDeleteOne);

router.get('/testCall', ctrlAppointments.testCall);

// users
router.get('/users', ctrlUsers.usersList);

// residents
router.get('/residents', ctrlResidents.residentsList);
router.get('/residents/:residentid', ctrlResidents.residentById);
router.put('/residents/update/:residentid', ctrlResidents.residentsUpdateOne);
router.delete('/residents/:residentid', ctrlResidents.residentsDeleteOne);
router.post('/residents/new', auth, ctrlResidents.residentsCreate);

module.exports = router;
