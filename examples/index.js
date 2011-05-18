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
saveAs.save(reqOpts, 'about.me.retrofox', function(err, stats) {
  console.log("-- data ----------------------------------------------------");
  console.log(err);
  console.log(stats);
  console.log("---------------------------------------------------- data --");
})

