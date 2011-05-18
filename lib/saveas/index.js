/*!
* saveAs
* MIT Licensed
*/

/**
 * Module dependencies.
 */

var http = require('http')
  , https = require('https')
  , fs = require('fs')
/**
 * Library version.
 */
exports.version = '0.0.1';

/*** Methods ***/
/**
 * saveAs
 *
 */
exports.save = function(requestOptions, folder, fn){

  /**
   * getRemoteData()
   * @param options
   * @param fn
   */
  var getRemoteData = function (options, fn) {

    var autoReq = http.request(options, function(res) {
      var body = '';

      res.on('data', function(d) {
        body+= d;
      });

      res.on('end', function() {
        fn(false, body);
      });
    });
   
    autoReq.end();
    autoReq.on('error', function(e) {
      fn(e, null);
    });
  }



  var createFoler = function(folder, fn) {
    fs.stat(folder, function (err, stats) {
      if(err)
        fs.mkdirSync(folder, '644');

      fn();
    });
  }

  // make main first remote connection
  getRemoteData(requestOptions, function(err, data){
    if(err) return fn(err);

    // create main folder
    createFoler(folder, function(){
      var filename = folder + '/index.html';

      // create index file
      fs.writeFile(filename, data, 'utf8', function (err) {
        fn(false, data)
      });


    });


  });
  
    


};


