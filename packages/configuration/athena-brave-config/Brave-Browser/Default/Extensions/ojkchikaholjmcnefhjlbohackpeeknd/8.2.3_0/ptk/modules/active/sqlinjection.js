/* Author: Denis Podgurskii */
import { ptk_module_active } from "../active.js"

export class ptk_sqlinjection extends ptk_module_active   {
    constructor() {
        super()

        this.vulnRegex = "(\]\[(DB2|ODBC|OleDb|Oracle|SqlServer|MySQL)|mysql_fetch_|not a valid MySQL|not a legal PLSQL identifer|mysql_connect\(\)|(SELECT\s+[^:>]+\sFROM\s+[^:>]+\sWHERE\s+)|(at\s[[:alnum:]\/\._]+\sline\s\d+)|ociparse\(\):|must be a syntactically valid variable|CFSQLTYPE|Unknown column ['`]|Microsoft OLE DB Provider for SQL|SQL QUERY FAILURE:|Syntax error.{1,50}in query|Syntax error.{1,50}column|ORA-01722:|PostgreSQL query failed:|You have an error in your SQL syntax|Unclosed quotation mark|(quoted|terminated)[ \r\n]+.{1,100}(quoted|terminated)|sql syntax error|Syntax error in string in query expression|java\.sql\.SQLSyntaxErrorException|dao\.EmptyResultDataAccessException|System\.Data\.OleDb\.OleDbException|insert\s+into\s+['`][^\s]+|database\s+error|dberror.{0,70}|call[ ]+to[ ]+a[ ]+member[ ]+function[ ]+fetch_assoc\(\)[ ]+.{0,100}"
        this.severity = "High"
        this.attacks = [
            {
                id: "sqlinjection_1",
                description: "SQL Injection - Single Quote (before)",
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    attackValue: "'",
                    position: "before"
                }

            },
            {
                id: "sqlinjection_2",
                description: "SQL Injection - Single Quote (after)",
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    attackValue: "'",
                    position: "after"
                }
            },
            {
                id: "sqlinjection_3",
                description: "SQL Injection - Double Quote (before)",
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    attackValue: '"',
                    position: "before"
                }
            },
            {
                id: "sqlinjection_4",
                description: "SQL Injection - Double Quote (after)",
                methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                location: ['Path', 'Query', 'Post', 'Cookie'],
                options: {
                    attackValue: '"',
                    position: "after"
                }
            }
        ]
    }

    validateAttack(item, vulnRegex, originalRequest) {
        let obj = super.validateAttack(item, vulnRegex, originalRequest)
        if(!obj.success){

        }
        // console.log(item)
        // console.log(originalRequest)
        return obj
    }
}