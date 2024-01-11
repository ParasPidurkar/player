import Input from "../input.js";
import navigation from "./navigationArrows.js";
import playbackControl from "./playbackControl.js";


let alertDialog = {
    template: `
      <div id="dialogWrapper">
      <dialog id="errorDialog">
      <div class="errorHeader">
        <div id="errorIcon">
          <img src="./assets/img/dialog_alert.png" alt="">
        </div>
        <div id="errorTitle">Error</div>
      </div>
      <div class="errorBody">
        <div id="errorMessage">
          <p></p>
        </div>
        <div id="errorButtonWrapper">
          <button>
            OK
          </button>
        </div>
      </div>
    </dialog>
    <div>
    `,
    domRef: null,
    isShown: false,
    show(message) {
        Input.setActiveComponent(this);
        if ($("#dialogWrapper").css("display", "block")) {
            navigation.hide();
        }
        if (this.domRef) {
            this.destroy();
            this.domRef = null;
        }
        $('#errorButtonWrapper button').addClass('selected');
        $('body').append(this.template);
        this.isShown = true;
        $('#errorDialog .errorBody div p').text(message)
        $('#errorButtonWrapper button').click((e) => {
            alertDialog.exit();
        })
        this.domRef = $('#dialogWrapper');
    },

    destroy() {
        $('.vjs-loading-spinner').remove();
        this.domRef.remove();
        this.domRef = null;
    },

    exit() {
        this.destroy();
        this.isShown = false;
        playbackControl.Hide();
        Input.setActiveComponent(navigation);
    },

    ok() {
        this.exit();
    }
};


export default alertDialog;