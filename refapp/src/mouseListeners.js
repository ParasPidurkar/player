"use strict";

import playerHandler from "./playerHandler.js";
import playbackControl from "./ui/playbackControl.js";
import streamPicker from "./ui/streamPicker.js";
import customStreamPicker from "./ui/customStreamPicker.js";
import Settings from "./settings.js";
import debugOverlay from "./ui/debugOverlay.js"
import analyticsOverlay from "./ui/analyticsOverlay.js";
import navigation from "./ui/navigationArrows.js";
import tracksSection from "./ui/tracksSection.js";
import playbackSpeed from "./ui/playbackSpeed.js"
import tracksRepresentationSelection from "./ui/tracksRepresentationSelection.js";
import Input from "./input.js";


let mouseListeners = {
    playerHandler: null,
    mouseDisabled: false,
    nanosec: 1e9,
    start(playerHandler) {
        this.playerHandler = playerHandler;
        this.registerMouseMove();
        this.registerMouseUp();
        navigation.hide();
    },


    toggleListener(time) {
        clearTimeout(this.idleTimer);
        this.idleState = false;
        this.idleTimer = setTimeout(function () {
            navigation.hide();
        }, time);
    },

    registerMouseMove() {
        let mouseDisabled = this.mouseDisabled;
        $(window).mousemove(function () {
            if (!Settings.isOpen() && mouseDisabled == false) {
                if (playbackControl.isShown) {
                    playbackControl.toggleListener(10000);
                }

                if (!navigation.isShown &&
                    !streamPicker.isShown() &&
                    !playbackControl.isShown &&
                    !customStreamPicker.isVisible()) {
                    mouseListeners.toggleListener(10000);
                }
            }
        });
    },

    disableMouseOnWebOS() {
        if (window.webOS) {
            $('body')[0].style.pointerEvents = "none";
            this.mouseDisabled = true;
        }
    },

    registerMouseUp() {
        //hide playback controls on background click
        let mouseDisabled = this.mouseDisabled;
        $(window).mouseup(function (event) {
            if (event.target.id == "abrDialogWrapper") { return; }
            let commandContainer = $('#commandContainer');
            let commandWrapper = $('#commandWrapper');
            if ($("#contentListWrapper").get(0).style.display == "none" &&
                !commandWrapper.find("*").toArray().includes($(event.target).get(0)) &&
                !$("#trickModeBox").find("*").toArray().includes($(event.target).get(0)) &&
                !$("#liveEdgeBox").find("*").toArray().includes($(event.target).get(0)) &&
                !$("#vodOffsetBox").find("*").toArray().includes($(event.target).get(0)) &&
                !tracksRepresentationSelection.isShown() && mouseDisabled == false &&
                !customStreamPicker.isVisible()) {
                navigation.show();
                playbackControl.Hide();
                //Playback Speed dialog on click
                if ($("#speedControlDiv").get(0).style.display == "block") {
                    if (!playbackSpeed.isPlaybackSpeed(event.target)) {
                        playbackSpeed.hide();
                        if (debugOverlay.isInitalized) {
                            debugOverlay.show();
                        }
                        if (analyticsOverlay.isShown) {
                            analyticsOverlay.show();
                        }
                    } else {
                        playbackSpeed.ok(event.target);
                    }
                }
                //Close the open dialog on background click
                if (Settings.subComponent != null && $(Settings.subComponent).get(0) != undefined) {
                    if (Settings.subComponent != null && !Settings.isSubComponentBox(event.target, Settings.subComponent.name)) {
                        Settings.subComponent.exit();
                        Settings.subComponent = null;
                        playbackControl.Show();
                        $('#playPause').removeClass('selected');
                        $('#settingsMenu').addClass('selected');
                        if (debugOverlay.isInitalized) {
                            debugOverlay.show();
                        }
                        if (analyticsOverlay.isShown) {
                            analyticsOverlay.show();
                        }
                    }
                }
            }
            if (event.target.parentNode == commandContainer.get(0)) {
                playbackControl.toggleListener(9000);
            }
        });

        // On mouse click - open Settings dialog
        $("#settingsMenu").click(function () {
            playbackControl.Hide();
            Settings.settingsPop(playerHandler);
        });
        //Close ABR management box on background click
        $("#settingsTracksRepresentationDiv").click(function () {
            tracksRepresentationSelection.closeAbrBox();
        });

        // Mouse click listeners regarding navigation arrows
        $("#contentListButton").click(function () { streamPicker.Show() });
        $("#playCustomStreamButton, .playCustomStreamBtn").click(function () {
            streamPicker.Hide();
            customStreamPicker.Show();
        });
        $("#playbackControlsButton").click(function () { playbackControl.Show() });

        //Button for closing stream list
        $(".closeStreamListBtn").click(function () {
            $(this).hide();
            streamPicker.Hide();
            $(".playCustomStreamBtn").hide();
        });

        //Track selection buttons
        $("#tracksButtonCancel").click(function () {
            tracksSection.exit();
        });
        $("#tracksButtonOk").click(function () {
            tracksSection.tracksSelectionButtonOk();
            tracksSection.exit();
        });
        //Abr management buttons
        $("#abrManagementButtonStart").click(function () {
            if (tracksRepresentationSelection.subComponent) {
                tracksRepresentationSelection.subComponent.start();
            }
        });
        $("#abrManagementButtonMin").click(function () {
            if (tracksRepresentationSelection.subComponent) {
                tracksRepresentationSelection.subComponent.min();
            }
        });
        $("#abrManagementButtonMax").click(function () {
            if (tracksRepresentationSelection.subComponent) {
                tracksRepresentationSelection.subComponent.max();
            }
        });
        $("#abrManagementButtonReset").click(function () {
            if (tracksRepresentationSelection.subComponent) {
                tracksRepresentationSelection.subComponent.reset();
            }
        });
        //Track representation selection buttons
        $("#tracksRepresentationButtonCancel").click(function () {
            tracksRepresentationSelection.buttonCancel();

        });
        $("#tracksRepresentationButtonOk").click(function () {
            tracksRepresentationSelection.buttonOk();

        });
        //hide custom stream list on background click
        $(window).mouseup(function (event) {
            if ((this.mouseDisabled == false && event.target != customStreamWrapper &&
                event.target.parentNode != customStreamWrapper) &&
                event.target.parentNode.parentNode != customStreamWrapper) {
                customStreamPicker.Hide();
                $("#contentList").children().show();
                $("#playCustomStream").children().show();
                $("#playbackControls").children().show();
            }
        });
        $("#commandContainer, #slider, #timeContainer, #volumeUpButton, #volumeDownButton").click(function () {
            navigation.hide();
        })

        $("#settingsTracksHeader").click(function () {
            navigation.hide();
        })

        // Slider mouseup events
        $(".content li").mouseup(function () { playerHandler.seek(document.getElementById("slider").value * mouseListeners.nanosec) });


        $(".slider").mouseup(function () {
            playerHandler.seek(document.getElementById("slider").value * mouseListeners.nanosec);
        });
    },
}

export default mouseListeners;