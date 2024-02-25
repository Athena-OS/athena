/* Author: Denis Podgurskii */
import { ptk_exporter } from "../background/exporter.js"

export class ptk_controller_rbuilder {

    async init() {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_request",
            type: "init"
        }).then(response => {
            return response
        }).catch(e => e)
    }

    async clear(index) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_request",
            type: "clear", 
            index: index
        }).then(response => {
            return response
        }).catch(e => e)
    }

    async resetAll() {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_request",
            type: "reset_all"
        }).then(response => {
            return response
        }).catch(e => e)
    }


    async sendRequest(schema, formId) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_request",
            type: "send_request",
            schema: schema,
            formId: formId
        }).then(response => {
            return response
        })
    }


    async parseRawRequest(item, formId) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_request",
            type: "parse_request",
            item: item, 
            formId: formId
        }).then(response => {
            return response
        })
    }

    async updateRawRequest(item, formId) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_request",
            type: "update_request",
            item: JSON.parse(JSON.stringify(item)),
            formId: formId
        })
    }

    async deleteSavedRequest(formId) {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_request",
            type: "delete_request",
            formId: formId
        }).then(response => {
            return response
        }).catch(e => e)
    }

    async export() {
        return browser.runtime.sendMessage({
            channel: "ptk_popup2background_request",
            type: "get_recording"
        }).then(response => {
            let exporter = new ptk_exporter(response, { format: "har" })
            let output = exporter.render()
            return output
        }).catch(e => e)
    }

}