"use strict";

import Input from "./input.js";
import StreamList from "./streams/streamList.js";
import playerHandler from "./playerHandler.js"
import Settings from "./settings.js";
import debugOverlay from "./ui/debugOverlay.js";
import { LogLevel, Log } from "./utils/logs.js"
import mouseListeners from "./mouseListeners.js"
import analyticsOverlay from "./ui/analyticsOverlay.js";

let Init = {

    init() {
        Log.setLogLevel(LogLevel.Debug);
        StreamList.start();
        Settings.start();
        mouseListeners.disableMouseOnWebOS();
        playerHandler.start();
        debugOverlay.launch();
        analyticsOverlay.launch();

        Input.registerEventListener();
    },

}

export default Init;