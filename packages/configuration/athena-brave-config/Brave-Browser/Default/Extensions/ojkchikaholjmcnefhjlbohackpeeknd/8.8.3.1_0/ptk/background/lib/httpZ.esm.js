import require$$0 from '../../packages/lodash-es/lodash.default.js';

const EOL = '\r\n';
const EOL2X = EOL + EOL;
const BASIC_LATIN = '[\\u0009\\u0020-\\u007E]';
const PARAM_NAME = '[A-Za-z0-9_.\\[\\]-]'; // TODO: extend
const HTTP_METHODS = '(CONNECT|OPTIONS|TRACE|GET|HEAD|POST|PUT|PATCH|DELETE)';
const HTTP_PROTOCOL_VERSIONS = '(HTTP)\\/(1\\.0|1\\.1|2(\\.0){0,1})';

const regexps = {};
regexps.quote = /"/g;
regexps.startNl = new RegExp(`^${EOL}`);
regexps.endNl = new RegExp(`${EOL}$`);
regexps.requestStartRow = new RegExp(`^${HTTP_METHODS} \\S* ${HTTP_PROTOCOL_VERSIONS}$`);
regexps.responseStartRow = new RegExp(`^${HTTP_PROTOCOL_VERSIONS} \\d{3} ${BASIC_LATIN}*$`);
// eslint-disable-next-line no-control-regex
regexps.quoutedHeaderValue = new RegExp('^"[\\u0009\\u0020\\u0021\\u0023-\\u007E]+"$');
regexps.boundary = /(?<=boundary=)"{0,1}[A-Za-z0-9'()+_,.:=?-]+"{0,1}/;
regexps.contentDisposition = new RegExp(
  `^Content-Disposition: *(form-data|inline|attachment)${BASIC_LATIN}*${EOL}`,
  'i'
);
regexps.contentType = new RegExp(`^Content-Type:[\\S ]*${EOL}`, 'i');
regexps.contentDispositionType = /(?<=Content-Disposition:) *(form-data|inline|attachment)/;
regexps.dispositionName = new RegExp(`(?<=name=)"${PARAM_NAME}+"`, 'i');
regexps.dispositionFileName = new RegExp(`(?<=filename=)"${PARAM_NAME}+"`, 'i');

const http = {};

http.protocols = {
  http: 'HTTP',
  https: 'HTTPS'
};

http.protocolVersions = {
  http10: 'HTTP/1.0',
  http11: 'HTTP/1.1',
  http20: 'HTTP/2.0'
};

http.methods = {
  connect: 'CONNECT',
  options: 'OPTIONS',
  trace: 'TRACE',
  head: 'HEAD',
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE'
};

http.postMethods = [http.methods.post, http.methods.put, http.methods.patch];

http.contentTypes = {
  text: {
    any: 'text/',
    css: 'text/css',
    csv: 'text/csv',
    html: 'text/html',
    javascript: 'text/javascript',
    plain: 'text/plain',
    xml: 'text/xml'
  },
  application: {
    any: 'application/',
    javascript: 'application/javascript',
    json: 'application/json',
    octetStream: 'application/octet-stream',
    ogg: 'application/ogg',
    pdf: 'application/pdf',
    xhtml: 'application/xhtml+xml',
    xml: 'application/xml',
    xShockwaveFlash: 'application/x-shockwave-flash',
    xWwwFormUrlencoded: 'application/x-www-form-urlencoded',
    zip: 'application/zip'
  },
  multipart: {
    any: 'multipart/',
    alternative: 'multipart/alternative',
    formData: 'multipart/form-data',
    mixed: 'multipart/mixed',
    related: 'multipart/related'
  },
  image: {
    any: 'image/',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    png: 'image/png',
    tiff: 'image/tiff',
    icon: 'image/x-icon'
  },
  audio: {
    any: 'audio/'
  },
  video: {
    any: 'audio/'
  },
  font: {
    any: 'font/'
  }
};

http.headers = {
  host: 'host',
  contentType: 'Content-Type',
  contentLength: 'Content-Length',
  userAgent: 'User-Agent',
  setCookie: 'Set-Cookie'
};

var consts$8 = {
  EOL,
  EOL2X,
  regexps,
  http
};

