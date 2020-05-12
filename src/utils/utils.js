const isValidInstance = (req, res, next) => {
    const instanceType = req.body.instanceType;
    let instance;
    let condition;
    switch(instanceType) {
        case 'employee':
            instance = req.body.employee;
            condition = instance.name && instance.position && instance.wage;
            break;
        case 'timesheet':
            instance = req.body.timesheet;
            condition = instance.hours && instance.rate && instance.date;
            break;
        case 'menu':
            instance = req.body.menu;
            condition = instance.title;
            break;
        case 'menuItem':
            instance = req.body.menuItem;
            condition = instance.name && instance.description && instance.inventory && instance.price;
            break;
    }
    if(!condition) {
        return res.sendStatus(400);
    }
    next();
}

module.exports = isValidInstance;