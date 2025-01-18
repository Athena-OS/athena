/* Author: Denis Podgurskii */
import { ptk_controller_rbuilder } from "../../../controller/rbuilder.js"
import { ptk_utils, ptk_jwtHelper } from "../../../background/utils.js"
import { ptk_decoder } from "../../../background/decoder.js"
import * as rutils from "../js/rutils.js"
import { Curl2Json, Json2Curl } from "../../../background/lib/curl.js"


//import { Parser }  from '../../../packages/curl/tree-sitter.js';
// const parser = new Parser();
// parser.init().then(() => { 
//     parser.Language.load('../../../packages/curl/tree-sitter-bash.wasm').then(l => {
//         parser.setLanguage(l);
//     })
//  });

//import * as curlconverter from '../../../packages/curl/index.js';


const controller = new ptk_controller_rbuilder()
controller.waiting = false
const decoder = new ptk_decoder()
const jwtHelper = new ptk_jwtHelper()


class rbuilderUI {

    constructor() {
        this.storage = []
        this.updating = false
        this.initParser()
    }

    async initParser() {
        //         const Parser = window.TreeSitter
        //         await Parser.init();
        //         const parser = new Parser();
        //         const Lang = await Parser.Language.load('../packages/curl/tree-sitter-bash.wasm');
        //         parser.setLanguage(Lang);
        //         const tree = parser.parse(`
        //         curl -X 'POST' \
        //   'http://localhost:3000/api/auth/jwt/weak-key/login' \
        //   -H 'accept: application/json' \
        //   -H 'Content-Type: application/json' \
        //   -d '{
        //   "user": "string",
        //   "password": "string",
        //   "op": "basic"
        // }'`);
        //         console.log(tree.rootNode.toString());

        // let a = curlconverter.toJsonString(`
        //     curl -X 'POST' \
        //         'http://localhost:3000/api/auth/jwt/weak-key/login' \
        //         -H 'accept: application/json' \
        //         -H 'Content-Type: application/json' \
        //         -d '{
        //         "user": "string",
        //         "password": "string",
        //         "op": "basic"
        //         }'`)
        // console.log(a)

    }

    resetForm() {
        let $form = $('#request_form')
        $form.form('clear')
        $form.form('set values', {
            'request': '', 'request_method': 'GET',
            'request_protocol': 'http',
            'override_headers': true,
            'follow_redirect': true,
            'update_content_length': true,
            'use_content_type': true
        })

        $form.form({
            inline: true,
            keyboardShortcuts: false,
            fields: {
                request_method: {
                    identifier: 'request_method',
                    rules: [{ type: 'empty' }]
                },
                request_protocol: {
                    identifier: 'request_protocol',
                    rules: [{ type: 'empty' }]
                },
                request_url: {
                    identifier: 'request_url',
                    rules: [{
                        prompt: 'URL is required',
                        type: 'regExp',
                        value: /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/i,
                    }]
                }
            }
        })
        $('#jwt_btn').hide()
        $('#request_form .showScanResult').hide()
    }

    resetAll() {
        $('.menu_item').each(function (i, obj) {
            $(obj).parent().parent().remove()
        })
        this.resetForm()
    }

    getCurl(key) {
        let r = this.storage[key]
        if (r) {
            let h = []
            let curl = JSON.parse(JSON.stringify(r.request))
            curl.headers.map(item => h[item.name] = item.value)
            curl.headers = h
            return Json2Curl(curl)
        }
    }

    updateRequestTitle(title) {
        let opts = this.getOpts()
        opts['title'] = title
    }

    getOpts() {
        let $form = $('#request_form')
        let values = $form.form('get values')
        let title = ptk_utils.escapeHtml($('.menu_item.active').text())

        return {
            title: (!isNaN(parseFloat(title)) && isFinite(title)) ? "" : title,
            override_headers: values['override_headers'] == 'on' ? true : false,
            follow_redirect: values['follow_redirect'] == 'on' ? true : false,
            update_content_length: values['update_content_length'] == 'on' ? true : false,
            use_content_type: values['use_content_type'] == 'on' ? true : false
        }
    }

