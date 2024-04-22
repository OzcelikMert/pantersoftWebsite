const PageUsers = (function () {
    function PageUsers(){
        list.init();
        main.init();
        modal_edit.init();
        modal_view.init();
    }

    let main = {
        variable: {
            DATA_PERMISSION: Array(),
            DATA_USER_TYPE: Array()
        },
        class: {
            USERS: ".e_users"
        },
        check(){
            let self = this;
            if(Main.variable.USER_TYPE !== TableTypes.user.ADMIN && !Variable.isset(()=> Main.variable.USER_PERMISSION[TableTypes.permission.USER_ADD])){
                $(`${self.class.USERS} a[function="add_new"]`).remove();
            }
        },
        get_permission(){
            let self = this;
            Main.service(ServicePage.PERMISSION, "GET",
                {type: "all"},
                function (data) {
                    self.variable.DATA_PERMISSION = data.result;
                }, false
            );
        },
        get_user_type(){
            let self = this;
            Main.service(ServicePage.USER_TYPE, "GET",
                {type: "all"},
                function (data) {
                    self.variable.DATA_USER_TYPE = data.result;
                }, false
            );
        },
        init(){
            let self = this;

            function events(){
                $(`${self.class.USERS} a[function]`).on("click", function () {
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
            self.get_permission();
            self.get_user_type();
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
                    let td_edit = `
                        <a href="javascript:void(0)" class="text-primary" function="view">
                            <i class="bi bi-eye-fill"></i>
                        </a>
                    `;
                    let td_delete = ``;

                    if(TableTypes.user_rank[Main.variable.USER_TYPE] < TableTypes.user_rank[item.type]){
                        td_edit = `
                            <a href="javascript:void(0)" class="text-warning" function="view">
                                <i class="bi bi-pencil-square"></i>
                            </a>
                        `;

                        td_delete = `
                            <a href="javascript:void(0)" class="text-danger" function="delete">
                                    <i class="bi bi-trash-fill"></i>
                            </a>
                        `;
                    }

                    elements += `
                        <tr item-id="${item.id}">
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="avatar avatar-md">
                                        <img src="../image/${item.image}" alt="${item.name} ${item.surname.toUpperCase()}">
                                    </div>
                                    <p class="font-bold ms-3 mb-0">${item.name} ${item.surname.toUpperCase()}</p>
                                </div>
                            </td>
                            <td><a href="mailto:${item.email}">${item.email}</a></td>
                            <td>${item.type_name}</td>
                            <td>${item.date_login}</td>
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
                Main.service(ServicePage.USER, "GET",
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
                        case "view":
                            modal_view.open();
                            break;
                        case "delete":
                            HelperSweetAlert.question(
                                "Kullanıcı Silme",
                                `<b>'${item.email}</b> adresine ait <b>'${item.name} ${item.surname}</b> isimli kullanıcıyı silmek istediğinizden emin misiniz?`,
                                lang.yes,
                                lang.no,
                                function (result) {
                                    if(result.value){
                                        Main.service(ServicePage.USER, "DELETE",
                                            {id: id},
                                            function (data) {
                                                element_tr.remove();
                                                Variable.del_index_of(self.variable.DATA, item._index);
                                                self.get();
                                                HelperToastify.success(`<b>'${item.email}</b> adresine ait kullanıcı silindi`);
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
            SELECT_PERMISSION: null,
            PERMISSION_FILTER: TableTypes.permission_for_user.USER(),
            MODE: "",
            mode: {
                EDIT: "edit",
                ADD: "add"
            }
        },
        id:{
            MODAL: "#modal_edit",
        },
        open() {
            let self = this;
            $(`${self.id.MODAL} [function="modal_${self.variable.mode.ADD}"], ${self.id.MODAL} [function="modal_${self.variable.mode.EDIT}"]`).hide();
            self.get();
            $(self.id.MODAL).modal("show");
        },
        close() {
            let self = this;
            $(self.id.MODAL).modal("hide");
        },
        get(){
            let self = this;
            let user = Variable.array_find(list.variable.DATA, "id", list.variable.SELECTED_ID);
            let date = (Variable.isset(()=> user.ban_date_end) && !Variable.empty(user.ban_date_end)) ? new Date(user.ban_date_end) : new Date();
            let rank = Variable.array_find(main.variable.DATA_USER_TYPE, "id", Main.variable.USER_TYPE).rank;
            let form = $(`${self.id.MODAL} form`);
            if(self.variable.SELECT_PERMISSION !== null) self.variable.SELECT_PERMISSION.destroy();

            form.trigger("reset");
            $(`${self.id.MODAL} form select[name="user_type"]`).html(
                Helper.create_select_option(
                    main.variable.DATA_USER_TYPE,
                    "id",
                    "name",
                    ((Variable.isset(()=> user.type)) ? user.type : [TableTypes.user.USER]),
                    (item) => {console.log(item, Main.variable.USER_TYPE); return (rank < item.rank);}
                )
            );
            form.autofill(user);
            $(`${self.id.MODAL} form select[name="status"]`).change();
            $(`${self.id.MODAL} form input[name="ban_date_end"]`).val(Variable.date_format(date, DateMask.INPUT_DATETIME)).change();
            $(`${self.id.MODAL} [function="modal_${self.variable.MODE}"]`).show();


            let select_permission = $(`${self.id.MODAL} form select[name="permission"]`);

            select_permission.html(
                Helper.create_select_option(
                    ((self.variable.PERMISSION_FILTER.length > 0) ? Variable.array_find_multi(main.variable.DATA_PERMISSION, "id", self.variable.PERMISSION_FILTER) : main.variable.DATA_PERMISSION),
                    "id",
                    "name",
                    ((Variable.isset(()=> user.permission)) ? JSON.parse(user.permission) : [])
                )
            );

            self.variable.SELECT_PERMISSION = new Choices(select_permission[0], {
                removeItems: true,
                removeItemButton: true,
                searchResultLimit: 6,
                placeholder: true,
                placeholderValue: `Lütfen kullanıcının yetkilerini seçiniz!`,
                noResultsText: `Aradığınız yetki bulunamadı`,
                noChoicesText: 'Seçicek yetki bulunamadı',
                itemSelectText: 'Seçmek için tıklayınız',
                loadingText: 'Yükleniyor...',
            });
        },
        init(){
            let self = this;

            function events(){
                $(`${self.id.MODAL} form`).submit(function (e) {
                   e.preventDefault();
                   let form_data = $(this).serializeObject();
                   let permission = [];
                   Array.from($(`${self.id.MODAL} form select[name="permission"] option`)).forEach(item => {
                       item = $(item);
                       permission.push(item.attr("value"));
                   });
                   form_data.permission = permission;
                   Main.service(ServicePage.USER, ((self.variable.MODE === self.variable.mode.ADD) ? "POST" : "PUT"),
                       Object.assign(form_data, {id: list.variable.SELECTED_ID, type: "user"}),
                       function (data) {
                           HelperToastify.success(`<b>'${form_data.email}'</b> adresine ait kullanıcı başarı ile ${(self.variable.MODE === self.variable.mode.ADD) ? "oluşturuldu" : "güncellendi"}`);
                           list.variable.DATA = Array();
                           list.get();
                           self.close();
                       }
                   );
                });

                $(`${self.id.MODAL} form select[name="status"]`).on("change", function (e) {
                    let status = parseInt($(this).val());

                    let inputs_ban = $(`${self.id.MODAL} form [function="inputs_ban"]`);

                    switch (status){
                        case TableTypes.status.BANNED:
                            inputs_ban.show();
                            break;
                        default:
                            inputs_ban.hide();
                            break;
                    }
                });

                $(`${self.id.MODAL} form select[name="user_type"]`).on("change", function (e) {
                    let type = parseInt($(this).val());

                    let filter = [];

                    switch (type){
                        case TableTypes.user.EDITOR:
                            filter = TableTypes.permission_for_user.EDITOR();
                            break;
                        case TableTypes.user.AUTHOR:
                            filter = TableTypes.permission_for_user.AUTHOR();
                            break;
                        case TableTypes.user.USER:
                            filter = TableTypes.permission_for_user.USER();
                            break;
                    }

                    self.variable.PERMISSION_FILTER = filter;
                    self.get();
                    $(this).val(type);
                });
            }

            events();
        }
    }

    let modal_view = {
        id:{
            MODAL: "#modal_view",
        },
        open() {
            let self = this;
            self.get();
            $(self.id.MODAL).modal("show");
        },
        close() {
            let self = this;
            $(self.id.MODAL).modal("hide");
        },
        get(){
            let self = this;
            let user = Variable.array_find(list.variable.DATA, "id", list.variable.SELECTED_ID);

            let open_edit = $(`${self.id.MODAL} [function="open_edit"]`);
            if(TableTypes.user_rank[Main.variable.USER_TYPE] < TableTypes.user_rank[user.type]) {
                open_edit.show();
            } else {
                open_edit.hide();
            }

            let ban_info = $(`${self.id.MODAL} [function="ban_info"]`);
            if(user.status == TableTypes.status.BANNED){
                ban_info.show();
            }else{
                ban_info.hide();
            }

            for (let [key, value] of Object.entries(user)) {
                let element = $(`${self.id.MODAL} [function="${key}"]`);

                if(Variable.empty(value)) {
                    element.hide();
                    continue;
                }
                else element.show();

                if(element.is("a")){
                    if(key === "email") value = `mailto:${value}`;
                    else if (key === "phone") value = `tel:${value}`;
                    element.attr("href", value);
                }else if(element.is("img")){
                    element.attr("src", `../image/${value}`).attr("alt", `${user.name} ${user.surname.toUpperCase()}`);
                }else{
                    element.html(value);
                }
            }
        },
        init(){
            let self = this;

            function events(){
                $(`${self.id.MODAL} [function="open_edit"]`).on("click", function () {
                    modal_edit.variable.MODE = modal_edit.variable.mode.EDIT;
                    self.close();
                    modal_edit.open();
                })
            }

            events();
        }
    }

    return PageUsers;
})();

$(function () {
    (new PageUsers());
})