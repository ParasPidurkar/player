import playbackControls from "./playbackControl.js"
import Input from "../input.js"
import playerHandler from "../playerHandler.js"
import debugOverlay from "./debugOverlay.js"
import analyticsOverlay from "./analyticsOverlay.js";

let playbackSpeed = {
    name: "speedControl",
    Show() {
        $("#speedControlDiv").show();
        Input.setActiveComponent(this);
        $('.speedControlList').find('.checked').removeClass('checked').removeClass('selected');
        $('.speedControlList div[data-value="' + playerHandler.player.playback_speed().toFixed(2) + '"]').addClass("checked");
    },
    isPlaybackSpeed(target) {
        let parentDiv = $("#speedControlDiv");
        return target == parentDiv[0] || parentDiv[0].contains(target);
    },
    hide() {
        $("#speedControlDiv").hide();
        playbackControls.Show();
    },
    down() {
        let selectedElement = $('.speedControlList').find('.selected');
        if (selectedElement.length == 0) {
            selectedElement = $('.speedControlList div').first().addClass('selected');
            return;
        }
        if (selectedElement.next('div:first').length > 0) {
            selectedElement.removeClass('selected').next().addClass('selected');
        }
    },

    up() {
        let selectedElement = $('.speedControlList').find('.selected');
        if (selectedElement.length == 0) {
            selectedElement = $('.speedControlList div').last().addClass('selected');
            return;
        }
        if (selectedElement.prev('div:first').length > 0) {
            selectedElement.removeClass('selected').prev('div:first').addClass('selected');
        }
    },
    exit() {
        this.hide();
        if (debugOverlay.isInitalized) {
            debugOverlay.show();
        }
        if (analyticsOverlay.isShown) {
            analyticsOverlay.show();
        }
        Input.setActiveComponent(playbackControls);
        if ($('.speedControlList').find('.checked')[0].dataset.value != 1.00) {
            playbackControls.setTrickModeForPlaybackSpeed(true);
        }
        else {
            playbackControls.setTrickModeForPlaybackSpeed(false);
        }
    },
    ok(target) {
        $('.speedControlList').find('.checked').removeClass('checked').removeClass('selected');
        let isClickedOnButton = false;
        if (target) {
            if (target.tagName == "P") {
                target = target.parentNode;
                isClickedOnButton = true;
            }
            else {
                isClickedOnButton = Boolean(target.classList?.contains('speedControlItem'));
            }

            if (isClickedOnButton) {
                $(target).addClass('selected').addClass('checked');
            }
        }
        else {
            $('.speedControlList').find('.selected').addClass('checked');
            isClickedOnButton = true;
        }

        if (isClickedOnButton) {
            const speedValue = Number($('.speedControlList').find('.checked')[0].dataset.value)
            playerHandler.player.set_playback_speed(speedValue);
            localStorage.setItem('lastPlaybackSpeed', speedValue);
            this.exit();
        }
    }
}

export default playbackSpeed;