    buildFromStorage(storage) {
        this.storage = storage
        let result = this.storage

        $('.menu_item').parent().parent().remove()
        let newIndex = 0, self = this
        Object.keys(result).sort(function (a, b) { return result[a].sort - result[b].sort }).forEach(function (key) {
            newIndex++
            self.addTab(result[key], key)
            if (Object.keys(result).length == newIndex) {
                self.setRawRequest(result[key])
            }
        })
    }

    addTab(item, key) {
        let newIndex = $('.menu_item').length + 1
        let title = item.opts?.title
        let name = title ? title : $('.menu_item').length + 1
        $("#pagecontent .menu_item").removeClass('active')

        let newItem = `<tr style="box-shadow: none;"><td style="padding:0px;border-top: 0px !important;"><div class="ui mini menu_item active button" id="tab_${key}" index="${newIndex}" key="${key}" style="width: 100%;margin-bottom: 1px">${name}<i class="window close icon"></i></div></td></tr>`
        $('.tr_tabs').append(newItem)
        return newIndex
    }

    addNewTab() {
        let newIndex = $('.menu_item').length
        let key = ptk_utils.UUID()
        let name = $('.menu_item').length + 1
        $("#pagecontent .menu_item").removeClass('active')

        let newItem = `<tr style="box-shadow: none;"><td style="padding:0px;border-top: 0px !important;"><div class="ui mini menu_item active button" id="tab_${key}" index="${newIndex}" key="${key}" style="width: 100%;margin-bottom: 1px">${name}<i class="window close icon"></i></div></td></tr>`
        $('.tr_tabs').append(newItem)

        this.resetForm()
        return key
    }

    setRawRequest(item) {
        this.updating = true
        let $form = $('#request_form')

        $form.form('set value', 'request', item.request.raw)
        $form.form('set value', 'request_method', item.request.method)
        $form.form('set value', 'request_url', item.request.url)
        $form.form('set value', 'request_protocol', item.request.scheme)

        $form.form('set values', {
            'override_headers': item.opts.override_headers,
            'follow_redirect': item.opts.follow_redirect,
            'update_content_length': item.opts.update_content_length,
            'use_content_type': item.opts.use_content_type
        })

        let { jwtToken, decodedToken } = jwtHelper.checkToken(item.request.raw)
        if (jwtToken) {
            $('#jwt_btn').show()
        } else {
            $('#jwt_btn').hide()
        }

        if (item.scanResult) {
            $('#request_form .showScanResult').show()
        } else {
            $('#request_form .showScanResult').hide()
        }

        $form.form('set value', 'response_headers', item.response.statusLine + '\r\n' + item.response.headers.map(x => { return x.name + ": " + x.value }).join('\r\n'))
        $form.form('set value', 'response_body', item.response.body)

        this.updating = false
    }

    setRawRequestByKey(key) {
        let item = this.storage[key]
        if (item)
            this.setRawRequest(this.storage[key])
        else
            this.resetForm()
    }

