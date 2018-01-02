var promise = require('bluebird');

var options = {
  promiseLib: promise
};

var ENV = process.env

var pgp = require('pg-promise')(options);
var connectionString = ENV['DATABASE_URL'];
var db = pgp(connectionString);

function emitStudentHour(io, id, date) {
  db.one('select * from students LEFT OUTER JOIN hours ON (sid = id AND date = \'$1-$2-$3\') where id = $4', 
    [date.getFullYear(), date.getMonth()+1, date.getDate(), id])
    .then(function (student) {
      io.emit('message', student)
    })
}

function getAllStudents(req, res, next) {
  db.any('select * from students order by firstname')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      console.log(err)
      return next(err);
    });
}

function getSingleStudent(req, res, next) {
  var id = parseInt(req.params.id);
  db.one('select * from students where id = $1', id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createStudent(req, res, next) {
  req.body.grade = parseInt(req.body.grade);
  db.one('insert into students(firstname, lastname, email, grade, gender)' +
      'values(${firstname}, ${lastname}, ${email}, ${grade}, ${gender})' + 
      ' returning *',
    req.body)
    .then(function (data) {
      res.status(200)
        .json(data)
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateStudent(req, res, next) {
  db.one('update students set firstname=$1, lastname=$2, email=$3, grade=$4, gender=$5 where id=$6 returning *',
    [req.body.firstname, req.body.lastname, req.body.email, parseInt(req.body.grade), req.body.gender, parseInt(req.params.id)])
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeStudent(req, res, next) {
  var id = parseInt(req.params.id);
  db.result('delete from students where id = $1', id)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} student`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

function signinStudent(req, res, next) {
  var id = parseInt(req.params.id);
  var date = new Date();
  db.one('insert into hours(date, sid, late)' +
    'values(\'$1-$2-$3\', $4, false)' +
    ' returning *',
    [date.getFullYear(), date.getMonth()+1, date.getDate(), id])
    .then(function (data) {
      emitStudentHour(res.io, id, date)
      res.status(200)
        .json(data)
    })
    .catch(function (err) {
      res.status(400)
        .json({
          'error': true,
          'errorObject': err,
          'status': 'User already signed in'
        })
    });
}

function signoutStudent(req, res, next) {
  var id = parseInt(req.params.id);
  var date = new Date();
  db.result('delete from hours where sid = $1 and date=\'$2-$3-$4\'', 
    [id, date.getFullYear(), date.getMonth()+1, date.getDate()])
  .then(function (result) {
    emitStudentHour(res.io, id, date)
    res.status(200)
      .json({
        status: 'success',
        message: `Removed ${result.rowCount} student`
      });
    /* jshint ignore:end */
  })
  .catch(function (err) {
    res.status(400)
      .json({
        'error': true,
        'errorObject': err,
        'status': 'User is not currently signed in'
      })
  });
}

function getTodaysStudents(req, res, next) {
  var date = new Date();
  db.any('SELECT * FROM students LEFT OUTER JOIN hours ON (sid = id AND date = \'$1-$2-$3\') ORDER BY firstname;',
    [date.getFullYear(), date.getMonth()+1, date.getDate()])
  .then(function (data) {
    res.status(200)
      .json(data);
  })
  .catch(function (err) {
    console.log(err)
    return next(err);
  });
}

function getTodaysSignins(req, res, next) {
  var date = new Date();
  db.any('select * from hours where date = \'$1-$2-$3\'', [date.getFullYear(), date.getMonth()+1, date.getDate()])
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function late(req, res, next) {
  var id = parseInt(req.params.id);
  var date = new Date();
  db.one('insert into hours(date, sid, late)' +
    'values(\'$1-$2-$3\', $4, true)' +
    ' on conflict (date, sid) do update set late = true' +
    ' returning *',
    [date.getFullYear(), date.getMonth()+1, date.getDate(), id])
    .then(function (data) {
      emitStudentHour(res.io, id, date)
      res.status(200)
        .json(data)
    })
    .catch(function (err) {
      res.status(400)
        .json({
          'error': true,
          'errorObject': err,
          'status': 'Error occured'
        })
    });
}

function getAllSignins(req, res, next) {
  db.any('select * from hours LEFT OUTER JOIN students ON (sid = id)')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      console.log(err)
      return next(err);
    });
}

module.exports = {
  getAllStudents: getAllStudents,
  getSingleStudent: getSingleStudent,
  createStudent: createStudent,
  updateStudent: updateStudent,
  removeStudent: removeStudent,
  signinStudent: signinStudent,
  signoutStudent: signoutStudent,
  late: late,
  getTodaysSignins: getTodaysSignins,
  getTodaysStudents: getTodaysStudents,
  getAllSignins: getAllSignins
};