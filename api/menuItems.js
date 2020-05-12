const express = require('express');
const sqlite3 = require('sqlite3');
const menuItemsRouter = express.Router({mergeParams: true});
const isValidInstance = require('../src/utils/utils.js')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//setting instance type
menuItemsRouter.use((req, res, next) => {
    req.body.instanceType = 'menuItem';
    next();
})

//handling id param
menuItemsRouter.param('menuItemId', (req, res, next, id) => {
    db.get(`SELECT * FROM MenuItem WHERE id=${id}`, (err, row) => {
        if(err) {
            next(err);
        } else if(!row) {
            return res.sendStatus(404);
        }
        next();
    })
})

//get all the menu items
menuItemsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id=${req.params.menuId}`, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menuItems: rows});
        }
    })
})

//get single menu item
menuItemsRouter.get('/:menuItemId', (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE id=${req.params.menuItemId}`, (err, row) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menuItem: row});
        }
    })
})

//create menu item
menuItemsRouter.post('/', isValidInstance, (req, res, next) => {
    const menuItem = req.body.menuItem;
    db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)', 
    {
        $name: menuItem.name,
        $description: menuItem.description,
        $inventory: menuItem.inventory,
        $price: menuItem.price,
        $menu_id: req.params.menuId
    }, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id=${this.lastID}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(201).json({menuItem: row});
                }
            })
        }
    })
})

//update menu item
menuItemsRouter.put('/:menuItemId', isValidInstance, (req, res, next) => {
    const menuItem = req.body.menuItem;
    db.run('UPDATE MenuItem SET name=$name, description=$description, inventory=$inventory, price=$price WHERE id=$id', 
    {
        $name: menuItem.name,
        $description: menuItem.description,
        $inventory: menuItem.inventory,
        $price: menuItem.price,
        $id: req.params.menuItemId
    }, err => {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id=${req.params.menuItemId}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({menuItem: row});
                }
            })
        }
    })
})

//delete menu item
menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id=${req.params.menuItemId}`, err => {
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
})

module.exports = menuItemsRouter;