var error = class HttpZError extends Error {
  static get(...params) {
    return new HttpZError(...params)
  }

  constructor(message, details) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
};

var utils$6 = {};

var validators$4 = {};

(function (exports) {
  const _ = require$$0;
  const HttpZError = error;

  exports.validateRequired = (val, field, details) => {
    if (_.isNil(val)) {
      throw HttpZError.get(`${field} is required`, details)
    }
  };

  exports.validateString = (val, field, details) => {
    exports.validateRequired(val, field, details);
    if (!_.isString(val)) {
      throw HttpZError.get(`${field} must be a string`, details)
    }
  };

  exports.validateNotEmptyString = (val, field, details) => {
    exports.validateString(val, field, details);
    if (_.isEmpty(val)) {
      throw HttpZError.get(`${field} must be not empty string`, details)
    }
  };

  exports.validateNumber = (val, field, details) => {
    exports.validateRequired(val, field, details);
    if (!_.isNumber(val)) {
      throw HttpZError.get(`${field} must be a number`, details)
    }
  };

  exports.validatePositiveNumber = (val, field, details) => {
    exports.validateNumber(val, field, details);
    if (val <= 0) {
      throw HttpZError.get(`${field} must be a positive number`, details)
    }
  };

  exports.validateArray = (val, field, details) => {
    exports.validateRequired(val, field, details);
    if (!_.isArray(val)) {
      throw HttpZError.get(`${field} must be an array`, details)
    }
  };
}(validators$4));

(function (exports) {
  const _ = require$$0;
  const validators = validators$4;

  exports.splitByDelimeter = (str, delimiter) => {
    if (_.isEmpty(str)) {
      return []
    }

    let delimiterIndex = str.indexOf(delimiter);
    if (delimiterIndex === -1) {
      return []
    }

    let res = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)];
    res[0] = _.trim(res[0], ' ');
    res[1] = _.trim(res[1], ' ');

    return res
  };

  exports.isAbsoluteUrl = url => {
    // Don't match Windows paths `c:\`
    if (/^[a-zA-Z]:\\/.test(url)) {
      return false
    }

    // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
    // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)
  };

  exports.parseUrl = (url, host) => {
    if (!host) {
      host = url;
      url = null;
    }
    const supportedProtocols = ['http', 'https'];
    if (!_.find(supportedProtocols, known => _.startsWith(host, known + '://'))) {
      host = 'http://' + host;
    }

    let parsedUrl = url ? new URL(url, host) : new URL(host);
    let protocol = parsedUrl.protocol.replace(':', '').toUpperCase();
    let params = [];
    parsedUrl.searchParams.forEach((value, name) => params.push({ name, value }));

    return {
      protocol,
      host: parsedUrl.host,
      path: parsedUrl.pathname,
      params
    }
  };

  // eslint-disable-next-line max-params
  exports.generateUrl = (protocol, host, port, path, params) => {
    let result = '';
    if (host) {
      result += protocol.toLowerCase() + '://' + host;
      if (port && !host.includes(':')) {
        result += ':' + port;
      }
    }
    let pathWithParams = exports.generatePath(path, params);
    result += pathWithParams;

    return result
  };

  exports.generatePath = (path, params) => {
    if (_.isEmpty(params)) {
      return path
    }
    let paramPairs = exports.convertParamsArrayToPairs(params);

    return path + '?' + new URLSearchParams(paramPairs).toString()
  };

  exports.convertParamsArrayToPairs = params => {
    validators.validateArray(params, 'params');

    return _.map(params, ({ name, value }) => [name, exports.getEmptyStringForUndefined(value)])
  };

  exports.pretifyHeaderName = name => {
    return _.chain(name).split('-').map(_.capitalize).join('-').value()
  };

  exports.getEmptyStringForUndefined = val => {
    if (_.isUndefined(val)) {
      return ''
    }
    return val
  };

  exports.extendIfNotUndefined = (obj, fieldName, fieldValue) => {
    if (!_.isUndefined(fieldValue)) {
      obj[fieldName] = fieldValue;
    }
  };
}(utils$6));

const _$7 = require$$0;
const consts$7 = consts$8;
const utils$5 = utils$6;
const HttpZError$6 = error;

class FormDataParamParser {
  // TODO: test it
  static parse(...params) {
    let instance = new FormDataParamParser(...params);
    return instance.parse()
  }

