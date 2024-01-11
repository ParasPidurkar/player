import Input from "../input.js";
import Notification from "./../utils/notification.js"
import navigation from "./navigationArrows.js";
import playerHandler from "../playerHandler.js";
import debugOverlay from "./debugOverlay.js";
import analyticsOverlay from "./analyticsOverlay.js";
import playbackControls from "./playbackControl.js"
import mouseListener from "../mouseListeners.js"
import Settings from "../settings.js";
import abrDialog from "./abrDialog.js";

let ABRmenu = {

    playerHandler: null,
    name: "abrBox",
    abrInput: '<div id="abrBox" class="transparentLow"><div class="abrMenuHeader" >Configurate ABR timeouts and retry counters (DASH only)</div>\
    <div id="abrBody">\
    <div id="abrRow1">\
    <span class="abrTextSettings">Manifest download retry count</span>\
    <input type="text" class = "abrInputDefault" id="abrInput1" placeholder="default">\
    <button class ="abrButtonReset" id ="abrReset1" type = "reset">Reset to default </button>\
    </div>\
    <div id="abrRow2">\
    <span class="abrTextSettings">Segment download retry count dynamic</span>\
    <input type="text" class = "abrInputDefault" id="abrInput2" placeholder="default">\
    <button class ="abrButtonReset" id ="abrReset2" type = "reset">Reset to default </button>\
    </div>\
    <div id="abrRow3">\
    <span class="abrTextSettings">Segment download retry count static</span>\
    <input type="text" class = "abrInputDefault" id="abrInput3" placeholder="disabled" disabled>\
    <button class ="abrButtonReset" id ="abrReset3" type = "reset" disabled>Reset to default </button>\
    </div>\
    <div id="abrRow4">\
    <span class="abrTextSettings">Manifest download connection timeout [sec]</span>\
    <input type="text" class = "abrInputDefault" id="abrInput4" placeholder="default">\
    <button class ="abrButtonReset" id ="abrReset4" type = "reset">Reset to default </button>\
    </div>\
    <div id="abrRow5">\
    <span class="abrTextSettings">Segment download connection timeout [sec]</span>\
    <input type="text" class = "abrInputDefault" id="abrInput5" placeholder="default">\
    <button class ="abrButtonReset" id ="abrReset5" type = "reset">Reset to default </button>\
    </div>\
    <div id="abrRow6">\
    <button class="abrButtonOk" id="abrInput6" type="submit">OK</button>\
    <button class ="abrButtonCancel" id ="abrReset6" type = "reset">CANCEL</button>\
    </div>\
    </div>\
    </div>',

    Show() {
        $(".playCustomStreamBtn").hide();
        $(".closeStreamListBtn").hide();
        $("#abrBox")[0].style.display = "block";
        $("#customStreamWrapperBackgroundDiv")[0].style.display = "block";

        //Hide Custom stream, content list and playback controls buttons when this is active
        if ($("#abrBox")[0].style.display == "block") {
            navigation.hide();
            $("#contentListButton").css("display", "none");
            $("#playCustomStream").css("display", "none");
            $("#playCustomStreamParagraph").css("display", "none");
            Input.setActiveComponent(this);
        }
    },

    Hide() {
        $("#abrBox").hide();
    },

    exit() {
        $("#abrBox").remove();
        Settings.hideSettingsMenu();
        Settings.subComponent = null;
        Settings.exit();
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    down() {
        let selectedElement = $('#abrBody').find('.focused');
        $('#abrBody .focused').blur();
        if (selectedElement.length == 0) {
            selectedElement = $('#abrBody input').first().addClass('focused');
            return;
        }

        if (selectedElement.hasClass('abrButtonReset')) {
            if (selectedElement.parent().nextAll().find("button:first").length > 0) {
                selectedElement.removeClass('focused').parent().next().find("button:last").addClass('focused');
            }
        }
        else if (selectedElement.parent().nextAll().find("input:first").length > 0) {
            selectedElement.removeClass('focused').parent().next().find("input").addClass('focused').focus();
        }
        else if (!selectedElement.hasClass('abrButtonOk') && !selectedElement.hasClass('abrButtonCancel')) {
            selectedElement.removeClass('focused').parent().next().find("button.abrButtonOk").addClass('focused');
        }
    },

    up() {
        let selectedElement = $('#abrBody').find('.focused');
        $('#abrBody .focused').blur();
        if (selectedElement.length == 0) {
            selectedElement = $('#abrBody input').last().addClass('focused');
            return;
        }
        if (selectedElement.hasClass('abrButtonReset')) {
            if (selectedElement.parent().prevAll().find("button:first").length > 0) {
                selectedElement.removeClass('focused').parent().prev().find("button").addClass('focused').focus();
            }

        }
        else if (selectedElement.parent().prevAll().find("input:first").length > 0) {
            selectedElement.removeClass('focused').parent().prev().find("input").addClass('focused').focus();
            if (selectedElement.hasClass('abrButtonCancel')) {
                selectedElement.removeClass('focused').parent().prev().find("button.abrButtonReset").addClass('focused');
            }
        }
        if (selectedElement.hasClass('abrButtonCancel')) {
            $('#abrBody .focused').blur();
            selectedElement.removeClass('focused').find("button.abrButtonReset").addClass('focused');
            $('#abrBody .abrInputDefault').removeClass('focused');
        }
    },

    left() {
        let selectedElement = $('#abrBody').find('.focused');
        if (selectedElement.length == 0) {
            selectedElement = $('#abrBody input').first().addClass('focused');
            return;
        }
        if (selectedElement.hasClass('abrButtonReset')) {
            selectedElement.removeClass('focused').prev().addClass('focused').focus();
        }
        else if (selectedElement.hasClass('abrButtonCancel')) {
            selectedElement.removeClass('focused').prev().addClass('focused');
        }
    },

    right() {
        let selectedElement = $('#abrBody').find('.focused');
        $('#abrBody .focused').blur();
        if (selectedElement.length == 0) {
            selectedElement = $('#abrBody input').first().addClass('focused');
            return;
        }
        if (selectedElement.hasClass('abrInputDefault')) {
            selectedElement.removeClass('focused').next().addClass('focused');
        }
        else if (selectedElement.hasClass('abrButtonOk')) {
            selectedElement.removeClass('focused').next().addClass('focused');
        }
    },

    setABRConfiguration() {
        playerHandler.setManifestRetry($('#abrInput1')[0].value == "" ? ($('#abrInput1')[0].placeholder == "default" ? null : $('#abrInput1')[0].placeholder) : $('#abrInput1')[0].value );
        playerHandler.setSegmentRetry($('#abrInput2')[0].value == "" ? ($('#abrInput2')[0].placeholder == "default" ? null : $('#abrInput2')[0].placeholder) : $('#abrInput2')[0].value );
        playerHandler.setManifestTimeout($('#abrInput4')[0].value == "" ? ($('#abrInput4')[0].placeholder == "default" ? null : $('#abrInput4')[0].placeholder) : $('#abrInput4')[0].value );
        playerHandler.setSegmentTimeout( $('#abrInput5')[0].value == "" ? ($('#abrInput5')[0].placeholder == "default" ? null : $('#abrInput5')[0].placeholder) : $('#abrInput5')[0].value );
    },

    setAbrCallback() {
        $("#main").prepend(ABRmenu.abrInput);
        $("#abrBody").get(0).placeholder = (playerHandler.abrValue != null ? playerHandler.abrValue : "default");
        Settings.hideSettingsMenu();
        playbackControls.Hide();
        debugOverlay.hide();
        analyticsOverlay.hide();
        $("#abrInput6")[0].disabled = true;

        $(".abrButtonReset").click(function () {
            if($('#' + this.id).prev()[0].placeholder != "disabled") {
                $('#' + this.id).prev()[0].value = "";
                $('#' + this.id).prev()[0].placeholder = "default";
                $("#abrInput6")[0].disabled = false;
                navigation.hide();
            }
        });

        $(".abrInputDefault").click(function () {
            this.focus();
            navigation.hide();
        });

        let inputs = $(".abrInputDefault");
        for(let i = 0;i< inputs.length;i++) {
            inputs[i].addEventListener('input', (event) => {
                $("#abrInput6")[0].disabled = false;
            });
        }

        $("#abrReset6").click(function () {
            ABRmenu.exit();
        });

        $("#abrInput6").click(function () {
            navigation.hide();
            abrDialog.show(ABRmenu);
        });

        Input.setActiveComponent(Settings);
        Settings.subComponent = ABRmenu;
        $("#abrInput1").focus();
        if(localStorage['iw_manifestRetry'] != undefined){
            $('#abrInput1')[0].placeholder = localStorage['iw_manifestRetry'];
        }
        if(localStorage['iw_segmentRetry'] != undefined){
            $('#abrInput2')[0].placeholder = localStorage['iw_segmentRetry'];
        }
        if(localStorage['iw_manifestTimeout'] != undefined){
            $('#abrInput4')[0].placeholder = localStorage['iw_manifestTimeout'];
        }
        if(localStorage['iw_segmentTimeout']!= undefined){
            $('#abrInput5')[0].placeholder = localStorage['iw_segmentTimeout'];
        }
    },

    //Function works fine, unless keyboard and mouse are using it simultaneously
    ok() {
        if ($('#abrBody').css('display') == 'none') {
            return;
        }
        let selectedElement = $('#abrBody').find('.focused');
        $('#abrBody .focused').blur();
        if (selectedElement.hasClass('abrButtonReset')) {
            if (selectedElement.prev()[0].placeholder != "disabled") {
                selectedElement.prev()[0].placeholder = "default";
                selectedElement.prev()[0].value = "";
                $("#abrInput6")[0].disabled = false;
            }
        }
        else if (selectedElement.hasClass('abrInputDefault')) {
            $('#abrBody .focused').focus();
        }
        else {
            if (selectedElement.hasClass('abrButtonOk')) {
                abrDialog.show(this);
            } else {
                this.exit()
            }
        }
    },
};

export default ABRmenu;