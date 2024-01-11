"use strict";
import keys from "./keys.js";
import navigation from "./ui/navigationArrows.js";
import streamListDialog from "./ui/streamListDialog.js";
import exitPopup from "./ui/exitPopup.js";

let Input = {
    activeComponent: navigation,
    componentHistory: [navigation],
    registerEventListener: () => {

        document.addEventListener("keydown", (e) => {
            keysQueue.enqueue(e.key);
            if ((window.tizen || window.webos) && Input.isKeyDownKey(e.keyCode)) {
                e.preventDefault();

            }
            else if ((e.key.toLowerCase() == 'l' && e.ctrlKey && e.altKey)
                || keysQueue.equals(['7', '8', '9'])) {
                e.preventDefault();
                streamListDialog.show();
            }

        }, false);

    },

    setActiveComponent(component) {
        if (component.name != this.activeComponent.name)
        {
            this.componentHistory.push(this.activeComponent);
            if (this.componentHistory.length > 5) {
                this.componentHistory.shift();
            }

            this.activeComponent = component;
        }
    },

    backToPrevious() {
        this.activeComponent = this.componentHistory.pop();
    },

    isKeyDownKey(key) {
        switch (key) {
            case keys.KeyMap.ESC:
            case keys.KeyMap.SamsungReturn:
            case keys.KeyMap.Back:
                if (this.activeComponent.exit) {
                    if (window.webOS || window.tizen) {
                        if (this.activeComponent.name == 'navigationArrows') {
                            if (this.activeComponent.isShown == false) {
                                exitPopup.show();
                                return true;
                            }
                        }
                    }
                    this.activeComponent.exit();
                    return true;
                }
                break;
            case keys.KeyMap.OK:
                if (this.activeComponent.ok) {
                    this.activeComponent.ok();
                    return true;
                }
                break;
            case keys.KeyMap.F12:
                break;
            case keys.KeyMap.Up:
                if (this.activeComponent.up) {
                    this.activeComponent.up();
                    if (this.activeComponent.scrollOnArrowUp) {
                        this.activeComponent.scrollOnArrowUp();
                    }
                    return true;
                }
                break;
            case keys.KeyMap.Down:
                if (this.activeComponent.down) {
                    this.activeComponent.down();
                    if (this.activeComponent.scrollOnArrowDown) {
                        this.activeComponent.scrollOnArrowDown();
                    }
                    return true;
                }
                break;
            case keys.KeyMap.Left:
                if (this.activeComponent.left) {
                    this.activeComponent.left();
                    return true;
                }
                break;
            case keys.KeyMap.Right:
                if (this.activeComponent.right) {
                    this.activeComponent.right();
                    return true;
                }
                break;
            case keys.KeyMap.Play:
                if (this.activeComponent.play) {
                    this.activeComponent.play();
                    return true;
                }
                break;
            case keys.KeyMap.Pause:
                if (this.activeComponent.pause) {
                    this.activeComponent.pause();
                    return true;
                }
                break;
            case keys.KeyMap.PlayPause:
                if (this.activeComponent.pauseResume) {
                    this.activeComponent.pauseResume();
                    return true;
                }
                break;
            case keys.KeyMap.Stop:
                if (this.activeComponent.forward) {
                    this.activeComponent.stop();
                    return true;
                }
                break;
            case keys.KeyMap.Forward:
                if (this.activeComponent.forward) {
                    this.activeComponent.forward();
                    return true;
                }
                break;
            case keys.KeyMap.Rewind:
                if (this.activeComponent.rewind) {
                    this.activeComponent.rewind();
                    return true;
                }
                break;
            case keys.KeyMap.Info:
                return true;
            default:
                return false;
        }
    },

};

let keysQueue = {
    queue: [],

    enqueue(key) {
        if (this.queue.length < 3) {
            this.queue.push(key);
        } else {
            this.queue.shift()
            this.queue.push(key);
        }
    },

    equals(a) {
        return Array.isArray(a) &&
            Array.isArray(this.queue) &&
            a.length === this.queue.length &&
            a.every((val, index) => val === this.queue[index]);
    }
};



export default Input;
