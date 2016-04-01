'use strict';

var oauthUrl = 'https://www.facebook.com/dialog/oauth?client_id=464891386855067&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=basic_info,email,public_profile,user_about_me,user_activities,user_birthday,user_education_history,user_friends,user_interests,user_likes,user_location,user_photos,user_relationship_details&response_type=token',
    oauthWildcard = 'https://www.facebook.com/dialog/oauth*',
    blankWildcard = 'https://www.facebook.com/connect/blank.html*',
    successWildcard = 'https://www.facebook.com/connect/login_success.html*';

chrome.runtime.onMessage.addListener(acceptRequest);

function acceptRequest(message) {
    if (message.type != 'request') {
        return;
    }

    // Listen for oauth urls.
    chrome.webRequest.onHeadersReceived.addListener(sendResponse, {
        urls: [successWildcard]
    }, ['responseHeaders']);

    // Begin oauth process.
    chrome.tabs.create({url: oauthUrl});
}

function sendResponse(info) {
    // Send token back.
    chrome.runtime.sendMessage({
        type: 'response',
        data: extractToken(info.url)
    });

    // Close opened tabs.
    closeAuthTabs(oauthWildcard);
    closeAuthTabs(blankWildcard);
    closeAuthTabs(successWildcard);

    // Remove self.
    chrome.webRequest.onBeforeRedirect.removeListener(sendResponse);
}

function extractToken(url) {
    var regexp = new RegExp('access_token=(.*)&expires_in=(.*)'),
        matches = url.match(regexp);
    return {
        token: matches[1],
        expires: matches[2] * 1
    };
}

function closeAuthTabs(url) {
    chrome.tabs.query({
        url: url
    }, function (tabs) {
        tabs.forEach(function (tab) {
            chrome.tabs.remove(tab.id);
        });
    });
}

// Open main app page.
chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({
        url: 'main.html'
    });
});
