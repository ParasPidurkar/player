
import mouseListeners from "../mouseListeners.js";
import Notification from "../utils/notification.js";
import debugOverlay from "../ui/debugOverlay.js";
import analyticsOverlay from "./analyticsOverlay.js";
import navigation from "./navigationArrows.js";
import Input from "../input.js";
import tracksSection from "./tracksSection.js";
import playbackSpeed from "./playbackSpeed.js"
import tracksRepresentationSelection from "./tracksRepresentationSelection.js";
import Stream from "../streams/stream.js"
import alertDialog from "./alertDialog.js";

const closeControls = () => {
    if (playbackControl.timer) {
        clearTimeout(playbackControl.timer);
    }
    $("#commandWrapper").css("display", "none");
    Input.setActiveComponent(navigation);
};
const resetTimer = () => {
    clearTimeout(playbackControl.timer);
    playbackControl.timer = setTimeout(closeControls, 10000);
};


let playbackControl = {

    name: "playbackControl",
    idleTimer: null,
    isShown: false,
    isPaused: false,
    playerHandler: null,
    timer: null,

    Show() {
        let currentCommandSelected = $('#commandWrapper').find('.selected');
        if (!currentCommandSelected.length || currentCommandSelected.hasClass("initial-player-action-state")) {
            currentCommandSelected.removeClass("selected");
            if (this.playerHandler.isVod()) {
                $("#playPause").addClass("selected");
            } else {
                $("#settingsMenu").addClass("selected");
            }
        }
        $("#commandWrapper").css("display", "block");
        $("#commandWrapper").removeClass("inactive");
        let contentListShowButton = $("#commandWrapper").get(0);
        let newLine = document.createElement("BR");
        contentListShowButton.appendChild(newLine);
        Input.setActiveComponent(this);
        if ($("#commandWrapper").css("display", "block")) {
            $("#playbackControlsButton").css("display", "none");
            $("#playbackControlsParagraph").css("display", "none");
            $("#contentListParagraph").css("display", "none");
            $("#contentListButton").css("display", "none");
            $("#playCustomStreamButton").css("display", "none");
            $("#playCustomStreamParagraph").css("display", "none");
            navigation.hide();
        }


        $("#commandWrapper").on("mousemove", resetTimer);
        $(document).on("keydown", resetTimer);

        resetTimer();
    },

    Hide() {
        $("#commandWrapper").css("display", "none");
        $("#commandWrapper").addClass("inactive");
        clearTimeout(this.idleTimer);
        this.isShown = false;
        if (!alertDialog.isShown) {
            // set active component only if error dialog is not displayed
            Input.setActiveComponent(navigation);
        }
        closeControls();
    },

    toggleListener(time) {
        clearTimeout(this.idleTimer);
        if (this.isShown === false) {
            this.isShown = true;
            Input.setActiveComponent(this);
        }
        this.idleState = false;
        let _this = this;
        this.idleTimer = setTimeout(function () {
            $("#commandWrapper").addClass("inactive");
            _this.isShown = false;
            _this.Hide();
        }, time);
    },

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            $("#playPause").removeClass("play");
            $("#playPause").addClass("pause");
        } else {
            $("#playPause").removeClass("pause");
            $("#playPause").addClass("play");
        }
    },

    registerActions(playerHandler) {
        this.playerHandler = playerHandler;
        this.playerHandler.registerStateCallback(this.onPlayerStateChanged);
        $("#playPause").click(function () { playerHandler.pauseResume() });
        $("#rewind").click(function () { playerHandler.jumpBackward() });
        $("#fastForward").click(function () { playerHandler.jumpForward() });
        $("#volumeUpButton").click(function () { playerHandler.volumeUp() });
        $("#volumeDownButton").click(function () { playerHandler.volumeDown() });
        $("#trackSelection").click(function () {
            playbackControl.Hide();
            tracksSection.selectTrack(playerHandler);
            debugOverlay.hide();
            analyticsOverlay.hide();
            navigation.hide();
        });
        $("#playbackSpeed").click(function () {
            if (playerHandler.isVod()) {
                if (window.webOS) {
                    Notification.turnOnNotification(3000, 'Not supported on platform');

                } else {
                    playbackControl.Hide();
                    playbackSpeed.Show();
                    debugOverlay.hide();
                    analyticsOverlay.hide();
                    navigation.hide();
                }
            }
        });
        $("#bitRate").click(function () {
            playbackControl.Hide();
            tracksRepresentationSelection.selectRepresentation(playerHandler);
            navigation.hide();
            Input.setActiveComponent(tracksRepresentationSelection);
        });
        $("#tracksRepresentationButtonMenu").click(tracksRepresentationSelection.setAbrManagementCallback);
        $("#next").click(function () {
            if ($(this).hasClass("initial-player-action-state")) return;
            if (playerHandler.isVod() && (playerHandler.player.get_state() == playerHandler.player.State.playing || playerHandler.player.get_state() == playerHandler.player.State.paused)) {
                playerHandler.activateTrickMode(true);
            }
        });
        $("#previous").click(function () {
            if (playerHandler.isVod() && (playerHandler.player.get_state() == playerHandler.player.State.playing || playerHandler.player.get_state() == playerHandler.player.State.paused)) {
                playerHandler.activateTrickMode(false);
            }
        });
        let _this = this;
        $("#loop").click(function () {
            if (playerHandler.isVod()) {
                if (playerHandler.loopEnabled && (playerHandler.player.get_state() == playerHandler.player.State.playing || playerHandler.player.get_state() == playerHandler.player.State.paused)) {
                    $("#loop").removeClass('active');
                    playerHandler.loopEnabled = false;
                    localStorage.setItem("loopEnabled", "false");
                } else {
                    $("#loop").addClass('active');
                    playerHandler.loopEnabled = true;
                    localStorage.setItem("loopEnabled", "true");
                }
            }
        });
        $("#restart").click(function () {
            if (playerHandler.isVod()) {
                _this.setBitrateToLocalStorage();
                playerHandler.restartVideo();
            }
        });
        $("#goToLive").click(function () {
            if (!playerHandler.isVod()) {
                playerHandler.goToLive();
            }
        })
        $('#settingsTracksDiv').click(function (event) {
            navigation.hide();
        })
    },

    retainLoopIconStateIfAppRestarted() {
        let loopEnabled = localStorage.getItem("loopEnabled");
        if (loopEnabled === "true") {
            this.playerHandler.loopEnabled = true;
            $("#loop").addClass('active');
        } else {
            this.playerHandler.loopEnabled = false;
            $("#loop").removeClass('active');
        }
    },

    setBitrateToLocalStorage() { // set bitrate of current repr. to localStorage
        if (localStorage.getItem('currentReprBitrate') === '0') {
            localStorage.removeItem('currentReprBitrate')
            return;
        }
        const currentReprBitrate = this.playerHandler.player?.get_current_representation()?.bitrate;
        localStorage.setItem('currentReprBitrate', currentReprBitrate);
    },

    resetButtonsState() {
        let playerActions = $.map($('#commandContainer button'), button => button.id);
        playerActions.forEach(function (element) {
            $('#' + element).removeClass('initial-player-action-state').addClass('highlight-player-action');
        });
    },

    activateButtons() {
        this.resetButtonsState();
        $.each($('#commandContainer button'), function () {
            $(this).removeClass('initial-player-action-state').addClass('highlight-player-action');
        });
    },
    activateButtons() {
        this.resetButtonsState();
        // If video was paused and user went back to menu to play another video, restart this.isPaused and replace play with pause
        if ($('#playPause').length > 0) {
            this.isPaused = false;
            $("#playPause").removeClass("pause");
            $("#playPause").addClass("play");
        }
        if (!this.playerHandler.isVod()) {
            $("#loop").removeClass('highlight-player-action');
            $("#loop").addClass('initial-player-action-state');
            $("#restart").removeClass('highlight-player-action');
            $("#restart").addClass('initial-player-action-state');
            $("#playbackSpeed").removeClass('highlight-player-action');
            $("#playbackSpeed").addClass('initial-player-action-state');
            $("#next").removeClass('highlight-player-action');
            $("#next").addClass('initial-player-action-state');
            $("#previous").removeClass('highlight-player-action');
            $("#previous").addClass('initial-player-action-state');
        }
        //this.setTrickModeForPlaybackSpeed(!this.playerHandler.isSpeedNormal());
    },

    setTrickMode(enabled) {
        $("#playPause").addClass("selected");
        $("#next").removeClass("selected");
        $("#previous").removeClass("selected");
        $("#playbackSpeed").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#playbackSpeed").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#fastForward").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#fastForward").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#next").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#next").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#previous").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#previous").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#rewind").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#rewind").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#trackSelection").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#trackSelection").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#bitRate").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#bitRate").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#loop").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#loop").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        if (enabled) {
            $("#playPause").removeClass("play");
            $("#playPause").addClass("pause");
        } else {
            $("#playPause").removeClass("pause");
            $("#playPause").addClass("play");
        }
    },
    setTrickModeForPlaybackSpeed(enabled) {
        $("#fastForward").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#fastForward").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#next").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#next").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#previous").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#previous").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#rewind").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#rewind").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#trackSelection").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#trackSelection").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');
        $("#bitRate").removeClass(enabled ? 'highlight-player-action' : 'initial-player-action-state');
        $("#bitRate").addClass(enabled ? 'initial-player-action-state' : 'highlight-player-action');

    },
    onPlayerStateChanged({ newState }) {
        switch (newState) {
            case 'playing':
                $("#playPause").removeClass('pause');
                $("#playPause").addClass('play');
                break;
            case 'stopped':
            case 'paused':
                $("#playPause").removeClass('play');
                $("#playPause").addClass('pause');
                break;
            default:
                break;
        }
    },
    ok() {
        if ($('#commandContainer').css('display') == 'none') {
            return;
        }
        $('#commandContainer .selected').trigger('click');
    },

    exit() {
        this.Hide();
    },
    play() {
        if (this.playerHandler.isVod()) {
            this.playerHandler.play();

            return;
        }
        return;
    },
    pause() {
        if (this.playerHandler.isVod()) {
            this.playerHandler.pause();
            return;
        }
        return;
    },
    pauseResume() {
        if (this.playerHandler.isVod()) {
            this.playerHandler.pauseResume();
            return;
        }
        return;
    },
    forward() {
        if (this.playerHandler.isVod() &&
            (this.playerHandler.player.get_state() == this.playerHandler.player.State.playing ||
                this.playerHandler.player.get_state() == this.playerHandler.player.State.paused)) {
            this.playerHandler.activateTrickMode(true);
        }
        return;
    },
    stop() {
        this.playerHandler.stop();
        return;
    },
    rewind() {
        if (this.playerHandler.isVod() &&
            (this.playerHandler.player.get_state() == this.playerHandler.player.State.playing ||
                this.playerHandler.player.get_state() == this.playerHandler.player.State.paused)) {
            this.playerHandler.activateTrickMode(false);
        }
        return;
    },

    down() {
        return;
    },

    right() {
        if ($('#commandWrapper').css('display') == 'none') {
            return;
        }
        if ($('#commandWrapper').css('display') == 'block') {
            let currentCommand = $('#commandWrapper').find('.selected');

            if (currentCommand.next().length > 0 && currentCommand.next().hasClass('highlight-player-action')) {
                currentCommand.removeClass('selected').next().addClass('selected');
            } else if (currentCommand.parent().next().children('.highlight-player-action').length > 0) {
                currentCommand.removeClass('selected').parent().next().children('.highlight-player-action').first().addClass('selected')
            } else if (currentCommand.parent().next().next().children('.highlight-player-action').length > 0) {
                currentCommand.removeClass('selected')
                    .parent()
                    .next()
                    .next()
                    .children('.highlight-player-action')
                    .first()
                    .addClass('selected');
            }
        }
    },

    left() {
        if ($('#commandWrapper').css('display') == 'none') {
            return;
        }
        if ($('#commandWrapper').css('display') == 'block') {
            let currentCommand = $('#commandWrapper').find('.selected');

            if (currentCommand.prev().length > 0 && currentCommand.prev().hasClass('highlight-player-action')) {
                currentCommand.removeClass('selected').prev().addClass('selected');
            } else if (currentCommand.parent().prev().children('.highlight-player-action').length > 0) {
                currentCommand.removeClass('selected').parent().prev().children('.highlight-player-action').last().addClass('selected')
            } else if (currentCommand.parent().prev().prev().children('.highlight-player-action').length > 0) {
                currentCommand.removeClass('selected')
                    .parent()
                    .prev()
                    .prev()
                    .children('.highlight-player-action')
                    .last()
                    .addClass('selected');
            }
        }
    },

};

export default playbackControl;