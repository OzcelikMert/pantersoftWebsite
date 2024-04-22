function slideToggle(t,e,o){0===t.clientHeight?j(t,e,o,!0):j(t,e,o)}function slideUp(t,e,o){j(t,e,o)}function slideDown(t,e,o){j(t,e,o,!0)}function j(t,e,o,i){void 0===e&&(e=400),void 0===i&&(i=!1),t.style.overflow="hidden",i&&(t.style.display="block");var p,l=window.getComputedStyle(t),n=parseFloat(l.getPropertyValue("height")),a=parseFloat(l.getPropertyValue("padding-top")),s=parseFloat(l.getPropertyValue("padding-bottom")),r=parseFloat(l.getPropertyValue("margin-top")),d=parseFloat(l.getPropertyValue("margin-bottom")),g=n/e,y=a/e,m=s/e,u=r/e,h=d/e;window.requestAnimationFrame(function l(x){void 0===p&&(p=x);var f=x-p;i?(t.style.height=g*f+"px",t.style.paddingTop=y*f+"px",t.style.paddingBottom=m*f+"px",t.style.marginTop=u*f+"px",t.style.marginBottom=h*f+"px"):(t.style.height=n-g*f+"px",t.style.paddingTop=a-y*f+"px",t.style.paddingBottom=s-m*f+"px",t.style.marginTop=r-u*f+"px",t.style.marginBottom=d-h*f+"px"),f>=e?(t.style.height="",t.style.paddingTop="",t.style.paddingBottom="",t.style.marginTop="",t.style.marginBottom="",t.style.overflow="",i||(t.style.display="none"),"function"==typeof o&&o()):window.requestAnimationFrame(l)})}

