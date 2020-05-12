const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetsRouter = express.Router({mergeParams: true});
const isValidInstance = require('../src/utils/utils.js')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.use((req, res, next) => {
    req.body.instanceType = 'timesheet';
    next();
})

timesheetsRouter.param('timesheetId', (req, res, next, id) => {
    db.get(`SELECT * FROM Timesheet WHERE id=${id}`, (err, row) => {
        if(err) {
            next(err);
        } else if(!row) {
            return res.sendStatus(404);
        }
        next();
    })
})

//get all the timesheets
timesheetsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id=${req.params.employeeId}`, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({timesheets: rows});
        }
    })
})

//create timesheet
timesheetsRouter.post('/', isValidInstance, (req, res, next) => {
    const timesheet = req.body.timesheet;
    db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)`, {
        $hours: timesheet.hours, 
        $rate: timesheet.rate, 
        $date: timesheet.date, 
        $employee_id: req.params.employeeId
    }, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id=${this.lastID}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(201).json({timesheet: row});
                }
            })
        }
    })
})

//update timesheet
timesheetsRouter.put('/:timesheetId', isValidInstance, (req, res, next) => {
    const timesheet = req.body.timesheet;
    db.run('UPDATE Timesheet SET hours=$hours, rate=$rate, date=$date WHERE id=$id', {
        $hours: timesheet.hours, 
        $rate: timesheet.rate, 
        $date: timesheet.date,
        $id: req.params.timesheetId
    }, err => {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id=${req.params.timesheetId}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({timesheet: row});
                }
            })
        }
    })
})

//delete timesheet
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE id=${req.params.timesheetId}`, err => {
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
})

module.exports = timesheetsRouter;