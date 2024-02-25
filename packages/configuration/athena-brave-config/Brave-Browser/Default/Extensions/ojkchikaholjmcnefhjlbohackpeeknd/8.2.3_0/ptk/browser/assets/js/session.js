/* Author: Denis Podgurskii */
import { ptk_controller_session } from "../../../controller/session.js"
const controller = new ptk_controller_session()

jQuery(function () {

    $('#cookie_search').on('keyup',function() {
        var table = $('#tbl_cookies').DataTable()
        table.search($(this).val()).draw()
    })

    $('.x.clear_search').on('click',function() {
        $('#cookie_search').val('')    
        var table = $('#tbl_cookies').DataTable()
        table.search('').draw()
    })
    

    // Single cookie
    $(document).on("click", ".block_cookie", function () {
        let index = $(this).closest('form').attr('index')
        controller.blockByIndex(index).then(function (result) {
            bindAll()
        })
    })

    $(document).on("click", ".readonly_cookie", function () {
        let index = $(this).closest('form').attr('index')
        let lockedIndex = $(this).children('i').attr('lockedIndex')
        if (lockedIndex != undefined) {
            controller.removeReadonlyRule(lockedIndex).then(function (result) {
                bindAll(index)
            })
        } else {
            controller.readonlyByIndex(index).then(function (result) {
                bindAll(index)
            })
        }
    })

    $(document).on("click", ".remove_cookie", function () {
        let index = $(this).closest('form').attr('index')
        controller.removeByIndex(index).then(function (result) {
            bindAll()
        })
    })


    $(document).on("click", ".save_cookie", function (event) {
        let index = $(this).closest('form').attr('index')

        if ($(`#cookie_form_${index}`).form('is valid')) {
            let values = $(`#cookie_form_${index}`).form('get values')
            values['expirationDate'] = new Date(values['expDate']).getTime() / 1000
            values.httpOnly == 'on' ? values.httpOnly = true : values.httpOnly = false
            values.secure == 'on' ? values.secure = true : values.secure = false
            if (index == 'new') {
                values['name'] = values['cookie_name']
            }
            controller.saveByIndex(index, values).then(function (result) {
                bindAll(index)
            })
        }

    })

    $(document).on("change", "[name='hostOnly']", function () {
        let index = $(this).closest('form').attr('index')
        let checked = $('#cookie_form_' + index).form('get value', 'hostOnly')
        if (!checked)
            $(`#cookie_form_${index} [name="domain"]`).removeClass('disabled')
        else
            $(`#cookie_form_${index} [name="domain"]`).addClass('disabled')

    })


    $(document).on("change", "[name='session']", function () {
        let index = $(this).closest('form').attr('index')
        let checked = $('#cookie_form_' + index).form('get value', 'session')
        if (!checked) {
            $(`#cookie_form_${index} [name="expDate"]`).removeClass('disabled')
            $(`#cookie_form_${index} .ui.calendar`).removeClass('disabled')
        } else {
            $(`#cookie_form_${index} .ui.calendar`).addClass('disabled')
            $(`#cookie_form_${index} [name="expDate"]`).addClass('disabled')
        }

    })

    //Add new cookie
    $('.plus.cookie').on('click', function () {
        $('#addNewCookieDlg .form_content').html(getCookieForm('new'))
        $('.ui.checkbox').checkbox()

        $('#addNewCookieDlg').modal('show')
        initCookieForm('new')
        $('.ui.calendar').calendar()
        $(`#cookie_form_new .readonly_cookie`).addClass('disabled')
        $(`#cookie_form_new .block_cookie`).addClass('disabled')
        $(`#cookie_form_new .remove_cookie`).addClass('disabled')
    })

    // All cookies //
    $(document).on("click", ".trash.all", function () {
        controller.removeAll().then(function (result) {
            bindAll()
        })
    })

    $(document).on("click", ".redo.all", function () {
        controller.init().then(function (result) {
            bindAll()
        })
    })


    $(document).on("click", ".download.cookie", function () {
        let cookies = JSON.stringify(controller.cookies, null, 4)
        let blob = new Blob([cookies], { type: 'text/plain' })
        let downloadLink = document.createElement("a")
        downloadLink.download = "PTK_cookies_" + (new URL(controller.url)).hostname + ".txt"
        downloadLink.href = window.URL.createObjectURL(blob)
        downloadLink.click()

    })

    $(document).on("click", ".upload.cookie", function () {
        initImportForm()
        $('#importCookies').modal('show')
    })

    $(document).on("click", ".import_cookie", function (event) {
        let values = $(`#import_cookie_form`).form('get values')

        if (values['json_cookies']) {
            try {
                let cookies = JSON.parse(values['json_cookies'])
                controller.import(cookies).then(function (result) {
                    bindAll()
                })
                $('#importCookies').modal('hide')
            } catch (e) {
            }
        }

    })

    //Settings page
    $('.settings.cookie').on('click', function () {
        $('.tabular.menu .item').tab()
        $('#cookieSettings').modal('show')
        bindBlockedCookies()
        bindReadonlyCookies()
    })


    //Blocked rules
    $(document).on("click", ".trash.blocked_rule", function () {
        let index = $(this).closest('i').attr('index')
        controller.removeBlockedRule(index).then(function (result) {
            bindBlockedCookies()
        })
    })

    $(document).on("click", ".trash.all_blocked_rules", function () {
        controller.removeBlockedRules().then(function (result) {
            bindBlockedCookies()
        })
    })


    //Readonly rules
    $(document).on("click", ".trash.readonly_rule", function () {
        let index = $(this).closest('i').attr('index')
        controller.removeReadonlyRule(index).then(function (result) {
            bindReadonlyCookies()
            bindAll()
        })
    })

    $(document).on("click", ".trash.all_readonly_rules", function () {
        controller.removeReadonlyRules().then(function (result) {
            bindReadonlyCookies()
            bindAll()
        })
    })



    $(document).on('click', ".expandbtn", function (event) {
        let table = $('#tbl_cookies').DataTable()
        let tr = $(this).closest('tr'), row = table.row(tr)
        expandCHildRow(tr.find('i'), row)
        event.stopPropagation()
    })


    bindAll()
})

