"use strict";

let Notification = {
    timeout: null,

    turnOnNotification(interval, notificationText) {
        var errorDiv = $("#errorMessageDiv").get(0);
        errorDiv.innerHTML = notificationText;
        if (errorDiv.style.display == "block") {
            errorDiv.style.display = "none";
            clearTimeout(this.timeout);
            this.timeout = setTimeout(this.changeDisplayState, 200, errorDiv, "block");
        }
        else {
            errorDiv.style.display = "block";
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.changeDisplayState, interval, errorDiv, "none");
    },

    changeDisplayState(element, value) {
        element.style.display = value;
    }
}

export default Notification;