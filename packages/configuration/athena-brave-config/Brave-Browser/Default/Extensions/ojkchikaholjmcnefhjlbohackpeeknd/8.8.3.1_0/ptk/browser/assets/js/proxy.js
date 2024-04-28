/* Author: Denis Podgurskii */
import { ptk_controller_proxy } from "../../../controller/proxy.js"
const controller = new ptk_controller_proxy()

jQuery(function () {


    $('.item.clean').on('click', function () {
        controller.clear().then(function () {
            bindTable('#tbl_frames', { "data": [] })
        })
    })

    $('.item.restart').on('click', function () {
        controller.restart().then(function () {
            bindTable('#tbl_frames', { "data": [] })
        })
    })


    $(document).on("click", ".request_details", function () {
        let table = $(this).closest('table').DataTable(),
            tr = $(this).closest('tr'),
            row = table.row(tr),
            values = table.row($(this).parents('tr')).data()
        controller.getRequest(values[3], values[2], values[1]).then(function (response) {
            window.location.href = "rbuilder.html?requestDetails=" + btoa(encodeURIComponent(JSON.stringify(response)))
        })
    })

    $(document).on("click", ".rattacker", function () {
        let table = $(this).closest('table').DataTable(),
            tr = $(this).closest('tr'),
            row = table.row(tr),
            values = table.row($(this).parents('tr')).data()
        controller.getRequest(values[3], values[2], values[1]).then(function (response) {
            window.location.href = "rattacker.html?requestDetails=" + btoa(encodeURIComponent(JSON.stringify(response)))
        })
    })

    $(document).on("click", "#download_domain_list", function () {
        let data = controller.domains
        if (data != null) {
            let blob = new Blob([data.join("\r\n")], { type: 'text/plain' })
            let downloadLink = document.createElement("a")
            downloadLink.download = "PTK_domains_" + (new URL(controller.url)).hostname + ".txt"
            downloadLink.href = window.URL.createObjectURL(blob)
            downloadLink.click()
        }
    })

    $(document).on("click", "#download_url_list", function () {
        let data = controller.urls
        if (data != null) {
            let blob = new Blob([data.join("\r\n")], { type: 'text/plain' })
            let downloadLink = document.createElement("a")
            downloadLink.download = "PTK_urls_" + (new URL(controller.url)).hostname + ".txt"
            downloadLink.href = window.URL.createObjectURL(blob)
            downloadLink.click()
        }
    })

    $(document).on('click', ".expandbtn", function (event) {
        let table = $('#tbl_frames').DataTable()
        let tr = $(this).closest('tr'), row = table.row(tr), values = table.row($(this).parents('tr')).data()
        expandCHildRow(tr.find('i'), row, values)
        event.stopPropagation()
    })

    function expandCHildRow(icon, row, values) {
        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide()
            icon.removeClass('shown minus')
            icon.addClass('shown plus')
        } else {
            // Open this row
            row.child(
                `<div class="proxy_child_row" style="width: 97vw; overflow-x: scroll;overflow-y: hidden;scrollbar-width: thin;">
                        <table class="ui celled table stackable small fullwidth proxy_child_row" id="tbl_frame_` + values[1] + `" > 
                            <thead>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>`
            ).show()
            icon.removeClass('shown plus')
            icon.addClass('shown minus')
            bindRequests(values[1])
        }
    }

    setTimeout(function () { bindAll() }, 100)
})

/* Helpers */



function bindAll() {
    controller.init().then(function (result) {
        bindInfo()
        bindFrames()
    }).catch(e => console.log(e))
}

function bindInfo() {
    if (controller.url) {
        $('#dashboard_message_text').text(controller.url)

    } else {
        $('#dashboard_message_text').html(dashboardText)
    }
}

function bindFrames() {
    let dt = controller.frames?.length ? controller.frames : new Array()
    dt = dt.sort(function (a, b) {
        if (a[2] < b[2]) { return 1 }
        if (a[2] > b[2]) { return -1 }
        return 0
    })
    //move to jquery stuff
    let params = {
        "data": dt,
        "columns": [{
            render: function (data, type, row) {
                return '<i class="expandchild plus square large icon"></i>'
            },
            "className": "expandbtn"
        }, { "visible": false }, { title: "Frame", "className": "expandbtn" }, { title: "Url" , "className": "expandbtn" }, { title: "IP", class: "expandbtn frameIP" }]
    }
    let table = bindTable('#tbl_frames', params)

    $('.expandchild.plus.icon:first').trigger('click')
}

function bindRequests(index) {
    let dt = new Array()
    controller.getFrame(index).then(function (frame) {
        let i = 0
        Object.values(frame).forEach(item => {
            let request = item[1][0], key = item[0]
            let u = new URL(request.url)
            dt.push(['', i, key, request.frameId, u.hostname.substr(0, 40), u.pathname.substr(0, 40), request.method, request.statusCode ? request.statusCode : '',
                request.type, request.ip ? request.ip : ''
            ])
            i++
        })
        let params = {
            "data": dt,
            "searching": true,
            "columns": [{
                render: function (data, type, row) {
                    return `
                    <div style="min-width:40px">
                        <div class="ui mini icon button request_details">
                        <i class=" large icon wrench " data-position="bottom left" title="Send to R-Builder" ></i>
                        </div>

                    </div>`
                }
            }, { "visible": false }, { "visible": false }, { "visible": false }, { title: "Host" }, { title: "Path" }, { title: "Method" }, { title: "Status" }, { title: "Type" }, { title: "IP" }
            ]
        }
        let tableId = '#tbl_frame_' + index
        let table = bindTable(tableId, params)

        table.columns().flatten().each(function (colIdx) {
            let title = $(table.column(colIdx).header()).text()
            if (title) {
                let select = $('<br/><input type="text" placeholder="Search ' + title + '" />')
                    .appendTo(
                        table.column(colIdx).header()
                    )
                    .on('keyup clear', function () {
                        table
                            .column(colIdx)
                            .search($(this).val())
                            .data()
                            .draw()
                        $(this).trigger('change');
                    })

            }
        })

    })
}


/* Chrome runtime events handlers */
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.channel == "ptk_background2popup_tabs") {
        if (message.type == "requests source resized") {
            if (controller.waiting) return
            controller.waiting = true
            setTimeout(function () {
                controller.getAllFrames().then(function () {
                    controller.waiting = false
                    bindFrames()
                })
            }, 500)
        }
    }
})

