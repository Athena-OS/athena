/* Test pac from options page */
var testPac = function (event) {
    if (event.data.command == 'test' &&
        event.data.script != undefined) {
        try {
            eval(event.data.script);
            event.source.postMessage({name: "PAC file successfully loaded", success:true}, event.origin);
        } catch (e) {
            // can't make sense of this PAC file.
            //postMessage(e);
            event.source.postMessage({name: "PAC file failed loading", success:false}, event.origin);
        }
    }
};

window.addEventListener('message', testPac);