  constructor(paramGroup) {
    this.paramGroup = paramGroup;
  }

  // TODO: test it
  parse() {
    this.paramGroup = this.paramGroup.replace(consts$7.regexps.startNl, '').replace(consts$7.regexps.endNl, '');

    let contentDispositionHeader = this._getContentDisposition();
    let contentType = this._getContentType();
    let dispositionType = this._getDispositionType(contentDispositionHeader);
    let name = dispositionType === 'form-data' ? this._getParamName(contentDispositionHeader) : undefined;
    let fileName = this._getFileName(contentDispositionHeader);
    let value = this._getParamValue();

    let param = {
      value
    };
    if (dispositionType !== 'form-data') {
      param.type = dispositionType;
    }
    utils$5.extendIfNotUndefined(param, 'contentType', contentType);
    utils$5.extendIfNotUndefined(param, 'name', name);
    utils$5.extendIfNotUndefined(param, 'fileName', fileName);

    return param
  }

  // TODO: test it
  _getContentDisposition() {
    let contentDisposition = this.paramGroup.match(consts$7.regexps.contentDisposition);
    if (!contentDisposition) {
      throw HttpZError$6.get('Incorrect Content-Disposition', this.paramGroup)
    }
    this.paramGroup = this.paramGroup.replace(contentDisposition[0], '');
    contentDisposition = _$7.trimEnd(contentDisposition[0], consts$7.EOL);
    return contentDisposition
  }

  // TODO: test it
  _getContentType() {
    let contentType = this.paramGroup.match(consts$7.regexps.contentType);
    if (contentType) {
      this.paramGroup = this.paramGroup.replace(contentType[0], '');
      return _$7.chain(contentType)
        .toLower()
        .replace(/^content-type: */, '')
        .trimEnd(consts$7.EOL)
        .value()
    }
  }

  // TODO: test it
  _getDispositionType(contentDisposition) {
    let dispositionType = contentDisposition.match(consts$7.regexps.contentDispositionType);
    if (!dispositionType) {
      throw HttpZError$6.get('Incorrect Content-Disposition type', contentDisposition)
    }
    dispositionType = _$7.chain(dispositionType[0]).trim().toLower().value();
    return dispositionType
  }

  // TODO: test it
  _getParamName(contentDisposition) {
    let paramName = contentDisposition.match(consts$7.regexps.dispositionName);
    if (!paramName) {
      throw HttpZError$6.get('Incorrect Content-Disposition, expected param name', contentDisposition)
    }
    paramName = _$7.trim(paramName, '"');
    return paramName
  }

  // TODO: test it
  _getFileName(contentDisposition) {
    let fileName = contentDisposition.match(consts$7.regexps.dispositionFileName);
    if (fileName) {
      return _$7.trim(fileName, '"')
    }
  }

  // TODO: test it
  _getParamValue() {
    let value;
    if (this.paramGroup.match(consts$7.regexps.startNl)) {
      value = this.paramGroup.replace(consts$7.regexps.startNl, '');
    } else {
      throw HttpZError$6.get('Incorrect form-data parameter', this.paramGroup)
    }
    return value
  }
}

var formDataParamParser$1 = FormDataParamParser;

const _$6 = require$$0;
const consts$6 = consts$8;
const HttpZError$5 = error;
const utils$4 = utils$6;
const formDataParamParser = formDataParamParser$1;

class HttpZBaseParser {
  constructor(rawMessage) {
    this.rawMessage = rawMessage;
  }

  _parseMessageForRows() {
    let [headers, body] = utils$4.splitByDelimeter(this.rawMessage, consts$6.EOL2X);
    if (_$6.isNil(headers) || _$6.isNil(body)) {
      throw HttpZError$5.get(
        'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]'
      )
    }

    this._calcSizes(headers, body);
    let headerRows = _$6.split(headers, consts$6.EOL);

    return {
      startRow: _$6.head(headerRows),
      headerRows: _$6.tail(headerRows),
      bodyRows: body
    }
  }

