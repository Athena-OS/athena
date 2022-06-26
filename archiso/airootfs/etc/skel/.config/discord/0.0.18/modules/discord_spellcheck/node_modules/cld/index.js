var _    = require('underscore');
var cld2 = require('./build/Release/cld');

module.exports = {
  LANGUAGES          : cld2.LANGUAGES,
  DETECTED_LANGUAGES : cld2.DETECTED_LANGUAGES,
  ENCODINGS          : cld2.ENCODINGS,

  detect : function (text, options, cb) {
    if (arguments.length < 2) {
      return;
    }
    if (arguments.length < 3) {
      cb = options;
      options = {};
    }
    if (!_.isFunction(cb)) {
      return;
    }

    if (!_.isString(text) || text.length < 1) {
      return cb({message:'Empty or invalid text'});
    }

    var defaults = {
      isHTML       : false,
      languageHint : '',
      encodingHint : '',
      tldHint      : '',
      httpHint     : ''
    };
    options = _.defaults(options, defaults);

    if (!_.isBoolean(options.isHTML)) {
      return cb({message:'Invalid isHTML value'});
    }
    if (!_.isString(options.languageHint)) {
      return cb({message:'Invalid languageHint'});
    }
    if (!_.isString(options.encodingHint)) {
      return cb({message:'Invalid encodingHint'});
    }
    if (!_.isString(options.tldHint)) {
      return cb({message:'Invalid tldHint'});
    }
    if (!_.isString(options.httpHint)) {
      return cb({message:'Invalid httpHint'});
    }
    if (options.encodingHint.length > 0 &&
      !~cld2.ENCODINGS.indexOf(options.encodingHint)) {

      return cb({message:'Invalid encodingHint, see ENCODINGS'});
    }
    if (options.languageHint.length > 0 &&
      !~_.keys(cld2.LANGUAGES).indexOf(options.languageHint) &&
      !~_.values(cld2.LANGUAGES).indexOf(options.languageHint)) {

      return cb({message:'Invalid languageHint, see LANGUAGES'});
    }

    var result = cld2.detect(
      text,
      !options.isHTML,
      options.languageHint,
      options.encodingHint,
      options.tldHint,
      options.httpHint
    );

    if (result.languages.length < 1) {
      return cb({message:'Failed to identify language'});
    }

    return cb(null, result);
  }
};
