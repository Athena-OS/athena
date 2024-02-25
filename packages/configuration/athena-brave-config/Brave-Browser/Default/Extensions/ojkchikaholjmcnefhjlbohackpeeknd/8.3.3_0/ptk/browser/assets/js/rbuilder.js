/* Author: Denis Podgurskii */
import { ptk_controller_rbuilder } from "../../../controller/rbuilder.js"
import { ptk_utils } from "../../../background/utils.js"
import httpZ from "../../../packages/http-z/http-z.es6.js"
import { ptk_decoder } from "../../../background/decoder.js"
const controller = new ptk_controller_rbuilder()

controller.waiting = false
const decoder = new ptk_decoder()

jQuery(function () {



    $(document).on("init_request", function (e, request, formId) {
        if (request && request.requestHeaders) {

            let $form = $('#' + formId + ' #request_form')
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

            $form.form('set values', { 'request': headersStr })
            $(document).trigger("parse_request", formId)
        }
    })

    $(document).on("reset_form", function (e, formId) {
        let $form = $('#' + formId + ' #request_form')
        $form.form('clear')
        $form.form('set values', { 'request': '', 'request_method': 'GET', 'request_protocol': 'http', 'request_redirect': true, 'request_headers_overwrite': true })

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
    })


    $(document).on("parse_request", function (e, formId) {
        let $form = $('#' + formId + ' #request_form')
        let values = $form.form('get values')
        try {
            if (values['request'])
                controller.parseRawRequest(values, formId).then(function (obj) {
                    if (obj) {
                        controller.waiting = true
                        $form.form('set value', 'request_method', obj.request.method)
                        $form.form('set value', 'request_url', obj.request.target)
                        $form.form('set value', 'request_protocol', obj.request.scheme)
                        $form.form('set value', 'request', obj.request.raw)
                        controller.waiting = false
                    }
                }).catch(function (e) {
                    $('#traffic_error_message').text(e)
                    $('.mini.modal').modal('show')
                })

        } catch (e) {
            $('#traffic_error_message').text(e)
            $('.mini.modal').modal('show')
        }
    })

    $(document).on("update_raw_request", function (e, formId) {
        let $form = $('#' + formId + ' #request_form')
        let values = $form.form('get values')
        if (!values.request && !values.request_url) return

        controller.updateRawRequest(values, formId).then(function (obj) {
            controller.waiting = true
            $form.form('set value', 'request_method', obj.request.method)
            $form.form('set value', 'request_url', obj.request.target)
            $form.form('set value', 'request_protocol', obj.request.scheme)
            $form.form('set value', 'request', obj.request.raw)
            controller.waiting = false
        }).catch(function (e) {
            $('#traffic_error_message').text(e)
            $('.mini.modal').modal('show')
        })
    })

    $(document).on("send_request", function (e, index) {
        let formId = 'request_' + index
        let $form = $('#' + formId + ' #request_form'), formIndex = $('#' + formId).attr('index')
        $form.form('set value', 'response_headers', '')
        $form.form('set value', 'response_body', '')
        $form.form('validate form')

        if ($form.form('is valid')) {
            let values = $form.form('get values')
            controller.parseRawRequest(values, formId).then(function (schema) {
                controller.sendRequest(schema, formId).then((result) => {
                    let strHeaders = result.response.statusLine + '\r\n' + result.response.headers.map(x => { return x.name + ": " + x.value }).join('\r\n')
                    $form.form('set value', 'response_headers', strHeaders)
                    $form.form('set value', 'response_body', result.response.body)
                }).catch(function (error) {
                    $('#traffic_error_message').text(error)
                    $('.mini.modal').modal('show')
                })
            })
        }
    })

    $(document).on("scan_request", function (e, formId) {
        $('.ui.sidebar').sidebar('toggle')
        $('.dimmer').show()
        let $form = $('#' + formId + ' #request_form'), formIndex = $('#' + formId).attr('index')
        $form.form('validate form')

        if ($form.form('is valid')) {
            let values = $form.form('get values')
            $('#' + formId + ' .showScanResult').show()
            controller.parseRawRequest(values, formId).then(function (schema) {
                controller.scanRequest(schema, formId)
            })
        }
    })

    $(document).on("add_request", function (event, data) {
        let newIndex = data.index

        let $form = $('#request_' + newIndex + ' #request_form')
        if (!$form.length) {
            let count = $('.tab.request').length + 1

            $("#pagecontent .tab.request").removeClass('active')
            $("#pagecontent .menu_item").removeClass('active')

            let newItem = `<tr style="box-shadow: none;"><td style="padding:0px;border-top: 0px !important;"><div class="ui mini menu_item active button" id="tab_${newIndex}" index="${newIndex}" style="width: 100%;margin-bottom: 1px">${count}<i class="window close icon"></i></div></td></tr>`
            $('.menu_item').last().parent().parent().after(newItem)

            $(".tab.request").last().after($("#request_0").
                clone().
                attr('id', 'request_' + newIndex).
                attr('index', newIndex).
                attr('data-tab', 'tab_' + newIndex)
            )
            $(`#request_${newIndex}  #request_form .showScanResult`).hide()
            $("#request_" + newIndex).addClass('active')
            $(document).trigger("reset_form", 'request_' + newIndex)
        }

        if (data?.request?.raw) {
            $form = $(`#request_${newIndex} #request_form`)
            $form.form('set values', { 'request': data.request.raw })
            if (data.response) {
                $form.form('set values', {
                    'response_headers': (data.response.statusLine + '\r\n' + data.response.headers.map(x => { return x.name + ": " + x.value }).join('\r\n')).trim(),
                    'response_body': data.response.body
                })
            }
            $(document).trigger("parse_request", 'request_' + newIndex)
        }

        if (data?.operation == 'clone') {
            let $formFrom = $('#request_' + data.from + ' #request_form'),
                values = $formFrom.form('get values')
            let $formTo = $('#request_' + newIndex + ' #request_form')
            $formTo.form('set values', { 'request': values['request'] })
            $(document).trigger("parse_request", 'request_' + newIndex)
        }

        if (data?.operation == 'proxy_request') {
            $(document).trigger("init_request", [data.request, "request_" + newIndex])
        }
        if (data?.operation == 'rattacker_request') {
            let $rAttckerForm = $('#request_' + newIndex + ' #request_form')
            $rAttckerForm.form('set values', { 'request': data.request })
            $(document).trigger("parse_request", 'request_' + newIndex)
        }
    })

    $('.settings').on('click', function () {
        $('#request_settings_container').modal("show")
    })

    // $('#closesettings').on('click', function () {
    //     $('#request_settings_container').hide("slow")
    //     $('.request_forms_container').show("slow")
    // })

    $('.send_rbuilder').on("click", function () {
        let request = $('#raw_request').val().trim()
        window.location.href = "rbuilder.html?rawRequest=" + btoa(encodeURIComponent(JSON.stringify(request)))
        return false
    })

    $('#add_request').on('click', function () {
        let newIndex = parseInt($(".tab.request").last().attr('index')) + 1
        $(document).trigger('add_request', { index: newIndex })
    })

    $(document).on("submit", ".tiny.form", function (e) {
        e.preventDefault()
        return false
    })

    $(document).on("click", ".showScanResult", function () {
        resetScanResult()
        let key = $(this).closest('.ui.tab.active').attr('id')
        controller.init().then(function (result) {

            if (result[key].scanResult) {
                $('#' + key + ' #request_form .showScanResult').show()
                bindScanResult(result[key].scanResult)
            }
        })
        $('.ui.sidebar').sidebar('toggle')
    })

    $(document).on("click", ".hideScanResult", function () {
        $('.ui.sidebar').sidebar('hide')
    })

    $(document).on("click", ".copy.icon", function () {
        let index = $(this).closest('.ui.tab.active').attr('id')
        let $form = $('#' + index + ' #request_form'), values = $form.form('get values'),
            text = values['request']
        navigator.clipboard.writeText(text);
    })

    $(document).on("click", ".clone.icon", function () {
        let index = parseInt($('.tab.request').last().attr('index'))
        let from = parseInt($(this).closest('.ui.tab.active').attr('index'))
        $(document).trigger('add_request', { operation: 'clone', index: index + 1, from: from })
    })

    $(document).on("click", ".clear", function () {
        let index = $(this).closest('.ui.tab.active').attr('id')
        controller.clear(index)
        $(document).trigger("reset_form", index)
    })

    $(document).on("click", ".resetall", function () {
        controller.resetAll()
        $('#pagecontent .menu_item').each(function (i, obj) {
            let index = parseInt($(obj).attr('index'))
            $(document).trigger("reset_form", index)
            if (index) {
                $('#tab_' + index).parent().parent().remove()
                $('#request_' + index).remove()
            }
        })
        $("#request_0").addClass('active')
        let $form = $('#request_0 #request_form')
        $form.form('set values', {
            'request': '',
            'response_headers': '',
            'response_body': ''
        })
    })

    $(document).on("click", ".send", function () {
        $(`#request_${$(this).closest('.ui.tab.active').attr('index')}  #request_form .showScanResult`).hide()
        $(document).trigger("send_request", $(this).closest('.ui.tab.active').attr('index'))
    })

    $(document).on("click", ".scan", function () {
        resetScanResult()
        let key = $(this).closest('.ui.tab.active').attr('id')
        $(document).trigger("scan_request", key)
    })

    $(document).on("click", ".window.close.icon", function () {
        let index = $(this).parent().attr('index')
        $('#tab_' + index).parent().parent().remove()
        $('#request_' + index).remove()
        $(".menu_item").removeClass('active')
        $(".tab.request").removeClass('active')
        controller.deleteSavedRequest(`request_${index}`)
        setTimeout(function () {
            $('#tab_0').addClass('active')
            $('#request_0').addClass('active')
        }, 50)
    })

    $(document).on("click", ".menu_item", function () {
        $(".menu_item").removeClass('active')
        $(".tab.request").removeClass('active')
        let index = $(this).attr('index')
        $(`[id='request_${index}']`).addClass('active')
        $(this).addClass('active')
    })

    $(document).on("dblclick", ".menu_item", function () {
        $(this).attr('contentEditable', true)
        $(this).trigger('focus')
    })

    $(document).on("blur", ".menu_item", function () {
        $(this).attr('contentEditable', false)
    })

    $(document).on("click", ".showHtml", function () {
        let formId = $(this).closest('.ui.tab.active').attr('id'),
            $form = $('#' + formId + ' #request_form'),
            values = $form.form('get values')
        let htmlString = $(this).closest('.response_view').find('[name="response_body"]').val()
        htmlString = htmlString.replace(/<(head)(.+)?>/, "<$1$2><base href='" + values['request_url'] + "' />")
        let dataBase64 = 'data:text/html;base64,' + decoder.base64_encode(htmlString)
        //let blob = new Blob([unescape(encodeURIComponent(htmlString))], { type: 'text/html' })

        $('#dialogResponseHtml').modal('show')
        $('#dialogResponseHtmlFrame').prop('src', dataBase64)

        return false
    })

    $(document).on('change', "[name=request_method], [name=request_protocol], [name=request_url]", function (e) {
        if (e.target.value != "" && !controller.waiting) {
            $(document).trigger("update_raw_request", $(this).closest('.ui.tab.active').attr('id'))
        }
    })

    $(document).on('change', "[name=request]", function (e) {
        if (e.target.value != "" && !controller.waiting) {
            $(document).trigger("parse_request", $(this).closest('.ui.tab.active').attr('id'))
        }
    })


    //  Scan handlers //

    $(document).on("bind_stats", function (e, scanResult) {
        $('#attacks_count').text(scanResult.stats.attacksCount)
        $('#vulns_count').text(scanResult.stats.vulnsCount)
        $('#high_count').text(scanResult.stats.high)
        $('#medium_count').text(scanResult.stats.medium)
        $('#low_count').text(scanResult.stats.low)

        return false
    })

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

    $(document).on("click", ".attack_details", function () {
        let proof = decoder.base64_decode($(this).parent().find('[name="proof"]').val()).trim()
        let body = decoder.base64_decode($(this).parent().find('[name="headers"]').val()).trim() + "\r\n\r\n" + decoder.base64_decode($(this).parent().find('[name="body"]').val()).trim()

        $('#raw_request').val(decoder.base64_decode($(this).parent().find('[name="request"]').val()).trim())
        $('#raw_response').val(body)

        $('#attack_details').modal('show')
        let index = $('#raw_response').val().indexOf(proof)
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
        return false;
    })


    controller.init().then(function (result) {
        let newIndex = 0
        Object.keys(result).sort(function (a, b) { return a.split('_')[1] - b.split('_')[1] }).forEach(function (key) {
            newIndex = parseInt(key.split('_')[1])
            $(document).trigger('add_request', { request: result[key].request, response: result[key].response, index: newIndex })
            if (result[key].scanResult) {
                $(`#request_${newIndex}  #request_form .showScanResult`).show()
            }
            newIndex++
        })

        let params = new URLSearchParams(window.location.search)
        if (params.has('requestDetails')) {
            let request = JSON.parse(decodeURIComponent(atob(params.get('requestDetails'))))
            $(document).trigger('add_request', { operation: 'proxy_request', request: request, index: newIndex })
        }
        if (params.has('rawRequest')) {
            let request = JSON.parse(decodeURIComponent(atob(params.get('rawRequest'))))
            $(document).trigger('add_request', { operation: 'rattacker_request', request: request, index: newIndex })

        }
    })
})

