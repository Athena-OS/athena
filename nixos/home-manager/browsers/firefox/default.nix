{ pkgs, home-manager, username, ... }:
{

  home-manager.users.${username} = { pkgs, ...}: {
    programs.firefox = {
      enable = true;
      # package = pkgs.firefox.override {cfg.enableTridactylNative = true;};
      package = pkgs.firefox;
      
      profiles = {
        "${username}" = {
          id = 0;
          name = "${username}";
          bookmarks = import ../bookmarks.nix;
          search = {
            force = true;
            default = "DuckDuckGo";
            engines = {
              "Nix Packages" = {
                  urls = [{
                      template = "https://search.nixos.org/packages";
                      params = [
                          { name = "type"; value = "packages"; }
                          { name = "query"; value = "{searchTerms}"; }
                      ];
                  }];
                  icon = "${pkgs.nixos-icons}/share/icons/hicolor/scalable/apps/nix-snowflake.svg";
                  definedAliases = [ "@np" ];
              };
              "NixOS Wiki" = {
                  urls = [{ template = "https://nixos.wiki/index.php?search={searchTerms}"; }];
                  iconUpdateURL = "https://nixos.wiki/favicon.png";
                  updateInterval = 24 * 60 * 60 * 1000;
                  definedAliases = [ "@nw" ];
              };
              "Wikipedia (en)".metaData.alias = "@wiki";
              "Google".metaData.hidden = true;
              "Amazon.com".metaData.hidden = true;
              "Bing".metaData.hidden = true;
              "eBay".metaData.hidden = true;
            };
          };
          settings = {
            "browser.startup.homepage" = "https://start.duckduckgo.com";
            "browser.places.importBookmarksHTML" = true;
            "general.smoothScroll" = true;
            # Re-bind ctrl to super (would interfere with tridactyl otherwise)
            #"ui.key.accelKey" = 91; # Commented otherwise cannot use shortcuts using CTRL
            # Hide the "sharing indicator", it's especially annoying
            # with tiling WMs on wayland
            "privacy.webrtc.legacyGlobalIndicator" = false;
            # Actual settings
            "app.shield.optoutstudies.enabled" = false;
            "app.update.auto" = true;
            "browser.bookmarks.restore_default_bookmarks" = false;
            "browser.contentblocking.category" = "strict";
            "browser.ctrlTab.recentlyUsedOrder" = false;
            "browser.discovery.enabled" = false;
            "browser.laterrun.enabled" = false;
            "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons" =
              false;
            "browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features" =
              false;
            "browser.newtabpage.activity-stream.feeds.snippets" = false;
            "browser.newtabpage.activity-stream.improvesearch.topSiteSearchShortcuts.havePinned" = "";
            "browser.newtabpage.activity-stream.improvesearch.topSiteSearchShortcuts.searchEngines" = "";
            "browser.newtabpage.activity-stream.section.highlights.includePocket" =
              false;
            "browser.newtabpage.activity-stream.showSponsored" = false;
            "browser.newtabpage.activity-stream.showSponsoredTopSites" = false;
            "browser.newtabpage.pinned" = false;
            "browser.protections_panel.infoMessage.seen" = true;
            "browser.quitShortcut.disabled" = true;
            "browser.shell.checkDefaultBrowser" = false;
            "browser.ssb.enabled" = true;
            "browser.toolbars.bookmarks.visibility" = "always";
            #"browser.urlbar.placeholderName" = "DuckDuckGo";
            "browser.urlbar.suggest.openpage" = false;
            "datareporting.policy.dataSubmissionEnable" = false;
            "datareporting.policy.dataSubmissionPolicyAcceptedVersion" = 2;
            "dom.security.https_only_mode" = true;
            "dom.security.https_only_mode_ever_enabled" = true;
            "extensions.getAddons.showPane" = false;
            "extensions.htmlaboutaddons.recommendations.enabled" = false;
            "extensions.pocket.enabled" = false;
            "identity.fxaccounts.enabled" = false;
            "privacy.trackingprotection.enabled" = true;
            "privacy.trackingprotection.socialtracking.enabled" = true;
          };
          extraConfig = ''
            user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
            user_pref("full-screen-api.ignore-widgets", true);
            user_pref("media.ffmpeg.vaapi.enabled", true);
            user_pref("media.rdd-vpx.enabled", true);
            user_pref("browser.uiCustomization.state", "{\"placements\":{\"widget-overflow-fixed-list\":[],\"unified-extensions-area\":[],\"nav-bar\":[\"back-button\",\"forward-button\",\"stop-reload-button\",\"home-button\",\"customizableui-special-spring1\",\"urlbar-container\",\"customizableui-special-spring2\",\"save-to-pocket-button\",\"downloads-button\",\"fxa-toolbar-menu-button\",
            \"_f1423c11-a4e2-4709-a0f8-6d6a68c83d08_-browser-action\",
            \"foxyproxy_eric_h_jung-browser-action\",
            \"wappalyzer_crunchlabz_com-browser-action\",
            \"_1ab3d165-d664-4bf2-adb7-fed77f46116f_-browser-action\",
            \"_60f82f00-9ad5-4de5-b31c-b16a47c51558_-browser-action\",
            \"wayback_machine_mozilla_org-browser-action\",
            \"_74145f27-f039-47ce-a470-a662b129930a_-browser-action\",
            \"7esoorv3@alefvanoon.anonaddy.me-browser-action\",
            \"_b86e4813-687a-43e6-ab65-0bde4ab75758_-browser-action\",
            \"_aecec67f-0d10-4fa7-b7c7-609a2db280cf_-browser-action\",
            \"jid1-mnnxcxisbpnsxq_jetpack-browser-action\",
            \"ublock0_raymondhill_net-browser-action\",
            \"unified-extensions-button\"]}}");
          '';
        };
      };
      # Here the list of all Firefox policies: https://mozilla.github.io/policy-templates/
      policies = {
        DisableTelemetry = true;
        DisableFirefoxStudies = true;
        EnableTrackingProtection = {
          Value= true;
          Locked = true;
          Cryptomining = true;
          Fingerprinting = true;
        };
        CaptivePortal = false;
        #NoDefaultBookmarks = false; # This policy must be removed or set to false, otherwise bookmarks cannot be added or removed by Nix
        OfferToSaveLogins = false;
        OfferToSaveLoginsDefault = false;
        PasswordManagerEnabled = false;
        FirefoxHome = {
            Search = true;
            Pocket = false;
            Snippets = false;
            TopSites = false;
            Highlights = false;
        };
        UserMessaging = {
            ExtensionRecommendations = false;
            SkipOnboarding = true;
        };
        DisablePocket = true;
        DisableFirefoxAccounts = true;
        DisableAccounts = true;
        DisableFirefoxScreenshots = true;
        OverrideFirstRunPage = "";
        OverridePostUpdatePage = "";
        DontCheckDefaultBrowser = true;
        DisplayBookmarksToolbar = "always"; # alternatives: "never" or "newtab"
        DisplayMenuBar = "default-off"; # alternatives: "always", "never" or "default-on"
        SearchBar = "unified"; # alternative: "separate"
        ExtensionSettings = {
          "*".installation_mode = "blocked";
          # uBlock Origin:
          "uBlock0@raymondhill.net" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/ublock-origin/latest.xpi";
            installation_mode = "force_installed";
          };
          # Cookie Quick Manager
          "{60f82f00-9ad5-4de5-b31c-b16a47c51558}" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/cookie-quick-manager/latest.xpi";
            installation_mode = "force_installed";
          };
          # ClearURLs
          "{74145f27-f039-47ce-a470-a662b129930a}" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/clearurls/latest.xpi";
            installation_mode = "force_installed";
          };
          # FoxyProxy
          "foxyproxy@eric.h.jung" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/foxyproxy-standard/latest.xpi";
            installation_mode = "force_installed";
          };
          # Hack-Tools
          "{f1423c11-a4e2-4709-a0f8-6d6a68c83d08}" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/hacktools/latest.xpi";
            installation_mode = "force_installed";
          };
          # HacKontext
          "{ed26d465-baef-4e1a-b242-6681b024b941}" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/hackontext/latest.xpi";
            installation_mode = "force_installed";
          };
          # Lib redirect
          "7esoorv3@alefvanoon.anonaddy.me" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/libredirect/latest.xpi";
            installation_mode = "force_installed";
          };
          # LocalCDN
          "{b86e4813-687a-43e6-ab65-0bde4ab75758}" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/localcdn-fork-of-decentraleyes/latest.xpi";
            installation_mode = "force_installed";
          };
          # NightTab
          #"{47bf427e-c83d-457d-9b3d-3db4118574bd}" = {
          #  install_url = "https://addons.mozilla.org/firefox/downloads/latest/nighttab/latest.xpi";
          #  installation_mode = "force_installed";
          #};
          # OWASP Penetration Testing Kit
          "{1ab3d165-d664-4bf2-adb7-fed77f46116f}" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/penetration-testing-kit/latest.xpi";
            installation_mode = "force_installed";
          };
          # Privacy Badger
          "jid1-MnnxcxisBPnSXQ@jetpack" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/privacy-badger17/latest.xpi";
            installation_mode = "force_installed";
          };
          # TOS; Didn't read
          "jid0-3GUEt1r69sQNSrca5p8kx9Ezc3U@jetpack" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/terms-of-service-didnt-read/latest.xpi";
            installation_mode = "force_installed";
          };
          # UA Switcher and Manager
          "{a6c4a591-f1b2-4f03-b3ff-767e5bedf4e7}" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/user-agent-string-switcher/latest.xpi";
            installation_mode = "force_installed";
          };
          # Violentmonkey
          "{aecec67f-0d10-4fa7-b7c7-609a2db280cf}" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/violentmonkey/latest.xpi";
            installation_mode = "force_installed";
          };
          # Wappalyzer
          "wappalyzer@crunchlabz.com" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/latest/wappalyzer/latest.xpi";
            installation_mode = "force_installed";
          };
          # Wayback machine
          "wayback_machine@mozilla.org" = {
            install_url = "https://addons.mozilla.org/firefox/downloads/file/4047136/latest.xpi";
            installation_mode = "force_installed";
          };
        };
      };
    };
  };
}