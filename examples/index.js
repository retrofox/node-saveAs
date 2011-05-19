// add saveAs module
var saveAs = require('../lib/saveas');

// request options
var options = {
      request: {
          host: 'about.me'
        , port: 80
        , method: 'GET'
        , path: '/retrofox'
      }
      , down: {
          images: true
        , css: true
        , js: true
      }
      , AllowFromExternalHost: true
      , folders: {
          images: 'images/'
        , javascripts: 'javascript/'
        , stylesheets: 'styles/'
      }
    }


// init request to google
saveAs.save(options, 'about.me.retrofox', function(err, stats) {
  //console.log(stats);
})

