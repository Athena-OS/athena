/*
    Copyright (C) 2020 Kai Uwe Broulik <kde@broulik.de>

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

const permissions = {
    history: {
        rationale: [
            chrome.i18n.getMessage("permission_request_historyrunner_1"),
            chrome.i18n.getMessage("permission_request_historyrunner_2", ["open-krunner-settings", "#"])
        ]
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);
    const permission = urlParams.get('permission');

    const textItem = document.getElementById("permission-text");
    const rationaleList = document.getElementById("permission-rationale");

    const requestButton = document.getElementById("request-permission");
    const revokeButton = document.getElementById("revoke-permission");

    if (!permission) {
        return;
    }

    if (!permissions[permission]) {
        console.error("Cannot request unknown permission", permission);
        return;
    }

    chrome.permissions.contains({
        permissions: [permission]
    }, (granted) => {
        if (granted) {
            textItem.innerText = chrome.i18n.getMessage("permission_request_already");

            revokeButton.addEventListener("click", () => {
                chrome.permissions.remove({
                    permissions: [permission]
                }, (ok) => {
                    if (ok) {
                        window.close();
                        return;
                    }

                    if (chrome.runtime.lastError) {
                        alert(chrome.runtime.lastError.message);
                    }
                });
            });
            revokeButton.classList.remove("hidden");
            return;
        }

        (permissions[permission].rationale || []).forEach((rationale) => {
            let rationaleItem = document.createElement("li");
            rationaleItem.innerHTML = rationale;
            rationaleList.appendChild(rationaleItem);
        });

        const krunnerSettingsLink = document.getElementById("open-krunner-settings");
        if (krunnerSettingsLink) {
            krunnerSettingsLink.addEventListener("click", (e) => {
                sendMessage("settings", "openKRunnerSettings");
                e.preventDefault();
            });
        }

        requestButton.addEventListener("click", () => {
            chrome.permissions.request({
                permissions: [permission]
            }, (granted) => {
                if (granted) {
                    window.close();
                    return;
                }

                if (chrome.runtime.lastError) {
                    alert(chrome.runtime.lastError.message);
                    return;
                }
            });
        });
        requestButton.classList.remove("hidden");
    });

});
