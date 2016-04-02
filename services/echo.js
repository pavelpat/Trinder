((chrome, App) => {
    'use strict';

    App.value('Echo', (data) => new Promise((resolve) => {
        chrome.runtime.onMessage.addListener(
            function receiver(message) {
                if (message.type == 'response') {
                    chrome.runtime.onMessage.removeListener(receiver);
                    resolve(message.data);
                }
            }
        );

        chrome.runtime.sendMessage({
            type: 'request',
            data: data
        });
    }));
})(chrome, App);
