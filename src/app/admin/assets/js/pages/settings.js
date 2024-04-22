let PageSettings = (function () {
    function PageSettings(){
        main.init();
    }
    let main = {
        variable: { DATA: [], IMAGE: {input: "", img: ""}},
        class: {
            MAIN: ".e_setting",
            IMAGE_BUTTON: ".e_image_button",
        },
        get(){
            let self = this;
            Main.service(ServicePage.SETTINGS,"GET",null,(data)=>{
                console.log("get:settings",data)
                if (data.status) {
                    self.variable.DATA = data.result;
                }
                self.variable.DATA.forEach((item) => {
                    $(`${self.class.MAIN} form[name=${item.key}]`).autofill(item.value).trigger('change');
                    if (item.key === "general") {
                        Array.from($(`${self.class.MAIN} form[name=general] input[hidden-type=image]`)).forEach((sub_item)=>{
                            let element = $(sub_item);
                            element.closest("tr").find("img").attr("src",`../image/${element.val()}`)
                        })
                    }
                })

                }, false);
        },
        fill(type="general"){
            let self = this;
            let data = Variable.array_find(self.variable.DATA,"key",type)
            $(`${self.class.MAIN} form[name='${type}']`).autofill(data.value)
        },
        set(form_data){
            let self = this;
            Main.service(ServicePage.SETTINGS,"POST", form_data,(result)=>{
                if (result.status) {
                    let update_index = Variable.array_index_of(self.variable.DATA,"key",form_data.type)
                    self.variable.DATA[update_index].value = form_data[form_data.type];
                    HelperToastify.success("Ayar Kaydedildi.")
                }
            }, false);
        },
        init(){
            let self = this;
            function events(){
                PageGallery.modal.events.onSelected = function (result) {
                    $(self.variable.IMAGE.input).val(`${result}`);
                    $(self.variable.IMAGE.img).attr("src",`../image/${result}`);
                    self.variable.IMAGE.img.show();
                }
                let last_active_type = `general`
                $(document).on("click",`${self.class.MAIN} a[function]`,function () {
                    let element = $(this), type = element.attr("function")
                    self.fill(type)
                    $(`.e_setting #setting-${last_active_type}`).hide()
                        $(`.e_setting #setting-${type}`).fadeIn()
                        last_active_type = type;
                })
                $(document).on("click",`${self.class.MAIN} ${self.class.IMAGE_BUTTON}`,function () {
                    let element = $(this).closest("tr")
                    self.variable.IMAGE.input = element.find("input[hidden-type=image]"),
                    self.variable.IMAGE.img = element.find("img");
                    PageGallery.modal.open();
                })
                $(document).on("submit",`${self.class.MAIN} form`,function () {
                    let data = {},
                        element = $(this),
                        type = element.attr("name");
                        data[type] = element.serializeObject();
                        data.type = type;
                    self.set(data);
                    return false;
                })

                $(`${main.class.MAIN} a[function=${window.location.hash.substring(1)}]`).click();
            }
            self.get();
            events();
        }
    }

    return PageSettings;
})();

$(document).ready(()=>PageSettings())

