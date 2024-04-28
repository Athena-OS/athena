/* Author: Denis Podgurskii */
import * as jose from "../../../packages/jose/browser/index.js"
//import * as jscu from "../../../packages/js-crypto-utils/index.js"
import CryptoES from '../../../packages/crypto-es/index.js'


import { ptk_utils, ptk_jwtHelper } from "../../../background/utils.js"
import { ptk_decoder } from "../../../background/decoder.js"
import { ptk_controller_jwt } from "../../../controller/jwt.js"
import { ptk_controller_session } from "../../../controller/session.js"


const controller = new ptk_controller_jwt()
const session_controller = new ptk_controller_session()
const jwtHelper = new ptk_jwtHelper()
const decoder = new ptk_decoder()

let editorToken, editorHeader, editorPayload
let editorMode, tokens

/* 
editorMode == 1
when paste/change raw token

editorMode == 2
when change alg, header, payload, sign

*/

jQuery(function () {

    $('.menu .item').tab()

    $('#bruteforce_secret_dlg_load_list').on('click', function (e) {
        $("#load_list_file_input").trigger("click")
        e.stopPropagation()
        e.preventDefault()
    })

    $("#load_list_file_input").on('change', function (e) {
        e.stopPropagation()
        e.preventDefault()
        let file = $('#load_list_file_input').prop('files')[0]

        var fileReader = new FileReader()
        fileReader.onload = function () {
            controller.load_dict(fileReader.result).then(result => {
                console.log(result)
            })
        }

        fileReader.onprogress = (event) => {
            if (event.lengthComputable) {
                let progress = ((event.loaded / event.total) * 100);
                console.log(progress);
            }
        }
        fileReader.readAsText(file)

        $('#load_list_file_input').val(null)
    })

    //change algorithm
    $("#algorithm-select").on('change', function (e) {
        if (editorMode == null) {
            updAlg(this.value)
        }
        showSignature(this.value)
    })

    $(".alg_input").on('change', function (e) {
        if (editorMode == null) {
            updToken()
            selectText("sign")
        }
    })

    $(".alg_input_public_key").on('change', function (e) {
        if (editorMode == null) {
            updTokenControls()
            selectText("sign")
        }
    })

    $(".alg_input, alg_input_public_key").on('keyup input', function (e) {
        selectText("sign")
    })

    // $("#key_public_key").on('change', function (e) {
    //     updToken()
    //     selectText("sign")

    // })

    // $("#key_private_key").on('change', function (e) {
    //     updToken()
    //     selectText("sign")

    // })

    $(".alg_wrapper").on('click', function (e) {
        selectText("sign")
    })

    $("#source").on('change', function (e) {
        let selectedToken
        if (tokens) {
            for (let i = 0; i < tokens.length; i++) {

                if (tokens[i][0] == this.value)
                    selectedToken = tokens[i][2]
            }
        }
        if (selectedToken) {
            editorMode = null
            bindToken(selectedToken)
        } else {
            reset()
        }
    })


    $(".resetall").on('click', function (e) {
        controller.reset().then(result => {
            reset()
        })
    })

    //Secret bruteforce
    function clearSecret() {
        $('#bruteforce_secret_dlg_secret_msg').hide()
        $('#bruteforce_secret_dlg_found_text').text("")
        $('#bruteforce_secret_dlg_error_msg').hide()
        $('#bruteforce_secret_dlg_error_text').text("")
        $('#bruteforce_secret_dlg_progress').progress({
            percent: 0
        })
    }

    $("#bruteforce_secret_menu_btn").on('click', function (e) {
        clearSecret()
        $("#bruteforce_secret_dlg_token").val(editorToken.getDoc().getValue())
        $("#bruteforce_secret_dlg").modal('show')
    })

    $("#bruteforce_secret_dlg_generate").on('click', function (e) {
        clearSecret()
        let token = $("#bruteforce_secret_dlg_token").val()
        let { jwtToken, decodedToken } = jwtHelper.checkToken(token)
        let err = null
        if (jwtToken) {
            let jwt = JSON.parse(decodedToken)
            if (!jwt['header']['alg'].startsWith('HS')) {
                err = 'The JWT must be signed with using a HMAC-based algorithm (such as HS256). Received ' + jwt['header']['alg']
            }
        } else {
            err = 'Could not decode token'
        }
        if (err == null)
            controller.bruteforce(token)
        else {
            $('#bruteforce_secret_dlg_error_text').text(err)
            $('#bruteforce_secret_dlg_error_msg').show()
        }

    })

    //Confusion attack
    $("#algorithm_confusion_menu_btn").on('click', function (e) {
        $("#confusion_attack_dlg_token").val(editorToken.getDoc().getValue())
        $("#confusion_attack_dlg").modal('show')
    })

    $("#confusion_attack_dlg_generate").on('click', function (e) {
        let pKey = $("#confusion_attack_dlg_key").val()
        let token = $("#confusion_attack_dlg_token").val()
        let { jwtToken, decodedToken } = jwtHelper.checkToken(token)
        let jwt = {}
        let err = null
        if (jwtToken) {
            jwt = JSON.parse(decodedToken)
            if (!jwt['header']['alg'].startsWith('HS')) {
                jwt['header']['alg'] = 'HS256'
            }
        } else {
            err = 'Could not decode token'
        }

        if (!pKey) {
            err = 'Public key is required'
        }

        if (err == null) {
            generateConfusion(jwt['header'], jwt['payload'], pKey).then(result => {
                if (result?.length > 0) {

                    $("#confusion_attack_dlg_error_msg").hide()
                    $("#tbl_attack_tokens_confusion").show()
                    let params = {
                        "data": result, "columns": [
                            {
                                render: function (data, type, row) {
                                    return `
                                        <div style="width:40px" tabindex="1">
                                            <div class="ui mini icon button token_copy" tabindex="1">
                                            <i class=" large icon copy " data-position="bottom left" title="Copy" tabindex="1" ></i>
                                            </div>
                    
                                        </div>`
                                }
                            },
                            { width: "10%" },
                            { width: "88%", class: "token_to_copy" }]
                    }
                    bindTable('#tbl_attack_tokens_confusion', params)

                }
            }).catch(e => {
                $('#confusion_attack_dlg_error_text').text(e)
                $('#confusion_attack_dlg_error_msg').show()
            })
        }
        else {
            $('#confusion_attack_dlg_error_text').text(err)
            $('#confusion_attack_dlg_error_msg').show()
        }

    })

    $(document).on("click", ".token_copy", function (e) {
        let text = $(this).closest('tr').find('td:nth-child(3)').text()
        navigator.clipboard.writeText(text)
        return false
    })


    $(document).on("click", ".brute_force_secret_copy", function (e) {
        let text = $('#bruteforce_secret_dlg_found_text').text()
        navigator.clipboard.writeText(text)
        return false
    })



    async function generateConfusion(header, payload, secret) {
        let publicKey = null

        let format = jwtHelper.detectCertFormat(secret)
        if (format == ptk_jwtHelper.JWK) {
            publicKey = await jose.importJWK(JSON.parse(secret), header.alg).catch(e => {
                throw ('Could not import JWK: ' + e.message)
            })
            publicKey = await jose.exportSPKI(publicKey).catch(e => {
                throw ('Could not export SPKI: ' + e.message)
            })
        } else if (format == ptk_jwtHelper.SPKI) {
            publicKey = secret
        }
        return jwtHelper.generateConfusionAttacks(header, payload, publicKey)
    }



    //JWK injection attak

    $("#jwt_injection_menu_btn").on('click', function (e) {
        $("#jwk_injection_attack_dlg_token").val(editorToken.getDoc().getValue())
        $("#jwk_injection_attack_dlg").modal('show')
    })

    $("#jwk_injection_attack_dlg_pair").on('click', function (e) {
        let $form = $('#jwk_injection_attack_dlg_form')
        let values = $form.form('get values')
        $form.form({
            inline: true,
            on: 'blur',
            keyboardShortcuts: false,
            fields: {
                algorithm: {
                    identifier: 'jwk_injection_attack_dlg_alg',
                    rules: [{ type: 'empty', prompt: 'Algorithm is required' }]
                }
            }
        })
        $form.form('validate form')
        $('#jwk_injection_attack_dlg_alg~.prompt.label').removeClass('pointing')
        $('#jwk_injection_attack_dlg_alg~.prompt.label').addClass('bottom pointing')
        if ($form.form('is valid')) {
            let alg = values['jwk_injection_attack_dlg_alg']
            generateKeyPair(alg).then(result => {
                $('#jwk_injection_attack_dlg_public_key').val(JSON.stringify(result['jwk_public_key'], null, 2))
                $('#jwk_injection_attack_dlg_private_key').val(JSON.stringify(result['jwk_private_key'], null, 2))
            })
        }

    })


    $("#jwk_injection_attack_dlg_generate").on('click', function (e) {
        jose.generateSecret('HS256', { "extractable": true }).then(result => {
            console.log(result)
            jose.importJWK(result, 'HS256').then(result => {
                console.log(result)
            })
        })


        let $form = $('#jwk_injection_attack_dlg_form')
        let values = $form.form('get values')
        $form.form({
            inline: true,
            on: 'blur',
            keyboardShortcuts: false,
            fields: {
                token: {
                    identifier: 'jwk_injection_attack_dlg_token',
                    rules: [{ type: 'empty', prompt: 'Token is required' }]
                },
                public: {
                    identifier: 'jwk_injection_attack_dlg_public_key',
                    rules: [{ type: 'empty', prompt: 'Public key is required' }]
                },
                private: {
                    identifier: 'jwk_injection_attack_dlg_private_key',
                    rules: [{ type: 'empty', prompt: 'Private key is required' }]
                }
            }
        })
        $form.form('validate form')
        if ($form.form('is valid')) {
            let token = values['jwk_injection_attack_dlg_token']
            let alg = values['jwk_injection_attack_dlg_alg']
            let { jwtToken, decodedToken } = jwtHelper.checkToken(token)
            let jwt = {}
            let err = null
            if (jwtToken) {
                jwt = JSON.parse(decodedToken)
                if (jwt['header']['alg'].startsWith('HS')) {
                    if (alg != "") {
                        jwt['header']['alg'] = alg
                    }
                    else {
                        err = "Token alg is not asymmetric encryption: " + jwt['header']['alg']
                    }
                }
            } else {
                err = 'Could not decode token'
            }

            let keys = []
            let jwk = {}
            let kid = 'ptk_jwk_injection'
            keys['public'] = values['jwk_injection_attack_dlg_public_key']
            keys['private'] = values['jwk_injection_attack_dlg_private_key']


            if (err) {
                $form.form('add errors', {
                    jwk_injection_attack_dlg_token: err
                })
                return
            }

            try {
                jwk = JSON.parse(values['jwk_injection_attack_dlg_public_key'])
                jwk['kid'] = kid
                jwt['header']['kid'] = kid
                jwt['header']['jwk'] = jwk
                jwt['header']['typ'] = 'JWT'
            } catch (e) {
                $('#jwk_injection_attack_dlg_error_text').text(e)
                $('#jwk_injection_attack_dlg_error_msg').show()
                return
            }


            signToken(JSON.stringify(jwt['header']), JSON.stringify(jwt['payload']), "", keys).then(result => {
                $('#jwk_injection_attack_dlg_error_msg').hide()
                $('#jwk_injection_attack_dlg_token_text').text(result)
                $('#jwk_injection_attack_dlg_positive_msg').show()

            }).catch(e => {
                $('#jwk_injection_attack_dlg_positive_msg').hide()
                $('#jwk_injection_attack_dlg_error_text').text(e.message)
                $('#jwk_injection_attack_dlg_error_msg').show()
            })

        }
    })


    $(document).on("click", ".jwk_injection_copy", function (e) {
        let text = $('#jwk_injection_attack_dlg_token_text').text()
        navigator.clipboard.writeText(text)
        return false
    })




    //Generate keys 
    let $form = $('#generate_keys_dlg_form')
    $form.form({
        inline: true,
        on: 'blur',
        keyboardShortcuts: false,
        fields: {
            algorithm: {
                identifier: 'generate_keys_dlg_algorithm',
                rules: [{ type: 'empty', prompt: 'Select required algorithm' }]
            }
        }
    })
    $("#generate_keys").on('click', function (e) {
        $("#generate_keys_dlg").modal('show')
    })

    $("#dlg_btn_key_download").on('click', function (e) {
        let data = $("#dlg_publicKey_pem").val()
        let publicJWK = JSON.parse($("#dlg_publicKey_jwk").val())
        let privateJWK = JSON.parse($("#dlg_privateKey_jwk").val())

        publicJWK.kid = "ptk_jwt_inspector"
        privateJWK.kid = "ptk_jwt_inspector"

        data += "\n\n"
        data += $("#dlg_privateKey_pem").val()

        data += "\n\n"
        data += `"public":  ${JSON.stringify(publicJWK, null, 2)}`
        data += "\n\n"
        data += `"private":  ${JSON.stringify(privateJWK, null, 2)}`

        let blob = new Blob([data], { type: 'text/plain' })
        let fName = "PTK_keys.txt"

        let downloadLink = document.createElement("a")
        downloadLink.download = fName
        downloadLink.innerHTML = "Download File"
        downloadLink.href = window.URL.createObjectURL(blob)
        downloadLink.click()
    })


    $("#dlg_btn_key_generate").on('click', function (e) {

        let $form = $('#generate_keys_dlg_form')
        $form.form('validate form')
        if ($form.form('is valid')) {
            let values = $form.form('get values')
            generateKeyPair(values['generate_keys_dlg_algorithm']).then(result => {
                result['jwk_public_key']['kid'] = 'ptk_jwt_inspector'
                result['jwk_private_key']['kid'] = 'ptk_jwt_inspector'

                $('#dlg_publicKey_pem').val(result['pem_public_key'])
                $('#dlg_publicKey_jwk').val(JSON.stringify(result['jwk_public_key'], null, 2))
                $('#dlg_privateKey_pem').val(result['pem_private_key'])
                $('#dlg_privateKey_jwk').val(JSON.stringify(result['jwk_private_key'], null, 2))
            })
        }
    })

    // PEM <-> JWK

    $("#pem_jwk_convertor").on('click', function (e) {
        $("#pem_jwk_convertor_dlg").modal('show')
    })


    $("#pem_jwk_convertor_pem_btn").on('click', function (e) {
        let $pemform = $('#pem_jwk_convertor_form')
        $pemform.form({
            inline: true,
            on: 'blur',
            keyboardShortcuts: false,
            fields: {
                algorithm: {
                    identifier: 'pem_jwk_convertor_algorithm',
                    rules: [{ type: 'empty', prompt: 'Select required algorithm' }]
                },
                pem_jwk_convertor_pem: {
                    identifier: 'pem_jwk_convertor_pem',
                    rules: [{ type: 'empty', prompt: 'PEM certificate is required' }]
                }
            }
        })
        $pemform.form('validate form')

        if ($pemform.form('is valid')) {
            let alg = $("#pem_jwk_convertor_algorithm").find(':selected').val()
            let cert = $("#pem_jwk_convertor_pem").val()
            let format = jwtHelper.detectCertFormat(cert)
            if (format == ptk_jwtHelper.SPKI) {
                jose.importSPKI(cert, alg, { extractable: true })
                    .then(result => {
                        jose.exportJWK(result).then(key => {
                            $('#pem_jwk_convertor_jwk').val(JSON.stringify(key, null, 2))
                        })
                    })
                    .catch(e => {
                        $pemform.form('add errors', {
                            pem_jwk_convertor_pem: e.message,
                        })
                    })
            }
            if (format == ptk_jwtHelper.PKCS8) {
                jose.importPKCS8(cert, alg, { extractable: true })
                    .then(result => {
                        jose.exportJWK(result).then(key => {
                            $('#pem_jwk_convertor_jwk').val(JSON.stringify(key, null, 2))
                        })
                    })
                    .catch(e => {
                        let msg = 'Could not convert with selected algorithm'
                        if (e.message != "") msg = e.message
                        $pemform.form('add errors', {
                            pem_jwk_convertor_pem: msg,
                        })
                    })
            }
        }
    })

    $("#pem_jwk_convertor_jwk_btn").on('click', function (e) {
        let $jwkform = $('#pem_jwk_convertor_form')
        $jwkform.form({
            inline: true,
            on: 'blur',
            keyboardShortcuts: false,
            fields: {
                algorithm: {
                    identifier: 'pem_jwk_convertor_algorithm',
                    rules: [{ type: 'empty', prompt: 'Select required algorithm' }]
                },
                pem_jwk_convertor_jwk: {
                    identifier: 'pem_jwk_convertor_jwk',
                    rules: [{ type: 'empty', prompt: 'JWK certificate is required' }]
                }
            }
        })
        $jwkform.form('validate form')
        if ($jwkform.form('is valid')) {
            let alg = $("#pem_jwk_convertor_algorithm").find(':selected').val()
            try {
                let jwk = JSON.parse($("#pem_jwk_convertor_jwk").val())
                jwk['ext'] = true
                jose.importJWK(jwk, alg).then(result => {
                    if (result.type == 'private') {
                        jose.exportPKCS8(result).then(key => {
                            $('#pem_jwk_convertor_pem').val(key)
                        })
                    } else {
                        jose.exportSPKI(result).then(key => {
                            $("#pem_jwk_convertor_pem").val(key)
                        })
                    }
                }).catch(e => {
                    $jwkform.form('add errors', {
                        pem_jwk_convertor_jwk: e.message,
                    })
                })
            } catch (e) {
                $jwkform.form('add errors', {
                    pem_jwk_convertor_jwk: e.message,
                })
            }
        }
    })

    $("#pem_jwk_convertor_jwk").on('paste change keyup', function (e) {
        try {
            let $jwkform = $('#pem_jwk_convertor_form')
            let jwk = JSON.parse($("#pem_jwk_convertor_jwk").val())
            if (jwk['alg']) {
                $("#pem_jwk_convertor_algorithm").find(':selected').val()
                $jwkform.form('set values', {
                    'pem_jwk_convertor_algorithm': jwk['alg']
                })
            }
        } catch (e) { }
    })










    $("#this_source_upd").on('click', function (e) {
        let $form = $('#jwt_form'), values = $form.form('get values')
        let storage = values['source']
        let name = $("#source").find(':selected').attr('data-value')
        let value = editorToken.getDoc().getValue()
        updateSource(name, value, storage).then(result => {
            init()
        })

    })

    $("#all_sources_upd").on('click', function (e) {
        let promises = []
        let value = editorToken.getDoc().getValue()
        $('#source').find('option').each(function () {
            let storage = $(this).val()
            let name = $(this).attr('data-value')
            if (name != 'none') {
                promises.push(updateSource(name, value, storage))
            }
        })
        Promise.all(promises).then((values) => {
            init()
        })
    })




    /////

    // function updByEditorMode() {
    //     console.log('mode: ' + editorMode)
    //     if (editorMode == 2) {
    //         updToken()
    //     } else if (editorMode == 1) {
    //         updTokenControls()
    //     }
    // }

    async function generateKeyPair(alg) {
        return jose.generateKeyPair(alg, {
            extractable: true,
        }).then(async ({ publicKey, privateKey }) => {
            let keys = {}
            keys['pem_public_key'] = await jose.exportSPKI(publicKey)
            keys['jwk_public_key'] = await jose.exportJWK(publicKey)
            keys['pem_private_key'] = await jose.exportPKCS8(privateKey)
            keys['jwk_private_key'] = await jose.exportJWK(privateKey)
            return keys
        })
    }

    function updateSource(name, value, storage) {
        if (storage == 'none') {
            return controller.save(value)
        }
        if (controller.tab?.tabId) {
            if (storage == 'localStorage' || storage == 'sessionStorage') {
                return browser.tabs.sendMessage(controller.tab.tabId, {
                    channel: "ptk_popup2content",
                    type: 'update_storage',
                    storage: storage,
                    name: name,
                    value: value
                })
            }
            if (storage == 'cookie') {
                return session_controller.init().then(result => {
                    for (let i = 0; i < result.cookies?.length; i++) {
                        if (result.cookies[i]['name'] == name) {
                            result.cookies[i]['value'] = value
                            return session_controller.saveByIndex(i, result.cookies[i])
                        }
                    }
                    return Promise.resolve()
                })
            }
        }
    }

    function updTokenControls() {
        editorMode = 2
        let token = editorToken.getDoc().getValue()
        let { jwtToken, decodedToken } = jwtHelper.checkToken(token)
        if (jwtToken) {
            //Decoded
            let jwt = JSON.parse(decodedToken)

            //Alg dropdown
            let $form = $('#jwt_form')
            $form.form('set values', {
                'algorithm-select': jwt["header"]["alg"]
            })

            //Header
            $('#encodeHeader').val(JSON.stringify(jwt["header"], null, 2))
            editorHeader.getDoc().setValue(JSON.stringify(jwt["header"], null, 2))

            //Payload
            $('#encodePayload').val(JSON.stringify(jwt["payload"], null, 2))
            editorPayload.getDoc().setValue(JSON.stringify(jwt["payload"], null, 2))

            //Signature
            showSignature(jwt["header"]["alg"])

            //Sign token
            let values = $form.form('get values')
            let payloadPlain = editorPayload.getValue().replace(/\n/g, '')
            let headerPlain = editorHeader.getValue().replace(/\n/g, '')
            let secret = values['alg_secret']
            let keys = { "public": values['key_public_key'], "private": values['key_private_key'] }

            verifyToken(jwt["header"]["alg"], token, secret, values['key_public_key']).then(result => {
                $('#signature_msg').text("Signature verified")
                $('#signature_msg_wrapper').removeClass('negative')
                $('#signature_msg_wrapper').addClass('positive')
                //$('.button.updatein').removeClass('disabled')
            }).catch(e => {
                $('#signature_msg').text(e.message)
                $('#signature_msg_wrapper').removeClass('positive')
                $('#signature_msg_wrapper').addClass('negative')
                //$('.button.updatein').addClass('disabled')
            })

        }
        setTimeout(function () { editorMode = null }, 100)
    }

    function updToken() {
        console.log('update token')

        let $form = $('#jwt_form'), values = $form.form('get values')
        let payloadPlain = editorPayload.getValue().replace(/\n/g, '')
        let headerPlain = editorHeader.getValue().replace(/\n/g, '')
        let secret = values['alg_secret']
        let keys = { "public": values['key_public_key'], "private": values['key_private_key'] }

        if (payloadPlain) {
            editorMode = 1
            signToken(headerPlain, payloadPlain, secret, keys).then((result) => {
                //console.log(result)
                $('#signature_msg').text("Signature verified")
                $('#signature_msg_wrapper').removeClass('negative')
                $('#signature_msg_wrapper').addClass('positive')
                //$('.button.updatein').removeClass('disabled')
                $('#rawToken').val(result)
                editorToken.getDoc().setValue(result)
                editorMode = null
            }).catch(e => {
                let h = decoder.base64url_encode(headerPlain)
                let p = decoder.base64url_encode(payloadPlain)
                let current = editorToken.getDoc().getValue().split('.')[2]
                let result = h + "." + p + "." + current
                $('#rawToken').val(result)
                editorToken.getDoc().setValue(result)
                editorMode = null

                $('#signature_msg').text(e.message)
                $('#signature_msg_wrapper').removeClass('positive')
                $('#signature_msg_wrapper').addClass('negative')
                //$('.button.updatein').addClass('disabled')
                editorMode = null
                console.log(e)
            })

        }
    }


    async function signToken(header, payload, secret, keys) {
        return jwtHelper.signToken(header, payload, secret, keys)
    }


    async function verifyToken(alg, token, secret, publicKey) {
        if (alg.toLowerCase() == 'none') {
            return true
        }
        else if (['HS256', 'HS384', 'HS512'].includes(alg)) {
            secret = new TextEncoder().encode(secret)
            return jose.jwtVerify(token, secret)
        } else {
            let format = jwtHelper.detectCertFormat(publicKey)
            if (format == ptk_jwtHelper.JWK) {
                publicKey = await jose.importJWK(JSON.parse(publicKey), alg).catch(e => {
                    throw ('Could not import JWK: ' + e.message)
                })
            } else if (format == ptk_jwtHelper.SPKI) {
                publicKey = await jose.importSPKI(publicKey, alg, { extractable: true })
            }

            return jose.jwtVerify(token, publicKey)
        }
    }

    function updAlg(alg) {
        let $form = $('#jwt_form'), values = $form.form('get values')
        let curVal = editorHeader.getValue()
        let header = JSON.parse(curVal)
        header.alg = alg
        $('#encodeHeader').val(JSON.stringify(header, null, 2))
        editorHeader.getDoc().setValue(JSON.stringify(header, null, 2))
        //updToken()
    }


    function initControls() {
        //raw token
        if (editorToken) editorToken.toTextArea()
        editorToken = CodeMirror.fromTextArea(document.getElementById('rawToken'), {
            lineWrapping: true, mode: "simple",
            scrollbarStyle: 'native',
            styleSelectedText: true,
        })
        //editorToken.setSize('auto', '100%')
        editorToken.on("change", function (instance, e) {
            if (editorMode == null)
                //controller.save(value)
                updTokenControls()
        })

        //header 
        if (editorHeader) editorHeader.toTextArea()
        editorHeader = CodeMirror.fromTextArea(document.getElementById('encodeHeader'), {
            mode: "application/json",
            scrollbarStyle: 'native'
        })
        editorHeader.setSize('auto', '100%')
        editorHeader.on("focus", function (instance, e) {
            selectText("header")
        })
        editorHeader.on("blur", function (instance, e) {
            removeMarks()
        })
        editorHeader.on("change", function (instance, e) {
            if (editorMode == null) {
                updToken()
                selectText("header")
            }
        })

        //payload
        if (editorPayload) editorPayload.toTextArea()
        editorPayload = CodeMirror.fromTextArea(document.getElementById('encodePayload'), {
            mode: "application/json",
            scrollbarStyle: 'native'
        })
        editorPayload.setSize('auto', '90vh')
        editorPayload.on("focus", function (instance, e) {
            selectText("payload")
        })
        editorPayload.on("blur", function (instance, e) {
            removeMarks()
        })
        editorPayload.on("change", function (instance, e) {
            if (editorMode == null) {
                updToken()
                selectText("payload")
            }
        })


    }

    function selectText(part) {
        removeMarks()
        let token = editorToken.getDoc().getValue()
        let [header, payload, sign] = token.split('.')
        let index = 0, len = 0, classname = ''
        if (part == "header") {
            index = token.indexOf(header)
            classname = "styled-header"
            len = header.length
        }
        if (part == "payload" && payload?.length > 0) {
            index = token.indexOf(payload)
            classname = "styled-payload"
            len = payload.length
        }
        if (part == "sign") {
            index = token.indexOf(sign)
            classname = "styled-signature"
            len = sign.length
        }
        setTimeout(function () {
            editorToken.markText({ line: 0, ch: index }, { line: 0, ch: index + len }, { className: classname })
        }, 10)
    }

    function removeMarks() {
        let marks = editorToken.getAllMarks()
        for (let i = 0; i < marks.length; i++) {
            marks[i].clear()
        }
    }


    function init() {
        controller.init().then(result => {
            tokens = []
            initControls()
            if (result?.storage?.token) {
                tokens.push(['none', "none", result.storage.token])
            }
            bindTokens(tokens)
            if (result?.tab?.tabId) {
                $('#dashboard_message_text').text(result.tab.url)
                checkCookies(result.cookies)
                browser.tabs.sendMessage(result.tab.tabId, {
                    channel: "ptk_popup2content",
                    type: "get_storage"
                }).catch(e => { })
                // .then(res => {
                //     checkStorage(res)
                //     bindTokens(tokens)
                // }).catch(e => e)
            }
        })
    }

    init()


})




