"use strict";
/*---------------------------------------------------------------------------------------------
 *  Homepage:   https://github.com/sainnhe/gruvbox-material-vscode
 *  Copyright:  2020 Sainnhe Park <i@sainnhe.dev>
 *  License:    MIT
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorfulSyntax = void 0;
function getColorfulSyntax(palette, italicComments) {
    const syntax = [
        // Syntax{{{
        {
            name: "String",
            scope: "string, punctuation.definition.string.end, punctuation.definition.string.begin",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Delimiter",
            scope: "punctuation",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "String Escape",
            scope: "constant.character.escape, text.html constant.character.entity.named, punctuation.definition.entity.html",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Preproc",
            scope: "keyword.control.at-rule, keyword.control.import, keyword.control.export, storage.type.namespace, punctuation.decorator, keyword.control.directive.include, keyword.preprocessor, punctuation.definition.preprocessor",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Macro",
            scope: "entity.name.function.preprocessor",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Enum",
            scope: "entity.name.type.enum",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Debug",
            scope: "keyword.other.debugger",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "This",
            scope: "variable.language.this",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Path indicator",
            scope: "variable.language.super",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Boolean",
            scope: "constant.language.boolean",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Number",
            scope: "constant.numeric",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Identifier",
            scope: "variable, support.variable, support.class, support.constant, meta.definition.variable entity.name.function",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Keyword",
            scope: "keyword, modifier, variable.language.this, support.type.object, constant.language, storage.type.function, storage.type.class",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Function call",
            scope: "entity.name.function, support.function",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Storage",
            scope: "storage.type, storage.modifier, keyword.operator",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Operator",
            scope: "keyword.operator",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Modules",
            scope: "support.module, support.node",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Class",
            scope: "entity.name.type.class, support.class",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Type",
            scope: "support.type, entity.name.type, entity.other.inherited-class",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Class variable",
            scope: "variable.object.property, meta.field.declaration",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Property",
            scope: "support.variable.property, variable.other.property, meta.object-literal.key, variable.other.object.property, variable.other.constant.property",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Member",
            scope: "variable.other.enummember",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Special constant",
            scope: "constant.language.null, constant.language.undefined, constant.language.nan",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Class method",
            scope: "meta.definition.method",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Function definition",
            scope: "meta.function, entity.name.function",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Template expression",
            scope: "template.expression.begin, template.expression.end, punctuation.definition.template-expression.begin, punctuation.definition.template-expression.end",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Reset embedded/template expression colors",
            scope: "meta.embedded, source.groovy.embedded, meta.template.expression",
            settings: {
                foreground: palette.fg,
            },
        },
        // }}}
        // Markdown{{{
        {
            name: "Markdown heading1",
            scope: "heading.1.markdown, markup.heading.setext.1.markdown",
            settings: {
                foreground: palette.red,
                fontStyle: "bold",
            },
        },
        {
            name: "Markdown heading2",
            scope: "heading.2.markdown, markup.heading.setext.2.markdown",
            settings: {
                foreground: palette.orange,
                fontStyle: "bold",
            },
        },
        {
            name: "Markdown heading3",
            scope: "heading.3.markdown",
            settings: {
                foreground: palette.yellow,
                fontStyle: "bold",
            },
        },
        {
            name: "Markdown heading4",
            scope: "heading.4.markdown",
            settings: {
                foreground: palette.green,
                fontStyle: "bold",
            },
        },
        {
            name: "Markdown heading5",
            scope: "heading.5.markdown",
            settings: {
                foreground: palette.blue,
                fontStyle: "bold",
            },
        },
        {
            name: "Markdown heading6",
            scope: "heading.6.markdown",
            settings: {
                foreground: palette.purple,
                fontStyle: "bold",
            },
        },
        {
            name: "Markdown heading delimiter",
            scope: "punctuation.definition.heading.markdown",
            settings: {
                foreground: palette.grey1,
                fontStyle: "regular",
            },
        },
        {
            name: "Markdown link",
            scope: "string.other.link.title.markdown, constant.other.reference.link.markdown, string.other.link.description.markdown",
            settings: {
                foreground: palette.purple,
                fontStyle: "regular",
            },
        },
        {
            name: "Markdown link text",
            scope: "markup.underline.link.image.markdown, markup.underline.link.markdown",
            settings: {
                foreground: palette.green,
                fontStyle: "underline",
            },
        },
        {
            name: "Markdown delimiter",
            scope: "punctuation.definition.string.begin.markdown, punctuation.definition.string.end.markdown, punctuation.definition.italic.markdown, punctuation.definition.quote.begin.markdown, punctuation.definition.metadata.markdown, punctuation.separator.key-value.markdown, punctuation.definition.constant.markdown",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "Markdown bold delimiter",
            scope: "punctuation.definition.bold.markdown",
            settings: {
                foreground: palette.grey1,
                fontStyle: "regular",
            },
        },
        {
            name: "Markdown separator delimiter",
            scope: "meta.separator.markdown, punctuation.definition.constant.begin.markdown, punctuation.definition.constant.end.markdown",
            settings: {
                foreground: palette.grey1,
                fontStyle: "bold",
            },
        },
        {
            name: "Markdown italic",
            scope: "markup.italic",
            settings: {
                fontStyle: "italic",
            },
        },
        {
            name: "Markdown bold",
            scope: "markup.bold",
            settings: {
                fontStyle: "bold",
            },
        },
        {
            name: "Markdown bold italic",
            scope: "markup.bold markup.italic, markup.italic markup.bold",
            settings: {
                fontStyle: "italic bold",
            },
        },
        {
            name: "Markdown code delimiter",
            scope: "punctuation.definition.markdown, punctuation.definition.raw.markdown",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Markdown code type",
            scope: "fenced_code.block.language",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Markdown code block",
            scope: "markup.fenced_code.block.markdown, markup.inline.raw.string.markdown",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Markdown list mark",
            scope: "punctuation.definition.list.begin.markdown",
            settings: {
                foreground: palette.red,
            },
        },
        // }}}
        // reStructuredText{{{
        {
            name: "reStructuredText heading",
            scope: "punctuation.definition.heading.restructuredtext",
            settings: {
                foreground: palette.orange,
                fontStyle: "bold",
            },
        },
        {
            name: "reStructuredText delimiter",
            scope: "punctuation.definition.field.restructuredtext, punctuation.separator.key-value.restructuredtext, punctuation.definition.directive.restructuredtext, punctuation.definition.constant.restructuredtext, punctuation.definition.italic.restructuredtext, punctuation.definition.table.restructuredtext",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "reStructuredText delimiter bold",
            scope: "punctuation.definition.bold.restructuredtext",
            settings: {
                foreground: palette.grey1,
                fontStyle: "regular",
            },
        },
        {
            name: "reStructuredText aqua",
            scope: "entity.name.tag.restructuredtext, punctuation.definition.link.restructuredtext, punctuation.definition.raw.restructuredtext, punctuation.section.raw.restructuredtext",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "reStructuredText purple",
            scope: "constant.other.footnote.link.restructuredtext",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "reStructuredText red",
            scope: "support.directive.restructuredtext",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "reStructuredText green",
            scope: "entity.name.directive.restructuredtext, markup.raw.restructuredtext, markup.raw.inner.restructuredtext",
            settings: {
                foreground: palette.green,
            },
        },
        // }}}
        // LaTex{{{
        {
            name: "LaTex delimiter",
            scope: "punctuation.definition.function.latex, punctuation.definition.function.tex, punctuation.definition.keyword.latex, constant.character.newline.tex, punctuation.definition.keyword.tex",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "LaTex red",
            scope: "support.function.section.latex",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "LaTex yellow",
            scope: "keyword.control.equation.align.latex",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "LaTex green",
            scope: "support.function.general.tex, support.class.math.block.environment.latex",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "LaTex purple",
            scope: "keyword.control.preamble.latex",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "LaTex aqua",
            scope: "support.class.latex",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "LaTex blue",
            scope: "meta.group.braces.tex",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "LaTex orange",
            scope: "support.function.be.latex, keyword.control.equation.newline.latex",
            settings: {
                foreground: palette.orange,
            },
        },
        // }}}
        // Html/Xml{{{
        {
            name: "Html orange",
            scope: "entity.name.tag.html, entity.name.tag.xml, entity.name.tag.localname.xml",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Html aqua",
            scope: "punctuation.separator.key-value.html, meta.internalsubset.xml",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Html yellow",
            scope: "entity.other.attribute-name.html, entity.other.attribute-name.xml, entity.other.attribute-name.localname.xml",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Html purple",
            scope: "meta.tag.metadata.script.start.html",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Html delimiter",
            scope: "punctuation.definition.tag.begin.html, punctuation.definition.tag.end.html, punctuation.definition.tag.xml",
            settings: {
                foreground: palette.grey1,
            },
        },
        // }}}
        // CSS{{{
        {
            name: "CSS white",
            scope: "punctuation.section.function.begin.bracket.round.css, punctuation.section.function.end.bracket.round.css, punctuation.separator.list.comma.css",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "CSS grey",
            scope: "punctuation.definition.entity.css",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "CSS red",
            scope: "entity.other.attribute-name.class.css, entity.other.keyframe-offset.percentage.css, meta.selector.css",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "CSS orange",
            scope: "support.constant.property-value.css",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "CSS yellow",
            scope: "entity.other.attribute-name.id",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "CSS green",
            scope: "keyword.other.unit.px.css, entity.other.attribute-name.css, meta.property-value.css, entity.other.attribute-name.class.mixin.css, keyword.other.unit.percentage.css, keyword.other.unit.em.css, keyword.other.unit.rem.css, keyword.other.unit.vw.css, keyword.other.unit.vh.css, keyword.other.unit.vmin.css, keyword.other.unit.vmax.css, keyword.other.unit.pt.css, keyword.other.unit.cm.css, keyword.other.unit.mm.css, keyword.other.unit.in.css",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "CSS aqua",
            scope: "support.type.property-name.css",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "CSS blue",
            scope: "entity.other.attribute-name.pseudo-element.css, entity.other.attribute-name.pseudo-class.css",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "CSS purple",
            scope: "entity.name.tag.css, entity.other.keyframe-offset.css, punctuation.definition.keyword.css",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // SASS/SCSS{{{
        {
            name: "SASS yellow",
            scope: "entity.other.attribute-name.placeholder-selector.sass",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "SASS orange",
            scope: "entity.other.attribute-selector.sass",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "SASS green",
            scope: "keyword.other.unit.css.sass, string.quoted.single.scss",
            settings: {
                foreground: palette.green,
                fontStyle: "regular",
            },
        },
        {
            name: "SASS purple",
            scope: "punctuation.definition.keyword.scss",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // JavaScript{{{
        {
            name: "JavaScript white",
            scope: "meta.brace.round.js, meta.brace.square.js, meta.brace.curly.js",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "JavaScript grey",
            scope: "punctuation.accessor.js, punctuation.separator.key-value.js, punctuation.separator.label.js, keyword.operator.accessor.js",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "JavaScript red",
            scope: "storage.type.function.js, keyword.operator.expression.in.js, keyword.operator.expression.of.js, storage.type.class.js",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "JavaScript orange",
            scope: "keyword.control.switch.js",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "JavaScript yellow",
            scope: "punctuation.quasi.element.begin.js, punctuation.quasi.element.end.js",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "JavaScript aqua",
            scope: "constant.language.infinity.js, string.unquoted.js",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "JavaScript purple",
            scope: "variable.language.this.js, storage.type.function.arrow.js, variable.other.object.js, constant.other.label.js",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // JSX{{{
        {
            name: "JSX grey",
            scope: "punctuation.definition.tag.begin.js.jsx, punctuation.definition.tag.end.js.jsx",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "JSX orange",
            scope: "entity.name.tag.js.jsx",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "JSX aqua",
            scope: "entity.other.attribute-name.js.jsx",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "JSX purple",
            scope: "constant.language.null.js.jsx, constant.language.undefined.js.jsx, constant.language.nan.js.jsx, constant.language.infinity.js.jsx",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // TypeScript{{{
        {
            name: "TypeScript white",
            scope: "meta.brace.round.ts, meta.brace.square.ts",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "TypeScript red",
            scope: "storage.type.enum.ts, storage.type.function.ts, storage.type.interface.ts, storage.type.property.ts",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "TypeScript green",
            scope: "keyword.operator.type.annotation, entity.name.function.ts",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "TypeScript aqua",
            scope: "punctuation.definition.template-expression.end.ts, punctuation.definition.template-expression.begin.ts, variable.parameter.ts, variable.other.readwrite.alias.ts",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "TypeScript purple",
            scope: "keyword.operator.spread.ts, variable.language.this.ts, storage.type.function.arrow.ts, variable.other.object.ts",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // TSX{{{
        {
            name: "TSX white",
            scope: "meta.brace.round.tsx, meta.brace.square.tsx",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "TSX grey",
            scope: "punctuation.definition.tag.begin.tsx, punctuation.definition.tag.end.tsx",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "TSX red",
            scope: "storage.type.enum.tsx, storage.type.function.tsx, storage.type.interface.tsx, storage.type.property.tsx",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "TSX orange",
            scope: "entity.name.tag.tsx",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "TSX green",
            scope: "keyword.operator.type.annotation, entity.name.function.tsx",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "TSX aqua",
            scope: "punctuation.definition.template-expression.end.tsx, variable.other.readwrite.alias.tsx, punctuation.definition.template-expression.begin.tsx, variable.parameter.tsx, constant.language.import-export-all.tsx, entity.other.attribute-name.tsx",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "TSX purple",
            scope: "keyword.operator.spread.tsx, variable.language.this.tsx, storage.type.function.arrow.tsx, variable.other.object.tsx",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // VUE{{{
        {
            name: "VUE grey",
            scope: "punctuation.definition.tag.html",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "VUE orange",
            scope: "entity.name.tag.other.html, entity.name.tag.block.any.html, entity.name.tag.script.html, entity.name.tag.inline.any.html, entity.name.tag.structure.any.html, entity.name.tag.style.html, entity.name.tag.doctype.html",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "VUE aqua",
            scope: "meta.tag.other.html, meta.tag.inline.any.html, meta.tag.block.any.html",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "VUE purple",
            scope: "entity.name.label.js",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // CoffeeScript{{{
        {
            name: "CoffeeScript white",
            scope: "punctuation.definition.arguments.end.bracket.round.coffee, punctuation.definition.arguments.begin.bracket.round.coffee, punctuation.definition.array.begin.bracket.square.coffee, punctuation.definition.array.end.bracket.square.coffee, punctuation.definition.character-class.regexp",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "CoffeeScript grey",
            scope: "keyword.operator.prototype.coffee",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "CoffeeScript yellow",
            scope: "constant.other.character-class.range.regexp",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "CoffeeScript aqua",
            scope: "variable.parameter.function.coffee, punctuation.section.embedded.coffee, meta.arguments.coffee, constant.character.character-class.regexp",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "CoffeeScript blue",
            scope: "source.coffee.embedded.source",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "CoffeeScript purple",
            scope: "keyword.operator.slice.exclusive.coffee, keyword.operator.splat.coffee, variable.language.this.coffee, variable.other.readwrite.instance.coffee, variable.parameter.function.readwrite.instance.coffee, keyword.control.anchor.regexp, variable.other.object.coffee",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // PureScript{{{
        {
            name: "PureScript yellow",
            scope: "entity.name.tag.purescript",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "PureScript purple",
            scope: "support.other.module.purescript",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Dart{{{
        {
            name: "Dart aqua",
            scope: "constant.language.dart",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Dart purple",
            scope: "keyword.operator.closure.dart, storage.type.annotation.dart, keyword.other.import.dart",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Pug{{{
        {
            name: "Pug red",
            scope: "entity.other.attribute-name.class.pug",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Pug aqua",
            scope: "entity.other.attribute-name.tag.pug, variable.control.import.include.pug",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Pug purple",
            scope: "entity.name.tag.pug, storage.type.import.include.pug",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Python{{{
        {
            name: "Python yellow",
            scope: "storage.type.format.python",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Python green",
            scope: "meta.function-call.generic.python",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Python aqua",
            scope: "storage.type.imaginary.number.python, support.function.magic.python, entity.name.function.python, constant.character.format.placeholder.other.python, constant.language.python, meta.member.access.python",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Python blue",
            scope: "meta.function-call.arguments.python",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Python purple",
            scope: "variable.language.special.self.python, punctuation.definition.decorator.python",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Java{{{
        {
            name: "Java white",
            scope: "keyword.control.ternary.java",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "Java red",
            scope: "storage.modifier.extends.java",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Java yellow",
            scope: "storage.type.primitive.java, storage.type.object.array.java, storage.type.java, storage.type.generic.java",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Java aqua",
            scope: "variable.other.object.property.java, storage.modifier.import.java, storage.modifier.package.java, constant.other.enum.java",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Java purple",
            scope: "variable.other.object.java, variable.language.this.java, keyword.other.import.java, keyword.other.package.java, punctuation.definition.annotation.java, storage.type.annotation.java",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Kotlin{{{
        {
            name: "Kotlin purple",
            scope: "keyword.other.import.kotlin, storage.type.annotation.kotlin",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Kotlin aqua",
            scope: "punctuation.section.block.begin.kotlin, punctuation.section.block.end.kotlin, punctuation.definition.keyword.kotlin, constant.language.kotlin, entity.name.function.constructor, entity.name.package.kotlin",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Kotlin white",
            scope: "keyword.operator.declaration.kotlin",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "Kotlin blue",
            scope: "entity.string.template.element.kotlin",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Kotlin yellow",
            scope: "entity.name.class.kotlin",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Kotlin grey",
            scope: "punctuation.accessor.reference.kotlin",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "Kotlin red",
            scope: "storage.type.kotlin",
            settings: {
                foreground: palette.red,
            },
        },
        // }}}
        // C/C++{{{
        {
            name: "C white",
            scope: "storage.modifier.array.bracket.square.c",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "C grey",
            scope: "punctuation.separator.namespace.access.cpp, punctuation.separator.scope-resolution.cpp, punctuation.separator.scope-resolution.parameter.cpp, punctuation.separator.scope-resolution.constructor.cpp, punctuation.separator.scope-resolution.function.definition.cpp, punctuation.separator.scope-resolution.operator.cpp",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "C red",
            scope: "storage.type.enum.cpp, keyword.operator.new.cpp, keyword.operator.delete.cpp",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "C orange",
            scope: "keyword.control.case.c, keyword.control.case.cpp",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "C yellow",
            scope: "storage.type.built-in.primitive.c, constant.other.placeholder.c, storage.type.primitive.cpp, storage.type.built-in.primitive.cpp, storage.type.built-in.cpp, storage.type.integral.uint8_t.cpp, storage.type.integral.uint16_t.cpp, storage.type.integral.uint32_t.cpp, storage.type.integral.uint64_t.cpp",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "C aqua",
            scope: "constant.character.escape.c, constant.language.c, variable.other.member.c, entity.name.type.namespace.cpp, constant.language.nullptr.cpp, entity.name.namespace.cpp",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "C blue",
            scope: "meta.function-call.c, meta.conditional.switch.c, meta.bracket.square.access.c",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "C purple",
            scope: "punctuation.definition.directive.c, keyword.control.directive.define.c, keyword.control.default.c, keyword.operator.ternary.c, punctuation.definition.directive.cpp, entity.name.type.namespace.scope-resolution.cpp, constant.language.true.cpp, constant.language.false.cpp, keyword.control.default.cpp, storage.type.enum.c, entity.name.scope-resolution.cpp, entity.name.scope-resolution.function.call.cpp, entity.name.scope-resolution.parameter.cpp, entity.name.scope-resolution.function.definition.cpp, entity.name.scope-resolution.operator.cpp",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // ObjectiveC{{{
        {
            name: "ObjectiveC red",
            scope: "punctuation.definition.keyword.objc, punctuation.definition.storage.type.objc, storage.type.objc",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "ObjectiveC orange",
            scope: "keyword.control.case.objc, punctuation.definition.storage.modifier.objc",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "ObjectiveC yellow",
            scope: "storage.type.built-in.primitive.objc, constant.other.placeholder.objc",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "ObjectiveC green",
            scope: "meta.protocol-list.objc",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "ObjectiveC aqua",
            scope: "entity.name.tag.pragma-mark.objc, constant.language.objc, keyword.other.property.attribute.objc, variable.other.member.objc",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "ObjectiveC blue",
            scope: "meta.parens.block.objc",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "ObjectiveC purple",
            scope: "punctuation.definition.directive.objc, keyword.control.directive.pragma.pragma-mark.objc, keyword.control.directive.import.objc, keyword.control.default.objc",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // C#{{{
        {
            name: "C# red",
            scope: "punctuation.tilde.cs",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "C# orange",
            scope: "keyword.control.case.cs, keyword.control.flow.yield.cs",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "C# yellow",
            scope: "keyword.type.cs, storage.type.cs",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "C# aqua",
            scope: "variable.other.object.property.cs, entity.name.variable.property.cs, entity.name.type.namespace.cs, entity.name.variable.enum-member.cs, meta.preprocessor.cs",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "C# blue",
            scope: "entity.name.variable.local.cs, entity.name.variable.parameter.cs, entity.name.variable.field.cs",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "C# purple",
            scope: "variable.other.object.cs, keyword.control.default.cs, keyword.other.this.cs, keyword.other.using.cs, punctuation.separator.hash.cs",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Go{{{
        {
            name: "Go orange",
            scope: "keyword.var.go, keyword.type.go",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Go yellow",
            scope: "storage.type.numeric.go, storage.type.boolean.go, storage.type.string.go, storage.type.uintptr.go, storage.type.byte.go, storage.type.rune.go, constant.other.placeholder.go",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Go aqua",
            scope: "entity.name.package.go, entity.alias.import.go, constant.language.go, constant.character.escape.go, entity.name.function.go",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Go purple",
            scope: "keyword.package.go, keyword.import.go, keyword.map.go",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Rust{{{
        {
            name: "Rust white",
            scope: "keyword.operator.member-access.rust",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "Rust grey",
            scope: "keyword.operator.path.rust",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "Rust red",
            scope: "storage.type.rust",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Rust yellow",
            scope: "storage.type.core.rust, storage.class.std.rust, meta.type_params.rust, entity.name.type.rust, constant.other.placeholder.rust",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Rust aqua",
            scope: "support.constant.core.rust, entity.name.type.mod.rust",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Rust purple",
            scope: "meta.attribute.rust, keyword.operator.sigil.rust, keyword.operator.misc.rust, variable.language.self.rust",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Swift{{{
        {
            name: "Swift red",
            scope: "storage.type.enum.swift",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Swift yellow",
            scope: "meta.inheritance-clause.swift",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Swift orange",
            scope: "keyword.other.declaration-specifier.swift, keyword.control.branch.swift",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Swift aqua",
            scope: "punctuation.section.embedded.end.swift, punctuation.section.embedded.begin.swift, support.variable.swift, constant.language.nil.swift, entity.name.function.swift, variable.other.swift",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Swift blue",
            scope: "meta.function-call.swift, meta.embedded.line.swift",
            settings: {
                foreground: palette.blue,
            },
        },
        // }}}
        // PHP{{{
        {
            name: "PHP red",
            scope: "storage.modifier.extends.php, storage.modifier.implements.php, storage.type.trait.php",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "PHP orange",
            scope: "keyword.control.case.php, support.function.construct.output.php",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "PHP aqua",
            scope: "constant.language.php, constant.other.php, entity.name.type.namespace.php",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "PHP blue",
            scope: "punctuation.definition.variable.php",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "PHP purple",
            scope: "punctuation.section.embedded.begin.php, punctuation.section.embedded.end.php, keyword.control.default.php, variable.language.this.php, keyword.other.namespace.php",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // SQL{{{
        {
            name: "SQL aqua",
            scope: "constant.other.table-name.sql",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "SQL blue",
            scope: "constant.other.database-name.sql",
            settings: {
                foreground: palette.blue,
            },
        },
        // }}}
        // GraphQL{{{
        {
            name: "GraphQL aqua",
            scope: "variable.parameter.graphql",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "GraphQL purple",
            scope: "entity.name.fragment.graphql, constant.character.enum.graphql",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Ruby{{{
        {
            name: "Ruby white",
            scope: "meta.function.method.with-arguments.ruby",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "Ruby orange",
            scope: "keyword.other.special-method.ruby, keyword.control.def.ruby",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Ruby aqua",
            scope: "constant.other.symbol.ruby, constant.language.ruby, punctuation.section.embedded.begin.ruby, punctuation.section.embedded.end.ruby, constant.other.symbol.hashkey.ruby, variable.other.readwrite.instance.ruby, variable.other.constant.ruby",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Ruby purple",
            scope: "punctuation.separator.key-value, punctuation.definition.variable.ruby, variable.other.readwrite.class.ruby, entity.name.type.module.ruby",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Ruby yellow",
            scope: "string.regexp.character-class.ruby,string.regexp.interpolated.ruby,punctuation.definition.character-class.ruby,string.regexp.group.ruby",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Ruby blue",
            scope: "variable.other.constant.ruby",
            settings: {
                foreground: palette.blue,
            },
        },
        // }}}
        // Haskell{{{
        {
            name: "Haskell yellow",
            scope: "storage.type.haskell",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Haskell aqua",
            scope: "constant.other.haskell",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Haskell purple",
            scope: "keyword.other.arrow.haskell",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Lua{{{
        {
            name: "Lua white",
            scope: "meta.function.anonymous.lua, meta.table.lua",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "Lua orange",
            scope: "storage.type.function.lua, storage.type.function.property.lua",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Lua aqua",
            scope: "constant.language.lua, variable.other.table.property.lua, entity.name.function-table.lua",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Lua purple",
            scope: "variable.language.self.lua",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Perl{{{
        {
            name: "Perl red",
            scope: "storage.type.sub.perl, storage.type.declare.routine.perl",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Perl aqua",
            scope: "constant.other.key.perl, constant.other.bareword.perl",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Perl blue",
            scope: "punctuation.definition.variable.perl",
            settings: {
                foreground: palette.blue,
            },
        },
        // }}}
        // Scala{{{
        {
            name: "Scala yellow",
            scope: "storage.type.primitive.scala, storage.type.scala, entity.name.class.declaration, entity.name.class",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Scala blue",
            scope: "punctuation.definition.template-expression.scala",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Scala aqua",
            scope: "constant.language.scala, punctuation.definition.template-expression.begin.scala, punctuation.definition.template-expression.end.scala, entity.name.import.scala",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Scala orange",
            scope: "keyword.declaration.stable.scala",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Scala purple",
            scope: "entity.other.inherited-class.scala, keyword.other.import.scala",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Elixir{{{
        {
            name: "Elixir aqua",
            scope: "constant.language.elixir, punctuation.section.embedded.elixir",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Elixir blue",
            scope: "constant.other.symbol.elixir, source.elixir.embedded.source, punctuation.definition.variable.elixir",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Elixir purple",
            scope: "variable.other.constant.elixir",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Clojure{{{
        {
            name: "Clojure purple",
            scope: "entity.global.clojure",
            settings: {
                foreground: palette.purple,
            },
        },
        {
            name: "Clojure aqua",
            scope: "constant.language.nil.clojure, constant.keyword.clojure",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Clojure orange",
            scope: "meta.symbol.clojure",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Clojure red",
            scope: "storage.control.clojure",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Clojure blue",
            scope: "entity.global.clojure",
            settings: {
                foreground: palette.blue,
            },
        },
        // }}}
        // Julia{{{
        {
            name: "Julia orange",
            scope: "keyword.other.julia",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Julia aqua",
            scope: "constant.language.julia, constant.other.symbol.julia",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Julia purple",
            scope: "keyword.control.using.julia, support.function.macro.julia",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Elm{{{
        {
            name: "Elm white",
            scope: "keyword.other.period.elm",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "Elm red",
            scope: "keyword.control.import.elm",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Elm orange",
            scope: "keyword.other.elm, keyword.type-alias.elm, keyword.other.colon.elm",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Elm yellow",
            scope: "constant.type-constructor.elm, storage.type.elm",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Elm aqua",
            scope: "entity.name.record.field.accessor.elm",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Elm blue",
            scope: "meta.value.elm, entity.name.record.field.elm, record.name.elm",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Elm purple",
            scope: "support.module.elm",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Erlang{{{
        {
            name: "Erlang grey",
            scope: "punctuation.section.directive.begin.erlang",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "Erlang aqua",
            scope: "constant.other.symbol.unquoted.erlang",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Erlang purple",
            scope: "entity.name.type.class.module.definition.erlang, entity.name.type.class.module.erlang",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // R{{{
        {
            name: "R yellow",
            scope: "storage.type.r",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "R green",
            scope: "variable.function.r",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "R aqua",
            scope: "constant.language.r",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "R purple",
            scope: "keyword.other.r",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // F#{{{
        {
            name: "F# white",
            scope: "keyword.symbol.fsharp",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "F# yellow",
            scope: "keyword.format.specifier.fsharp",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "F# purple",
            scope: "entity.name.section.fsharp",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Groovy{{{
        {
            name: "Groovy white",
            scope: "keyword.operator.navigation.groovy",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "Groovy red",
            scope: "storage.modifier.implements.groovy",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Groovy yellow",
            scope: "storage.type.groovy, storage.type.primitive.groovy, storage.type.object.array.groovy",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Groovy green",
            scope: "meta.method.groovy",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Groovy aqua",
            scope: "constant.language.groovy",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Groovy blue",
            scope: "meta.definition.variable.name.groovy, meta.method-call.groovy, meta.definition.variable.groovy",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Groovy purple",
            scope: "storage.modifier.import.groovy, storage.type.annotation.groovy",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Fortran{{{
        {
            name: "Fortran yellow",
            scope: "storage.type.character.fortran, storage.type.integer.fortran, storage.type.real.fortran, storage.type.complex.fortran",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Fortran orange",
            scope: "keyword.logical.fortran, keyword.control.case.fortran",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Fortran blue",
            scope: "meta.parameter.fortran",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Fortran aqua",
            scope: "entity.name.program.fortran, keyword.other.none.fortran",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Fortran purple",
            scope: "entity.name.program.fortran, keyword.control.default.fortran, keyword.control.result.fortran",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Lisp{{{
        {
            name: "Lisp green",
            scope: "constant.character.lisp",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Lisp aqua",
            scope: "keyword.constant.lisp, punctuation.definition.constant.lisp",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Lisp blue",
            scope: "entity.name.variable.lisp, variable.other.global.lisp, punctuation.definition.variable.lisp",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Lisp yellow",
            scope: "constant.language.lisp",
            settings: {
                foreground: palette.yellow,
            },
        },
        // }}}
        // Shell{{{
        {
            name: "Shell red",
            scope: "support.function.builtin.shell",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Shell orange",
            scope: "string.interpolated.dollar.shell, entity.name.command.shell",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Shell yellow",
            scope: "constant.other.option.shell, constant.other.option.dash.shell",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Shell green",
            scope: "meta.scope.logical-expression.shell",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Shell aqua",
            scope: "entity.name.function.shell, string.unquoted.argument.shell, punctuation.definition.evaluation.parens.begin.shell, punctuation.definition.evaluation.parens.end.shell",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Shell blue",
            scope: "punctuation.definition.variable.shell, meta.argument.shell, punctuation.section.bracket.curly.variable.begin.shell, punctuation.section.bracket.curly.variable.end.shell",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Shell purple",
            scope: "variable.other.special.shell, variable.language.special.shell, variable.parameter.positional.shell, variable.parameter.positional.all.shell, variable.other.positional.shell",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Fish{{{
        {
            name: "Fish red",
            scope: "support.function.unix.fish",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Fish orange",
            scope: "support.function.builtin.fish",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Fish yellow",
            scope: "string.other.option.fish",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Fish aqua",
            scope: "support.function.script.fish",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Fish blue",
            scope: "punctuation.definition.variable.fish",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "Fish purple",
            scope: "variable.other.fixed.fish",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // PowerShell{{{
        {
            name: "PowerShell yellow",
            scope: "storage.type.powershell",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "PowerShell aqua",
            scope: "variable.other.member.powershell",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "PowerShell blue",
            scope: "punctuation.definition.variable.powershell",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "PowerShell purple",
            scope: "keyword.other.hashtable.begin.powershell, constant.language.powershell",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // Diff{{{
        {
            name: "Diff grey",
            scope: "punctuation.definition.separator.diff",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "Diff red",
            scope: "markup.deleted.diff, punctuation.definition.deleted.diff",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Diff yellow",
            scope: "markup.changed.diff, punctuation.definition.changed.diff",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Diff green",
            scope: "meta.diff.header.from-file, markup.inserted.diff, punctuation.definition.inserted.diff",
            settings: {
                foreground: palette.green,
            },
        },
        {
            name: "Diff aqua",
            scope: "meta.diff.range.context, punctuation.definition.range.diff",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Diff purple",
            scope: "punctuation.definition.from-file.diff",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // {{{Git
        {
            name: "Git red",
            scope: "entity.name.section.group-title.ini, punctuation.definition.entity.ini",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "Git orange",
            scope: "punctuation.separator.key-value.ini",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Git aqua",
            scope: "keyword.other.definition.ini",
            settings: {
                foreground: palette.aqua,
            },
        },
        // }}}
        // {{{Makefile
        {
            name: "Make white",
            scope: "punctuation.separator.key-value.makefile",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "Make aqua",
            scope: "meta.scope.prerequisites.makefile",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Make purple",
            scope: "keyword.control.include.makefile",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // {{{CMake
        {
            name: "CMake aqua",
            scope: "entity.source.cmake",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "CMake purple",
            scope: "storage.source.cmake",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // {{{Dockerfile
        {
            name: "Dockerfile orange",
            scope: "entity.name.function.package-manager.dockerfile",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "Dockerfile yellow",
            scope: "keyword.operator.flag.dockerfile",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "Dockerfile aqua",
            scope: "constant.character.escape.dockerfile",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "Dockerfile purple",
            scope: "entity.name.type.base-image.dockerfile, entity.name.image.dockerfile",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // {{{VimL
        {
            name: "VimL grey",
            scope: "punctuation.definition.map.viml",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "VimL yellow",
            scope: "constant.character.map.special.viml",
            settings: {
                foreground: palette.yellow,
            },
        },
        {
            name: "VimL orange",
            scope: "storage.viml, storage.plugin.viml",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "VimL aqua",
            scope: "support.function.viml, constant.character.map.key.viml, constant.character.map.viml",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "VimL purple",
            scope: "storage.type.map.viml",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // {{{Tmux
        {
            name: "Tmux aqua",
            scope: "constant.language.tmux",
            settings: {
                foreground: palette.aqua,
            },
        },
        // }}}
        // JSON{{{
        {
            name: "JSON grey",
            scope: "punctuation.support.type.property-name.begin.json, punctuation.support.type.property-name.end.json, punctuation.separator.dictionary.key-value.json, punctuation.definition.string.begin.json, punctuation.definition.string.end.json, punctuation.separator.dictionary.pair.json, punctuation.separator.array.json",
            settings: {
                foreground: palette.grey1,
            },
        },
        {
            name: "JSON aqua",
            scope: "constant.language.json",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "JSON blue",
            scope: "support.type.property-name.json",
            settings: {
                foreground: palette.blue,
            },
        },
        // }}}
        // YAML{{{
        {
            name: "YAML white",
            scope: "punctuation.separator.key-value.mapping.yaml, string.unquoted.plain.out.yaml",
            settings: {
                foreground: palette.fg,
            },
        },
        {
            name: "YAML red",
            scope: "punctuation.definition.block.sequence.item.yaml",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "YAML orange",
            scope: "punctuation.definition.alias.yaml",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "YAML aqua",
            scope: "constant.other.timestamp.yaml, variable.other.alias.yaml",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "YAML blue",
            scope: "entity.name.tag.yaml",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "YAML purple",
            scope: "punctuation.definition.anchor.yaml",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
        // TOML{{{
        {
            name: "TOML red",
            scope: "entity.other.attribute-name.table.toml, punctuation.definition.table.toml, meta.tag.table.toml",
            settings: {
                foreground: palette.red,
            },
        },
        {
            name: "TOML orange",
            scope: "punctuation.definition.keyValuePair.toml",
            settings: {
                foreground: palette.orange,
            },
        },
        {
            name: "TOML aqua",
            scope: "constant.other.datetime-with-timezone.toml, constant.other.date.toml, constant.other.datetime.toml",
            settings: {
                foreground: palette.aqua,
            },
        },
        {
            name: "TOML blue",
            scope: "keyword.key.toml",
            settings: {
                foreground: palette.blue,
            },
        },
        {
            name: "TOML purple",
            scope: "constant.other.boolean.toml, entity.other.attribute-name.table.array.toml, punctuation.definition.table.array.toml",
            settings: {
                foreground: palette.purple,
            },
        },
        // }}}
    ];
    if (italicComments) {
        // {{{
        syntax.push({
            name: "Comment",
            scope: "comment, string.comment, punctuation.definition.comment",
            settings: {
                foreground: palette.grey1,
                fontStyle: "italic",
            },
        }); // }}}
    }
    else {
        // {{{
        syntax.push({
            name: "Comment",
            scope: "comment, string.comment, punctuation.definition.comment",
            settings: {
                foreground: palette.grey1,
            },
        });
    } // }}}
    return syntax;
}
exports.getColorfulSyntax = getColorfulSyntax;
// vim: fdm=marker fmr={{{,}}}:
//# sourceMappingURL=colorful.js.map