/*
 * THIS FILE WAS AUTO-GENERATED, DO NOT EDIT!
 * See ui-templates/README.txt
 *
 * EJS Embedded JavaScript templates
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

function ui_itinerary(locals, escapeFn, include, rethrow
) {
rethrow = rethrow || function rethrow(err, str, flnm, lineno, esc) {
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  var filename = esc(flnm);
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
};
escapeFn = escapeFn || function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
      .replace(_MATCH_HTML, encode_char);
};
var _ENCODE_HTML_RULES = {
      "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': "&#34;"
    , "'": "&#39;"
    }
  , _MATCH_HTML = /[&<>'"]/g;
function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
};
;
var __line = 1
  , __lines = "<%\n// Formatting utilities\n// --------------------\n\nfunction tripDesignation(trip) {\n    if (!trip) {\n        return \"\";\n    }\n\n    const tripType = trip[\"@type\"];\n    switch (trip[\"@type\"]) {\n    case \"Flight\":\n        if (trip.airline && trip.flightNumber) {\n            return trip.airline.iataCode + \" \" + trip.flightNumber;\n        }\n        break;\n    case \"TrainTrip\":\n        if (trip.trainNumber) {\n            return trip.trainNumber;\n        }\n        break;\n    case \"BusTrip\":\n        if (trip.busNumber) {\n            return trip.busNumber;\n        }\n        break;\n    }\n    throw new TypeError();\n}\n\nfunction ticketedSeatDesignation(seat) {\n    if (!seat) {\n        return \"\";\n    }\n\n    let sections = [];\n    if (seat.seatingType) {\n        switch (seat.seatingType) {\n        case \"1\":\n            sections.push(\"1st Class\");\n            break;\n        case \"2\":\n            sections.push(\"2nd Class\");\n            break;\n        case \"3\":\n            sections.push(\"3rd Class\");\n            break;\n        default:\n            sections.push(\"Class \" + seat.seatingType);\n            break;\n        }\n    }\n    if (seat.seatSection) {\n        sections.push(\"Section \" + seat.seatSection);\n    }\n    if (seat.seatNumber) {\n        sections.push(\"Seat \" + seat.seatNumber);\n    }\n\n    return sections.join(\", \");\n}\n\nfunction actionDesignation(action) {\n    const resultType = action.result && action.result[\"@type\"];\n\n    const type = action[\"@type\"];\n    switch (type) {\n    case \"BuyAction\":\n        return \"Buy\";\n    case \"ReserveAction\":\n        if (resultType === \"FoodEstablishmentReservation\") {\n            return \"Reserve a Table\";\n        } else if (resultType === \"Reservation\" && action.result.name) {\n            return \"Reserve: \" + action.result.name;\n        }\n        return \"Make a Reservation\";\n    }\n    return type;\n}\n\nfunction getTripLocations(trip) {\n    if (!trip) {\n        return null;\n    }\n\n    // TODO can there be trips with just departure?\n    if (trip.departureAirport && trip.arrivalAirport) {\n        return {departure: trip.departureAirport, arrival: trip.arrivalAirport};\n    } else if (trip.departureStation && trip.arrivalStation) {\n        return {departure: trip.departureStation, arrival: trip.arrivalStation};\n    } else if (trip.departureBusStop && trip.arrivalBusStop) {\n        return {departure: trip.departureBusStop, arrival: trip.arrivalBusStop};\n    }\n    return null;\n}\n\nfunction formatDateRange(fromDate, toDate) {\n    fromDate = jsDateFromSchemaDate(fromDate);\n    toDate = jsDateFromSchemaDate(toDate);\n\n    if (!fromDate || isNaN(fromDate.getTime())) {\n        throw new TypeError();\n    }\n\n    const formattingOptions = {\n        weekday: \"long\",\n        year: \"numeric\",\n        month: \"long\",\n        day: \"numeric\"\n    };\n\n    // Not a range or same day, easy.\n    if ((!toDate || isNaN(toDate.getTime()))\n        || (fromDate.getDate() == toDate.getDate()\n            && fromDate.getMonth() === toDate.getMonth()\n            && fromDate.getFullYear() === toDate.getFullYear())) {\n        return fromDate.toLocaleDateString([], formattingOptions);\n    }\n\n    const formattedFrom = fromDate.toLocaleDateString([], formattingOptions);\n    const formattedTo = toDate.toLocaleDateString([], formattingOptions);\n\n    return formattedFrom + \" – \" + formattedTo;\n}\n\nfunction formatDateTimeRange(fromDate, toDate) {\n    fromDate = jsDateFromSchemaDate(fromDate);\n    toDate = jsDateFromSchemaDate(toDate);\n\n    if (!fromDate || isNaN(fromDate.getTime())) {\n        throw new TypeError();\n    }\n\n    let formattingOptions = {\n        weekday: \"long\",\n        year: \"numeric\",\n        month: \"long\",\n        day: \"numeric\",\n        hour: \"numeric\",\n        minute: \"numeric\"\n    };\n\n    if (!toDate || isNaN(toDate.getTime())) {\n        toDate = fromDate;\n    }\n\n    // If both start and end are on midnight, consider it as a date\n    // TODO when we have something like 15th 15:00 till 17th 00:00 we effectively want \"15th 15:00 till 16th\"?\n    if (fromDate.getHours() == 0 && fromDate.getMinutes() == 0 && fromDate.getSeconds() == 0\n        && toDate.getHours() == 0 && toDate.getMinutes() == 0 && toDate.getSeconds() == 0) {\n        delete formattingOptions.hour;\n        delete formattingOptions.minute;\n    }\n\n    // If start and end date are the same, it's not a range\n    if (fromDate.getTime() === toDate.getTime()) {\n        return fromDate.toLocaleString([], formattingOptions);\n    }\n\n    let fromFormattingOptions = {};\n    // Copy it...\n    Object.assign(fromFormattingOptions, formattingOptions);\n\n    let toFormattingOptions = {};\n    Object.assign(toFormattingOptions, formattingOptions);\n\n    // Now try to make the date less verbose\n    if (fromDate.getFullYear() == toDate.getFullYear()) {\n        delete fromFormattingOptions.year;\n    }\n    if (fromDate.getDate() == toDate.getDate()\n        && fromDate.getMonth() === toDate.getMonth()\n        && fromDate.getFullYear() === toDate.getFullYear()) {\n        delete toFormattingOptions.weekday;\n        delete toFormattingOptions.day;\n        delete toFormattingOptions.month;\n        delete toFormattingOptions.year;\n    }\n\n    const formattedFrom = fromDate.toLocaleString([], fromFormattingOptions);\n    const formattedTo = toDate.toLocaleString([], toFormattingOptions);\n\n    return formattedFrom + \" – \" + formattedTo;\n}\n\nfunction jsDateFromSchemaDate(date) {\n    if (typeof date === \"string\") {\n        return new Date(date);\n    } else if (typeof date === \"object\") {\n        if (date[\"@type\"] === \"QDateTime\") {\n            return new Date(date[\"@value\"]); // TODO timezone?\n        }\n    } else if (Object.prototype.toString.call(date) === '[object Date]') {\n        return date;\n    }\n    return null;\n}\n\nfunction formatAddress(address) {\n    if (!address) {\n        return \"\";\n    }\n\n    switch (address[\"@type\"]) {\n    case \"PostalAddress\": {\n        let result = address.streetAddress || \"\";\n\n        // Some sites include the full address in streetAddress\n        if (result\n                && address.addressLocality && result.includes(address.addressLocality)\n                && address.postalCode && result.includes(address.postalCode)) {\n            return result;\n        }\n\n        if (result) {\n            result += \", \";\n        }\n\n        result += [\n            address.postalCode,\n            address.addressLocality\n        ].filter(item => !!item).join(\" \");\n\n        if (address.addressRegion && !result.includes(address.addressRegion)) {\n            if (result) {\n                result += \", \";\n            }\n            result += address.addressRegion;\n        }\n\n        const country = address.addressCountry;\n        if (country) {\n            // Crude: don't show if it's the same country as the user\n            if (navigator.language.split(\"-\")[1] !== country) {\n                result += \" (\" + address.addressCountry + \")\";\n            }\n        }\n\n        return result;\n    }\n    }\n\n    throw new TypeError();\n}\n\nfunction sanitizeForTelLink(tel) {\n    tel.replace(/ /, \"\");\n    return tel;\n}\n\n// --------------------\n%>\n\n<%\n// Try to find most prevalent type for global icon\nlet types = {};\nlet preferredIcon = \"\";\n\n// Is there no JS algorithm like \"max_element\"? :/\ndata.forEach((item) => {\n    if (item.image) {\n        return; // continue\n    }\n\n    const type = item[\"@type\"];\n    types[type] = (types[type] || 0) + 1;\n});\n\nlet mostCommonType = \"\";\nlet highestCount = 0;\nObject.keys(types).forEach((type) => {\n    const count = types[type];\n    if (count > highestCount) {\n        highestCount = count;\n        mostCommonType = type;\n    }\n});\n\nswitch (mostCommonType) {\ncase \"FlightReservation\":\n    preferredIcon = \"airplane\";\n    break;\ncase \"TrainReservation\":\n    preferredIcon = \"train\";\n    break;\ncase \"BusReservation\":\n    preferredIcon = \"bus\";\n    break;\n}\n\n// If there are multiple reservations, see if the reservation number on all is the same\n// and then only show it once at the end\nlet commonReservationNumber = \"\";\nif (data.length > 1) {\n    if (data.every((item) => {\n        return item.reservationNumber === data[0].reservationNumber;\n    })) {\n        commonReservationNumber = data[0].reservationNumber;\n    }\n}\n\n\nlet iconShownOnce = false;\ndata.forEach(function (item) {\n    const type = item[\"@type\"];\n    const trip = item.reservationFor;\n\n    const icon = !iconShownOnce ? preferredIcon : \"\";\n    if (icon) {\n        iconShownOnce = true;\n    }\n%>\n\n<section class=\"itinerary-info\">\n\n<% if (item.image) { %>\n<div class=\"banner\">\n    <div class=\"blur\" style=\"background-image: url('<%= item.image %>')\"></div>\n    <div class=\"image\" style=\"background-image: url('<%= item.image %>')\"></div>\n</div>\n<% } else if (icon) { %>\n<div class=\"banner\">\n    <div class=\"image\" style=\"background-image: url('icons/<%= icon %>.svg'\"></div>\n</div>\n<% } %>\n\n<% if (item.name) { %>\n    <h2><%= item.name %></h2>\n<% } else if (trip) { %>\n    <h2><%= tripDesignation(trip) %></h2>\n<% } %>\n\n<% if (item.description) { %>\n    <p><%= item.description %></p>\n<% } %>\n\n<ul class=\"itinerary-details\">\n\n<% if (item.startDate) { %>\n    <li class=\"icon dates\"><%= formatDateTimeRange(item.startDate, item.endDate) %></li>\n<% } else if (trip) { %>\n    <% if (trip.departureTime) { %>\n        <li class=\"icon dates\"><%= formatDateTimeRange(trip.departureTime, trip.arrivalTime) %></li>\n    <% } else if (trip.departureDay) { %>\n        <li class=\"icon dates\"><%= formatDateRange(trip.departureDay, trip.arrivalDay) %></li>\n    <% } %>\n<% } %>\n\n<% if (item.location || item.address) { %>\n    <li class=\"icon location\">\n        <% if (item.location && item.location.name) { %>\n            <%# TODO only bold when there's an address to go with it %>\n            <strong><%= item.location.name %></strong><br>\n        <% } %>\n\n        <% const formattedAddress = (item.location && item.location.address ? formatAddress(item.location.address) : formatAddress(item.address)); %>\n        <% const locationHasGeo = item.geo && item.geo[\"@type\"] === \"GeoCoordinates\"; %>\n\n        <% if (formattedAddress) { %>\n        <div class=\"contextual-actions\">\n\n            <% if (status.geoHandlerName) { %>\n                <a href=\"#open-location\" data-itinerary-action class=\"breeze-button icon marble\"\n                    <% if (locationHasGeo) { %>data-geo-lat=\"<%= item.geo.latitude %>\" data-geo-lon=\"<%= item.geo.longitude %>\"<% } %>\n                    data-address=\"<%= formattedAddress %>\"\n                    <%# FIXME i18n %>\n                    <% if (locationHasGeo) { %>\n                    title=\"Show location in <%= status.geoHandlerName %>\"\n                    <% } else { %>\n                    title=\"Show address in <%= status.geoHandlerName %>\"\n                    <% } %>\n                    ></a>\n            <% } %>\n\n            <% if (kdeConnectDevices.length > 0) { %>\n                <a href=\"#kdeconnect-location\" data-itinerary-action class=\"breeze-button icon kdeconnect\"\n                    data-device-id=\"<%= kdeConnectDevices.length === 1 ? kdeConnectDevices[0].id : \"\" %>\"\n                    <% if (locationHasGeo) { %>data-geo-lat=\"<%= item.geo.latitude %>\" data-geo-lon=\"<%= item.geo.longitude %>\"<% } %>\n                    data-address=\"<%= formattedAddress %>\"\n                    <%# FIXME i18n %>\n                    <% if (locationHasGeo) { %>\n                    title=\"Send location to <%= kdeConnectDevices.length === 1 ? kdeConnectDevices[0].name : \"device...\" %>\"\n                    <% } else { %>\n                    title=\"Send address to <%= kdeConnectDevices.length === 1 ? kdeConnectDevices[0].name : \"device...\" %>\"\n                    <% } %>\n                    ></a>\n\n            <% } %>\n\n        </div>\n        <% } %>\n\n        <%= formattedAddress %>\n    </li>\n\n<% } else if (trip) { %>\n\n    <% const locations = getTripLocations(trip); %>\n    <% if (locations) { %>\n\n        <li class=\"icon location\">\n\n            <% for (const [index, location] of [locations.departure, locations.arrival].entries()) { %>\n                <%= location.name || location.iataCode %>\n\n                <% if (location.geo && (status.geoHandlerName || kdeConnectDevices.length > 0)) { %>\n                (\n                    <% if (status.geoHandlerName) { %>\n                    <a href=\"#open-location\" data-itinerary-action class=\"breeze-button icon marble\"\n                        data-geo-lat=\"<%= location.geo.latitude %>\" data-geo-lon=\"<%= location.geo.longitude %>\"\n                        title=\"Show location in <%= status.geoHandlerName %>\"></a>\n                    <% } %>\n\n                    <% if (kdeConnectDevices.length > 0) { %>\n                    <a href=\"#kdeconnect-location\" data-itinerary-action class=\"breeze-button icon kdeconnect\"\n                        data-geo-lat=\"<%= location.geo.latitude %>\" data-geo-lon=\"<%= location.geo.longitude %>\"\n                        data-device-id=\"<%= kdeConnectDevices.length === 1 ? kdeConnectDevices[0].id : \"\" %>\"\n                        title=\"Send location to <%= kdeConnectDevices.length === 1 ? kdeConnectDevices[0].name : \"device...\" %>\"></a>\n                    <% } %>\n                )\n                <% } %>\n\n                <%= (index === 0 ? \"→\" : \"\") %>\n            <% } %>\n\n        </li>\n\n    <% } %>\n\n<% } %>\n\n<% if (item.email) { %>\n    <li class=\"icon email\"><a href=\"mailto:<%= item.email %>\" target=\"_blank\"><%= item.email %></a></li>\n<% } %>\n\n<% if (item.telephone) { %>\n    <li class=\"icon phone\">\n        <a href=\"tel:<%= sanitizeForTelLink(item.telephone) %>\" target=\"_blank\"><%= item.telephone %></a>\n\n        <% if (kdeConnectDevices.length > 0) { %>\n        <div class=\"contextual-actions\">\n            <a href=\"#kdeconnect-call\" data-itinerary-action class=\"breeze-button icon kdeconnect\"\n            data-device-id=\"<%= kdeConnectDevices.length === 1 ? kdeConnectDevices[0].id : \"\" %>\"\n            data-phone-number=\"<%= sanitizeForTelLink(item.telephone) %>\"\n            <%# FIXME i18n %>\n            title=\"Call on <%= kdeConnectDevices.length === 1 ? kdeConnectDevices[0].name : \"device...\" %>\"></a>\n        </div>\n        <% } %>\n    </li>\n<% } %>\n\n<%# TODO fax? :) %>\n\n<%# TODO should we show the URL here? Most likely the same as the website we're viewing.. but could still be nice as a \"send to device\" shortcut? %>\n\n<% if (item.airplaneSeat) { %>\n    <li class=\"icon seat\">Seat <%= item.airplaneSeat %></li>\n<% } else if (item.reservedTicket) { %>\n    <% const seat = item.reservedTicket.ticketedSeat;\n    if (seat) { %>\n        <li class=\"icon seat\"><%= ticketedSeatDesignation(seat) %></li>\n    <% } %>\n<% } %>\n\n<% if (!commonReservationNumber && item.reservationNumber) { %>\n    <li class=\"icon ticket\">Booking reference: <%= item.reservationNumber %></li>\n<% } %>\n\n<%\n    data.forEach((item) => {\n        (item.potentialAction || []).forEach((action) => {\n        %>\n            <li class=\"action\"><a href=\"<%= action.target %>\" target=\"_blank\" class=\"breeze-button\"><%= action.name || actionDesignation(action) %></a></li>\n        <% });\n    });\n%>\n\n</ul>\n\n</section>\n\n<% }); %>\n\n<%# Global actions go here %>\n<%\nconst canReserve = data.some((item) => {\n    if (item.startDate) {\n        return true;\n    }\n\n    const trip = item.reservationFor;\n    // TODO Is departureDay enough for a calendar entry?\n    if (trip && (trip.departureTime || trip.departureDay)) {\n        return true;\n    }\n\n    return false;\n});\n%>\n\n<% if (data.length > 0 && (/*canReserve ||*/ status.workbenchFound || commonReservationNumber)) { %>\n\n<section class=\"itinerary-info separated\">\n<ul class=\"itinerary-details\">\n\n<% if (commonReservationNumber) { %>\n    <li class=\"icon ticket\">Booking reference: <%= commonReservationNumber %></li>\n<% } %>\n\n<% //if (canReserve) { %>\n\n<% if (status.itineraryFound) { %>\n    <%# TODO Offer Restaurant and Hotel once we have \"booking\" or \"reservation\" UI in Itinerary %>\n    <li class=\"action\"><a href=\"#itinerary\" data-itinerary-action class=\"breeze-button icon itinerary\">\n    <%# TODO show \"Add trip to..\" or something like that? %>\n    Add to KDE Itinerary\n    </a></li>\n<% //} %>\n\n<% if (status.icalHandlerFound) { %>\n    <li class=\"action\"><a href=\"#calendar\" data-itinerary-action class=\"breeze-button icon calendar\">Add to Calendar</a></li>\n<% } %>\n\n<% if (kdeConnectDevices.length > 0) { %>\n    <li class=\"action\">\n        <% if (kdeConnectDevices.length === 1) { %>\n            <%# FIXME i18n %>\n            <%# TODO specify sending \"what\" (ticket, reservation, event info...? %>\n            <a href=\"#kdeconnect\" data-itinerary-action class=\"breeze-button icon kdeconnect\" data-device-id=\"<%= kdeConnectDevices[0].id %>\">Send to <%= kdeConnectDevices[0].name %></a>\n        <% } else { %>\n            <a href=\"#kdeconnect\" data-itinerary-action class=\"breeze-button icon kdeconnect\">Send to device...</a>\n        <% } %>\n    </li>\n<% } %>\n\n<% } %><%# canReserve %>\n\n<% if (status.workbenchFound) { %>\n    <li class=\"action\"><a href=\"#workbench\" class=\"breeze-button icon workbench\" data-itinerary-action>Open in Workbench</a></li>\n<% } %>\n\n</ul>\n</section>\n\n<% } %>\n"
  , __filename = "itinerary.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; 
// Formatting utilities
// --------------------

function tripDesignation(trip) {
    if (!trip) {
        return "";
    }

    const tripType = trip["@type"];
    switch (trip["@type"]) {
    case "Flight":
        if (trip.airline && trip.flightNumber) {
            return trip.airline.iataCode + " " + trip.flightNumber;
        }
        break;
    case "TrainTrip":
        if (trip.trainNumber) {
            return trip.trainNumber;
        }
        break;
    case "BusTrip":
        if (trip.busNumber) {
            return trip.busNumber;
        }
        break;
    }
    throw new TypeError();
}

function ticketedSeatDesignation(seat) {
    if (!seat) {
        return "";
    }

    let sections = [];
    if (seat.seatingType) {
        switch (seat.seatingType) {
        case "1":
            sections.push("1st Class");
            break;
        case "2":
            sections.push("2nd Class");
            break;
        case "3":
            sections.push("3rd Class");
            break;
        default:
            sections.push("Class " + seat.seatingType);
            break;
        }
    }
    if (seat.seatSection) {
        sections.push("Section " + seat.seatSection);
    }
    if (seat.seatNumber) {
        sections.push("Seat " + seat.seatNumber);
    }

    return sections.join(", ");
}

function actionDesignation(action) {
    const resultType = action.result && action.result["@type"];

    const type = action["@type"];
    switch (type) {
    case "BuyAction":
        return "Buy";
    case "ReserveAction":
        if (resultType === "FoodEstablishmentReservation") {
            return "Reserve a Table";
        } else if (resultType === "Reservation" && action.result.name) {
            return "Reserve: " + action.result.name;
        }
        return "Make a Reservation";
    }
    return type;
}

function getTripLocations(trip) {
    if (!trip) {
        return null;
    }

    // TODO can there be trips with just departure?
    if (trip.departureAirport && trip.arrivalAirport) {
        return {departure: trip.departureAirport, arrival: trip.arrivalAirport};
    } else if (trip.departureStation && trip.arrivalStation) {
        return {departure: trip.departureStation, arrival: trip.arrivalStation};
    } else if (trip.departureBusStop && trip.arrivalBusStop) {
        return {departure: trip.departureBusStop, arrival: trip.arrivalBusStop};
    }
    return null;
}

function formatDateRange(fromDate, toDate) {
    fromDate = jsDateFromSchemaDate(fromDate);
    toDate = jsDateFromSchemaDate(toDate);

    if (!fromDate || isNaN(fromDate.getTime())) {
        throw new TypeError();
    }

    const formattingOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    // Not a range or same day, easy.
    if ((!toDate || isNaN(toDate.getTime()))
        || (fromDate.getDate() == toDate.getDate()
            && fromDate.getMonth() === toDate.getMonth()
            && fromDate.getFullYear() === toDate.getFullYear())) {
        return fromDate.toLocaleDateString([], formattingOptions);
    }

    const formattedFrom = fromDate.toLocaleDateString([], formattingOptions);
    const formattedTo = toDate.toLocaleDateString([], formattingOptions);

    return formattedFrom + " – " + formattedTo;
}

function formatDateTimeRange(fromDate, toDate) {
    fromDate = jsDateFromSchemaDate(fromDate);
    toDate = jsDateFromSchemaDate(toDate);

    if (!fromDate || isNaN(fromDate.getTime())) {
        throw new TypeError();
    }

    let formattingOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
    };

    if (!toDate || isNaN(toDate.getTime())) {
        toDate = fromDate;
    }

    // If both start and end are on midnight, consider it as a date
    // TODO when we have something like 15th 15:00 till 17th 00:00 we effectively want "15th 15:00 till 16th"?
    if (fromDate.getHours() == 0 && fromDate.getMinutes() == 0 && fromDate.getSeconds() == 0
        && toDate.getHours() == 0 && toDate.getMinutes() == 0 && toDate.getSeconds() == 0) {
        delete formattingOptions.hour;
        delete formattingOptions.minute;
    }

    // If start and end date are the same, it's not a range
    if (fromDate.getTime() === toDate.getTime()) {
        return fromDate.toLocaleString([], formattingOptions);
    }

    let fromFormattingOptions = {};
    // Copy it...
    Object.assign(fromFormattingOptions, formattingOptions);

    let toFormattingOptions = {};
    Object.assign(toFormattingOptions, formattingOptions);

    // Now try to make the date less verbose
    if (fromDate.getFullYear() == toDate.getFullYear()) {
        delete fromFormattingOptions.year;
    }
    if (fromDate.getDate() == toDate.getDate()
        && fromDate.getMonth() === toDate.getMonth()
        && fromDate.getFullYear() === toDate.getFullYear()) {
        delete toFormattingOptions.weekday;
        delete toFormattingOptions.day;
        delete toFormattingOptions.month;
        delete toFormattingOptions.year;
    }

    const formattedFrom = fromDate.toLocaleString([], fromFormattingOptions);
    const formattedTo = toDate.toLocaleString([], toFormattingOptions);

    return formattedFrom + " – " + formattedTo;
}

