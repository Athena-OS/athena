/**!
 * @name WhoReacted
 * @description Shows the avatars of the users who reacted to a message.
 * @version 1.2.5
 * @author Marmota (Jaime Filho)
 * @authorId 289112759948410881
 * @invite z6Yx9A8VDR
 * @website https://github.com/jaimeadf/BetterDiscordPlugins/tree/release/src/WhoReacted
 * @source https://github.com/jaimeadf/BetterDiscordPlugins/tree/release/src/WhoReacted
 * @updateUrl https://raw.githubusercontent.com/jaimeadf/BetterDiscordPlugins/release/dist/WhoReacted/WhoReacted.plugin.js
 */

/*@cc_on
@if (@_jscript)
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else@*/

const fs = require('fs');
const path = require('path');
const request = require('request');
const electron = require('electron');

const config = {"info":{"name":"WhoReacted","description":"Shows the avatars of the users who reacted to a message.","version":"1.2.5","authors":[{"name":"Marmota (Jaime Filho)","discord_id":"289112759948410881"}],"github":"https://github.com/jaimeadf/BetterDiscordPlugins/tree/release/src/WhoReacted","github_raw":"https://raw.githubusercontent.com/jaimeadf/BetterDiscordPlugins/release/dist/WhoReacted/WhoReacted.plugin.js"},"changelog":[{"title":"New Filter","items":["Add option to show or hide blocked users (Thanks @Visne on GitHub)."]}]};

function buildPlugin() {
    const [Plugin, BoundedLibrary] = global.ZeresPluginLibrary.buildPlugin(config);
    var plugin;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ WhoReacted)
});

;// CONCATENATED MODULE: external ["BdApi","React"]
const external_BdApi_React_namespaceObject = global["BdApi"]["React"];
var external_BdApi_React_default = /*#__PURE__*/__webpack_require__.n(external_BdApi_React_namespaceObject);
;// CONCATENATED MODULE: external "BoundedLibrary"
const external_BoundedLibrary_namespaceObject = BoundedLibrary;
;// CONCATENATED MODULE: external "Plugin"
const external_Plugin_namespaceObject = Plugin;
var external_Plugin_default = /*#__PURE__*/__webpack_require__.n(external_Plugin_namespaceObject);
;// CONCATENATED MODULE: ./src/WhoReacted/components/Reactors.jsx
 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }


const { UserStore, RelationshipStore } = external_BoundedLibrary_namespaceObject.DiscordModules;

const Flux = external_BoundedLibrary_namespaceObject.WebpackModules.getByProps('Store', 'connectStores');
const ReactionStore = external_BoundedLibrary_namespaceObject.WebpackModules.getByProps('getReactions', '_changeCallbacks');
const VoiceUserSummaryItem = external_BoundedLibrary_namespaceObject.WebpackModules.find(m => _optionalChain([m, 'optionalAccess', _ => _.default, 'optionalAccess', _2 => _2.displayName]) === 'VoiceUserSummaryItem').default;

function Reactors({ users, currentUser, showSelf, showBots, showBlocked, max, size, count }) {
    const filteredUsers = (0,external_BdApi_React_namespaceObject.useMemo)(() => {
        return users.filter(
            user =>
                (showSelf || user.id !== currentUser.id) &&
                (showBots || !user.bot) &&
                (showBlocked || !RelationshipStore.isBlocked(user.id))
        );
    }, [users, currentUser, showSelf, showBots, showBlocked]);

    function renderMoreUsers(text, className) {
        return (
            external_BdApi_React_default().createElement('div', { className: `${className} more-reactors`,}, "+"
                , 1 + count - max - (users.length - filteredUsers.length)
            )
        );
    }

    return (
        external_BdApi_React_default().createElement(VoiceUserSummaryItem, {
            className: `reactors reactors-size-${size}px`,
            max: max,
            users: filteredUsers,
            renderMoreUsers: renderMoreUsers,}
        )
    );
}

/* harmony default export */ const components_Reactors = (Flux.connectStores([UserStore, ReactionStore], ({ message, emoji }) => ({
    currentUser: UserStore.getCurrentUser(),
    users: Object.values(_nullishCoalesce(ReactionStore.getReactions(message.getChannelId(), message.id, emoji), () => ( {})))
}))(Reactors));