function resetScanResult() {
    $('#attacks_info').html("")
    $('#filter_vuln').removeClass('active')
    $('#filter_all').addClass('active')
    $(document).trigger("bind_stats", { stats: { attacksCount: 0, high: 0, medium: 0, low: 0 } })
}

function bindScanResult(result) {
    $('.dimmer').hide()
    if (result) {
        console.log(result)
        $('#attacks_info').html("")
        if (!result.original) {
            $('#attacks_info').html(`<div class="ui medium message attack_info" style="position:relative; margin-top: 0;">Could not execute requests</div>`)
        }

        let high = 0, medium = 0, low = 0
        for (let j = 0; j < result.attacks.length; j++) {
            $("#attacks_info").append(bindAttack(result.attacks[j]))
        }
        $(document).trigger("bind_stats", result)
    }
}

function bindAttack(info) {
    let icon = '', proof = '', attackClass = 'nonvuln'
    let headers = info.response.statusLine + '\n' + info.response.headers.map(x => x.name + ": " + x.value).join('\n')
    if (info.success) {
        attackClass = 'vuln success visible'
        let iconClass = ""
        if (info.attack.severity == 'High') iconClass = "red"
        if (info.attack.severity == 'Medium') iconClass = "orange"
        if (info.attack.severity == 'Low') iconClass = "yellow"


        icon = `<div ><i class="exclamation triangle ${iconClass} icon" ></i><b>Vulnerability detected</b></div>`
        if(info.proof)
            proof = `<div class="description"><p>Proof: <b><i name="proof">${ptk_utils.escapeHtml(info.proof)}</i></b></p></div>`
    }
    let item = `
                <div class="ui medium message attack_info ${attackClass} ${info.requestId}" style="position:relative;    margin-top: 0;">
                ${icon}
                <div class="description">
                    <p>Attack: ${ptk_utils.escapeHtml(info.attack.description)}</p>
                </div>
                <div class="description">
                    <p>URL: <a href="${info.baseUrl}" target="_blank">${info.baseUrl}</a></p>
                </div>
                ${proof}
                <div class="ui left floated">
                <input type="hidden" name="request" value="${decoder.base64_encode(httpZ.build(info.request))}" />
                <input type="hidden" name="proof" value="${decoder.base64_encode(info.proof)}" />
                <input type="hidden" name="headers" value="${decoder.base64_encode(headers)}" />
                <input type="hidden" name="body" value="${decoder.base64_encode(info.response.body)}" />
                    <a href="#" class="attack_details">Details</a>
                </div>
                </div>`

    return item
}

////////////////////////////////////
/* Chrome runtime events handlers */
////////////////////////////////////
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.channel == "ptk_background2popup_rbuilder") {
        if (message.type == "scan completed") {
            //$(document).trigger("bind_stats", message.scanResult)
            //$("#attacks_info").append(bindAttack(message.info))
            console.log(message.scanResult)
            bindScanResult(message.scanResult)
        }
        if (message.type == "attack failed") {
            $('#scan_error_message').text(message.info)
            $('.mini.modal').modal('show')
        }
    }
})