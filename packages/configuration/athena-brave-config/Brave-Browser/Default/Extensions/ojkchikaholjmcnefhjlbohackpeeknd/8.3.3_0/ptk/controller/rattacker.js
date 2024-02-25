/* Author: Denis Podgurskii */
export class ptk_controller_rattacker {


    // async runScan(schema) {
    //     return browser.runtime.sendMessage({
    //         channel: "ptk_popup2background_rattacker",
    //         type: "run_scan",
    //         schema: schema
    //     }).then(response => {
    //         return response
    //     }).catch(e => e)
    // }

    async runBackroungScan(tabId, host){
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "run_bg_scan",
            tabId: tabId,
            host: host
        }).then(response => {
            return response
        }).catch(e => e)
    }

    async stopBackroungScan(){
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "stop_bg_scan"
        }).then(response => {
            return response
        }).catch(e => e)
    }
    

    async init() {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "init"
        }).then(response => {
            return response
        }).catch(e => e)
    }

    async reset() {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "reset"
        }).then(response => {
            return response
        }).catch(e => e)
    }

}