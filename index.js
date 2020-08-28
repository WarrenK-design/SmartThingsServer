// *** Modules ***
//  express - Framework for the app 
//  dotenv  - Used to read the env file
//  logger  - Used to log incoming http messages to console  
const express = require('express');
const dotenv  = require('dotenv');
const logger  = require('./middleware/logger')


// Define an instance of express 
const app = express();

// Middleware 
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger);


// Read the env file 
dotenv.config();

// Route the first page 
app.get('/',(req,res) => {
    res.send("Hello")
})

// Let the server run 
app.listen(process.env.PORT)