//////////////////////////////


function showSignature(val) {
    if (val.toLowerCase() == 'none') {
        $('#alg_secret_wrapper').hide()
        $('#key_alg_wrapper').hide()
        $('#none_alg').show()
    }
    else if (val.startsWith('HS')) {
        $('#none_alg').hide()
        $('#key_alg_wrapper').hide()
        $('#alg_secret_wrapper').show()
        $('#secret_method').text($("#algorithm-select").find(':selected').attr('data-value'))
    }
    else {
        $('#none_alg').hide()
        $('#alg_secret_wrapper').hide()
        $('#key_alg_wrapper').show()
        $('#key_method').text($("#algorithm-select").find(':selected').attr('data-value'))
    }
}

function reset() {
    editorMode = 1
    $('#rawToken').val("")
    editorToken.getDoc().setValue("")
    //$('.button.updatein').addClass('disabled')

    editorMode = 2
    let $form = $('#jwt_form')
    $form.form('set values', {
        'algorithm-select': "none",
        'encodeHeader': '',
        'encodePayload': ""

    })
    let hVal = JSON.stringify({
        "typ": "JWT",
        "alg": "none"
    }, null, 2)
    editorHeader.getDoc().setValue(hVal)
    editorPayload.getDoc().setValue("")
    showSignature('none')
    editorMode = null

}



