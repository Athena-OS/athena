import { ptk_utils } from "../../../background/utils.js"
import { ptk_decoder } from "../../../background/decoder.js"
const decoder = new ptk_decoder()


$('#attack_details_dialog_wrapper').prepend(

    `
    <div id="attack_details" class="ui fullscreen modal coupled" style="display: none; height: 83%">
        <i class="close icon"></i>
        <div class="ui header" id="attack_name"></div>
        <div class="content" style="min-height: 400px; overflow: scroll;height: 90%; padding: 2px 7px 2px 2px;scrollbar-width: none;">
            <form class="ui tiny form controls" id="attack_details_form">
                <input type="hidden" id="attack_target" name="request_url">
                <div class="fields" style="min-height: 65%;margin-bottom: 4px;">
                    <div class="eight wide field" style="padding-right: 1px;">
                        <div class="ui large label"
                            style="position: fixed;z-index: 1; height: 34px; padding-top: 10px;margin-top: -2px;min-width: 50%">
                            Request
                            <div class="ui mini icon secondary button send_rbuilder" style="position: absolute;top: 0px;right: -8px;z-index: 1;">
                                <i class=" wrench large icon" title="Send to R-Builder"></i>
                            </div>
                        </div>
                        <textarea readonly id="raw_request" class="ui large input" rows="5" placeholder="Request"
                            style="scrollbar-width: none;"></textarea>
                        

                 
                    </div>
                    <div class="eight wide field response_view" style="padding-right: 1px;">

                            <div class="ui large label"
                                style="position: fixed;z-index: 1; height: 34px; padding-top: 10px;margin-top: -2px;min-width: -webkit-fill-available;min-width: -moz-available;">
                                Response
                                
                                <div class="ui small secondary buttons"
                                    style="position: absolute;top: 0px;right: 0px;z-index: 1;">
                                    <div class="ui button showHtml">HTML</div>
                                    <div class="ui floating dropdown icon button">
                                        <i class="dropdown icon"></i>
                                        <div class="menu">
                                            <div class="item showHtmlNew"><i class="external square alternate icon"></i>
                                                Open in new window
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            <textarea readonly id="raw_response" name="response_body" class="ui large input" rows="25"
                                placeholder="Response" style="height: 100%; padding-top: 35px;scrollbar-width: none;"
                                autofocus></textarea>

                    </div>
                </div>

                <div class="ui segment" style="padding: 0px;margin-right: -4px;margin-top: 0px;min-height: 35%;">
                    <div class="ui top attached tabular menu small metadata" style="background-color: #e8e8e8;">
                        <a class="item active" data-tab="first">Description</a>
                        <a class="item" data-tab="second">Recommendation</a>
                        <a class="item" data-tab="third">Links</a>
                    </div>
                    <div class="ui bottom attached tab segment small active" data-tab="first" style="min-height: 75%;">
                        <div id="attack_description"></div>
                    </div>
                    <div class="ui bottom attached tab segment small" data-tab="second" style="min-height: 75%;">
                        <div id="attack_recommendation"></div>
                    </div>
                    <div class="ui bottom attached tab segment small" data-tab="third" style="min-height: 75%;">
                        <div class="ui middle aligned divided list" id="attack_links">
                        </div>
                    </div>
                </div>


            </form>
        </div>
    </div>
    <div id="dialogResponseHtml" class="ui fullscreen modal coupled" style="display: none;height: 83%">
        <i class="close icon"></i>
        <div class="header">HTML response</div>
        
        <div class="content" id="dialogResponseHtmlContent" style="min-height: 400px;height: 90%;padding:0px">
            <object id="dialogResponseHtmlContentObj" data="" style="overflow:hidden;height:100%;width:100%; min-height: 400px;" height="100%"></object>
        </div>
    </div>
    `
)


export function sortAttacks() {
    $(".attack_info")
        .sort((a, b) => $(a).data("order") - $(b).data("order"))
        .appendTo("#attacks_info");
}

export function getMisc(info) {
    let icon = '', attackClass = 'nonvuln', order = 3

    if (info.success) {
        attackClass = 'vuln success visible ' + info.metadata.severity
        let iconClass = ""
        if (info.metadata.severity == 'High') {
            iconClass = "red"
            order = 0
        }
        if (info.metadata.severity == 'Medium') {
            iconClass = "orange"
            order = 1
        }
        if (info.metadata.severity == 'Low') {
            iconClass = "yellow"
            order = 2
        }

        icon = `<div ><i class="exclamation triangle ${iconClass} icon" ></i><b>Vulnerability detected</b></div>`

    }
    return {
        icon: icon,
        order: order,
        attackClass: attackClass
    }
}

