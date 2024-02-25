

// import node-cryptojs-aes modules to encrypt or decrypt data
var node_cryptojs = require('node-cryptojs-aes');

// node-cryptojs-aes main object;
var CryptoJS = node_cryptojs.CryptoJS;

var sk;
var sep = ':';
var bs = '\\';
var split = /.{0}/g;
var rex = new RegExp(sep, 'g');
var nrex = new RegExp( sep + '(?!'+bs+bs+')', 'g');

foxyProxy.getCredentials = function( proxy ) {
    console.log("getting credentials from: " + proxy);
    
    try {
        var decrypted = CryptoJS.AES.decrypt(proxy.data.credentials, sk).toString(CryptoJS.enc.Utf8).split(split).reverse().join('').split(nrex);
        return {
            "username": decrypted[1].replace(rex,sep).split(split).reverse().join(''),
            "password": decrypted[0].replace(rex,sep).split(split).reverse().join('')
        };
    } catch (exc) {
        console.log("failed to get credentials: " +exc);
        return {
            "username":"",
            "password":""
        };
    }
};

foxyProxy.setCredentials = function( proxy, u, p) {
    proxy.data.credentials = CryptoJS.AES.encrypt(u.replace(rex,bs+sep)+sep+p.replace(rex,bs+sep), sk).toString();
};

//init
(function() {
    foxyProxy.getSettings(function( response) {
        console.log("initializing sk");
        if (response.settings) {
            if (response.settings.sk) {
                sk = response.settings.sk;
            } else if (response.settings.sczd) {
                sk = CryptoJS.MD5(response.settings.sczd).toString();
            } else {
                sk = CryptoJS.MD5(Date.now().toString()).toString();
            }
        } else {
            console.log("init stored-credentials: failed to get settings");
            sk = foxyProxy._settings.sk;
        }
        
        foxyProxy._settings.sk = sk;
        foxyProxy.updateSettings({ "settings": foxyProxy._settings });
    });
})();