; (function () {

    function checkSources(val) {
        console.log('check sources ' + val)
        let _val = val

        if(typeof(val) == 'object')
            _val = val.toString()

        let location = document.location.toString().replace('#', '/')
        let params = new URLSearchParams(location)
        
        for (var key of params.keys()) {
            let p = params.get(key)
            if (p!= '' & _val.includes(p))
                return 'query'
        }


        let hash = document.location.hash.toString().replace('#', '')
        if (hash != '' && _val.includes(hash)) {
            return 'hash'
        }

        return null
    }


    var originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML")
    Object.defineProperty(Element.prototype, "innerHTML", {
        set: function (html) {
            let source = checkSources(html)
            if (source) {
                console.log('source: ' + source )
                console.log("Assigning DANGER html", html)
                console.log(new Error().stack)
                window.postMessage({ "ptk_iast": { "sink": "innerHTML", "source": source, "stack": new Error().stack } })
            }
            return originalInnerHTMLDescriptor.set.apply(this, arguments)
        }
    })

    var originalEval = window.eval
    window.eval = function (content) {
        console.log('source: ' + source )
        console.log("Eval", arguments)
        console.log(new Error().stack)
        return originalEval.apply(this, arguments);
    };


    var originalWrite = document.write;
    document.write = function (content) {
        let source = checkSources(content)
        if (source) {
            console.log('source: ' + source )
            console.log("document.write", arguments)
            console.log(new Error().stack)
            window.postMessage({ "ptk_iast": { "sink": "document.write", "source": source, "stack": new Error().stack } })
        }
        return originalWrite.apply(this, arguments);
    };

})();