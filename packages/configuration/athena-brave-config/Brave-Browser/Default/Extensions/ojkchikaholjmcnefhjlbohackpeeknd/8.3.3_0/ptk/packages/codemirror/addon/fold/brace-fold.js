(function(a){"object"==typeof exports&&"object"==typeof module?a(require("../../lib/codemirror")):"function"==typeof define&&define.amd?define(["../../lib/codemirror"],a):a(CodeMirror)})(function(a){function y(d){return function(b,f){function p(n){var g=f.ch;for(var u=0;;){var q=0>=g?-1:c.lastIndexOf(n[0],g-1);if(-1==q){if(1==u)break;u=1;g=c.length}else{if(1==u&&q<f.ch)break;g=b.getTokenTypeAt(a.Pos(e,q+1));if(!/^(comment|string)/.test(g))return{ch:q+1,tokenType:g,pair:n};g=q-1}}}function h(n){var g=
1,u=b.lastLine(),q=n.ch,t=e;a:for(;t<=u;++t)for(var v=b.getLine(t),k=t==e?q:0;;){var w=v.indexOf(n.pair[0],k);k=v.indexOf(n.pair[1],k);0>w&&(w=v.length);0>k&&(k=v.length);k=Math.min(w,k);if(k==v.length)break;if(b.getTokenTypeAt(a.Pos(t,k+1))==n.tokenType)if(k==w)++g;else if(!--g){var x=t;var z=k;break a}++k}return null==x||e==x?null:{from:a.Pos(e,q),to:a.Pos(x,z)}}for(var e=f.line,c=b.getLine(e),m=[],l=0;l<d.length;l++){var r=p(d[l]);r&&m.push(r)}m.sort(function(n,g){return n.ch-g.ch});for(l=0;l<
m.length;l++)if(r=h(m[l]))return r;return null}}a.registerHelper("fold","brace",y([["{","}"],["[","]"]]));a.registerHelper("fold","brace-paren",y([["{","}"],["[","]"],["(",")"]]));a.registerHelper("fold","import",function(d,b){function f(c){if(c<d.firstLine()||c>d.lastLine())return null;var m=d.getTokenAt(a.Pos(c,1));/\S/.test(m.string)||(m=d.getTokenAt(a.Pos(c,m.end+1)));if("keyword"!=m.type||"import"!=m.string)return null;var l=c;for(c=Math.min(d.lastLine(),c+10);l<=c;++l){var r=d.getLine(l).indexOf(";");
if(-1!=r)return{startCh:m.end,end:a.Pos(l,r)}}}b=b.line;var p=f(b),h;if(!p||f(b-1)||(h=f(b-2))&&h.end.line==b-1)return null;for(h=p.end;;){var e=f(h.line+1);if(null==e)break;h=e.end}return{from:d.clipPos(a.Pos(b,p.startCh+1)),to:h}});a.registerHelper("fold","include",function(d,b){function f(e){if(e<d.firstLine()||e>d.lastLine())return null;var c=d.getTokenAt(a.Pos(e,1));/\S/.test(c.string)||(c=d.getTokenAt(a.Pos(e,c.end+1)));if("meta"==c.type&&"#include"==c.string.slice(0,8))return c.start+8}b=b.line;
var p=f(b);if(null==p||null!=f(b-1))return null;for(var h=b;null!=f(h+1);)++h;return{from:a.Pos(b,p+1),to:d.clipPos(a.Pos(h))}})});