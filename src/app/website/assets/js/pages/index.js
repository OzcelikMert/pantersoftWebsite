let PageIndex = (function () {
    function PageIndex(){ 
        slider.init();
    }

    PageIndex.html = {
        slider: function (data) {
            let html = ``;
    
            data.forEach(item => {
                html += `
                    <div class="text-center">
                        <h1 class="mx-auto my-0 text-uppercase mb-5 fw-bold">${unescape(item.title)}</h1>
                        <h2 class="text-white mx-auto mt-2 mb-5">${unescape(item.content)}</h2>
                        <div>
                            <a href="#contact" class="btn-get-started scrollto">İletişim</a>
                            <a href="#services" class="btn-services scrollto">Hizmetlerimiz</a>
                        </div>
                    </div>
                `;
            });
    
            return html;
        },
        service: function (data) {
            let html = ``;
            let html_item = ``;

            let count_item = 0;
            let count_max_item = 0;
            let count_row = 0;
            let lg = 0;
            data.forEach((item, index) => {
                if(count_row < 1) {
                    lg = 4;
                    count_max_item = 3;
                }else{
                    lg = 6;
                    count_max_item = 2;
                }

                html_item += `
                    <div class="col-lg-${lg} mb-4">
                        <div class="card wow bounceInUp">
                            <img src="../image/${item.image}" alt="${unescape(item.title)}"/>
                            <div class="card-body">
                                <h5 class="card-title">${unescape(item.title)}</h5>
                                <p class="card-text">${unescape(item.content)}</p>
                            </div>
                        </div>
                    </div>
                `;
                count_item++;

                if(count_item >= count_max_item || typeof data[index + 1] === "undefined") {
                    html += `<div class="row row-eq-height justify-content-center">${html_item}</div>`;
                    html_item = ``;
                    count_item = 0;
                    count_row++;
                    count_row = (count_row > 1) ? 0 : count_row;
                }
            });
    
            return html;
        },
        counter: function(data) {
            let html = ``;
    
            data.forEach(item => {
                let type = (item.type == TableTypes.counter_type.PLUS) ? "plus" : (item.type == TableTypes.counter_type.MINUS) ? "minus" : "percent";

                html += `
                    <div class="col-lg-3 col-6 text-center">
                        <span><i class="${unescape(item.image)}"></i></span>
                        <span>
                            <font data-toggle="counter-up">${unescape(item.value)}</font>
                            <i class="bi bi-${type}"></i>
                        </span>
                        <p>${item.title}</p>
                    </div>
                `;
            });
    
            return html;
        }
    }

    let slider = {
        init(){
            let self = this;

            function events(){
                $(".testimonials-carousel").owlCarousel({
                    autoplay: true,
                    dots: true,
                    loop: true,
                    items: 1
                });

                $('[data-toggle="counter-up"]').counterUp({
                    delay: 10,
                    time: 1000
                });

                if(!Helper.check_mobile()){
                    particlesJS.load('particle_why_us', './assets/json/particles-2.json', function() {});
                }
            }

            events();
        }
    }

    return PageIndex;
})();

if (typeof module !== 'undefined') {
    module.exports = PageIndex.html;
} else{
    $(function () {
        (new PageIndex());
    });
    
    
    jQuery(document).ready(function($) {
        "use strict";
    
        //Contact
        $('form.contactForm').submit(function() {
            var f = $(this).find('.form-group'),
                ferror = false,
                emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;
    
            f.children('input').each(function() { // run all inputs
    
                var i = $(this); // current input
                var rule = i.attr('data-rule');
    
                if (rule !== undefined) {
                    var ierror = false; // error flag for current input
                    var pos = rule.indexOf(':', 0);
                    if (pos >= 0) {
                        var exp = rule.substr(pos + 1, rule.length);
                        rule = rule.substr(0, pos);
                    } else {
                        rule = rule.substr(pos + 1, rule.length);
                    }
    
                    switch (rule) {
                        case 'required':
                            if (i.val() === '') {
                                ferror = ierror = true;
                            }
                            break;
    
                        case 'minlen':
                            if (i.val().length < parseInt(exp)) {
                                ferror = ierror = true;
                            }
                            break;
    
                        case 'email':
                            if (!emailExp.test(i.val())) {
                                ferror = ierror = true;
                            }
                            break;
    
                        case 'checked':
                            if (! i.is(':checked')) {
                                ferror = ierror = true;
                            }
                            break;
    
                        case 'regexp':
                            exp = new RegExp(exp);
                            if (!exp.test(i.val())) {
                                ferror = ierror = true;
                            }
                            break;
                    }
                    i.next('.validation').html((ierror ? (i.attr('data-msg') !== undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
                }
            });
            f.children('textarea').each(function() { // run all inputs
    
                var i = $(this); // current input
                var rule = i.attr('data-rule');
    
                if (rule !== undefined) {
                    var ierror = false; // error flag for current input
                    var pos = rule.indexOf(':', 0);
                    if (pos >= 0) {
                        var exp = rule.substr(pos + 1, rule.length);
                        rule = rule.substr(0, pos);
                    } else {
                        rule = rule.substr(pos + 1, rule.length);
                    }
    
                    switch (rule) {
                        case 'required':
                            if (i.val() === '') {
                                ferror = ierror = true;
                            }
                            break;
    
                        case 'minlen':
                            if (i.val().length < parseInt(exp)) {
                                ferror = ierror = true;
                            }
                            break;
                    }
                    i.next('.validation').html((ierror ? (i.attr('data-msg') != undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
                }
            });
            if (ferror) return false;
            else var str = $(this).serializeObject();
            console.log(str);
            $.ajax({
                url: "./functions/index/send_mail.php",
                type: "POST",
                data: str,
                success: function(data) {
                    console.log(data);
                    data = JSON.parse(data);
                    console.log(data);
                    if (data.rows.status) {
                        $("#sendmessage").addClass("show");
                        $("#errormessage").removeClass("show");
                        $('.contactForm').find("input, textarea").val("");
                    } else {
                        $("#sendmessage").removeClass("show");
                        $("#errormessage").addClass("show");
                        $('#errormessage').html(data.rows.message);
                    }
    
                }
            });
            return false;
        });
    
    });
}