function bindTokens(tokens) {
    console.log(tokens)
    let selectedToken
    for (let i = 0; i < tokens.length; i++) {
        editorMode = null
        $("#source").dropdown('clear')
        $("#source option[value='" + tokens[i][0] + "']").remove()
        $("#source").append(`<option value="${tokens[i][0]}" data-value="${tokens[i][1]}" selected>[${tokens[i][1]}] in ${tokens[i][0]}</option>`)
        selectedToken = tokens[i][2]
    }
    if (selectedToken) {
        bindToken(selectedToken)
    } else {
        reset()
    }
    editorMode = null
}

function bindToken(token) {
    $('#rawToken').val(token)
    editorToken.getDoc().setValue(token)
}

function checkStorage(storage) {
    if (storage.localStorage) {
        let s = JSON.parse(storage.localStorage)
        let k = Object.keys(s)
        for (let i = 0; i < k.length; i++) {
            let { jwtToken, decodedToken } = jwtHelper.checkToken(s[k[i]])
            if (jwtToken) {
                tokens.push(['localStorage', k[i], jwtToken[0]])
            }
        }
    }
    if (storage.sessionStorage) {
        let s = JSON.parse(storage.sessionStorage)
        let k = Object.keys(s)
        for (let i = 0; i < k.length; i++) {
            let { jwtToken, decodedToken } = jwtHelper.checkToken(s[k[i]])
            if (jwtToken) {
                tokens.push(['sessionStorage', k[i], jwtToken[0]])
            }
        }
    }
}

function checkCookies(cookies) {
    for (let i = 0; i < cookies?.length; i++) {
        let c = cookies[i]
        let { jwtToken, decodedToken } = jwtHelper.checkToken(c.value)
        if (jwtToken) {
            tokens.push(['cookie', c.name, c.value])
        }
    }
}


browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if (message.channel == "ptk_content2popup" && message.type == "return_storage") {
        checkStorage(message.data)
        bindTokens(tokens)
    }

    if (message.channel == "ptk_background2popup_jwt") {
        if (message.type == "progress") {
            $('#bruteforce_secret_dlg_progress').progress({
                percent: message.percent,
                total: message.totalCount,
                value: message.current,
                text: {
                    active: '{value} of {total} done'
                }
            })
        }
        if (message.type == "secret found") {
            $('#bruteforce_secret_dlg_secret_msg').show()
            $('#bruteforce_secret_dlg_found_text').text(message.secret)
        }
    }
})

