let PageReference = (function () {
    function PageReference(){
        main.init();
        //Modals
        modal_reference.init();
    }
    let main = {
        variable: { DATA: [] },
        class: {
            REFERENCE: ".e_reference",
            OPEN_MODAL_REFERENCE: ".e_open_modal_reference",
        },
        get(){
            let self = this;
            Main.service(ServicePage.REFERENCE,"GET",null,(data)=>{if (data.status) self.variable.DATA = data.result; }, false);
            function create_element(){
                let table_columns = [];
                if (self.variable.DATA.length > 0) {
                    self.variable.DATA.forEach((item)=>{

                        let common_class = "btn text-white fs-5 float-end"
                        let buttons =`
                            <button class="${common_class} bg-danger"       function="delete"><i class="bi bi-trash"> </i></button>
                            <button class="${common_class} bg-warning me-2" function="edit"> <i class="bi bi-pencil"></i></button>`;

                        table_columns.push({
                            tr: {"item-id": item.id},
                            td: [
                               `<div class="d-flex align-items-center">
                                    <div class="avatar avatar-xl"><img src="../image/${item.image}" alt=""></div>
                                    <p class="font-bold ms-3 mb-0"><a href="${item.url}" target="_blank" item-name>${item.name}</a></p>
                               </div>`,
                               item.date,
                               item.rank,
                               `<span class="badge ${Main.status_bg(item.status)}">${item.status_name}</span>`,
                               `<span>${buttons}</span>`
                            ]
                        })

                    })
                }

                return new Table({class: "e_table table table-hover"})
                    .head(["İsim","Tarih","Sıra","Durum","İşlemler"])
                    .body(table_columns)
            }

            $(self.class.REFERENCE).html(create_element());
            Main.DataTable($(`${self.class.REFERENCE} table`)[0]);
        },
        init(){
            let self = this;
            function events(){
                $(self.class.OPEN_MODAL_REFERENCE).click(()=> {
                    let img = $(`${modal_reference.id.MODAL} ${modal_reference.class.IMAGE} img`)
                    modal_reference.clear();
                    $(`${modal_reference.id.MODAL} ${modal_reference.class.SUBMIT}`).html("Ekle");
                    img.attr("src","")
                    img.hide();
                })
                $(document).on("click",`${self.class.REFERENCE} [function]`,function () {
                    let element = $(this),
                        closest = element.closest("tr"),
                        type = element.attr("function"),
                        id = closest.attr("item-id");
                        let data = Variable.array_find(self.variable.DATA,"id", id)
                    switch (type) {
                        case "edit":
                            console.log("edit")
                            modal_reference.clear()
                            let image = $(`${modal_reference.id.MODAL} ${modal_reference.class.IMAGE} img`);
                            $(`${modal_reference.id.MODAL} form`).autofill(data);
                            image.attr("src",`../image/${data.image}`);
                            image.show();
                            $(modal_reference.id.MODAL).modal("show");
                            break;
                        case "delete":
                            console.log("delete")
                            HelperSweetAlert.question(`Referans Kalıcı Olarak Silinsinmi ?`, `<b>${data.name}</b> Adlı Referansı Kalıcı Olarak Silinecek Eminmisiniz ?`, lang.yes, lang.no,
                                function (q_result) {
                                    if (q_result.value) {
                                        Main.service(ServicePage.REFERENCE,"DELETE",{type: "delete", id: id},(result)=>{
                                            if (result.status) {
                                                HelperToastify.success(`<b>${data.name}</b> Adlı Blog Kalıcı Olarak Silindi.`)
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
            events();
            self.get();
        }
    }
    let modal_reference = {
        id: {
            MODAL: "#modal_reference",
        },
        class: {
            IMAGE: ".e_image",
            SUBMIT: ".e_submit"
        },
        set(data,method="POST"){
            data.type = "reference";
            Main.service(ServicePage.REFERENCE, method, data,function (data) {
                if (data.status){
                    main.get();
                }
            },false,true);
        },
        clear(){
            let self = this;
            let element = $(`${self.id.MODAL} form`);
            element[0].reset()
            element.autofill({id: "0",image:""})
        },
        init: function (){
            let self = this;
            function events(){
                $(`${self.id.MODAL} ${self.class.IMAGE} button[function=image],${self.id.MODAL} ${self.class.IMAGE} image`).click(()=> PageGallery.modal.open())
                PageGallery.modal.events.onSelected = function (result) {
                    let img = $(`${self.class.IMAGE} img`);
                    $(`${self.class.IMAGE} input[name=image]`).val(result);
                    img.attr("src",`../image/${result}`);
                    img.show();
                }
                $(document).on("submit",`${self.id.MODAL} form`,function (){
                    let data = $(this).serializeObject();
                    let method = (data.id > 0) ? "PUT": "POST";
                    self.set(data,method);
                    $(self.id.MODAL).modal("hide")
                    return false;
                })
            }
            events();
        }
    }

    return PageReference;
})();

$(document).ready(()=>PageReference())

