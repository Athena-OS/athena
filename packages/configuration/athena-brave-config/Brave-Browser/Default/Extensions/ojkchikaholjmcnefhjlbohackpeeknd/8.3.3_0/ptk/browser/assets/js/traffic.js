/* Author: Denis Podgurskii */

import { ptk_controller_traffic } from "../../../controller/traffic.js"
const controller = new ptk_controller_traffic()

jQuery(function () {

    let editor = CodeMirror.fromTextArea(document.getElementById('recording_output'), {
        lineNumbers: true, lineWrapping: true, mode: "application/javascript", indentUnit: 1,
        scrollbarStyle: null, extraKeys: { "Ctrl-Y": function (cm) { cm.foldCode(cm.getCursor()) } },
        foldGutter: true, gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    })
    editor.setSize('auto', '100%')


    var $form = $('#traffic_form')

    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        /*maxTextSize: 150000,*/

        sequence: {
            diagramMarginX: 0,
            diagramMarginY: 10,
            boxTextMargin: 15,
            noteMargin: 10,
            messageMargin: 25,
            mirrorActors: true
        }
    })


    controller.init().then(function (result) {
        $(document).trigger("init_form")
        if (result.recording?.recordingRequests) {
            $(document).trigger("analyse")
        }
    })

    $(document).on("init_form", function (e, data) {
        browser.tabs.query({ currentWindow: true, active: true })
            .then(function (tabs) {
                let tab = tabs[0]
                if (tab && !tab.url.startsWith('chrome://')){
                    $form.form('set value', 'url', tab.url)
                    window.parent.postMessage({url: tab.url}, '*');
                } 
            })

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
            $('.segment').dimmer('show')
        } else {
            $('.segment').dimmer('hide')
        }

        $('form').form('reset')
        $('form').form('clear')
        $("#diagramSVG").html("")
        $("#macro_rating").attr('data-rating', 0)
        $("#traffic_rating").attr('data-rating', 0)
        $("#basic_rating").attr('data-rating', 0)
        $("#bearer_rating").attr('data-rating', 0)
        $("#token_rating").attr('data-rating', 0)
        $('.rating').rating()
        $('.rating').rating('disable');
    })

    $(document).on("analyse", function (e, data) {

        let result = controller.analyse().then(function (result) {
            let diagramContent = "sequenceDiagram\n"
            let cookieIn = 0, authHeaderBasicIn = 0, authHeaderBearerIn = 0, tokenIn = 0
            diagramContent += "Browser->>Server: \n"
            result.forEach(function (item) {
                if (item.browser) {

                    if (item.browser.cookie) {
                        cookieIn++;
                        diagramContent += "Browser->>Server: Host: " + item.hostname.substring(0, 30) + "..\n";
                        diagramContent += "Note over Browser,Server: Cookie: " + item.browser.cookie.item.value.substring(0, 20).replaceAll(';', '') + "..\n";
                    }
                    if (item.browser.authorization) {
                        if (item.browser.authorization.item.value.toLowerCase().includes('basic')) authHeaderBasicIn++;
                        else if (item.browser.authorization.item.value.toLowerCase().includes('bearer')) authHeaderBearerIn++;
                        else tokenIn++;
                        diagramContent += "Browser->>Server: Host: " + item.hostname.substring(0, 30) + "..\n";
                        diagramContent += "Note over Browser,Server: Authorization: " + item.browser.authorization.item.value.substring(0, 15).replaceAll(';', '') + "..\n";
                    }
                }
                if (item.server) {
                    if (item.server.cookie) {
                        cookieIn++;
                        diagramContent += "Server-->>Browser: Host: " + item.hostname.substring(0, 30) + "..\n";
                        diagramContent += "Note over Server,Browser: Set-Cookie: " + item.server.cookie.item.value.substring(0, 15).replaceAll(';', '') + "..\n";
                    }
                    if (item.server.token) {
                        tokenIn++;
                        diagramContent += "Server-->>Browser: Host: " + item.hostname.substring(0, 30) + "..\n";
                        diagramContent += "Note over Server,Browser: Token: " + item.server.token.item.substring(0, 15).replaceAll(';', '') + "..\n";
                    }
                }
            });

            if (diagramContent != "") {
                let graph = mermaid.mermaidAPI.render('svgElement', diagramContent, function () { });
                $("#diagramSVG").html(graph)

                if (cookieIn) {
                    $("#macro_rating").attr('data-rating', 5);
                    $("#traffic_rating").attr('data-rating', 4);
                }
                if (authHeaderBasicIn) {
                    $("#basic_rating").attr('data-rating', 5);
                }
                if (authHeaderBearerIn) {
                    $("#bearer_rating").attr('data-rating', 5);
                }
                if (tokenIn) {
                    $("#token_rating").attr('data-rating', 5);
                }
                $('.rating').rating();
                $('.rating').rating('disable');
            }
        })

    })

    $('.start, .start_clean_cookie').on('click', function (e) {
        $form.form('validate form')
        if ($form.form('is valid')) {
            try {
                let url = new URL($form.form('get value', 'url'))
                controller.start(this.attributes['data-value'].value == 'true', url.toString())
            } catch (e) {
                $('#traffic_error_message').text("Could start recording " + e.message)
                $('.mini.modal.error').modal('show')
            }
        }
    })

    $('.reset_recording').on('click', function () {
        controller.reset().then(function (result) {
            $(document).trigger("init_form")
        })
    })

    $('.traffic_download').on('click', function () {
        try {
            var harLog = controller.export()
            var blob = new Blob([harLog], { type: 'text/plain' })
            var fName = "PTK_traffic.har"
            let url = controller.recording.startUrl;
            if (url) {
                fName = 'PTK_' + (new URL(url)).hostname + '.har'
            }

            if (blob.size > 0) {
                var downloadLink = document.createElement("a");
                downloadLink.download = fName;
                downloadLink.innerHTML = "Download File";
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.click();
            }
        } catch (e) {
            $('#traffic_error_message').text("Could not export recorded traffic")
            $('.mini.modal.error').modal('show')
        }
    })

    $('.harview').on('click', function () {
        try {
            if ($('.harview').text() == 'Diagram view') {
                $('#diagramSVG').css("display", "block")
                $('#harView').css("display", "none")
                $('.harview').text('HAR view')
            } else {
                var harLog = controller.export()
                $('#diagramSVG').css("display", "none")
                $('#harView').css("display", "block")
                editor.setOption("mode", "json")
                editor.setValue(harLog)
                $('.harview').text('Diagram view')
            }
        } catch (e) {
            $('#traffic_error_message').text("Could not export recorded traffic")
            $('.mini.modal.error').modal('show')
        }
    })

})