/* Helpers */

function expandCHildRow(icon, row) {
    if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide()
        icon.removeClass('shown minus')
        icon.addClass('shown plus')
    } else {
        // Open this row
        row.child(format(row.data())).show()
        icon.removeClass('shown plus')
        icon.addClass('shown minus')
        bindCookie(row.data())
    }
}


function format(d) {
    let index = d[0]
    return getCookieForm(index)
}

function bindInfo() {
    if (controller.url) {
        $('#dashboard_message_text').text(controller.url)
    } else {
        $('#dashboard_message_text').html(`Reload the tab to activate tracking &nbsp;<i class="exclamation red circle icon"></i>`)
    }
}

function bindAll(index) {
    controller.init().then(function (result) {
        bindInfo()
        if (controller.cookies) {
            controller.dt = controller.cookies.map((x, index) => ([index, x.domain, x.name]))
            bindAllCookies(index)
        }
    }).catch(e => console.log(e))
}


function bindAllCookies(index) {
    let dt = controller.dt
    dt.sort(function (a, b) {
        if (a[1] === b[1]) { return 0; }
        else { return (a[1] < b[1]) ? -1 : 1; }
    })


    let params = {
        data: dt,
        "searching": true,
        "columns": [{
            render: function (data, type, row) {
                return `<i class="expandchild plus square large icon" index='${data}'></i>`
            },
            "className": "expandbtn cookie_column_first"
        }, { title: "Domain", "className": "expandbtn cookie_column_second" }, { title: "Name", "className": "expandbtn cookie_column_third" }],
    }
    bindTable('#tbl_cookies', params)

    if (index != undefined)
        $(`.expandchild.plus.icon[index="${index}"]`).trigger('click')
    else
        $('.expandchild.plus.icon:first').trigger('click')

}

