/*
    Copyright (C) 2017, 2019 Kai Uwe Broulik <kde@privat.broulik.de>
    Copyright (C) 2018 David Edmundson <davidedmundson@kde.org>

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

function sendMessage(subsystem, action, payload) {
    let data = {
        subsystem: subsystem,
        action: action,
        payload: payload
    };

    if (chrome.runtime && chrome.runtime.sendMessage) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(data, (reply) => {
                if (chrome.runtime.lastError) {
                    if (chrome.runtime.lastError.message === "The message port closed before a response was received.") {
                        resolve();
                    } else {
                        reject(chrome.runtime.lastError);
                    }
                    return;
                }

                if (reply && reply.rejected) {
                    reject(reply);
                } else {
                    resolve(reply);
                }
            });
        });
    }

    return browser.runtime.sendMessage(data);
}