  _parseHeaderRows() {
    this.headers = _$6.map(this.headerRows, hRow => {
      let [name, value] = utils$4.splitByDelimeter(hRow, ':');
      if (!name) {
        throw HttpZError$5.get('Incorrect header row format, expected: Name: Value', hRow)
      }

      // quoted string must be parsed as a single value (https://tools.ietf.org/html/rfc7230#section-3.2.6)
      if (_$6.isNil(value)) {
        value = '';
      } else if (consts$6.regexps.quoutedHeaderValue.test(value)) {
        value = _$6.trim(value, '"');
      }

      return {
        name: utils$4.pretifyHeaderName(name),
        value
      }
    });
  }

  _parseBodyRows() {
    if (!this.bodyRows) {
      return
    }

    this.body = {};

    if(this.opts?.use_content_type == false){
      this._parseTextBody();
      return
    }

    let contentTypeHeader = this._getContentTypeValue();
    if (contentTypeHeader) {
      this.body.contentType = contentTypeHeader.toLowerCase().split(';')[0];
    }

    switch (this.body.contentType) {
      case consts$6.http.contentTypes.multipart.formData:
      case consts$6.http.contentTypes.multipart.alternative:
      case consts$6.http.contentTypes.multipart.mixed:
      case consts$6.http.contentTypes.multipart.related:
        this._parseFormDataBody();
        break
      case consts$6.http.contentTypes.application.xWwwFormUrlencoded:
        this._parseUrlencodedBody();
        break
      default:
        this._parseTextBody();
        break
    }
  }

  _parseFormDataBody() {
    this.body.boundary = this._getBoundary();
    this.body.params = _$6.chain(this.bodyRows)
      .split(`--${this.body.boundary}`)
      // skip first and last items, which contains boundary
      .filter((unused, index, params) => index > 0 && index < params.length - 1)
      .map(paramGroup => formDataParamParser.parse(paramGroup))
      .value();
  }

  _parseUrlencodedBody() {
    let params = new URLSearchParams(this.bodyRows);
    this.body.params = [];
    params.forEach((value, name) => {
      this.body.params.push({ name, value });
    });
  }

  _parseTextBody() {
    this.body.text = this.bodyRows;
  }

  _calcSizes(headers, body) {
    this.headersSize = (headers + consts$6.EOL2X).length;
    this.bodySize = body.length;
  }

  _getContentTypeValue() {
    let contentTypeHeader = _$6.find(this.headers, { name: consts$6.http.headers.contentType });
    if (!contentTypeHeader) {
      return
    }
    if (!contentTypeHeader.value) {
      return
    }
    return contentTypeHeader.value
  }

  _getBoundary() {
    let contentTypeValue = this._getContentTypeValue();
    if (!contentTypeValue) {
      throw HttpZError$5.get('Message with multipart/form-data body must have Content-Type header with boundary')
    }

    let params = contentTypeValue.split(';')[1];
    if (!params) {
      throw HttpZError$5.get('Message with multipart/form-data body must have Content-Type header with boundary')
    }

    let boundary = params.match(consts$6.regexps.boundary);
    if (!boundary) {
      throw HttpZError$5.get('Incorrect boundary, expected: boundary=value', params)
    }
    return _$6.trim(boundary[0], '"')
  }
}

var base$1 = HttpZBaseParser;

const _$5 = require$$0;
const consts$5 = consts$8;
const HttpZError$4 = error;
const utils$3 = utils$6;
const validators$3 = validators$4;
const Base$3 = base$1;

const SUPER_RANDOM_HOST = 'superrandomhost28476561927456.com';

class HttpZRequestParser extends Base$3 {
  static parse(...params) {
    let instance = new HttpZRequestParser(...params);
    return instance.parse()
  }

  constructor(rawMessage, opts) {
    super(rawMessage);
    this.opts = opts;
  }

  parse() {
    this._parseMessageForRows();
    this._parseHostRow();
    this._parseStartRow();
    this._parseHeaderRows();
    this._parseCookiesRow();
    this._parseBodyRows();

    return this._generateModel()
  }

  _parseMessageForRows() {
    let { startRow, headerRows, bodyRows } = super._parseMessageForRows();

    this.startRow = startRow;
    this.hostRow = _$5.find(headerRows, row => _$5.chain(row).toLower().startsWith('host:').value());
    this.headerRows = headerRows;
    this.cookiesRow = _$5.find(headerRows, row => _$5.chain(row).toLower().startsWith('cookie:').value());
    this.bodyRows = bodyRows;
  }

