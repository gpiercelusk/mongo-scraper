const express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");


const PORT = process.env.PORT || 8080;

// Initialize Express
const app = express();

// Configure middleware

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperData"
mongoose.connect(MONGODB_URI)
const db = mongoose.connection

db.on('error', err => console.log(`Mongoose connection error: ${err}`))

db.once('open', () => console.log(`Connected to MongoDB`))
// view engine setup
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

const routes = require('./routes/index')
app.use('/', routes)

// Start the server
app.listen(PORT, () => console.log(`App running on port ${PORT}!`))
