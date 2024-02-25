/* Author: Denis Podgurskii */
import { ptk_controller_rattacker } from "../../../controller/rattacker.js"
import { ptk_controller_rbuilder } from "../../../controller/rbuilder.js"
import { ptk_utils } from "../../../background/utils.js"
import CryptoES from '../../../packages/crypto-es/index.js'
import httpZ from "../../../packages/http-z/http-z.es6.js"
import { ptk_decoder } from "../../../background/decoder.js"
const controller = new ptk_controller_rattacker()
const request_controller = new ptk_controller_rbuilder()
const decoder = new ptk_decoder()


jQuery(function () {


    $(document).on("click", ".generate_report", function () {
        browser.windows.create({
            type: 'popup',
            url: browser.runtime.getURL("/ptk/browser/report.html?rattacker_report")
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
                        $(document).trigger("bind_stats", result.scanResult)
                        changeView(result)
                    })
                }
            })
        return false
    })

    $(document).on("click", ".stop_scan_runtime", function () {
        controller.stopBackroungScan().then(function (result) {
            changeView(result)
            bindScanResult(result)
        })
        return false
    })

    $(document).on("click", ".reset", function () {
        $("#request_info").html("")
        $("#attacks_info").html("")
        $('.generate_report').hide()
        hideRunningForm()
        showWelcomeForm()
        controller.reset().then(function (result) {
            $(document).trigger("bind_stats", result.scanResult)
        })
    })

    $('.send_rbuilder').on("click", function () {
        let request = $('#raw_request').val().trim()
        window.location.href = "rbuilder.html?rawRequest=" + decoder.base64_encode(encodeURIComponent(JSON.stringify(request)))
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


    $(document).on("bind_stats", function (e, scanResult) {
        $('#attacks_count').text(scanResult.stats.attacksCount)
        $('#vulns_count').text(scanResult.stats.vulnsCount)
        $('#high_count').text(scanResult.stats.high)
        $('#medium_count').text(scanResult.stats.medium)
        $('#low_count').text(scanResult.stats.low)
        return false
    })


    $.fn.selectRange = function (start, end) {
        var e = document.getElementById($(this).attr('id')); // I don't know why... but $(this) don't want to work today :-/
        if (!e) return;
        else if (e.setSelectionRange) { e.focus(); e.setSelectionRange(start, end); } /* WebKit */
        else if (e.createTextRange) { var range = e.createTextRange(); range.collapse(true); range.moveEnd('character', end); range.moveStart('character', start); range.select(); } /* IE */
        else if (e.selectionStart) { e.selectionStart = start; e.selectionEnd = end; }
    }

    controller.init().then(function (result) {
        changeView(result)
        if (Object.keys(result.scanResult?.items).length > 0) {
            bindScanResult(result)
        }
    })
    $('.ui.accordion').accordion()
})



function showWelcomeForm() {
    $('#welcome_message').show()
    $('#run_scan_bg_control').show()
}

function hideWelcomeForm() {
    $('#welcome_message').hide()
}

function showRunningForm(result) {
    $('#scanning_url').text(result.scanResult.host)
    $('.scan_info').show()
    $('#stop_scan_bg_control').show()
}

function hideRunningForm() {
    $('#scanning_url').text("")
    $('.scan_info').hide()
    $('#stop_scan_bg_control').hide()
}

function showScanForm(result) {
    $('#run_scan_bg_control').show()
}

function hideScanForm() {
    $('#run_scan_bg_control').hide()
}


function changeView(result) {
    if (result.isScanRunning) {
        hideWelcomeForm()
        hideScanForm()
        showRunningForm(result)
    }
    else if (Object.keys(result.scanResult?.items).length > 0) {
        hideWelcomeForm()
        hideRunningForm(result)
        showScanForm()
    }
    else {
        hideRunningForm()
        hideScanForm()
        showWelcomeForm()
    }
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
        hideWelcomeForm()

        for(let i in result.scanResult.original ){
            let item = result.scanResult.original[i]
            item.requestId = i
            $("#request_info").append(bindRequest(item))
        }

        for(let i in result.scanResult.attacks){
            $("#attacks_info").append(bindAttack(result.scanResult.attacks[i]))
        }
       $(document).trigger("bind_stats", result.scanResult)
    }
}

function bindRequest(info) {
    let item = `
                <div>
                <div class="title short_message_text"  style="overflow-y: hidden;height: 34px;background-color: #eeeeee;margin:1px 0 0 0;cursor:pointer">
                    <i class="dropdown icon"></i>${info.request.target}
                    <input type="hidden" name="requestId" value="${info.requestId}" />
                </div>
                <div class="content"><textarea class="ui medium input" style="width:100%; height:200px;">${info.request.raw}</textarea></div>
                </div>
                `
    return item
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
            proof = `<div class="description"><p>Proof: <b><i name="proof">${ptk_utils.escapeHtml((info.proof))}</i></b></p></div>`
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


function bindReportItem(info) {

    let icon = '', proof = '', attackClass = 'nonvuln', color = ''
    let headers = info.response.statusLine + '\n' + info.response.headers.map(x => x.name + ": " + x.value).join('\n')
    if (info.success) {
        color = 'red'
        attackClass = 'vuln success visible'
        icon = '<i class="exclamation triangle red icon"></i>'
        proof = `<div class="description"><p>Proof: <b><i name="proof">${ptk_utils.escapeHtml(decoder.base64_decode(info.proof))}</i></b></p></div>`
    }
    let request = ptk_utils.escapeHtml(httpZ.build(info.request).trim()).replace(/\n/g, "<br />")
    let response = ptk_utils.escapeHtml(headers.trim()).replace(/\n/g, "<br />") + "<br/><br/>" + ptk_utils.escapeHtml(info.response.body.trim()).replace(/\n/g, "<br />")

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
            //$("#attacks_info").append(bindAttack(message.info))
            bindScanResult(message)
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