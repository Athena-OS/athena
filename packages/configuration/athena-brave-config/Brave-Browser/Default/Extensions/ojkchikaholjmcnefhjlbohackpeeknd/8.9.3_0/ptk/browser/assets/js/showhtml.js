/* Author: Denis Podgurskii */
import { ptk_decoder } from "../../../background/decoder.js"
const decoder = new ptk_decoder()


jQuery(function () {
 
    let params = new URLSearchParams(window.location.search)
    if (params.has('s')) {
        let content = decoder.base64url_decode(params.get('s'))
        //document.write(decodeURI(content))
        //$("#htmlDiv").html(content)

        //$('#showhtmlFrame').prop('src', 'https://demo.testfire.net')
        
        // var ifrm = document.getElementById('showhtmlFrame');
        // ifrm = ifrm.contentWindow || ifrm.contentDocument.document || ifrm.contentDocument;
        // ifrm.document.domain = "demo.testfire.net"
       // $('#showhtmlFrame').prop('srcdoc', content)

        // let dataBase64 = 'data:text/html;base64,' + params.get('s')
         $('#showhtmlFrame').prop('srcdoc', decodeURI(content))

        // var ifrm = document.getElementById('showhtmlFrame');
        // ifrm = ifrm.contentWindow || ifrm.contentDocument.document || ifrm.contentDocument;
        // ifrm.document.open();
        // ifrm.document.write('Hello World!');
        // ifrm.document.close();
        //document.getElementById('showhtmlFrame').srcdoc = decoder.base64_decode(params.get('s'));
    } 


})