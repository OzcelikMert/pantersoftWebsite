let Main = (function () {
    function Main(){
        pre_loader.init();
        navbar.init();
    }

    let navbar = {
        id: {
            HEADER: "#header"
        },
        check(){
            if ($('.main-nav').length) {
                var $mobile_nav = $('.main-nav').clone().prop({
                    class: 'mobile-nav d-lg-none'
                });
                $('body').append($mobile_nav);
                $('body').prepend('<button type="button" class="mobile-nav-toggle d-lg-none"><i class="bi bi-list"></i></button>');
                $('body').append('<div class="mobile-nav-overly"></div>');
        
                $(document).on('click', '.mobile-nav-toggle', function(e) {
                    $('body').toggleClass('mobile-nav-active');
                    $('.mobile-nav-toggle i').toggleClass('bi-x bi-list');
                    $('.mobile-nav-overly').toggle();
                });
        
                $(document).on('click', '.mobile-nav .drop-down > a', function(e) {
                    e.preventDefault();
                    $(this).next().slideToggle(300);
                    $(this).parent().toggleClass('active');
                });
        
                $(document).click(function(e) {
                    var container = $(".mobile-nav, .mobile-nav-toggle");
                    if (!container.is(e.target) && container.has(e.target).length === 0) {
                        if ($('body').hasClass('mobile-nav-active')) {
                            $('body').removeClass('mobile-nav-active');
                            $('.mobile-nav-toggle i').toggleClass('bi-x bi-list');
                            $('.mobile-nav-overly').fadeOut();
                        }
                    }
                });
            } else if ($(".mobile-nav, .mobile-nav-toggle").length) {
                $(".mobile-nav, .mobile-nav-toggle").hide();
            }
        },
        check_scroll(){
            let header = $(navbar.id.HEADER);
            var nav_sections = $('section');
            var main_nav = $('.main-nav, .mobile-nav');
            var main_nav_height = $(navbar.id.HEADER).outerHeight();
            var cur_pos = $(window).scrollTop();
        
            nav_sections.each(function() {
                var top = $(window).offset().top - main_nav_height,
                    bottom = top + $(window).outerHeight();
        
                if (cur_pos >= top && cur_pos <= bottom) {
                    main_nav.find('li').removeClass('active');
                    main_nav.find('a[href="#'+$(window).attr('id')+'"]').parent('li').addClass('active');
                }
            });
        
            if (cur_pos > 100) {
                if(!header.hasClass("header-scrolled")){
                    header.find(`.logo a[function="full"]`).hide();
                    header.find(`.logo a[function="short"]`).show();
                    header.addClass('header-scrolled');
                    $('.back-to-top').fadeIn('slow');
                }
            } else {
                if(header.hasClass("header-scrolled")){
                    header.removeClass('header-scrolled');
                    header.find(`.logo a[function="full"]`).show();
                    header.find(`.logo a[function="short"]`).hide();
                    $('.back-to-top').fadeOut('slow');
                }
            }
        },
        init(){
            let self = this;

            function events() {
                $(window).scroll(self.check_scroll);

                $('.back-to-top').click(function(){
                    $('html, body').animate({scrollTop : 0},100, 'easeInOutExpo');
                    return false;
                });

                $('.main-nav a, .mobile-nav a, .scrollto').on('click', function() {
                    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                        var target = $(this.hash);
                        if (target.length) {
                            var top_space = 0;
            
                            if ($(self.id.HEADER).length) {
                                top_space = $(self.id.HEADER).outerHeight();
            
                                if (! $(self.id.HEADER).hasClass('header-scrolled')) {
                                    top_space = top_space - 20;
                                }
                            }
            
                            $('html, body').animate({
                                scrollTop: target.offset().top - top_space
                            }, 100, 'easeInOutExpo');
            
                            if ($(this).parents('.main-nav, .mobile-nav').length) {
                                $('.main-nav .active, .mobile-nav .active').removeClass('active');
                                $(this).closest('li').addClass('active');
                            }
            
                            if ($('body').hasClass('mobile-nav-active')) {
                                $('body').removeClass('mobile-nav-active');
                                $('.mobile-nav-toggle i').toggleClass('bi-x bi-list');
                                $('.mobile-nav-overly').fadeOut();
                            }
                            return false;
                        }
                    }
                });
            }

            events();
            self.check();
            self.check_scroll();
            (new WOW().init());
        }
    }

    let subscribe = {
        id: {
            FORM: "#form_subscribe"
        },
        init(){
            let self = this;

            function events(){
                $(self.id.FORM).submit(function (e) {
                    let element = $(this);
                    e.preventDefault();
            
                    $.ajax({
                        url: "./sameparts/functions/footer/subscribe.php",
                        type: "POST",
                        data: $(this).serializeObject(),
                        success: function(data) {
                            console.log(data);
                            data = JSON.parse(data);
                            console.log(data);
                            if (data.status) {
                                $("#subscribe_success").show();
                                $("#subscribe_error").hide();
                                element.remove();
                            } else {
                                $('#subscribe_error').html(data.message);
                                $("#subscribe_error").show();
                                $("#subscribe_success").hide();
                            }
            
                        }
                    });
                });
            }

            events();
        }
    }

    let pre_loader = {
        variable: {
            SUBMIT_ELEMENT: null,
            SUBMIT_TEXT: ""
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
                $(`button[type="submit"]`).on("click", function () {
                    let element = $(this);
                    self.variable.SUBMIT_TEXT = element.html();
                    self.variable.SUBMIT_ELEMENT = element;
                    return true;
                })
            }

            events();
        }
    }

    Main.service = (page, method, data, success_function, async = true) => {
        $.ajax({
            url: `./service/${page}`,
            type: method,
            data: data,
            async: async,
            beforeSend: function () {
                pre_loader.submit.SHOW();
            },
            complete: function() {
                pre_loader.submit.HIDE();
            },
            success: function (data) {
                console.log(data);
                success_function(data);
            },
            error: (e) => {},
            timeout: Timeout.NORMAL
        });
    }

    return Main;
})();

$(function () {
    (new Main());
});


