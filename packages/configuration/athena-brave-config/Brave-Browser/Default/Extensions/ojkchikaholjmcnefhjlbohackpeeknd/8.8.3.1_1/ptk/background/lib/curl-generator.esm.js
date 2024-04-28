// slash for connecting previous breakup line to current line for running cURL directly in Command Prompt
var slash = " \\";
var newLine = "\n";
/**
 * @param {string} [method]
 * @returns {string}
 */
var getCurlMethod = function (method) {
    var result = "";
    if (method) {
        var types = {
            GET: "-X GET",
            POST: "-X POST",
            PUT: "-X PUT",
            PATCH: "-X PATCH",
            DELETE: "-X DELETE",
        };
        result = " " + types[method.toUpperCase()];
    }
    return slash + newLine + result;
};
/**
 * @param {StringMap} headers
 * @returns {string}
 */
var getCurlHeaders = function (headers) {
    var result = "";
    if (headers) {
        Object.keys(headers).map(function (val) {
            result += "" + slash + newLine + "-H \"" + val + ": " + headers[val].replace(/(\\|")/g, "\\$1") + "\"";
        });
    }
    return result;
};
/**
 * @param {Object} body
 * @returns {string}
 */
var getCurlBody = function (body) {
    var result = "";
    if (body) {
        if (body.params) {
            result += "" + slash + newLine + "-d \"" + body.params.map(x => `${x.name}=${x.value}`).join('&').replace(/(\\|")/g, "\\$1") + "\"";
        } else if (body.text) {
            result += "" + slash + newLine + "-d \"" + body.text.replace(/(\\|")/g, "\\$1") + "\"";
        }
    }
    return result;
};
/**
 * Given the curl additional options, turn them into curl syntax
 * @param {CurlAdditionalOptions} [options]
 * @returns {string}
 */
var getCurlOptions = function (options) {
    var result = "";
    if (options) {
        Object.keys(options).forEach(function (key) {
            var kebabKey = key.replace(/[A-Z]/g, function (letter) { return "-" + letter.toLowerCase(); });
            if (!options[key]) {
                throw new Error("Invalid Curl option " + key);
            }
            else if (typeof options[key] === "boolean" && options[key]) {
                // boolean option, we just add --opt
                result += "--" + kebabKey + " ";
            }
            else if (typeof options[key] === "string") {
                // string option, we have to add --opt=value
                result += "--" + kebabKey + " " + options[key] + " ";
            }
        });
    }
    return result ? "" + slash + newLine + result : result;
};
/**
 * @param {CurlRequest} params
 * @param {CurlAdditionalOptions} [options]
 * @returns {string}
 */
var CurlGenerator = function (params, options) {
    var curlSnippet = "curl ";
    curlSnippet += params.url;
    curlSnippet += getCurlMethod(params.method);
    curlSnippet += getCurlHeaders(params.headers);
    curlSnippet += getCurlBody(params.body);
    curlSnippet += getCurlOptions(options);
    return curlSnippet.trim();
};

export { CurlGenerator };
