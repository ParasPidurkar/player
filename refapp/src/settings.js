"use strict";

import playerHandler from "./playerHandler.js";
import debugOverlay from "./ui/debugOverlay.js";
import analyticsOverlay from "./ui/analyticsOverlay.js";
import playbackControls from "./ui/playbackControl.js"
import navigation from "./ui/navigationArrows.js";
import Input from "./input.js";
import Notification from "./utils/notification.js";
import tracksRepresentationSelection from "./ui/tracksRepresentationSelection.js";
import ABRmenu from "./ui/ABRmenu.js"

const templates = {
    debugOverlayButtonHtml: `<button id="debugOverlayButton" class="contentButtonSettings">Show/hide debug overlay <span class="currentValues"> (current : </span><span id=debugOverlayCurrentValue class="currentValues">Hide</span><span class="currentValues"> )</span></button>`,
    analyticsOverlayButtonHtml: `<button id="analyticsOverlayButton" class="contentButtonSettings">Show/hide analytics overlay <span class="currentValues"> (current : </span><span id=analyticsOverlayCurrentValue class="currentValues">Hide</span><span class="currentValues"> )</span></button>`,
    vodOffsetButtonHtml: `<button id="vodOffsetButton" class="contentButtonSettings">Set VoD offset <span class="currentValues"> (current : </span><span id=vodOffsetcurrentValue class="currentValues">0</span><span class="currentValues"> sec )</span></button>`,
    liveEdgeButtonHtml: `<button id="liveEdgeButton" class="contentButtonSettings">Set live edge distance <span class="currentValues"> (current : </span><span id=liveEgdeCurrentValue class="currentValues">0</span><span class="currentValues"> milisec )</span></button>`,
    abrTimeoutsHtml: `<button id="abrTimeouts" class="contentButtonSettings">Configure ABR timeouts and retry counters (DASH only)</button>`,
    trickModeButtonHtml: `<button id="trickModeStepButton" class="contentButtonSettings">Set trick mode step <span class="currentValues"> (current : </span><span id=trickModeStepCurrentValue class="currentValues">10</span><span class="currentValues"> sec )</span></button>`,
    //ccSwitchHtml: `<button id="ccSwitchButton" class="contentButtonSettings">CC mode on/off<span class="currentValues"> (current : </span><span id=ccSwitchCurrentValue class="currentValues">Off</span><span class="currentValues">)</span></button>`
}

