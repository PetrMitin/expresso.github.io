const express = require('express');
const sqlite3 = require('sqlite3');
const menusRouter = express.Router();
const isValidInstance = require('../src/utils/utils.js');
const menuItemsRouter = require('./menuItems');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.use((req, res, next) => {
    req.body.instanceType = 'menu';
    next();
})

//handling menuId param
menusRouter.param('menuId', (req, res, next, id) => {
    db.get(`SELECT * FROM Menu WHERE id=${id}`, (err, row) => {
        if(err) {
            next(err);
        } else if(!row) {
            return res.sendStatus(404);
        }
        next();
    })
})

//mounting menuItems router
menusRouter.use('/:menuId/menu-items', menuItemsRouter);

//get all the menus
menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menus: rows});
        }
    })
})

//get single menu
menusRouter.get('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM Menu WHERE id=${req.params.menuId}`, (err, row) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menu: row});
        }
    })
})

//create menu
menusRouter.post('/', isValidInstance, (req, res, next) => {
    const menu = req.body.menu;
    db.run('INSERT INTO Menu (title) VALUES ($title)', {
        $title: menu.title
    }, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id=${this.lastID}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(201).json({menu: row});
                }
            })
        }
    })
})

//update menu
menusRouter.put('/:menuId', isValidInstance, (req, res, next) => {
    const menu = req.body.menu;
    db.run('UPDATE Menu SET title=$title WHERE id=$id', {
        $title: menu.title,
        $id: req.params.menuId
    }, err => {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id=${req.params.menuId}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({menu: row});
                }
            })
        }
    })
})

//delete menu with no related items
menusRouter.delete('/:menuId', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id=${req.params.menuId}`, (err, rows) => {
        if(err) {
            next(err);
        } else if(rows.length !== 0) {
            res.sendStatus(400);
        } else {
            db.run(`DELETE FROM Menu WHERE id=${req.params.menuId}`, err => {
                if(err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            })
        }
    })
})

module.exports = menusRouter;