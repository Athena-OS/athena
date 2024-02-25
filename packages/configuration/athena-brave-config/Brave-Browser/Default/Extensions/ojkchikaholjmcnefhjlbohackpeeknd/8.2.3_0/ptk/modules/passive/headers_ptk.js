/* Author: Denis Podgurskii */

export class ptk_headers extends ptk_module_passive {
    constructor() {
        super()
        this.severity = 'Low'
        this.attacks = [
            {
                id: 'headers_1',
                description: 'OWASP Secure Headers',
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Headers'],
                options: {
                    deprecated: [
                        {
                            name: 'X-Frame-Options',
                            message: 'X-Frame-Options header is deprecated'
                        },
                        {
                            name: 'X-Powered-By',
                            message: 'X-Powered-By HTTP header reveals the server configuration'
                        },
                        {
                            name: 'X-XSS-Protection',
                            message: 'X-Powered-By HTTP header reveals the server configuration'
                        },
                        
                        
                    ],
                    required: [
                        {
                            name: 'X-Content-Type-Options',
                            value: ['nosniff'],
                            message: 'X-Content-Type-Options header not found or it has a wrong value'
                        },
                        {
                            name: 'Strict-Transport-Security',
                            regex: `max-age=([0-9]+)[\\s;]`,
                            conditions: { protocol: 'https' },
                            message: 'Strict-Transport-Security header not found',
                            metadata: {
                                owasp: 'https://owasp.org/www-project-secure-headers/#http-strict-transport-security'
                            }
                        },
                        
                        {
                            name: 'Content-Security-Policy',
                            regex: `max-age=([0-9]+)[\\s;]`,
                            conditions: { protocol: 'https' },
                            message: 'Content-Security-Policy header not found',
                            metadata: {
                                owasp: 'https://owasp.org/www-project-secure-headers/#content-security-policy'
                            }
                        },

                        {
                            name: 'X-Permitted-Cross-Domain-Policies',
                            regex: `max-age=([0-9]+)[\\s;]`,
                            conditions: { protocol: 'https' },
                            message: 'X-Permitted-Cross-Domain-Policies header not found',
                            metadata: {
                                owasp: 'https://owasp.org/www-project-secure-headers/#x-permitted-cross-domain-policies'
                            }
                        },
                    ]
                }
            }
        ]
    }

    static checkSecurityHeaders(ptk_tab) {
        HttpHeadersCheck.findings = new Array()
        HttpHeadersCheck.data = {
            'X-XSS-Protection': [],
            'X-Content-Type-Options': [],
            'Strict-Transport-Security': [],
            'X-Powered-By': [],
            'X-Frame-Options': []
        }

        ptk_tab.frames.forEach(function (frame) {
            frame.forEach(function (requests) {
                requests.forEach((request) => {
                    var headers = {}
                    if (request.responseHeaders) {
                        request.responseHeaders.forEach(function (item) {
                            headers[item.name.toLowerCase()] = item.value.toLowerCase();
                        });
                        HttpHeadersCheck.applyRules(headers, request)
                    }
                })
            })
        })

        var data = HttpHeadersCheck.data
        var findings = HttpHeadersCheck.findings

        if (data['X-Content-Type-Options'].length)
            findings.push(['X-Content-Type-Options', 'X-Content-Type-Options header not found or it has wrong value', data['X-Content-Type-Options'].join("<br/>")])
        if (data['Strict-Transport-Security'].length)
            findings.push(['HSTS', 'Strict-Transport-Security header not found', data['Strict-Transport-Security'].join("<br/>")])

        if (data['X-Powered-By'].length)
            findings.push(['X-Powered-By', 'X-Powered-By HTTP header reveals the server configuration', data['X-Powered-By'].join("<br/>")])

        if (data['X-Frame-Options'].length)
            findings.push(['X-Frame-Options', 'X-Frame-Options header is deprecated', data['X-Frame-Options'].join("<br/>")])
        if (data['X-XSS-Protection'].length)
            HttpHeadersCheck.findings.push(['X-XSS-Protection', 'X-XSS-Protection header is deprecated', data['X-XSS-Protection'].join("<br/>")])

        return findings
    }

    static applyRules(headers, request) {
        var data = HttpHeadersCheck.data
        if (headers['content-type'] && headers['content-type'].includes('text/html')) {
            //Deprecated
            if (headers['x-xss-protection'] && !data['X-XSS-Protection'].includes(request.url)) {
                data['X-XSS-Protection'].push(request.url)
            }
            if (headers['x-frame-options'] && !data['X-Frame-Options'].includes(request.url)) {
                if (!data['X-Frame-Options'].includes('allow-from') || (headers['x-frame-options'] != 'deny' && headers['x-frame-options'] != 'sameorigin'))
                    data['X-Frame-Options'].push(request.url)
            }
            if (headers['x-powered-by'] && !data['X-Powered-By'].includes(request.url)) {
                data['X-Powered-By'].push(request.url)
            }
            //Missed
            if ((!headers['x-content-type-options'] || headers['x-content-type-options'] != 'nosniff') && !data['X-Content-Type-Options'].includes(request.url)) {
                data['X-Content-Type-Options'].push(request.url)
            }
            if (request.url.startsWith('https://') && !headers['strict-transport-security'] && !data['Strict-Transport-Security'].includes(request.url)) {
                data['Strict-Transport-Security'].push(request.url)
            }
        }
        HttpHeadersCheck.data = data
    }
}
