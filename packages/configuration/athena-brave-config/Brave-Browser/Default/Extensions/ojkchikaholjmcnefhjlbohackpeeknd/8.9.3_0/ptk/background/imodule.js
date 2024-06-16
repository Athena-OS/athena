/* Author: Denis Podgurskii */

export class ptk_imodule {
    constructor(worker) {
        this.moduleName = ''
        this.moduleChannel = ''

    }



    /* Listeners */

    addMessageListiners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {

        if (message.channel == "ptk_popup2background_dashboard") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }


    /* End Listeners */
}