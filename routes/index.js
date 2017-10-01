var express = require('express');
var router = express.Router();

var db = require('../queries');

router.get('/api/students', db.getAllStudents);
router.get('/api/students/today', db.getTodaysStudents)
router.get('/api/students/:id', db.getSingleStudent);
router.post('/api/students', db.createStudent);
router.put('/api/students/:id', db.updateStudent);
router.delete('/api/students/:id', db.removeStudent);
router.post('/api/students/:id/signin', db.signinStudent);
router.post('/api/students/:id/signout', db.signoutStudent);
router.post('/api/students/:id/late', db.late);
router.get('/api/signins', db.getAllSignins)
router.get('/api/signins/today', db.getTodaysSignins)


module.exports = router;