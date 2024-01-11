"use strict";

import keys from "./keys.js"
import Input from "./input.js"


let keyHandlers = {
    showContentList: () => {

    },

    channelUp: () => {

    },

    channelDown: () => {

    },

    info: () => {
    },

    exit: () => {

    },

    handleKey: (key, isManuallyTriggered = false, eventType = null) => {
        if (Input.isLocked && !isManuallyTriggered) {
            return true;
        }

        if (Input.currentFocus && PermanentInformations.isCreated) {
            if (PermanentInformations.getCustomPermanentInformationFocusState() &&
                PermanentInformations.handleKeyPress(keyCode)) {
                return true;
            }
        }

        if (Input.currentFocus && Input.currentFocus.handleKeyPress(keyCode)) {
            PermanentInformations.togglePermanentInfo();
            return true;
        }


        // keyhandling
        switch (key) {
            case keys.KeyMap.OK:
            case keys.KeyMap.F10:
            case keys.KeyMap.Play:
            case keys.KeyMap.Pause:
            case keys.KeyMap.PlayPause:
            case keys.KeyMap.Forward:
            case keys.KeyMap.Rewind:
            case keys.KeyMap.Stop:
            case keys.KeyMap.Right:
            case keys.KeyMap.Left:
                break;
            case keys.KeyMap.Up:
                if (config.platform.getPlatformType() !== platformConstants.PLATFORM_TYPE.WEBOS) {
                }
                break;
            case keys.KeyMap.ChannelUp:
                break;
            case keys.KeyMap.Down:
                if (config.platform.getPlatformType() !== platformConstants.PLATFORM_TYPE.WEBOS) {
                }
                break;
            case keys.KeyMap.ChannelDown:
                keyHandlers.channelDown();
                break;
            default:
                break;
        }

        return true;
    },

    handleClickTraversableList: (event, that, compName, callback) => {

    },

    handleTraversableListWheel: (event, that, compName) => {

    },

    handleOnHover: (event, that, compName, callback, stopEvent = true) => {
        if (stopEvent) {
            event.preventDefault();
            event.stopPropagation();
        }

        let list = that.components.getComponentByClassName(compName);
        list.stopScrollText();
        that.selectComponentByClassName(compName);

        if (callback && typeof callback === "function") {
            callback();
        }
    },

    handleClickOnSelected: (event, that) => {
        event.preventDefault();
        event.stopPropagation();
        that.ok();
    },

    handleOnWheelX: (event, that, compName, callback) => {

    },

    handleOnWheelY: (event, that, compName) => {

    },


    detectHeaderSelectableItem: (className) => {

    },

    handleHeaderOnHover: (event, that) => {

    }
};

export default keyHandlers;
