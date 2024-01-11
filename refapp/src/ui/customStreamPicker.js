import Input from "../input.js";
import Notification from "./../utils/notification.js"
import navigation from "./navigationArrows.js";

let customStreamPicker = {

    playerHandler: null,
    name: "customStreamPicker",
    Show() {
        $(".playCustomStreamBtn").hide();
        $(".closeStreamListBtn").hide();
        $("#customStreamWrapper").show();
        $("#customStreamWrapperBackgroundDiv").show();

        //Hide Custom stream, content list and playback controls buttons when this is active
        if (this.isVisible()) {
            navigation.hide();
            $("#contentListButton").hide();
            $("#playCustomStream").hide();
            $("#playCustomStreamParagraph").hide();
            Input.setActiveComponent(this);
        }
        if (debugOverlay.isInitalized) {
            debugOverlay.hide();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    Hide() {
        $("#customStreamWrapper").hide();
        $("#customStreamWrapperBackgroundDiv").hide();
        Input.setActiveComponent(navigation);
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    exit() {
        this.Hide();
    },

    down() {
        let selectedElement = $('#customStreamWrapper').find('.selected');
        $('#customStreamWrapper .selected').blur();
        if (selectedElement.length == 0) {
            selectedElement = $('#customStreamWrapper input').first().addClass('selected');
            return;
        }

        if (selectedElement.prev().length > 0) {
            if (selectedElement.parent().nextAll().find("button:first").length > 0) {
                selectedElement.removeClass('selected').parent().next().find("button").addClass('selected');
            }
        }
        else if (selectedElement.parent().nextAll().find("input:first").length > 0) {
            selectedElement.removeClass('selected').parent().next().find("input").addClass('selected');
        }

    },

    up() {
        let selectedElement = $('#customStreamWrapper').find('.selected');
        $('#customStreamWrapper .selected').blur();
        if (selectedElement.length == 0) {
            selectedElement = $('#customStreamWrapper input').last().addClass('selected');
            return;
        }
        if (selectedElement.prev().length > 0) {
            if (selectedElement.parent().prevAll().find("button:first").length > 0) {
                selectedElement.removeClass('selected').parent().prev().find("button.clear").addClass('selected');
            }

        }
        else if (selectedElement.parent().prevAll().find("input:first").length > 0) {
            selectedElement.removeClass('selected').parent().prev().find("input").addClass('selected');
        }
    },

    left() {
        let selectedElement = $('#customStreamWrapper').find('.selected');
        if (selectedElement.length == 0) {
            selectedElement = $('#customStreamWrapper input').first().addClass('selected');
            return;
        }
        if (selectedElement.prev().length > 0) {
            selectedElement.removeClass('selected').prev().addClass('selected');
        }
    },

    right() {
        let selectedElement = $('#customStreamWrapper').find('.selected');
        $('#customStreamWrapper .selected').blur();
        if (selectedElement.length == 0) {
            selectedElement = $('#customStreamWrapper input').first().addClass('selected');
            return;
        }
        if (selectedElement.next().length > 0) {
            selectedElement.removeClass('selected').next().addClass('selected');
        }
    },
    //Function works fine, unless keyboard and mouse are using it simultaneously
    ok() {
        if (!this.isVisible()) {
            return;
        }
        let selectedElement = $('#customStreamWrapper').find('.selected');
        if (selectedElement.prev().length > 0) {
            $('#customStreamWrapper .selected').trigger('click');
        }
        else {
            $('#customStreamWrapper .selected').focus();
        }
    },

    isVisible(){
        return $("#customStreamWrapper").is(":visible");
    },

    registerListener(playerHandler) {
        this.playerHandler = playerHandler;
        $("#customStreamWrapperBackgroundDiv").click(function() {
            if(customStreamPicker.isVisible()) {
                customStreamPicker.Hide();
            }
        });
        // Play Custom Stream inputs handling
        $(document).ready(function () {
            $("#form1").submit(function () {
                let inputVal = $("#urlName").val();
                let secondInputVal = $("#secondaryUrl").val();
                let drm_LicenseVal = $("#drmLicense").val();
                let streamUriCheck = /^(http|https):\/\//g;
                let whiteSpaceCheck = /\s/;
                let quotesCheck = /^"|"$/;
                if (streamUriCheck.test(inputVal) && !whiteSpaceCheck.test(inputVal) && !quotesCheck.test(inputVal)
                && secondInputVal) {
                    customStreamPicker.playerHandler.stop();
                    customStreamPicker.playerHandler.changeStream({
                        url: $("#urlName").val(),
                        hint: $("#hint").val(),
                        license: $("#drmLicense").val(),
                        drm_scheme: $("#drmScheme").val(),
                        additional_sources: [{
                            url: $("#secondaryUrl").val(),
                            hint: $("#secondaryHint").val(),
                            channelId: $("#secondaryStreamData").val(),
                            license: $("#secondaryDrmLicense").val(),
                            drm_scheme: $("#secondaryDrmScheme").val()
                        }]
                    }
                    );
                    $("#customStreamWrapper").css("display", "none");
                    $("#customStreamWrapperBackgroundDiv").css("display", "none");
                    $("#urlName").removeClass("inputErr")
                    console.log(`Entered streamUri: ${inputVal}`);
                } 
                else if (streamUriCheck.test(inputVal) && !whiteSpaceCheck.test(inputVal) && !quotesCheck.test(inputVal)) {
                    customStreamPicker.playerHandler.stop();
                    customStreamPicker.playerHandler.changeStream({
                        url: $("#urlName").val(),
                        hint: $("#hint").val(),
                        license: $("#drmLicense").val(),
                        drm_scheme: $("#drmScheme").val()
                    });
                    $("#customStreamWrapper").css("display", "none");
                    $("#customStreamWrapperBackgroundDiv").css("display", "none");
                    $("#urlName").removeClass("inputErr")
                    console.log(`Entered streamUri: ${inputVal}`);
                } else if (inputVal == "" && !whiteSpaceCheck.test(drm_LicenseVal)) {
                    $("#urlName").addClass("inputErr");
                    Notification.turnOnNotification(3000, "Empty streamUri");
                } else {
                    $("#urlName").addClass("inputErr");
                    Notification.turnOnNotification(3000, "Enter regular streamUri");
                }
            });
        });
    },

};

export default customStreamPicker;