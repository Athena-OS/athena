/* Author: Denis Podgurskii */
import { ptk_controller_index } from "../../../controller/index.js"
import { ptk_utils, ptk_jwtHelper } from "../../../background/utils.js"
import CryptoES from '../../../packages/crypto-es/index.js'
const controller = new ptk_controller_index()
const jwtHelper = new ptk_jwtHelper()
var tokens = new Array()
var tokenAdded = false



jQuery(function () {

    tokens.push = function (item) {
        if (!this.find(e => (e[0] == item[0] && e[1] == item[1] && e[2] == item[2]))) {
            Array.prototype.push.call(this, item)
            this.onPush(item)
        }
    }

    tokens.onPush = function (obj) {
        console.log(obj)
        $('#jwt_btn').show()
    }
    $('#jwt_btn').on('click', function () {
        controller.save(JSON.parse(JSON.stringify(tokens))).then(function (res) {
            location.href = "./jwt.html?tab=1"
        })

    })


    $('.menu .item').tab()
    $('#versionInfo').text(browser.runtime.getManifest().version)

    // $("#waf_wrapper").on("click", function () {
    //     $("#waf_wrapper").addClass("fullscreen modal")
    //     $('#waf_wrapper').modal('show')
    // })

    $(document).on("click", ".storage_auth_link", function () {
        let item = this.attributes["data"].textContent
        $(".menu .item").removeClass('active')
        $.tab('change tab', item)
        $("a[data-tab='" + item + "']").addClass('active')
        $('#storage_auth').modal('show')
    })

    $(document).on("click", "#generate_report", function () {
        let report = document.getElementById("main").outerHTML

        let enc = CryptoES.enc.Base64.stringify(CryptoES.enc.Utf8.parse(report))
        browser.storage.local.set({
            "tab_full_info":
            {
                "technologies": controller.tab.technologies,
                "waf": controller.tab.waf
            }
        }).then(function (res) {
            browser.windows.create({
                type: 'popup',
                url: browser.runtime.getURL("/ptk/browser/report.html?full_report")
            })

        })
        return false

    })


    bindTable('#tbl_waf', {})
    bindTable('#tbl_technologies', { "columns": [{ width: "50%" }, { width: "40%" }, { width: "10%" }] })
    bindTable('#tbl_owasp', { "columns": [{ width: "30%" }, { width: "70%" }] })
    bindTable('#tbl_storage', { "columns": [{ width: "90%" }, { width: "10%", className: 'dt-body-center' }] })

    setTimeout(function () {
        controller.init().then((result) => {
            if (result.redirect) {
                location.href = result.redirect
            }
            //console.log (result)
            bindInfo()
            bindOWASP()
        })
    }, 150)

})




/* Helpers */


async function bindInfo() {
    if (controller.url) {
        $('#dashboard_message_text').text(controller.url)
        if (!controller.privacy.enable_cookie) {
            $('.dropdown.item.notifications').show()
        }
    } else {
        $('#dashboard_message_text').html(dashboardText)
    }
}

async function bindOWASP() {
    let dt = controller.tab?.findings ? controller.tab.findings : new Array()
    let params = { "data": dt, "columns": [{ width: "30%" }, { width: "70%" }] }
    let table = bindTable('#tbl_owasp', params)
    table.columns.adjust().draw()
    $('.loader.owasp').hide()
}

function bindCookies() {
    if (Object.keys(controller.cookies).length) {
        $("a[data-tab='cookie']").show()
        $('#tbl_storage').DataTable().row.add(['Cookie', `<a href="#" class="storage_auth_link" data="cookie">View</a>`]).draw()


        let dt = new Array()
        Object.values(controller.cookies).forEach(item => {
            // Object.values(domain).forEach(item => {
            dt.push([item.domain, item.name, item.value, item.httpOnly])
            //})
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
                            '<tr class="group" ><td colspan="3"><div class="ui black ribbon label">' + group + '</div></td></tr>'
                        );
                        last = group;
                    }
                });
            }
        }

        bindTable('#tbl_cookie', params)

        let { jwtToken, decodedToken } = jwtHelper.checkJWT(JSON.stringify(dt), jwtHelper.sessionRegex)
        if (jwtToken) {
            let jwt = JSON.parse(decodedToken)
            tokens.push(['cookie', '<pre>' + JSON.stringify(jwt["payload"], null, 2) + '</pre>', jwtToken[1]])
        }
    }
    $('.loader.storage').hide()
    bindTokens()
}

function bindHeaders() {
    if (Object.keys(controller.tab.requestHeaders).length) {
        let dt = new Array()
        Object.keys(controller.tab.requestHeaders).forEach(name => {
            if (name.startsWith('x-') || name == 'authorization' || name == 'cookie') {
                dt.push([name, controller.tab.requestHeaders[name][0]])
            }
        })
        let params = {
            data: dt
        }

        bindTable('#tbl_headers', params)

        let { jwtToken, decodedToken } = jwtHelper.checkJWT(JSON.stringify(dt), jwtHelper.headersRegex)
        if (jwtToken) {
            let jwt = JSON.parse(decodedToken)
            tokens.push(['headers', '<pre>' + JSON.stringify(jwt["payload"], null, 2) + '</pre>', jwtToken[1]])
        }
        bindTokens()
    }
}

