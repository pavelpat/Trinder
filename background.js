'use strict';

let redirectUri = 'fbconnect://success',
    scopes = ['basic_info', 'email', 'public_profile', 'user_about_me', 'user_activities', 'user_birthday', 'user_education_history', 'user_friends', 'user_interests', 'user_likes', 'user_location', 'user_photos', 'user_relationship_details'],
    oauthPageUrl = 'https://www.facebook.com/dialog/oauth?client_id=464891386855067&redirect_uri=' + redirectUri + '&scope=' + scopes.join(',') + '&response_type=token',
    oauthPageUrlContains = '/dialog/oauth',
    oauthFormActionContains = '/oauth/confirm';

chrome.runtime.onMessage.addListener(acceptRequest);
chrome.runtime.onMessageExternal.addListener(acceptToken);

function acceptRequest(message) {
    if (message.type != 'request') {
        return;
    }

    chrome.tabs.onUpdated.addListener(function (tabId, info) {
        if (info.status === 'complete') {
            chrome.tabs.get(tabId, function(tab){
                if (tab.url.indexOf(oauthPageUrlContains) != -1) {
                    injectInterceptor(tab);
                }
            });
        }
    });

    // Begin oauth process.
    chrome.tabs.create({
        'url': oauthPageUrl,
    });
}

function injectInterceptor(tab) {    
    // This code will be injected to page which tries to submit oauth form ('Ok' click).
    // Intercepting form submit request looks simpler than hack facebook form submitting.
    // Because we dont need await page and form load, just intercept 'Ok' click effect =).
    let code = (
        '\'use strict\';' + 
        '/* Poll facebook page to find the form. */' +
        'let watcher = window.setInterval(function() {' +
        '    let query = \'form[action*="' + oauthFormActionContains + '"]\';' +
        '    let form = document.querySelector(query);' +
        '    if (form) {' +
        '        /* Form found. Stop polling page. */' +
        '        window.clearInterval(watcher);' +
        '        form.addEventListener(\'submit\', function(event){' +
        '            /* Form submitted. Cancel it. */' +
        '            event.preventDefault();' +
        '            /* Submit cancelled. Send data via ajax. */' +
        '            fetch(form.action, {' +
        '                method: \'POST\',' +
        '                body: new URLSearchParams(new FormData(form))' +
        '            }).then(function(result){' +
        '                return result.text();' +
        '            }).then(function(text){' +
        '                chrome.runtime.sendMessage(\'' + chrome.runtime.id + '\', {' +
        '                    type: \'token\',' +
        '                    url: text' +
        '                });' +
        '            });' +
        '        });' +
        '    }' +
        '}, 100);'
    );

    // Inject submit handler to Facebool page.
    chrome.tabs.executeScript(tab.id, {
        code: (
            '\'use strict\';' +
            'let trinderElement = window.document.createElement(\'script\');' +
            'trinderElement.async = true;' +
            'trinderElement.innerHTML = \'' + code.split('\'').join('\\\'') + '\';' +
            'window.document.head.appendChild(trinderElement);'
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
    closeAuthTabs(oauthPageUrlContains);
}

function extractToken(url) {
    let tokenRe = new RegExp('access_token=(.*?)[&$]'),
        expiresRe = new RegExp('expires_in=(.*?)[&$]'),
        tokenMatches = url.match(tokenRe),
        expiresMatches = url.match(expiresRe);
    return {
        token: tokenMatches[1],
        expires: expiresMatches[1] * 1
    };
}

function closeAuthTabs(url) {
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(function (tab) {
            if (tab.url.indexOf(url) !== -1) {
                chrome.tabs.remove(tab.id);
            }
        });    
    });
}

// Open main app page.
chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({
        url: 'main.html'
    });
});