const templatesModal = {
    vodOffsetInput: '<div id="vodOffsetBox"><div class="settingsMenuHeader" >Set VoD offset [Sec]</div>\
    <div id="offsetBody">\
    <div id="offsetInputDiv">\
    <input id="offsetInput" placeholder="$0 sec">\
    </div>\
    <button id="offsetButton">Set VoD offset</button>\
    </div>\
    </div>',
    skipOffsetInput: '<div id="skipOffsetBox"><div class="settingsMenuHeader" >Set Skip offset [Sec]</div>\
    <div id="offsetBody">\
    <div id="offsetInputDiv">\
    <input id="offsetInput" placeholder="10 sec">\
    </div>\
    <button id="offsetButton">Set Skip offset</button>\
    </div>\
    </div>',
    trickModeStepInput: `<div id="trickModeBox"><div class="settingsMenuHeader" >Set trick mode step [Sec]</div>\
    <div id="trickModeBody">\
    <div id="trickModeInputDiv">\
    <input id="trickModeInput" placeholder="10 sec">\
    </div>\
    <button id="trickModeButton">Set trick mode step</button>\
    </div>\
    </div>`,
    settingsLiveEdgeInput: `<div id="liveEdgeBox"><div class="settingsMenuHeader" > Set live edge distance [Millisec] </div>\
    <div id="liveEdgeBody">\
    <div id="liveEdgeInputDiv">\
    <input id="liveEdgeInput"placeholder="default">\
    </div>\
    <button id="liveEdgeDistanceButton">Set live edge distance</button>\
    </div>\
    <button id="liveEdgeDefaultButton">Reset to default</button>\
    </div>\
    </div>`

}
let Settings = {
    numberOfSettings: 5,
    settingsMenuHtml: `
    ${templates.debugOverlayButtonHtml}
    ${templates.analyticsOverlayButtonHtml}
    ${templates.vodOffsetButtonHtml}
    ${templates.skipOffsetButtonHtml}
    ${templates.liveEdgeButtonHtml}
    ${templates.abrTimeoutsHtml}
    ${templates.trickModeButtonHtml}
    ${templates.ccSwitchHtml}
    `,
    vodOffsetInput: templatesModal.vodOffsetInput,
    skipOffsetInput: templatesModal.skipOffsetInput,
    trickModeStepInput: templatesModal.trickModeStepInput,
    settingsLiveEdgeInput: templatesModal.settingsLiveEdgeInput,
    subComponent: null,
    start() {
        playerHandler.vodOffset = localStorage.getItem("vodOffsetValue") || playerHandler.vodOffset;
        playerHandler.trickModeStep = localStorage.getItem("lastTrickModeStep") || playerHandler.trickModeStep;
        $("#settingsMenuBackgroundDiv").click(function () {
            Settings.hideSettingsMenu();
            playbackControls.Show();
        });
        $("#settingsBitBackgroundDiv").click(function () { Settings.hideSettingsBit() });
    },

    hideSettingsBit() {
        $("#settingsBitMain").hide();
        $("#settingsBitDiv").hide();
        $("#settingsBitBackgroundDiv").hide();
        $("#volumeUpButton").show();
        $("#volumeDownButton").show();
    },

    isOpen() {
        return $("#settingsMenuDiv").get(0).style.display == "block";
    },

    settingsPop(playerHandler) {
        let settingsMenuMain = $("#settingsMenuMain");
        settingsMenuMain.append(
            $(`<ul style="list-style: none;" class="settingsList"></ul>`).append(
                $(this.settingsMenuHtml)));
        $("#vodOffsetcurrentValue").text(playerHandler.vodOffset || 0);
        $("#skipOffsetcurrentValue").text(playerHandler.skipOffset || 10);
        $("#trickModeStepCurrentValue").text(playerHandler.trickModeStep);
        $("#debugOverlayCurrentValue").text(debugOverlay.isInitalized ? "Show" : "Hide");
        $("#analyticsOverlayCurrentValue").text(analyticsOverlay.isShown ? "Show" : "Hide");
        $("#ccSwitchCurrentValue").text(playerHandler.player.isClosedCaptionEnabled ? "On" : "Off");

        Input.setActiveComponent(this);
        $("#settingsMenuDiv").show();
        $("#settingsMenuBackgroundDiv").show();
        $("#volumeUpButton").hide();
        $("#volumeDownButton").hide();
        $("#commandWrapper").addClass("inactive");
        $("#contentList, #playCustomStream, #playbackControls").hide();

        $(".contentButtonSettings").height((settingsMenuMain.height() * 0.85) / this.numberOfSettings);

        $("#debugOverlayButton").click(function () {
            Settings.hideSettingsMenu();
            playbackControls.Show();
            Settings.debugOverlayCallback();
        });
        $("#analyticsOverlayButton").click(function () {
            Settings.hideSettingsMenu();
            playbackControls.Show();
            Settings.analyticsOverlayCallback();
        });
        $("#vodOffsetButton").click(Settings.setVodOffsetCallback);
        $("#skipOffsetButton").click(Settings.setSkipOffsetCallback);
        $("#trickModeStepButton").click(Settings.setTrickModeCallback);
        //Not implemented
        $("#liveEdgeButton").click(function () {
            let implemented = false;
            if (implemented) {
                Settings.setLiveEdgeCallback();
            } else {
                Notification.turnOnNotification(3000, 'Not implemented yet');
            }
            navigation.hide();
        });
        $("#abrTimeouts").click(ABRmenu.setAbrCallback);
        debugOverlay.hide();
        analyticsOverlay.hide();
        if ($("#settingsMenuDiv").css("display", "block")) {
            navigation.hide();
        }
        $("#ccSwitchButton").click(function () {
            Settings.hideSettingsMenu();
            playbackControls.Show();
            Settings.ccSwitchCallback();
        });
    },

    hide() {
        $("#settingsMenuDiv").hide();
        $("#settingsMenuBackgroundDiv").hide();
        $("#settingsMenuHeader").hide();
        $("#settingsMenuMain").hide();
        Input.setActiveComponent(playbackControls);
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    hideSettingsMenu() {
        let parent = document.getElementById("settingsMenuMain");
        this.subComponent = null;
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        $("#settingsMenuDiv").hide();
        $("#settingsMenuBackgroundDiv").hide();
        $("#volumeUpButton").show();
        $("#volumeDownButton").show();
        $("#contentList, #playCustomStream, #playbackControls").hide();
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    hideTracksMenu() {
        $("#settingsTracksHeader").hide();
        $("#settingsTracksDiv").hide();
        playbackControls.Show();
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    hideTracksRepresentationMenu() {
        tracksRepresentationSelection.Hide();
    },

    setVodOffsetCallback() {
        $("#main").prepend(Settings.vodOffsetInput);
        $("#offsetInput").attr("placeholder", `${localStorage.getItem("vodOffsetValue") || 0} sec`)
        Settings.hideSettingsMenu();
        playbackControls.Hide();
        debugOverlay.hide();
        analyticsOverlay.hide();
        $("#offsetInput").click(function () {
            navigation.hide();
        });
        Settings.subComponent = vodOffsetBox;

        $("#offsetButton").click(function () {
            let offsetStrVal = $('#offsetInput').val();
            $("#vodOffsetBox").remove();
            playerHandler.setVodOffset(offsetStrVal != "" ? parseInt(offsetStrVal) : playerHandler.vodOffset);
            localStorage.setItem("vodOffsetValue", playerHandler.vodOffset || 0);
            $("#vodOffsetcurrentValue").text(playerHandler.vodOffset);
            Settings.exit();
            Settings.hideSettingsMenu();
            Settings.subComponent = null;
            if (debugOverlay.isInitalized) {
                debugOverlay.show();
            }
            if (analyticsOverlay.isShown) {
                analyticsOverlay.show();
            }

            Settings.subComponent = null;
        });
        Input.setActiveComponent(Settings);

        $("#offsetInput").addClass("selected");
        $("#offsetInput").focus();
    },

    setSkipOffsetCallback() {
        $("#main").prepend(Settings.skipOffsetInput);
        $("#offsetInput").get(0).placeholder = (playerHandler.skipOffset != null ? playerHandler.skipOffset : "10") + " sec";
        Settings.hideSettingsMenu();
        playbackControls.Hide();
        debugOverlay.hide();
        analyticsOverlay.hide();
        $("#offsetInput").click(function () {
            navigation.hide();
        });
        Settings.subComponent = skipOffsetBox;

        $("#offsetButton").click(function () {
            let offsetStrVal = $('#offsetInput').val();
            $("#skipOffsetBox").remove();
            playerHandler.setSkipOffset(offsetStrVal != "" ? parseInt(offsetStrVal) : playerHandler.skipOffset);
            $("#skipOffsetcurrentValue").append(playerHandler.skipOffset);
            Settings.exit();
            Settings.hideSettingsMenu();
            Settings.subComponent = null;
            if (debugOverlay.isInitalized) {
                debugOverlay.show();
            }
            if (analyticsOverlay.isShown) {
                analyticsOverlay.show();
            }

            Settings.subComponent = null;
        });
        Input.setActiveComponent(Settings);

        $("#offsetInput").addClass("selected");
        $("#offsetInput").focus();
    },

    setTrickModeCallback() {
        $("#main").prepend(Settings.trickModeStepInput);
        $("#trickModeInput").attr("placeholder",
            (localStorage.getItem("lastTrickModeStep") || playerHandler.trickModeStep) + " sec");
        Settings.hideSettingsMenu();
        playbackControls.Hide();
        debugOverlay.hide();
        analyticsOverlay.hide();
        $("#trickModeInput").click(function () {
            navigation.hide();
        });
        Settings.subComponent = trickModeBox;


        $("#trickModeButton").click(function () {
            let trickModeStepStrVal = $('#trickModeInput').val();
            $("#trickModeBox").remove();
            playerHandler.trickModeStep = trickModeStepStrVal != "" ? parseInt(trickModeStepStrVal) : playerHandler.trickModeStep;
            localStorage.setItem("lastTrickModeStep", playerHandler.trickModeStep);
            $("#trickModeStepCurrentValue").text(playerHandler.trickModeStep);
            Settings.exit();
            Settings.hideSettingsMenu();
            Settings.subComponent = null;
            if (debugOverlay.isInitalized) {
                debugOverlay.show();
            }
            if (analyticsOverlay.isShown) {
                analyticsOverlay.show();
            }
            Settings.subComponent = null;
        });
        Input.setActiveComponent(Settings);
        $("#trickModeInput").addClass("selected");
        $("#trickModeInput").focus();
    },

    setLiveEdgeCallback() {
        $("#main").prepend(Settings.settingsLiveEdgeInput);
        $("#liveEdgeInput").get(0).placeholder = (playerHandler.liveEdge || "default");
        Settings.hideSettingsMenu();
        playbackControls.Hide();
        debugOverlay.hide();

        $("#liveEdgeDistanceButton").click(function () {
            let liveEdgeStrVal = $('#liveEdgeInput').val();
            $("#liveEdgeBox").remove();
            playerHandler.setLiveEdgeDistance(liveEdgeStrVal != "" ? parseInt(liveEdgeStrVal) : playerHandler.liveEdge);
            $("#liveEgdeCurrentValue").append(playerHandler.liveEdge);
            Settings.exit();
            Settings.hideSettingsMenu();
            Settings.subComponent = null;
            if (debugOverlay.isInitalized) {
                debugOverlay.show();
            }
        });
        Input.setActiveComponent(Settings);
        Settings.subComponent = liveEdgeBox;
        $("#liveEdgeInput").addClass("selected");
        $("#liveEdgeInput").focus();
    },

    isSubComponentBox(target, name) {
        return $('#' + name)[0].contains(target);
    },

    isClickedOnBackground(target) {
        let videoPlayerId = "iPlayer_html5_api";
        return target.id === videoPlayerId;
    },

    debugOverlayCallback() {
        if (debugOverlay.isInitalized) {
            debugOverlay.deinit();
        } else {
            debugOverlay.init(playerHandler);
        }
    },

    analyticsOverlayCallback() {
        if (analyticsOverlay.isShown) {
            analyticsOverlay.deinit();
        } else {
            analyticsOverlay.init();

        }
    },

    ccSwitchCallback() {
        const value = playerHandler.player.isClosedCaptionEnabled;
        playerHandler.player.enable_cc_tracks(!value);
    },

    down() {
        if (this.subComponent && this.subComponent.down) {
            this.subComponent.down();
        }
        let selectedElement = $('#settingsMenuDiv').find('.selected');
        if (selectedElement.length == 0) {
            selectedElement = $('#settingsMenuDiv button').first().addClass('selected');
            return;
        }
        if (selectedElement.next('button:first').length > 0) {
            selectedElement.removeClass('selected').next().addClass('selected');
        }
    },

    up() {
        if (this.subComponent && this.subComponent.up) {
            this.subComponent.up();
        }
        let selectedElement = $('#settingsMenuDiv').find('.selected');
        if (selectedElement.length == 0) {
            selectedElement = $('#settingsMenuDiv button').last().addClass('selected');
            return;
        }
        if (selectedElement.prev('button:first').length > 0) {
            selectedElement.removeClass('selected').prev('button:first').addClass('selected');
        }
    },

    ok() {
        if (this.subComponent && this.subComponent.ok) {
            this.subComponent.ok();
            return;
        }
        if ($('#settingsMenuDiv').css('display') == 'none') {
            return;
        }
        $('#settingsMenuDiv .selected').trigger('click');
    },

    exit() {
        if (this.subComponent && this.subComponent.exit) {
            this.subComponent.exit();
        }
        $('.settingsList').remove();
        $('#settingsMenuDiv').hide();
        playbackControls.Show();
        Input.setActiveComponent(playbackControls);
        $('#playPause').removeClass('selected');
        $('#settingsMenu').addClass('selected');
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    right() {
        if (this.subComponent && this.subComponent.right) {
            this.subComponent.right();
        }
    },

    left() {
        if (this.subComponent && this.subComponent.left) {
            this.subComponent.left();
        }
    },
}

let vodOffsetBox = {
    name: "vodOffsetBox",
    left() {
        $('#offsetButton').removeClass('selected');
        $('#offsetButton').blur();
        $("#offsetInput").addClass("selected");
        $("#offsetInput").focus();
    },
    right() {
        $('#offsetInput').blur();
        $("#offsetInput").removeClass("selected");
        $("#offsetButton").addClass("selected");
    },
    exit() {
        $('#vodOffsetBox').hide();
        $('#playPause').removeClass('selected');
        $('#settingsMenu').addClass('selected');
        Settings.subComponent = null;
    },
    ok() {
        if ($("#offsetButton").hasClass("selected")) {
            $("#offsetButton").trigger("click");
        }
        else {
            Input.setActiveComponent(vodOffsetBox);
        }
    }
}

let skipOffsetBox = {
    name: "skipOffsetBox",
    left() {
        $('#offsetButton').removeClass('selected');
        $('#offsetButton').blur();
        $("#offsetInput").addClass("selected");
        $("#offsetInput").focus();
    },
    right() {
        $('#offsetInput').blur();
        $("#offsetInput").removeClass("selected");
        $("#offsetButton").addClass("selected");
    },
    exit() {
        $('#skipOffsetBox').hide();
        $('#playPause').removeClass('selected');
        $('#settingsMenu').addClass('selected');
        Settings.subComponent = null;
    },
    ok() {
        if ($("#offsetButton").hasClass("selected")) {
            $("#offsetButton").trigger("click");
        }
        else {
            Input.setActiveComponent(skipOffsetBox);
        }
    }
}

let trickModeBox = {
    name: "trickModeBox",
    left() {
        $('#trickModeButton').removeClass('selected');
        $('#trickModeButton').blur();
        $("#trickModeInput").addClass("selected");
        $("#trickModeInput").focus();
    },
    right() {
        $('#trickModeInput').blur();
        $("#trickModeInput").removeClass("selected");
        $("#trickModeButton").addClass("selected");
    },
    exit() {
        $('#trickModeBox').hide();
        Settings.subComponent = null;
    },
    ok() {
        if ($("#trickModeButton").hasClass("selected")) {
            $("#trickModeButton").trigger("click");
        }
        else {
            Input.setActiveComponent(trickModeBox);
        }
    }
}

let liveEdgeBox = {
    name: "liveEdgeBox",
    left() {
        if ($('#liveEdgeDistanceButton').hasClass('selected')) {
            $('#liveEdgeDistanceButton').removeClass('selected');
            $('#liveEdgeDistanceButton').blur();
            $("#liveEdgeInput").addClass("selected");
            $("#liveEdgeInput").focus();
        }
    },
    right() {
        if ($('#liveEdgeInput').hasClass('selected')) {
            $('#liveEdgeInput').blur();
            $("#liveEdgeInput").removeClass("selected");
            $("#liveEdgeDistanceButton").addClass("selected");
        }
    },
    exit() {
        $('#liveEdgeBox').hide();
        Settings.subComponent = null;
    },
    down() {
        $('#liveEdgeBox').find('.selected').removeClass('selected');
        $('#liveEdgeInput').blur();
        $("#liveEdgeInput").removeClass("selected");
        $("#liveEdgeDefaultButton").addClass("selected");
    },
    up() {
        if ($('#liveEdgeDefaultButton').hasClass('selected')) {
            $("#liveEdgeDefaultButton").removeClass("selected");
            $("#liveEdgeDistanceButton").addClass("selected");
        }
    }
}

export default Settings;