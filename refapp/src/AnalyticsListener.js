"use strict";


import FormatData from "./utils/formatData.js"
import analyticsOverlay from "./ui/analyticsOverlay.js";


let AnalyticsListener = {
    player: null,
    listener: null,
    stateChangedCallbackList_: [],
    start(player) {

        this.player = player;
        this.listener = new this.player.IListener("AnalyticsListener");
        this.player.register_listener(this.listener, "USER_DATA");
        let _this = this;



        this.listener.on_video_format_changed = function (Video_format_data) {
            analyticsOverlay.resolutionRefresh(Video_format_data.previous_resolution, Video_format_data.current_resolution)
            analyticsOverlay.bitrateRefresh(Video_format_data.bitrate);
            analyticsOverlay.videoCodecRefresh(Video_format_data.video_codec);
        }
        this.listener.on_audio_format_changed = function (Audio_format_data) {
            analyticsOverlay.audioCodecRefresh(Audio_format_data.audio_codec);
            analyticsOverlay.audioSampleRateRefresh(Audio_format_data.sample_rate)
            analyticsOverlay.audioChannelCountRefresh(Audio_format_data.channels_count);
        }
        this.listener.on_subtitle_format_changed = function (Subtitle_format_data) {
            analyticsOverlay.subtitleInputFormatRefresh(Subtitle_format_data.subtitle_input_format);
        }
        this.listener.on_bandwidth_estimation_changed = function (Bandwidth_estimation_data) {
            analyticsOverlay.downloadSpeedRefresh(Bandwidth_estimation_data.bandwidth);
        }
        this.listener.on_first_frame_rendered = function () {
            analyticsOverlay.firstFrameRenderedRefresh(FormatData.timestamp_for_analytics(new Date()));
        }
        this.listener.on_end_of_stream = function (Callback_data) {
            analyticsOverlay.endOfStreamRefresh(FormatData.timestamp_for_analytics(new Date()))
        }

        this.listener.on_state_changed = function (on_state_changed_data) {
            analyticsOverlay.stateChangedRefresh(getPlayerStateFormated(on_state_changed_data.old_state), getPlayerStateFormated(on_state_changed_data.new_state));
            analyticsUpdate();
        }
        this.listener.on_stall_start = function (Stall_start_data) {
            analyticsOverlay.stallStartRefresh(FormatData.timestamp_for_analytics(new Date()) + " [reason = " + Stall_start_data.reason + "]");
        }
        this.listener.on_stall_stop = function () {
            analyticsOverlay.stallStopRefresh(FormatData.timestamp_for_analytics(new Date()));
            analyticsOverlay.frameAnalytics();
        }
        this.listener.on_playback_speed_changed = function (playback_speed) {
            analyticsOverlay.playbackSpeedRefresh(playback_speed)
        }
        this.listener.on_subtitle_enabled = function () {
            analyticsOverlay.subtitleRefresh(true);
        }
        this.listener.on_subtitle_disabled = function () {
            analyticsOverlay.subtitleRefresh(false);
        }
        function analyticsUpdate() {
            analyticsOverlay.currentPlayingUrlRefreshAnalytics();
            analyticsOverlay.streamingProtocolRefresh();
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
    },



}

export default AnalyticsListener;