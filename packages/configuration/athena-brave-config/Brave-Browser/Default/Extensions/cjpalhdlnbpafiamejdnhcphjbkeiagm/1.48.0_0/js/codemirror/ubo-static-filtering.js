/*******************************************************************************

    uBlock Origin - a browser extension to block requests.
    Copyright (C) 2018-present Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

/* global CodeMirror */

'use strict';

/******************************************************************************/

import * as sfp from '../static-filtering-parser.js';

/******************************************************************************/

const redirectNames = new Map();
const scriptletNames = new Map();
const preparseDirectiveTokens = new Map();
const preparseDirectiveHints = [];
const originHints = [];
let hintHelperRegistered = false;

/******************************************************************************/

CodeMirror.defineMode('ubo-static-filtering', function() {
    if ( sfp.AstFilterParser instanceof Object === false ) { return; }
    const astParser = new sfp.AstFilterParser({
        interactive: true,
        nativeCssHas: vAPI.webextFlavor.env.includes('native_css_has'),
    });
    const astWalker = astParser.getWalker();
    let currentWalkerNode = 0;
    let lastNetOptionType = 0;

    const redirectTokenStyle = node => {
        const rawToken = astParser.getNodeString(node);
        const { token } = sfp.parseRedirectValue(rawToken);
        return redirectNames.has(token) ? 'value' : 'value warning';
    };

    const colorFromAstNode = function() {
        if ( astParser.nodeIsEmptyString(currentWalkerNode) ) { return '+'; }
        if ( astParser.getNodeFlags(currentWalkerNode, sfp.NODE_FLAG_ERROR) !== 0 ) {
            return 'error';
        }
        const nodeType = astParser.getNodeType(currentWalkerNode);
        switch ( nodeType ) {
            case sfp.NODE_TYPE_WHITESPACE:
                return '';
            case sfp.NODE_TYPE_COMMENT:
                if ( astWalker.canGoDown() ) { break; }
                return 'comment';
            case sfp.NODE_TYPE_COMMENT_URL:
                return 'comment link';
            case sfp.NODE_TYPE_IGNORE:
                return 'comment';
            case sfp.NODE_TYPE_PREPARSE_DIRECTIVE:
            case sfp.NODE_TYPE_PREPARSE_DIRECTIVE_VALUE:
                return 'directive';
            case sfp.NODE_TYPE_PREPARSE_DIRECTIVE_IF_VALUE: {
                if ( preparseDirectiveTokens.size === 0 ) {
                    return 'positive strong';
                }
                const raw = astParser.getNodeString(currentWalkerNode);
                const not = raw.startsWith('!');
                const token = not ? raw.slice(1) : raw;
                if ( preparseDirectiveTokens.has(token) === false ) {
                    return 'error strong';
                }
                return not === preparseDirectiveTokens.get(token)
                    ? 'negative strong'
                    : 'positive strong';
            }
            case sfp.NODE_TYPE_EXT_OPTIONS_ANCHOR:
                return astParser.getFlags(sfp.AST_FLAG_IS_EXCEPTION)
                    ? 'tag strong'
                    : 'def strong';
            case sfp.NODE_TYPE_EXT_DECORATION:
                return 'def';
            case sfp.NODE_TYPE_EXT_PATTERN_RAW:
                if ( astWalker.canGoDown() ) { break; }
                return 'variable';
            case sfp.NODE_TYPE_EXT_PATTERN_COSMETIC:
            case sfp.NODE_TYPE_EXT_PATTERN_HTML:
                return 'variable';
            case sfp.NODE_TYPE_EXT_PATTERN_RESPONSEHEADER:
            case sfp.NODE_TYPE_EXT_PATTERN_SCRIPTLET:
                if ( astWalker.canGoDown() ) { break; }
                return 'variable';
            case sfp.NODE_TYPE_EXT_PATTERN_SCRIPTLET_TOKEN: {
                const token = astParser.getNodeString(currentWalkerNode);
                if ( scriptletNames.has(token) === false ) {
                    return 'warning';
                }
                return 'variable';
            }
            case sfp.NODE_TYPE_EXT_PATTERN_SCRIPTLET_ARG:
                return 'variable';
            case sfp.NODE_TYPE_NET_EXCEPTION:
                return 'tag strong';
            case sfp.NODE_TYPE_NET_PATTERN:
                if ( astWalker.canGoDown() ) { break; }
                if ( astParser.isRegexPattern() ) {
                    if ( astParser.getNodeFlags(currentWalkerNode, sfp.NODE_FLAG_PATTERN_UNTOKENIZABLE) !== 0 ) {
                        return 'variable warning';
                    }
                    return 'variable notice';
                }
                return 'variable';
            case sfp.NODE_TYPE_NET_PATTERN_PART:
                return 'variable';
            case sfp.NODE_TYPE_NET_PATTERN_PART_SPECIAL:
                return 'keyword strong';
            case sfp.NODE_TYPE_NET_PATTERN_PART_UNICODE:
                return 'variable unicode';
            case sfp.NODE_TYPE_NET_PATTERN_LEFT_HNANCHOR:
            case sfp.NODE_TYPE_NET_PATTERN_LEFT_ANCHOR:
            case sfp.NODE_TYPE_NET_PATTERN_RIGHT_ANCHOR:
            case sfp.NODE_TYPE_NET_OPTION_NAME_NOT:
                return 'keyword strong';
            case sfp.NODE_TYPE_NET_OPTIONS_ANCHOR:
            case sfp.NODE_TYPE_NET_OPTION_SEPARATOR:
                lastNetOptionType = 0;
                return 'def strong';
            case sfp.NODE_TYPE_NET_OPTION_NAME_UNKNOWN:
                lastNetOptionType = 0;
                return 'error';
            case sfp.NODE_TYPE_NET_OPTION_NAME_1P:
            case sfp.NODE_TYPE_NET_OPTION_NAME_STRICT1P:
            case sfp.NODE_TYPE_NET_OPTION_NAME_3P:
            case sfp.NODE_TYPE_NET_OPTION_NAME_STRICT3P:
            case sfp.NODE_TYPE_NET_OPTION_NAME_ALL:
            case sfp.NODE_TYPE_NET_OPTION_NAME_BADFILTER:
            case sfp.NODE_TYPE_NET_OPTION_NAME_CNAME:
            case sfp.NODE_TYPE_NET_OPTION_NAME_CSP:
            case sfp.NODE_TYPE_NET_OPTION_NAME_CSS:
            case sfp.NODE_TYPE_NET_OPTION_NAME_DENYALLOW:
            case sfp.NODE_TYPE_NET_OPTION_NAME_DOC:
            case sfp.NODE_TYPE_NET_OPTION_NAME_EHIDE:
            case sfp.NODE_TYPE_NET_OPTION_NAME_EMPTY:
            case sfp.NODE_TYPE_NET_OPTION_NAME_FONT:
            case sfp.NODE_TYPE_NET_OPTION_NAME_FRAME:
            case sfp.NODE_TYPE_NET_OPTION_NAME_FROM:
            case sfp.NODE_TYPE_NET_OPTION_NAME_GENERICBLOCK:
            case sfp.NODE_TYPE_NET_OPTION_NAME_GHIDE:
            case sfp.NODE_TYPE_NET_OPTION_NAME_HEADER:
            case sfp.NODE_TYPE_NET_OPTION_NAME_IMAGE:
            case sfp.NODE_TYPE_NET_OPTION_NAME_IMPORTANT:
            case sfp.NODE_TYPE_NET_OPTION_NAME_INLINEFONT:
            case sfp.NODE_TYPE_NET_OPTION_NAME_INLINESCRIPT:
            case sfp.NODE_TYPE_NET_OPTION_NAME_MATCHCASE:
            case sfp.NODE_TYPE_NET_OPTION_NAME_MEDIA:
            case sfp.NODE_TYPE_NET_OPTION_NAME_METHOD:
            case sfp.NODE_TYPE_NET_OPTION_NAME_MP4:
            case sfp.NODE_TYPE_NET_OPTION_NAME_NOOP:
            case sfp.NODE_TYPE_NET_OPTION_NAME_OBJECT:
            case sfp.NODE_TYPE_NET_OPTION_NAME_OTHER:
            case sfp.NODE_TYPE_NET_OPTION_NAME_PING:
            case sfp.NODE_TYPE_NET_OPTION_NAME_POPUNDER:
            case sfp.NODE_TYPE_NET_OPTION_NAME_POPUP:
            case sfp.NODE_TYPE_NET_OPTION_NAME_REDIRECT:
            case sfp.NODE_TYPE_NET_OPTION_NAME_REDIRECTRULE:
            case sfp.NODE_TYPE_NET_OPTION_NAME_REMOVEPARAM:
            case sfp.NODE_TYPE_NET_OPTION_NAME_SCRIPT:
            case sfp.NODE_TYPE_NET_OPTION_NAME_SHIDE:
            case sfp.NODE_TYPE_NET_OPTION_NAME_TO:
            case sfp.NODE_TYPE_NET_OPTION_NAME_XHR:
            case sfp.NODE_TYPE_NET_OPTION_NAME_WEBRTC:
            case sfp.NODE_TYPE_NET_OPTION_NAME_WEBSOCKET:
                lastNetOptionType = nodeType;
                return 'def';
            case sfp.NODE_TYPE_NET_OPTION_ASSIGN:
                return 'def';
            case sfp.NODE_TYPE_NET_OPTION_VALUE:
                if ( astWalker.canGoDown() ) { break; }
                switch ( lastNetOptionType ) {
                    case sfp.NODE_TYPE_NET_OPTION_NAME_REDIRECT:
                    case sfp.NODE_TYPE_NET_OPTION_NAME_REDIRECTRULE:
                        return redirectTokenStyle(currentWalkerNode);
                    default:
                        break;
                }
                return 'value';
            case sfp.NODE_TYPE_OPTION_VALUE_NOT:
                return 'keyword strong';
            case sfp.NODE_TYPE_OPTION_VALUE_DOMAIN:
                return 'value';
            case sfp.NODE_TYPE_OPTION_VALUE_SEPARATOR:
                return 'def';
            default:
                break;
        }
        return '+';
    };

    return {
        lineComment: '!',
        token: function(stream) {
            if ( stream.sol() ) {
                astParser.parse(stream.string);
                if ( astParser.getFlags(sfp.AST_FLAG_UNSUPPORTED) !== 0 ) {
                    stream.skipToEnd();
                    return 'error';
                }
                if ( astParser.getType() === sfp.AST_TYPE_NONE ) {
                    stream.skipToEnd();
                    return 'comment';
                }
                currentWalkerNode = astWalker.reset();
            } else {
                currentWalkerNode = astWalker.next();
            }
            let style = '';
            while ( currentWalkerNode !== 0 ) {
                style = colorFromAstNode(stream);
                if ( style !== '+' ) { break; }
                currentWalkerNode = astWalker.next();
            }
            if ( style === '+' ) {
                stream.skipToEnd();
                return null;
            }
            stream.pos = astParser.getNodeStringEnd(currentWalkerNode);
            if ( astParser.isNetworkFilter() ) {
                return style ? `line-cm-net ${style}` : 'line-cm-net';
            }
            if ( astParser.isExtendedFilter() ) {
                let flavor = '';
                if ( astParser.isCosmeticFilter() ) {
                    flavor = 'line-cm-ext-dom';
                } else if ( astParser.isScriptletFilter() ) {
                    flavor = 'line-cm-ext-js';
                } else if ( astParser.isHtmlFilter() ) {
                    flavor = 'line-cm-ext-html';
                }
                if ( flavor !== '' ) {
                    style = `${flavor} ${style}`;
                }
            }
            style = style.trim();
            return style !== '' ? style : null;
        },
        setHints: function(details) {
            if ( Array.isArray(details.redirectResources) ) {
                for ( const [ name, desc ] of details.redirectResources ) {
                    const displayText = desc.aliasOf !== ''
                        ? `${name} (${desc.aliasOf})`
                        : '';
                    if ( desc.canRedirect ) {
                        redirectNames.set(name, displayText);
                    }
                    if ( desc.canInject && name.endsWith('.js') ) {
                        scriptletNames.set(name.slice(0, -3), displayText);
                    }
                }
            }
            if ( Array.isArray(details.preparseDirectiveTokens)) {
                details.preparseDirectiveTokens.forEach(([ a, b ]) => {
                    preparseDirectiveTokens.set(a, b);
                });
            }
            if ( Array.isArray(details.preparseDirectiveHints)) {
                preparseDirectiveHints.push(...details.preparseDirectiveHints);
            }
            if ( Array.isArray(details.originHints) ) {
                originHints.length = 0;
                for ( const hint of details.originHints ) {
                    originHints.push(hint);
                }
            }
            if ( hintHelperRegistered === false ) {
                hintHelperRegistered = true;
                initHints();
            }
            astParser.options.filterOnHeaders = details.filterOnHeaders === true;
        },
        parser: astParser,
    };
});

