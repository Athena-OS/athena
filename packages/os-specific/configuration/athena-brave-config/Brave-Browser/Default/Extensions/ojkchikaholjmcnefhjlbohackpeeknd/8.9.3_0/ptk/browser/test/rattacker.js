import "../../packages/browser-polyfill/browser-polyfill.min.js"
import { ptk_request } from "../../background/rbuilder.js"
import { ptk_module } from "../../modules/module.js"
import { ptk_rattacker } from "../../background/rattacker.js"


let modules = []
await fetch('../../modules/modules.json')
    .then(response => response.json())
    .then(json => {
        Object.values(json.modules).forEach(module => {
            modules.push(new ptk_module(module))
        })
    })

document.getElementById('testBtn').addEventListener('click', runTest, false);

async function runTest() {
    let raw =
        `POST https://demo.testfire.net/doLogin HTTP/1.1
    Sec-Ch-Ua: "Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"
    Sec-Ch-Ua-Mobile: ?0
    Sec-Ch-Ua-Platform: macOS
    Upgrade-Insecure-Requests: 1
    Origin: https://demo.testfire.net
    Content-Type: application/x-www-form-urlencoded
    User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.41
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
    Sec-Fetch-Site: same-origin
    Sec-Fetch-Mode: navigate
    Sec-Fetch-User: ?1
    Sec-Fetch-Dest: document
    Referer: https://demo.testfire.net/login.jsp
    Accept-Encoding: gzip, deflate, br
    Accept-Language: en-GB,en;q=0.9,en-US;q=0.8
    Cookie: AltoroAccounts="ODAwMDAwfkNvcnBvcmF0ZX4wLjB8ODAwMDAxfkNoZWNraW5nfjEuMEUyNTV8ODAwMDAyflNhdmluZ3N+LTEuOTk5NTQzNDA3MDM5NjE2RTE4fDgwMDAwM35DaGVja2luZ34xLjg5NTE0NzkwNTI1MzgzMzdFMjF8ODAwMDA0flNhdmluZ3N+NjEyOTgzNC4wfDgwMDAwNX5DaGVja2luZ34tNDg5ODUuMHw4MDAwMDZ+U2F2aW5nc34zMTEwMi4wfDgwMDAwN35DaGVja2luZ34xMDUxNTAuMHw0NTM5MDgyMDM5Mzk2Mjg4fkNyZWRpdCBDYXJkfjEuMEUyNTV8NDQ4NTk4MzM1NjI0MjIxN35DcmVkaXQgQ2FyZH4xMjMzLjk3OTk4MDQ2ODc1fA=="; JSESSIONID=3A2E15085DAEF9CF61D5A17F2FD6F8E2
    Cache-Control: no-cache, no-store
    Host: demo.testfire.net
    Content-Length: 35

    btnSubmit=Login&passw=pass&uid=user`

    let raw1 =
        `POST http://localhost:8080/user/login HTTP/1.1
Sec-Ch-Ua: "Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: macOS
Upgrade-Insecure-Requests: 1
Origin: http://localhost:8080
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.41
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Referer: http://localhost:8080/
Accept-Encoding: gzip, deflate, br
Accept-Language: en-GB,en;q=0.9,en-US;q=0.8
Cookie: language=en; welcomebanner_status=dismiss; PHPSESSID=0ek43201n923idfsqf6snjcrt0
Cache-Control: no-cache, no-store
Host: localhost:8080
Content-Length: 27

password=test&username=test`

    let schema = ptk_request.parseRawRequest(raw)
    let rattacker = new ptk_rattacker()

    console.log(schema)
    let original = await rattacker.executeOriginal(schema)

    let result = { attacks: [] }

    //const responses = await Promise.allSettled(
    rattacker.modules.map(async module => {
        module.executed = []

        if (module.type == 'active') {
            if (module.async) {
                await new Promise(resolve => { setTimeout(resolve, 50) })
                //await Promise.allSettled(
                module.attacks.map(async attack => {
                    attack = module.prepareAttack(attack)
                    if (attack.condition) {
                        let _a = { "metadata": Object.assign({}, attack, module.metadata) }
                        if (!module.validateAttackConditions(_a, original)) return
                    }
                    let _schema = ptk_request.parseRawRequest(original.request.raw, attack.action.options)
                    let attackRequests = module.buildAttacks(_schema, attack)
                    for (let i in attackRequests) {
                        let _s = ptk_request.updateRawRequest(attackRequests[i], null, attack.action.options)
                        _s.metadata = Object.assign({}, attack, module.metadata)
                        //_s.request.opts.override_headers = false
                        let executed = await rattacker.activeAttack(_s)
                        if (executed) {
                            module.executed.push(executed)

                            //only attacks with validation count
                            if (attack.validation) {
                                let res = module.validateAttack(executed, original)
                                result.attacks.push(Object.assign(executed, res))
                            }
                        }


                    }

                })
                //)
            }
        }




        // for (let attackIndex in module.attacks) {
        //     let attack = module.prepareAttack(module.attacks[attackIndex])
        //     if (attack.condition) {
        //         let _a = { "metadata": Object.assign({}, attack, module.metadata) }
        //         if (!module.validateAttackConditions(_a, original)) continue
        //     }

        //     if (module.type == 'active') {
        //         let _schema = ptk_request.parseRawRequest(original.request.raw, attack.action.options)
        //         let attackRequests = module.buildAttacks(_schema, attack)

        //         for (let i in attackRequests) {
        //             //attackRequests[i].request.target += attackRequests[i].request.queryParams.length > 0 ? "" : "?" + "&ptk_attack=" + attack.id
        //             let _s = ptk_request.updateRawRequest(attackRequests[i], null, attack.action.options)
        //             _s.metadata = Object.assign({}, attack, module.metadata)

        //             if (module.async == true) {

        //                 _s.request.opts.override_headers = false
        //                 let executed =  await rattacker.activeAttack(_s)
        //                 if (executed) {
        //                     module.executed.push(executed)

        //                     //only attacks with validation count
        //                     if (attack.validation) {
        //                         let res = module.validateAttack(executed, original)
        //                         result.attacks.push(Object.assign(executed, res))
        //                     }
        //                 }

        //             }
        //             else {
        //                 //console.log("Sync")
        //                 let executed = await rattacker.activeAttack(_s)
        //                 if (executed) {
        //                     module.executed.push(executed)

        //                     //only attacks with validation count
        //                     if (attack.validation) {
        //                         let res = module.validateAttack(executed, original)
        //                         result.attacks.push(Object.assign(executed, res))
        //                     }
        //                 }
        //             }
        //         }
        //     } else if (module.type == 'passive') {
        //         let _s = { "metadata": Object.assign({}, attack, module.metadata) }
        //         let res = module.validateAttack(_s, original) //this.passiveAttack(attack, original, module)
        //         if (res.success) {
        //             result.attacks.push(Object.assign(_s, res))
        //         }
        //     }
        //     let self = this
        // }
    }//)
    )

    //console.log(responses)
    console.log(result)
}

async function execute(schema) {

    let request = new ptk_request()
    return request.sendRequest(schema)
}

