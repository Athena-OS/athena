/* Author: Denis Podgurskii */
import { ptk_decoder } from "../background/decoder.js"

export class ptk_module_active {

    constructor() {
        this.moduleType = 'active'
        this.decoder = new ptk_decoder()
    }

    prepareAttack(schema, attack, random) {
        return { schema, attack }
    }

    validateAttack(item, vulnRegex, originalRequest) {
        if (vulnRegex) {
            let re = new RegExp(vulnRegex)
            let body = this.decoder.base64_decode(item.body)
            if (re.test(body)) {
                item.success = true
                item.proof = this.decoder.base64_encode(body.match(re)[0])
                console.log("match found")
            } else {
                item.success = false
                item.proof = ""
                console.log("match NOT found")
            }
        }
        return item
    }
}