(function(a){"object"==typeof exports&&"object"==typeof module?a(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],a):a(CodeMirror)})(function(a){a.registerHelper("fold","markdown",function(b,e){function l(d){return(d=b.getTokenTypeAt(a.Pos(d,0)))&&/\bheader\b/.test(d)}function m(d,f,g){return(f=f&&f.match(/^#+/))&&l(d)?f[0].length:(f=g&&g.match(/^[=\-]+\s*$/))&&l(d+1)?"="==g[0]?1:2:100}var n=b.getLine(e.line),h=b.getLine(e.line+1),p=m(e.line,n,
h);if(100!==p){for(var q=b.lastLine(),c=e.line,k=b.getLine(c+2);c<q&&!(m(c+1,h,k)<=p);)++c,h=k,k=b.getLine(c+2);return{from:a.Pos(e.line,n.length),to:a.Pos(c,b.getLine(c).length)}}})});