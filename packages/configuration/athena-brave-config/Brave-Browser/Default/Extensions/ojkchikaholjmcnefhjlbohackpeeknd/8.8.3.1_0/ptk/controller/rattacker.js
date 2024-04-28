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

    async runBackroungScan(tabId, host, domains){
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "run_bg_scan",
            tabId: tabId,
            host: host,
            domains: domains
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

    async checkApiKey(key){
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "check_apikey",
            key: key
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

    async saveReport() {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "save_report"
        }).then(response => {
            return response
        }).catch(e => e)
    }

    async downloadScans() {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "download_scans"
        }).then(response => {
            return response
        }).catch(e => e)
    }


    async downloadScanById(scanId) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "download_scan_by_id",
            scanId: scanId
        }).then(response => {
            return response
        }).catch(e => e)
    }

    async deleteScanById(scanId) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "delete_scan_by_id",
            scanId: scanId
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

    async loadfile(file) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "loadfile",
            file: file
        }).then(response => {
            return response
        }).catch(e => e)
    }

    async save(json) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_rattacker",
            type: "save",
            json: json
        }).then(response => {
            return response
        }).catch(e => e)
    }

}