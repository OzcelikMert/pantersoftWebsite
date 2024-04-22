const PageChangePassword = (function () {
    function PageChangePassword(){
        main.init();
    }

    let main = {
        class: {
            CHANGE_PASSWORD: ".e_change_password"
        },
        init(){
            let self = this;

            function events(){
                $(`${self.class.CHANGE_PASSWORD} form`).submit(function (e) {
                    e.preventDefault();
                    let element = $(this);
                    let form_data = element.serializeObject();
                    Main.service(ServicePage.USER, "PUT",
                        Object.assign(form_data, {type: "change_password"}),
                        function (data){
                            element.trigger("reset");
                            HelperToastify.success("Şifreniz başarı ile değiştirildi");
                        }
                    )
                })
            }

            events();
        }
    }

    return PageChangePassword;
})();

$(function () {
    (new PageChangePassword());
})