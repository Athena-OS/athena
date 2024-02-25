/* Author: Denis Podgurskii */
import { ptk_controller_rattacker } from "../../../controller/rattacker.js"
import { ptk_controller_rbuilder } from "../../../controller/rbuilder.js"
import { ptk_utils } from "../../../background/utils.js"
import CryptoES from '../../../packages/crypto-es/index.js'
const controller = new ptk_controller_rattacker()
const request_controller = new ptk_controller_rbuilder()


jQuery(function () {

    $(document).on("click", ".scan_request", function () {
        let $form = $('#request_form'),
            values = $form.form('get values')

        request_controller.parseRawRequest(values).then(function (schema) {
            if (schema?.request?.host) {
                controller.runScan(schema)
            } else {
                $('#rattacker_error_message').text("Could not parse request")
                $('#error_dialog').modal('show')
            }
        })
    })


    $(document).on("click", ".generate_report", function () {
        controller.init().then(function (result) {
            let report = ""
            let keys = Object.keys(result.scanResult.items)
            for (let i = 0; i < keys.length; i++) {
                let item = result.scanResult.items[keys[i]]
                for (let j = 0; j < item.attacks.length; j++) {
                    if ($('#filter_all').hasClass("active") || ($('#filter_vuln').hasClass("active") && item.attacks[j].success)) {
                        item.attacks[j].requestId = keys[i]
                        report += bindReportItem(item.attacks[j])
                    } 
                }
            }
            let enc = CryptoES.enc.Base64.stringify(CryptoES.enc.Utf8.parse(report))
            browser.storage.local.set({ "rattacker_report": enc }).then(function (res) {
                browser.windows.create({
                    type: 'popup',
                    url: browser.runtime.getURL("/ptk/browser/report.html?rattacker_report")
                })
            })
            return false
        })
    })

    $(document).on("click", ".run_scan_runtime", function () {
        browser.tabs.query({ currentWindow: true, active: true })
            .then(function (tabs) {
                let c = confirm('Confirm running attacks on:\n' + tabs[0].url)
                if (c) {
                    let h = new URL(tabs[0].url).host
                    controller.runBackroungScan(tabs[0].id, h).then(function (result) {
                        $("#attacks_info").html("")
                        hideRequestForm()
                        hideScanForm(result)
                        bindScanResult(result)

                    })
                }
            })
        return false
    })

    $(document).on("click", ".stop_scan_runtime", function () {
        controller.stopBackroungScan().then(function (result) {
            $("#attacks_info").html("")
            showScanForm()
            bindScanResult(result)
        })
        return false
    })

    $(document).on("click", ".reset", function () {
        $("#request_info").html("")
        $("#attacks_info").html("")
        $('.generate_report').hide()
        let $form = $('#request_form')

        $form.form('set values', {
            'request': "",
        })
        showRequestForm()
        controller.reset().then(function (result) {
            $(document).trigger("bind_stats", result.scanResult)
        })
    })

    $('.send_rbuilder').on("click", function () {
        let request = $('#raw_request').val().trim()
        window.location.href = "rbuilder.html?rawRequest=" + btoa(encodeURIComponent(JSON.stringify(request)))
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


    $(document).on("click", ".attack_details", function () {
        let proof = atob($(this).parent().find('[name="proof"]').val()).trim()
        let body = atob($(this).parent().find('[name="headers"]').val()).trim() + "\r\n\r\n" + atob($(this).parent().find('[name="body"]').val()).trim()

        $('#raw_request').val(atob($(this).parent().find('[name="request"]').val()).trim())
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


    $(document).on("bind_stats", function (e, scanResult) {
        $('#attacks_count').text(scanResult.stats.attacksCount)
        $('#vulns_count').text(scanResult.stats.vulnsCount)
        return false
    })


    $.fn.selectRange = function (start, end) {
        var e = document.getElementById($(this).attr('id')); // I don't know why... but $(this) don't want to work today :-/
        if (!e) return;
        else if (e.setSelectionRange) { e.focus(); e.setSelectionRange(start, end); } /* WebKit */
        else if (e.createTextRange) { var range = e.createTextRange(); range.collapse(true); range.moveEnd('character', end); range.moveStart('character', start); range.select(); } /* IE */
        else if (e.selectionStart) { e.selectionStart = start; e.selectionEnd = end; }
    }

    let params = new URLSearchParams(window.location.search)
    controller.init().then(function (result) {
        if (params.has('requestDetails') || !result.scanResult?.scanId) {
            showRequestForm()
        } else {
            if (result.isScanRunning) {
                hideScanForm(result)
            }
            if (Object.keys(result.scanResult?.items).length > 0) {
                bindScanResult(result)
            }
        }

        if (params.has('requestDetails')) {
            let request = JSON.parse(decodeURIComponent(atob(params.get('requestDetails'))))
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
            })
        }
    })
    $('.ui.accordion').accordion()
})



function showRequestForm() {
    $('#request_controls').show()
}

function hideRequestForm() {
    $('#request_controls').hide()
}

function hideScanForm(result) {
    $('#run_scan_bg_control').hide()
    $('#scanning_url').text(result.scanResult.host)
    $('.scan_info').show()
    $('#stop_scan_bg_control').show()
}

function showScanForm() {
    $('#run_scan_bg_control').show()
    $('.scan_info').hide()
    $('#scanning_url').text("")
    $('#stop_scan_bg_control').hide()
}

function cleanScanResult() {
    $("#attacks_info").html("")
    $('#attacks_count').text(0)
    $('#vulns_count').text(0)
}

function bindScanResult(result) {
    if (result.scanResult) {
        $('.generate_report').show()
        $('#request_info').html("")
        $('#attacks_info').html("")
        hideRequestForm()

        let $form = $('#request_form')
        $form.form('set value', 'request', result.scanResult)
        $(document).trigger("bind_stats", result.scanResult)

        let keys = Object.keys(result.scanResult.items)
        for (let i = 0; i < keys.length; i++) {
            let item = result.scanResult.items[keys[i]]
            item.requestId = keys[i]
            $("#request_info").append(bindRequest(item))
            for (let j = 0; j < item.attacks.length; j++) {
                item.attacks[j].requestId = keys[i]
                $("#attacks_info").append(bindAttack(item.attacks[j]))
            }

        }
    }
}

function bindRequest(info) {
    let item = `
                <div>
                <div class="title short_message_text"  style="overflow-y: hidden;height: 34px;background-color: #eeeeee;">
                    <i class="dropdown icon"></i>${info.originalUrl}
                    <input type="hidden" name="requestId" value="${info.requestId}" />
                </div>
                <div class="content"><textarea class="ui medium input">${info.originalSchema}</textarea></div>
                </div>
                `
    return item
}

function bindAttack(info) {
    let icon = '', proof = '', attackClass = 'nonvuln'
    if (info.success) {
        attackClass = 'vuln success visible'
        icon = '<div ><i class="exclamation triangle red icon" ></i><b>Vulnerability detected</b></div>'
        proof = `<div class="description"><p>Proof: <b><i name="proof">${ptk_utils.escapeHtml(atob(info.proof))}</i></b></p></div>`
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
                <input type="hidden" name="request" value="${info.request}" />
                <input type="hidden" name="proof" value="${info.proof}" />
                <input type="hidden" name="headers" value="${info.headers}" />
                <input type="hidden" name="body" value="${info.body}" />
                    <a href="#" class="attack_details">Details</a>
                </div>
                </div>`

    return item
}


function bindReportItem(info) {

    let icon = '', proof = '', attackClass = 'nonvuln', color = ''
    if (info.success) {
        color = 'red'
        attackClass = 'vuln success visible'
        icon = '<i class="exclamation triangle red icon"></i>'
        proof = `<div class="description"><p>Proof: <b><i name="proof">${ptk_utils.escapeHtml(atob(info.proof))}</i></b></p></div>`
    }
    let request = ptk_utils.escapeHtml(atob(info.request).trim()).replace(/\n/g, "<br />")
    let response = ptk_utils.escapeHtml(atob(info.headers).trim()).replace(/\n/g, "<br />") + "<br/><br/>" + ptk_utils.escapeHtml(atob(info.body).trim()).replace(/\n/g, "<br />")

    let item = `<div class="attack_info ${attackClass} ui segment">
                    <div class="ui icon ${color} message">
                        <div class="content">
                            <div class="header">
                                <a href="${info.baseUrl}" target="_blank">${icon}${info.baseUrl}</a>
                            </div>
                            <p>Attack: ${ptk_utils.escapeHtml(info.attack.description)} </p>
                            ${proof}
                        </div>
                    </div>
                <div class="two fields" style="padding:4px">
                    <div class="one field" style="overflow: hidden;font-size:12px"><code>${request}</code></div>
                    <div class="one field" style="overflow: hidden;font-size:12px"><code>${response}</code></div>
                </div></div>`

    return item
}

////////////////////////////////////
/* Chrome runtime events handlers */
////////////////////////////////////
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.channel == "ptk_background2popup_rattacker") {
        if (message.type == "attack completed") {
            $(document).trigger("bind_stats", message.scanResult)
            $("#attacks_info").append(bindAttack(message.info))
        }
        if (message.type == "all attacks completed") {
            bindScanResult(message)
        }
        if (message.type == "attack failed") {
            $('#scan_error_message').text(message.info)
            $('.mini.modal').modal('show')
        }
    }
})