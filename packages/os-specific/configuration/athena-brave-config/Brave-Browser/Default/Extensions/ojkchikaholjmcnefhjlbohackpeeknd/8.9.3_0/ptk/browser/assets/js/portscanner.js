/* Author: Denis Podgurskii */
import { ptk_controller_portscanner } from "../../../controller/portscanner.js"

const controller = new ptk_controller_portscanner()




jQuery(function () {

    controller.dt = []

    $(document).on("submit", "#portscanner_form", function (e) {
        e.preventDefault()
        return false
    })

    controller.init().then(function (result) {
        let $form = $('#portscanner_form')
        $form.form('clear')

        $form.form({
            inline: true,
            keyboardShortcuts: false,
            fields: {

                domain: {
                    identifier: 'domain',
                    rules: [{
                        prompt: 'Domain or IP address is required',
                        type: 'regExp',
                        value: /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/i,
                    }]
                },
                port: {
                    identifier: 'port',
                    rules: [{
                        prompt: 'Port is required',
                        type: 'empty',
                    }]
                },
            }
        })

        bindInfo()
    })

    

    $(document).on("click", "#top10ports", function () {
        $('#port').val('21,22,23,25,53,80,88,3306,8080,8888')
    })

    $(document).on("click", ".reset", function () {
        controller.reset().then(function (result) {
            controller.target = null
            controller.ports = []
            bindInfo()
        })
    })

    $(document).on("click", ".run_scan", function () {
        let $form = $('#portscanner_form')
        $form.form('validate form')

        if ($form.form('is valid')) {
            let values = $form.form('get values')
            let ports = parsePorts(values['port'])
            controller.target = values['domain']
            controller.dt = []
            bindPorts(controller.target, [])
            for (let i = 0; i < ports.length; i++) {
                isPortOpen(values['domain'], ports[i])
            }
            //bindInfo()
        }
    })
})



/* Helpers */

function isPortOpen(target, port, timeout = 500) {

    var timeout = (timeout == null) ? 100 : timeout
    var img = new Image()

    img.onerror = function () {
        if (!img) return
        img = undefined
        controller.dt.push([target + ":" + port, 'open'])
        bindPorts(target, controller.dt)
        controller.save(target, controller.dt)
    }

    try {
        img.onload = img.onerror
        img.src = 'http://' + target + ':' + port
    } catch (e) {
        console.log(e)
    }

    setTimeout(function () {
        if (!img) return;
        img = undefined;
        controller.dt.push([target + ":" + port, 'closed'])
        bindPorts(target, controller.dt)
        controller.save(target, controller.dt)
    }, timeout)
}






function parsePorts(ports) {
    let portsToScan = []
    if (ports.includes(',')) {
        let p = ports.split(',')
        for (let i = 0; i < p.length; i++) {
            portsToScan.push(parseInt(p[i]))
        }
    } else if (ports.includes('-')) {
        let p = ports.split('-')
        let startPort = parseInt(p[0])
        let endPort = parseInt(p[1])
        let currentPort = startPort
        portsToScan.push(startPort)
        for (let i = startPort; i < endPort; i++) {
            currentPort++
            portsToScan.push(currentPort)
        }
    } else {
        portsToScan.push(parseInt(ports))
    }
    return portsToScan
}

function bindPorts(target, ports) {
    $('#welcome_message').hide()
    $('#tbl_ports').show()
    let params = { "data": ports }
    bindTable('#tbl_ports', params)
}

async function bindInfo() {
    if (controller.target && controller.ports) {
        $('#welcome_message').hide()
        $('#tbl_ports').show()
        bindPorts(controller.target, controller.ports)
    } else {
        $('#tbl_ports').hide()
        $('#welcome_message').show()
        if (controller.url) {
            //$('#dashboard_message_text').text(controller.url)
            let u = new URL(controller.url)
            $('#domain').val(u.host)
        }

    }
}



