; (function () {

    function checkSources(val) {
        console.log('check sources' + val)
        let params = new URLSearchParams(document.location.search)
        for (var key of params.keys()) {
            let p = params.get(key)

            if (val.includes(p))
                return 'query'
        }
        if (val.includes(document.location.hash)) {
            return 'hash'
        }

        return null
    }

    var originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML")
    Object.defineProperty(Element.prototype, "innerHTML", {
        set: function (html) {
            let source = checkSources(content)
            if (source) {
                console.log("Assigning DANGER html", html)
                console.log(new Error().stack)
                window.postMessage({ "ptk_iast": { "sink": "innerHTML", "source": source, "stack": new Error().stack } })
            }
            return originalInnerHTMLDescriptor.set.apply(this, arguments)
        }
    })

    var originalEval = window.eval
    window.eval = function (content) {
        console.log("Eval", arguments)
        console.log(new Error().stack)
        return originalEval.apply(this, arguments);
    };


    var originalWrite = document.write;
    document.write = function (content) {
        let source = checkSources(content)
        if (source) {
            console.log("document.write", arguments)
            console.log(new Error().stack)
            window.postMessage({ "ptk_iast": { "sink": "document.write", "source": source, "stack": new Error().stack } })
        }
        return originalWrite.apply(this, arguments);
    };

})();