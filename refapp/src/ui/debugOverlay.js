"use strict";

import playerHandler from "../playerHandler.js"

let debugOverlay = {
    playerState: null,
    text: null,
    playerHandler: null,
    timerId: null,
    isInitalized: null,
    duration: 0,

    launch() {
        if (localStorage['iw_debugOverlayActive'] == "true" || localStorage['iw_debugOverlayActive'] == undefined) {
            this.init();
        }
    },

    init() {
        this.isInitalized = true;
        localStorage['iw_debugOverlayActive'] = true;
        $("#debugOverlay").show();

        this.playerHandler = playerHandler;
        this.playerState = this.playerHandler?.getPlayerStateFormated(this.playerHandler.player?.get_state());

        let playerVersion = this.playerHandler.getVersion();
        $("#playerVersion").html(this).text(`Player version: ${playerVersion}`);
        $("#stateOfPlayback").html(this).text(`iwp::Player_state::${this.playerState || "N/A"} ; paths=${this.playerHandler.getOpenMediaPaths()?.length}`);
        this.resetStats();
        this.timerId = setInterval(() => {
            if (this.playerHandler.uri &&
                this.playerHandler.player.get_state() !== this.playerHandler.player.State.stopped) {
                debugOverlay.refresh();
            }
        }, 500);
    },

    setVersion(version) {
        $("#playerVersion").html(this).text(`Player version: ${version}`);
    },

    resetStats() {
        this.playerState = null;

        this.videoTrackChangedRefresh()
        this.audioTrackChangedRefresh();
        this.subtitleTrackChangedRefresh();
        this.currentPlayingUrlRefresh();
    },

    deinit() {
        this.hide();
        clearInterval(this.timerId);
        this.timerId = null;
        this.isInitalized = false;
        localStorage['iw_debugOverlayActive'] = this.isInitalized;
    },

    stateChangedRefresh(newState) {
        this.playerState = newState;
        $("#stateOfPlayback").html(this).text(`iwp::Player_state::${this.playerState || "N/A"} ; paths=${this.playerHandler.getOpenMediaPaths()?.length}`);
    },

    bandwidthChangedRefresh(bandwidth) {
        if (this.playerHandler && this.playerHandler.getStreamingProtocol() != "HTTP") {
            $("#bandwidthPrint").html(this).text(`Bandwidth: ${bandwidth ? (bandwidth / 1000000).toFixed(2) : "N/A"}  Mbps `);
        }
    },

    videoTrackChangedRefresh() {
        this.playerHandler && this.playerHandler.player && this.playerHandler.player.get_available_tracks(playerHandler.player.Media_type.video).then((video_track) => {
            if (video_track) {
                let track_index = video_track.findIndex(track => track.open);

                if (video_track[track_index]) {
                    $("#videoTrackDebug").html(this).text(track_index != -1 ? "Track - " + video_track[track_index].Get_Human_Readable_String() : '');
                }
            }
        });
    },

    audioTrackChangedRefresh() {
        this.playerHandler && this.playerHandler.player && this.playerHandler.player.get_available_tracks(playerHandler.player.Media_type.audio).then((audio_tracks) => {
            let audio_track_idx = audio_tracks.findIndex(track => track.open);
            $("#audioTrackDebug").html(this).text(audio_track_idx != -1 ? "Track - " + audio_tracks[audio_track_idx].Get_Human_Readable_String() : '');
        });
    },

    subtitleTrackChangedRefresh() {
        this.playerHandler && this.playerHandler.player && this.playerHandler.player.get_available_tracks(playerHandler.player.Media_type.subtitle).then((subtitle_tracks) => {
            let track_index = subtitle_tracks.findIndex(track => track.open);
            $("#subtitleTrackDebug").html(this).text(track_index != -1 ? "Track - " + subtitle_tracks[track_index].Get_Human_Readable_String() : '');
        });
    },

    getStreamingProtocolRefresh() {
        $("#streamingProtocolDebug").html(this).text(`Streaming protocol:  ${this.playerHandler && this.playerHandler.getStreamingProtocol()}`);
    },

    durationChangedRefresh() {
        let duration = this.playerHandler?.player.get_duration() || null;

        if (duration !== this.duration) {
            this.duration = duration;
            $("#durationPrint").html(this).text(`Duration:  ${Math.round((this.duration / this.playerHandler.nanosec), 2)} sec\ ( ${(this.duration?.toFixed(0) || 0) / 1000} uS ) `);
        }
    },

    currentPlaybackTimeRefresh(currentPlaybackTime) {
        if (this.playerHandler && currentPlaybackTime != null) {
            $("#positionDebug").html(this).text(`Position: ${(currentPlaybackTime / this.playerHandler.nanosec).toFixed(2)} sec ( ${(currentPlaybackTime / 1000).toFixed(0)} uS ) `);
        }
    },

    currentPlayingUrlRefresh() {
        $("#currentlyPlaying").html(this).text(`Playing: '${this.playerHandler.uri || 'N/A'}'`);
    },

    startTimeRefresh(startTime) {
        $("#startTime").html(this).text(`Start time: ${startTime + ' sec' || 'N/A'}`);
    },

    contentEncriptedRefresh() {
        this.playerHandler && $("#contentEncrypted").html(this).text(`Content encrypted: ${this.playerHandler.drm_scheme ? 'Yes' : 'No'}`);
    },

    refresh() {
        if (playerHandler.isVod()) {
            $("#liveEdgeDistance").html(this).text(`Live edge distance: N/A`);
        } else {
            let liveOffset = playerHandler.player.get_live_offset();
            $("#liveEdgeDistance").html(this).text(`Live edge distance:\
             ${(liveOffset < 0 ? 0 : liveOffset / 1e6).toFixed(0)} ms`);
        }

        let range = this.playerHandler.player.get_timestamp_range();
        $("#rollingBufferRange").html(this).text(`Rolling buffer range: \
        ${(range.start_timestamp * 1000000).toFixed(0) || '0'} - ${(range.end_timestamp * 1000000).toFixed(0) || '0'} `);
    },

    show() {
        $("#debugOverlay").show();
    },

    hide() {
        $("#debugOverlay").hide();
    },

    isVisible() {
        return $("#debugOverlay").is(":visible");
    }
};

export default debugOverlay;
