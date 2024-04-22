const Server = (function() {

    function Server(){}

    Server.is_valid_url = function(url) {
        try {
            new URL(url);
        } catch (_) {
            return false;
        }
        return true;
    }

    Server.get_url_methods = function (name) {
        let methods={};
        location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){methods[k]=v})
        return name?methods[name]:methods;
    }

    Server.get_page_name = function (clear_tag = true){
        let page_name = window.location.pathname.split("/").pop();
        if(clear_tag) page_name = page_name.replace('.html', '').replace('.php', '');
        return page_name;

    }

    return Server;
})();