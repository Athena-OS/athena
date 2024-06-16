/* Author: Denis Podgurskii */
import { ptk_utils } from "../background/utils.js"
import { jsonLogic } from '../background/lib/json-logic-js.js'
import { httpZ } from "../background/lib/httpZ.esm.js"

export class ptk_module {
    constructor(module) {
        Object.assign(this, module)
        this.nonAttackParams = ['csrf', '_csrf']

        jsonLogic.add_operation("regex", this.op_regex)
        jsonLogic.add_operation("proof", this.op_proof)

    }

    op_regex(obj, pattern) {
        let success = false
        pattern = new RegExp(pattern, "gmi")
        if (Array.isArray(obj)) {
            Object.entries(obj).forEach(([_key, _value]) => {
                if (pattern.test(JSON.stringify(_value))) {
                    success = true
                }
            })
        } else {
            success = pattern.test(obj)
        }
        return success
    }

    op_proof(obj, pattern) {
        let proof = ""
        pattern = new RegExp(pattern, "gmi")
        if (Array.isArray(obj)) {
            Object.entries(obj).forEach(([_key, _value]) => {
                if (pattern.test(JSON.stringify(_value))) {
                    proof = JSON.stringify(_value).match(pattern)[0]
                }
            })
        } else {
            if (pattern.test(obj))
                proof = obj.match(pattern)[0]
        }
        return proof
    }

    modifyProps(schema, action) {
        for (let i = 0; i < action.props.length; i++) {
            ptk_utils.jsonSetValueByPath(schema, action.props[i].name, action.props[i].value, true)
        }
        return schema
    }

    modifyParam(name, param, action) {
        if (this.nonAttackParams.includes(name)) return param
        if (action.regex) {
            let r = new RegExp(action.regex)
            param = param.replace(r, action.value)
        } else if (action.operation == 'add') {
            param = (action.position == 'after') ? param + action.value : action.value + param
        } else if (action.operation == 'replace') {
            param = action.value
        }

        return param
    }

    modifyPostParams(schema, action) {
        let params = schema.request.body?.params
        if (params) {
            for (let j = 0; j < action.params.length; j++) {
                if (action.params[j].name) {
                    let ind = params.findIndex(obj => { return obj.name.toLowerCase() == action.params[j].name.toLowerCase() })
                    if (ind < 0) {
                        params.push({
                            "name": action.params[j].name,
                            "value": action.params[j].value
                        })
                    } else {
                        params[ind].value = this.modifyParam(params[ind].name, params[ind].value, action.params[j])
                    }
                } else {
                    for (let i in params) {
                        params[i].value = this.modifyParam(params[i].name, params[i].value, action.params[j])
                    }
                }
            }
            params.push({ name: 'ptk_rnd', value: ptk_utils.attackParamId() })
        }
        return schema
    }

    modifyGetParams(schema, action) {
        let url = new URL(schema.request.url)
        let params = schema.request.queryParams
        if (params) {
            for (let j = 0; j < action.params.length; j++) {
                if (action.params[j].name) {
                    let ind = params.findIndex(obj => { return obj.name.toLowerCase() == action.params[j].name.toLowerCase() })
                    let val = action.params[j].value
                    if (ind < 0) {
                        params.push({
                            "name": action.params[j].name,
                            "value": action.params[j].value
                        })

                    } else {
                        params[ind].value = this.modifyParam(params[ind].name, params[ind].value, action.params[j])
                        val = params[ind].value
                    }
                    url.searchParams.set(action.params[j].name, val)
                } else {
                    for (let i in params) {
                        params[i].value = this.modifyParam(params[i].name, params[i].value, action.params[j])
                        url.searchParams.set(params[i].name, params[i].value)
                    }
                }
            }
        }
        schema.request.url = url.toString()
        return schema
    }

    modifyHeaders(schema, action) {
        let params = schema.request.headers
        for (let j = 0; j < action.headers.length; j++) {
            if (action.headers[j].name) {
                let ind = params.findIndex(obj => { return obj.name.toLowerCase() == action.headers[j].name.toLowerCase() })
                if (ind < 0) {
                    params.push({
                        "name": action.headers[j].name,
                        "value": action.headers[j].value
                    })
                } else {
                    params[ind].value = this.modifyParam(params[ind].name, params[ind].value, action.headers[j])
                }
            } else {
                for (let i in params) {
                    params[i].value = this.modifyParam(params[i].name, params[i].value, action.headers[j])
                }
            }
        }
        return schema
    }

    modifyUrl(schema, action) {
        let url = new URL(schema.request.url)
        
        schema.request.url = url.origin + action.url.value
        return schema
    }

    prepareAttack(a) {
        let attack = JSON.parse(JSON.stringify(a))
        let rnd = ptk_utils.attackParamId()

        if (attack.action?.random)
            attack.action.random = rnd

        for (let j = 0; j < attack.action?.props?.length; j++) {
            attack.action.props[j].value = attack.action.props[j].value.replace('%%random%%', rnd)
        }
        for (let j = 0; j < attack.action?.params?.length; j++) {
            attack.action.params[j].value = attack.action.params[j].value.replace('%%random%%', rnd)
        }
        for (let j = 0; j < attack.action?.headers?.length; j++) {
            attack.action.headers[j].value = attack.action.headers[j].value.replace('%%random%%', rnd)
        }
        if (attack?.regex) {
            attack.regex = JSON.parse(JSON.stringify(attack.regex).replace('%%random%%', rnd))
        }
        return attack
    }

    buildAttacks(schema, attack) {
        let attacks = []
        attacks.push(this.buildAttack(schema, attack))
        return attacks
    }

    buildAttack(schema, attack) {
        let _schema = JSON.parse(JSON.stringify(schema))

        // modify url
        if (attack.action.url) {
            _schema = this.modifyUrl(_schema, attack.action)
        }

        // modify properties, eg method or scheme
        if (attack.action.props) {
            _schema = this.modifyProps(_schema, attack.action)
        }
        // modify params - POST or GET
        if (attack.action.params) {
            if (["POST", "PUT", "DELETE", "PATCH"].includes(_schema.request.method)) {
                _schema = this.modifyPostParams(_schema, attack.action)
            } else {
                _schema = this.modifyGetParams(_schema, attack.action)
            }
        }
        // modify headers
        if (attack.action.headers) {
            _schema = this.modifyHeaders(_schema, attack.action)
        }

        //update cookie
        let cookieIndex = _schema.request.headers.findIndex((item) => { return item.name.toLowerCase() == 'cookie' })
        if (cookieIndex > -1) {
            _schema.request.headers[cookieIndex].value.split(';').map(item => {
                let _c = item.split('=')
                let _i = _schema.request.cookies.findIndex(i => { return i.name == _c[0].trim() })
                if (_i > -1) _schema.request.cookies[_i].value = _c[1]
            })
        }
        return _schema
    }

    validateAttackConditions(attack, original) {
        return jsonLogic.apply(attack.metadata.condition, { "original": original, "attack": attack, "module": this })
    }

    validateAttack(executed, original) {
        if (executed) {
            let success = jsonLogic.apply(executed.metadata.validation.rule, { "attack": executed, "original": original, "module": this })
            let proof = ""
            if (executed.metadata.validation.proof && success) {
                proof = jsonLogic.apply(executed.metadata.validation.proof, { "attack": executed, "original": original, "module": this })
            }
            return { "success": success, "proof": proof }
        }
        return { "success": false, "proof": "" }
    }
}