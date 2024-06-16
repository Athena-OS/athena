/* Author: Denis Podgurskii */

jQuery(function () {

    const editor = SwaggerEditorBundle({
        dom_id: '#swaggerui',
        layout: 'StandaloneLayout',
        presets: [
            SwaggerEditorStandalonePreset
        ]
    })

    $(document).on("submit", function (e) {
        e.preventDefault()
        return false
    })

    window.editor = editor

})
