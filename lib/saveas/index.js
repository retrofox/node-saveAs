/*!
* saveAs
* MIT Licensed
*/

/**
 * Module dependencies.
 */

var http = require('http')
  , https = require('https')
  , htmlParser = require('htmlparser')
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
exports.save = function(options, folder, fn){

  /**
   * getRemoteData()
   **/
  var getRemoteData = function () {
    var args = arguments
      , options = args[0]
      , fn = typeof args[1] == 'function' ? args[1] : args[2]
      , encoding = typeof args[1] == 'string' ? args[1] : null;
    
    var req = http.request(options, function(res) {
      // set encoding ?
      if(encoding) res.setEncoding(encoding);

      var body = '';

      res.on('data', function(d) {
        body+= d;
      });

      res.on('end', function() {
        fn(false, body, req, res);
      });
    });
  
    
    req.end();
    req.on('error', function(e) {
      fn(e, null, req, res);
    });
  }

  /**
   * createFolder()
   **/
  var createFolder = function(folder, fn) {
    fs.stat(folder, function (err, stats) {
      if(err)
        fs.mkdirSync(folder, '644');
      fn();
    });
  }

  /**
   * saveFile()
   **/
  var saveFile = function (filename, file, encoding, fn) {
    console.log('----> saveFile()');

    if(encoding == 'utf8') {
     fs.writeFile(filename, file, encoding, function (err) {
       fn(err);
     });
    }
    else if (encoding == 'binary') {
      // saving images
      var writeStream = fs.createWriteStream(filename, {
                            'flags': 'w'
                          , 'encoding': encoding
                          , 'mode': 0666
                        });

      writeStream.write(file, encoding);

      writeStream
        .on('drain', function(){
          fn(false);
        })
        .on('error', function(){
          fn(true)
        });

    }
    else {
      fn(true);
    }
  };

  /**
   * gutLink
   **/
  var gutLink = function (link) {
    var siteHost = options.request.host;
    
    var gutted = { original: link }
      , spl = link.split('://')
      , withProtocol = spl.length > 0

    if(withProtocol) {
      gutted.protocol = spl[0];

      // determine host and path
      var _m = spl[1].match(/([^\/]+)\/(.*)/);
      if (_m.length > 1) {
        gutted.host = _m[1];
        gutted.path = '/' + _m[2];

        gutted.sameHost = siteHost == _m[2];
      }
    }

    return gutted;
  }


  /**
   * gutPage
   **/
  var gutPage = function (html, options, fn) {
    // init parser
    var handler = new htmlParser.DefaultHandler(function(err, dom) {
      if (err) {
        fn(err, null);
      }
      else {
        var internalResources = {
              links: []
            , images: []
            , stylesheets: []
          }
          , i=0;

        // * LINKS - retrieve all internal links
        // discarded links
        // - begins with 'http://'
        // - begins with 'https://'
        // - equal to '/'
        // - begins with 'mailto'
        // - begins with '#'
        var links = htmlParser.DomUtils.getElementsByTagName("a", dom);
        for (i = 0; i < links.length; i++) {

          if(links[i].attribs 
             && links[i].attribs.href.search(/^(?:http|https):\/\/|^mailto:|^\/$|^#/) < 0
             ) {

            var link = links[i].attribs.href;
            internalResources.links.push(link);
          }
        };

        // * IMAGES
        // - indetify local image or remote image through http*
        var images = htmlParser.DomUtils.getElementsByTagName("img", dom);
        for (i = 0; i < images.length; i++) {

          if(images[i].attribs) {
            var image = gutLink(images[i].attribs.src);
            internalResources.images.push(image);
          }
        };

        // * STYLESHEETS, ICONS
        var csss = htmlParser.DomUtils.getElementsByTagName("link", dom);
        for (i = 0; i < csss.length; i++) {

          if(csss[i].attribs) {
//            var css = gutLink(images[i].attribs.src);
            var css = csss[i];
            if(css.attribs.rel == 'stylesheet')
              internalResources.stylesheets.push(gutLink(css.attribs.href));
          }
        };

        fn(false, internalResources);
      }
    }, { verbose: true });

    var parser = new htmlParser.Parser(handler);
    parser.parseComplete(html);
  }


  // properties
  this.options = {
    request: {}
  }
  for(var key in options.request) this.options.request[key] = options.request[key];

  var self = this;



  // *** INIT - make main first remote connection
  getRemoteData(this.options.request, function(err, doc){
    if(err) return fn(err);

    // create main folder
    createFolder(folder, function(){

      var filename = folder + '/index.html';
      // create index file
        gutPage(doc, {}, function(err, resources){
          var counter = 0;

          // finally ... save file
          var saveDocFile = function () {
            counter--;
            if(counter) return null;
            saveFile(filename, doc, 'utf8', function(err) {
              fn(err, resources);
            });
          }
/*
          // loading images
          if(resources.images.length) {
            var imagesFolder = folder + '/' + options.folders.images
              , counter = counter + resources.images.length;

            // images folder
            createFolder(imagesFolder, function() {

              delete self.options.request.agent;
              resources.images.forEach(function(image, iI) {

                self.options.request.host = image.host;
                self.options.request.path = image.path;

                getRemoteData(self.options.request, 'binary', function(err, bufferImage, req, res){

                  if(res.headers['content-type'].split('image').length > 1) {
                    var spl = image.path.split('/')
                      , imageName = spl[spl.length-1]
                      , imagePath = imagesFolder + imageName;
            
                    saveFile(imagePath, bufferImage, 'binary', function(){
                      doc = doc.replace(image.original, options.folders.images + imageName);
                      saveDocFile();
                    });
                  }
                  else 
                    saveDocFile()
                });

              });
            });
          }
*/
          // stylesheets files
          if(resources.stylesheets.length) {
            console.log("-- resources ----------------------------------------------------");
            console.log(resources.stylesheets);
            console.log("---------------------------------------------------- resources --");
          }

        })
//    });


    });


  });
  
};
