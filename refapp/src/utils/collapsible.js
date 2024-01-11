"use strict";

let Collapsible = {

    // Call this function to collapse Content List and buttons
    collapseMenu() {
        let coll = document.getElementsByClassName("collapsible");
        for (let i = 0; i < coll.length; i++) {
            const isEventListenerAttached = coll[i].hasAttribute('data-event-listener');
            if (!isEventListenerAttached){
                coll[i].addEventListener("click", function () {
                    this.classList.toggle("active");
                    let content = this.nextElementSibling;
                    if (content.style.maxHeight) {
                        content.style.maxHeight = null;
                    } else {
                        content.style.maxHeight = content.scrollHeight + "vh";
                    }
                });
                coll[i].setAttribute('data-event-listener', 'true');
            }
        }
    }
};

export default Collapsible;