const PageProfile = (function () {
    function PageProfile(){
        main.init();
        image.init();
        details.init();
        info.init();
        social_media.init();
    }

    let main = {
        variable: {
            DATA: Array()
        },
        class: {
            TABS: ".e_tabs"
        },
        get(){
            let self = this;
            Main.service(ServicePage.USER, "GET",
                {type: "user"},
                function (data) {
                    self.variable.DATA = data.result;
                },
                false
            );
        },
        init(){
            let self = this;

            function events(){
                $(`${self.class.TABS} a`).on("click", function () {
                    let _function = $(this).attr("function");

                    switch (_function) {
                        case "info": info.get(); break;
                        case "social_media": social_media.get(); break;
                    }
                })
            }

            events();
            self.get();
        }
    }

    let image = {
        class: {
            AVATAR: ".e_avatar"
        },
        get(){
            let self = this;
            $(`${self.class.AVATAR} img`).attr("src", `../image/${main.variable.DATA.image}`);
        },
        init(){
            let self = this;

            function events(){
                $(`${self.class.AVATAR} a[function]`).on("click", function () {
                    let _function = $(this).attr("function");

                    switch (_function){
                        case "edit":
                            PageGallery.modal.open();
                            PageGallery.modal.events.onSelected = function (result) {
                                Main.service(ServicePage.USER, "PUT",
                                    {image: result, type: "image"},
                                    function (data) {
                                        main.variable.DATA = Object.assign(main.variable.DATA, {image: result});
                                        self.get();
                                        $(Main.header.class.USER_IMAGE).attr("src", `../image/${main.variable.DATA.image}`);
                                        HelperToastify.success("Profil resminiz güncellendi!");
                                    }
                                )
                            }
                            break;
                    }
                });
            }

            events();
            self.get();
        }
    }

    let details = {
        get(){

        },
        init(){
            let self = this;

            function events(){

            }

            events();
            self.get();
        }
    }

    let info = {
        class: {
            INFO: ".e_info"
        },
        get(){
            let self = this;
            $(`${self.class.INFO} form`).autofill(main.variable.DATA);
        },
        init(){
            let self = this;

            function events(){
                $(`${self.class.INFO} form`).submit(function (e) {
                    e.preventDefault();
                    let form_data = $(this).serializeObject();
                    Main.service(ServicePage.USER, "PUT",
                        Object.assign(form_data, {type: "info"}),
                        function (data) {
                            main.variable.DATA = Object.assign(main.variable.DATA, form_data);
                            self.get();
                            $(Main.header.class.USER_NAME).html(`${main.variable.DATA.name} ${main.variable.DATA.surname.toUpperCase()}`);
                            $(Main.header.class.HELLO_USER_NAME).html(`${main.variable.DATA.name}`);
                            HelperToastify.success("Profil bilgileriniz güncellendi!");
                        }
                    )
                });
            }

            events();
            self.get();
        }
    }

    let social_media = {
        class: {
            SOCIAL_MEDIA: ".e_social_media"
        },
        get(){
            let self = this;
            console.log(main.variable.DATA)
            $(`${self.class.SOCIAL_MEDIA} form`).autofill(main.variable.DATA);
        },
        init(){
            let self = this;

            function events(){
                $(`${self.class.SOCIAL_MEDIA} form`).submit(function (e) {
                    e.preventDefault();
                    let form_data = $(this).serializeObject();
                    Main.service(ServicePage.USER, "PUT",
                        Object.assign(form_data, {type: "social_media"}),
                        function (data) {
                            main.variable.DATA = Object.assign(main.variable.DATA, form_data);
                            self.get();
                            HelperToastify.success("Sosyal medya bilgileriniz güncellendi!");
                        }
                    )
                });
            }

            events();
        }
    }


    return PageProfile;
})();

$(function () {
    (new PageProfile());
})