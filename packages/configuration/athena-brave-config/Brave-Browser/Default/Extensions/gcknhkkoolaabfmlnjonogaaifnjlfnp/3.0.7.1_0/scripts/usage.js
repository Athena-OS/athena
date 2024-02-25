(function() {
    var ga_key = chrome.i18n.getMessage("ga_key");
    
    // Initialize the Analytics service object with the name of your app.
    var service = analytics.getService('foxyproxy_chrome');
    service.getConfig().addCallback(initAnalyticsConfig);

    // Get a Tracker using your Google Analytics app Tracking ID.
    var tracker = service.getTracker(ga_key);


    // listener for event tracking
    chrome.runtime.onMessage.addListener(function( request, sender, sendResponse)  {
        
        if (request) {
            if (request.trackEvent ) {
                var trackEvent = request.trackEvent;
                    
                console.log("received tracking event: ", trackEvent);
        
                if (trackEvent.category && trackEvent.action) {
                    
                    tracker.sendEvent(trackEvent.category, trackEvent.action, trackEvent.label, trackEvent.value);
                }
            } else if (typeof(request.usageOptOut) != 'undefined') {
                console.log("received usageOptOut change", request.usageOptOut);
                
                service.getConfig().addCallback(function( config) {
                    config.setTrackingPermitted(!request.usageOptOut);
                });
            }
        }
    });
    
    function initAnalyticsConfig( config) {
        if (foxyProxy && foxyProxy.getSettings) {
            foxyProxy.getSettings(function( settings) {
                if (settings && settings.usageOptOut) {
                    config.setTrackingPermitted(!settings.usageOptOut);
                }
            });            
        }
    }
})();