'use strict';

let redirectUri = 'fbconnect://success',
    scopes = ['basic_info', 'email', 'public_profile', 'user_about_me', 'user_activities', 'user_birthday', 'user_education_history', 'user_friends', 'user_interests', 'user_likes', 'user_location', 'user_photos', 'user_relationship_details'],
    oauthUrl = 'https://www.facebook.com/dialog/oauth?client_id=464891386855067&redirect_uri=' + redirectUri + '&scope=' + scopes.join(',') + '&response_type=token',
    oauthWildcard = 'https://www.facebook.com/dialog/oauth*';

chrome.runtime.onMessage.addListener(acceptRequest);
chrome.runtime.onMessageExternal.addListener(acceptToken);

function acceptRequest(message) {
    if (message.type != 'request') {
        return;
    }

    // Listen for oauth urls.
    chrome.webRequest.onBeforeRequest.addListener(injectInterceptor, {
        urls: [oauthWildcard]
    }, ['blocking']);

    // Begin oauth process.
    chrome.tabs.create({url: oauthUrl});
}

function injectInterceptor(info) {
    // Remove self.
    chrome.webRequest.onBeforeRequest.removeListener(injectInterceptor);

    // Create interceptor.
    let code = (
        '\\\'use strict\\\';' +
        'AsyncRequest.prototype._handleJSResponseOrig = AsyncRequest.prototype._handleJSResponse;' +
        'AsyncRequest.prototype._handleJSResponse = function(value) {' +
        '    if (value.jsmods && value.jsmods.require && value.jsmods.require.length) {' +
        '        let event = value.jsmods.require[0];' +
        '        if (event[0] == \\\'ServerRedirect\\\' && event[1] == \\\'redirectPageTo\\\') {' +
        '            chrome.runtime.sendMessage(\\\'' + chrome.runtime.id + '\\\', {' +
        '                type: \\\'token\\\',' +
        '                url: event[3][0]' +
        '            });' +
        '        }' +
        '    }' +
        '    return AsyncRequest.prototype._handleJSResponseOrig.call(this, value);' +
        '};'
    );

    // Inject interceptor.
    chrome.tabs.executeScript(info.tabId, {
        code: (
            '\'use strict\';' +
            'let element = window.document.createElement(\'script\');' +
            'element.async = true;' +
            'element.innerHTML = \'' + code + '\';' +
            'window.document.head.appendChild(element);'
        )
    });
}

function acceptToken(data) {
    if (data.type != 'token') {
        return;
    }

    // Send token back.
    chrome.runtime.sendMessage({
        type: 'response',
        data: extractToken(data.url)
    });

    // Close opened tabs.
    closeAuthTabs(oauthWildcard);
}

function extractToken(url) {
    let regexp = new RegExp('access_token=(.*)&expires_in=(.*)'),
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
