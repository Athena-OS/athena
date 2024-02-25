/* Author: Denis Podgurskii */
import { ptk_decoder } from "../background/decoder.js"
import { ptk_utils } from "../background/utils.js"
import { jsonLogic } from '../packages/json-logic-js/logic.js'

export class ptk_module {
    constructor(module) {
        Object.assign(this, module)
        this.decoder = new ptk_decoder()

        jsonLogic.add_operation("regex", this.validateRegex)
    }

    validateRegex(obj, pattern) {
        let success = false
        let proof = ""
        pattern = new RegExp(pattern)
        if (Array.isArray(obj)) {
            Object.entries(obj).forEach(([_key, _value]) => {
                if (pattern.test(JSON.stringify(_value))) {
                    success = true
                    proof = JSON.stringify(_value).match(pattern)[0]
                }
            })
        } else {
            success = pattern.test(obj)
            if(success)
                proof = pattern.exec(obj)[0]
        }
        return { success, proof }
    }

    prepareAttack(schema, attack, random) {
        return { schema, attack }
    }



    modifyParam(param, options) {
        if (options.regex) {
            let r = new RegExp(options.regex)
            param = param.replace(r, options.attackValue)
        } else {
            param = options.position == 'before' ? options.attackValue + param : param + options.attackValue
        }

        return param
    }

    modifyPostParams(schema, options) {
        let params = schema.request.body?.params
        for (let i in params) {
            params[i].value = this.modifyParam(params[i].value, options)
        }
        return schema
    }

    modifyGetParams(schema, options) {
        let url = new URL(schema.request.target)
        for (const [key, value] of url.searchParams) {
            let v = this.modifyParam(value, options)
            url.searchParams.set(key, v)
        }
        schema.request.target = url.toString()
        return schema
    }

    modifyHeaders(schema, options) {
        let params = schema.request.headers
        for (let i in params) {
            params[i].value = this.modifyParam(params[i].value, options)
        }
        return schema
    }

    validateAttackConditions(schema, conditions, original) {
        let _return = true
        if (conditions) {
            _return = jsonLogic.apply(conditions, { "original": original, "module": this })
        }

        if (typeof (_return) == 'object') {
            return _return.success
        }
        return _return
    }

    prepareAttack(attack, random){
        let _attack = JSON.parse(JSON.stringify(attack))
        if(_attack.options.random){
            _attack.options.attackValue = _attack.options.attackValue.replace(_attack.options.random, random)
            _attack.validation.regex = JSON.parse(JSON.stringify(_attack.validation.regex).replace(_attack.options.random, random))
            if(_attack.options.attackParamValue === null) _attack.options.attackParamValue = random
        }
        return _attack
    }

    buildAttacks(schema, attack) {
        let attacks = []
        let location = attack.options.location ? attack.options.location : this.location

        let _schema = JSON.parse(JSON.stringify(schema))
        if (["POST", "PUT", "DELETE", "PATCH"].includes(_schema.request.method)) {
            _schema = this.modifyPostParams(_schema, attack.options)
        }
        _schema = this.modifyGetParams(_schema, attack.options)
        if (location.includes('Headers'))
            _schema = this.modifyHeaders(_schema, attack.options)
        attacks.push(_schema)
        return attacks
    }

    validateAttack(attack, validation, original) {
        // console.log(attack)
        // console.log(original)
        let _return = jsonLogic.apply(validation, { "attack": attack, "original": original, "module": this })

        if (typeof (_return) == 'boolean') {
            _return = { success: _return, proof: "" }
        }
        console.log(_return)
        return _return
    }
}