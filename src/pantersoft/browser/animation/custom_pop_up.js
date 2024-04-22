//Delay Class => .animate__faster added
//  class="animate__animated animate__faster"
// <link rel="stylesheet" href="animate.min.css"/>
let custom_pop_up = (function() {
    let element_id, showing_animation_class, closing_animation_class;

    function custom_pop_up(element_id, showing_animation_class, closing_animation_class) {
        this.element_id = element_id;
        this.showing_animation_class = showing_animation_class;
        this.closing_animation_class = closing_animation_class;
        $(this.element_id).addClass("animate__animated animate__faster")
    }

    function set_element_status_effect(element, add_class, remove_class){
        element.addClass(add_class);
        element.removeClass(remove_class);
    }

    custom_pop_up.prototype.open = function() {
        try{
            set_element_status_effect($(this.element_id), this.showing_animation_class, this.closing_animation_class);
            $(this.element_id).show(0);
        }catch (exception){ return exception;}
    }

    custom_pop_up.prototype.close = function() {

        try{
            set_element_status_effect($(this.element_id), this.closing_animation_class, this.showing_animation_class);
            $(this.element_id).delay(500).hide(0);
        }catch (exception){ return exception;}
    }

    return custom_pop_up;
})();