  _parseHostRow() {
    if (this.opts.mandatoryHost) {
      validators$3.validateNotEmptyString(this.hostRow, 'host header');
    }
    // eslint-disable-next-line no-unused-vars
    let [unused, value] = utils$3.splitByDelimeter(this.hostRow || '', ':');
    if (this.opts.mandatoryHost) {
      validators$3.validateNotEmptyString(value, 'host header value');
    }

    this.host = value;
  }

  _parseStartRow() {
    if (!consts$5.regexps.requestStartRow.test(this.startRow)) {
      throw HttpZError$4.get('Incorrect startRow format, expected: Method request-target HTTP-Version', this.startRow)
    }

    let rowElems = this.startRow.split(' ');
    this.method = rowElems[0].toUpperCase();
    this.protocolVersion = rowElems[2].toUpperCase();
    this.url = rowElems[1];

    let parsedUrl = _$5.attempt(utils$3.parseUrl.bind(null, this.url, SUPER_RANDOM_HOST));
    if (_$5.isError(parsedUrl)) {
      throw HttpZError$4.get('Invalid target', this.url)
    }

    if (!this.host) {
      this.host = parsedUrl.host !== SUPER_RANDOM_HOST ? parsedUrl.host : 'unspecified-host';
    }
    this.path = parsedUrl.path;
    this.queryParams = parsedUrl.params;
  }

  _parseCookiesRow() {
    if (!this.cookiesRow) {
      return
    }

    let [cookieHeaderName, values] = utils$3.splitByDelimeter(this.cookiesRow, ':');
    if (!cookieHeaderName) {
      throw HttpZError$4.get('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow)
    }
    if (!values) {
      this.cookies = [];
      return
    }
    this.cookies = _$5.chain(values)
      .split(';')
      .map(pair => {
        let [name, value] = utils$3.splitByDelimeter(pair, '=');
        let cookie = {
          name
        };
        if (value) {
          cookie.value = value;
        }
        if (!cookie.name) {
          throw HttpZError$4.get('Incorrect cookie pair format, expected: Name1=Value1;...', values)
        }
        return cookie
      })
      .value();
  }

  _generateModel() {
    let model = {
      method: this.method,
      protocolVersion: this.protocolVersion,
      url: this.url,
      host: this.host,
      path: this.path,
      headersSize: this.headersSize,
      bodySize: this.bodySize
    };
    if (this.queryParams) {
      model.queryParams = this.queryParams;
    }
    if (this.headers) {
      model.headers = this.headers;
    }
    if (this.cookies) {
      model.cookies = this.cookies;
    }
    if (this.body) {
      model.body = this.body;
    }

    return model
  }
}

var request$1 = HttpZRequestParser;

const _$4 = require$$0;
const consts$4 = consts$8;
const HttpZError$3 = error;
const utils$2 = utils$6;
const Base$2 = base$1;

class HttpZResponseParser extends Base$2 {
  static parse(...params) {
    let instance = new HttpZResponseParser(...params);
    return instance.parse()
  }

  parse() {
    this._parseMessageForRows();
    this._parseStartRow();
    this._parseHeaderRows();
    this._parseCookieRows();
    this._parseBodyRows();

    return this._generateModel()
  }

  _parseMessageForRows() {
    let { startRow, headerRows, bodyRows } = super._parseMessageForRows();

    this.startRow = startRow;
    this.headerRows = headerRows;
    this.cookieRows = _$4.filter(headerRows, row => _$4.chain(row).toLower().startsWith('set-cookie').value());
    this.bodyRows = bodyRows;
  }

  _parseStartRow() {
    if (!consts$4.regexps.responseStartRow.test(this.startRow)) {
      throw HttpZError$3.get('Incorrect startRow format, expected: HTTP-Version status-code reason-phrase', this.startRow)
    }

    let rowElems = this.startRow.split(' ');
    this.protocolVersion = rowElems[0].toUpperCase();
    this.statusCode = +rowElems[1];
    this.statusMessage = rowElems.splice(2).join(' ');
  }

