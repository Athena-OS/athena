/* Author: Denis Podgurskii */

export class ptk_controller_proxy {

    async init() {
        let self = this
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_tabs", type: "get_active_tab" })
            .then(function (tab) {
                Object.assign(self, tab)
                return self
            }).catch(e => e)
    }

  
    async clear() {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_tabs", type: "clear" })
            .then(response => {
                return response
            }).catch(e => e)
    }


    async getFrame(frameIndex) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_tabs", type: "get_frame", frameIndex: frameIndex })
            .then(response => {
                return response
            }).catch(e => e)
    }

    async getAllFrames(frameIndex) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_tabs", type: "get_all_frames", frameIndex: frameIndex })
            .then(response => {
                return response
            }).catch(e => e)
    }

    async getRequest(frameId, requestId, index) {
        return browser.runtime.sendMessage({ channel: "ptk_popup2background_tabs", type: "get_request_details", frameId: frameId, requestId: requestId, index: index })
            .then(response => {
                return response
            }).catch(e => e)
    }

}
