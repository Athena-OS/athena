/* Author: Denis Podgurskii */
import { ptk_controller_rattacker } from "../../../controller/rattacker.js"
import { ptk_controller_rbuilder } from "../../../controller/rbuilder.js"
import { ptk_utils } from "../../../background/utils.js"
import { ptk_decoder } from "../../../background/decoder.js"
import * as rutils from "../js/rutils.js"

const controller = new ptk_controller_rattacker()
const request_controller = new ptk_controller_rbuilder()
const decoder = new ptk_decoder()


jQuery(function () {

    // initialize all modals
    $('.modal.coupled')
        .modal({
            allowMultiple: true
        })


    $(document).on("click", ".showHtml", function () {
        rutils.showHtml($(this))
    })
    $(document).on("click", ".showHtmlNew", function () {
        rutils.showHtml($(this), true)
    })

    $(document).on("click", ".generate_report", function () {
        browser.windows.create({
            type: 'popup',
            url: browser.runtime.getURL("/ptk/browser/report.html?rattacker_report")
        })
    })

    $(document).on("click", ".save_report", function () {
        let el = $(this).parent().find(".loader")
        el.addClass("active")
        controller.saveReport().then(function (result) {
            if (result?.success) {
                $('#result_header').text("Success")
                $('#result_message').text("Scan saved")
                $('#result_dialog').modal('show')
            } else {
                $('#result_header').text("Error")
                $('#result_message').text(result?.json?.message)
                $('#result_dialog').modal('show')
            }

            el.removeClass("active")
        })
    })

    $(document).on("click", ".run_scan_runtime", function () {
        controller.init().then(function (result) {
            if (!result?.activeTab?.url) {
                $('#result_header').text("Error")
                $('#result_message').text("Active tab not set. Reload required tab to activate tracking.")
                $('#result_dialog').modal('show')
                return false
            }

            let h = new URL(result.activeTab.url).host
            $('#scan_host').text(h)
            $('#scan_domains').text(h)

            $('#run_scan_dlg')
                .modal({
                    allowMultiple: true,
                    onApprove: function () {
                        controller.runBackroungScan(result.activeTab.tabId, h, $('#scan_domains').val()).then(function (result) {
                            $("#request_info").html("")
                            $("#attacks_info").html("")
                            $(document).trigger("bind_stats", result.scanResult)
                            changeView(result)
                        })
                    }
                })
                .modal('show')
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

    $('.settings.rattacker').on('click', function () {
        $('#settings').modal('show')

    })

    $('.cloud_download_scans').on('click', function () {
        $('#download_scans').modal('show')
        controller.downloadScans().then(function (result) {

            if (!result?.success) {
                $("#download_error").text(result.json.message)
                $("#download_scans_error").show()
                return
            }

            $("#download_scans_error").hide()
            let dt = new Array()
            result?.json.forEach(item => {
                item.scans.forEach(scan => {
                    let link = `<div class="ui mini icon button download_scan_by_id" style="position: relative" data-scan-id="${scan.scanId}"><i class="download alternate large icon"
                                        title="Download"></i>
                                        <div style="position:absolute; top:1px;right: 2px">
                                             <div class="ui  centered inline inverted loader"></div>
                                        </div>
                                </div>`
                    let del = ` <div class="ui mini icon button delete_scan_by_id" data-scan-id="${scan.scanId}" data-scan-host="${item.hostname}"><i  class="trash alternate large icon "
                    title="Delete"></i></div>`
                    let d = new Date(scan.scanDate)
                    dt.push([item.hostname, scan.scanId, d.toLocaleString(), link, del])
                })
            })

            dt.sort(function (a, b) {
                if (a[0] === b[0]) { return 0; }
                else { return (a[0] < b[0]) ? -1 : 1; }
            })
            var groupColumn = 0;
            let params = {
                data: dt,
                columnDefs: [{
                    "visible": false, "targets": groupColumn
                }],
                "order": [[groupColumn, 'asc']],
                "drawCallback": function (settings) {
                    var api = this.api();
                    var rows = api.rows({ page: 'current' }).nodes();
                    var last = null;

                    api.column(groupColumn, { page: 'current' }).data().each(function (group, i) {
                        if (last !== group) {
                            $(rows).eq(i).before(
                                '<tr class="group" ><td colspan="4"><div class="ui black ribbon label">' + group + '</div></td></tr>'
                            );
                            last = group;
                        }
                    });
                }
            }

            bindTable('#tbl_scans', params)


        })
    })

    $(document).on("click", ".download_scan_by_id", function () {
        $(this).parent().find(".loader").addClass("active")
        let scanId = $(this).attr("data-scan-id")
        controller.downloadScanById(scanId).then(function (result) {
            let info = { isScanRunning: false, scanResult: result }
            changeView(info)
            if (Object.keys(info.scanResult?.items).length > 0) {
                bindScanResult(info)
            }
            $('#download_scans').modal('hide')
        })
    })

    $('.import_export').on('click', function () {

        controller.init().then(function (result) {
            if (Object.keys(result.scanResult?.items).length == 0) {
                $('.export_scan_btn').addClass('disabled')
            } else {
                $('.export_scan_btn').removeClass('disabled')
            }
            $('#import_export_dlg').modal('show')
        })

    })

    $('.export_scan_btn').on('click', function () {
        controller.init().then(function (result) {
            if (Object.keys(result.scanResult?.items).length > 0) {
                let blob = new Blob([JSON.stringify(result.scanResult)], { type: 'text/plain' })
                let fName = "PTK_scan.json"

                let downloadLink = document.createElement("a")
                downloadLink.download = fName
                downloadLink.innerHTML = "Download File"
                downloadLink.href = window.URL.createObjectURL(blob)
                downloadLink.click()
            }
        })
    })

    $('.import_scan_file_btn').on('click', function (e) {
        $("#import_scan_file_input").trigger("click")
        e.stopPropagation()
        e.preventDefault()
    })

    $("#import_scan_file_input").on('change', function (e) {
        e.stopPropagation()
        e.preventDefault()
        let file = $('#import_scan_file_input').prop('files')[0]
        loadFile(file)
        $('#import_scan_file_input').val(null)
    })

    async function loadFile(file) {
        var fileReader = new FileReader()
        fileReader.onload = function () {
            controller.save(fileReader.result).then(result => {
                changeView(result)
                if (Object.keys(result.scanResult?.items).length > 0) {
                    bindScanResult(result)
                }
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

    $('.import_scan_text_btn').on('click', function () {
        let scan = $("#import_scan_json").val()
        controller.save(scan).then(result => {
            changeView(result)
            if (Object.keys(result.scanResult?.items).length > 0) {
                bindScanResult(result)
            }
            $('#import_export_dlg').modal('hide')
        })
    })





    $(document).on("click", ".delete_scan_by_id", function () {
        let scanId = $(this).attr("data-scan-id")
        let scanHost = $(this).attr("data-scan-host")
        $("#scan_hostname").val("")
        $("#scan_delete_message").text("")
        $('#delete_scan_dlg')
            .modal({
                allowMultiple: true,
                onApprove: function () {
                    if ($("#scan_hostname").val() == scanHost) {
                        return controller.deleteScanById(scanId).then(function (result) {
                            $('.cloud_download_scans').trigger("click")
                            //console.log(result)
                            return true
                        })

                    } else {
                        $("#scan_delete_message").text("Type scan hostname to confirm delete")
                        return false
                    }
                }
            })
            .modal('show')
    })


    $(document).on("click", ".reset", function () {
        $("#request_info").html("")
        $("#attacks_info").html("")
        $('.generate_report').hide()
        $('.save_report').hide()
        //$('.exchange').hide()

        hideRunningForm()
        showWelcomeForm()
        controller.reset().then(function (result) {
            $(document).trigger("bind_stats", result.scanResult)
            bindModules(result)
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
        $('.metadata .item').tab()
        let requestId = $(this).attr("data-requestId")
        let index = $(this).attr("data-index")
        let attack = controller.scanResult.scanResult.items[requestId].attacks[index]
        rutils.bindAttackDetails($(this), attack, controller.scanResult.scanResult.items[requestId].original)
        $('.metadata .item').tab('change tab', 'first');
    })


    $(document).on("bind_stats", function (e, scanResult) {
        if (scanResult.stats) {
            bindStats(scanResult.stats)
            if (scanResult.stats.vulnsCount > 0) {
                $('#filter_vuln').trigger("click")
            }
        }
        return false
    })

    function bindStats(stats) {
        $('#attacks_count').text(stats.attacksCount)
        $('#vulns_count').text(stats.vulnsCount)
        $('#high_count').text(stats.high)
        $('#medium_count').text(stats.medium)
        $('#low_count').text(stats.low)
    }


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
        } else {
            bindModules(result)
        }
    })
    $('.ui.accordion').accordion({
        onOpen: function () {
            let index = $(this).find('input[name="requestId"]').val()
            $('#filter_vuln').removeClass('active')
            $('#filter_all').addClass('active')
            $('.attack_info').hide()
            $('.attack_info.' + index).show()

            let stats = {
                attacksCount: $('.attack_info.' + index).length,
                vulnsCount: $('.attack_info.success.' + index).length,
                high: $('.attack_info.success.High.' + index).length,
                medium: $('.attack_info.success.Medium.' + index).length,
                low: $('.attack_info.success.Low.' + index).length
            }

            bindStats(stats)


        },
        onClose: function () {
            let index = $(this).find('input[name="requestId"]').val()
            $('#filter_vuln').removeClass('active')
            $('#filter_all').addClass('active')
            $('.attack_info').show()

            let stats = {
                attacksCount: $('.attack_info').length,
                vulnsCount: $('.attack_info.success').length,
                high: $('.attack_info.success.High').length,
                medium: $('.attack_info.success.Medium').length,
                low: $('.attack_info.success.Low').length
            }

            bindStats(stats)
        }
    })
})

function filterByRequestId(requestId) {

}

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
    $('#init_loader').removeClass('active')
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
        controller.scanResult = result
        $("#progress_message").hide()
        $('.generate_report').show()
        $('.save_report').show()
        //$('.exchange').show()
        $('#request_info').html("")
        $('#attacks_info').html("")
        hideWelcomeForm()

        for (let i in result.scanResult.items) {
            let item = result.scanResult.items[i]
            item.requestId = i
            $("#request_info").append(bindRequest(item.original, i))

            for (let y in item.attacks) {
                $("#attacks_info").append(rutils.bindAttack(item.attacks[y], item.original, y, i))
            }
        }

        rutils.sortAttacks()
        $(document).trigger("bind_stats", result.scanResult)
    }
}

function bindModules(result) {
    let modules = result.default_modules
    let dt = new Array()
    modules.map(item => {
        dt.push([item.metadata.module_name, Object.keys(item.attacks).length])
    })
    bindTable('#tbl_modules', { data: dt })
}

function bindRequest(info, requestId) {
    let item = `
                <div>
                <div class="title short_message_text"  style="overflow-y: hidden;height: 34px;background-color: #eeeeee;margin:1px 0 0 0;cursor:pointer; position: relative">
                    <i class="dropdown icon"></i>${info.request.url}<i class="filter icon" style="float:right; position: absolute; top: 3px; right: -3px;" title="Filter by request"></i>
                    
                </div>
               
                <div class="content">
                <input type="hidden" name="requestId" value="${requestId}" />
                <textarea class="ui medium input" style="width:100%; height:200px; border: solid 1px #cecece; padding: 12px;">${info.request.raw}</textarea></div>
                </div>
                `
    return item
}

function bindAttackProgress(message) {
    $("#progress_attack_name").text(message.info.name)
    $("#progress_message").show()
}




////////////////////////////////////
/* Chrome runtime events handlers */
////////////////////////////////////
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.channel == "ptk_background2popup_rattacker") {
        if (message.type == "attack completed") {
            //$(document).trigger("bind_stats", message.scanResult)
            //$("#attacks_info").append(bindAttack(message.info))
            //bindScanResult(message)
            bindAttackProgress(message)
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