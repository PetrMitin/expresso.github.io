//requiring packages and creating app itself
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const apiRouter = require('./api/api');
const app = express();
app.use(express.static(__dirname + '/'));

//middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());
app.use(morgan('dev'));

//api router mounting
app.use('/api', apiRouter);

//running app
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

module.exports = app;