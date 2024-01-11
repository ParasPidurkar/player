"use strict";

let FormatData = {

    timestamp(seconds) {
        var output = "";
        var hh = Math.floor(seconds / 3600);
        if (hh / 10 < 1) {
            output += 0;
        }
        output += hh;
        output += ":";
        var mm = Math.floor((seconds % 3600) / 60);
        if (mm / 10 < 1) {
            output += 0;
        }
        output += mm;
        output += ":";
        var ss = seconds % 60;
        if (ss / 10 < 1) {
            output += 0;
        }
        output += ss;
        return output;
    },

    timestamp_for_analytics(date) {
        return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
    },

    milisecToSec(milisec) {
        return (milisec / 1000).toFixed(2);
    },

    utcToLocalDate(utcTime) {
        let d = new Date(0);
        utcTime /= 1e9;
        d.setUTCSeconds(Math.round(utcTime));
        const [hours, mins, secs] = [d.getHours(), d.getMinutes(), d.getSeconds()]
            .map(value => value.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            }));
        return `${hours}:${mins}:${secs}`;
    }
}

export default FormatData;