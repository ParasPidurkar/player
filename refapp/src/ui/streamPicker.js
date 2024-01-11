import Input from "../input.js";
import customStreamPicker from "./customStreamPicker.js";
import debugOverlay from "./debugOverlay.js";
import analyticsOverlay from "./analyticsOverlay.js";
import navigation from "./navigationArrows.js";


let streamPicker = {
    name: "streamPicker",
    Show() {
        document.getElementById("contentListWrapper").style.display = "block";
        $(".closeStreamListBtn").show();
        $(".playCustomStreamBtn").show();
        $(".playCustomStreamBtn").removeClass('selected');
        Input.setActiveComponent(this);
        navigation.hide();

        if (debugOverlay.isInitalized) {
            debugOverlay.hide();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.hide();
        }
    },

    Hide() {
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
        document.getElementById("contentListWrapper").style.display = "none";
        Input.setActiveComponent(navigation);
    },
    isShown() {
        return $("#contentListWrapper").get(0).style.display != "none";
    },

    down() {
        if ($('.playCustomStreamBtn').hasClass('selected') || $('#contentListWrapper').css('display') == 'none') {
            return;
        }
        let selectedElement = $('#contentListWrapper').find('.selected');
        if (selectedElement.length == 0) {
            selectedElement = $('#contentListWrapper > .collapsible').first().addClass('selected');
            return;
        }
        
        if (selectedElement.hasClass('active') || selectedElement.hasClass('contentButton')) {
            streamPicker.selectNextKeyboardActiveSubComponent(selectedElement);
        } else {
            streamPicker.selectNextKeyboardActiveComponent(selectedElement);
        }
    },

    selectNextKeyboardActiveComponent(selectedElement) {
        if (selectedElement.nextAll('button:first').length > 0) {
            selectedElement.removeClass('selected').nextAll('button:first').addClass('selected');
        }
    },

    selectNextKeyboardActiveSubComponent(selectedElement) {
        if (!selectedElement.hasClass('contentButton')) {
            selectedElement.removeClass('selected').next().find("button:first").addClass('selected');
        } else if (selectedElement.parent().next().find("button:first").length > 0) {
            selectedElement.removeClass('selected').parent().next().find("button:first").addClass('selected')
        } else if (selectedElement.parent().closest('div').next().length > 0) {
            selectedElement.removeClass('selected').parent().closest('div').next().addClass('selected');
        }
    },

    up() {
        if ($('#contentListWrapper').css('display') == 'none' || ($('.playCustomStreamBtn').hasClass('selected'))) {
            return;
        }
        let selectedElement = $('#contentListWrapper').find('.selected');
        if (selectedElement.length == 0) {
            selectedElement = $('#contentListWrapper > .collapsible').last().addClass('selected');
            return;
        }
        
        if (selectedElement.hasClass('contentButton') || selectedElement.prevAll('button:first').hasClass('active')) {
            streamPicker.selectPreviousKeyboardActiveSubComponent(selectedElement);
        } else {
            streamPicker.selectPreviousKeyboardActiveComponent(selectedElement);
        }
    },

    ok() {
        if ($('#contentListWrapper').css('display') == 'none') {
            return;
        }
        $('#contentListWrapper .selected').trigger('click');
    },

    exit() {
        $(".closeStreamListBtn").hide();
        $(".playCustomStreamBtn").hide();
        this.Hide();
        $('.playCustomStreamBtn').removeClass('selected');
        if ($('#contentListWrapper').css('display') == 'none') {
            return;
        }
    },

    right() {
        if ($('#contentListWrapper').css('display') == 'none') {
            return;
        }
        $('#contentListWrapper').find('.selected').removeClass('selected');
        $('.playCustomStreamBtn').addClass('selected');
    },

    left() {
        if ($('#contentListWrapper').css('display') == 'none') {
            return;
        }
        $('.playCustomStreamBtn').removeClass('selected');
        $('#contentListWrapper').scrollTop(0);
    },

    selectPreviousKeyboardActiveComponent(selectedElement) {
        if (selectedElement.prevAll('button:first').length > 0) {
            selectedElement.removeClass('selected').prevAll('button:first').addClass('selected');
        }
    },

    selectPreviousKeyboardActiveSubComponent(selectedElement) {
        if (!selectedElement.hasClass('contentButton')) {
            selectedElement.removeClass('selected').prev().find("button:last").addClass('selected');
        } else if (selectedElement.parent().prev().find("button:first").length > 0) {
            selectedElement.removeClass('selected').parent().prev().find("button:first").addClass('selected')
        } else if (selectedElement.parent().closest('div').prev().length > 0) {
            selectedElement.removeClass('selected').parent().closest('div').prev().addClass('selected');
        }
    },

    scrollOnArrowDown() {
        if ($('.playCustomStreamBtn').hasClass('selected')) {
            return;
        }
        let selectedElement = $('#contentListWrapper').find('.selected');

        if (selectedElement.length == 0) {
            return;
        }
        // Element’s Position Relative to the BrowserWindow
        let elementPosition = selectedElement[0].getBoundingClientRect();
        let elementOffsetHeight = selectedElement[0].offsetHeight * (selectedElement.hasClass('collapsible') ? 1.3 : 1.2);

        if (elementPosition.bottom > $("#contentListWrapper").height()) {
            $("#contentListWrapper").scrollTop($("#contentListWrapper").scrollTop() + elementOffsetHeight);
        }
    },

    scrollOnArrowUp() {
        if ($('.playCustomStreamBtn').hasClass('selected')) {
            return;
        }
        let selectedElement = $('#contentListWrapper').find('.selected');

        if (selectedElement.length == 0) {
            return;
        }
        // Element’s Position Relative to the BrowserWindow
        let elementPosition = selectedElement[0].getBoundingClientRect();
        let elementOffsetHeight = selectedElement[0].offsetHeight * (selectedElement.hasClass('collapsible') ? 1.3 : 1.2);

        if (elementPosition.top < 0) {
            $("#contentListWrapper").scrollTop($("#contentListWrapper").scrollTop() - elementOffsetHeight);
        }
    },

};




export default streamPicker;