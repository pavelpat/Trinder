'use strict';

var oauthUrl = 'https://www.facebook.com/dialog/oauth?client_id=464891386855067&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=basic_info,email,public_profile,user_about_me,user_activities,user_birthday,user_education_history,user_friends,user_interests,user_likes,user_location,user_photos,user_relationship_details&response_type=token',
    oauthWildcard = 'https://www.facebook.com/dialog/oauth*',
    blankWildcard = 'https://www.facebook.com/connect/blank.html*';

chrome.runtime.onMessage.addListener(function(message) {
    if (message.type != 'request') {
        return;
    }

    function extractCloseResponse(info){
        // Send token back.
        var message = extractToken(info.redirectUrl);
        message.type = 'response';
        chrome.runtime.sendMessage(message);

        // Close opened tabs.
        closeAuthTabs(oauthWildcard);
        closeAuthTabs(blankWildcard);

        // Remove self.
        chrome.webRequest.onBeforeRedirect.removeListener(extractCloseResponse);
    }

    // Listen for oauth redirects.
    chrome.webRequest.onBeforeRedirect.addListener(extractCloseResponse, {
        urls: [oauthWildcard]
    }, ['responseHeaders']);

    // Begin oauth process.
    chrome.tabs.create({url: oauthUrl});
});

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
    }, function(tabs){
        tabs.forEach(function (tab) {
            chrome.tabs.remove(tab.id);
        });
    });
}

// Open main app page.
chrome.browserAction.onClicked.addListener(function (activeTab) {
    chrome.tabs.create({
        url: 'main.html'
    });
});
