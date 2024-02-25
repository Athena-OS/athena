window.FPUtil = {
    extend: function( target, src ) {
        for (var p in src) {
            if (src.hasOwnProperty(p)) {
                target[p] = src[p];
            }
        }
    }
};