function bindCookie(d) {
    let index = d[0]
    let cookie = controller.cookies[index]
    let expDate = new Date(cookie.expirationDate * 1000.0)
    if (cookie.session) {
        expDate = new Date()
        expDate.setDate(expDate.getDate() + 1);
    }
    cookie.expDate = expDate

    initCookieForm(index)

    $(`#cookie_form_${index}`).form('set values', cookie)

    try {
        let lockedIndex = controller.storage.readonly.findIndex(x => x.domain == cookie.domain && x.name == cookie.name)
        if (lockedIndex > -1) {
            $(`#cookie_form_${index} .readonly_cookie > i`).removeClass('open')
            $(`#cookie_form_${index} .readonly_cookie > i`).addClass('green')
            $(`#cookie_form_${index} .readonly_cookie > i`).attr('title', 'Unlock cookie')
            $(`#cookie_form_${index} .readonly_cookie > i`).attr('lockedIndex', lockedIndex)

            $(`#cookie_form_${index} .block_cookie`).addClass('disabled')
            $(`#cookie_form_${index} .remove_cookie`).addClass('disabled')
            $(`#cookie_form_${index} .save_cookie`).addClass('disabled')
        }
        if (cookie.session) {
            $(`#cookie_form_${index} [name='expDate']`).addClass('disabled')
            $(`#cookie_form_${index} .ui.calendar`).addClass('disabled')
        }

        if (cookie.hostOnly) {
            $(`#cookie_form_${index} [name='domain']`).addClass('disabled')
        }
    } catch (e) { }

}

function initCookieForm(index) {
    $(`#cookie_form_${index}`).form.settings.rules.expDate = function (param) {
        let expirationDate = new Date(param).getTime() / 1000
        if (isNaN(expirationDate)) {
            return false
        }
        return true
    }

    let fields = {
        domain: { identifier: 'domain', rules: [{ type: 'empty', prompt: 'Required value' }] },
        value: { identifier: 'value', rules: [{ type: 'empty', prompt: 'Required value' }] },
        path: { identifier: 'path', rules: [{ type: 'empty', prompt: 'Required value' }] },
        expDate: { identifier: 'expDate', rules: [{ type: 'expDate', prompt: 'Wrong datetime value' }] }
    }

    if (index == 'new') {
        $(`#cookie_form_${index} .cookie_name`).show()

        fields['cookie_name'] = {
            identifier: 'cookie_name',
            rules: [
                { type: 'empty', prompt: 'Required value' }
            ]
        }
    }

    $(`#cookie_form_${index}`)
        .form({
            on: 'submit', inline: true, fields: fields, onSuccess: function (event) { event.preventDefault() }
        })
}

function initImportForm() {

    $(`#import_cookie_form`).form.settings.rules.import = function (param) {
        try {
            JSON.parse(param)
        } catch (e) {
            return false
        }
        return true
    }

    let fields = {
        json_cookies: {
            identifier: 'json_cookies',
            rules: [{ type: 'import', prompt: 'Error while parsing JSON value' }]
        }
    }


    $(`#import_cookie_form`)
        .form({
            on: 'submit', inline: true, fields: fields,
            onSuccess: function (event) { event.preventDefault() }
        })

}


// Blocked cookies
function bindBlockedCookies() {
    controller.init().then(function (result) {
        if (controller.storage.blocked) {
            let dt = controller.storage.blocked.map((x, index) => ([index, x.domain, x.name]))
            let params = {
                "data": dt,
                "columns": [{
                    render: function (data, type, row) {
                        return `<div class="ui  small fluid button clear" style="width:50px"><i class="trash alternate icon blocked_rule" title="Remove this rule" index='${data}'></i></div>`
                    }, "className": "cookie_column_first"
                }, { title: "Domain", "className": "cookie_column_second" }, { title: "Name", "className": "cookie_column_third" }]
            }
            bindTable('#tbl_blocked_cookies', params)
        }
    }).catch(e => console.log(e))
}


