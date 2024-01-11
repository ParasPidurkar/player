import Input from "../input.js";
import navigation from "./navigationArrows.js";
import playbackControl from "./playbackControl.js";
import debugOverlay from "./debugOverlay.js";
import analyticsOverlay from "./analyticsOverlay.js";
import playerHandler from "../playerHandler.js";
import { Log } from "../utils/logs.js"

let tracksSection = {

    name: "tracksSection",
    videoTrackMenu: $("#videoTrackDiv ul"),
    audioTrackMenu: $("#audioTrackDiv ul"),
    subsTrackMenu: $("#subsTrackDiv ul"),
    selectTrackId: null,

    Show() {
        document.getElementById("trackVideo").click();
        $('#videoTrackDiv').css('max-height', '112vw');
        $('#settingsTracksDiv').find('.selected').removeClass('selected');
        $("#settingsTracksDiv").show();
        $("#settingsTracksBackgroundDiv").show();
        $("#settingsTracksHeader").show();
        Input.setActiveComponent(this);
        if ($('#settingsTracksDiv').css('display') == 'block') {
            navigation.hide();
        }
    },

    Hide() {
        $('#settingsTracksDiv').hide();
        $("#settingsTracksBackgroundDiv").hide();
        $("#settingsTracksHeader").hide();
        this.clearTrackData(playerHandler.player.Media_type.audio, playerHandler);
        this.clearTrackData(playerHandler.player.Media_type.video, playerHandler);
        this.clearTrackData(playerHandler.player.Media_type.subtitle, playerHandler);
        playbackControl.Show();
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    selectTrack(playerHandler) {
        if (playerHandler.player.get_state() == playerHandler.player.State.playing ||
            playerHandler.player.get_state() == playerHandler.player.State.paused) {
            this.fillTrackData(playerHandler.player.Media_type.audio, playerHandler);
            this.fillTrackData(playerHandler.player.Media_type.video, playerHandler);
            this.fillTrackData(playerHandler.player.Media_type.subtitle, playerHandler);
            this.Show();
        }
        navigation.hide();
    },

    clearTrackData(mediaType, playerHandler) {
        let trackMenu = null;
        let trackButton = null;
        let isActive = false;
        switch (mediaType) {
            case playerHandler.player.Media_type.audio:
                trackButton = $("#trackAudio")[0];
                isActive = trackButton.classList.contains("active");
                trackMenu = this.audioTrackMenu[0];
                break;
            case playerHandler.player.Media_type.video:
                trackButton = $("#trackVideo")[0];
                isActive = trackButton.classList.contains("active");
                trackMenu = this.videoTrackMenu[0];
                break;
            case playerHandler.player.Media_type.subtitle:
                trackButton = $("#trackTitle")[0];
                isActive = trackButton.classList.contains("active");
                trackMenu = this.subsTrackMenu[0];
                break;
        }
        if (isActive) {
            trackButton.classList.toggle("active");
            trackMenu.parentNode.style.maxHeight = null;
        }
        while (trackMenu.firstChild) {
            trackMenu.removeChild(trackMenu.firstChild);
        }
    },

    async fillTrackData(mediaType, playerHandler) {
        let tracks = await playerHandler.getAvailableTracks(mediaType);
        let typeStr = '';
        let trackMenu = null;
        switch (mediaType) {
            case playerHandler.player.Media_type.audio:
                typeStr = 'audio';
                trackMenu = this.audioTrackMenu;
                break;
            case playerHandler.player.Media_type.video:
                typeStr = 'video';
                trackMenu = this.videoTrackMenu;
                break;
            case playerHandler.player.Media_type.subtitle:
                typeStr = 'subtitle';
                trackMenu = this.subsTrackMenu;
                break;
        }
        if (tracks.length == 0) {
            let li = document.createElement("li");
            let button = document.createElement("button");
            button.classList.add("contentButton");
            button.innerHTML = "No options available";
            li.appendChild(button);
            trackMenu[0].appendChild(li);
        } else {
            for (let i = 0; i < tracks.length; i++) {
                let value = tracks[i].Get_Human_Readable_String();
                let li = document.createElement("li");
                let button = document.createElement("button");
                button.classList.add("contentButton");
                let p = document.createElement("p");
                p.innerText = value;
                button.appendChild(p);
                let input = document.createElement("INPUT");
                input.type = "radio";
                input.checked = tracks[i].open;
                input.name = typeStr;
                input.id = typeStr + "_" + i;
                input.onclick = function () {
                    if (!this.checked) {
                        this.checked = true;
                    }
                };
                button.addEventListener("click", function () {
                    this.childNodes[1].checked = !this.childNodes[1].checked;
                });
                input.value = value;
                button.appendChild(input);
                li.appendChild(button);
                trackMenu[0].appendChild(li);
            }
        }
    },

    applySelectTracks(typeStr, mediaType, playerHandler) {
        let activeTrackIndex = -1;
        let trackEl = document.getElementsByName(typeStr);
        for (let i = 0; i < trackEl.length; i++) {
            if (trackEl[i].checked) {
                activeTrackIndex = i;
            }
        }
        if (activeTrackIndex > -1) {
            playerHandler.getAvailableTracks(mediaType)
                .then((availableTracks) => {
                    this.selectTrackId = availableTracks[activeTrackIndex].id;
                    let currentActiveId = undefined;
                    if (playerHandler.getOpenMediaPaths(mediaType).length) {
                        currentActiveId = playerHandler.getOpenMediaPaths(mediaType)[0].id;
                    }
                    if (this.selectTrackId != currentActiveId && mediaType != playerHandler.player.Media_type.video) {
                        playerHandler.openMediaPath(this.selectTrackId, { type: mediaType, index: activeTrackIndex });
                        Log.debug("Closing " + typeStr + " track with id [" + currentActiveId + "]");
                        Log.debug("Opening " + typeStr + " track with id [" + this.selectTrackId + "]");
                    }
                });
        }
    },

    tracksSelectionButtonOk() {
        let subtitleCheckedElement = $('#subsTrackDiv input[name="subtitle"]');
        this.applySelectTracks('audio', playerHandler.player.Media_type.audio, playerHandler);
        this.applySelectTracks('video', playerHandler.player.Media_type.video, playerHandler);
        if (subtitleCheckedElement.is(':checked')) {
            this.applySelectTracks('subtitle', playerHandler.player.Media_type.subtitle, playerHandler);
        } else {
            playerHandler.closeMediaPath(this.selectTrackId);
            this.clearTrackData(playerHandler.player.Media_type.subtitle, playerHandler);
        }
        this.Hide();
    },

    down() {
        if ($('#tracksButtonOk').hasClass('selected') || $('#tracksButtonCancel').hasClass('selected')) {
            return;
        }
        if ($('#tracksContainer').css('display') == 'none') {
            return;
        }
        let selectedElement = $('#tracksContainer').find('.selected');
        if (selectedElement.length == 0) {
            selectedElement = $('#tracksContainer > .collapsible').first().addClass('selected');
            return;
        }

        if (selectedElement.hasClass('active') || selectedElement.hasClass('contentButton')) {
            tracksSection.selectNextTracksSubComponent(selectedElement);
        } else {
            tracksSection.selectNextTracksComponent(selectedElement);
        }
    },

    selectNextTracksComponent(selectedElement) {
        if (selectedElement.nextAll('button:first').length > 0) {
            selectedElement.removeClass('selected').nextAll('button:first').addClass('selected');
        } else {
            selectedElement.removeClass('selected').parent().next().find('button:first').addClass('selected');
        }
    },

    selectNextTracksSubComponent(selectedElement) {
        if (!selectedElement.hasClass('contentButton')) {
            selectedElement.removeClass('selected').next().find("button:first").addClass('selected');
        } else if (selectedElement.parent().next().find("button:first").length > 0) {
            selectedElement.removeClass('selected').parent().next().find("button:first").addClass('selected')
        } else if (selectedElement.parent().closest('div').next().length > 0) {
            selectedElement.removeClass('selected').parent().closest('div').next().addClass('selected');
        } else if (selectedElement.nextAll('button:first').length == 0) {
            selectedElement.removeClass('selected').parent().parents('div').next().find('button:first').addClass('selected');
        }
    },

    up() {
        $('#tracksButtonOk').removeClass('selected');
        $('#tracksButtonCancel').removeClass('selected');
        if ($('#tracksContainer').css('display') == 'none') {
            return;
        }
        let selectedElement = $('#tracksContainer').find('.selected');
        if (selectedElement.length == 0) {
            if ($('#tracksContainer > .collapsible').last().hasClass('active')) {
                selectedElement = $('.contentButton').last().addClass('selected');
            } else {
                selectedElement = $('#tracksContainer > .collapsible').last().addClass('selected');
            }
            return;
        }
        if (selectedElement.hasClass('contentButton') || selectedElement.prevAll('button:first').hasClass('active')) {
            tracksSection.selectPreviousTracksSubComponent(selectedElement);
        } else {
            tracksSection.selectPreviousTracksComponent(selectedElement);
        }
    },

    selectPreviousTracksComponent(selectedElement) {
        if (selectedElement.prevAll('button:first').length > 0) {
            selectedElement.removeClass('selected').prevAll('button:first').addClass('selected');
        }
    },

    selectPreviousTracksSubComponent(selectedElement) {
        if (!selectedElement.hasClass('contentButton')) {
            selectedElement.removeClass('selected').prev().find("button:last").addClass('selected');
        } else if (selectedElement.parent().prev().find("button:first").length > 0) {
            selectedElement.removeClass('selected').parent().prev().find("button:first").addClass('selected')
        } else if (selectedElement.parent().closest('div').prev().length > 0) {
            selectedElement.removeClass('selected').parent().closest('div').prev().addClass('selected');
        }
    },

    ok() {
        if ($('#settingsTracksDiv').css('display') == 'none') {
            return;
        }
        $('#settingsTracksDiv .selected').trigger('click');
    },

    exit() {
        this.Hide();
        Input.setActiveComponent(playbackControl);
    },

    right() {
        if ($('#tracksContainer button').hasClass('selected')) {
            return;
        }
        $('#tracksButtonOk').removeClass('selected');
        $('#tracksButtonCancel').addClass('selected');
    },

    left() {
        if ($('#tracksContainer button').hasClass('selected')) {
            return;
        }
        $('#tracksButtonCancel').removeClass('selected');
        $('#tracksButtonOk').addClass('selected');
    },

    scrollOnArrowDown() {
        let selectedElement = $('#tracksContainer').find('.selected');

        if (selectedElement.length == 0) {
            return;
        }
        // Element’s Position Relative to the BrowserWindow
        let elementPosition = selectedElement[0].getBoundingClientRect();
        let elementOffsetHeight = selectedElement[0].offsetHeight * (selectedElement.hasClass('collapsible') ? 1.3 : 1.2);

        if (elementPosition.bottom > $("#tracksContainer").height()) {
            $("#tracksContainer").scrollTop($("#tracksContainer").scrollTop() + elementOffsetHeight);
        }
    },

    scrollOnArrowUp() {
        let selectedElement = $('#tracksContainer').find('.selected');

        if (selectedElement.length == 0) {
            return;
        }
        // Element’s Position Relative to the BrowserWindow
        let elementPosition = selectedElement[0].getBoundingClientRect();
        let elementOffsetHeight = selectedElement[0].offsetHeight * (selectedElement.hasClass('collapsible') ? 1.4 : 1.2);

        if (elementPosition.top < 0) {
            $("#tracksContainer").scrollTop($("#tracksContainer").scrollTop() - elementOffsetHeight);
        }
    },

};



export default tracksSection;