  _parseCookieRows() {
    if (_$4.isEmpty(this.cookieRows)) {
      return
    }

    // eslint-disable-next-line max-statements
    this.cookies = _$4.map(this.cookieRows, cookiesRow => {
      // eslint-disable-next-line no-unused-vars
      let [unused, values] = utils$2.splitByDelimeter(cookiesRow, ':');
      if (!values) {
        return {}
      }
      let params = _$4.split(values, ';');
      let paramWithName = _$4.head(params);
      let otherParams = _$4.tail(params);

      let [name, value] = _$4.split(paramWithName, '=');
      name = _$4.trim(name);
      value = _$4.trim(value);
      if (!name) {
        throw HttpZError$3.get('Incorrect set-cookie pair format, expected: Name1=Value1;...', values)
      }

      let cookie = {
        name
      };
      if (value) {
        cookie.value = value;
      }
      if (otherParams.length > 0) {
        cookie.params = _$4.map(otherParams, p => _$4.trim(p));
      }

      return cookie
    });
  }

  _generateModel() {
    let model = {
      protocolVersion: this.protocolVersion,
      statusCode: this.statusCode,
      statusMessage: this.statusMessage,
      headersSize: this.headersSize,
      bodySize: this.bodySize
    };
    if (this.headers) {
      model.headers = this.headers;
    }
    if (this.cookies) {
      model.cookies = this.cookies;
    }
    if (this.body) {
      model.body = this.body;
    }

    return model
  }
}

var response$1 = HttpZResponseParser;

const _$3 = require$$0;
const consts$3 = consts$8;
const HttpZError$2 = error;
const RequestParser = request$1;
const ResponseParser = response$1;

var parsers = (rawMessage, opts = {}) => {
  if (_$3.isNil(rawMessage)) {
    throw HttpZError$2.get('rawMessage is required')
  }
  if (!_$3.isString(rawMessage)) {
    throw HttpZError$2.get('rawMessage must be a string')
  }

  let firstRow = _$3.chain(rawMessage).split(consts$3.EOL).head().value();
  if (consts$3.regexps.requestStartRow.test(firstRow)) {
    return RequestParser.parse(rawMessage, opts)
  }
  if (consts$3.regexps.responseStartRow.test(firstRow)) {
    return ResponseParser.parse(rawMessage)
  }
  throw HttpZError$2.get('rawMessage has incorrect format')
};

const _$2 = require$$0;
const consts$2 = consts$8;
const utils$1 = utils$6;
const validators$2 = validators$4;

class HttpZBaseBuilder {
  constructor({ headers, body }) {
    this.headers = headers;
    this.body = body;
  }

  _generateHeaderRows() {
    validators$2.validateArray(this.headers, 'headers');

    if (_$2.isEmpty(this.headers)) {
      return ''
    }

    let headerRowsStr = _$2.chain(this.headers)
      .map((header, index) => {
        validators$2.validateNotEmptyString(header.name, 'header name', `header index: ${index}`);
        validators$2.validateString(header.value, 'header.value', `header index: ${index}`);

        let headerName = utils$1.pretifyHeaderName(header.name);
        let headerValue = header.value;

        return headerName + ': ' + headerValue
      })
      .join(consts$2.EOL)
      .value();

    return headerRowsStr + consts$2.EOL
  }

  _generateBodyRows() {
    if (_$2.isEmpty(this.body)) {
      return ''
    }

    if (this.opts?.use_content_type == false) {
      return this._generateTextBody()
    }

    switch (this.body.contentType) {
      case consts$2.http.contentTypes.multipart.formData:
      case consts$2.http.contentTypes.multipart.alternative:
      case consts$2.http.contentTypes.multipart.mixed:
      case consts$2.http.contentTypes.multipart.related:
        return this._generateFormDataBody()
      case consts$2.http.contentTypes.application.xWwwFormUrlencoded:
        return this._generateUrlencodedBody()
      default:
        return this._generateTextBody()
    }
  }

