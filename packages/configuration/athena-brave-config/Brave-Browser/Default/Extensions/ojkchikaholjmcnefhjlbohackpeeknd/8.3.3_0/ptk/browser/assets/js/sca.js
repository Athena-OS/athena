/* Author: Denis Podgurskii */
import { ptk_controller_sca } from "../../../controller/sca.js"
import CryptoES from '../../../packages/crypto-es/index.js';

const controller = new ptk_controller_sca()


var hasher = {
    sha1: function (data) {
        return CryptoES.SHA1(data).toString(CryptoES.enc.Hex)
    }
}
var i = 0
var urls = []


jQuery(function () {

    controller.dt = []

    controller.init().then(() => {
        bindInfo()
        if (controller.urls?.length) {
            urls = Object.keys(controller.urls)
            bindUrl()
           
            controller.analyze(controller.urls).then((res) => {
                bindVulns(res.vulns)
            })
        } else {
            bindVulns(controller.dt)
            $('.loader.technologies').hide()
        }
    })
})


/* Helpers */

function bindUrl() {
    $('#url').text(controller.urls[i])
    if (++i < urls.length) {
        setTimeout(bindUrl, 50)
    }
}

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
    }
    let params = { "data": ds, }
    bindTable('#tbl_technologies', params)
    $('.loader.technologies').hide()
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


async function bindInfo() {
    if (controller.url) {
        $('#dashboard_message_text').text(controller.url)
    } else {
        $('#dashboard_message_text').html(`Reload the tab to activate tracking &nbsp;<i class="exclamation red circle icon"></i>`)
    }
}



