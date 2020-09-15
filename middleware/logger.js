// Used to log incoming requests to the console 

// Modules 
//  moment - Formats the dates to log out to the console 
const moment = require('moment');

// Setup the logger 
const logger = (req,res,next) =>{
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl} ${moment().format()}`);
    console.log(`${req.method}`)
    //if(req.method == 'POST'||req.method =='PUT'){
        //console.log(`Body of ${req.method}\n${req.body.email}`)
        //console.dir(req.params, { depth: null });
      //  next();
    //}
    //else{
    //    next();
   // }
   next();
};

// Export the module 
module.exports = logger;