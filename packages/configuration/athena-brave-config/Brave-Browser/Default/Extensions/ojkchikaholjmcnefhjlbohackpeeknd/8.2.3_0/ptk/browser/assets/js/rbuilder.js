/* Author: Denis Podgurskii */
import { ptk_controller_rbuilder } from "../../../controller/rbuilder.js"
const controller = new ptk_controller_rbuilder()

controller.waiting = false

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
        $form.form('set values', { 'request': '', 'request_method': 'GET', 'request_protocol': 'http', 'request_redirect': true })

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
                },
                request_port: {
                    identifier: 'request_port',
                    rules: [{ type: 'integer', prompt: 'Port should be an integer value', }]
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

    $(document).on("send_request", function (e, formId) {
        let $form = $('#' + formId + ' #request_form'), formIndex = $('#' + formId).attr('index')
        $form.form('set value', 'response_headers', '')
        $form.form('set value', 'response_body', '')
        $form.form('validate form')

        if ($form.form('is valid')) {
            let values = $form.form('get values')
            controller.parseRawRequest(values).then(function (schema) {
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


    $('.rbsettings').on('click', function () {
        $('.request_forms_container').hide("slow")
        $('.request_settings_container').show("slow")
    })

    $('#closesettings').on('click', function () {
        $('.request_settings_container').hide("slow")
        $('.request_forms_container').show("slow")
    })

    $('#add_request').on('click', function (event, data) {
        let lastId = 'tab_0', lastIndex = 0, newIndex = 0
        $('#pagecontent .menu_item').each(function (i, obj) {
            lastId = $(obj).attr('id')
            let index = parseInt($(obj).attr('index'))
            lastIndex = index > lastIndex ? index : lastIndex;
            $(obj).removeClass('active')
        })
        newIndex = lastIndex + 1

        $("#pagecontent .tab.request").removeClass('active')

        let newItem = `<tr style="box-shadow: none;"><td style="padding:0px;border-top: 0px !important;"><div class="ui mini menu_item active button" id="tab_${newIndex}" index="${newIndex}" style="width: 100%;margin-bottom: 1px">${newIndex + 1}<i class="window close icon"></i></div></td></tr>`
        $('#' + lastId).parent().parent().after(newItem)

        $("#request_" + lastIndex).after($("#request_0").
            clone().
            attr('id', 'request_' + newIndex).
            attr('index', newIndex).
            attr('data-tab', 'tab_' + newIndex)
        )

        $("#request_" + newIndex).addClass('active')

        $(document).trigger("reset_form", 'request_' + newIndex)

        if (data?.operation == 'clone') {
            let $formFrom = $('#' + data.index + ' #request_form'),
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

    $(document).on("submit", ".tiny.form", function (e) {
        e.preventDefault()
        return false
    })

    $(document).on("click", ".clone.icon", function () {
        let index = $(this).closest('.ui.tab.active').attr('id')

        $('#add_request').trigger('click', { operation: 'clone', index: index })
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
        $(document).trigger("send_request", $(this).closest('.ui.tab.active').attr('id'))
    })

    $(document).on("click", ".window.close.icon", function () {
        let index = $(this).parent().attr('index')
        $('#tab_' + index).parent().parent().remove()
        $('#request_' + index).remove()
        $(".menu_item").removeClass('active')
        $(".tab.request").removeClass('active')
        controller.deleteSavedRequest('request_' + index)
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
        let dataBase64 = 'data:text/html;base64,' + btoa(htmlString)
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


    controller.init().then(function (result) {
        let newIndex = 0
        Object.keys(result).forEach(function (key) {
            let $form = $('#' + key + ' #request_form')
            if (!$form.length) {
                $('#add_request').trigger('click')
                $form = $('#' + key + ' #request_form')
            }
            $form.form('set values', {
                'request': result[key].request.raw.trim(),
                'response_headers': (result[key].response.statusLine + '\r\n' + result[key].response.headers.map(x => { return x.name + ": " + x.value }).join('\r\n')).trim(),
                'response_body': result[key].response.body
            })

            $(document).trigger("parse_request", key)
            newIndex++
        })

        let params = new URLSearchParams(window.location.search)
        if (params.has('requestDetails')) {
            let request = JSON.parse(decodeURIComponent(atob(params.get('requestDetails'))))
            if (newIndex > 0) {
                $('#add_request').trigger('click', { operation: 'proxy_request', request: request, index: newIndex })
            }
            else {
                $(document).trigger("init_request", [request, "request_0"])
            }
        }
        if (params.has('rawRequest')) {
            let request = JSON.parse(decodeURIComponent(atob(params.get('rawRequest'))))
            if (newIndex > 0) {
                $('#add_request').trigger('click', { operation: 'rattacker_request', request: request, index: newIndex })
            }
            else {
                let $form = $('#request_0 #request_form')
                $form.form('set values', { 'request': request })
                $(document).trigger("parse_request", 'request_0')
            }
        }
    })
})