function jsDateFromSchemaDate(date) {
    if (typeof date === "string") {
        return new Date(date);
    } else if (typeof date === "object") {
        if (date["@type"] === "QDateTime") {
            return new Date(date["@value"]); // TODO timezone?
        }
    } else if (Object.prototype.toString.call(date) === '[object Date]') {
        return date;
    }
    return null;
}

function formatAddress(address) {
    if (!address) {
        return "";
    }

    switch (address["@type"]) {
    case "PostalAddress": {
        let result = address.streetAddress || "";

        // Some sites include the full address in streetAddress
        if (result
                && address.addressLocality && result.includes(address.addressLocality)
                && address.postalCode && result.includes(address.postalCode)) {
            return result;
        }

        if (result) {
            result += ", ";
        }

        result += [
            address.postalCode,
            address.addressLocality
        ].filter(item => !!item).join(" ");

        if (address.addressRegion && !result.includes(address.addressRegion)) {
            if (result) {
                result += ", ";
            }
            result += address.addressRegion;
        }

        const country = address.addressCountry;
        if (country) {
            // Crude: don't show if it's the same country as the user
            if (navigator.language.split("-")[1] !== country) {
                result += " (" + address.addressCountry + ")";
            }
        }

        return result;
    }
    }

    throw new TypeError();
}

