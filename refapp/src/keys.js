let keys = {
    RCUKeys: undefined,
    KeyMap: undefined
};
function registerPlatformRCUKeys() {
    if (window.tizen) {
        try {

            let supportedKeys = window.tizen.tvinputdevice.getSupportedKeys();
            if (supportedKeys) {
                let keys = supportedKeys.map((key) => {
                    return key.name;
                });
                window.tizen.tvinputdevice.registerKeyBatch(keys);
                //Leave some keys for system to handle
                let nativeKeys = ["VolumeUp", "VolumeDown", "VolumeMute", "Exit", "Source"];
                window.tizen.tvinputdevice.unregisterKeyBatch(nativeKeys);
            }
        } catch (error) {
            console.error("TizenLibsWrapper - registerRCUKeys error: " + error);
        }
    }

}
if (window.tizen) {
    registerPlatformRCUKeys();
    keys.KeyMap = {
        Red: 403,
        Green: 404,
        Yellow: 405,
        Blue: 406,

        OK: 13,
        Up: 38,
        Down: 40,
        Left: 37,
        Right: 39,
        ChannelUp: 427,
        ChannelDown: 428,

        Epg: 71,
        Back: 10009,
        Backspace: 8,

        Num0: 48,
        Num1: 49,
        Num2: 50,
        Num3: 51,
        Num4: 52,
        Num5: 53,
        Num6: 54,
        Num7: 55,
        Num8: 56,
        Num9: 57,

        PlayPause: 10252,
        Play: 415,
        Pause: 19,
        Stop: 413,
        Rewind: 412,
        Forward: 417,
        Previous: 10232,
        Next: 10233
    }

}
else if (window.webOS) {


    keys.KeyMap = {
        Red: 403,
        Green: 404,
        Yellow: 405,
        Blue: 406,

        OK: 13,
        Up: 38,
        Down: 40,
        Left: 37,
        Right: 39,
        ChannelUp: 33,
        ChannelDown: 34,

        Epg: 71,
        Back: 461,
        Backspace: 8,

        Num0: 48,
        Num1: 49,
        Num2: 50,
        Num3: 51,
        Num4: 52,
        Num5: 53,
        Num6: 54,
        Num7: 55,
        Num8: 56,
        Num9: 57,

        Play: 415,
        Pause: 19,
        Stop: 413,
        Rewind: 412,
        Forward: 417,
        // TODO Didn't have Previous and next buttons
        Previous: 10232,
        Next: 10233

    }
}
else {

    keys.KeyMap = {
        Red: 120,     // F9
        Green: 121,   // F10
        Yellow: 122,  // F11
        Blue: 123,    // F12

        OK: 13,       // Enter
        Up: 38,
        Down: 40,
        Left: 37,
        Right: 39,
        ChannelUp: 107,
        ChannelDown: 109,

        // Epg: 71,   // g TODO::remove
        // Login: 76, // TODO::remove
        // Home: 72, // TODO::remove
        // Welcome: 87, // TODO::remove
        Back: 27, // Escape
        Backspace: 8,
        // Example: 88,  // x TODO::remove
        // OnboardingTutorial: 74, //for testing purposes
        // ActorScreen: 73, //for testing purposes
        WhosWatching: 87, //for testing purposes
        NotificationAlert: 89,
        NotificationFullScreen: 85,

        Num0: 96,
        Num1: 97,
        Num2: 98,
        Num3: 99,
        Num4: 100,
        Num5: 101,
        Num6: 102,
        Num7: 103,
        Num8: 104,
        Num9: 105,

        // TODO Which values to use here?
        // my keyboard have play/pause, previous and next buttons
        Play: 179,
        Pause: 19,
        Stop: 413,
        Rewind: 412,
        Forward: 417,
        Previous: 177,
        Next: 176


    }
}

export default keys;