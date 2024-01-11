"use strict";

import playerHandler from "../playerHandler.js"
import streamPicker from "../ui/streamPicker.js";
import { LogLevel, Log } from "../utils/logs.js"
import Collapsible from "../utils/collapsible.js";


let StreamGroup = {

    processJSON(data) {
        $("#contentListWrapper .collapsible").remove();
        $("#contentListWrapper .content").remove();



        // Dinamically fill collapse list with related data (stream name) from streamList

        for (let i = 0; i < data.length; i++) {
            $("#contentListWrapper")
                .append(
                    `<button class="collapsible"><div><i class="arrow down"></i></div><p>${data[i].name}</p></button>
            <div class="content">
            <ul style="list-style: none;"></ul>
            </div>`
                );
        }

        Collapsible.collapseMenu();
        for (let i = 0; i < data.length; i++) {

            // Append streamGroup DOM elements with streamNames for each streamGroup
            let index;
            for (index = 0; index < data[i].streams.length; index++) {
                $("#contentListWrapper .content ul")
                    .eq(i)
                    .append(`<li><button class="contentButton">${data[i].streams[index].name}</button></li>`);
            }
        }
        // Handling mouse click listeners for each list element with appropriate stream uri

        $("#contentListWrapper button.collapsible").each(function (index) {
            let el = $(this).next().children().children();
            $(el).each(function (i) {
                this.children[0].onclick = function () {
                    playerHandler.stop();
                    $(".closeStreamListBtn").hide();
                    $(".playCustomStreamBtn").hide();
                    streamPicker.Hide();
                    playerHandler.changeStream({
                        url: data[index].streams[i].uri,
                        hint: data[index].streams[i].hint,
                        license: data[index].streams[i].drm_license_url,
                        drm_scheme: data[index].streams[i].drm_scheme,
                        subtitle_uri: data[index].streams[i].subtitle_uri,
                        subtitle_mime_type: data[index].streams[i].subtitle_mime_type,
                        channelId: data[index].streams[i].channelId,
                        additional_sources: data[index].streams[i].additional_sources
                    });
                    Log.debug("Playing stream: " + data[index].streams[i].uri);
                };
            });
        });
    },
}

export default StreamGroup;