controller.setup = function (options, fileinputId, outputHolder, harLog) {

    /**
        * This is where the magic happens
        */
    function renderPerfCascadeChart(logData) {
        /** remove all children of `outputHolderEl`,
         * so you can upload new HAR files and get a new SVG  */
        while (outputHolder.childNodes.length > 0) {
            outputHolder.removeChild(outputHolder.childNodes[0])
        }

        /** pass HAR and options to `newPerfCascadeHar` to generate the SVG element*/
        try {
            var perfCascadeSvg = window.perfCascade.fromHar(logData, options)
            outputHolder.appendChild(perfCascadeSvg)
        } catch (e) {
            console.log(e)
        }

        /** append SVG to page - that's it */

    }


    /** handle client side file upload via file-reader */
    function onFileSubmit(evt) {
        var files = evt.target.files
        if (!files) {
            alert("Failed to load HAR file")
            return
        }

        // Just needed for zipped *.zhar files, you can use the standard FileReader api for normal .har files
        perfCascadeFileReader.readFile(files[0], evt.target.value, function (error, data) {
            if (error) {
                console.error(error)
            } else {
                renderPerfCascadeChart(data)
            }
        }, function (progress) {
            console.log("unzip progress: ", progress / 100, "%");
        })
    }


    if (harLog) renderPerfCascadeChart(harLog)


    /** hook up file input events */
    document.getElementById(fileinputId).addEventListener("change", onFileSubmit, false)
}

window.addEventListener('message', function (msg) {
    if (msg.data.url)
        $('[name="url"]').val(msg.data.url)
})