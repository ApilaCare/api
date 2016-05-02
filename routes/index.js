var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
    // set secret using same environment variable as before
    secret: process.env.JWT_SECRET,
    // define property on req to be payload
    userProperty: 'payload'
});

var ctrlIssues = require('../controllers/issues');
var ctrlResidents = require('../controllers/residents');
var ctrlAppointments = require('../controllers/appointments');
var ctrlIssueComments = require('../controllers/issueComments');
var ctrlAppointmentComments = require('../controllers/appointmentComments');
var ctrlAuth = require('../controllers/authentication');

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// issues
router.get('/issues', ctrlIssues.issuesList);
router.post('/issues/new', auth, ctrlIssues.issuesCreate);
router.get('/issues/:issueid', ctrlIssues.issuesReadOne);
router.put('/issues/:issueid', ctrlIssues.issuesUpdateOne);
router.delete('/issues/:issueid', ctrlIssues.issuesDeleteOne);

// issue comments
router.post('/issues/:issueid/comments/new', auth, ctrlIssueComments.issueCommentsCreate);
router.get('/issues/:issueid/comments/:commentid', ctrlIssueComments.issueCommentsReadOne);
router.put('/issues/:issueid/comments/:commentid', auth, ctrlIssueComments.issueCommentsUpdateOne);
router.delete('/issues/:issueid/comments/:commentid', auth, ctrlIssueComments.issueCommentsDeleteOne);

// appointments
router.get('/appointments', ctrlAppointments.appointmentsList);
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

// residents
router.get('/residents', ctrlResidents.residentsList);
router.get('/residents/:residentid', ctrlResidents.residentById);
router.put('/residents/update/:residentid', ctrlResidents.residentsUpdateOne);
router.delete('/residents/:residentid', ctrlResidents.residentsDeleteOne);
router.post('/residents/new', auth, ctrlResidents.residentsCreate);

module.exports = router;