    parseRequest() {
        console.log('parseRequest')
        this.updating = true
        let $form = $('#request_form')
        let values = $form.form('get values')
        let formId = $('.menu_item.active').attr('key')
        if (!formId) {
            formId = this.addNewTab()
        }

        let opts = this.getOpts()
        try {
            if (values['request']) {
                let rawRequest = values['request']

                try {
                    let curlObj = Curl2Json(rawRequest.replace(/\\\r?\n/g, " "))
                    if (curlObj.url && curlObj.method) {
                        rawRequest = `${curlObj.method} ${curlObj.url} HTTP/1.1\r\n`
                        let hKeys = Object.keys(curlObj.headers)
                        for (var i = 0; i < hKeys.length; i++) {
                            rawRequest += `${curlObj.headers[hKeys[i]]}\r\n`
                        }

                        if (curlObj.data?.ascii) {
                            let body = curlObj.data.ascii
                            // try {
                            //     body = JSON.stringify(curlObj.body)
                            // } catch (e) { }
                            rawRequest += `\r\n${body}`
                        }
                    }

                } catch (e) {
                    console.log(e)
                }
                let self = this
                controller.parseRawRequest(rawRequest, opts, formId).then(function (obj) {
                    if (obj) {
                        self.updating = true
                        self.storage[formId] = obj
                        self.setRawRequest(obj)
                        self.updating = false
                    }
                    // let editor = CodeMirror.fromTextArea(document.getElementsByName('request')[0], {
                    //     lineNumbers: false, lineWrapping: false, mode: "message/http",
                    //     scrollbarStyle: null
                    // })
                    // editor.setSize('auto', '100%')
                }).catch(function (e) {
                    $('#traffic_error_message').text(e)
                    $('.mini.modal').modal('show')
                })
            }

        } catch (e) {
            $('#traffic_error_message').text(e)
            $('.mini.modal').modal('show')
        } finally {
            this.updating = false
        }
    }

    updateRawRequest() {
        let $form = $('#request_form')
        let values = $form.form('get values')
        let formId = $('.menu_item.active').attr('key')


        if (!values.request && !values.request_url) return

        let opts = this.getOpts()

        if (values.request.trim() == "") {
            if (!formId) {
                formId = this.addNewTab()
            }
            let target = values.request_protocol + '://' + values.request_url.replace(/^https?:\/\//, '')
            values.request = [`${values.request_method} ${target} HTTP/1.1`, '', ''].join('\r\n')
        }

        let params = {
            'request_method': values.request_method,
            'request_url': values.request_url,
            'request_protocol': values.request_protocol
        }

        let self = this
        controller.parseRawRequest(values['request'], opts, formId).then(function (schema) {
            self.storage[formId] = schema
            controller.updateRawRequest(self.storage[formId], params, opts, formId).then(function (obj) {
                self.updating = true
                self.storage[formId] = obj
                self.setRawRequest(obj)
                self.updating = false
            }).catch(function (e) {
                $('#traffic_error_message').text(e)
                $('.mini.modal').modal('show')
            })
        })
    }

    sendRequest() {
        let formId = $('.menu_item.active').attr('key')
        let $form = $('#request_form')
        $form.form('set value', 'response_headers', '')
        $form.form('set value', 'response_body', '')
        $form.form('validate form')

        if ($form.form('is valid')) {
            controller.sendRequest(this.storage[formId], formId).then((result) => {
                this.storage[formId] = result
                let strHeaders = result.response.statusLine + '\r\n' + result.response.headers.map(x => { return x.name + ": " + x.value }).join('\r\n')
                $form.form('set value', 'response_headers', strHeaders)
                $form.form('set value', 'response_body', result.response.body)
            }).catch(function (error) {
                $('#traffic_error_message').text(error)
                $('.mini.modal').modal('show')
            })
        }
    }

    buildFromDetails(request) {
        if (request && request.requestHeaders) {

            let $form = $('#request_form')
            let path = request.method + ' ' + request.url + ' HTTP/1.1'
            let headersStr = path + '\n' + request.requestHeaders.map(x => x.name + ": " + x.value).join('\n')

            if (request?.requestBody?.formData) {
                let params = Object.keys(request.requestBody.formData).map(function (k) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(request.requestBody.formData[k])
                }).join('&')
                headersStr += "\n\n" + params
            } else if (request?.requestBody?.raw) {
                headersStr += "\n\n" + request.requestBody.raw
            }
            $form.form('set values', {
                'request': headersStr,
                'follow_redirect': true,
                'update_content_length': true,
                'use_content_type': true
            })
            this.parseRequest()
        }
    }

    buildFromRaw(raw) {
        let $form = $('#request_form')
        $form.form('set values', { 'request': raw })
        this.parseRequest()
    }

