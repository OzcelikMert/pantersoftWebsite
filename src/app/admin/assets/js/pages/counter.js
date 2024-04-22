const PageCounter = (function () {
    function PageCounter(){
        list.init();
        main.init();
        modal_edit.init();
    }

    let main = {
        class: {
            COUNTER: ".e_counter"
        },
        check(){
            let self = this;
            if(Main.variable.USER_TYPE !== TableTypes.user.ADMIN && !Variable.isset(()=> Main.variable.USER_PERMISSION[TableTypes.permission.COUNTER_EDIT])){
                $(`${self.class.COUNTER} a[function="add_new"]`).remove();
            }
        },
        init(){
            let self = this;

            function events(){
                $(`${self.class.COUNTER} a[function]`).on("click", function () {
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
                    item.title = Variable.decode_html(item.title);
                    item.content = Variable.decode_html(item.content);
                    item.image = Variable.decode_html(item.image);

                    if(item.status == TableTypes.status.DELETED) return;
                    let td_edit = `
                            <a href="javascript:void(0)" class="text-warning" function="edit">
                                <i class="bi bi-pencil-square"></i>
                            </a>
                        `,
                        td_delete = `
                            <a href="javascript:void(0)" class="text-danger" function="delete">
                                    <i class="bi bi-trash-fill"></i>
                            </a>
                        `;
                        img_avatar = (item.image.indexOf(".") !== -1) 
                            ? `<img src="${Main.dir.IMAGE(item.image)}" alt="${item.title}">` 
                            : `<span><i class="${item.image}"></i> ${item.image}</span>`;
                    console.log(item.image.search("."));
                    if(Main.variable.USER_TYPE !== TableTypes.user.ADMIN && !Variable.isset(()=> Main.variable.USER_PERMISSION[TableTypes.permission.COUNTER_EDIT])){
                        td_edit = ``;
                        td_delete = ``;
                    }
                    
                    elements += `
                        <tr item-id="${item.id}">
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="avatar avatar-md">
                                        ${img_avatar}
                                    </div>
                                    <p class="font-bold ms-3 mb-0">${item.title}</p>
                                </div>
                            </td>
                            <td>${item.value}</td>
                            <td>${item.type_name}</td>
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
                Main.service(ServicePage.COUNTER, "GET",
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
                                "Sayaç Silme",
                                `<b>'${item.title}</b> başlıklı sayaçı silmek istediğinizden emin misiniz?`,
                                lang.yes,
                                lang.no,
                                function (result) {
                                    if(result.value){
                                        Main.service(ServicePage.COUNTER, "DELETE",
                                            {id: id},
                                            function (data) {
                                                element_tr.remove();
                                                Variable.del_index_of(self.variable.DATA, item._index);
                                                self.get();
                                                HelperToastify.success(`<b>'${item.title}</b> başlıklı sayaç silindi`);
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
            DATA_TYPE: Array(),
            IMAGE: "",
            MODE: "",
            mode: {
                EDIT: "edit",
                ADD: "add"
            }
        },
        id:{
            MODAL: "#modal_edit",
            FOR_IMAGE: "#for_image"
        },
        class: {
            IMAGE: ".e_image",
            ICON: ".e_icon",
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
        get_type(){
            let self = this;

            if(self.variable.DATA_TYPE.length === 0){
                Main.service(ServicePage.COUNTER_TYPE, "GET",
                    {type: "all"},
                    function (data) {
                        self.variable.DATA_TYPE = data.result;
                    }, false
                );
            }

            $(`${self.id.MODAL} form select[name="counter_type"]`).html(
                Helper.create_select_option(
                    self.variable.DATA_TYPE,
                    "id",
                    "name",
                )
            );
        },
        get(){
            let self = this;
            let data = Variable.array_find_multi(list.variable.DATA, "id", list.variable.SELECTED_ID);
            let image = $(`${self.class.IMAGE} img`);
            let form = $(`${self.id.MODAL} form`);
            form.trigger("reset");
            image.attr("src", "").attr("alt", "").hide();
            self.variable.IMAGE = "";

            if(data.length > 0){
                data = data[0];
                form.autofill(data);
                image.attr("src", Main.dir.IMAGE(data.image)).attr("alt", data.title).show();
                form.find(`[name="status"]`).prop("checked", (data.status === TableTypes.status.ACTIVE) ? 1 : 0);
                form.find(`[name="counter_type"]`).val(data.type).change();
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
                    Main.service(ServicePage.COUNTER, ((self.variable.MODE === self.variable.mode.ADD) ? "POST" : "PUT"),
                        form_data,
                        function (data) {
                            HelperToastify.success(`<b>'${form_data.title}'</b> isimli sayaç başarı ile ${(self.variable.MODE === self.variable.mode.ADD) ? "oluşturuldu" : "güncellendi"}`);
                            list.variable.DATA = Array();
                            list.get();
                            self.close();
                        }
                    );
                });

                $(`${self.id.MODAL} ${self.id.FOR_IMAGE}`).on("change", function () {
                    let is_checked = $(this).prop("checked"),
                        icon_div = $(self.class.ICON),
                        icon_input = icon_div.find(`input[name="icon"]`),
                        image_div = $(self.class.IMAGE);

                    if(is_checked){
                        icon_div.hide();
                        icon_input.prop("disabled", true);
                        image_div.show();
                    }else{
                        icon_div.show();
                        icon_input.prop("disabled", false);
                        image_div.hide();
                    }
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
            self.get_type();
        }
    }

    return PageCounter;
})();

$(function () {
    (new PageCounter());
})