import Input from "../input.js";

let exitPopup = {
    template: `
    <div class="exitPopup" id="exitPopup">
    <h2>Exit Screen Dialog</h2>
    <div >
    <h3>Are you sure you want to exit </h3>
    </div>
    <div id="exitPopupBtnWrapper">
    <button id="exit" class="exitPopupBtn">OK</button>
    <button id="cancel" class="exitPopupBtn">CANCEL</button>
    </div>
    </div>
    `,
    filesContent: [],
    componets: null,
    show() {
        if ($('#exitPopup').css('display') == 'block') {
            return;
        }
        $('#main').append(this.template);
        this.componets = {
            exit: $("#exit"),
            cancel: $("#cancel")
        }
        $('#filePicker').change((e) => {
            this.proccessFiles($('#filePicker').get(0).files);
        });
        Input.setActiveComponent(this);
        $('#exit').click((e) => {
            e.preventDefault();
            window.close();
            this.hide();

        });
        $('#cancel').click((e) => {
            e.preventDefault();
            this.hide();
        });
    },
    hide() {
        Input.backToPrevious();
        $('#exitPopup').remove();
    },
    left() {
        if (!exitPopup.isAnySelected()) {
            this.componets["cancel"].addClass("selected");
        }
        if (this.componets["cancel"].hasClass("selected")) {
            this.componets["cancel"].removeClass("selected");
            this.componets["exit"].addClass("selected");
        }
        if (this.componets["exit"].hasClass("selected")) {
            this.componets["exit"].removeClass("selected");
            this.componets["cancel"].addClass("selected");
        }
    },
    right() {
        if (!exitPopup.isAnySelected()) {
            this.componets["cancel"].addClass("selected");
        }
        if (this.componets["exit"].hasClass("selected")) {
            this.componets["exit"].removeClass("selected");
            this.componets["cancel"].addClass("selected");
        }
        if (this.componets["cancel"].hasClass("selected")) {
            this.componets["cancel"].removeClass("selected");
            this.componets["exit"].addClass("selected");
        }
    },
    up() {
        if (!exitPopup.isAnySelected()) {
            this.componets["cancel"].addClass("selected");
        }
        if (this.componets["exit"].hasClass("selected")) {
            this.componets["exit"].removeClass("selected");
            this.componets["cancel"].addClass("selected");
        }
    },
    down() {
        if (!exitPopup.isAnySelected()) {
            this.componets["cancel"].addClass("selected");
        }
        if (this.componets["exit"].hasClass("selected")) {
            this.componets["exit"].removeClass("selected");
            this.componets["cancel"].addClass("selected");
        }
    },
    exit() {
        this.hide();
    },
    ok() {
        if (this.componets["exit"].hasClass("selected")) {
            this.componets["exit"].trigger("click");
        }
        if (this.componets["cancel"].hasClass("selected")) {
            this.componets["cancel"].trigger("click");
        }
    },
    proccessFiles(fileList) {
        let readers = [];
        this.filesContent = [];
        for (let file of fileList) {
            let fr = new FileReader();
            fr.readAsText(file);
            fr.onload = (e) => {
                this.filesContent.push(JSON.parse(e.target.result))
            }
            readers.push(fr);
        };
    },
    isAnySelected() {
        for (let key in this.componets) {
            if (this.componets[key].hasClass('selected')) {
                return true;
            }
        }
        return false;
    }
};

export default exitPopup;