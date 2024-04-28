/*
    Copyright (C) 2017 Kai Uwe Broulik <kde@privat.broulik.de>

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

document.addEventListener("DOMContentLoaded", function() {

    document.querySelectorAll("[data-i18n]").forEach(function (item) {
        var data = item.dataset.i18n.split(",").map(function (value) {
            value = value.trim();

            if (value.startsWith("__MSG_")) {
                return value.replace(/__MSG_(\w+)__/g, function (match, key) {
                    return key ? chrome.i18n.getMessage(key) : "";
                });
            }

            return value;
        });

        var text = chrome.i18n.getMessage(data.shift(), data) || ("I18N_UNKNOWN " + item.dataset.i18n);

        if (!!item.dataset.i18nHtml) {
            item.innerHTML = text;
        } else {
            item.innerText = text;
        }
    });

});
