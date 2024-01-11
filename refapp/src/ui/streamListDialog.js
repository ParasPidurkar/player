import Input from "../input.js";
import StreamList from "../streams/streamList.js";

let streamListDialog = {
    template: `
    <div class="streamListDial" id="streamListDial">
    <h2>Load Custom Stream List
    </h2>
    <form>
    <div id="urlWrapper">
        <input id="urlStreamList" class="selected" placeholder="Enter remote server URL">
    </div>
    <div id="customListBtnWrapper">
    <button id="reloadListBtn" class="streamListDialogBtn">RELOAD</button>
    <button id="reloadCanclBtn" class="streamListDialogBtn">CANCEL</button>
    </div>
    </form>
    </div>
    `,
    filesContent: [],
    componets: null,
    show() {
        if ($('#streamListDial').css('display') == 'block') {
            return;
        }
        $('#main').append(this.template);
        this.componets = {
            input: $("#urlStreamList"),
            reload: $("#reloadListBtn"),
            cancel: $("#reloadCanclBtn")
        }
        this.componets['input'].focus();
        $('#filePicker').change((e) => {
            this.proccessFiles($('#filePicker').get(0).files);
        });
        Input.setActiveComponent(this);

        $('#reloadListBtn').click((e) => {
            e.preventDefault();
            if (this.filesContent.length > 0) {
                StreamList.reload(this.filesContent[0]);
            } else {
                let listURL = $('#urlStreamList').val();
                fetch(listURL)
                    .then((res) => {
                        return res.json();
                    })
                    .then((data) => {
                        StreamList.reload(data);
                    })
                    .catch((err) => {
                        console.warn(err);
                    })
            }
            this.hide();

        });


        $('#reloadCanclBtn').click((e) => {
            e.preventDefault();
            this.hide();
        });

    },

    hide() {
        Input.backToPrevious();
        $('#streamListDial').remove();
    },

    left() {
        if (!streamListDialog.isAnySelected()) {
            this.componets["cancel"].addClass("selected");
        }
        if (this.componets["reload"].hasClass("selected")) {
            this.componets["reload"].removeClass("selected");
            this.componets["cancel"].addClass("selected");
        }
    },
    right() {
        if (!streamListDialog.isAnySelected()) {
            this.componets["reload"].addClass("selected");
        }

        if (this.componets["cancel"].hasClass("selected")) {
            this.componets["cancel"].removeClass("selected");
            this.componets["reload"].addClass("selected");
        }
    },
    exit() {
        this.hide();
    },
    ok() {
        if (this.componets["reload"].hasClass("selected")) {
            this.componets["reload"].trigger("click");
        }
        if (this.componets["cancel"].hasClass("selected")) {
            this.componets["cancel"].trigger("click");
        }
    },
    up() {
        if (!streamListDialog.isAnySelected()) {
            this.componets["input"].addClass("selected");
        }

        if (this.componets["reload"].hasClass("selected")
            || this.componets["cancel"].hasClass("selected")) {
            this.componets["reload"].removeClass("selected");
            this.componets["cancel"].removeClass("selected");
            this.componets["input"].addClass("selected");
            this.componets["input"].focus();

        }
    },
    down() {
        if (!streamListDialog.isAnySelected()) {
            this.componets["reload"].addClass("selected");
        }

        if (this.componets["input"].hasClass("selected")) {
            this.componets["input"].removeClass("selected");
            this.componets["input"].blur();
            this.componets["reload"].addClass("selected");

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


export default streamListDialog;