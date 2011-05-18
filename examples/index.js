// add saveAs module
var saveAs = require('../lib/saveas');

// request options
var reqOpts = {
      host: 'about.me'
    , port: 80
    , method: 'GET'
//    , headers: req.headers
    , path: '/retrofox'
  }


// init request to google
saveAs.save(reqOpts, 'google', function(err, stats) {

  console.log('reques done');

  console.log("-- data ----------------------------------------------------");
  console.log(err);
  console.log("---------------------------------------------------- data --");
  
})

