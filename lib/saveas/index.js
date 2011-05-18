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
   **/
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

  /**
   * createFolder()
   **/
  var createFoler = function(folder, fn) {
    fs.stat(folder, function (err, stats) {
      if(err)
        fs.mkdirSync(folder, '644');
      fn();
    });
  }


  /**
   * gutPage
   **/
  var gutPage = function (html, options, fn) {

    var handler = new htmlParser.DefaultHandler(function(err, dom) {
      if (err) {
        console.log("Error: " + err);
      }
      else {
        var internalResources = {
            links: []
          , images: []
        };

        // retrieve all internal links
        // discarded links
        // * - begins with http://
        // * - begins with https://
        // * - begins with /
        // * - begins with mailto
        var links = htmlParser.DomUtils.getElementsByTagName("a", dom);
        for (var i = 0; i < links.length; i++) {
          if(links[i].attribs.href.search(/^http(s:|:)\/\/|^mailto:|^\/$/) < 0) {
            var link = links[i].attribs.href;
            internalResources.links.push(link);
            // debug: re-define \"%s\" link, link
            console.log("-- link ----------------------------------------------------");
            console.log(link);
            console.log("---------------------------------------------------- link --");
          }
          
        };

          fn(internalResources);
      }
    }, { verbose: true });

    var parser = new htmlParser.Parser(handler);
    parser.parseComplete(html);
    }




  // *** INIT - make main first remote connection
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
