((App, window) => {
    'use strict';

    App.run(function($rootScope, SettingsStore, Auth, Client, Geo, ) {
        /**
         * Bootstraps application with a few steps.
         */
        async function bootstrap() {
            // Set initial Angular state.
            $rootScope.client = null;
            $rootScope.user = null;
            $rootScope.loaded = null;
            $rootScope.located = true;
            $rootScope.validated = true;

            // Get application settings object.
            let settings = await SettingsStore.settings;

            // Get Facebook auth token from popup or cache.
            let fbauth = await Auth.auth();

            // Create Tinder API client and authenticate it.
            let client = new Client(fbauth.id, fbauth.token);
            let clauth = await client.auth();
            client.setauth(clauth);
            
            // Enable client-dependent interface.
            $rootScope.client = client;
            $rootScope.$apply();

            // Need to submit user phone number.
            if (!clauth.phoneValidated) {
                // Phone not validated. Show validate form.
                $rootScope.validated = false;
                $rootScope.$apply();

                await new Promise((resolve) => {
                    $rootScope.smsSend = (event) => {
                        let parent = event.target.parentElement;
                        let phoneInput = parent.querySelector('#phone');
                        client.smsSend(phoneInput.value);
                    }
                    $rootScope.smsValidate = (event) => {
                        let parent = event.target.parentElement;
                        let phoneInput = parent.querySelector('#phone');
                        let codeInput = parent.querySelector('#code');
                        client.smsValidate(phoneInput.value, codeInput.value).then(() => {
                            resolve();
                        });
                    }    
                });

                // Phone validated now. Hide validate form.
                $rootScope.validated = true;
                $rootScope.$apply();
            }

            // Load current user profile.
            let user = await client.profile();
            $rootScope.user = user;
            $rootScope.$apply();

            // Send GEO location from settings or location services.
            let location = null;
            if (settings.geolocation) {
                try {
                    location = await Geo.position();
                } catch (e) {
                    // Can be rejected by user.
                }
            } else if (settings.geolat && settings.geolon) {
                location = [settings.geolat, settings.geolon];
            }

            if (location) {
                await client.ping(location[0], location[1]);
            } else {
                // Need to reload page when location settings changes.
                $rootScope.located = false;
                $rootScope.$apply();
            }

            // Export client for DevTools debug.
            window.client = client;

            // Set ready state if all prerequirements passed.
            $rootScope.loaded = $rootScope.validated && $rootScope.located;
            $rootScope.$apply();
        }

        // Good luck!
        bootstrap().catch((e) => console.error(e));
    });
})(App, window);
