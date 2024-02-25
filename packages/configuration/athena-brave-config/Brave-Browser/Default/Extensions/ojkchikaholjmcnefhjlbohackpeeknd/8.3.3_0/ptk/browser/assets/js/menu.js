/* Author: Denis Podgurskii */

function bindTable(id, params) {
    params.paging = false
    params.ordering = false
    params.info = false
    params.searching = params.searching ? params.searching : false
    params.sorting = false
    params.dom = 'frtip'
    //params.buttons = [ 'copyHtml5', 'excelHtml5', 'pdfHtml5', 'csvHtml5' ]


    let table
    if ($.fn.dataTable.isDataTable(id)) {
        table = $(id).DataTable()
        table.clear().rows.add(params.data).draw()
    } else {
        table = $(id).DataTable(params)
        // if (params.buttons) {
        //     table.buttons().container()
        //         .appendTo($('.col-sm-6:eq(0)', table.table().container()));
        // }
    }
    return table
}

jQuery(function () {
    let version = browser.runtime.getManifest().version
    //Main menu
    $('#mainMenuWrapper').prepend(
        `<div class="ui small inverted borderless menu" style="height:12px">
            <img src="assets/images/hacker_w1.png" id="ptkicon" title="OWASP Penetration Testing Kit">
            <div class="ui container" id="mainMenu">
                <a class="item" href="index.html">Dashboard</a>
                <a class="item" href="session.html">Session</a>
                <a class="item" href="sca.html">SCA</>
                <a class="item" href="proxy.html">Proxy</a>
                <a class="item" href="rbuilder.html">R-Builder</a>
                <a class="item" href="rattacker.html">R-Attacker</a>
 
                <a class="item" href="recording.html">Macro</a>

                <div class="ui top left pointing dropdown item" >Tools<i class="dropdown icon"></i>
                    <div class="menu" style="width: 100px;top: 25px;left: -17px;">
                    <a class="item" href="decoder.html">Decoder</a>
                    <a class="item" href="swagger-editor.html">Swagger</a>
                    </div>
                </div>
    
                
                <div class="ui dropdown item disabled" style="position: absolute;width: 30px;height: 30px;right: 34px;top: 3px;padding: 0px;">
                    <i title="Profile" class="user circle big icon"></i>
                </div>
                <div class="ui dropdown item notifications" style="position: absolute;width: 30px;height: 30px;right: 34px;top: 3px;padding: 0px; display:none">
                    <div><i title="Notifications" class=" red exclamation triangle big icon"></i></div>
                    <div class="menu">
                    <div class="ui error message" style="margin-top: 0px !important;">
                      <div class="header">Error</div>
                      <p>Cookie and storage access is disabled. Reinstall the extension or enable cookie/storage on the "Settings" page.</p>
                    </div>
                  </div>
                </div>
                <div class="ui dropdown item" style="position: absolute;width: 30px;height: 30px;right: 3px;top: 3px;padding: 0px;">
                    <div ><i title="More" class="bars big icon"></i></div>
                    <div class="menu" style="margin-top: 0px !important; min-height: 90px;top: 34px;">
                        <a class="item" href="#" id="opennewwindow">Open in new window</a>
                        <a class="item" href="#" id="reloadextension">Reload PTK</a>
                        <div class="ui fitted divider"></div>
                        <a class="item" href="https://pentestkit.co.uk/howto.html" target="_blank">How to<i class="external square right floated icon"></i></a>
                        <a class="item" href="https://pentestkit.co.uk/release_notes.html" target="_blank">Release notes<i class="external square right floated icon"></i></a>
                        <div class="ui fitted divider"></div>
                        <a class="item" href="#" id="opensettings">Settings</a>
                        <a class="item" href="#" id="credits">Credits</a>
                        <a class="item" href="#" id="disclaimer">Disclaimer</a>
                        <a class="item" href="#" id="privacy">Privacy Policy</a>
                        <a class="item" href="#" id="privacy">Version: #${version}</a>
                    </div>
                </div>
            </div>
        </div>
        <div id='ptk_popup_dialog' class='ui fullscreen modal'>
        <i class="close icon" style="right: 2px;top: 2px;"></i>
        <iframe style="width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;"></iframe>
        </div>
        `
    )

    $('#footer_menu').prepend(
        `
        <div class="ui mini message" style="height: 25px;position: fixed; bottom: -11px; left:0px; z-index:1; padding-top: 1px;padding-left: 4px; padding-right: 4px;">            
            <a href="https://www.youtube.com/channel/UCbEcTounPkV1aitE1egXfqw/" target="_blank"><i
            class="youtube big icon" title="PTK on youtube" style="margin-top: -18px;"></i></a>
            <a href="https://pentestkit.co.uk" target="_blank"><i class="globe big icon" title="PTK website"
                    style="margin-top: -18px;"></i></a>
            <a href="https://twitter.com/pentestkit" target="_blank"><i class="twitter big icon" title="PTK on Twitter"
                    style="margin-top: -18px;"></i></a>
            <a href="https://owasp.org/www-project-penetration-testing-kit/" target="_blank"><img
                    src="assets/images/owasp.png" title="PTK on OWASP" style="width: 24px; padding:1px"></a>
        </div>
  

        <div class="ui mini message"
            style="height: 25px;padding-top: 4px;position: fixed; bottom: -11px; left:130px; z-index:1">
            <a href="mailto:info@pentestkit.co.uk">info@pentestkit.co.uk</a>
        </div>
        <div class="ui mini orange message"
            style="height: 25px;padding-top: 4px;position: fixed; bottom: -11px; left:269px; z-index:1">
            <i class="exclamation circle icon"></i><a target="_blank"
                href="https://www.true-positives.com/ptk-community">Please help us
                improve the PTK</a>
        </div>

        <!--div class="ui mini message"
            style="height: 25px;padding-top: 4px;position: fixed; bottom: -11px; right:100px; z-index:1">
            <div class="ui form">
                <div class=" fields">
                    <div class="eight wide field" style="margin-top: -1px;"><b style="font-size: .78571429em;">Trusted
                            by</b> &nbsp;</div>
                    <div class="four wide field ui icon right corner" style="padding-left: 10px;padding-right:0px">
                        <a href="https://www.invicti.com/" target="_blank"><img class="logo"
                                src="assets/images/invicti-logo-black.svg"
                                title="The Largest Dynamic Application Security Solutions Provider In The World"
                                style="width: 60px; margin-top: -4px;float: right;"></a>
                    </div>
                    <div class="one wide field" style="padding-left: 3px;"> <sup><i class="trademark icon"></i></sup>
                    </div>
                </div>
            </div>

        </div-->

        <div class=""
            style="height: 40px;position: fixed; bottom: 0px; right:0px; z-index:1; padding-top: 1px;padding-left: 4px; padding-right: 4px;">
            <a href="https://www.paypal.com/donate/?hosted_button_id=RNE87MVGX576E" target="_blank"><img
            src="assets/images/paypal.png" title="Donation" style="width: 200px; padding:1px"></a>
        </div>

        `
    )


    if (window.opener) {
        $('#opennewwindow').hide()
    }

    $('#mainMenu a.item').each(function (i, obj) {
        if (window.location.pathname.indexOf($(obj).attr('href')) > 0)
            $(obj).addClass('active').siblings().removeClass('active')
    });

    //Submenu all pages
    $('.ui.menu a.item').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active')
        let forItem = $(this).attr('forItem')
        $('.ui.menu a.item').each(function (i, obj) {
            let f = $(obj).attr('forItem')
            if (f != forItem) $('#' + f).hide()
        })
        $('#' + forItem).fadeIn("slow")
    })

    //Settings page
    $('#opensettings').on('click', function () {
        $('#ptk_popup_dialog iframe').attr('src', 'settings.html')
        $('#ptk_popup_dialog').modal('show')
    })

    //Privacy page
    $('#privacy').on('click', function () {
        $('#ptk_popup_dialog iframe').attr('src', 'privacy.html')
        $('#ptk_popup_dialog').modal('show')
    })

    //Disclaimer page
    $('#disclaimer').on('click', function () {
        $('#ptk_popup_dialog iframe').attr('src', 'disclaimer.html')
        $('#ptk_popup_dialog').modal('show')
    })

    //Credits page
    $('#credits').on('click', function () {
        $('#ptk_popup_dialog iframe').attr('src', 'credits.html')
        $('#ptk_popup_dialog').modal('show')
    })

    //New window
    $('#opennewwindow').on('click', function () {
        browser.windows.create({ url: window.location.href, type: "popup", width: 900, height: 650 })
        window.close();
    });

    //Reload
    $('#reloadextension').on('click', function () {
        browser.runtime.sendMessage({
            channel: "ptk_popup2background_app",
            type: "reloadptk"
        }).catch(e => e)
    });

    //Semantic UI 
    $('.ui.dropdown').dropdown({ on: 'click' })
    $('.ui.checkbox').checkbox()
    $('.dropdown.allowAdditions')
        .dropdown({
            allowAdditions: true
        })

})