// Readonly cookies
function bindReadonlyCookies() {
    controller.init().then(function (result) {
        if (controller.storage.readonly) {
            let dt = controller.storage.readonly.map((x, index) => ([index, x.domain, x.name]))
            let params = {
                "data": dt,
                "columns": [{
                    render: function (data, type, row) {
                        return `<div class="ui  small fluid button clear" style="width:50px"><i class="trash alternate icon readonly_rule" title="Remove this rule" index='${data}'></i></div>`
                    }, "className": "cookie_column_first"
                }, { title: "Domain", "className": "cookie_column_second" }, { title: "Name", "className": "cookie_column_third" }]
            }
            bindTable('#tbl_readonly_cookies', params)
        }
    }).catch(e => console.log(e))
}



function getCookieForm(index) {
    return `<form class="ui small form segment cookie_form" id="cookie_form_${index}" index="${index}" style="margin-right: -10px;">
                <input type=hidden name="name">
                <input type=hidden name="storeId">

                <div class="inline fields cookie_name" style="display: none">
                    <div class="three wide field"><label>Name</label></div>
                    <div class="fourteen wide field"><input type="text" name="cookie_name" class="ui input"></div>
                </div>

                <div class="inline fields">
                    <div class="three wide field"><label>Domain</label></div>
                    <div class="fourteen wide field"><input type="text" name="domain" class="ui input"></div>
                </div>

                <div class="inline fields">
                    <div class="three wide field"><label>Value</label></div>
                    <div class="fourteen wide field"><textarea rows="4" name="value" class="ui input"></textarea></div>
                </div>

                <div class="inline fields">
                    <div class="three wide field"><label>Path</label></div>
                    <div class="fourteen wide field"><input type="text" name="path" class="ui input"></div>
                </div>

                <div class="inline fields">
                    <div class="three wide field"><label>Same Site</label></div>
                    <div class="fourteen wide field">
                        <select class="ui tiny input fluid dropdown request_methods" name="sameSite">
                        <option value="unspecified">Unspecified</option>
                        <option value="no_restriction">No restriction</option>
                        <option value="lax">Lax</option>
                        <option value="strict">Strict</option>
                        </select>
                    </div>
                </div>

                <div class="inline fields">
                    <div class="three wide field"><label>Expires / Max-Age</label></div>
                    <div class="fourteen wide field ui calendar"><input type="text"  name="expDate" class="ui input" autocomplete="off"></div>
                </div>

                <div class="inline fields">
                    <div class="twelve wide field">
                        <div class="three wide field"><label style="white-space:nowrap">Host only</label><div class="ui checkbox" class="ui input"> <input type="checkbox" name="hostOnly"></div></div>
                        <div class="three wide field"><label>Session</label><div class="ui checkbox" class="ui input"> <input type="checkbox" name="session"></div></div>
                        <div class="three wide field"><label>Secure</label><div class="ui checkbox" class="ui input"> <input type="checkbox" name="secure"></div></div>
                        <div class="three wide field"><label style="white-space:nowrap">HTTP only</label><div class="ui checkbox" class="ui input"> <input type="checkbox" name="httpOnly"></div></div>
                    </div>
                    <div class="six wide field">
                        <div class="three wide field"><div class="ui mini fluid button readonly_cookie" style="width: 45px;"><i class="lock open large icon" title="Lock cookie"></i></div></div>
                        <div class="four wide field"><div class="ui mini fluid button block_cookie" style="width: 45px;"><i class="ban large icon" title="Block cookie"></i></div></div>
                        <div class="four wide field"><div class="ui mini fluid button remove_cookie" style="width: 45px;"><i class="trash alternate large icon" title="Remove cookie"></i></div></div>
                        <div class="seven wide field"><div class="ui small fluid button submit secondary save_cookie" style="width: 120px;">Save</div></div>
                    </div>
                </div>

            </form>`
}




