var path   = require('path');
var fs     = require('fs');
var rimraf = require('rimraf');
var glob   = require('glob');
var _      = require('underscore');

deleteBuildFiles(function(err) {
});

function deleteBuildFiles(cb) {
  var pattern = path.resolve(__dirname, '..', 'build', '**', '*');
  glob(pattern, {nodir:true}, function(err, files) {
    if (err) {
      return cb(err);
    }

    files = _.reject(files, function(val, key) {
      return /cld\.(node|pdb)$/.test(val)
    });

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      fs.unlinkSync(file);
    }

    cb(null);
  });
}
