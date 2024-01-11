"use strict";

import platform from "../platform.js";
import playerHandler from "../playerHandler.js"
import FormatData from "../utils/formatData.js"

let analyticsOverlay = {
    playerStateOld: null,
    playerStateNew: null,
    firstFrameRendered: null,
    currentPlaybackTime: null,
    downloadSpeed: null,
    stallStart: null,
    stallStop: null,
    stallStartTime: null,
    stallEndTime: null,
    numStall: 0,
    endOfStream: null,
    audioCodec: null,
    audioChannelCount: null,
    audioSampleRate: null,
    subtitleInputFormat: null,
    currentVideoResolution: null,
    previousVideoResolution: null,
    videoCodec: null,
    bitrate: null,
    text: null,
    playerHandler: null,
    timerId: null,
    isShown: false,
    subtitleEnabled: true,
    launch() {
        if (localStorage['iw_analyticsOverlayActive'] == "true") {
            this.init();
        }
        this.resetStats();
    },

    init() {
        this.isShown = true;
        this.show();
        localStorage['iw_analyticsOverlayActive'] = "true";

        this.playerHandler = playerHandler;
        let playerName = "iWedia OTT Player";
        $("#playerName").html(this).text(`Player name: ${playerName}`);
        $("#playerVersionAnalytics").html(this).text(`Player version: ${this.playerHandler?.player?.version}`);
    },

    setVersion(version) {
        $("#playerVersionAnalytics").html(this).text(`Player version: ${version}`);
    },

    resetStats() {
        this.playerStateOld = null;
        this.playerStateNew = null;
        this.firstFrameRendered = null;
        this.currentPlaybackTime = null;
        this.downloadSpeed = null;
        this.bitrate = null;
        this.currentVideoResolution = null;
        this.previousVideoResolution = null;
        this.videoCodec = null;
        this.stallStart = null;
        this.stallStop = null;
        this.stallStartTime = null;
        this.stallEndTime = null;
        this.numStall = 0;
        this.endOfStream = null;
        this.audioChannelCount = null;
        this.audioCodec = null;
        this.audioSampleRate = null;
        this.subtitleInputFormat = null;
        this.subtitleEnabled = true;

        $("#deviceName").html(this).text('Device: N/A');
        $("#osName").html(this).text('OS: N/A');
        $("#browserName").html(this).text('Browser: N/A');
        $("#serialNo").html(this).text('Serial No. : N/A');
        $("#stateChanged").html(this).text('State changed: N/A');
        $("#firstFrameRendered").html(this).text("First frame rendered: N/A");
        $("#totalTimeToFirstFrameRenderer").html(this).text("Total time to First frame renderer: N/A");
        $("#downloadSpeed").html(this).text("Download speed: N/A");
        $("#droppedFrames").html(this).text("Frames dropped: N/A");
        $("#lowBandwidth").html(this).text("Low bandwidth: N/A");
        $("#stallStart").html(this).text("Stall start: N/A");
        $("#stallStop").html(this).text("Stall stop: N/A");
        $("#totalStalls").html(this).text("Total Stalls: N/A");
        $("#averageStallTime").html(this).text("Average Stall time: N/A");
        $("#endOfStream").html(this).text("End of stream: N/A");
        $("#audioCodec").html(this).text("Audio codec changed: N/A");
        $("#audioChannels").html(this).text("Audio channel count changed: N/A");
        $("#audioSampleRate").html(this).text("Audio sample rate changed: N/A");
        $("#subtitleFormat").html(this).text("Subtitle input format changed: N/A");
        $("#resolution").html(this).text("Video resolution changed: Current=N/A, Previous:N/A");
        $("#bitrate").html(this).text("Video bitrate changed:N/A");
        $("#videoCodec").html(this).text("Video codec changed:N/A");
        $("#subtitleEnabled").html(this).text("Subtitle: Enabled");
        $("#playingUri").html(this).text("Playing URI: N/A");
        $("#streamingProtocol").html(this).text("Streaming protocol: N/A");
        $("#videoForwardBuffer").html(this).text("Video Forward Buffer:N/A");
        $("#videoBackwardBuffer").html(this).text("Video Backward Buffer:N/A");
        $("#audioForwardBuffer").html(this).text("Audio Forward Buffer:N/A");
        $("#audioBackwardBuffer").html(this).text("Audio Backward Buffer:N/A");

        this.currentPlayingUrlRefreshAnalytics();
        this.deviceInfoRefresh();
    },

    deinit() {
        this.hide();
        this.isShown = false;
        clearInterval(this.timerId);
        this.timerId = null;
        localStorage['iw_analyticsOverlayActive'] = this.isShown;
    },

    endOfStreamRefresh(endOfStreamVaule) {
        this.endOfStream = endOfStreamVaule
        $("#endOfStream").html(this).text("End of stream: last event happened at " + endOfStreamVaule);
        $("#stateChanged").html(this).text("State changed: old state[" + this.playerStateOld + "] new state[" + this.playerStateNew + ']');

    },
    stateChangedRefresh(oldState, newState) {
        this.playerStateOld = oldState;
        this.playerStateNew = newState;
        if (this.playerStateOld != null || this.playerStateNew != null) {
            $("#stateChanged").html(this).text("State changed: old state[" + this.playerStateOld + "] new state[" + this.playerStateNew + ']');
        }
    },
    firstFrameRenderedRefresh(firstFrameRendered) {
        this.firstFrameRendered = firstFrameRendered;
        if (this.firstFrameRendered != null) {
            $("#firstFrameRendered").html(this).text("First frame rendered: last event happened at " + this.firstFrameRendered);
        }
    },
    downloadSpeedRefresh(speed) {
        if (!this.isShown) return;
        if (this.playerHandler) {
            $("#droppedFrames").html(this)
                .text("Frames dropped: " + this.playerHandler.player.analyticsManager.get_dropped_frames_number() || 'N/A');
            this.downloadSpeed = speed;
            if (this.downloadSpeed != null) {
                $("#downloadSpeed").html(this).text("Download speed: " + (this.downloadSpeed / 1000000).toFixed(2) + " Mbps");
                if (this.downloadSpeed < 1.5) {
                    $("#lowBandwidth").html(this).text("Low bandwidth: last event happened at " + FormatData.timestamp_for_analytics(new Date()));
                }
            }
        }
    },
    stallStartRefresh(stallStart) {
        this.stallStart = stallStart;
        this.stallStartTime = new Date().getTime();
        if (this.stallStart != null) {
            $("#stallStart").html(this).text("Stall start: last event happened at " + this.stallStart);
        }
    },
    stallStopRefresh(stallStop) {
        this.stallStop = stallStop;
        this.stallEndTime = new Date().getTime();
        this.numStall++;
        if (this.stallStop != null) {
            $("#stallStop").html(this).text("Stall stop: last event happened at " + this.stallStop);
        }
        $("#totalStalls").html(this).text("Total stalls: " + this.numStall);
        $("#averageStallTime").html(this).text("Average stall time: " + (this.stallEndTime - this.stallStartTime) + 'ms');
    },
    audioCodecRefresh(audioCodec) {
        this.audioCodec = audioCodec;
        if (this.audioCodec != null) {
            $("#audioCodec").html(this).text("Audio codec changed: " + this.audioCodec);
        }
    },
    audioChannelCountRefresh(audioChannelCount) {
        this.audioChannelCount = audioChannelCount;
        if (this.audioChannelCount != null) {
            $("#audioChannels").html(this).text("Audio channel count changed: " + this.audioChannelCount + " channels");
        }
    },
    audioSampleRateRefresh(audioSampleRate) {
        this.audioSampleRate = audioSampleRate;
        if (this.audioSampleRate != null) {
            $("#audioSampleRate").html(this).text("Audio sample rate changed: " + this.audioSampleRate + " Khz");
        }
    },
    subtitleInputFormatRefresh(subtitleInputFormat) {
        this.subtitleInputFormat = subtitleInputFormat;
        if (this.subtitleInputFormat != null) {
            $("#subtitleFormat").html(this).text("Subtitle input format changed: " + this.subtitleInputFormat);
        }
    },
    resolutionRefresh(previousVideoResolution, currentVideoResolution) {
        this.currentVideoResolution = currentVideoResolution;
        this.previousVideoResolution = previousVideoResolution;
        if (this.currentVideoResolution != null) {
            $("#resolution").html(this).text(`Video resolution changed: Current=${this.currentVideoResolution}, Previous=${this.previousVideoResolution === null ? "N/A" : this.previousVideoResolution}`);
        }
    },
    bitrateRefresh(bitrate) {
        this.bitrate = bitrate;
        if (this.bitrate != null) {
            $("#bitrate").html(this).text("Video bitrate changed : " + this.bitrate + " bps");
        }
    },
    videoCodecRefresh(videoCodec) {
        this.videoCodec = videoCodec;
        if (this.videoCodec != null) {
            $("#videoCodec").html(this).text("Video codec changed: " + this.videoCodec);
        }
    },
    subtitleRefresh(change) {
        this.subtitleEnabled = change;
        if (this.subtitleEnabled != null) {
            if (this.subtitleEnabled)
                $("#subtitleEnabled").html(this).text("Subtitle: Enabled");
            else
                $("#subtitleEnabled").html(this).text("Subtitle: Disabled");
        }
    },
    currentPlayingUrlRefreshAnalytics() {
        if (!this.isShown) return;
        $("#playingUri").html(this).text(`Playing URI: '${this.playerHandler?.uri || 'N/A'}'`);
    },
    playbackSpeedRefresh(playbackSpeed) {
        if (!this.isShown) return;
        $("#PlaybackSpeed").html(this).text(`Playback speed: '${playbackSpeed || 'N/A'}'`);
    },
    streamingProtocolRefresh() {
        if (!this.isShown) return;
        $("#streamingProtocol").html(this).text(`Streaming protocol: '${playerHandler.getStreamingProtocol() || 'N/A'}'`);
    },
    frameAnalytics() {
        if (!this.isShown) return;
        $("#droppedFrames").html(this)
            .text("Frames dropped: " + this.playerHandler.player.get_dropped_frames_number() || 'N/A');
    },
    startTimeRefresh(startTime) {
        $("#totalTimeToFirstFrameRenderer").html(this).text(`Total time to First frame renderer: ${startTime + ' sec' || 'N/A'}`);
    },
    deviceInfoRefresh() {
        $("#deviceName").html(this).text("Device: " + platform.getDeviceName());
        $("#osName").html(this).text("OS: " + platform.getOS());
        $("#browserName").html(this).text("Browser: " + platform.getBrowserName());
    },

    show() {
        $("#analyticsOverlay").show();
    },

    hide() {
        $("#analyticsOverlay").hide();
    },

    isVisible() {
        return $("#analyticsOverlay").is(":visible");
    },

};


export default analyticsOverlay;