  _generateFormDataBody() {
    validators$2.validateArray(this.body.params, 'body.params');
    validators$2.validateNotEmptyString(this.body.boundary, 'body.boundary');

    if (_$2.isEmpty(this.body.params)) {
      return ''
    }

    // eslint-disable-next-line max-statements
    let paramsStr = _$2.map(this.body.params, (param, index) => {
      if (!param.type) {
        validators$2.validateNotEmptyString(param.name, 'body.params[index].name', `param index: ${index}`);
      }
      let paramGroupStr = '--' + this.body.boundary;
      paramGroupStr += consts$2.EOL;
      paramGroupStr += `Content-Disposition: ${param.type || 'form-data'}`;
      if (param.name) {
        paramGroupStr += `; name="${param.name}"`;
      }
      if (param.fileName) {
        paramGroupStr += `; filename="${param.fileName}"`;
      }
      paramGroupStr += consts$2.EOL;
      if (param.contentType) {
        paramGroupStr += `Content-Type: ${param.contentType}`;
        paramGroupStr += consts$2.EOL;
      }
      paramGroupStr += consts$2.EOL;
      paramGroupStr += utils$1.getEmptyStringForUndefined(param.value);
      paramGroupStr += consts$2.EOL;
      return paramGroupStr
    }).join('');

    return `${paramsStr}--${this.body.boundary}--`
  }

  _generateUrlencodedBody() {
    validators$2.validateArray(this.body.params, 'body.params');
    let paramPairs = utils$1.convertParamsArrayToPairs(this.body.params);

    return new URLSearchParams(paramPairs).toString()
  }

  _generateTextBody() {
    return utils$1.getEmptyStringForUndefined(this.body.text)
  }
}

var base = HttpZBaseBuilder;

const _$1 = require$$0;
const consts$1 = consts$8;
const validators$1 = validators$4;
const utils = utils$6;
const HttpZError$1 = error;
const Base$1 = base;

class HttpZRequestBuilder extends Base$1 {
  static build(...params) {
    let instance = new HttpZRequestBuilder(...params);
    return instance.build()
  }

  constructor({ method, protocolVersion, url, headers, body }, opts) {
    super({ headers, body });
    this.method = method;
    this.protocolVersion = protocolVersion;
    this.url = url;
    this.opts = opts;
  }

  build() {
    return '' + this._generateStartRow() + this._generateHeaderRows() + consts$1.EOL + this._generateBodyRows()
  }

  _generateStartRow() {
    validators$1.validateNotEmptyString(this.method, 'method');
    validators$1.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
    validators$1.validateNotEmptyString(this.url, 'url');

    return '' + this.method.toUpperCase() + ' ' + this.url + ' ' + this.protocolVersion.toUpperCase() + consts$1.EOL
  }

  _generateHeaderRows() {
    validators$1.validateArray(this.headers, 'headers');
    if (this.opts.mandatoryHost) {
      let hostHeader = _$1.find(this.headers, name => utils.pretifyHeaderName(name) === consts$1.http.headers.host);
      if (!hostHeader) {
        throw HttpZError$1.get('Host header is required')
      }
    }

    return super._generateHeaderRows()
  }
}

var request = HttpZRequestBuilder;

const consts = consts$8;
const validators = validators$4;
const Base = base;

class HttpZResponseBuilder extends Base {
  static build(...params) {
    let instance = new HttpZResponseBuilder(...params);
    return instance.build()
  }

  constructor({ protocolVersion, statusCode, statusMessage, headers, body }) {
    super({ headers, body });
    this.protocolVersion = protocolVersion;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }

  build() {
    return '' + this._generateStartRow() + this._generateHeaderRows() + consts.EOL + this._generateBodyRows()
  }

  _generateStartRow() {
    validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
    validators.validatePositiveNumber(this.statusCode, 'statusCode');
    validators.validateNotEmptyString(this.statusMessage, 'statusMessage');

    let protocolVersion = this.protocolVersion.toUpperCase();
    return `${protocolVersion} ${this.statusCode} ${this.statusMessage}` + consts.EOL
  }
}

var response = HttpZResponseBuilder;

const _ = require$$0;
const HttpZError = error;
const RequestBuilder = request;
const ResponseBuilder = response;

var builders = (messageModel, opts = {}) => {
  if (_.isNil(messageModel)) {
    throw HttpZError.get('messageModel is required')
  }
  if (!_.isPlainObject(messageModel)) {
    throw HttpZError.get('messageModel must be a plain object')
  }
  if (messageModel.method) {
    return RequestBuilder.build(messageModel, opts)
  }
  if (messageModel.statusCode) {
    return ResponseBuilder.build(messageModel)
  }
  throw HttpZError.get('messageModel has incorrect format')
};

export var httpZ = {
  consts: consts$8,
  HttpZError: error,
  utils: utils$6,
  parse: parsers,
  build: builders
};

