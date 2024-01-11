import Input from "../input.js";
import navigation from "./navigationArrows.js";
import playbackControl from "./playbackControl.js";
import debugOverlay from "./debugOverlay.js";
import analyticsOverlay from "./analyticsOverlay.js";
import playerHandler from "../playerHandler.js";
import Notification from "../utils/notification.js";

let tracksRepresentationSelection = {


    name: "tracksRepresentationSelection",
    videoTrackMenu: $("#videoTrackRepresentationDiv ul"),
    subComponent: null,
    checkmarkIndex: -1,
    firstVideoTrack: null,

    Show() {
        $('#settingsTracksRepresentationDiv').find('.selected').removeClass('selected');
        $("#settingsTracksRepresentationDiv").show();
        $("#settingsTracksRepresentationBackgroundDiv").show();
        $("#settingsTracksRepresentationHeader").show();
        Input.setActiveComponent(this);
        if ($('#settingsTracksRepresentationDiv').css('display') == 'block') {
            navigation.hide();
        }
        if (debugOverlay.isInitalized) {
            debugOverlay.hide();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    Hide() {
        $('#settingsTracksRepresentationDiv').hide();
        $("#settingsTracksRepresentationBackgroundDiv").hide();
        $("#settingsTracksRepresentationHeader").hide();
        playbackControl.Show();
        this.clearTrackData();
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
    },

    isShown() {
        return $("#settingsTracksRepresentationDiv").is(":visible") ||
            $("#abrManagementBox").is(":visible");
    },

    closeAbrBox() {
        if (($("#abrManagementBox").is(":visible")) && !($("#tracksRepresentationButtonMenu").is(":hover")) &&
            !($("#tracksRepresentationButtonMenu").is(".selected"))) {
            $("#abrManagementBox").hide();
        }
    },

    selectRepresentation(playerHandler) {
        if (playerHandler.player.get_state() == playerHandler.player.State.playing ||
            playerHandler.player.get_state() == playerHandler.player.State.paused) {
            this.Show();
            this.fillTrackData();
        }
        navigation.hide();
    },

    clearTrackData() {
        $("#videoTrackRepresentationDiv").empty();
    },

    setCheckmark(button) {
        let whiteCheckmarkElement = $('#settingsTracksRepresentationDiv').find('.whiteCheckmark');
        whiteCheckmarkElement.removeClass('whiteCheckmark');
        $(this).addClass('whiteCheckmark');
        let selectedElement = $('#settingsTracksRepresentationDiv').find('.selected');
        if (selectedElement.hasClass('contentButton')) {
            let blueCheckmarkElement = $('#settingsTracksRepresentationDiv').find('.blueCheckmark');
            blueCheckmarkElement.removeClass('blueCheckmark');
            selectedElement.addClass('blueCheckmark');
        }
    },

    async fillTrackData() {
        let representations = playerHandler.player.get_track_representations();
        const videoTracks = await playerHandler.getTracksByMediaType(playerHandler.player.Media_type.video);

        if (representations.length == 0) {
            let button = $("<button>No options available</button>");
            button.addClass("contentButton");
            button.click(tracksRepresentationSelection.setCheckmark);
            $("#videoTrackRepresentationDiv").append(button);
        }
        else {
            for (let i = 0; i < representations.length; i++) {
                if (representations[i].id == playerHandler.player.get_current_representation().id) {
                    this.checkmarkIndex = i;
                    break;
                }
            }
            let button = $("<button>Reset to default</button>");
            button.addClass("contentButton");
            let opt = $("<options>");
            opt.addClass("abrOptions");
            button.append(opt);
            button.click(tracksRepresentationSelection.setCheckmark);
            $("#videoTrackRepresentationDiv").append(button);
            for (let i = 0; i < representations.length; i++) {
                let content = "[video/mp4]";

                let codec = this.getCodecFromTrack(videoTracks, representations[i]);

                content +=  codec ? "[" + codec + "]" : "[]";

                content += representations[i].width && representations[i].height ?
                    "[" + representations[i].width + "x" + representations[i].height + "]" :
                    "";

                content += representations[i].bitrate ?
                    "[" + representations[i].bitrate + "kbps]" :
                    "";

                let button = $(`<button>${content}</button>`);

                button.addClass("contentButton");
                let opt = $("<options>");
                opt.addClass("abrOptions");
                button.append(opt);
                button.click(tracksRepresentationSelection.setCheckmark);
                $("#videoTrackRepresentationDiv").append(button);
                if (this.checkmarkIndex == -1) {
                    if (i == representations.length - 1) {
                        this.setCheckmark.call(button);
                    }
                }
                else if (i == this.checkmarkIndex) {
                    this.setCheckmark.call(button);
                }

            }
            this.firstVideoTrack = $('#tracksRepresentationContainer .contentButton').nextAll('button:first');
        }

        $('#tracksRepresentationContainer .collapsible').trigger('click');
    },

    getCodecFromTrack(tracks, representation) {
        let codec = '';

        if (tracks[0].constructor.name === 'IwpDashTrack') {
            codec = tracks[0].codec[representation.representation_index]
        }
        if (tracks[0].constructor.name === 'IwpHLSTrack') {
            tracks.forEach(track => {
                if (track.resolution.startsWith(representation.width)) {
                    codec = track.codec;
                }
            });
        }

        let codecFormat = codec?.split('.')[0];
        let codecNameUppercase = codec?.split('.')[1]?.toUpperCase();
        return codecNameUppercase ? [codecFormat, codecNameUppercase].join('.') : '';
    },

    down() {
        if ($('#tracksRepresentationButtonMenu').hasClass('selected')) {
            $('#tracksRepresentationButtonMenu').removeClass('selected');
            $('#tracksRepresentationButtonCancel').addClass('selected');
        }
        if ($('#tracksRepresentationContainer').css('display') == 'none' || $('#tracksRepresentationButtonOk').hasClass('selected') ||
            $('#tracksRepresentationButtonCancel').hasClass('selected')) {
            return;
        }
        let selectedElement = $('#tracksRepresentationContainer').find('.selected');
        if (selectedElement.length == 0) {
            selectedElement = $('#tracksRepresentationContainer > .collapsible').first().addClass('selected');
            return;
        }
        if (selectedElement.hasClass('selected')) {
            if (selectedElement.hasClass('active')) {
                tracksRepresentationSelection.selectNextTracksSubComponent(selectedElement);
            }
            else if (selectedElement.hasClass('contentButton')) {
                tracksRepresentationSelection.selectNextRepresentationComponent(selectedElement);
            }
            else {
                selectedElement.removeClass('selected');
                $('#tracksRepresentationButtonOk').addClass('selected');
            }
        }
        else {
            tracksRepresentationSelection.selectNextRepresentationComponent(selectedElement);
        }
        tracksRepresentationSelection.updateCheckmarks();
    },

    selectNextRepresentationComponent(selectedElement) {
        if (selectedElement.nextAll('button:first').length > 0) {
            selectedElement.removeClass('selected').nextAll('button:first').addClass('selected');
        } else {
            selectedElement.removeClass('selected').parent().parents('div').next().find('button:first').addClass('selected');
        }
    },

    selectNextTracksSubComponent(selectedElement) {
        if (!selectedElement.hasClass('contentButton')) {
            selectedElement.removeClass('selected').next().find("button:first").addClass('selected');
        } else if (selectedElement.parent().next().find("button:first").length > 0) {
            selectedElement.removeClass('selected').parent().next().find("button:first").addClass('selected');
        } else if (selectedElement.parent().closest('div').next().length > 0) {
            selectedElement.removeClass('selected').parent().closest('div').next().addClass('selected');
        } else if (selectedElement.nextAll('button:first').length == 0) {
            selectedElement.removeClass('selected').parent().parents('div').next().find('button:first').addClass('selected');
        }
    },

    updateCheckmarks() {
        let findBlueCheckmark = $('#tracksRepresentationContainer').find('.blueCheckmark');
        if (!findBlueCheckmark.hasClass('selected')) {
            findBlueCheckmark.removeClass('blueCheckmark');
            findBlueCheckmark.addClass('whiteCheckmark');
        }
        let findWhiteCheckmark = $('#tracksRepresentationContainer').find('.whiteCheckmark');
        if (findWhiteCheckmark.hasClass('selected')) {
            findWhiteCheckmark.removeClass('whiteCheckmark');
            findWhiteCheckmark.addClass('blueCheckmark');
        }
    },

    up() {
        if ($('#tracksRepresentationContainer >.collapsible').hasClass('selected')) {
            return;
        }
        $('#tracksRepresentationButtonOk').removeClass('selected');
        if ($('#tracksRepresentationButtonCancel').hasClass('selected')) {
            $('#tracksRepresentationButtonMenu').addClass('selected');
            $('#tracksRepresentationButtonCancel').removeClass('selected');
        }
        if ($('#tracksRepresentationContainer').css('display') == 'none' || $('#tracksRepresentationButtonMenu').hasClass('selected')) {
            return;
        }
        let selectedElement = $('#tracksRepresentationContainer').find('.selected');
        if (selectedElement.length == 0) {
            if ($('#tracksRepresentationContainer > .collapsible').last().hasClass('active')) {
                selectedElement = $('.contentButton').last().addClass('selected');
            } else {
                selectedElement = $('#tracksRepresentationContainer > .collapsible').last().addClass('selected');
            }
            tracksRepresentationSelection.updateCheckmarks();
            return;
        }
        if (selectedElement.prevAll('button:first').hasClass('active')) {
            tracksRepresentationSelection.selectPreviousTracksSubComponent(selectedElement);
        }
        else if (selectedElement.hasClass('contentButton')) {
            tracksRepresentationSelection.selectPreviousTracksComponent(selectedElement)
        }
        else {
            tracksRepresentationSelection.selectPreviousTracksComponent(selectedElement);
        }
        tracksRepresentationSelection.updateCheckmarks();
    },

    selectPreviousTracksComponent(selectedElement) {
        if (selectedElement.prevAll('button:first').length > 0) {
            selectedElement.removeClass('selected').prevAll('button:first').addClass('selected');
        }
        else {
            selectedElement.removeClass('selected').parent().closest('div').prev().addClass('selected');
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

    setAbrManagementCallback() {
        let ResetToDefaultButton = $('#tracksRepresentationContainer button:first-child');
        if (ResetToDefaultButton.hasClass('whiteCheckmark')) {
            return;
        }
        $("#abrManagementBox").show();
        navigation.hide();
        playbackControl.Hide();
        Input.setActiveComponent(abrManagementMenu);
        tracksRepresentationSelection.subComponent = abrManagementMenu;
        let selectedElement = $('#abrManagementBox').find('.selected');
        selectedElement.removeClass('selected');

    },

    ok() {
        if ($('#settingsTracksRepresentationDiv').css('display') == 'none') {
            return;
        }
        $('#settingsTracksRepresentationDiv .selected').blur();
        $('#settingsTracksRepresentationDiv .selected').trigger('click');
    },

    //Track representation selection buttons
    buttonCancel() {
        if ($('#trackRepresentationVideo').hasClass('active')) {
            $('#trackRepresentationVideo').click();
        }
        tracksRepresentationSelection.Hide();
        Input.setActiveComponent(playbackControl);
        $('#playPause').removeClass('selected');
        $('#bitRate').addClass('selected');
    },

    buttonOk() {
        let hasOptionsClass = false;
        let selectedElement = this.firstVideoTrack;
        let selectedOptions = selectedElement.find('options');
        let representationButtonIterator = selectedElement;
        let resetRepresentationBtn = $('#tracksRepresentationContainer button:first-child')
        let representations = playerHandler.player.get_track_representations();

        if (abrManagementMenu.maxIndex == -1) {
            abrManagementMenu.maxIndex = representations.length - 1;
        }

        if (abrManagementMenu.minIndex !== 0 && abrManagementMenu.startIndex === -1) {
            abrManagementMenu.startIndex = abrManagementMenu.minIndex;
        }

        if (abrManagementMenu.minIndex > abrManagementMenu.maxIndex) {
            Notification.turnOnNotification(3000, "Wrong min/max ids");
            abrManagementMenu.resetIndexes();
            return;
        }
        else if (abrManagementMenu.startIndex !== -1
            && (abrManagementMenu.minIndex > abrManagementMenu.startIndex
                || abrManagementMenu.maxIndex < abrManagementMenu.startIndex)) {
            Notification.turnOnNotification(3000, "Wrong start id");
            abrManagementMenu.resetIndexes();
            return;
        }

        for (let i = 0; i < representations.length; i++) {
            if (representationButtonIterator.hasClass('whiteCheckmark')) {
                this.checkmarkIndex = i;
                break;
            }
            representationButtonIterator = representationButtonIterator.next();
        }

        while (selectedElement.next().length > 0) {
            if (selectedOptions.hasClass('abrStart') ||
                selectedOptions.hasClass('abrMin') ||
                selectedOptions.hasClass('abrMax')) {
                hasOptionsClass = true;
                break;
            }
            selectedElement = selectedElement.closest('button').next();
            selectedOptions = selectedElement.find('options');
        }


        if (hasOptionsClass) {
            playerHandler.player
                .set_start_bandwidth(abrManagementMenu.startIndex !== -1 ?
                    representations[abrManagementMenu.startIndex].bitrate : -1)
                .set_bandwidth_range(
                    representations[abrManagementMenu.minIndex].bitrate || -1,
                    representations[abrManagementMenu.maxIndex].bitrate || -1
                );
        }
        else if (representations[this.checkmarkIndex]) {
            playerHandler.player.set_bandwidth_range(
                representations[this.checkmarkIndex].bitrate,
                representations[this.checkmarkIndex].bitrate);
        }
        //In case the range should be fully available
        if (resetRepresentationBtn.hasClass('whiteCheckmark')) {
            abrManagementMenu.resetIndexes();
            abrManagementMenu.maxIndex = representations.length - 1;
            playerHandler.player.set_bandwidth_range(
                representations[abrManagementMenu.minIndex].bitrate,
                representations[abrManagementMenu.maxIndex].bitrate);
            resetRepresentationBtn.removeClass('whiteCheckmark');
        }
        if ($('#trackRepresentationVideo').hasClass('active')) {
            $('#trackRepresentationVideo').click();
        }
        this.exit();
    },

    exit() {
        if ($('#trackRepresentationVideo').hasClass('active')) {
            $('#trackRepresentationVideo').click();
        }
        this.Hide();
        Input.setActiveComponent(playbackControl);
        $('#playPause').removeClass('selected');
        $('#bitRate').addClass('selected');
    },

    right() {
        if ($('#tracksRepresentationContainer button').hasClass('selected')) {
            $('#tracksRepresentationContainer button').removeClass('selected');
            $('#tracksRepresentationButtonMenu').addClass('selected');
        }
        else if ($('#tracksRepresentationButtonOk').hasClass('selected')) {
            $('#tracksRepresentationButtonOk').removeClass('selected');
            $('#tracksRepresentationButtonCancel').addClass('selected');
        }
        tracksRepresentationSelection.updateCheckmarks();
    },

    left() {
        if ($('#tracksRepresentationButtonMenu').hasClass('selected')) {
            $('#tracksRepresentationButtonMenu').removeClass('selected');
            let col = $("#tracksRepresentationContainer").find('.collapsible');
            if (col.hasClass('active')) {
                $("#tracksRepresentationContainer button:last").addClass('selected');
            }
            else {
                $('#tracksRepresentationContainer button:first').addClass('selected');
            }
        }
        else if ($('#tracksRepresentationButtonCancel').hasClass('selected')) {
            $('#tracksRepresentationButtonCancel').removeClass('selected');
            $('#tracksRepresentationButtonOk').addClass('selected');
        }
        tracksRepresentationSelection.updateCheckmarks();
    },

    scrollOnArrowDown() {
        let selectedElement = $('#tracksRepresentationContainer').find('.selected');

        if (selectedElement.length == 0) {
            return;
        }
        // Element’s Position Relative to the BrowserWindow
        let elementPosition = selectedElement[0].getBoundingClientRect();
        let elementOffsetHeight = selectedElement[0].offsetHeight * (selectedElement.hasClass('collapsible') ? 1.3 : 1.2);

        if (elementPosition.bottom > $("#tracksRepresentationContainer").height()) {
            $("#tracksRepresentationContainer").scrollTop($("#tracksRepresentationContainer").scrollTop() + elementOffsetHeight);
        }
    },

    scrollOnArrowUp() {
        let selectedElement = $('#tracksRepresentationContainer').find('.selected');

        if (selectedElement.length == 0) {
            return;
        }
        // Element’s Position Relative to the BrowserWindow
        let elementPosition = selectedElement[0].getBoundingClientRect();
        let elementOffsetHeight = selectedElement[0].offsetHeight * (selectedElement.hasClass('collapsible') ? 1.4 : 1.2);

        if (elementPosition.top < 0) {
            $("#tracksRepresentationContainer").scrollTop($("#tracksRepresentationContainer").scrollTop() - elementOffsetHeight);
        }
    }
};

let abrManagementMenu = {
    maxIndex: -1,
    minIndex: 0,
    startIndex: -1,
    up() {
        let selectedElement = $('#abrManagementBody').find('.selected');
        $('#abrManagementBody .selected').blur();
        if (selectedElement.length == 0) {
            selectedElement = $('#abrManagementBody').last().addClass('selected');
            return;
        }
        if (selectedElement.prev().length > 0) {
            selectedElement.removeClass('selected').prev().addClass('selected');
        }
    },
    down() {
        let selectedElement = $('#abrManagementBody').find('.selected');
        $('#abrManagementBody .selected').blur();
        if (selectedElement.length == 0) {
            selectedElement = $('#abrManagementBody button').first().addClass('selected');
            return;
        }
        if (selectedElement.next().length > 0) {
            selectedElement.removeClass('selected').next().addClass('selected');
        }
    },
    exit() {
        $("#abrManagementBox .selected").removeClass('selected');
        $("#abrManagementBox").hide();
        tracksRepresentationSelection.Show();
        $("#tracksRepresentationButtonMenu").addClass('selected');
        $('#tracksRepresentationContainer .collapsible').addClass('active');
    },
    ok() {
        let selectedElement = $('#abrManagementBox').find('.selected');
        if (selectedElement.hasClass("selected")) {
            selectedElement.trigger("click");

            Input.setActiveComponent(tracksRepresentationSelection);
        }
    },
    updateIndex() {
        this.resetIndexes();
        let selectedElement = tracksRepresentationSelection.firstVideoTrack;
        let selectedOptions = selectedElement.find('options');
        let representations = playerHandler.player.get_track_representations();
        for (let i = 0; i < representations.length; i++) {
            if (selectedOptions.hasClass('abrStart')) {
                this.startIndex = i;
            }
            if (selectedOptions.hasClass('abrMin')) {
                this.minIndex = i;
            }
            if (selectedOptions.hasClass('abrMax')) {
                this.maxIndex = i;
            }
            selectedElement = selectedElement.closest('button').next();
            selectedOptions = selectedElement.find('options');
        }
    },
    //Abr management button functions
    start() {
        let findWhiteCheckmarkStart = $('#tracksRepresentationContainer .whiteCheckmark').find('options');
        if (findWhiteCheckmarkStart.hasClass("abrStart")) {
            findWhiteCheckmarkStart.removeClass("abrStart");
            this.startIndex = -1;
        }
        else {
            $('#tracksRepresentationContainer .abrStart').removeClass("abrStart");
            findWhiteCheckmarkStart.addClass("abrStart");
            this.updateIndex();
        }
        this.exit();
    },
    min() {
        let findWhiteCheckmarkMin = $('#tracksRepresentationContainer .whiteCheckmark').find('options');
        if (findWhiteCheckmarkMin.hasClass("abrMin")) {
            findWhiteCheckmarkMin.removeClass("abrMin");
            this.minIndex = 0;
        }
        else {
            $('#tracksRepresentationContainer .abrMin').removeClass("abrMin");
            findWhiteCheckmarkMin.addClass("abrMin");
            this.updateIndex();
        }
        this.exit();
    },
    max() {
        let findWhiteCheckmarkMax = $('#tracksRepresentationContainer .whiteCheckmark').find('options');
        if (findWhiteCheckmarkMax.hasClass("abrMax")) {
            findWhiteCheckmarkMax.removeClass("abrMax");
            this.maxIndex = -1;
        }
        else {
            $('#tracksRepresentationContainer .abrMax').removeClass("abrMax");
            findWhiteCheckmarkMax.addClass("abrMax");
            this.updateIndex();
        }
        this.exit();
    },
    resetIndexes() {
        this.startIndex = -1;
        this.minIndex = 0;
        this.maxIndex = - 1;
    },
    reset() {
        $('#tracksRepresentationContainer .abrMax').removeClass("abrMax");
        $('#tracksRepresentationContainer .abrMin').removeClass("abrMin");
        $('#tracksRepresentationContainer .abrStart').removeClass("abrStart");
        this.resetIndexes();
        this.exit();
    },
}
export default tracksRepresentationSelection;
