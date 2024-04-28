/*
    Copyright (C) 2019 Kai Uwe Broulik <kde@privat.broulik.de>

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License as
    published by the Free Software Foundation; either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const badgeIcons = {
    "Event": "📅", // "Calendar" Emoji

    "LocalBusiness": "💼", // "Briefcase" Emoji
    "AutomotiveBusiness": "🚗", // "Automobile" Emoji
    "EntertainmentBusiness": "🎭", // "Performing Arts" Emoji (TODO should we have dedicated ones for movie theater etc?)
    "FoodEstablishment": "🍽", // "Fork and Knive With Plate" Emoji
    "LodgingBusiness": "🏨", // "Hotel" Emoji, looks more like a hospital to me
    "Store": "🛒", // "Shopping trolley" Emoji

    "BusReservation": "🚌", // "Bus" emoji
    "FlightReservation": "✈️", // "Airplane" emoji
    "TrainReservation": "🚆", // "Train" emoji

    "Product": "📦", // "Package" emoji
};

const genericTypes = {
    "Event": [
        new RegExp(".*Event$"),
        "CourseInstance",
        "EventSeries",
        "Festival"
    ],
    "LocalBusiness": [
        "HomeAndConstructionBusiness"
    ],
        "AutomotiveBusiness": [
            "AutoDealer",
            "AutoRepair"
        ],
        "EntertainmentBusiness": [
            "MovieTheater",
        ],
        "FoodEstablishment": [
            "Bakery",
            "BarOrPub",
            "Brewery",
            "CafeOrCoffeeShop",
            "Distillery",
            "FastFoodRestaurant",
            "IceCreamShop",
            "Restaurant",
            "Winery"
        ],
        "LodgingBusiness": [
            "BedAndBreakfast",
            "Campground",
            "Hostel",
            "Hotel",
            "Motel",
            "Resort"
        ],
        "Store": [
            "ComputerStore",
            "ElectronicsStore",
            "HobbyShop"
        ]
};

function generalizeType(type) {
    for (const genericType in genericTypes) {
        const candidates = genericTypes[genericType];

        for (const candidate of candidates) {
            if (typeof candidate === "string" && type === candidate) {
                return genericType;
            }

            if (candidate instanceof RegExp && type.match(candidate)) {
                return genericType;
            }
        }
    }

    return type;
}

// Both caches are nuked when tab gets closed or navigated away
let itineraryQuickExtractorCache = {};
let itineraryDataCache = {};

let itineraryEnabled = undefined;

SettingsUtils.onChanged().addListener((delta) => {
    // Check again next time
    if (delta.itinerary) {
        itineraryEnabled = undefined;
    }
});

// This is a basic check for whether there is anything worth extracting
// the actual recursive extraction of structured data happens in the content
// script on demand once the browser action is actually opened
function checkForStructuredData() {
    // Check whether itinerary is enabled and loaded and supported
    // Only do so once until settings are changed, to avoid continuous getSubsystemStatus queries
    new Promise((resolve, reject) => {
        if (itineraryEnabled !== undefined) {
            return resolve(itineraryEnabled);
        }

        sendPortMessageWithReply("settings", "getSubsystemStatus").then((status) => {
            const itinerary = status.itinerary;
            resolve(itinerary && itinerary.loaded && itinerary.extractorFound);
        });
    }).then((enabled) => {
        itineraryEnabled = enabled;

        if (!enabled) {
            return;
        }

        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, (tabs) => {
            if (chrome.runtime.lastError) {
                return;
            }

            const tab = tabs[0];
            if (!tab) {
                return;
            }

            // We set the browser action specifically on the tab, so if we checked a tab once
            // we don't need to do it again. However, if the tab navigated to a different page,
            // we invalidated the cache and will check again.
            if (itineraryQuickExtractorCache[tab.id]) {
                return;
            }

            chrome.tabs.executeScript(tab.id, {
                frameId: 0, // main frame
                file: "extension-itinerary-quick-extractor.js"
            }, (result) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    console.warn("Failed to run itinerary quick extractor", error.message);
                    return;
                }

                result = result[0] || {};
                itineraryQuickExtractorCache[tab.id] = result;

                const types = Object.keys(result);

                // Generalize types and add specific occurrences to the general type
                types.forEach((type) => {
                    const genericType = generalizeType(type);

                    if (genericType !== type) {
                        result[genericType] = (result[genericType] || 0) + result[type];
                        delete result[type];
                    }
                });

                if (types.length > 0) {
                    console.log(`Itinerary: Found the following types on tab ${tab.id}: ${types.join(", ")}`);
                } else {
                    console.log("Itinerary: Nothing found");
                }

                let possibleIcon = "";
                // Should we have a priority order here?
                for (const type of SUPPORTED_ITINERARY_TYPES) {
                    const count = result[type];
                    if (!count) {
                        continue;
                    }

                    // Probably an overview page, no practical use for us
                    if (count > MAXIMUM_ITINERARY_TYPE_OCCURRENCES) {
                        console.log(`Found too many (${count}) occurrences of ${type}, skipping`);
                        // Should we really still carry on after this?
                        continue;
                    }

                    possibleIcon = badgeIcons[type];
                    break;
                }

                // We don't need to unset the icon as we set it on a specific tab and navigating
                // away to a different page will clear it automatically.
                // More importantly, this keeps us from clearing an error icon.
                if (!possibleIcon) {
                    return;
                }

                chrome.browserAction.setBadgeText({
                    text: possibleIcon,
                    tabId: tab.id
                });

                chrome.browserAction.setBadgeBackgroundColor({
                    color: "#4d4d4d", // Breeze "black" icon color
                    tabId: tab.id
                });
            });

        });
    });
}

chrome.tabs.onActivated.addListener(checkForStructuredData);
chrome.windows.onFocusChanged.addListener(checkForStructuredData);

chrome.tabs.onRemoved.addListener((tabId) => {
    delete itineraryQuickExtractorCache[tabId];
    delete itineraryDataCache[tabId];
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === "complete") {
        delete itineraryQuickExtractorCache[tabId];
        delete itineraryDataCache[tabId];

        checkForStructuredData();
    }
});

addRuntimeCallback("itinerary", "extract", (message) => {
    const tabId = message.tabId;
    if (tabId && itineraryDataCache[tabId]) {
        return Promise.resolve(itineraryDataCache[tabId]);
    }

    return sendPortMessageWithReply("itinerary", "extract", message).then((reply) => {
        if (reply.success) {
            itineraryDataCache[tabId] = reply;
        }
        return reply;
    });
});

addRuntimeCallback("itinerary", [
    "openLocation",
    "sendLocationToDevice",
    "callOnDevice",
    "addToCalendar",
    "sendToDevice",
    "openInItinerary",
    "openInWorkbench"
    ], (message, sender, action) => {
    return sendPortMessageWithReply("itinerary", action, message);
});
