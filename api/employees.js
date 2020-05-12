const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetsRouter = require('./timesheets');
const employeesRouter = express.Router();
const isValidInstance = require('../src/utils/utils.js');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.use((req, res, next) => {
    req.body.instanceType = 'employee';
    next();
})

//validates provided id
employeesRouter.param('employeeId', (req, res, next, id) => {
    db.get(`SELECT * FROM Employee WHERE id=${id}`, (err, row) => {
        if(err) {
            next(err);
        } else if(!row) {
            return res.sendStatus(404);
        }
        next();
    })
})

//mounting timesheets router
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

//get all employed employees
employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee=1', (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({employees: rows});
        }
    })
})

//get employee by id
employeesRouter.get('/:employeeId', (req, res, next) => {
    db.get(`SELECT * FROM Employee WHERE id=${req.params.employeeId}`, (err, row) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({employee: row});
        }
    })
})

//create new employee
employeesRouter.post('/', isValidInstance, (req, res, next) => {
    const employee = req.body.employee;
    db.run('INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)', {
        $name: employee.name,
        $position: employee.position,
        $wage: employee.wage
    }, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id=${this.lastID}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(201).json({employee: row});
                }
            })
        }
    })
})

//update employee
employeesRouter.put('/:employeeId', isValidInstance, (req, res, next) => {
    const employee = req.body.employee;
    db.run(`UPDATE Employee SET name=$name, position=$position, wage=$wage WHERE id=${req.params.employeeId}`, {
        $name: employee.name,
        $position: employee.position,
        $wage: employee.wage
    }, err => {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id=${req.params.employeeId}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({employee: row});
                }
            })
        }
    })
})

//unemploy employee
employeesRouter.delete('/:employeeId', (req, res, next) => {
    db.run(`UPDATE Employee SET is_current_employee=0 WHERE id=${req.params.employeeId}`, err => {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id=${req.params.employeeId}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({employee: row});
                }
            })
        }
    })
})

module.exports = employeesRouter;