/* Author: Denis Podgurskii */
import { ptk_controller_index } from "../../../controller/index.js"
import { ptk_controller_sca } from "../../../controller/sca.js"
import { ptk_controller_rattacker } from "../../../controller/rattacker.js"
import CryptoES from '../../../packages/crypto-es/index.js'
import { ptk_utils, ptk_jwtHelper } from "../../../background/utils.js"
import httpZ from "../../../packages/http-z/http-z.es6.js"
import { ptk_decoder } from "../../../background/decoder.js"

const jwtHelper = new ptk_jwtHelper()
const decoder = new ptk_decoder()

var tokens = new Array()
var tokenAdded = false

jQuery(function () {
    // -- Dashboard -- //
    const index_controller = new ptk_controller_index()
    const sca_controller = new ptk_controller_sca()
    const rattacker_controller = new ptk_controller_rattacker()


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

    $('#print').on("click", function () {
        window.print()
    })

    async function bindInfo(host) {
        if (host) {
            $('#dashboard_message_text').html('<h2>PTK report:</h2>  ' + host)
        } else {
            $('#dashboard_message_text').html(`Reload the tab to activate tracking &nbsp;<i class="exclamation red  circle  icon"></i>`)
        }
    }

    async function bindOWASP() {
        let dt = index_controller.tab.findings ? index_controller.tab.findings : new Array()
        let params = { "data": dt, "columns": [{ width: "30%" }, { width: "70%" }] }
        let table = bindTable('#tbl_owasp', params)
        table.columns.adjust().draw()
        $('.loader.owasp').hide()
    }

    async function bindWAF() {
        //let dt = index_controller.tab.waf ? index_controller.tab.waf : new Array()
        let dt = new Array()
        Object.values(index_controller.tab.waf).forEach(waf => {
            dt.push([waf.name, waf.version])
        })
        let params = { "data": dt, "columns": [{ width: "60%" }, { width: "40%" }] }
        let table = bindTable('#tbl_waf', params)
        table.columns.adjust().draw()
        $('.loader.waf').hide()
    }

    async function bindTechnologies() {
        let dt = new Array()
        if (index_controller.tab.technologies)
            Object.values(index_controller.tab.technologies).forEach(item => {
                dt.push([item.name, item.version])
            })
        let params = { "data": dt, "columns": [{ width: "60%" }, { width: "40%" }] }
        bindTable('#tbl_technologies', params)
        $('.loader.technologies').hide()
    }


    function bindCookies() {
        if (Object.keys(index_controller.tab.cookies).length) {
            $("a[data-tab='cookie']").show()
            $('#tbl_storage').DataTable().row.add(['Cookie', `<a href="#" class="storage_auth_link" data="cookie">View</a>`]).draw()


            let dt = new Array()
            Object.values(index_controller.tab.cookies).forEach(item => {
                //Object.values(domain).forEach(item => {
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
                                '<tr class="group" ><td colspan="3"><div class="ui grey ribbon label">' + group + '</div></td></tr>'
                            );
                            last = group;
                        }
                    });
                }
            }

            bindTable('#tbl_cookie', params)

            let { jwtToken, decodedToken } = jwtHelper.checkJWT(JSON.stringify(dt), jwtHelper.sessionRegex)
            if (jwtToken) {
                tokens.push(['cookie', '<pre>' + decodedToken + '</pre>', jwtToken[1]])
            }
        }
        $('.loader.storage').hide()
        bindTokens()
    }

    async function bindTokens(data) {
        if (tokens.length > 0) {
            $("div[data-tab='tokens']").show()
            if (!tokenAdded) {
                $('#tbl_storage').DataTable().row.add(['Tokens', `<a href="#" class="storage_auth_link" data="tokens">View</a>`]).draw()
                tokenAdded = true
            }
            $("a[data-tab='tokens']").show()
            bindTable('#tbl_tokens', { data: tokens })
        }
    }

    function bindStorage() {
        let dt = new Array()
        Object.keys(index_controller.tab.storage).forEach(key => {
            let item = JSON.parse(index_controller.tab.storage[key])
            if (Object.keys(item).length > 0 && item[key] != "") {
                $(document).trigger("bind_" + key, item)
                $("a[data-tab='" + key + "']").show()
                let link = `<a href="#" class="storage_auth_link" data="${key}">View</a>`
                dt.push([key, link])
            }
        })
        for (let i = 0; i < dt.length; i++) {
            $('#tbl_storage').DataTable().row.add([dt[i][0], dt[i][1]]).draw()
        }
        $('.loader.storage').hide()

        bindTokens()
    }

    function bindHeaders() {
        if (Object.keys(index_controller.tab.requestHeaders).length) {
            let dt = new Array()
            Object.keys(index_controller.tab.requestHeaders).forEach(name => {
                if (name.startsWith('x-') || name == 'authorization' || name == 'cookie') {
                    dt.push([name, index_controller.tab.requestHeaders[name][0]])
                }
            })
            let params = {
                data: dt
            }

            bindTable('#tbl_headers', params)

            let { jwtToken, decodedToken } = jwtHelper.checkJWT(JSON.stringify(dt), jwtHelper.headersRegex)
            if (jwtToken) {
                tokens.push(['headers', '<pre>' + decodedToken + '</pre>', jwtToken[1]])
            }
            bindTokens()
        }
    }


    $(document).on("bind_localStorage", function (e, item) {
        if (Object.keys(item).length > 0) {
            $("div[data-tab='localStorage']").show()
            let output = JSON.stringify(item, null, 4)
            let { jwtToken, decodedToken } = jwtHelper.checkJWT(JSON.stringify(item), jwtHelper.storageRegex)
            if (jwtToken) {
                tokens.push(['localStorage', '<pre>' + decodedToken + '</pre>', jwtToken[1]])
            }
            $('#localStorageText').text(output.replace(/\\r?\\n/g, '<br/>'))
        }
    })

    $(document).on("bind_sessionStorage", function (e, item) {
        if (Object.keys(item).length > 0) {
            $("div[data-tab='sessionStorage']").show()
            let output = JSON.stringify(item, null, 4)
            let { jwtToken, decodedToken } = jwtHelper.checkJWT(JSON.stringify(item), jwtHelper.storageRegex)
            if (jwtToken) {
                tokens.push(['localStorage', '<pre>' + decodedToken + '</pre>', jwtToken[1]])
            }
            $('#sessionStorageText').text(output.replace(/\\r?\\n/g, '<br/>'))
        }
    })

    // -- SCA -- //
    sca_controller.dt = []
    bindTable('#tbl_cve', {
        "columns": [{ width: "15%" }, { width: "15%" }, { width: "70%" }]
    })



    sca_controller.init().then(() => {
        sca_controller.analyze(sca_controller.urls).then((res) => {

            bindVulns(res.vulns)
        })
    })

    function bindVulns(dt) {
        let ds = new Array()
        if (dt.length > 0) {
            Object.values(dt).forEach(item => {
                if (item[1][0].vulnerabilities) {
                    let vulnsInfo = '<div class="ui attached info message"><b>Found in:</b> ' + item[0] + '</div>'
                    vulnsInfo += prepareVulns(item[1][0].vulnerabilities)

                    ds.push([item[1][0].component, item[1][0].version, vulnsInfo])
                }
            })
            let params = { "data": ds, }
            bindTable('#tbl_cve', params)
            $('.loader.cve').hide()
        }
        else {
            $('#cve_report').hide()
        }

    }

    function prepareVulns(vulns) {
        let ret = '<table class="ui celled attached table  responsive nowrap unstackable dataTable no-footer"><thead><th style="width:10%">Severity</th><th style="width:60%">Summary</th><th style="width:30%">Proof</th></thead>'
        Object.values(vulns).forEach(item => {
            ret += `<tr class="${(item.severity == 'high' ? 'ui red' : '')}">`
            ret += `<td>${(item.severity.charAt(0).toUpperCase() + item.severity.slice(1))}</td>`
            ret += `<td>${(item.identifiers.summary ? item.identifiers.summary : 'N/A')}</td>`
            let str = ''
            if (item.identifiers.CVE) {
                Object.values(item.identifiers.CVE).forEach(link => {
                    str += `<a target="_blank" href="https://www.cvedetails.com/cve/${link}/">${link}</a><br>`
                })
            }
            else {

                Object.values(item.info).forEach(link => {
                    str += `<a target="_blank" href="${link}"><i class="external alternate icon"></i></a><br>`
                })

            }
            ret += "<td>" + str + "</td>"
            ret += "</tr>"
        })
        ret += '</table>'
        return ret
    }


    // -- R-Attacker -- //

    function generateRattacker(result) {

        $('#rattacker_report').show()

        let report = ""
        for (let i in result.scanResult.attacks) {
            if(result.scanResult.attacks[i].success)
                $("#rattacker_content").append(bindReportItem(result.scanResult.attacks[i]))

        }
        $('#attacks_count').text(result.scanResult.stats.attacksCount)
        $('#vulns_count').text(result.scanResult.stats.vulnsCount)
        $('#high_count').text(result.scanResult.stats.high)
        $('#medium_count').text(result.scanResult.stats.medium)
        $('#low_count').text(result.scanResult.stats.low)
        // let keys = Object.keys(result.scanResult.items)
        // for (let i = 0; i < keys.length; i++) {
        //     let item = result.scanResult.items[keys[i]]
        //     for (let j = 0; j < item.attacks.length; j++) {
        //         if (item.attacks[j].success) {
        //             item.attacks[j].requestId = keys[i]
        //             report += bindReportItem(item.attacks[j])
        //         }
        //     }
        // }



        $('.loader.rattacker').hide()

    }


    function bindReportItem(info) {

        let icon = '', proof = '', attackClass = 'nonvuln', color = ''
        let headers = info.response.statusLine + '\n' + info.response.headers.map(x => x.name + ": " + x.value).join('\n')
        if (info.success) {
            color = 'red'
            attackClass = 'vuln success visible'
            let iconClass = ""
            if (info.attack.severity == 'High') iconClass = "red"
            if (info.attack.severity == 'Medium') iconClass = "orange"
            if (info.attack.severity == 'Low') iconClass = "yellow"

            icon = `<i class="exclamation triangle ${iconClass}  icon"></i>`
            if(info.proof)
                proof = `<div class="description"><p>Proof: <b><i name="proof">${ptk_utils.escapeHtml(info.proof)}</i></b></p></div>`
        }
        let request = ptk_utils.escapeHtml(info.request.raw.trim()).replace(/\n/g, "<br />")
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
                        <div class="one field" style="overflow: scroll;font-size:12px; max-height: 300px; border: 1px solid black"><code>${response}</code></div>
                    </div></div>`

        return item
    }



    let params = new URLSearchParams(window.location.search)
    if (params.has('rattacker_report')) {
        $('#main').hide()
        $('#rattacker_report').show()
        rattacker_controller.init().then(function (result) {
            bindInfo(result?.scanResult?.host)
            generateRattacker(result)
        })
    } else if (params.has('full_report')) {
        index_controller.get().then(() => {
            let host = new URL(index_controller.url).host
            $('#main').show()
            bindInfo(host)
            bindOWASP()
            bindWAF()
            bindTechnologies()
            bindCookies()
            bindStorage()
            bindHeaders()
            rattacker_controller.init().then(function (result) {
                if (host == result?.scanResult?.host)
                    generateRattacker(result)
            })
        })
    }


})