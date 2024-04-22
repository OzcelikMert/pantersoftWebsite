let PageLogin = (function () {
    function PageLogin(){login.init();}

    let login = {
        id: {MAIN: "#auth"},
        init(){
            let self = this;
            function events(){
                $(`${self.id.MAIN} form`).submit(function(e){
                    e.preventDefault();
                    let form_data = $(this).serializeObject();
                    Main.service(ServicePage.LOGIN, "GET",
                        form_data,
                        function (data) {
                            if (Variable.isset(()=> data.result.status)){
                                switch (data.result.status){
                                    case TableTypes.status.BANNED:
                                        HelperSweetAlert.error("Yasaklı Hesap", `Hesabınız <b>'${data.result.ban_date}'</b> tarihinden <b>'${data.result.ban_date_end}'</b> tarihine kadar yasaklanmıştır.<br> Açıklaması: <b>${data.result.ban_comment}</b>`, 60000)
                                        break;
                                    case TableTypes.status.PENDING:
                                        HelperSweetAlert.error("Onay Bekleyen Hesap", `Hesabınızın aktif olabilmesi için onay bekleniyor en kısa sürede sizlere ulaşıp hesabınızı açacağız`)
                                        break;
                                    case TableTypes.status.PASSIVE:
                                        HelperSweetAlert.error("Pasif Hesap", `Hesabınız pasife alınmıştır lütfen desteğe bildiriniz`)
                                        break;
                                    case TableTypes.status.DELETED:
                                        HelperSweetAlert.error("Silinmiş Hesap", `Bu hesap artık kullanılamıyor yada silinmiş`)
                                        break;
                                }
                            }else {
                                HelperToastify.success("Giriş Başarılı Yönlendiriliyorsunuz");
                                setTimeout(()=>{
                                    location.href = "index.html";
                                },1000)
                            }
                        }
                    );
                });
            }
            events();
        }
    }
    return PageLogin;
})();

$(function () {
    (new PageLogin());
})