async function bindTechnologies() {
    let dt = new Array()
    if (controller.tab.technologies)
        Object.values(controller.tab.technologies).forEach(item => {
            let link = '<a target="_blank" href="https://www.cvedetails.com/google-search-results.php?q=' + item.name + '+' + item.version + '"><i class="external alternate icon"></i></a>'
            dt.push([item.name, item.version, link])
        })
    let params = { "data": dt, "columns": [{ width: "50%" }, { width: "40%" }, { width: "10%" }] }

    bindTable('#tbl_technologies', params)
    $('.loader.technologies').hide()
}

async function bindWAF() {
    let dt = new Array()
    if (controller.tab.waf) {
        Object.values(controller.tab.waf).forEach(item => {
            dt.push([item.name])
        })
    }
    let params = { "data": dt }
    bindTable('#tbl_waf', params)
    $('.loader.waf').hide()
}

async function bindTokens(data) {
    if (tokens.length > 0) {
        if (!tokenAdded) {
            $('#tbl_storage').DataTable().row.add(['Tokens', `<a href="#" class="storage_auth_link" data="tokens">View</a>`]).draw()
            tokenAdded = true
        }
        $("a[data-tab='tokens']").show()
        bindTable('#tbl_tokens', { data: tokens })
        controller.save(JSON.parse(JSON.stringify(tokens)))
    }
}



function bindStorage() {
    let dt = new Array()
    Object.keys(controller.storage).forEach(key => {
        let item = JSON.parse(controller.storage[key])
        if (Object.keys(item).length > 0 && item[key] != "") {
            $(document).trigger("bind_" + key, item)
            $("a[data-tab='" + key + "']").show()
            let link = `<a href="#" class="storage_auth_link" data="${key}">View</a>`
            dt.push([key, link])
        }
    })
    let existingRows = $('#tbl_storage').DataTable().rows().data()
    for (let i = 0; i < dt.length; i++) {
        let add = true
        for (let j = 0; j < existingRows.length; j++) {
            if (dt[i][0] == existingRows[j][0]) add = false
        }

        if (add)
            $('#tbl_storage').DataTable().row.add([dt[i][0], dt[i][1]]).draw()
    }
    $('.loader.storage').hide()

    bindTokens()
}

$(document).on("bind_localStorage", function (e, item) {
    if (Object.keys(item).length > 0) {

        let output = JSON.stringify(item, null, 4)
        let { jwtToken, decodedToken } = jwtHelper.checkJWT(JSON.stringify(item), jwtHelper.storageRegex)
        if (jwtToken) {
            let jwt = JSON.parse(decodedToken)
            tokens.push(['localStorage', '<pre>' + JSON.stringify(jwt["payload"], null, 2) + '</pre>', jwtToken[1]])
        }
        $('#localStorageText').text(output.replace(/\\r?\\n/g, '<br/>'))
    }
})

$(document).on("bind_sessionStorage", function (e, item) {
    if (Object.keys(item).length > 0) {
        let output = JSON.stringify(item, null, 4)
        let { jwtToken, decodedToken } = jwtHelper.checkJWT(JSON.stringify(item), jwtHelper.storageRegex)
        if (jwtToken) {
            let jwt = JSON.parse(decodedToken)
            tokens.push(['sessionStorage', '<pre>' + JSON.stringify(jwt["payload"], null, 2) + '</pre>', jwtToken[1]])
        }
        $('#sessionStorageText').text(output.replace(/\\r?\\n/g, '<br/>'))
    }
})

function merge(array1, array2) {
    return [...new Set([...array1, ...array2])]
}

/* Chrome runtime events handlers */
browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.channel == "ptk_content2popup" && message.type == "init_complete") {
        controller.storage = message.data.auth
        controller.complete(message.data)
        //setTimeout(function () { controller.complete(message.data) }, 500) //TODO - remove timeout, but keep cookies 
    }

    if (message.channel == "ptk_background2popup_dashboard") {
        //Object.assign(controller, message.data)

        if (message.type == "init_complete") {
            Object.assign(controller, message.data)
            bindCookies()
            bindHeaders()
        }

        if (message.type == "analyze_complete") {
            let technologies = []
            if (controller.tab?.technologies) {
                technologies = merge(controller.tab?.technologies, message.data.tab.technologies)
            }
            Object.assign(controller, message.data)
            if (technologies.length > 0)
                controller.tab.technologies = technologies.filter(function (item, pos) {
                    let index = technologies.findIndex(function (el, i) {
                        return el.name === item.name
                    })
                    return index == pos;
                })

            bindTechnologies()
            bindWAF()
            bindStorage()
            $('#generate_report').removeClass('disabled')

        }
    }
})

