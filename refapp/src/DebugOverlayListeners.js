"use strict";

import debugOverlay from "./ui/debugOverlay.js";

let DebugOverlayListener = {
    player: null,
    listener: null,
    stateChangedCallbackList_: [],

    start(player) {

        this.player = player;
        this.listener = new this.player.IListener("DebugOverlayListener");
        this.player.register_listener(this.listener, "USER_DATA");
        let _this = this;

        this.listener.on_state_changed = function (on_state_changed_data) {
            let newState = getPlayerStateFormated(on_state_changed_data.new_state);

            debugOverlay.stateChangedRefresh(newState);

            if (newState === 'playing') {
                debugOverlay.resetStats();
            }

            propsUpdate();
        }

        this.listener.on_bandwidth_estimation_changed = function (Bandwidth_estimation_data) {
            debugOverlay.bandwidthChangedRefresh(Bandwidth_estimation_data.bandwidth);
        }

        this.listener.on_video_format_changed = function (Video_format_data) {
            debugOverlay.videoTrackChangedRefresh();

            propsUpdate();
        }

        this.listener.on_audio_format_changed = function (Audio_format_data) {
            debugOverlay.audioTrackChangedRefresh();

            propsUpdate();
        }

        this.listener.on_subtitle_format_changed = function (Subtitle_format_data) {
            debugOverlay.subtitleTrackChangedRefresh();

            propsUpdate();
        }

        this.listener.on_duration_changed = function () {
            debugOverlay.durationChangedRefresh();

            propsUpdate();
        }

        function getPlayerStateFormated(state) {
            switch (state) {
                case _this.player.State.stopped:
                    return 'stopped';
                case _this.player.State.prepared:
                    return 'prepared';
                case _this.player.State.paused:
                    return 'paused';
                case _this.player.State.playing:
                    return 'playing';
                case _this.player.State.preparing:
                    return 'preparing';
            }
        }

        function propsUpdate() {
            debugOverlay.getStreamingProtocolRefresh();
            debugOverlay.currentPlayingUrlRefresh();
            debugOverlay.contentEncriptedRefresh();
        }
    },
}

export default DebugOverlayListener;