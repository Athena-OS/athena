// A giant object. Basically change mode to change between which parts of the object is used.
// See http://code.google.com/chrome/extensions/proxy.html and  http://code.google.com/chrome/extensions/types.html#ChromeSetting
var ProxyConfig = {
	/* mode: 
	 * direct
		* In direct mode all connections are created directly, without any proxy involved. This mode allows no further parameters in the ProxyConfig object.
	 * auto_detect
		* In auto_detect mode the proxy configuration is determined by a PAC script that can be downloaded at http://wpad/wpad.dat. This mode allows no further parameters in the ProxyConfig object.
	 * pac_script
		* In pac_script mode the proxy configuration is determined by a PAC script that is either retrieved from the URL specified in the PacScript object or taken literally from the data element specified in the PacScript object. Besides this, this mode allows no further parameters in the ProxyConfig object.
	 * fixed_servers
		* In fixed_servers mode the proxy configuration is codified in a ProxyRules object. Its structure is described in Proxy rules. Besides this, the fixed_servers mode allows no further parameters in the ProxyConfig object.
	 * system
		* In system mode the proxy configuration is taken from the operating system. This mode allows no further parameters in the ProxyConfig object. Note that the system mode is different from setting no proxy configuration. In the latter case, Chrome falls back to the system settings only if no command-line options influence the proxy configuration. 
	*/
	// Default: System. Future: Grab existing.
	mode: "system",
	// Mode: pac_script (optional) 
	pacScript: { 
    mandatory : true /* If true, an invalid PAC script will prevent the network stack from falling back to direct connections. Defaults to false. */
		//url: ( 
			//optional string 
		//)
		//data: "function FindProxyForURL(url, host) {\n" +
		//	"  if (host == 'foobar.com')\n" +
		//	"    return 'PROXY blackhole:80';\n" +
		//	"  return 'DIRECT';\n" +
		//	"}" // As tempting it might be, there's no missing ; here
	},
	// Mode: fixed_servers (optional)
	rules : {
		/* An object encapsulating the set of proxy rules for all protocols. Use either 'singleProxy' or (a subset of) 'proxyForHttp', 'proxyForHttps', 'proxyForFtp' and 'fallbackProxy'.
		 * singleProxy ( optional ProxyServer ) -- http://code.google.com/chrome/extensions/proxy.html#type-ProxyServer
			The proxy server to be used for all per-URL requests (that is http, https, and ftp).
		 * proxyForHttp ( optional ProxyServer ) -- http://code.google.com/chrome/extensions/proxy.html#type-ProxyServer
			The proxy server to be used for HTTP requests.
		 * proxyForHttps ( optional ProxyServer ) -- http://code.google.com/chrome/extensions/proxy.html#type-ProxyServer
			The proxy server to be used for HTTPS requests.
		 * proxyForFtp ( optional ProxyServer ) -- http://code.google.com/chrome/extensions/proxy.html#type-ProxyServer
			The proxy server to be used for FTP requests.
		 * fallbackProxy ( optional ProxyServer ) -- http://code.google.com/chrome/extensions/proxy.html#type-ProxyServer
			The proxy server to be used for everthing else or if any of the specific proxyFor... is not specified.
		 * bypassList ( optional array of string )
			List of servers to connect to without a proxy server.
		 */
		singleProxy : {
			/* singleProxy
			 * scheme ( optional enumerated string ["http", "https", "socks4", "socks5"] ) 
				The scheme (protocol) of the proxy server itself. Defaults to 'http'.
			 * host ( string ) 
				The URI of the proxy server. This must be an ASCII hostname (in Punycode format). IDNA is not supported, yet.
			 * port ( optional integer ) 
				The port of the proxy server. Defaults to a port that depends on the scheme.
			 */
			 host : "",
			 scheme : "http"
		},

    // N.B.: "If no fallbackProxy is specified, traffic is sent directly without a proxy server."
    // as stated at http://code.google.com/chrome/extensions/proxy.html#overview-examples. In order
    // to prevent leaks of non-HTTP(S)/FTP protocols, we *must always set something here*, even if it's just
    // a black hole. By default, just set this to the same as |singleProxy| at runtime.
/*    fallbackProxy : {
      scheme : null,
      host : null,
      port : null
    }*/
	}
};

// chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
	/* details ( object ) */
		/* value ( any ) */ 
			/* The value of the setting.
			 * Note that every setting has a specific value type, which is described together with the setting. An extension should not set a value of a different type. */
		/* scope ( optional enumerated string ["regular", "incognito_persistent", "incognito_session_only"] ) */
			/* Where to set the setting (default: regular). One of
			 * regular: 				setting for regular profile (which is inherited by the incognito profile if not overridden elsewhere),
			 * incognito_persistent: 	setting for incognito profile that survives browser restarts (overrides regular preferences),
			 * incognito_session_only: 	setting for incognito profile that can only be set during an incognito session and is deleted when the incognito session ends (overrides regular and incognito_persistent preferences). */
    /* function() {} is the callback function */