/******************************************************************************/

// Following code is for auto-completion. Reference:
//   https://codemirror.net/demo/complete.html

const initHints = function() {
    if ( sfp.AstFilterParser instanceof Object === false ) { return; }

    const astParser = new sfp.AstFilterParser({
        interactive: true,
        nativeCssHas: vAPI.webextFlavor.env.includes('native_css_has'),
    });
    const proceduralOperatorNames = new Map(
        Array.from(sfp.proceduralOperatorTokens)
             .filter(item => (item[1] & 0b01) !== 0)
    );
    const excludedHints = new Set([
        'genericblock',
        'object-subrequest',
        'rewrite',
        'webrtc',
    ]);

    const pickBestHints = function(cursor, seedLeft, seedRight, hints) {
        const seed = (seedLeft + seedRight).trim();
        const out = [];
        // First, compare against whole seed
        for ( const hint of hints ) {
            const text = hint instanceof Object
                ? hint.displayText || hint.text
                : hint;
            if ( text.startsWith(seed) === false ) { continue; }
            out.push(hint);
        }
        if ( out.length !== 0 ) {
            return {
                from: { line: cursor.line, ch: cursor.ch - seedLeft.length },
                to: { line: cursor.line, ch: cursor.ch + seedRight.length },
                list: out,
            };
        }
        // If no match, try again with a different heuristic: valid hints are
        // those matching left seed, not matching right seed but right seed is
        // found to be a valid hint. This is to take care of cases like:
        //
        //     *$script,redomain=example.org
        //                ^
        //                + cursor position
        //
        // In such case, [ redirect=, redirect-rule= ] should be returned
        // as valid hints.
        for ( const hint of hints ) {
            const text = hint instanceof Object
                ? hint.displayText || hint.text
                : hint;
            if ( seedLeft.length === 0 ) { continue; }
            if ( text.startsWith(seedLeft) === false ) { continue; }
            if ( hints.includes(seedRight) === false ) { continue; }
            out.push(hint);
        }
        if ( out.length !== 0 ) {
            return {
                from: { line: cursor.line, ch: cursor.ch - seedLeft.length },
                to: { line: cursor.line, ch: cursor.ch },
                list: out,
            };
        }
        // If no match, try again with a different heuristic: valid hints are
        // those containing seed as a substring. This is to take care of cases
        // like:
        //
        //     *$script,redirect=gif
        //                       ^
        //                       + cursor position
        //
        // In such case, [ 1x1.gif, 1x1-transparent.gif ] should be returned
        // as valid hints.
        for ( const hint of hints ) {
            const text = hint instanceof Object
                ? hint.displayText || hint.text
                : hint;
            if ( seedLeft.length === 1 ) {
                if ( text.startsWith(seedLeft) === false ) { continue; }
            } else if ( text.includes(seed) === false ) { continue; }
            out.push(hint);
        }
        if ( out.length !== 0 ) {
            return {
                from: { line: cursor.line, ch: cursor.ch - seedLeft.length },
                to: { line: cursor.line, ch: cursor.ch + seedRight.length },
                list: out,
            };
        }
        // If still no match, try again with a different heuristic: valid hints
        // are those containing left seed as a substring. This is to take care
        // of cases like:
        //
        //     *$script,redirect=gifdomain=example.org
        //                          ^
        //                          + cursor position
        //
        // In such case, [ 1x1.gif, 1x1-transparent.gif ] should be returned
        // as valid hints.
        for ( const hint of hints ) {
            const text = hint instanceof Object
                ? hint.displayText || hint.text
                : hint;
            if ( text.includes(seedLeft) === false ) { continue; }
            out.push(hint);
        }
        if ( out.length !== 0 ) {
            return {
                from: { line: cursor.line, ch: cursor.ch - seedLeft.length },
                to: { line: cursor.line, ch: cursor.ch },
                list: out,
            };
        }
    };

    const getOriginHints = function(cursor, line, suffix = '') {
        const beg = cursor.ch;
        const matchLeft = /[^,|=~]*$/.exec(line.slice(0, beg));
        const matchRight = /^[^#,|]*/.exec(line.slice(beg));
        if ( matchLeft === null || matchRight === null ) { return; }
        const hints = [];
        for ( const text of originHints ) {
            hints.push(text + suffix);
        }
        return pickBestHints(cursor, matchLeft[0], matchRight[0], hints);
    };

    const getNetPatternHints = function(cursor, line) {
        if ( /\|\|[\w.-]*$/.test(line.slice(0, cursor.ch)) ) {
            return getOriginHints(cursor, line, '^');
        }
        // Maybe a static extended filter is meant to be crafted.
        if ( /[^\w\x80-\xF4#,.-]/.test(line) === false ) {
            return getOriginHints(cursor, line);
        }
    };

    const getNetOptionHints = function(cursor, seedLeft, seedRight) {
        const isNegated = seedLeft.startsWith('~');
        if ( isNegated ) {
            seedLeft = seedLeft.slice(1);
        }
        const assignPos = seedRight.indexOf('=');
        if ( assignPos !== -1 ) { seedRight = seedRight.slice(0, assignPos); }
        const isException = astParser.isException();
        const hints = [];
        for ( let [ text, desc ] of sfp.netOptionTokenDescriptors ) {
            if ( excludedHints.has(text) ) { continue; }
            if ( isNegated && desc.canNegate !== true ) { continue; }
            if ( isException ) {
                if ( desc.blockOnly ) { continue; }
            } else {
                if ( desc.allowOnly ) { continue; }
                if ( (assignPos === -1) && desc.mustAssign ) {
                    text += '=';
                }
            }
            hints.push(text);
        }
        return pickBestHints(cursor, seedLeft, seedRight, hints);
    };

    const getNetRedirectHints = function(cursor, seedLeft, seedRight) {
        const hints = [];
        for ( const text of redirectNames.keys() ) {
            if ( text.startsWith('abp-resource:') ) { continue; }
            hints.push(text);
        }
        return pickBestHints(cursor, seedLeft, seedRight, hints);
    };

    const getNetHints = function(cursor, line) {
        const patternNode = astParser.getBranchFromType(sfp.NODE_TYPE_NET_PATTERN_RAW);
        if ( patternNode === 0 ) { return; }
        const patternEnd = astParser.getNodeStringEnd(patternNode);
        const beg = cursor.ch;
        if ( beg <= patternEnd ) {
            return getNetPatternHints(cursor, line);
        }
        const lineBefore = line.slice(0, beg);
        const lineAfter = line.slice(beg);
        let matchLeft = /[^$,]*$/.exec(lineBefore);
        let matchRight = /^[^,]*/.exec(lineAfter);
        if ( matchLeft === null || matchRight === null ) { return; }
        const assignPos = matchLeft[0].indexOf('=');
        if ( assignPos === -1 ) {
            return getNetOptionHints(cursor, matchLeft[0], matchRight[0]);
        }
        if ( /^(redirect(-rule)?|rewrite)=/.test(matchLeft[0]) ) {
            return getNetRedirectHints(
                cursor,
                matchLeft[0].slice(assignPos + 1),
                matchRight[0]
            );
        }
        if ( matchLeft[0].startsWith('domain=') ) {
            return getOriginHints(cursor, line);
        }
    };

    const getExtSelectorHints = function(cursor, line) {
        const beg = cursor.ch;
        // Special selector case: `^responseheader`
        {
            const match = /#\^([a-z]+)$/.exec(line.slice(0, beg));
            if (
                match !== null &&
                'responseheader'.startsWith(match[1]) &&
                line.slice(beg) === ''
            ) {
                return pickBestHints(
                    cursor,
                    match[1],
                    '',
                    [ 'responseheader()' ]
                );
            }
        }
        // Procedural operators
        const matchLeft = /#\^?.*:([^:]*)$/.exec(line.slice(0, beg));
        const matchRight = /^([a-z-]*)\(?/.exec(line.slice(beg));
        if ( matchLeft === null || matchRight === null ) { return; }
        const isStaticDOM = matchLeft[0].indexOf('^') !== -1;
        const hints = [];
        for ( let [ text, bits ] of proceduralOperatorNames ) {
            if ( isStaticDOM && (bits & 0b10) !== 0 ) { continue; }
            hints.push(text);
        }
        return pickBestHints(cursor, matchLeft[1], matchRight[1], hints);
    };

    const getExtHeaderHints = function(cursor, line) {
        const beg = cursor.ch;
        const matchLeft = /#\^responseheader\((.*)$/.exec(line.slice(0, beg));
        const matchRight = /^([^)]*)/.exec(line.slice(beg));
        if ( matchLeft === null || matchRight === null ) { return; }
        const hints = [];
        for ( const hint of sfp.removableHTTPHeaders ) {
            hints.push(hint);
        }
        return pickBestHints(cursor, matchLeft[1], matchRight[1], hints);
    };

    const getExtScriptletHints = function(cursor, line) {
        const beg = cursor.ch;
        const matchLeft = /#\+\js\(([^,]*)$/.exec(line.slice(0, beg));
        const matchRight = /^([^,)]*)/.exec(line.slice(beg));
        if ( matchLeft === null || matchRight === null ) { return; }
        const hints = [];
        for ( const [ text, displayText ] of scriptletNames ) {
            const hint = { text };
            if ( displayText !== '' ) {
                hint.displayText = displayText;
            }
            hints.push(hint);
        }
        return pickBestHints(cursor, matchLeft[1], matchRight[1], hints);
    };

    const getCommentHints = function(cursor, line) {
        const beg = cursor.ch;
        if ( line.startsWith('!#if ') ) {
            const matchLeft = /^!#if !?(\w*)$/.exec(line.slice(0, beg));
            const matchRight = /^\w*/.exec(line.slice(beg));
            if ( matchLeft === null || matchRight === null ) { return; }
            return pickBestHints(
                cursor,
                matchLeft[1],
                matchRight[0],
                preparseDirectiveHints
            );
        }
        if ( line.startsWith('!#') && line !== '!#endif' ) {
            const matchLeft = /^!#(\w*)$/.exec(line.slice(0, beg));
            const matchRight = /^\w*/.exec(line.slice(beg));
            if ( matchLeft === null || matchRight === null ) { return; }
            const hints = [ 'if ', 'endif\n', 'include ' ];
            return pickBestHints(cursor, matchLeft[1], matchRight[0], hints);
        }
    };

    CodeMirror.registerHelper('hint', 'ubo-static-filtering', function(cm) {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        astParser.parse(line);
        if ( astParser.isExtendedFilter() ) {
            const anchorNode = astParser.getBranchFromType(sfp.NODE_TYPE_EXT_OPTIONS_ANCHOR);
            if ( anchorNode === 0 ) { return; }
            let hints;
            if ( cursor.ch <= astParser.getNodeStringBeg(anchorNode) ) {
                hints = getOriginHints(cursor, line);
            } else if ( astParser.isScriptletFilter() ) {
                hints = getExtScriptletHints(cursor, line);
            } else if ( astParser.isResponseheaderFilter() ) {
                hints = getExtHeaderHints(cursor, line);
            } else {
                hints = getExtSelectorHints(cursor, line);
            }
            return hints;
        }
        if ( astParser.isNetworkFilter() ) {
            return getNetHints(cursor, line);
        }
        if ( astParser.isComment() ) {
            return getCommentHints(cursor, line);
        }
        return getOriginHints(cursor, line);
    });
};

/******************************************************************************/

CodeMirror.registerHelper('fold', 'ubo-static-filtering', (( ) => {
    const foldIfEndif = function(startLineNo, startLine, cm) {
        const lastLineNo = cm.lastLine();
        let endLineNo = startLineNo;
        let depth = 1;
        while ( endLineNo < lastLineNo ) {
            endLineNo += 1;
            const line = cm.getLine(endLineNo);
            if ( line.startsWith('!#endif') ) {
                depth -= 1;
                if ( depth === 0 ) {
                    return {
                        from: CodeMirror.Pos(startLineNo, startLine.length),
                        to: CodeMirror.Pos(endLineNo, 0)
                    };
                }
            }
            if ( line.startsWith('!#if') ) {
                depth += 1;
            }
        }
    };

    const foldInclude = function(startLineNo, startLine, cm) {
        const lastLineNo = cm.lastLine();
        let endLineNo = startLineNo + 1;
        if ( endLineNo >= lastLineNo ) { return; }
        if ( cm.getLine(endLineNo).startsWith('! >>>>>>>> ') === false ) {
            return;
        }
        while ( endLineNo < lastLineNo ) {
            endLineNo += 1;
            const line = cm.getLine(endLineNo);
            if ( line.startsWith('! <<<<<<<< ') ) {
                return {
                    from: CodeMirror.Pos(startLineNo, startLine.length),
                    to: CodeMirror.Pos(endLineNo, line.length)
                };
            }
        }
    };

    return function(cm, start) {
        const startLineNo = start.line;
        const startLine = cm.getLine(startLineNo);
        if ( startLine.startsWith('!#if') ) {
            return foldIfEndif(startLineNo, startLine, cm);
        }
        if ( startLine.startsWith('!#include ') ) {
            return foldInclude(startLineNo, startLine, cm);
        }
    };
})());

/******************************************************************************/

// Enhanced word selection

{
    const selectWordAt = function(cm, pos) {
        const { line, ch } = pos;
        const s = cm.getLine(line);
        const { type: token } = cm.getTokenAt(pos);
        let beg, end;

        // Select URL in comments
        if ( /\bcomment\b/.test(token) && /\blink\b/.test(token) ) {
            const l = /\S+$/.exec(s.slice(0, ch));
            if ( l && /^https?:\/\//.test(s.slice(l.index)) ) {
                const r = /^\S+/.exec(s.slice(ch));
                if ( r ) {
                    beg = l.index;
                    end = ch + r[0].length;
                }
            }
        }

        // Better word selection for extended filters: prefix
        else if (
            /\bline-cm-ext-(?:dom|html|js)\b/.test(token) &&
            /\bvalue\b/.test(token)
        ) {
            const l = /[^,.]*$/i.exec(s.slice(0, ch));
            const r = /^[^#,]*/i.exec(s.slice(ch));
            if ( l && r ) {
                beg = l.index;
                end = ch + r[0].length;
            }
        }

        // Better word selection for cosmetic and HTML filters: suffix
        else if ( /\bline-cm-ext-(?:dom|html)\b/.test(token) ) {
            const l = /[#.]?[a-z0-9_-]+$/i.exec(s.slice(0, ch));
            const r = /^[a-z0-9_-]+/i.exec(s.slice(ch));
            if ( l && r ) {
                beg = l.index;
                end = ch + r[0].length;
                if ( /\bdef\b/.test(cm.getTokenTypeAt({ line, ch: beg + 1 })) ) {
                    beg += 1;
                }
            }
        }

        // Better word selection for network filters
        else if ( /\bline-cm-net\b/.test(token) ) {
            if ( /\bvalue\b/.test(token) ) {
                const l = /[^ ,.=|]*$/i.exec(s.slice(0, ch));
                const r = /^[^ #,|]*/i.exec(s.slice(ch));
                if ( l && r ) {
                    beg = l.index;
                    end = ch + r[0].length;
                }
            } else if ( /\bdef\b/.test(token) ) {
                const l = /[a-z0-9-]+$/i.exec(s.slice(0, ch));
                const r = /^[^,]*=[^,]+/i.exec(s.slice(ch));
                if ( l && r ) {
                    beg = l.index;
                    end = ch + r[0].length;
                }
            }
        }

        if ( beg === undefined ) {
            const { anchor, head } = cm.findWordAt(pos);
            return { from: anchor, to: head };
        }

        return {
            from: { line, ch: beg },
            to: { line, ch: end },
        };
    };

    CodeMirror.defineInitHook(cm => {
        cm.setOption('configureMouse', function(cm, repeat) {
            return {
                unit: repeat === 'double' ? selectWordAt : null,
            };
        });
    });
}

/******************************************************************************/
