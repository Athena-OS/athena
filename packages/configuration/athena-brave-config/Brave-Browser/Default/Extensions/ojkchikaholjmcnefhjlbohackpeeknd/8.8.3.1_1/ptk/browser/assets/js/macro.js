/* Author: Denis Podgurskii */

import { ptk_controller_macro } from "../../../controller/macro.js"
const controller = new ptk_controller_macro()

jQuery(function () {
    $('.menu .item').tab()
    let editor = CodeMirror.fromTextArea(document.getElementById('recording_output'), {
        lineNumbers: true, lineWrapping: true, mode: "application/xml", indentUnit: 3,
        scrollbarStyle: null, extraKeys: { "Ctrl-Y": function (cm) { cm.foldCode(cm.getCursor()) } },
        foldGutter: true, gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    })
    editor.setSize('auto', '100%')

    editor.on('change', e => {
        if (editor.getValue() != controller.savedMacro) {
            controller.save(editor.getValue())
        }
    })


    let $form = $('#macro_form')

    let waiting = true
    controller.init().then(function (result) {
        controller.getSettings().then(function (settings) {
            if (result.savedMacro) {
                $form.form('set value', 'recording_output', result.savedMacro)
                editor.setOption("mode", "application/xml")
                editor.setValue(result.savedMacro)
                $(document).trigger("saved")
            } else {
                $(document).trigger("export")
            }
            $(document).trigger("init_form")
            $(document).trigger("check_macro")
            waiting = false
            $('.loader.macro').hide()
        })
    })



    $('.start, .start_clean_cookie').on('click', function (e) {
        $form.form('validate form')
        if ($form.form('is valid')) {
            try {
                let url = new URL($form.form('get value', 'url'))
                controller.start(this.attributes['data-value'].value == 'true', url.toString())
            } catch (e) {
                $('#macro_error_message').text("Could start recording " + e.message)
                $('.mini.modal').modal('show')
            }
        }
    })

    $('.reset_recording').on('click', function () {
        let values = $form.form('get values')
        $form.form('set value', 'recording_output', '')
        editor.setValue('')
        $('form').form('reset')
        //$('[name="validate_regex"]').prop('disabled', true)
        $('.iframeSign').removeClass("display")
        $form.form('set value', 'url', values['url'])
        controller.reset()
    })

    $(document).on("init_form", function (e, data) {
        browser.tabs.query({ currentWindow: true, active: true })
            .then(function (tabs) {
                let tab = tabs[0]
                if (tab && !tab.url.startsWith('chrome://')) {
                    $form.form('set value', 'url', tab.url)
                    window.parent.postMessage({ url: tab.url }, '*');
                }
            })

        //$form.form('set value', 'format', controller.settings.format)
        $form.form('set value', 'element_path', controller.settings.element_path)
        $form.form('set value', 'min_duration', controller.settings.min_duration)
        $form.form('set value', 'enable_extra_delay', controller.settings.enable_extra_delay)
        $form.form('set value', 'event_type', controller.settings.event_type)
        // $form.form('set value', 'validate_regex', controller.settings.validate_regex)
        // $form.form('set value', 'enable_regex', controller.settings.enable_regex)
        // if (controller.settings.enable_regex)
        //     $("input[name='validate_regex']").prop('disabled', false)
        // else {
        //     $("input[name='validate_regex']").prop('disabled', true)
        // }
        $form.form({
            inline: true,
            fields: {
                url: {
                    identifier: 'url',
                    rules: [{
                        prompt: 'URL is required in the format http://example.com or https://120.0.0.1',
                        type: 'regExp',
                        value: /^((http|https):\/\/){1}(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])?(:+[0-9]+)?([\/\?]{1}.*)?$/i,
                    }]
                }
            }
        })

        if (!controller.recording?.items) {
            $('.content .segment').dimmer('show')
        } else {
            $('.content .segment').dimmer('hide')
        }

    })

    $(document).on("export", function (e, data) {
        let macro = controller.export()
        if (macro) {
            let values = $form.form('get values')
            $form.form('set value', 'recording_output', macro)
            editor.setOption("mode", "application/xml")
            editor.setValue(macro)

            $('.exportType').text(controller.settings.event_type)
            $('.exportType').fadeIn()
            $('.exportType').addClass("display")
            setTimeout(function (evt) {
                $('.exportType').fadeOut("slow", function () {
                    $('.exportType').removeClass("display")
                    $('.exportType').text()
                })
            }, 3500)
        }
    })

    $(document).on("saved", function (e, data) {

        $('.savedMacro').fadeIn()
        $('.savedMacro').addClass("display")
        setTimeout(function (evt) {
            $('.savedMacro').fadeOut("slow", function () {
                $('.savedMacro').removeClass("display")
            })
        }, 3500)

    })

    $(document).on("check_macro", function (e, data) {
        let values = $form.form('get values')
        let xml = editor.getValue()

        if (xml.includes('<![CDATA[xpath=//IFRAME[')) {
            $('.iframeSign').addClass("display")
        } else {
            $('.iframeSign').removeClass("display")
        }
    })

    $(document).on('change', "[name='format']", function (e) {
        let values = $form.form('get values')
        controller.settings[e.target.name] = values[e.target.name]
        if (!waiting) controller.updateSettings().then(function () {
            $(document).trigger("export")
        }).catch(e => {
            $('#macro_error_message').text(e)
            $('.mini.modal').modal('show')
        })
    })

    $(document).on('change', "[name='enable_extra_delay'],[name='element_path'], [name='event_type'], [name='min_duration']", function (e) {
        let values = $form.form('get values')
        controller.settings[e.target.name] = values[e.target.name]
        if (values[e.target.name] != 'xml') {

        }

        if (values['enable_extra_delay'] == 'on') {
            controller.settings["enable_extra_delay"] = true
        }

        if (!waiting) controller.updateSettings().then(function () {
            $(document).trigger("export")
        })
    })

    // $("input[name='validate_regex']").on('change', function () {
    //     controller.settings["validate_regex"] = this.value
    //     if (!waiting) controller.updateSettings()
    // })

    // $("input[name='enable_regex']").on('change', function () {
    //     let values = $form.form('get values')
    //     if (values['validate_regex'] == '')
    //         $form.form('set value', 'validate_regex', '(sign|log)[ -]?(out|off)')

    //     if (values['enable_regex'] == 'on') {
    //         $("input[name='validate_regex']").prop('disabled', false)
    //         controller.settings["enable_regex"] = true
    //     } else {
    //         $("input[name='validate_regex']").prop('disabled', true)
    //         controller.settings["enable_regex"] = false
    //     }
    //     if (!waiting) controller.updateSettings()
    // })




    $('.import_recording').on('click', function () {
        $('#importerrordlg').css("display", "none")
        $('#importerrormsg').text("")
        $('#dialogImportRecording').modal('show')
    })

    $("#sidefileimport").on('change', function (evt) {
        let files = evt.target.files
        if (!files) {
            alert("Failed to load .side file")
            return
        }

        let reader = new FileReader()
        reader.onload = function () {
            try {
                let content = JSON.parse(reader.result)
                let output = controller.side2macro(content)
                $form.form('set value', 'recording_output', output)
                editor.setOption("mode", "application/xml")
                editor.setValue(output)
                $('#dialogImportRecording').modal('hide')
            } catch (e) {
                $('#importerrordlg').css("display", "block")
                $('#importerrormsg').text("Could not parse JSON: " + e.message)
            }
        }
        reader.readAsText(files[0])
    })

    $("#htmlfileimport").on('change', function (evt) {
        let files = evt.target.files
        if (!files) {
            alert("Failed to load .html file")
            return
        }

        let reader = new FileReader()
        reader.onload = function () {
            try {
                let output = controller.seleniumHtmlToMacro(reader.result)
                $form.form('set value', 'recording_output', output)
                editor.setOption("mode", "application/xml")
                editor.setValue(output)
                $('#dialogImportRecording').modal('hide')
            } catch (e) {
                $('#importerrordlg').css("display", "block")
                $('#importerrormsg').text("Could not parse HTML: " + e.message)
            }
        }

        reader.readAsText(files[0])
    })

    // $('.macro_replay, .macro_replay_clean_cookie').on('click', function () {
    //     try {
    //         let [startUrl, events] = controller.import(editor.getValue())
    //         if (startUrl && events.length > 0) {
    //             let values = $form.form('get values')
    //             controller.replay(this.attributes['data-value'].value == 'true', startUrl, events,
    //                 (values['enable_regex'] == 'on') ? values['validate_regex'] : null
    //             )
    //         } else {
    //             $('#macro_error_message').text("Recorded macro is empty. Export or copy and paste a macro to replay")
    //             $('.mini.modal.error').modal('show')
    //         }
    //     } catch (e) {
    //         $('#macro_error_message').text("Could not parse XML\n" + e.message)
    //         $('.mini.modal.error').modal('show')
    //     }
    // })

    $('.macro_download').on('click', function () {
        try {
            let xml = editor.getValue()
            if (xml == "") controller.export()
            xml = editor.getValue()
            let xmlDoc = $.parseXML(xml),
                $xml = $(xmlDoc),
                $events = $xml.find("MacroEvent")
            if ($events.length > 0) {
                setTimeout(function (firstEvent) {
                    let blob = new Blob([editor.getValue()], { type: 'text/plain' })
                    let fName = "PTK_macro.rec"
                    let url = $(firstEvent).find('Data').text()

                    if (url) {
                        fName = 'PTK_' + (new URL(url)).hostname + '.rec'
                    }

                    let downloadLink = document.createElement("a")
                    downloadLink.download = fName
                    downloadLink.innerHTML = "Download File"
                    downloadLink.href = window.URL.createObjectURL(blob)
                    downloadLink.click()
                }, 100, $events[0])
            } else {
                $('#macro_error_message').text("Recorded macro is empty. Record a macro before download")
                $('.mini.modal.error').modal('show')
            }
        } catch (e) {
            $('#macro_error_message').text("Could not parse XML\n" + e.message)
            $('.mini.modal.error').modal('show')
        }
    })

    $('.question').popup()
    $('.ui.accordion').accordion()
})

window.addEventListener('message', function (msg) {
    if (msg.data.url)
        $('[name="url"]').val(msg.data.url)
})

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.channel == "ptk_background2popup_recorder" && message.type == "recording_completed") {
        controller.recording = message.recording
        $(document).trigger("export")
    }
})