export function bindAttack(info, original, index, requestId = -1) {
    let proof = ''

    let misc = getMisc(info)
    let icon = misc.icon, order = misc.order, attackClass = misc.attackClass

    if (info.proof)
        proof = `<div class="description"><p>Proof: <b><i name="proof">${ptk_utils.escapeHtml((info.proof))}</i></b></p></div>`

    let target = original?.request?.url ? original.request.url : ""
    let item = `
                <div class="ui message attack_info ${attackClass} ${requestId}" style="position:relative;margin-top: 0;" data-order="${order}">
                ${icon}
                <div class="description">
                    <p>Attack: ${ptk_utils.escapeHtml(info.metadata.name)}</p>
                </div>
                <div class="description">
                    <p>URL: <a href="${target}" target="_blank">${target}</a></p>
                </div>
                ${proof}
                <div class="ui left floated">
                    <a href="#" class="attack_details" data-requestId="${requestId}" data-index="${index}">Details</a>
                </div>
                </div>`

    return item
}

let editor
export function bindAttackDetails(el, attack, original) {
    let proof = attack.proof
    let response = attack.response?.body ? attack.response.body : original.response.body
    let request = attack.request?.raw ? attack.request.raw : original.request.raw
    let description = attack.metadata.description
    let recommendation = attack.metadata.recommendation
    let name = attack.metadata.name

    let misc = getMisc(attack)
    let icon = misc.icon



    $('#raw_response').val(response)
    $('#attack_description').text(description)
    $('#attack_recommendation').html(recommendation)
    $('#attack_target').val(original?.request?.url)



    $('#attack_name').html(icon + name)

    let links = ""
    let keys = Object.keys(attack.metadata.links)
    for (let i = 0; i < keys.length; i++) {
        links += `
        <div class="item">
            <div class="content">
            <a class="header" target="_blank" href="${attack.metadata.links[keys[i]]}">${keys[i]}</a>
            <div class="description"><a class="header" target="_blank" href="${attack.metadata.links[keys[i]]}">${attack.metadata.links[keys[i]]}</a></div>
            </div>
        </div>
        `
    }
    $('#attack_links').html(links)

    $('#attack_details').modal('show')
    setTimeout(function () {
        let index = $('#raw_response').val().indexOf(proof)
        $('#raw_response').scrollTop(0)
        if (index > -1) {
            let text = $('#raw_response').val()
            let textBeforePosition = text.substr(0, index)
            $('#raw_response').trigger('blur')
                .val(textBeforePosition)
                .trigger('focus')
                .val(text)
                .trigger('scroll')
                .selectRange(index, index + proof.length)
            $('#raw_response').scrollTop(($('#raw_response').scrollTop() + $('#raw_response').height() / 2))
        }
    }, 100)


    $('#raw_request').val(request)

    if (editor) editor.toTextArea()
    editor = CodeMirror.fromTextArea(document.getElementById('raw_request'), {
        lineNumbers: false, lineWrapping: true, indentUnit: 4, mode: "message/http"
    })
    editor.getDoc().setValue(request)
    editor.setSize('101.5%', '100%')
    editor.setCursor({ line: 1, ch: 1 })


    return false
}

export function showHtml(obj, newWin = false) {
    let formId = obj.closest('.ui.tab.active').attr('id'), target = ""
    if (formId) {
        let $form = $('#' + formId + ' #request_form'), values = $form.form('get values')
        target = (new URL(values['request_url'])).origin
    } else {
        let $form = $('#attack_details_form'), values = $form.form('get values')
        target = (new URL(values['request_url'])).origin
    }
    let htmlString = obj.closest('.response_view').find('[name="response_body"]').val()
    htmlString = htmlString.replace(/<([^<])*(head)([^>])*>/, "<$1$2><base href='" + target + "' />")
    //let dataBase64 = 'data:text/html;base64,' + decoder.base64_encode(htmlString)
    //let blob = new Blob([unescape(encodeURIComponent(htmlString))], { type: 'text/html' })
    let url = 'showhtml.html?s=' + decoder.base64_encode(encodeURI(htmlString))

    if (newWin) {
        browser.windows.create({
            url: browser.runtime.getURL("/ptk/browser/" + url)
        })
    } else {
        $('#dialogResponseHtml').modal('show')
        $('#dialogResponseHtmlContentObj').prop('data', url)
    }
    return false
}

export class curl2object{
    static curlType = Object.freeze({
        PARAMS: 'params',
        HEADERS: 'headers',
        BODY: 'body',
        URL: 'url',
    })

    constructor() { 
        this.backslashRegex = /\\/gi
        this.newLineRegex = /\\n/gi
    }
    
