import Input from "../input.js";
import navigation from "./navigationArrows.js";
import Notification from "../utils/notification.js"
import Settings from "../settings.js";


let abrDialog = {
    template: `
      <div id="abrDialogWrapper">
      <dialog id="abrDialog">
      <div class="abrHeader">
        <div id="errorIcon">
          <img src="./assets/img/dialog_alert.png" alt="">
        </div>
        <div id="abrTitle">ABR Setup Alert</div>
      </div>
      <div class="abrDialogBody">
        <div id="abrMessage">
          <p>ABR changes will be applied after app reloads.
          Reload app now?</p>
        </div>
        <div id="abrButtonWrapper">
          <button id="abrButtonCancel">
            Cancel
          </button>
          <button id="abrButtonOk">
            OK
          </button>
        </div>
      </div>
    </dialog>
    <div>
    `,
    domRef: null,
    abrMenu: null,
    show(abr) {
      $('body').append(this.template);

      $("#abrDialogWrapper")[0].style.display = "block";
      if (this.domRef) {
          this.destroy();
          this.domRef = null;
      }

      $('#abrButtonOk').click((e) => {
          abrDialog.abrMenu.setABRConfiguration();
          abrDialog.destroy();
          window.location.reload();
      })
      $('#abrButtonCancel').click((e) => {
          abrDialog.abrMenu.setABRConfiguration();
          abrDialog.abrMenu.exit();
          abrDialog.destroy();
          Notification.turnOnNotification(3000, "Abr changes saved");
      })
      this.domRef = $('#abrDialogWrapper');
      this.abrMenu = abr;
      Input.setActiveComponent(this);
      Settings.subComponent = null;
    },

    destroy() {
        $('.vjs-loading-spinner').remove();
        this.domRef.remove();
        this.domRef = null;
        Settings.subComponent = null;
    },

    left() {
        let selectedElement = $('#abrButtonWrapper').find('.select');
        if (selectedElement.length == 0) {
            selectedElement = $('#abrButtonOk').addClass('select');
            return;
        } else {
            $('#abrButtonOk').addClass('select');
            $('#abrButtonCancel').removeClass('select');
        }
    },

    right() {
        let selectedElement = $('#abrButtonWrapper').find('.select');
        if (selectedElement.length == 0) {
            selectedElement = $('#abrButtonCancel').addClass('select');
            return;
        } else {
            $('#abrButtonCancel').addClass('select');
            $('#abrButtonOk').removeClass('select');
        }
    },

    ok(){
      let selectedElement = $('#abrButtonWrapper').find('.select');
      if (selectedElement[0].id == 'abrButtonOk') {
        this.abrMenu.setABRConfiguration();
        abrDialog.destroy();
        window.location.reload();
      } else if(selectedElement[0].id == 'abrButtonCancel') {
        this.abrMenu.setABRConfiguration();
        this.abrMenu.exit();
        abrDialog.destroy();
        Notification.turnOnNotification(3000, "Abr changes saved");
      }
    }
};


export default abrDialog;