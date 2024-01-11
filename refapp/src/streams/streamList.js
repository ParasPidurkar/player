"use strict";

import StreamGroup from "./streamGroup.js";

let StreamGroupName = [];

let StreamList = {

    start() {
        this.getStreamList();
    },

    getStreamList(streamListText) {
        if (streamListText) {
            StreamGroup.processJSON(streamListText);
            return;
        }
        $(document).ready(function () {
            $.getJSON("streams/streamList.json", function (result, status, xhr) {
                let json = xhr.responseJSON;
                StreamGroup.processJSON(json);
            });

        });
    },


    reload(streamListText) {
        this.getStreamList(streamListText)
    }
}

export default StreamList;