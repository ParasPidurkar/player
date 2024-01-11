"use strict";

import mouseListeners from "./mouseListeners.js";
import Settings from "./settings.js";
import customStreamPicker from "./ui/customStreamPicker.js";
import playbackControl from "./ui/playbackControl.js";
import streamPicker from "./ui/streamPicker.js";
import Notification from "./utils/notification.js"
import Stream from "./streams/stream.js"
import FormatData from "./utils/formatData.js"
import UrlFormat from "./utils/urlForrmat.js";
import alertDialog from "./ui/alertDialog.js";
import navigation from "./ui/navigationArrows.js";
import analyticsOverlay from "./ui/analyticsOverlay.js";
import debugOverlay from "./ui/debugOverlay.js";
import debugOverlayStats from "./DebugOverlayListeners.js";
import { LogLevel, Log } from "./utils/logs.js"
import Input from "./input.js";
import analytics from "./AnalyticsListener.js"
import loadingSpinner from "./ui/loadingSpinner.js"


let playerHandler = {
    player: null,
    listener: null,
    width: null,
    height: null,
    nanosec: 1000000000,
    intervalCurrentTime: null,
    aspectRatio: 16 / 9,
    loopEnabled: false,
    iPlayerDOM: null,
    isDisposed: true,
    vodOffset: null,
    uri: "",
    lastUri: "",
    speed: 1,
    skipOffset: 10,
    trickModeStep: 10,
    trackIndexes: {
        audio: 0,
        video: 0,
        subtitle: -1
    },
    trickMode: null,
    drm_scheme: null,
    liveEdge: null,
    stateChangedCallbackList_: [],

    setManifestRetry(value) {
        if (value != null) {
            localStorage['iw_manifestRetry'] = value;
        } else {
            localStorage.removeItem("iw_manifestRetry");
        }
    },

    setSegmentRetry(value) {
        if (value != null) {
            localStorage['iw_segmentRetry'] = value;
        } else {
            localStorage.removeItem("iw_segmentRetry");
        }
    },

    setManifestTimeout(value) {
        if (value != null) {
            localStorage['iw_manifestTimeout'] = value;
        } else {
            localStorage.removeItem("iw_manifestTimeout");
        }
    },

    setSegmentTimeout(value) {
        if (value != null) {
            localStorage['iw_segmentTimeout'] = value;
        } else {
            localStorage.removeItem("iw_segmentTimeout");
        }
    },

    start() {
        window.onload = function () {
            streamPicker.Show();
            playerHandler.setcoordinates();

            // Calling Settings menu methods
            Settings.hideSettingsBit();
            Settings.hideSettingsMenu();
        };

        // Calling Player methods - controls
        playbackControl.registerActions(playerHandler);

        // Play Custom Stream List
        customStreamPicker.registerListener(this);

        mouseListeners.start(this);

    },

    getVersion() {
        return IWP.version;
    },

    initPlayer() {
        if (!this.isDisposed) {
            return;
        }
        this.player = new IWP(document.getElementById("videoDiv"), this.width, this.height, false);

        if (this.listener == null) {
            this.listener = new this.player.IListener("BasicListener");
        }

        analytics.start(this.player);
        debugOverlayStats.start(this.player);

        this.isDisposed = false;
        this.iPlayerDOM = document.getElementById("iPlayer");

        window.onresize = function (event) {
            playerHandler.setcoordinates();

            if (this.iPlayerDOM) {
                document.getElementById("iPlayer").style.width = width;
                document.getElementById("iPlayer").style.height = height;
            }
        };

        window.addEventListener('online', () => {
            Notification.turnOnNotification(3000, "Network connection established");
            playerHandler.play();

        });
        window.addEventListener('offline', () => {
            playerHandler.pause();
            Notification.turnOnNotification(3000, "Network connection is lost");

        });

        let playerActions = $.map($('#commandContainer button'), button => button.id);
        const removeActions = ['trackSelection', 'bitRate', 'playbackSpeed', 'restart', 'loop'];
        playerActions.forEach((element) => {
            if (removeActions.indexOf(element) > -1) {
                document.getElementById(element).classList.add('initial-player-action-state');
            } else {
                document.getElementById(element).classList.add('highlight-player-action');
            }
        });
        analyticsOverlay.setVersion(IWP.version);
        debugOverlay.setVersion(IWP.version);
    },

    setcoordinates() {
        if (window.innerWidth > window.innerHeight) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            document.getElementById("main").style.top = "0px";
        } else {
            this.width = window.innerWidth;
            this.height = window.innerWidth / this.aspectRatio;
            document.getElementById("main").style.top = (window.innerHeight - this.height) / 2 + "px";
        }
        document.getElementById("main").style.width = this.width + "px";
        document.getElementById("main").style.height = this.height + "px";
        this.setsliderstyle();
    },

    pauseResume() {
        if (this.trickMode) {
            this.trickMode.stop();
            this.trickMode = null;
            this.player.resume();
            playbackControl.setTrickMode(false);
            return;
        }

        //0-stop; 1-preparing; 2-prepared; 3-playing; 4-paused; 5-undefined;
        if (this.player.get_state() == this.player.State.playing) {
            this.player.pause();
            playbackControl.togglePause();
        } else if (this.player.get_state() == this.player.State.paused) {
            this.player.resume();
            playbackControl.togglePause();
        }
        this.triggerStateChanged(playerHandler.getPlayerStateFormated(this.player.get_state()));
        Log.debug("State changed to  " + playerHandler.getPlayerStateFormated(this.player.get_state()));
    },
    play() {
        if (this.trickMode) {
            this.trickMode.stop();
            this.trickMode = null;
            this.player.resume();
            playbackControl.setTrickMode(false);
            return;
        }
        if (this.player.get_state() == this.player.State.paused) {
            this.player.resume();
            playbackControl.togglePause();
        }
        this.triggerStateChanged(playerHandler.getPlayerStateFormated(this.player.get_state()));
        Log.debug("State changed to  " + playerHandler.getPlayerStateFormated(this.player.get_state()));
    },

    pause() {
        if (this.player.get_state() == this.player.State.playing) {
            this.player.pause();
            playbackControl.togglePause();

        }
        this.triggerStateChanged(playerHandler.getPlayerStateFormated(this.player.get_state()));
        Log.debug("State changed to  " + playerHandler.getPlayerStateFormated(this.player.get_state()));

    },

    stop() {
        this.player?.stop();
        analyticsOverlay.resetStats();
        this.triggerStateChanged(playerHandler.getPlayerStateFormated(this.player?.get_state()));
        Log.debug("State changed to  " + playerHandler.getPlayerStateFormated(this.player?.get_state()));
        this.isDisposed = true;
    },

    setsliderstyle() {
        let sliderWidth = this.width * 0.94;
        document.getElementById("slider").style.width = sliderWidth + "px";
        let style = document.createElement('style');
        style.innerHTML = '.slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 2%; height: 100px; border-radius: 0%; background: #00004d; cursor: pointer; box-shadow:-' + sliderWidth + 'px 0 0 ' + sliderWidth + 'px #005ce6;} .slider::-moz-range-thumb { -moz-appearance: none; appearance: none; width: 2%; height: 100px; border-radius: 0%; background: #00004d; cursor: pointer; box-shadow:-' + sliderWidth + 'px 0 0 ' + sliderWidth + 'px #005ce6;} .slider::slider-thumb { appearance: none; appearance: none; width: 2%; height: 100px; border-radius: 0%; background: #00004d; cursor: pointer; box-shadow:-' + sliderWidth + 'px 0 0 ' + sliderWidth + 'px #005ce6;} .slider::-o-slider-thumb { -o-appearance: none; appearance: none; width: 2%; height: 100px; border-radius: 0%; background: #00004d; cursor: pointer; box-shadow:-' + sliderWidth + 'px 0 0 ' + sliderWidth + 'px #005ce6;} .slider::-ms-thumb { -ms-appearance: none; appearance: none; width: 2%; height: 100px; border-radius: 0%; background: #00004d; cursor: pointer; box-shadow:-' + sliderWidth + 'px 0 0 ' + sliderWidth + 'px #005ce6;}';
        document.getElementsByTagName('head')[0].appendChild(style);
    },

    jumpForward() {
        if (this.player.get_state() == this.player.State.playing ||
            this.player.get_state() == this.player.State.paused) {
            if (this.isVod()) {
                let time = parseInt($("#slider").get(0).value) + this.skipOffset;

                if (time <= ((this.player.get_duration() / this.nanosec))) {
                    $("#slider").get(0).value = time;
                    $("#currentTimeText").text(FormatData.timestamp(Math.floor(time)));
                    this.player.seek(time * this.nanosec);
                }
            } else {
                let currTime = this.player.get_current_playback_time();
                if (currTime.available) {
                    let rightEdge = this.player.get_timestamp_range().end_timestamp;
                    let currentTime = currTime.timestamp;
                    let newTime = currentTime + this.skipOffset * this.nanosec;
                    if (newTime < rightEdge) {
                        $("#slider").get(0).value = newTime / 1e9;
                        this.player.seek(newTime);
                    }
                }

            }
        }
    },

    activateTrickMode(isForward) {
        playbackControl.setTrickMode(true);
        this.trickMode = new IWP.TrickModeController(this.player);
        this.trickMode.set_speed((isForward ? 1 : -1) * this.trickModeStep * this.nanosec).start();
    },

    isSpeedNormal() {
        return Math.abs(1.0 - this.player.playback_speed()) < 1e-9;
    },

    jumpBackward() {
        if (this.player.get_state() == this.player.State.playing || this.player.get_state() == this.player.State.paused) {
            if (this.isVod()) {
                let time = (parseInt($("#slider").get(0).value) - this.skipOffset) < 0 ? 0 : parseInt($("#slider").get(0).value) - this.skipOffset;

                $("#slider").get(0).value = time;
                $("#currentTimeText").text(FormatData.timestamp(time));
                this.player.seek((time) * this.nanosec);
            } else {
                let currTime = this.player.get_current_playback_time();
                if (currTime.available) {
                    let leftEdge = this.player.get_timestamp_range().start_timestamp;
                    let currentTime = currTime.timestamp;
                    let newTime = currentTime - this.skipOffset * this.nanosec;
                    if (newTime > leftEdge) {
                        $("#slider").get(0).value = newTime / 1e9;
                        this.player.seek(newTime);
                    }
                }
            }
        }
    },

    restartVideo() {
        if (this.trickMode) {
            this.trickMode.stop();
            this.trickMode = false;
        }
        this.speed = this.player.playback_speed();
        this.stop();
        this.changeStream({
            url: Stream.url,
            hint: Stream.hint,
            license: Stream.license,
            drm_scheme: Stream.drm_scheme
        }, true);
    },

    setVodOffset(value) {
        this.vodOffset = value;
    },

    setSkipOffset(value) {
        this.skipOffset = value;
    },

    setAbr(value) {
        this.abrValue = value;
    },

    setLiveEdgeDistance(value) {
        this.liveEdge = value;
        Notification.turnOnNotification(3000, "Not implemented yet");
        navigation.hide();
    },

    getAnalyticsOverlay() {
        Notification.turnOnNotification(3000, "Not implemented yet");
        navigation.hide();
    },

    isVod() {
        return !this.player?.is_live();
    },

    volumeUp() {
        let volume = this.player.get_volume();
        volume += 0.1;
        if (volume > 1) {
            return;
        }
        else {
            this.player.set_volume(volume);
        }
    },

    volumeDown() {
        let volume = this.player.get_volume();
        volume -= 0.1;
        if (volume < 0) {
            return;
        }
        else {
            this.player.set_volume(volume);
        }
    },

    muteUnmute() {
        if (!this.player.muted()) {
            this.player.set_muted(true);
            document.getElementById("muteUnmute").innerHTML = "UN-MUTE";
        } else {
            this.player.set_muted(false);
            document.getElementById("muteUnmute").innerHTML = "MUTE";
            document.getElementById("note").style.display = "none";
        }
    },

    seek(value) {
        this.player.seek(value);
    },

    goUnMute() {
        this.player.set_muted(false);
        document.getElementById("note").style.display = "none";
        document.getElementById("muteUnmute").innerHTML = "MUTE";
    },

    changeStream({ url, hint, license,
        drm_scheme, subtitle_uri, subtitle_mime_type, channelId, additional_sources }, useCachedTrackInfo = false) {
        let extrasData = [];
        if (subtitle_uri && subtitle_mime_type) {
            extrasData.push({ subtitle_uri, subtitle_mime_type });
        }
        if (!this.isDisposed) {
            return;
        }
        this.initPlayer();
        playbackControl.Show();
        playbackControl.resetButtonsState();
        let startTimeTimer = new Date();
        this.lastUri = localStorage.getItem('lastUri') || "";
        this.uri = url;
        this.drm_scheme = drm_scheme
        /**
         * @summary This is workaround in case of application is started with https:
         * stream must be hosted with https server please see details on link below
         * @link https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content
         */
        url = UrlFormat.fromHttpToHttps(url);

        const mediaDescriptor = {
            statrtPosition: this.vodOffset,
            sideloaded: extrasData,
            media_sources: [
                {
                    url,
                    hint,
                    channelId,
                    drmDescriptor: {
                        url: license,
                        scheme: drm_scheme
                    }
                }
            ]
        };
        mediaDescriptor.media_sources = mediaDescriptor.media_sources.concat(additional_sources?.map(as => {
            return {
                url: as.url,
                hint: as.hint,
                channelId: as.channelId,
                drmDescriptor: new IWP.Drm_descriptor({
                    url: as.license,
                    scheme: as.drm_scheme
                })
            }
        }) || []);
        this.player.prepare(mediaDescriptor);
        let _this = this;
        playbackControl.resetButtonsState();
        this.listener.on_state_changed = async function (State_changed_data) {
            //0-stop; 1-preparing; 2-prepared; 3-playing; 4-paused; 5-undefined;
            if (State_changed_data.new_state == playerHandler.player.State.prepared) {
                document.getElementById("slider").max = _this.player.get_duration() / _this.nanosec;
                _this.player.start();
                Stream.set_values(url, hint, license, drm_scheme);
                _this.retainRepresentationIfStreamRestarted();
                playbackControl.activateButtons();
                playbackControl.retainLoopIconStateIfAppRestarted();
            }

            if (State_changed_data.new_state == playerHandler.player.State.playing) {
                if (_this.isVod() && _this.speed) {
                    _this.retainPlaybackSpeedIfAppRestarted();
                }
                if (playerHandler.uri != "") {
                    localStorage.setItem('lastUri', playerHandler.uri);
                }
                _this.intervalCurrentTime = setInterval(function () {
                    let currentPlaybackTime = _this.player.get_current_playback_time().timestamp;
                    document.getElementById("slider").value = currentPlaybackTime / _this.nanosec;

                    if (_this.player.get_current_playback_time().timestamp
                        && _this.player.get_current_playback_time().available) {
                        debugOverlay.currentPlaybackTimeRefresh(currentPlaybackTime);

                        if (!analyticsOverlay.isVisible() && !debugOverlay.isVisible()) {
                            _this.player.analyticsManager.stop_bandwidth_update();
                        }
                        if (_this.isVod() && _this.player.protocol_name != "WAVE") {
                            $("#currentTimeText").text(FormatData.timestamp(Math.floor(currentPlaybackTime / _this.nanosec)));
                            $("#durationTimeText").text(FormatData.timestamp(Math.floor(_this.player.get_duration() / _this.nanosec)));
                            $("#leftEdgeText").text("00:00:00");
                            if (_this.speed) {
                                _this.player.set_playback_speed(_this.speed);
                                _this.speed = null;
                            }

                            if (_this.trickMode && _this.trickMode.state !== _this.trickMode.States.stopped) {
                                _this.trickMode.set_speed(_this.trickModeStep * _this.nanosec).start();
                            }
                        } else {
                            const { start_timestamp, end_timestamp } = _this.player.get_timestamp_range();
                            $("#leftEdgeText").text(FormatData.utcToLocalDate(start_timestamp));
                            $("#durationTimeText").text(FormatData.utcToLocalDate(end_timestamp));
                            $("#currentTimeText").text(FormatData.utcToLocalDate(currentPlaybackTime));
                            $("#slider").get(0).min = start_timestamp / 1e9;
                            $("#slider").get(0).max = end_timestamp / 1e9;
                        }
                    }
                }, 500);

                if (_this.isVod() && _this.trickMode && _this.trickMode.state === _this.trickMode.States.stopped) {
                    _this.trickMode = false;
                    playbackControl.setTrickMode(false);
                }

                //Reuse previous track information
                if (useCachedTrackInfo) {
                    for (const key in playerHandler.player.Media_type) {
                        let type = playerHandler.player.Media_type[key];
                        let tracks = await playerHandler.getAvailableTracks(type);
                        switch (type) {
                            case playerHandler.player.Media_type.audio:
                                playerHandler.openMediaPath(tracks[playerHandler.trackIndexes.audio].id,
                                    { type: type, index: playerHandler.trackIndexes.audio });
                                break;
                            case playerHandler.player.Media_type.video:
                                //Video tracks does not exist or change is not applicable
                                break;
                            case playerHandler.player.Media_type.subtitle:
                                if (playerHandler.trackIndexes.subtitle === -1) {
                                    break;
                                }
                                playerHandler.openMediaPath(tracks[playerHandler.trackIndexes.subtitle].id,
                                    { type: type, index: playerHandler.trackIndexes.subtitle });
                                break;
                            default:
                                break;
                        }
                    }
                } else {
                    playerHandler.trackIndexes = {
                        audio: 0,
                        video: 0,
                        subtitle: -1
                    };
                }
            }
            if (State_changed_data.new_state == playerHandler.player.State.stopped) {
                clearInterval(_this.intervalCurrentTime);
                _this.intervalCurrentTime = null;
            }
            navigation.hide();
            if (!alertDialog.isShown && State_changed_data.new_state != playerHandler.player.State.stopped && playerHandler.loopEnabled == false) {
                playbackControl.Show();
            }
        }
        this.listener.on_error = function (Error_data) {
            alertDialog.show(Error_data.exception);
            Log.error(Error_data.exception);
        }
        this.listener.on_first_frame_rendered = function () {
            debugOverlay.startTimeRefresh(FormatData.milisecToSec(new Date() - startTimeTimer));
        }
        this.listener.on_stall_start = function (Stall_start_data) {
            loadingSpinner.show();
        }
        this.listener.on_stall_stop = function () {
            loadingSpinner.hide();
            analyticsOverlay.startTimeRefresh(FormatData.milisecToSec(new Date() - startTimeTimer));
        }
        this.player.register_listener(this.listener, "USER_DATA");

        this.listener.on_end_of_stream = function (Callback_data) {
            $("#stateOfPlayback").html(this).text(`iwp::Player_state::${debugOverlay.playerState || "N/A"} ; paths=${playerHandler.getOpenMediaPaths().length}`);
            Log.debug("listener [on_end_of_stream]");
            if (playerHandler.trickMode) {
                playerHandler.trickMode.stop();
                playerHandler.trickMode = null;
            }
            if (playerHandler.loopEnabled) {
                playbackControl.setBitrateToLocalStorage()
                playerHandler.speed = playerHandler.player.playback_speed();
                playerHandler.stop();
                playerHandler.changeStream({
                    url: Stream.url,
                    hint: Stream.hint,
                    license: Stream.license,
                    drm_scheme: Stream.drm_scheme
                }, true);
            } else {
                playerHandler.trickMode = false;
            }
            Notification.turnOnNotification(3000, "End of stream reached");
        }
        if (this.player.get_state() == this.player.State.stopped && hint !== "wave") {
            $.ajax({
                url: url,
                error: function (data) {
                    alertDialog.show("The media could not be loaded, either because the server or network failed or because CORS blocking policy. ");
                }
            })
        }
    },

    getPlayerStateFormated(state) {
        if (this.player == null) {
            return 'stopped';
        }
        switch (state) {
            case this.player.State.stopped:
                return 'stopped';
            case this.player.State.preparing:
                return 'preparing';
            case this.player.State.prepared:
                return 'prepared';
            case this.player.State.paused:
                return 'paused';
            case this.player.State.playing:
                return 'playing';
        }
    },

    registerStateCallback(callback) {
        this.stateChangedCallbackList_.push(callback);
    },

    unregisterStateCallback(callback) {
        this.stateChangedCallbackList_ = this.stateChangedCallbackList_.filter(
            cb => cb !== callback
        );
    },

    triggerStateChanged(newState) {
        this.stateChangedCallbackList_.forEach(cb => cb({ newState: newState }));
    },

    getOpenMediaPaths(mediaType) {
        return this.player?.get_open_media_paths(mediaType);
    },

    closeMediaPath(id) {
        return this.player.close_media_path(id);
    },

    getAvailableTracks(mediaType) {
        return this.player.get_available_tracks(mediaType);
    },

    goToLive() {
        this.player.go_to_live();
    },

    openMediaPath(id, { type, index }) {
        console.log("openMediaPath: ", id, index)
        switch (type) {
            case this.player.Media_type.audio:
                this.trackIndexes.audio = index;
                break;
            case this.player.Media_type.video:
                this.trackIndexes.video = index;
                break;
            case this.player.Media_type.subtitle:
                this.trackIndexes.subtitle = index;
                console.log("opening media path subs ", index);
                break;
        }
        return this.player.open_media_path(id);
    },

    getStreamingProtocol() {
        return this.player.protocol_name;
    },

    async getTracks() {
        return await player.trackPlugin_.getTracks()
    },

    async getTracksByMediaType(type) {
        const allTracks = await this.getTracks();
        switch (type) {
            case playerHandler.player.Media_type.audio:
                return allTracks['audio']
            case playerHandler.player.Media_type.video:
                return allTracks['video']
            case playerHandler.player.Media_type.subtitle:
                return allTracks['subtitle']
        }
    },

    retainRepresentationIfStreamRestarted() {
        if (localStorage.getItem('currentReprBitrate') !== null) {
            const bitrateFromPreviousRepr = localStorage.getItem('currentReprBitrate');
            this.player.set_bandwidth_range(bitrateFromPreviousRepr, bitrateFromPreviousRepr);
        }
        localStorage.removeItem('currentReprBitrate')
    },

    retainPlaybackSpeedIfAppRestarted() {
        if (playerHandler.lastUri === playerHandler.uri) {
            let lastPlaybackSpeedStr = localStorage.getItem('lastPlaybackSpeed') || 1;
            playerHandler.player.set_playback_speed(Number(lastPlaybackSpeedStr))
        }

    }

}

export default playerHandler;