((chrome, App) => {
    'use strict';

    App.service('Echo', class {
        send(data) {
            return new Promise((resolve) => {
                chrome.runtime.onMessage.addListener(receiver);

                chrome.runtime.sendMessage({
                    type: 'request',
                    data: data
                });

                function receiver(message) {
                    if (message.type == 'response') {
                        chrome.runtime.onMessage.removeListener(receiver);
                        resolve(message.data);
                    }
                }
            });
        }
    });
})(chrome, App);
