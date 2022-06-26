# node-cld
[![*NIX Build Status](https://secure.travis-ci.org/dachev/node-cld.png)](https://travis-ci.org/dachev/node-cld)
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/dachev/node-cld?svg=true&retina=true)](https://ci.appveyor.com/project/dachev/node-cld)
[![Dependencies](https://david-dm.org/dachev/node-cld.png)](https://david-dm.org/dachev/node-cld)
[![NPM version](https://badge.fury.io/js/cld.svg)](http://badge.fury.io/js/cld)

Language detection for Javascript. Based on the CLD2 (Compact Language Detector) library from Google.

Highly optimized for space and speed. Runs about 10x faster than other libraries. Detects over 160 languages. Full test coverage. Runs on Linux, OS X, and Windows.

## Installation

```bash
$ npm install cld
```

Linux users, make sure you have g++ >= 4.8. If this is not an option, you should be able to install node-cld 2.4.4 even with an older g++ build.

## Examples
### Simple
```js
require('cld').detect('This is a language recognition example', function(err, result) {
  console.log(result);
});
```

### Advanced
```js
var text    = 'Това е пример за разпознаване на Български език';
var options = {
  isHTML       : false,
  languageHint : 'BULGARIAN',
  encodingHint : 'ISO_8859_5',
  tldHint      : 'bg',
  httpHint     : 'bg'
};

require('cld').detect(text, options, function(err, result) {
  console.log(result);
});
```


## Options

#### isHTML

Set to true if the string contains HTML tags

#### languageHint

Pass a LANGUAGES key or value as a hint

#### encodingHint

Pass an ENCODINGS value as a hint

#### tldHint

Pass top level domain as a hint

#### httpHint

Pass an HTTP "Content-Encoding" value as a hint

## Warning
Once the module has been installed, the underlying C sources will remain in the ```deps/cld``` folder and continue to occupy considerable space. This is because they will be required if you ever need to run `npm rebuild`. If you are under severe constraints you can delete this folder and reclam >100M

## Copyright
Copyright 2011-2015, Blagovest Dachev.

## License
Apache 2