;// CONCATENATED MODULE: ./src/WhoReacted/style.scss
/* harmony default export */ const style = (".reactors:not(:empty){margin-left:6px}.reactors .more-reactors{background-color:var(--background-tertiary);color:var(--text-normal);font-weight:500}.reactors-size-8px .avatarSize-EXG1Is{width:8px !important;height:8px !important}.reactors-size-8px .more-reactors{height:8px;padding-right:3.2px;padding-left:2.4px;font-size:4.8px;line-height:8px;border-radius:4px}.reactors-size-12px .avatarSize-EXG1Is{width:12px !important;height:12px !important}.reactors-size-12px .more-reactors{height:12px;padding-right:4.8px;padding-left:3.6px;font-size:7.2px;line-height:12px;border-radius:6px}.reactors-size-16px .avatarSize-EXG1Is{width:16px !important;height:16px !important}.reactors-size-16px .more-reactors{height:16px;padding-right:6.4px;padding-left:4.8px;font-size:9.6px;line-height:16px;border-radius:8px}.reactors-size-24px .avatarSize-EXG1Is{width:24px !important;height:24px !important}.reactors-size-24px .more-reactors{height:24px;padding-right:9.6px;padding-left:7.2px;font-size:14.4px;line-height:24px;border-radius:12px}.reactors-size-32px .avatarSize-EXG1Is{width:32px !important;height:32px !important}.reactors-size-32px .more-reactors{height:32px;padding-right:12.8px;padding-left:9.6px;font-size:19.2px;line-height:32px;border-radius:16px}\n");
;// CONCATENATED MODULE: ./src/WhoReacted/index.jsx
 function WhoReacted_optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }







const Reactions = external_BoundedLibrary_namespaceObject.WebpackModules.find(m => WhoReacted_optionalChain([m, 'optionalAccess', _ => _.default, 'optionalAccess', _2 => _2.displayName]) === 'Reactions').default;
const { SettingPanel, SettingGroup, Textbox, Slider, Switch } = external_BoundedLibrary_namespaceObject.Settings;

class WhoReacted extends (external_Plugin_default()) {
    constructor() {
        super();

        this.defaultSettings = {
            maxUsersShown: 6,
            avatarSize: 20,
            reactionThreshold: 10,
            userThreshold: 100,
            useHighestUserCount: true,
            showSelf: true,
            showBots: true,
            showBlocked: true
        };
    }

    async onStart() {
        external_BoundedLibrary_namespaceObject.PluginUtilities.addStyle(this.getName(), style);
        await this.patchReaction();
    }

    onStop() {
        external_BoundedLibrary_namespaceObject.PluginUtilities.removeStyle(this.getName());
        external_BoundedLibrary_namespaceObject.Patcher.unpatchAll();
    }

    buildSettingsPanel() {
        return new SettingPanel(
            () => {
                this.saveSettings();
                this.forceUpdateAllReactions();
            },
            this.buildDisplaySettingsGroup(),
            this.buildThresholdSettingsGroup(),
            this.buildFilterSettingsGroup()
        );
    }

    buildDisplaySettingsGroup() {
        return new SettingGroup('Display settings')
            .append(
                new Textbox(
                    'Max users shown',
                    'The maximum number of users shown for each reaction emoji.',
                    this.settings.maxUsersShown,
                    value => {
                        if (isNaN(value) || value < 1 || value > 99) {
                            return external_BoundedLibrary_namespaceObject.Toasts.error('Value must be a number between 1 and 99!');
                        }

                        this.settings.maxUsersShown = parseInt(value);
                    }
                )
            )
            .append(
                new Slider(
                    'Avatar size',
                    'Sets the size of the user avatars.',
                    8,
                    32,
                    this.settings.avatarSize,
                    value => (this.settings.avatarSize = value),
                    {
                        defaultValue: this.defaultSettings.avatarSize,
                        markers: [8, 12, 16, 20, 24, 32],
                        stickToMarkers: true,
                        units: 'px'
                    }
                )
            );
    }

    buildThresholdSettingsGroup() {
        function renderMarker(value) {
            if (value === 0) {
                return 'Off';
            }

            if (value >= 1000) {
                return `${value / 1000}k`;
            }

            return value;
        }

        return new SettingGroup('Thresholds')
            .append(
                new Slider(
                    'Reaction threshold',
                    'Hides the reactors when the number of separate reactions is exceeded on a message.',
                    0,
                    20,
                    this.settings.reactionThreshold,
                    value => (this.settings.reactionThreshold = value),
                    {
                        defaultValue: this.defaultSettings.reactionThreshold,
                        markers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                        stickToMarkers: true,
                        renderMarker
                    }
                )
            )
            .append(
                new Slider(
                    'User threshold',
                    'Hides the reactors when their count is exceeded on a message.',
                    0,
                    10000,
                    this.settings.userThreshold,
                    value => (this.settings.userThreshold = value),
                    {
                        defaultValue: this.defaultSettings.userThreshold,
                        markers: [0, 10, 20, 50, 100, 500, 1000, 2000, 3000, 4000, 5000, 10000],
                        stickToMarkers: true,
                        equidistant: true,
                        renderMarker
                    }
                )
            )
            .append(
                new Switch(
                    'Use highest user count',
                    'Uses the reaction with most reactors of a message for user threshold.',
                    this.settings.useHighestUserCount,
                    value => (this.settings.useHighestUserCount = value)
                )
            );
    }