    // let us parse params 

    
    parser (parse, command) {
        command = command.replace(this.backslashRegex, '')
        let object = {};
        let _command = command;
        let rx1, rx2, rx3;
        let _splitXXX, _each, _url;
        switch (parse) {
            case curl2object.curlType.PARAMS:
                rx1 = /-X/gi;
                rx2 = /-d/gi;
                rx3 = /-H/gi;
                _command = _command.replace(rx1, 'XXX')
                _command = _command.replace(rx2, 'XXX')
                _command = _command.replace(rx3, 'XXX')
                // split by XXX
                _splitXXX = _command.split("XXX");
                _splitXXX.map(each => {
                    _each = each.replace(this.newLineRegex, '');
                    if (_each.includes('-P')) {
                        let paramsArr = _each.split('-P').slice(1,);
                        paramsArr.map(param => {
                            _param = JSON.parse(param);
                            _param = _param.split(":");
                            object[_param[0]] = _param[1];
                        })
                    };
                });
                return object;
            case curl2object.curlType.HEADERS:
                rx1 = /-X/gi;
                rx2 = /-d/gi;
                rx3 = /-P/gi;
                _command = _command.replace(rx1, 'XXX')
                _command = _command.replace(rx2, 'XXX')
                _command = _command.replace(rx3, 'XXX')
                // split by XXX
                _splitXXX = _command.split("XXX");
                _splitXXX.map(each => {
                    _each = each.replace(this.newLineRegex, '');
                    if (_each.includes('-H')) {
                        let headersArr = _each.split('-H').slice(1,);
                        headersArr.map(header => {
                            _header = JSON.parse(header);
                            _header = _header.split(":");
                            object[_header[0]] = _header[1];
                        })
                    };
                });
                return object;
            case curl2object.curlType.BODY:
                rx1 = /-X/gi;
                rx2 = /-H/gi;
                rx3 = /-P/gi;
                _command = _command.replace(rx1, 'XXX')
                _command = _command.replace(rx2, 'XXX')
                _command = _command.replace(rx3, 'XXX')
                // split by XXX
                _splitXXX = _command.split("XXX");
                _splitXXX.map(each => {
                    _each = each.replace(this.newLineRegex, '');
                    if (_each.includes('-d')) {
                        let bodyArr = _each.split('-d').slice(1,);
                        bodyArr.map(body => {
                            object['body'] = body;
                        })
                    };
                });
                return object;
            case curl2object.curlType.URL:
                rx1 = /-d/gi;
                rx2 = /-H/gi;
                rx3 = /-P/gi;
                _command = _command.replace(rx1, 'XXX')
                _command = _command.replace(rx2, 'XXX')
                _command = _command.replace(rx3, 'XXX')
                // split by XXX
                _splitXXX = _command.split("XXX");
                _splitXXX.map(each => {
                    _each = each.replace(this.newLineRegex, '');
                    if (_each.includes('-X')) {
                        let urlArr = _each.split('-X').slice(1,);
                        urlArr.map(url => {
                            _url = url.trim().split(" ");
                            object['method'] = _url[0];
                            object['url'] = _url[1];
                        })
                    };
                });
                return object;
            default:
                return object;
        }
    }
}




// export function parseCurl(s, clean) {
//     if (0 != s.indexOf('curl ')) throw Error('Missing curl keyword');
//     var out = { method: 'GET', headers: {} };
//     var state = '';
//     var urlParams = '';
//     var fallbackUrl = '';
//     var formString = '';
//     rewrite(split(s)).forEach(function (arg) {
//         switch (true) {
//             case !out.url && matchUrl.test(arg):
//                 out.url = arg;
//                 break;

//             case arg == '-A' || arg == '--user-agent':
//                 state = 'user-agent';
//                 break;

//             case arg == '-H' || arg == '--header':
//                 state = 'header';
//                 break;

//             case arg == '-F' || arg == '--form' || arg == '--form-data':
//                 state = 'form';
//                 break;

//             case arg == '--form-string':
//                 state = 'form-string';
//                 break;

//             case arg == '-d' || arg == '--data' || arg == '--data-ascii' || arg == '--data-binary':
//                 state = 'data';
//                 break;

//             case arg == '--data-urlencode':
//                 state = 'url';
//                 break;

//             case arg == '-u' || arg == '--user':
//                 state = 'user';
//                 break;

//             case arg == '-I' || arg == '--head':
//                 out.method = 'HEAD';
//                 break;

//             case arg == '-X' || arg == '--request':
//                 state = 'method';
//                 break;

//             case arg == '-b' || arg == '--cookie':
//                 state = 'cookie';
//                 break;

//             case arg == '--compressed':
//                 out.headers['Accept-Encoding'] || (out.headers['Accept-Encoding'] = 'deflate, gzip');
//                 break;

//             case !!arg:
//                 switch (state) {
//                     case 'header':
//                         var delimIndex = arg.indexOf(':');
//                         var headerKey = arg.slice(0, delimIndex).split('-').map(capitalize).join('-');