    resetScanResult() {
        $("#progress_message").hide()
        $('#attacks_info').html("")
        $('#filter_vuln').removeClass('active')
        $('#filter_all').addClass('active')
        this.bindStats({ stats: { attacksCount: 0, vulnsCount: 0, high: 0, medium: 0, low: 0 } })
    }

    bindAttackProgress(message) {
        $("#progress_attack_name").text(message.info.name)
        $("#progress_message").show()
    }

    bindScanResult(key) {
        let result = this.storage[key] ? this.storage[key].scanResult : []
        $("#progress_message").hide()
        if (result) {
            $('#attacks_info').html("")
            if (!result.original) {
                $('#attacks_info').html(`<div class="ui medium message attack_info" style="position:relative; margin-top: 0;">Could not execute requests</div>`)
            }
            for (let j = 0; j < result.attacks?.length; j++) {
                $("#attacks_info").append(rutils.bindAttack(result.attacks[j], result.original, j))
            }
            rutils.sortAttacks()
            this.bindStats(result)
        }
    }

    bindStats(scanResult) {
        $('#attacks_count').text(scanResult.stats.attacksCount)
        $('#vulns_count').text(scanResult.stats.vulnsCount)
        $('#high_count').text(scanResult.stats.high)
        $('#medium_count').text(scanResult.stats.medium)
        $('#low_count').text(scanResult.stats.low)

        if (scanResult.stats.vulnsCount > 0) {
            $('#filter_vuln').trigger("click")
        }
        return false
    }
}

let rbuilder = new rbuilderUI()