    buildFilterSettingsGroup() {
        return new SettingGroup('Filters')
            .append(
                new Switch(
                    'Show self',
                    'Shows yourself within the reactors.',
                    this.settings.showSelf,
                    value => (this.settings.showSelf = value)
                )
            )
            .append(
                new Switch(
                    'Show bots',
                    'Shows bots within the reactors.',
                    this.settings.showBots,
                    value => (this.settings.showBots = value)
                )
            )
            .append(
                new Switch(
                    'Show blocked users',
                    'Shows blocked users within the reactors.',
                    this.settings.showBlocked,
                    value => (this.settings.showBlocked = value)
                )
            );
    }

    getSettingsPanel() {
        return this.buildSettingsPanel().getElement();
    }

    async patchReaction() {
        const Reaction = await this.findReaction();

        external_BoundedLibrary_namespaceObject.Patcher.after(Reaction.prototype, 'render', (thisObject, args, returnValue) => {
            const { message, emoji, count } = thisObject.props;
            if (!this.canShowReactors(message)) return;

            const renderTooltip = returnValue.props.children;
            returnValue.props.children = props => {
                const tooltip = renderTooltip(props);
                const popout = tooltip.props.children.props.children;

                const renderReactionInner = popout.props.children;
                popout.props.children = props => {
                    const reactionInner = renderReactionInner(props);

                    reactionInner.props.children.push(
                        external_BdApi_React_default().createElement(components_Reactors, {
                            message: message,
                            emoji: emoji,
                            count: count,
                            max: this.settings.maxUsersShown,
                            showSelf: this.settings.showSelf,
                            showBots: this.settings.showBots,
                            showBlocked: this.settings.showBlocked,
                            size: this.settings.avatarSize,}
                        )
                    );

                    return reactionInner;
                };

                return tooltip;
            };
        });

        this.forceUpdateAllReactions();
    }

    canShowReactors({ reactions }) {
        const { reactionThreshold, userThreshold, useHighestUserCount } = this.settings;

        if (reactionThreshold !== 0 && reactions.length > reactionThreshold) {
            return false;
        }

        if (userThreshold !== 0) {
            const userCount = useHighestUserCount
                ? Math.max(...reactions.map(reaction => reaction.count))
                : reactions.reduce((total, reaction) => total + reaction.count, 0);

            if (userCount > userThreshold) {
                return false;
            }
        }

        return true;
    }

    findReaction() {
        return new Promise(resolve => {
            const node = document.querySelector(external_BoundedLibrary_namespaceObject.DiscordSelectors.Reactions.reaction);
            if (node) {
                return resolve(this.findReactionReactInstance(node).type);
            }

            const unpatch = external_BoundedLibrary_namespaceObject.Patcher.after(Reactions.prototype, 'render', (thisObject, args, returnValue) => {
                if (!returnValue) return;

                const reaction = returnValue.props.children[0][0];
                if (reaction) {
                    unpatch();
                    resolve(reaction.type);
                }
            });
        });
    }

    forceUpdateAllReactions() {
        for (const node of document.querySelectorAll(external_BoundedLibrary_namespaceObject.DiscordSelectors.Reactions.reaction)) {
            this.findReactionReactInstance(node).stateNode.forceUpdate();
        }
    }

    findReactionReactInstance(node) {
        return external_BoundedLibrary_namespaceObject.Utilities.findInTree(external_BoundedLibrary_namespaceObject.ReactTools.getReactInstance(node), r => WhoReacted_optionalChain([r, 'optionalAccess', _3 => _3.type, 'optionalAccess', _4 => _4.displayName]) === 'Reaction', {
            walkable: ['return']
        });
    }
}

plugin = __webpack_exports__["default"];
/******/ })()
;

    return plugin;
}

module.exports = global.ZeresPluginLibrary
    ? buildPlugin()
    : class {
          constructor() {
              this._config = config;
          }

          getName() {
              return config.info.name;
          }

          getAuthor() {
              return config.info.authors.map(a => a.name).join(', ');
          }

          getDescription() {
              return config.info.description;
          }

          getVersion() {
              return config.info.version;
          }

          load() {
              global.BdApi.showConfirmationModal(
                  'Library plugin is needed',
                  `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
                  {
                      confirmText: 'Download',
                      cancelText: 'Cancel',
                      onConfirm() {
                          request.get(
                              'https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js',
                              (error, response, body) => {
                                  if (error) {
                                      return electron.shell.openExternal(
                                          'https://betterdiscord.app/Download?id=9'
                                      );
                                  }

                                  fs.writeFileSync(
                                      path.join(global.BdApi.Plugins.folder, '0PluginLibrary.plugin.js'),
                                      body
                                  );
                              }
                          );
                      }
                  }
              );
          }

          start() {}

          stop() {}
      };

/*@end@*/