let Main = (function () {

    function Main () {
        pre_loader.init();
        Main.variable.PAGE_NAME = Server.get_page_name();
        sidebar.init();
        Main.header.init();
    }

    let pre_loader = {
        variable: {
            SUBMIT_ELEMENT: null,
            SUBMIT_TEXT: ""
        },
        id:{
            PAGE: "#preloader_page"
        },
        page: {
            SHOW() {
                $("body").addClass("overflow-hidden");
            },
            HIDE(){
                $("body").removeClass("overflow-hidden");
            }
        },
        submit: {
            SHOW(){
                if(pre_loader.variable.SUBMIT_ELEMENT !== null)
                    pre_loader.variable.SUBMIT_ELEMENT.prop("disabled", true).html(`
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>${lang.loading}</span>
                    `);
            },
            HIDE(){
                if(pre_loader.variable.SUBMIT_ELEMENT !== null)
                    pre_loader.variable.SUBMIT_ELEMENT.prop("disabled", false).html(pre_loader.variable.SUBMIT_TEXT);
                pre_loader.variable.SUBMIT_ELEMENT = null;
                pre_loader.variable.SUBMIT_TEXT = "";
            }
        },
        init(){
            let self = this;

            function events(){
                $(document).ready(function (){
                    setTimeout(function () {
                        $(self.id.PAGE).fadeOut(500, function (){
                            $(this).remove();
                            self.page.HIDE();
                        });
                    }, 1000)
                });

                $(`button[type="submit"]`).on("click", function () {
                    let element = $(this);
                    self.variable.SUBMIT_TEXT = element.html();
                    self.variable.SUBMIT_ELEMENT = element;
                    return true;
                })
            }

            self.page.SHOW();
            events();
        }
    }

    Main.DataTable = (element, data = {}) => {
        data = Object.assign({
            destroy: true,
            perPage: 20,
            perPageSelect: false,
            labels: {
                placeholder: lang.search,
                info: "",
                noRows: "Sonuç bulunamadı"
            }
        }, data);

        let data_table = new simpleDatatables.DataTable(element, data);
        $(".dataTable-search").addClass("w-100");
        $(".dataTable-input").addClass("data-table-search-input float-end");
        return data_table;
    }

    Main.dir = {
        IMAGE(image) {return `../image/${image}`}
    }

    Main.status_bg = function (status) {
        let bg = "";
        switch (status){
            case TableTypes.status.ACTIVE: bg = "bg-success"; break;
            case TableTypes.status.PASSIVE: bg = "bg-secondary"; break;
            case TableTypes.status.PENDING: bg = "bg-warning"; break;
            case TableTypes.status.BANNED: bg = "bg-dark"; break;
            case TableTypes.status.DELETED: bg = "bg-danger"; break;
        }
        return bg;
    }

    Main.variable = {
        PAGE_NAME: "",
        USER_PERMISSION: [],
        USER_TYPE: 0
    }

    Main.service = (page, method, data, success_function, async = true, _pre_loader = false, check_error= true) => {
        $.ajax({
            url: `./service/${page}`,
            type: method,
            data: data,
            async: async,
            beforeSend: function () {
                pre_loader.submit.SHOW();
                if(_pre_loader) HelperSweetAlert.wait("Lütfen Bekleyin", "İşleminiz yapılıyor lütfen bekleyin...");
            },
            complete: function() {
                if(_pre_loader) HelperSweetAlert.close();
                pre_loader.submit.HIDE();
            },
            success: function (data) {
                console.log(data);
                if(!check_error || data.status) success_function(data);
                else if (check_error && !data.status){
                    check_error_code(data.error_code);
                }
            },
            error: (e) => {
                HelperSweetAlert.error("Hata!", `<b>Hata Mesajı:</b> <br> ${e.responseText}`);
            },
            timeout: Timeout.NORMAL
        });
    }

    function check_error_code(error_code){
        let text = "";

        switch (error_code) {
            case ErrorCode.INCORRECT_DATA: text = "Hatalı veri girişi!"; break;
            case ErrorCode.EMPTY_VALUE: text = "Lütfen boş yer bırakmayın!"; break;
            case ErrorCode.WRONG_VALUE: text = "Yanlış değer!"; break;
            case ErrorCode.REGISTERED_VALUE: text = "Kayıtlı değer!"; break;
            case ErrorCode.SQL_SYNTAX: text = "Desteğe bildir!"; break;
            case ErrorCode.NOT_FOUND: text = "Girdiğiniz değer bulunamadı"; break;
            case ErrorCode.UPLOAD_ERROR: text = "Dosya yüklenemedi"; break;
            case ErrorCode.NOT_LOGGED_IN:
                text = "Oturumunuz kapalı! Giriş sayfasına yönlendiriliyorsunuz";
                setTimeout( () => {location.href = "login";}, 1500)
                break;
            case ErrorCode.NO_PERM: text = "Yetki yetersiz!"; break;
            case ErrorCode.IP_BLOCK: text = "Yasaklanmış IP!"; break;
            case ErrorCode.WRONG_EMAIL_OR_PASSWORD: text = "Eposta veya şifre yanlış!"; break;
            case ErrorCode.WRONG_PASSWORD: text = "Şifre yanlış!"; break;
            case ErrorCode.NOT_SAME_VALUES: text = "Girilen değerler aynı değil!"; break;
        }

        HelperToastify.error(text, 10000);
    }

    Main.header = {
        class: {
            HEADER: ".e_header",
            USER_NAME: ".e_header_user_name",
            USER_IMAGE: ".e_header_user_image",
            HELLO_USER_NAME: ".e_header_hello_user_name"
        },
        init(){
          let self = this;

          function events(){
              $(`${self.class.HEADER} a[function]`).on("click", function () {
                  let _function = $(this).attr("function");

                  switch (_function){
                      case "exit":
                          Main.service(ServicePage.EXIT, "DELETE",
                              {},
                              function () {
                                  location.href = "login";
                              }
                          );
                          break;
                  }
              })
          }

          events();
        }
    }

    let sidebar = {
        init(){
            try {
                let sidebarItems = document.querySelectorAll('.sidebar-item.has-sub');
                for(var i = 0; i < sidebarItems.length; i++) {
                    let sidebarItem = sidebarItems[i];
                    sidebarItems[i].querySelector('.sidebar-link').addEventListener('click', function(e) {
                        e.preventDefault();

                        let submenu = sidebarItem.querySelector('.submenu');
                        if( submenu.classList.contains('active') ) submenu.style.display = "block"

                        if( submenu.style.display == "none" ) submenu.classList.add('active')
                        else submenu.classList.remove('active')
                        slideToggle(submenu, 300)
                    })
                }

                window.addEventListener('DOMContentLoaded', (event) => {
                    var w = window.innerWidth;
                    if(w < 1200) {
                        document.getElementById('sidebar').classList.remove('active');
                    }
                });
                window.addEventListener('resize', (event) => {
                    var w = window.innerWidth;
                    if(w < 1200) {
                        document.getElementById('sidebar').classList.remove('active');
                    }else{
                        document.getElementById('sidebar').classList.add('active');
                    }
                });

                document.querySelector('.burger-btn').addEventListener('click', () => {
                    document.getElementById('sidebar').classList.toggle('active');
                })
                document.querySelector('.sidebar-hide').addEventListener('click', () => {
                    document.getElementById('sidebar').classList.toggle('active');

                })


                // Perfect Scrollbar Init
                if(typeof PerfectScrollbar == 'function') {
                    const container = document.querySelector(".sidebar-wrapper");
                    const ps = new PerfectScrollbar(container, {
                        wheelPropagation: false
                    });
                }

                let name = Server.get_page_name(false);
                if(name === "") name = "index.html";
                console.log("name", name);
                let elements = $("#menu li").removeClass("active");
                Array.from($("#menu a")).forEach(element => {
                    element = $(element);
                    if(element.attr("href") === name){
                        element.closest("li").addClass("active");
                    }
                });

                document.querySelector('.sidebar-item.active').scrollIntoView(false);
            }catch (e) {

            }

        }
    }

    return Main;
})();

$(function () {
    (new Main());
})