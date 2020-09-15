// Author: Warren Kavanagh 
// Date  : 03/09/2020
//// Description ////
// The purpose of this file is providing the functionality for a smart app 
// webhook up endpoint for samsungs smartthings. The apps purpose is to poll 
// sensors data and store this data within a database
// The polling is done from a  

"use strict"; //strict syntax, all variables must be declared 

// *** Modules ***
//  express    - Framework for the app 
//  bodyParser - USed to parse incoming http requests bodys  
//  dotenv     - Used to read the env file
//  smartApp   - Smart app api class 
//  influx     - Influxdb timeseries database is used to store measurements  
const express = require("express");
const bodyParser = require("body-parser");
const SmartApp = require("@smartthings/smartapp");
const Influx = require('influx');
require('dotenv').config()

// Create an instance of express and link the bodyparser to it 
const server = (module.exports = express());
server.use(bodyParser.json()); 

// Create a connection to the influxdb 
const client = new Influx.InfluxDB({
  host: 'localhost',
  database: 'community_grid',
  username: process.env.USER,
  password: process.env.PASSWORD
})

// Define new instance of smartApp
const app = new SmartApp();

// When you go to home page this will be displayed 
server.get("/", (req, res) => {
  res.send("Simple SmartApp Example URL: https://" + req.hostname);
});

// Handles Lifecycle event for webhook smartapps
server.post('/', async (req,res) => {
  // https://github.com/SmartThingsCommunity/smartapp-sdk-nodejs/blob/master/docs/classes/_smart_app_d_.smartapp.md#handlehttpcallback
  app.handleHttpCallback(req,res);
});


// *** Define the SmartApp *** //
//  All the documentation on the smart app class:
//  https://github.com/SmartThingsCommunity/smartapp-sdk-nodejs/blob/master/docs/classes/_smart_app_d_.smartapp.md
app.enableEventLogging(); // Enable event logging on the app 
app.appId("Local Smart App")
app.configureI18n();      



// Define the Configuration page of the app 
app.page('mainPage', (context,page,configData) => {
  // Sensor Section 
  page.section('sensors',section => {
    // The sensor will be the enegy meter and power meter, there can be multiple selected  
    section.deviceSetting('sensor').capabilities(['powerMeter']).required(true).multiple(true);
  });
})

//// device_callback ////
// This is the function used to poll the sensors continously 
// Inputs:
//  context - A reference to the app context, contains infor on config, api etc
//  device  - JSON data on the device ID, used to query the api 
async function device_callback(context,device){
  let sensor=device.deviceConfig.deviceId;
  let devStatus= await context.api.devices.getStatus(sensor);
  let data = JSON.stringify(devStatus);
  var objectValue = JSON.parse(data);
  console.log(objectValue)
  var power       = objectValue["components"]["main"]["powerMeter"]["power"]["value"];
  var power_unit  = objectValue["components"]["main"]["powerMeter"]["power"]["unit"];
  var energy      = objectValue["components"]["main"]["energyMeter"]["energy"]["value"];
  var energy_unit = objectValue["components"]["main"]["energyMeter"]["energy"]["unit"];
  var points = [
    {
       measurement: 'power',
       tags: {DeviceID: sensor},
       fields: {Value:power, Unit: power_unit},
    },
    {
      measurement: 'energy',
      tags: {DeviceID: sensor},
      fields: {Value:energy, Unit: energy_unit}
    }
  ]
  client.writePoints(points)
}

// Define the updated functionality 
// This handler is called when the app is updated by the user 
// Will also be used if no "Installed" functinality is decalred when the user first installs the app
// context - Instance of smartApp Context, will allow you to access api 
app.updated(async (context, updateData) => {
  console.log('In the updated function')
  // Need to add code to delete old schedules if this is entered   

  
  var i;
  // Iterate through the sensors selected by the user 
  // Add a job to read these sensors at a set interval 
  for (i = 0; i < context.config.sensor.length; i++) {
    setInterval(device_callback,1000,context,context.config.sensor[i])
  }
  })

/* Starts the server */
let port = process.env.PORT;
server.listen(port);
console.log(`Open: http://127.0.0.1:${process.env.PORT}`);