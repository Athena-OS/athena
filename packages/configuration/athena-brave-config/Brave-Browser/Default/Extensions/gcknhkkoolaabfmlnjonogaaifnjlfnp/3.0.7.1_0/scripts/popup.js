chrome.runtime.getBackgroundPage(function( bgPage) {
    
    var foxyProxy = bgPage.foxyProxy;

    var toggleRadioButton = function (id){
        $("li").removeClass("navbar-checked");
        $("#state-"+id).addClass("navbar-checked");
        foxyProxy.state = id;
        window.close();
    };

    $(document).ready(function() {

        $("#navbar").on("click", "li", function (e) {
            e.preventDefault();

            var elemId = $(this).attr("id");

            switch (elemId) {
                case "state-auto":
                    toggleRadioButton('auto');
                break;
            
                case "state-disabled":
                    toggleRadioButton('disabled');
                break;
            
                case "quickAdd":
                    chrome.tabs.getSelected(null, function(tab) {
                        foxyProxy.options('addpattern#' + tab.url);
                    });
                break;
            
                case "tabProxies":
                    foxyProxy.options('tabProxies');
                break;
            }

        });
        
        foxyProxy.getSettings(function( items) {
            var settings = items.settings;
            if ( (settings && !settings.enabledQA) || foxyProxy.state=='disabled' || 'Basic' == foxyProxy.getFoxyProxyEdition()) {
                $('#quickAdd').hide();
            }
        });

        foxyProxy.getProxyList( function( items) {
            var list = items.proxyList;

            list.forEach( function( proxy) {
                var a;

                if (proxy.data.enabled) {

                    a = $("<a href='#'/>").text(chrome.i18n.getMessage("mode_custom_label", proxy.data.name))
                        .css( { "color": proxy.data.color });

                    $("<li />").attr("id", "state-"+proxy.data.id)
                        .attr("proxyid", proxy.data.id)
                        .append(a)
                        .click( function() {
                                toggleRadioButton($(this).attr("proxyid"));
                        })
                        .insertBefore("li#state-disabled");
                    }
            });

            $("#state-" + foxyProxy.state).addClass("navbar-checked");

            if ('Basic' == foxyProxy.getFoxyProxyEdition()) {
                $("#state-auto").hide();
            }
        });
    });
    

});
