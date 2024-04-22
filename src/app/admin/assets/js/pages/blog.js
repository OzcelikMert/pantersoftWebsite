let PageBlog = (function () {
    function PageBlog(){
        category.init()
        blog.init();
        //Modals
        modal_category.init();
        modal_blog.init();
        tags.init();
        redirect.init();
    }
    let blog = {
        variable: {
            DATA: [],
        },
        class: {
            BLOGS: ".e_blogs",
            TRASH_BLOGS: ".e_trash_blogs",
            BLOG: ".e_blog",
        },
        get(){
            let self = this;
            Main.service(ServicePage.BLOG,"GET",{type: "blog"},(data)=>{if (data.status) self.variable.DATA = data.result; }, false);
            function create_element(type="normal"){
                let status = (type === "normal") ? [TableTypes.status.DELETED] : [TableTypes.status.ACTIVE,TableTypes.status.PASSIVE];
                let table_columns = [];

                if (self.variable.DATA.length > 0) {
                    self.variable.DATA.forEach((item)=>{
                        if (status.includes(item.status)) return;

                        let category_list = [];
                        if(!Variable.isset(()=> item.title)) item.title= "-";
                        if(!Variable.isset(()=> item.views)) item.views= "0";
                        if(Variable.empty(item.tag)) item.tag = "-";

                        category.get_linked(item.id).forEach((item)=> category_list.push(item.name));
                        item.category = (category_list.length === 0) ? "-" : category_list.join(",");
                        let is_fixed = (item.is_fixed === 1) ? `<i class="bi bi-pin-angle-fill"></i>` : "";

                        let btn = "";
                        let btn_class = "btn text-white fs-5 float-end"
                        switch (type) {
                            case "normal":
                                btn =`<button class="${btn_class} bg-danger" function="trash"> <i class="bi bi-trash"></i>  </button>
                                      <button class="${btn_class} bg-warning me-2" function="edit">   <i class="bi bi-pencil-square"></i> </button>
                                      <button class="${btn_class} bg-success me-2"><i class="bi bi-eye-fill"></i> ${item.views}</button>`;
                                break;
                            case "trash":
                                btn =`<button class="${btn_class} bg-danger" function="delete"> <i class="bi bi-trash"></i></button>
                                      <button class="${btn_class} bg-success me-2" function="restore"> <i class="bi bi-arrow-bar-left"></i></button>`;
                                break;
                        }

                        table_columns.push({
                            tr: {"item-id": `${item.id}`},
                            td: [
                                `<div class="d-flex align-items-center">
                                    <div class="avatar avatar-xl"><img src="../image/${item.image}" alt=""></div>
                                    <p class="font-bold ms-3 mb-0"><a href="${item.url}" target="_blank" item-name>${item.title}</a> ${is_fixed}</p>
                                </div>`,
                                item.date,
                                item.category,
                                item.tag,
                                `<span class="badge ${Main.status_bg(item.status)}">${item.status_name}</span></p>`,
                                `<span>${btn}</span>`
                            ]
                        })
                    })
                }

               return new Table({class:"e_blog table table-hover"})
                   .head(["İsim", "Tarih", "Kategori", "Etiket", "Durum", {html:"İşlemler", attr:{class:"text-center"}}])
                   .body(table_columns);
            }
            $(self.class.BLOGS).html(create_element("normal"));
            $(self.class.TRASH_BLOGS).html(create_element("trash"));

            Main.DataTable($(self.class.BLOG)[0]); //NORMAL DT
            Main.DataTable($(self.class.BLOG)[1]); //TRASH DT
            tags.get();
        },
        init(){
            let self = this;
            function events(){
                $(modal_blog.class.OPEN_MODAL).click(()=> {
                    modal_blog.clear();
                    $(`${modal_blog.id.MODAL} ${modal_blog.class.SUBMIT_BTN}`).html("Ekle");
                })
                $(document).on("click",`${self.class.BLOGS} [function],${self.class.TRASH_BLOGS} [function]`,function () {
                    let element = $(this),
                        closest = element.closest("tr"),
                        type = element.attr("function"),
                        id = closest.attr("item-id"),
                        name = closest.find("[item-name]").html();

                    switch (type) {
                        case "edit":
                            console.log("edit")
                            modal_blog.clear()
                            Main.service(ServicePage.BLOG,"GET",{type: "blog",id: id},(data)=>{
                                if (data.result.length > 0) {
                                    let category_list = [];
                                    category.get_linked(id).forEach((item)=> category_list.push(item.id));
                                    data.result[0].category = category_list;
                                    data.result[0].is_active = (data.result[0].status === TableTypes.status.ACTIVE);
                                    $(`${modal_blog.id.MODAL} form`).autofill(data.result[0]);
                                    $(`${modal_blog.class.CONTENT} ${modal_blog.class.EDITOR}`).html(Variable.decode_html($(`${modal_blog.class.CONTENT} [name=content]`).val()))

                                    let image = data.result[0].image;
                                    if(image !== "") {
                                        let img = $(`${modal_blog.class.IMAGE} img`);
                                        img.attr("src",`../image/${image}`);
                                        img.show();
                                    }
                                    modal_blog.tags("text",data.result[0].tag);
                                    $(`${modal_blog.id.MODAL} ${modal_blog.class.SUBMIT_BTN}`).html("Güncelle");
                                    $(`${modal_blog.id.MODAL}`).modal("show");
                                }
                            }, true,true);
                            break;
                        case "trash":
                            console.log("trash")
                            HelperSweetAlert.question("Blog Silinsinmi ?", `<b>${name}</b> Adlı Blog'u Silmek İstediğine Eminmisiniz?`, lang.yes, lang.no,
                                function (result) {
                                    if (result.value) {
                                        Main.service(ServicePage.BLOG,"PUT",{type: "trash", id: id},(data)=>{
                                            if (data.status) {
                                                HelperToastify.success(`<b>${name}</b> Adlı Blog Silindi.`);
                                                closest.fadeOut();
                                                self.get()
                                            }

                                        }, false);
                                    }
                                }
                            );
                            break;
                        case "restore":
                            Main.service(ServicePage.BLOG,"PUT",{type:"restore",id:id},(result)=>{
                                if (result.status) {
                                    HelperToastify.success("Blog Geri Yüklendi.")
                                    self.get();
                                }
                            })
                            break;
                        case "delete":
                            console.log("delete")
                            HelperSweetAlert.question(`Blog Kalıcı Olarak Silinsinmi ?`, `<b>${name}</b> Adlı Blog Kalıcı Olarak Silinecek Eminmisiniz ?`, lang.yes, lang.no,
                                function (result) {
                                    if (result.value) {
                                        Main.service(ServicePage.BLOG,"DELETE",{type: "delete", id: id},(data)=>{
                                            if (data.status) {
                                                HelperToastify.success(`<b>${name}</b> Adlı Blog Kalıcı Olarak Silindi.`)
                                                closest.fadeOut();
                                                self.get()
                                            }
                                        }, false);
                                    }
                                }
                            );
                            break;
                    }
                })
            }
            this.get();
            events();
        }
    }
    let tags = {
        class: {
            SELECT: ".e_select_tags",
            SELECT_RENDERED: ".select2-selection__rendered",
            SELECT_DROPDOWN: ".select2-search--dropdown",

        },
        variable: {DATA: []},
        get(){
            let self = this;
            let item_list = [];
            self.variable.DATA = [];

            blog.variable.DATA.forEach((item)=>{
                let items = item.tag.split(",")
                items.forEach((i,index)=> { if(i.length === 0) delete items[index] }) //deleted empty
                if (items.length > 0) item_list = item_list.concat(items);
            })

            Variable.array_clear_duplicates(item_list).forEach((item,index)=> self.variable.DATA.push({id: index++, text: item}))
            self.variable.DATA[0] = {id:0, text: "Etiket Seçiniz"}
            $(self.class.SELECT).html("<option value='0'>Seçim Yapınız</option>");
            $(self.class.SELECT).select2({
                data: self.variable.DATA,
                dropdownParent: $(modal_blog.id.MODAL),
                width: '100%'
            })
        },
        init(){
            let self = this;
            function events(){
                $(self.class.SELECT_RENDERED).click(()=>{
                    $(self.class.SELECT_DROPDOWN).append(`<button class="btn btn-success" id="blog_tag_add_btn" style="position:absolute;top:7px;right:8px;padding:2px;font-size:15px;">Oluştur</button>`);
                    $(self.class.SELECT_RENDERED).unbind()
                })
            }
            this.get();
            events();
        }
    }
    let category = {
        id: {
            LIST_CATEGORY: "#list-category",
        },
        class: {
            CATEGORY: ".e_categories",
            DT_CATEGORIES: ".e_dt_categories",
            OPEN_MODAL: ".e_open_modal_category",
        },
        attr: {
          main_id : "main-id",
          item_id: "item-id",
          item_name: "item-name",
        },
        variable: {DATA: [],DATA_LINKED: []},
        get(type="all"){
            let self = this;
            Main.service(ServicePage.CATEGORY,"GET",{type: type,category_type: TableTypes.category.BLOG}, (data)=> {
                if (data.status) {
                    category.variable.DATA =  (Variable.isset(()=> data.result.category)) ? data.result.category : category.variable.DATA;
                    category.variable.DATA_LINKED =  (Variable.isset(()=> data.result.linked_category)) ? data.result.linked_category : category.variable.DATA_LINKED;
                }
            },false);
            function create_element(){
                let table_columns = []
                if (typeof self.variable.DATA !== "undefined" && self.variable.DATA.length > 0) {
                    self.variable.DATA.forEach((item)=>{
                        let main_category = Variable.array_find(category.variable.DATA,"id",item.main_id);
                        main_category = (!Variable.isset(()=> main_category)) ? "-" : main_category.name;
                        table_columns.push({
                            tr: {"item-id":`${item.id}`,"main-id":`${item.main_id}`},
                            td: [
                                {html: item.name, attr: {"item-name":""}},
                                main_category,
                                item.date,
                                `<a href="blog/${item.url}">${item.url}</a>`,
                                `<span class="float-end">
                                    <button class="btn btn-danger" function="delete">Sil</button>  
                                    <button function="edit" class="btn btn-secondary">Düzenle</button> 
                                </span>`
                            ]
                        })
                    })
                }
                return new Table({class:"e_dt_categories table table-hover e_categories"})
                    .head(["Kategori Adı","Üst Kategori","Tarih","Link","İşlemler"])
                    .body(table_columns);
            }
            $(`${self.id.LIST_CATEGORY} ${self.class.CATEGORY}`).html(create_element());
            Main.DataTable(document.querySelector(self.class.DT_CATEGORIES));
        },
        get_linked(blog_id){
            let self = this;
            let category = [];
            let category_id = [];
            let linked = Variable.array_find_multi(self.variable.DATA_LINKED,"item_id",blog_id)
            if (typeof linked !== "undefined" && linked.length > 0){
                linked.forEach((item)=> category_id.push(item.category_id))
                if (category_id.length > 0) category_id.forEach((item)=> {
                    category.push(Variable.array_find(self.variable.DATA,"id",item));
                })
            }
            return category;
        },
        delete(id){
            let self = this;
            Main.service(ServicePage.CATEGORY,"DELETE",{type: "category", id: id}, (data)=> {
                if (data.status) {
                    self.get();
                    modal_category.get();
                }
            },true);

        },
        clear(){
            let self = this;
            let element = $(`${modal_category.id.MODAL} form`);
            element[0].reset()
            element.autofill({id: "0"})
        },
        init(){
            let self = this;
            function event(){
                $(self.class.OPEN_MODAL).click(()=> {
                    modal_category.clear();
                    $(`${modal_category.id.MODAL} ${modal_category.class.SUBMIT_BTN}`).html("Ekle");
                })

                $(document).on("click",`${self.class.CATEGORY} [function]`,function () {
                    let element = $(this),
                        type = element.attr("function"),
                        closest = element.closest("tr"),
                        name = $(closest).children(`[${self.attr.item_name}]`).html(),
                        main_id = parseInt(closest.attr(self.attr.main_id)),
                        item_id =  parseInt(closest.attr(self.attr.item_id));

                    switch (type) {
                        case "edit":
                            modal_category.clear();
                            $(`${modal_category.id.MODAL} form`).autofill({id: item_id, main_id: main_id, name:name})
                            $(`${modal_category.id.MODAL} ${modal_category.class.SUBMIT_BTN}`).html("Güncelle");
                            $(modal_category.id.MODAL).modal("show");
                            break;
                        case "delete":
                            $(closest).remove();
                            self.delete(item_id);
                            HelperToastify.success(`<b>${name}</b> Kategorisi Silindi.`);
                            break;

                    }
                })
            }
            this.get()
            event()
        }
    }

    let modal_blog = {
        id: {
          MODAL: "#modal_add_blog",
          TAG_BTN: "#blog_tag_add_btn",
        },
        class: {
            CONTENT : ".e_content",
            EDITOR: ".note-editable",
            CATEGORY: ".e_categories",
            IMAGE: ".e_blog_image",
            OPEN_MODAL: ".e_open_modal_blog",
            TAGS: ".e_tags",
            TAGS_SELECT: ".e_select_tags",
            TAG_BUTTON: ".e_tag_button",
            TAG_INPUT: ".e_tag_input",
            SUBMIT_BTN: ".e_submit",
        },
        variable: {
            EDIT: false,
        },
        editor() {
            $('#summernote').summernote({tabsize: 1,height: 405 ,})
        },
        set(data,method="POST"){
            data.type = "blog";
            Main.service(ServicePage.BLOG,method, data,function (data) {
                if (data.status){
                    category.get("category_linked");
                    blog.get()
                }
            },true,true);
        },
        get() {
            let self = this;
            function create_element_category(){
                let element = "";
                category.variable.DATA.forEach((item)=>{
                    element += `<li class="list-group-item py-1"><span><input name="category[]" class="form-check-input me-1" type="checkbox" value="${item.id}">${item.name}</span></li>`;
                })
                return `<li class="list-group-item"> <label for="for_blog_title" class="bold">Kategori Seçimi</label></li> ${element}`;
            }
            $(`${self.id.MODAL} ${self.class.CATEGORY}`).html(create_element_category())
        },
        tags(type,tags){
            let self = this;
            if (type === "clear") {
                $(`${self.id.MODAL} ${self.class.TAGS}`).html("")
            }else {
                let result = "";
                let value = $(`.select2-search__field`);

                switch (type){
                    case "select":
                        let element = $(self.class.TAGS_SELECT);
                        if (element.val() !== "0"){
                            let data = element.children(":selected").text()
                            if (typeof data !== "undefined" && data !== "") result = create_element(data);
                        }
                        break;
                    case "split":
                        value.val().split(",").forEach((item)=> {if (item !== "") result += create_element(item);})
                        break;
                    case "text":
                        tags.split(",").forEach((item)=> {if (item !== "") result += create_element(item);})
                        break;
                }
                value.val("");
                $(`${self.id.MODAL} ${self.class.TAGS}`).append(result);
            }

            function create_element(name){return `<span class="badge rounded-pill bg-secondary me-1"><i class="bi bi-x"></i>${name}</span>`;}
        },
        clear(){
            let self = this;
            let element = $(`${self.id.MODAL} form`);
            element[0].reset()
            element.autofill({id: "0", is_active: false, is_fixed: false})
            $(self.class.EDITOR).html("");
            let img = $(`${self.id.MODAL} ${self.class.IMAGE} img`);
            img.attr("src","");
            img.hide()
            self.tags("clear");
        },
        init: function (){
            let self = this;
            function events(){

                $(self.class.OPEN_MODAL).click(()=> self.clear())

                $(document).on("click",self.id.TAG_BTN,()=> { self.tags("split");});
                $(document).on("change",self.class.TAGS_SELECT,()=>{ self.tags("select"); })

                PageGallery.modal.events.onSelected = function (result) {
                    let img = $(`${self.class.IMAGE} img`);
                    $(`${self.class.IMAGE} input[name=image]`).val(result);
                    img.attr("src",`../image/${result}`);
                    img.show();
                }
                $(document).on("submit",`${self.id.MODAL} form`,function (){
                    //textarea plugin get html set hidden value
                    $(`${self.class.CONTENT} [name=content]`).val($(`${self.class.CONTENT} ${self.class.EDITOR}`).html())
                    let data = $(this).serializeObject();
                    let method = (data.id > 0) ? "PUT": "POST";
                    let tag = [];
                    Array.from($(`${self.id.MODAL} ${self.class.TAGS} span`)).forEach((item)=> tag.push($(item).text()));
                    data.tag = tag.join(",");
                    self.set(data,method);
                    $(self.id.MODAL).modal("hide")

                    return false;
                })
                $(document).on("click",`${self.class.IMAGE} [function=image]`,function () {
                    PageGallery.modal.open();
                })
                $(document).on("click", `${self.id.MODAL} ${self.class.TAGS} span`,function () {
                   $(this).closest("span").remove();
                })

            }
            this.get();
            this.editor()
            events();
        }
    }
    let modal_category = {
        id: {
            MODAL: "#modal_add_category",
            LIST_CATEGORY: "#list-category",
        },
        class: {
            CATEGORY: ".e_categories",
            OPEN_MODAL: ".e_open_modal_category",
            MAIN_CATEGORY_SELECT: ".e_main_category_select",
            SUBMIT_BTN: ".e_submit"
        },
        get(){
            let self = this;
            function create_element(){
                let element = "<option value='0'>Seçim Yapınız...</option>";
                if (category.variable.DATA.length > 0) category.variable.DATA.forEach((item)=> element += `<option value="${item.id}">${item.name}</option>`)
                return element;
            }
            $(self.class.MAIN_CATEGORY_SELECT).html(create_element());
        },
        set(data,method="POST"){
            let self = this;
            data.type = "category";
            data.category_type = TableTypes.category.BLOG;
            Main.service(ServicePage.CATEGORY, method, data,function (data) {
                if (data.status) {
                    category.get();
                    self.get();
                    modal_blog.get();
                    let msg = (method === "POST") ? `Yeni Kategori Eklendi.` : `Kategori Güncellendi.`
                    HelperToastify.success(msg);
                }
            },true,true);
        },
        clear(){
            let self = this;
            let element = $(`${self.id.MODAL} form`);
            element[0].reset()
            element.autofill({id: "0"})
        },
        init: function (){
            let self = this;
            function events(){
                $(document).on("submit",`${self.id.MODAL} form`,function (){
                    let data = $(this).serializeObject();
                    let method = (data.id > 0) ? "PUT": "POST";
                    self.set(data,method);
                    $(self.id.MODAL).modal("hide")
                    return false;
                })
            }

            this.get();
            events();
        }
    }

    let redirect = {
        init(){
            let type = new URL(window.location.href).searchParams.get("function");
            switch (type) {
                case `add`:
                   $(`${modal_blog.class.OPEN_MODAL} span`).click(); break;
            }
        }
    }

    return PageBlog;
})();

$(document).ready(()=>PageBlog())

