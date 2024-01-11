
const platform = {
    getDeviceName() {
        if (window.tizen) {
            return 'Samsung';
        } else if (window.webOS) {
            return 'LG'
        } else {
            return 'PC Browser'
        }
    },

    getOS() {
        let appVersion = navigator.userAgent;
        if (window.tizen) {
            let regex = /\bTizen (\d+\.\d+)\b/;
            let result = appVersion.match(regex);
            let tizenVersion = result ? result[0] : "Undefined";
            return tizenVersion;
        } else if (window.webOS) {
            let regex = /\(Web0S;([^)]+)\)/;
            let result = appVersion.match(regex);
            let webOSVersion = result ? "WebOS " + result[1].trim() : "Undefined";
            return webOSVersion;
        } else {
            let pcVersion = navigator.platform;
            return pcVersion;
        }
    },

    getBrowserName() {
        let userAgent = navigator.userAgent;
        if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
            return "Opera";
        } else if (userAgent.includes("Firefox")) {
            return "Mozilla Firefox";
        } else if (userAgent.includes("Chrome")) {
            return "Chrome";
        }
    },

}

export default platform;