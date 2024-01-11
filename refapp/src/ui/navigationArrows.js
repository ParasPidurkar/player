import customStreamPicker from "./customStreamPicker.js";
import playbackControl from "./playbackControl.js";
import streamPicker from "./streamPicker.js";
import input from "../input.js"
import playerHandler from '../playerHandler.js'

let navigation = {
    name: "navigationArrows",
    isShown: false,
    idleTimer: null,
    ok() {
        this.show();
    },
    show() {
        this.toggleListener(10000);
    },
    toggleListener(time) {
        clearTimeout(this.idleTimer);
        if (this.isShown == false) {
            $("#contentList").children().show();
            $("#playCustomStream").children().show();
            $("#playbackControls").children().show();
            $("#contentList, #playCustomStream, #playbackControls").show();
            this.isShown = true;
        }
        this.idleState = false;
        let _this = this;
        this.idleTimer = setTimeout(function () {
            _this.hide();
            _this.isShown = false;
        }, time);
    },
    hide() {
        $("#contentList, #playCustomStream, #playbackControls").hide();
        this.isShown = false;
    },
    left() {
        streamPicker.Show();
    },
    up() {
        customStreamPicker.Show();
    },
    down() {
        input.setActiveComponent(playbackControl);
        playbackControl.Show();
    },
    play() {
        if (playerHandler.isVod()) {
            playerHandler.play();
            return;
        }
        return;
    },
    pause() {
        if (playerHandler.isVod()) {
            playerHandler.pause();
            return;
        }
        return;
    },
    pauseResume() {
        if (playerHandler.isVod()) {
            playerHandler.pauseResume();
            return;
        }
        return;
    },
    stop() {
        this.playerHandler.stop();
        return;
    },
    forward() {
        if (playerHandler.isVod() && (playerHandler.player.get_state() == playerHandler.player.State.playing || playerHandler.player.get_state() == playerHandler.player.State.paused)) {
            playerHandler.activateTrickMode(true);
            playbackControl.Show();
        }
        return;
    },
    rewind() {
        if (playerHandler.isVod() && (playerHandler.player.get_state() == playerHandler.player.State.playing || playerHandler.player.get_state() == playerHandler.player.State.paused)) {
            playerHandler.activateTrickMode(false);
            playbackControl.Show();
        }
        return;
    },

    exit() {
        if (!this.isShown) {
            if (window.webOS) {
                window.webOS.platformBack();
                return;
            }
        }
        this.hide();
    }

};

export default navigation;