jQuery(function () {

    $('.modal.coupled')
        .modal({
            allowMultiple: true
        })

    $(document).on("submit", ".tiny.form", function (e) {
        e.preventDefault()
        return false
    })

    $(document).on("click", ".resetall", function () {
        controller.resetAll()
        rbuilder.resetAll()
    })

    $(document).on('change', "[name=request_method], [name=request_protocol], [name=request_url], [name=override_headers], [name=follow_redirect], [name=update_content_length], [name=use_content_type]", function (e) {
        if (e.target.value != "" && !rbuilder.updating) {
            rbuilder.updateRawRequest()
        }
    })

    $(document).on('change', "[name=request]", function (e) {
        if (e.target.value != "" && !rbuilder.updating) {
            rbuilder.parseRequest()
        }
    })

    $('#add_request').on('click', function () {
        rbuilder.addNewTab()
    })

    $(document).on("click", ".copy_icon", function () {
        let $form = $('#request_form')
        let values = $form.form('get values')
        navigator.clipboard.writeText(values['request']);
    })

    $(document).on("click", ".copy_curl_icon", function () {
        let formId = $('.menu_item.active').attr('key')
        if (formId)
            navigator.clipboard.writeText(rbuilder.getCurl(formId));
    })



    $(document).on("click", ".clone_icon", function () {
        let $form = $('#request_form')
        let values = $form.form('get values')
        rbuilder.addNewTab()
        $form.form('set value', 'request', values['request'])
        rbuilder.parseRequest()
    })

    $(document).on("click", ".send", function () {
        $(`#request_form .showScanResult`).hide()
        rbuilder.sendRequest()
    })

    $(document).on("click", ".window.close.icon", function () {
        let key = $(this).parent().attr('key')
        $(this).parent().parent().parent().remove()
        $(".menu_item").removeClass('active')
        controller.deleteSavedRequest(key).then(result => {
            rbuilder.resetForm()
            rbuilder.buildFromStorage(result)
        })
    })

    $(document).on("click", ".menu_item", function () {
        $(".menu_item").removeClass('active')
        $(this).addClass('active')
        rbuilder.setRawRequestByKey($(this).attr('key'))
    })

    $(document).on("dblclick", ".menu_item", function () {
        $(this).attr('contentEditable', true)
        $(this).trigger('focus')
    })

    $(document).on("blur", ".menu_item", function () {
        $(this).attr('contentEditable', false)
        rbuilder.updateRawRequest()
    })



    //  Scan handlers //

    $('#filter_all').on("click", function () {
        $('.attack_info').show()
        $('#filter_vuln').removeClass('active')
        $('#filter_all').addClass('active')
    })

    $('#filter_vuln').on("click", function () {
        $('.attack_info.nonvuln').hide()
        $('#filter_all').removeClass('active')
        $('#filter_vuln').addClass('active')
    })

    $.fn.selectRange = function (start, end) {
        var e = document.getElementById($(this).attr('id')); // I don't know why... but $(this) don't want to work today :-/
        if (!e) return;
        else if (e.setSelectionRange) { e.focus(); e.setSelectionRange(start, end); } /* WebKit */
        else if (e.createTextRange) { var range = e.createTextRange(); range.collapse(true); range.moveEnd('character', end); range.moveStart('character', start); range.select(); } /* IE */
        else if (e.selectionStart) { e.selectionStart = start; e.selectionEnd = end; }
    };

    $(document).on("click", ".scan", function () {
        rbuilder.resetScanResult()
        $('.ui.sidebar')
            .sidebar('setting', 'transition', 'overlay')
            .sidebar('toggle')
            .sidebar('toggle')
        let $form = $('#request_form')
        $form.form('validate form')
        let key = $('.menu_item.active').attr('key')

        if ($form.form('is valid')) {
            let values = $form.form('get values')
            let opts = rbuilder.getOpts()

            $('.showScanResult').show()
            controller.parseRawRequest(values['request'], opts, key).then(function (schema) {
                controller.scanRequest(schema, key)
            })
        }
    })

    $(document).on("click", ".showScanResult", function () {
        rbuilder.resetScanResult()
        let key = $('.menu_item.active').attr('key')
        rbuilder.bindScanResult(key)
        $('.ui.sidebar')
            .sidebar('setting', 'transition', 'overlay')
            .sidebar('toggle')
            .sidebar('toggle')
    })

    $(document).on("click", ".hideScanResult", function () {
        $('.ui.sidebar')
            .sidebar('setting', 'transition', 'overlay')
            .sidebar('toggle')
            .sidebar('toggle')
    })

    $(document).on("click", ".attack_details", function () {
        $('.metadata .item').tab()
        let key = $('.menu_item.active').attr('key')
        let index = $(this).attr("data-index")
        let request = rbuilder.storage[key]
        let attack = request.scanResult.attacks[index]
        rutils.bindAttackDetails($(this), attack, request.scanResult.original)
        $('.metadata .item').tab('change tab', 'first');
    })

    $('.send_rbuilder').on("click", function () {
        let request = $('#raw_request').val().trim()
        window.location.href = "rbuilder.html?rawRequest=" + btoa(encodeURIComponent(JSON.stringify(request)))
        return false
    })


    $(document).on("click", ".showHtml", function () {
        rutils.showHtml($(this))
    })

    $(document).on("click", ".showHtmlNew", function () {
        rutils.showHtml($(this), true)
    })

    $('.settings').on('click', function () {
        $('#request_settings_container').modal("show")
    })

    $(document).on("click", ".settings.icon", function () {
        let index = parseInt($('.tab.request').last().attr('index'))
        $(this).closest('.ui.tab.active .form').find('.request_settings_container').show()
    })


    // $('#closesettings').on('click', function () {
    //     $('#request_settings_container').hide("slow")
    //     $('.request_forms_container').show("slow")
    // })

    $(document).on("click", "#jwt_btn", function () {
        let index = $(this).closest('.ui.tab.active').attr('id')
        let $form = $('#' + index + ' #request_form'), values = $form.form('get values'),
            text = values['request']
        let { jwtToken, decodedToken } = jwtHelper.checkToken(text)
        if (jwtToken) {
            //Decoded
            let jwt = JSON.parse(decodedToken)
            $('#jwt_header').text(JSON.stringify(jwt['header'], null, 2))
            $('#jwt_payload').text(JSON.stringify(jwt['payload'], null, 2))
            $('#jwt_token').val(jwtToken[0])

        }
        $('#jwt_dlg').modal('show')
    })

    $('.jwt_token_copy').on("click", function () {
        navigator.clipboard.writeText($('#jwt_token').val())
    })



    $('.import_export').on('click', function () {

        controller.init().then(function (result) {
            if (Object.keys(result).length == 0) {
                $('.export_rbuilder_btn').addClass('disabled')
            } else {
                $('.export_rbuilder_btn').removeClass('disabled')
            }
            $('#import_export_dlg').modal('show')
        })

    })

    $('.export_rbuilder_btn').on('click', function () {
        controller.init().then(function (result) {
            if (Object.keys(result).length > 0) {
                let blob = new Blob([JSON.stringify(result)], { type: 'text/plain' })
                let fName = "PTK_rbuilder.json"

                let downloadLink = document.createElement("a")
                downloadLink.download = fName
                downloadLink.innerHTML = "Download File"
                downloadLink.href = window.URL.createObjectURL(blob)
                downloadLink.click()
            }
        })
    })

    $('.import_rbuilder_file_btn').on('click', function (e) {
        $("#import_rbuilder_file_input").trigger("click")
        e.stopPropagation()
        e.preventDefault()
    })

    $("#import_rbuilder_file_input").on('change', function (e) {
        e.stopPropagation()
        e.preventDefault()
        let file = $('#import_rbuilder_file_input').prop('files')[0]
        loadFile(file)
        $('#import_rbuilder_file_input').val(null)
    })

    async function loadFile(file) {
        var fileReader = new FileReader()
        fileReader.onload = function () {
            controller.syncStorage(JSON.parse(fileReader.result)).then(result => {
                rbuilder.buildFromStorage(result)
                $('#import_export_dlg').modal('hide')
            })
        }

        fileReader.onprogress = (event) => {
            if (event.lengthComputable) {
                let progress = ((event.loaded / event.total) * 100);
                console.log(progress);
            }
        }
        fileReader.readAsText(file)
    }

    $('.import_rbuilder_text_btn').on('click', function () {
        let rbuilderJson = JSON.parse($("#import_rbuilder_json").val())
        controller.syncStorage(rbuilderJson).then(result => {
            rbuilder.buildFromStorage(result)
            $('#import_export_dlg').modal('hide')
        })
    })

    controller.init().then(function (result) {
        console.log(result)

        rbuilder.buildFromStorage(result)

        let params = new URLSearchParams(window.location.search)
        if (params.has('requestDetails')) {
            let request = JSON.parse(decodeURIComponent(atob(params.get('requestDetails'))))
            rbuilder.addNewTab()
            rbuilder.buildFromDetails(request)
        }

        if (params.has('rawRequest')) {
            let request = JSON.parse(decodeURIComponent(atob(params.get('rawRequest'))))
            rbuilder.addNewTab()
            rbuilder.buildFromRaw(request)
        }
        $('.ui.dropdown').dropdown({ on: 'click' })
        $('.question').popup()
    })


})


////////////////////////////////////
/* Chrome runtime events handlers */
////////////////////////////////////
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.channel == "ptk_background2popup_rattacker") {
        if (message.type == "attack completed") {
            rbuilder.bindAttackProgress(message)
        }
    }
    if (message.channel == "ptk_background2popup_rbuilder") {
        if (message.type == "scan completed") {
            //bindScanResult(message.scanResult)
            let key = $('.menu_item.active').attr('key')
            rbuilder.storage[key].scanResult = message.scanResult
            rbuilder.bindScanResult(key)
        }
        if (message.type == "attack failed") {
            $('#scan_error_message').text(message.info)
            $('.mini.modal').modal('show')
        }
    }
})