function sanitizeForTelLink(tel) {
    tel.replace(/ /, "");
    return tel;
}

// --------------------

    ; __line = 252
    ; __append("\n\n")
    ; __line = 254
    ; 
// Try to find most prevalent type for global icon
let types = {};
let preferredIcon = "";

// Is there no JS algorithm like "max_element"? :/
data.forEach((item) => {
    if (item.image) {
        return; // continue
    }

    const type = item["@type"];
    types[type] = (types[type] || 0) + 1;
});

let mostCommonType = "";
let highestCount = 0;
Object.keys(types).forEach((type) => {
    const count = types[type];
    if (count > highestCount) {
        highestCount = count;
        mostCommonType = type;
    }
});

switch (mostCommonType) {
case "FlightReservation":
    preferredIcon = "airplane";
    break;
case "TrainReservation":
    preferredIcon = "train";
    break;
case "BusReservation":
    preferredIcon = "bus";
    break;
}

// If there are multiple reservations, see if the reservation number on all is the same
// and then only show it once at the end
let commonReservationNumber = "";
if (data.length > 1) {
    if (data.every((item) => {
        return item.reservationNumber === data[0].reservationNumber;
    })) {
        commonReservationNumber = data[0].reservationNumber;
    }
}


let iconShownOnce = false;
data.forEach(function (item) {
    const type = item["@type"];
    const trip = item.reservationFor;

    const icon = !iconShownOnce ? preferredIcon : "";
    if (icon) {
        iconShownOnce = true;
    }

    ; __line = 312
    ; __append("\n\n<section class=\"itinerary-info\">\n\n")
    ; __line = 316
    ;  if (item.image) { 
    ; __append("\n<div class=\"banner\">\n    <div class=\"blur\" style=\"background-image: url('")
    ; __line = 318
    ; __append(escapeFn( item.image ))
    ; __append("')\"></div>\n    <div class=\"image\" style=\"background-image: url('")
    ; __line = 319
    ; __append(escapeFn( item.image ))
    ; __append("')\"></div>\n</div>\n")
    ; __line = 321
    ;  } else if (icon) { 
    ; __append("\n<div class=\"banner\">\n    <div class=\"image\" style=\"background-image: url('icons/")
    ; __line = 323
    ; __append(escapeFn( icon ))
    ; __append(".svg'\"></div>\n</div>\n")
    ; __line = 325
    ;  } 
    ; __append("\n\n")
    ; __line = 327
    ;  if (item.name) { 
    ; __append("\n    <h2>")
    ; __line = 328
    ; __append(escapeFn( item.name ))
    ; __append("</h2>\n")
    ; __line = 329
    ;  } else if (trip) { 
    ; __append("\n    <h2>")
    ; __line = 330
    ; __append(escapeFn( tripDesignation(trip) ))
    ; __append("</h2>\n")
    ; __line = 331
    ;  } 
    ; __append("\n\n")
    ; __line = 333
    ;  if (item.description) { 
    ; __append("\n    <p>")
    ; __line = 334
    ; __append(escapeFn( item.description ))
    ; __append("</p>\n")
    ; __line = 335
    ;  } 
    ; __append("\n\n<ul class=\"itinerary-details\">\n\n")
    ; __line = 339
    ;  if (item.startDate) { 
    ; __append("\n    <li class=\"icon dates\">")
    ; __line = 340
    ; __append(escapeFn( formatDateTimeRange(item.startDate, item.endDate) ))
    ; __append("</li>\n")
    ; __line = 341
    ;  } else if (trip) { 
    ; __append("\n    ")
    ; __line = 342
    ;  if (trip.departureTime) { 
    ; __append("\n        <li class=\"icon dates\">")
    ; __line = 343
    ; __append(escapeFn( formatDateTimeRange(trip.departureTime, trip.arrivalTime) ))
    ; __append("</li>\n    ")
    ; __line = 344
    ;  } else if (trip.departureDay) { 
    ; __append("\n        <li class=\"icon dates\">")
    ; __line = 345
    ; __append(escapeFn( formatDateRange(trip.departureDay, trip.arrivalDay) ))
    ; __append("</li>\n    ")
    ; __line = 346
    ;  } 
    ; __append("\n")
    ; __line = 347
    ;  } 
    ; __append("\n\n")
    ; __line = 349
    ;  if (item.location || item.address) { 
    ; __append("\n    <li class=\"icon location\">\n        ")
    ; __line = 351
    ;  if (item.location && item.location.name) { 
    ; __append("\n            ")
    ; __line = 352
    ; __append("\n            <strong>")
    ; __line = 353
    ; __append(escapeFn( item.location.name ))
    ; __append("</strong><br>\n        ")
    ; __line = 354
    ;  } 
    ; __append("\n\n        ")
    ; __line = 356
    ;  const formattedAddress = (item.location && item.location.address ? formatAddress(item.location.address) : formatAddress(item.address)); 
    ; __append("\n        ")
    ; __line = 357
    ;  const locationHasGeo = item.geo && item.geo["@type"] === "GeoCoordinates"; 
    ; __append("\n\n        ")
    ; __line = 359
    ;  if (formattedAddress) { 
    ; __append("\n        <div class=\"contextual-actions\">\n\n            ")
    ; __line = 362
    ;  if (status.geoHandlerName) { 
    ; __append("\n                <a href=\"#open-location\" data-itinerary-action class=\"breeze-button icon marble\"\n                    ")
    ; __line = 364
    ;  if (locationHasGeo) { 
    ; __append("data-geo-lat=\"")
    ; __append(escapeFn( item.geo.latitude ))
    ; __append("\" data-geo-lon=\"")
    ; __append(escapeFn( item.geo.longitude ))
    ; __append("\"")
    ;  } 
    ; __append("\n                    data-address=\"")
    ; __line = 365
    ; __append(escapeFn( formattedAddress ))
    ; __append("\"\n                    ")
    ; __line = 366
    ; __append("\n                    ")
    ; __line = 367
    ;  if (locationHasGeo) { 
    ; __append("\n                    title=\"Show location in ")
    ; __line = 368
    ; __append(escapeFn( status.geoHandlerName ))
    ; __append("\"\n                    ")
    ; __line = 369
    ;  } else { 
    ; __append("\n                    title=\"Show address in ")
    ; __line = 370
    ; __append(escapeFn( status.geoHandlerName ))
    ; __append("\"\n                    ")
    ; __line = 371
    ;  } 
    ; __append("\n                    ></a>\n            ")
    ; __line = 373
    ;  } 
    ; __append("\n\n            ")
    ; __line = 375
    ;  if (kdeConnectDevices.length > 0) { 
    ; __append("\n                <a href=\"#kdeconnect-location\" data-itinerary-action class=\"breeze-button icon kdeconnect\"\n                    data-device-id=\"")
    ; __line = 377
    ; __append(escapeFn( kdeConnectDevices.length === 1 ? kdeConnectDevices[0].id : "" ))
    ; __append("\"\n                    ")
    ; __line = 378
    ;  if (locationHasGeo) { 
    ; __append("data-geo-lat=\"")
    ; __append(escapeFn( item.geo.latitude ))
    ; __append("\" data-geo-lon=\"")
    ; __append(escapeFn( item.geo.longitude ))
    ; __append("\"")
    ;  } 
    ; __append("\n                    data-address=\"")
    ; __line = 379
    ; __append(escapeFn( formattedAddress ))
    ; __append("\"\n                    ")
    ; __line = 380
    ; __append("\n                    ")
    ; __line = 381
    ;  if (locationHasGeo) { 
    ; __append("\n                    title=\"Send location to ")
    ; __line = 382
    ; __append(escapeFn( kdeConnectDevices.length === 1 ? kdeConnectDevices[0].name : "device..." ))
    ; __append("\"\n                    ")
    ; __line = 383
    ;  } else { 
    ; __append("\n                    title=\"Send address to ")
    ; __line = 384
    ; __append(escapeFn( kdeConnectDevices.length === 1 ? kdeConnectDevices[0].name : "device..." ))
    ; __append("\"\n                    ")
    ; __line = 385
    ;  } 
    ; __append("\n                    ></a>\n\n            ")
    ; __line = 388
    ;  } 
    ; __append("\n\n        </div>\n        ")
    ; __line = 391
    ;  } 
    ; __append("\n\n        ")
    ; __line = 393
    ; __append(escapeFn( formattedAddress ))
    ; __append("\n    </li>\n\n")
    ; __line = 396
    ;  } else if (trip) { 
    ; __append("\n\n    ")
    ; __line = 398
    ;  const locations = getTripLocations(trip); 
    ; __append("\n    ")
    ; __line = 399
    ;  if (locations) { 
    ; __append("\n\n        <li class=\"icon location\">\n\n            ")
    ; __line = 403
    ;  for (const [index, location] of [locations.departure, locations.arrival].entries()) { 
    ; __append("\n                ")
    ; __line = 404
    ; __append(escapeFn( location.name || location.iataCode ))
    ; __append("\n\n                ")
    ; __line = 406
    ;  if (location.geo && (status.geoHandlerName || kdeConnectDevices.length > 0)) { 
    ; __append("\n                (\n                    ")
    ; __line = 408
    ;  if (status.geoHandlerName) { 
    ; __append("\n                    <a href=\"#open-location\" data-itinerary-action class=\"breeze-button icon marble\"\n                        data-geo-lat=\"")
    ; __line = 410
    ; __append(escapeFn( location.geo.latitude ))
    ; __append("\" data-geo-lon=\"")
    ; __append(escapeFn( location.geo.longitude ))
    ; __append("\"\n                        title=\"Show location in ")
    ; __line = 411
    ; __append(escapeFn( status.geoHandlerName ))
    ; __append("\"></a>\n                    ")
    ; __line = 412
    ;  } 
    ; __append("\n\n                    ")
    ; __line = 414
    ;  if (kdeConnectDevices.length > 0) { 
    ; __append("\n                    <a href=\"#kdeconnect-location\" data-itinerary-action class=\"breeze-button icon kdeconnect\"\n                        data-geo-lat=\"")
    ; __line = 416
    ; __append(escapeFn( location.geo.latitude ))
    ; __append("\" data-geo-lon=\"")
    ; __append(escapeFn( location.geo.longitude ))
    ; __append("\"\n                        data-device-id=\"")
    ; __line = 417
    ; __append(escapeFn( kdeConnectDevices.length === 1 ? kdeConnectDevices[0].id : "" ))
    ; __append("\"\n                        title=\"Send location to ")
    ; __line = 418
    ; __append(escapeFn( kdeConnectDevices.length === 1 ? kdeConnectDevices[0].name : "device..." ))
    ; __append("\"></a>\n                    ")
    ; __line = 419
    ;  } 
    ; __append("\n                )\n                ")
    ; __line = 421
    ;  } 
    ; __append("\n\n                ")
    ; __line = 423
    ; __append(escapeFn( (index === 0 ? "→" : "") ))
    ; __append("\n            ")
    ; __line = 424
    ;  } 
    ; __append("\n\n        </li>\n\n    ")
    ; __line = 428
    ;  } 
    ; __append("\n\n")
    ; __line = 430
    ;  } 
    ; __append("\n\n")
    ; __line = 432
    ;  if (item.email) { 
    ; __append("\n    <li class=\"icon email\"><a href=\"mailto:")
    ; __line = 433
    ; __append(escapeFn( item.email ))
    ; __append("\" target=\"_blank\">")
    ; __append(escapeFn( item.email ))
    ; __append("</a></li>\n")
    ; __line = 434
    ;  } 
    ; __append("\n\n")
    ; __line = 436
    ;  if (item.telephone) { 
    ; __append("\n    <li class=\"icon phone\">\n        <a href=\"tel:")
    ; __line = 438
    ; __append(escapeFn( sanitizeForTelLink(item.telephone) ))
    ; __append("\" target=\"_blank\">")
    ; __append(escapeFn( item.telephone ))
    ; __append("</a>\n\n        ")
    ; __line = 440
    ;  if (kdeConnectDevices.length > 0) { 
    ; __append("\n        <div class=\"contextual-actions\">\n            <a href=\"#kdeconnect-call\" data-itinerary-action class=\"breeze-button icon kdeconnect\"\n            data-device-id=\"")
    ; __line = 443
    ; __append(escapeFn( kdeConnectDevices.length === 1 ? kdeConnectDevices[0].id : "" ))
    ; __append("\"\n            data-phone-number=\"")
    ; __line = 444
    ; __append(escapeFn( sanitizeForTelLink(item.telephone) ))
    ; __append("\"\n            ")
    ; __line = 445
    ; __append("\n            title=\"Call on ")
    ; __line = 446
    ; __append(escapeFn( kdeConnectDevices.length === 1 ? kdeConnectDevices[0].name : "device..." ))
    ; __append("\"></a>\n        </div>\n        ")
    ; __line = 448
    ;  } 
    ; __append("\n    </li>\n")
    ; __line = 450
    ;  } 
    ; __append("\n\n")
    ; __line = 452
    ; __append("\n\n")
    ; __line = 454
    ; __append("\n\n")
    ; __line = 456
    ;  if (item.airplaneSeat) { 
    ; __append("\n    <li class=\"icon seat\">Seat ")
    ; __line = 457
    ; __append(escapeFn( item.airplaneSeat ))
    ; __append("</li>\n")
    ; __line = 458
    ;  } else if (item.reservedTicket) { 
    ; __append("\n    ")
    ; __line = 459
    ;  const seat = item.reservedTicket.ticketedSeat;
    if (seat) { 
    ; __line = 460
    ; __append("\n        <li class=\"icon seat\">")
    ; __line = 461
    ; __append(escapeFn( ticketedSeatDesignation(seat) ))
    ; __append("</li>\n    ")
    ; __line = 462
    ;  } 
    ; __append("\n")
    ; __line = 463
    ;  } 
    ; __append("\n\n")
    ; __line = 465
    ;  if (!commonReservationNumber && item.reservationNumber) { 
    ; __append("\n    <li class=\"icon ticket\">Booking reference: ")
    ; __line = 466
    ; __append(escapeFn( item.reservationNumber ))
    ; __append("</li>\n")
    ; __line = 467
    ;  } 
    ; __append("\n\n")
    ; __line = 469
    ; 
    data.forEach((item) => {
        (item.potentialAction || []).forEach((action) => {
        
    ; __line = 472
    ; __append("\n            <li class=\"action\"><a href=\"")
    ; __line = 473
    ; __append(escapeFn( action.target ))
    ; __append("\" target=\"_blank\" class=\"breeze-button\">")
    ; __append(escapeFn( action.name || actionDesignation(action) ))
    ; __append("</a></li>\n        ")
    ; __line = 474
    ;  });
    });

    ; __line = 476
    ; __append("\n\n</ul>\n\n</section>\n\n")
    ; __line = 482
    ;  }); 
    ; __append("\n\n")
    ; __line = 484
    ; __append("\n")
    ; __line = 485
    ; 