//                         if (headerKey === 'Cookie') {
//                             out.credentials = 'include';
//                         } else {
//                             out.headers[headerKey] = arg.slice(delimIndex + 1).trim();
//                         }
//                         state = '';
//                         break;
//                     case 'user-agent':
//                         out.headers['User-Agent'] = arg;
//                         state = '';
//                         break;
//                     case 'url':
//                         urlParams = addArg(urlParams, arg);
//                         state = '';
//                         break;
//                     case 'data':
//                     case 'data-binary':
//                         out.headers['Content-Type'] || (out.headers['Content-Type'] = 'application/x-www-form-urlencoded');
//                         out.body = state === 'data' ? addArg(out.body, arg) : out.body;
//                         state = '';
//                         break;
//                     case 'form-string':
//                         formString = arg;
//                         break;
//                     case 'form':
//                         out.headers['Content-Type'] || (out.headers['Content-Type'] = 'multipart/form-data'); (out.formData || (out.formData = [])).push([arg.slice(0, arg.indexOf('=')), arg.slice(arg.indexOf('=') + 1)]);
//                         break;
//                     case 'user':
//                         out.headers['Authorization'] = 'Basic ' + btoa(arg);
//                         state = '';
//                         break;
//                     case 'method':
//                         out.method = arg;
//                         state = '';
//                         break;
//                     case 'cookie':
//                         out.headers['Set-Cookie'] = arg;
//                         state = '';
//                         break;
//                 }
//                 break;
//             default:
//                 fallbackUrl = arg;
//                 break;
//         }
//     });

//     if (urlParams) {
//         out.url = out.url + (parseUrl(out.url).search ? '&' : '?') + urlParams;
//     }

//     var forbiddenKeys = forbidden.filter(function (key) {
//         return key in out.headers;
//     }).map(function (key) {
//         delete out.headers[key]; return key;
//     });

//     if (forbiddenKeys.length) {
//         var msg = forbiddenKeys.length > 1 ? forbiddenKeys.join(', ') + " are forbidden headers" : forbiddenKeys + " is a forbidden header";
//         console.log(msg + " in fetch, so they are skipped (see https://fetch.spec.whatwg.org/#terminology-headers)");
//     }

//     if (formString) {
//         out.headers['Content-Type'] += '; boundary=' + formString;
//     }

//     if (clean) {
//         // http2 pseudo header
//         delete out.headers.Authority;
//         delete out.headers.Scheme;
//         delete out.headers.Method;
//         delete out.headers.Path;
//         // automaticaly added
//         delete out.headers['Accept-Language'];
//         delete out.headers['User-Agent'];
//     }

//     if (out.body && out.method.toLowerCase() === 'get') {
//         out.method = 'POST';
//     }

//     return out;
// }

// export function rewrite(baseArgs) {
//     return baseArgs.reduce(function (args, a) {
//         if (a.indexOf('-X') === 0) {
//             args.push('-X');
//             args.push(a.slice(2));
//         } else {
//             args.push(a);
//         }

//         return args;
//     }, []);
// }

// export function scan(str, pattern, callback) {
//     var result = "";
//     while (str.length > 0) {
//         var match = str.match(pattern);
//         if (match) {
//             result += str.slice(0, match.index);
//             result += callback(match);
//             str = str.slice(match.index + match[0].length);
//         } else {
//             result += str;
//             str = "";
//         }
//     }
// };

// export function split(line) {
//     var splitReg = /\s*(?:([^\s\\\'\"]+)|'((?:[^\'\\]|\\.)*)'|"((?:[^\"\\]|\\.)*)"|(\\.?)|(\S))(\s|$)?/;
//     if (line === undefined) line = "";

//     var words = [];
//     var field = "";
//     scan(line, splitReg, function (_ref) {
//         var _ref2 = _slicedToArray(_ref, 7),
//             raw = _ref2[0],
//             word = _ref2[1],
//             sq = _ref2[2],
//             dq = _ref2[3],
//             escape = _ref2[4],
//             garbage = _ref2[5],
//             seperator = _ref2[6];

//         if (garbage !== undefined) throw Error("Unmatched quote");
//         field += word || (sq || dq || escape).replace(/\\(?=.)/, "");
//         if (seperator !== undefined) {
//             words.push(field);
//             field = "";
//         }
//     });
//     if (field) {
//         words.push(field);
//     }
//     return words;
// }

// export function _slicedToArray() { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }

// export function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// export function parseUrl(a) {
//     return function (b, c, d) {
//         a.href = b; c = {}; for (d in a) {
//             if ("" + a[d] === a[d]) c[d] = a[d];
//         } return c;
//     };
// }
