const PageSlider = (function () {
    function PageSlider(){
        list.init();
        main.init();
        modal_edit.init();
    }

    let main = {
        class: {
            SLIDERS: ".e_sliders"
        },
        check(){
            let self = this;
            if(Main.variable.USER_TYPE !== TableTypes.user.ADMIN && !Variable.isset(()=> Main.variable.USER_PERMISSION[TableTypes.permission.SLIDER_EDIT])){
                $(`${self.class.SLIDERS} a[function="add_new"]`).remove();
            }
        },
        init(){
            let self = this;

            function events(){
                $(`${self.class.SLIDERS} a[function]`).on("click", function () {
                    let _function = $(this).attr("function");

                    switch (_function) {
                        case "add_new":
                            list.variable.SELECTED_ID = 0;
                            modal_edit.variable.MODE = modal_edit.variable.mode.ADD;
                            modal_edit.open();
                            break;
                    }
                });
            }

            events();
            self.check();
        }
    }

    let list = {
        variable: {
            DATA: Array(),
            SELECTED_ID: 0,
            TABLE: null
        },
        class: {
            LIST: ".e_list"
        },
        get(){
            let self = this;
            if(self.variable.TABLE !== null) self.variable.TABLE.destroy();

            function create_element(){
                let elements = ``;

                self.variable.DATA.forEach(item => {
                    if(item.status == TableTypes.status.DELETED) return;
                    item.title = Variable.decode_html(item.title);
                    item.content = Variable.decode_html(item.content);
                    let td_edit = `
                            <a href="javascript:void(0)" class="text-warning" function="edit">
                                <i class="bi bi-pencil-square"></i>
                            </a>
                        `;
                    let td_delete = `
                            <a href="javascript:void(0)" class="text-danger" function="delete">
                                    <i class="bi bi-trash-fill"></i>
                            </a>
                        `;

                    if(Main.variable.USER_TYPE !== TableTypes.user.ADMIN && !Variable.isset(()=> Main.variable.USER_PERMISSION[TableTypes.permission.SLIDER_EDIT])){
                        td_edit = ``;
                        td_delete = ``;
                    }

                    elements += `
                        <tr item-id="${item.id}">
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="avatar avatar-md">
                                        <img src="${Main.dir.IMAGE(item.image)}" alt="${item.title}">
                                    </div>
                                    <p class="font-bold ms-3 mb-0">${item.title}</p>
                                </div>
                            </td>
                            <td>${item.rank}</td>
                            <td>${item.date}</td>
                            <td><span class="badge ${Main.status_bg(item.status)}">${item.status_name}</span></td>
                            <td>
                                ${td_edit}
                            </td>
                            <td>
                                ${td_delete}
                            </td>
                        </tr>
                    `;
                });

                return elements;
            }


            if(self.variable.DATA.length === 0){
                Main.service(ServicePage.SLIDER, "GET",
                    {type: "all"},
                    function (data) {
                        self.variable.DATA = data.result;
                    }, false
                );
            }

            $(`${self.class.LIST} tbody`).html(create_element());
            self.variable.TABLE = Main.DataTable($(self.class.LIST)[0]);
        },
        init(){
            let self = this;

            function events(){
                $(document).on("click", `${self.class.LIST} tbody a[function]`, function () {
                    let element = $(this),
                        element_tr =  element.closest("tr"),
                        _function = element.attr("function"),
                        id = element_tr.attr("item-id"),
                        item = Variable.array_find(self.variable.DATA, "id", id);

                    self.variable.SELECTED_ID = id;
                    switch (_function){
                        case "edit":
                            modal_edit.variable.MODE = modal_edit.variable.mode.EDIT;
                            modal_edit.open();
                            break;
                        case "delete":
                            HelperSweetAlert.question(
                                "Slider Silme",
                                `<b>'${item.title}</b> başlıklı slideri silmek istediğinizden emin misiniz?`,
                                lang.yes,
                                lang.no,
                                function (result) {
                                    if(result.value){
                                        Main.service(ServicePage.SLIDER, "DELETE",
                                            {id: id},
                                            function (data) {
                                                element_tr.remove();
                                                Variable.del_index_of(self.variable.DATA, item._index);
                                                self.get();
                                                HelperToastify.success(`<b>'${item.title}</b> başlıklı slider silindi`);
                                            }, true, true
                                        );
                                    }
                                }

                            );
                            break;
                    }
                });
            }

            events();
            self.get();
        }
    }

    let modal_edit = {
        variable: {
            IMAGE: "",
            MODE: "",
            mode: {
                EDIT: "edit",
                ADD: "add"
            }
        },
        id:{
            MODAL: "#modal_edit"
        },
        class: {
            IMAGE: ".e_image",
            CONTENT: ".e_content",
            EDITOR: ".note-editable"
        },
        open() {
            let self = this;
            $(`${self.id.MODAL} [function="modal_${self.variable.mode.ADD}"], ${self.id.MODAL} [function="modal_${self.variable.mode.EDIT}"]`).hide();
            $(`${self.id.MODAL} [function="modal_${self.variable.MODE}"]`).show();
            self.get();
            $(self.id.MODAL).modal("show");
        },
        close() {
            let self = this;
            $(self.id.MODAL).modal("hide");
        },
        get(){
            let self = this;
            let data = Variable.array_find_multi(list.variable.DATA, "id", list.variable.SELECTED_ID);
            let content = $(`${self.class.CONTENT} ${self.class.EDITOR}`);
            let image = $(`${self.class.IMAGE} img`);
            let form = $(`${self.id.MODAL} form`);
            form.trigger("reset");
            content.html("");
            image.attr("src", "").attr("alt", "").hide();
            self.variable.IMAGE = "";

            if(data.length > 0){
                data = data[0];
                form.autofill(data);
                content.html(data.content);
                image.attr("src", Main.dir.IMAGE(data.image)).attr("alt", data.title).show();
                form.find(`[name="status"]`).prop("checked", (data.status === TableTypes.status.ACTIVE) ? 1 : 0);
                self.variable.IMAGE = data.image;
            }
        },
        init(){
            let self = this;

            function events(){
                $(`${self.id.MODAL} form`).submit(function (e) {
                   e.preventDefault();
                   let form_data = $(this).serializeObject();
                   form_data = Object.assign(
                        form_data,
                        {
                           content: $(`${self.class.CONTENT} ${self.class.EDITOR}`).html(),
                           id: list.variable.SELECTED_ID,
                           image: self.variable.IMAGE
                        }
                    );
                    console.log(form_data);
                    Main.service(ServicePage.SLIDER, ((self.variable.MODE === self.variable.mode.ADD) ? "POST" : "PUT"),
                        form_data,
                        function (data) {
                            HelperToastify.success(`<b>'${form_data.title}'</b> isimli slider başarı ile ${(self.variable.MODE === self.variable.mode.ADD) ? "oluşturuldu" : "güncellendi"}`);
                            list.variable.DATA = Array();
                            list.get();
                            self.close();
                        }
                    );
                });

                $(`${self.class.IMAGE} button[function="image"]`).on("click", function () {
                    PageGallery.modal.open();
                });
            }

            events();
            PageGallery.modal.events.onSelected = function (result) {
                let img = $(`${self.class.IMAGE} img`);
                self.variable.IMAGE = result;
                img.attr("src", Main.dir.IMAGE(result));
                img.show();
            }
            $(`${self.id.MODAL} ${self.class.CONTENT} [function="content"]`).summernote({tabsize: 1,height: 405})
        }
    }

    return PageSlider;
})();

$(function () {
    (new PageSlider());
})