const canReserve = data.some((item) => {
    if (item.startDate) {
        return true;
    }

    const trip = item.reservationFor;
    // TODO Is departureDay enough for a calendar entry?
    if (trip && (trip.departureTime || trip.departureDay)) {
        return true;
    }

    return false;
});

    ; __line = 499
    ; __append("\n\n")
    ; __line = 501
    ;  if (data.length > 0 && (/*canReserve ||*/ status.workbenchFound || commonReservationNumber)) { 
    ; __append("\n\n<section class=\"itinerary-info separated\">\n<ul class=\"itinerary-details\">\n\n")
    ; __line = 506
    ;  if (commonReservationNumber) { 
    ; __append("\n    <li class=\"icon ticket\">Booking reference: ")
    ; __line = 507
    ; __append(escapeFn( commonReservationNumber ))
    ; __append("</li>\n")
    ; __line = 508
    ;  } 
    ; __append("\n\n")
    ; __line = 510
    ;  //if (canReserve) { 

    ; __append("\n\n")
    ; __line = 512
    ;  if (status.itineraryFound) { 
    ; __append("\n    ")
    ; __line = 513
    ; __append("\n    <li class=\"action\"><a href=\"#itinerary\" data-itinerary-action class=\"breeze-button icon itinerary\">\n    ")
    ; __line = 515
    ; __append("\n    Add to KDE Itinerary\n    </a></li>\n")
    ; __line = 518
    ;  //} 

    ; __append("\n\n")
    ; __line = 520
    ;  if (status.icalHandlerFound) { 
    ; __append("\n    <li class=\"action\"><a href=\"#calendar\" data-itinerary-action class=\"breeze-button icon calendar\">Add to Calendar</a></li>\n")
    ; __line = 522
    ;  } 
    ; __append("\n\n")
    ; __line = 524
    ;  if (kdeConnectDevices.length > 0) { 
    ; __append("\n    <li class=\"action\">\n        ")
    ; __line = 526
    ;  if (kdeConnectDevices.length === 1) { 
    ; __append("\n            ")
    ; __line = 527
    ; __append("\n            ")
    ; __line = 528
    ; __append("\n            <a href=\"#kdeconnect\" data-itinerary-action class=\"breeze-button icon kdeconnect\" data-device-id=\"")
    ; __line = 529
    ; __append(escapeFn( kdeConnectDevices[0].id ))
    ; __append("\">Send to ")
    ; __append(escapeFn( kdeConnectDevices[0].name ))
    ; __append("</a>\n        ")
    ; __line = 530
    ;  } else { 
    ; __append("\n            <a href=\"#kdeconnect\" data-itinerary-action class=\"breeze-button icon kdeconnect\">Send to device...</a>\n        ")
    ; __line = 532
    ;  } 
    ; __append("\n    </li>\n")
    ; __line = 534
    ;  } 
    ; __append("\n\n")
    ; __line = 536
    ;  } 
    ; __append("\n\n")
    ; __line = 538
    ;  if (status.workbenchFound) { 
    ; __append("\n    <li class=\"action\"><a href=\"#workbench\" class=\"breeze-button icon workbench\" data-itinerary-action>Open in Workbench</a></li>\n")
    ; __line = 540
    ;  } 
    ; __append("\n\n</ul>\n</section>\n\n")
    ; __line = 545
    ;  } 
    ; __append("\n")
    ; __line = 546
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL="itinerary.ejs"

}