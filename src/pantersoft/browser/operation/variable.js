const FilterTypes = {
    EMAIL: 1,
    INT: 2,
    FLOAT: 3
}
const ClearTypes = {
    STRING: 1,
    EMAIL: 2,
    INT: 3,
    FLOAT: 4,
    SEO_URL: 5,
    ALPHABETS: 6
}
const SortTypes = {
    ASC: 1,
    DESC: 2
}
const DateMask = {
    ALL: "yyyy-mm-dd HH:MM:ss",
    INPUT_DATETIME: "yyyy-mm-ddIHH:MM"
}

const Variable = (function (){
    function Variable(){}

    Variable.clear = function (variable, type = ClearTypes.STRING, clear_html_tags = true) {
        variable = (typeof variable != "undefined") ? variable : null;
        if(variable !== null){
            variable = (clear_html_tags) ? strip_tags(variable) : variable;
            variable = variable.trim();
            variable = html_special_chars(variable);
            switch (type){
                case ClearTypes.INT:
                    variable = Number.parseInt(filter_var(variable, FilterTypes.INT));
                    break;
                case ClearTypes.FLOAT:
                    variable = Number.parseFloat(filter_var(variable, FilterTypes.FLOAT));
                    break;
                case ClearTypes.ALPHABETS:
                    variable = variable.replace(/[^a-zA-ZğüşöçİĞÜŞÖÇ\w ]/g, "");
                    break;
                case ClearTypes.EMAIL:
                    variable = filter_var(variable, FilterTypes.EMAIL);
                    break;
                case ClearTypes.SEO_URL:
                    variable = convert_seo_url(variable);
                    break;
            }
        }

        return variable;
    }

    Variable.total = function(array, key = ""){
        let total = 0.0;

        array.map(data => {
            total += parseFloat((key === "") ? data : data[key]);
        });

        return total;
    };

    Variable.clear_all_data = function (data) {
        for (let [key, _1] of Object.entries(data)) {
            let clear_type = ClearTypes.STRING;
            if(typeof _1 === "object"){ this.clear_all_data(_1); continue; }
            if(!isNaN(Number(_1))) clear_type = ClearTypes.FLOAT;
            data[key] = this.clear(_1, clear_type);
        }

        return data;
    }

    Variable.array_index_of = function (array, key, value){
        return array.map(data => {
            return (key === "") ? data : data[key];
        }).indexOf(value);
    };

    Variable.array_find = function (array, key, value){
        return array.find(function(data, index){
            data._index = index;
            return ((key === "") ? data : data[key]) == value
        });
    };

    Variable.array_find_multi = function (array, key, value){
        let founds = Array();

        array.find(function(data, index){
            let query = eval(((Array.isArray(value)) ? `value.includes(((key === "") ? data : data[key]))` : `((key === "") ? data : data[key]) == value`));
            data._index = index;
            if(query) founds.push(data);
        });
        return founds;
    };

    Variable.array_sort = function (array, key, sort_type = SortTypes.ASC){
        return array.sort(function (a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                // property doesn't exist on either object
                return 0;
            }

            const varA = (typeof a[key] === 'string')
                ? a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string')
                ? b[key].toUpperCase() : b[key];

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (sort_type === SortTypes.DESC) ? (comparison * -1) : comparison
            );
        });
    }

    Variable.array_clear_duplicates = function (array){
        return array.filter((c, index) => {return array.indexOf(c) === index;});
    }

    Variable.rnd = function (min,max){ //random on steroids
        if (min instanceof Array){ //returns random array item
            if(min.length === 0){
                return undefined;
            }
            if(min.length === 1){
                return min[0];
            }
            return min[this.rnd(0,min.length-1)];
        }
        if(typeof min === "object"){ // returns random object member
            min = Object.keys(min);
            return min[this.rnd(min.length-1)];
        }
        min = min === undefined?100:min;
        if (!max){
            max = min;
            min = 0;
        }
        return	Math.floor(Math.random() * (max-min+1) + min);
    };

    Variable.empty = function(...variable){
        for (let i = 0; i < variable.length; i++){
            if(
                !this.isset(() => variable[i]) ||
                variable[i] === null ||
                variable[i].length === 0 ||
                !variable[i].toString().trim()
            ) return true;
        }
        return false;
    }

    Variable.is_base64 = function (string) {
        try {
            if (string.split(',')[0].indexOf('base64') >= 0) string = string.split(',')[1];
            window.atob(string);
            return true;
        } catch(e) {
            return false;
        }
    }

    Variable.base64_to_blob = function (base64) {
        let byteString;
        if (base64.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(base64.split(',')[1]);
        else
            byteString = unescape(base64.split(',')[1]);
        let mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
        let ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {type:mimeString});
    }

    Variable.isset = function (variable){
        try {
            return typeof variable() !== 'undefined'
        } catch (e) {
            return false
        }
    }

    Variable.del_index_of = function (array, index){
        return array.splice(index, 1);
    }

    Variable.convert_string_to_key = function (string){
        return unescape(encodeURIComponent(this.clear(string.toString(), ClearTypes.SEO_URL)));
    }

    Variable.remove_last_char = function (value,remove_count = 1){
        return value.substring(value.length-1,remove_count * -1)
    }

    Variable.diff_minutes = function (dt2, dt1) {
        let diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
    }

    Variable.date_format = function (date, mask, utc = false) {

        let i18n = {
            dayNames: [
                "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
            ],
            monthNames: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ]
        };

        let token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTtI])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g;

        function pad(val, len = 0) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        }

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  i18n.dayNames[D],
                dddd: i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  i18n.monthNames[m],
                mmmm: i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                I:    "T",
                // @ts-ignore
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                // @ts-ignore
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            // @ts-ignore
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };

    Variable.decode_html = function (str = ""){
        //use jquary
       return unescape(str); //$('<textarea />').html(str).text();
    }

    function html_special_chars(variable) {
        return variable.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#039;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }

    Variable.html_special_chars_decode = function (html_string) {
        return html_string.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll("&#039;", "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
    }

    function strip_tags(variable){
        variable = variable.toString();
        return variable.replace(/<\/?[^>]+>/gi, '');
    }

    function filter_var(variable, filter_type) {
        let regex;

        // Check Filter Type
        switch(filter_type){
            case FilterTypes.EMAIL:
                regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
                break;
            case FilterTypes.INT:
                regex = /((?!(0))[0-9]+)/g;
                break;
            case FilterTypes.FLOAT:
                regex = /[+-]?([0-9]*[.])[0-9]+/g;
        }
        // Check Defined
        let match;
        if ((match = regex.exec(variable)) != null) {
            variable = match[0];
        } else {
            variable = "";
        }

        return variable;
    }

    function convert_seo_url(variable){
        variable = this.html_special_chars(this.strip_tags(variable.toString().toLowerCase().trim()));
        variable = variable.replace("'", '');
        let tr = Array('ş','Ş','ı','I','İ','ğ','Ğ','ü','Ü','ö','Ö','Ç','ç','(',')','/',':',',','!');
        let eng = Array('s','s','i','i','i','g','g','u','u','o','o','c','c','','','_','_','','');
        variable = variable.replaceArray(tr, eng);
        variable = variable.replace(/&amp;amp;amp;amp;amp;amp;amp;amp;amp;.+?;/g, '');
        variable = variable.replace(/\s+/g, '_');
        variable = variable.replace(/|-+|/g, '_');
        variable = variable.replace(/#/g, '');
        variable = variable.replace('.', '');
        return variable;
    }

    return Variable;
})();

Date.prototype.addDays = function(n) {
    this.setDate(this.getDate() + n);
};
Date.prototype.nextDay = function() {
    this.addDays(1);
};
Date.prototype.addMonths = function(n) {
    this.setMonth(this.getMonth() + n);
};
Date.prototype.addYears = function(n) {
    this.setFullYear(this.getFullYear() + n);
}


const Table = (function (){
    let data = {
        thead: "",
        tbody: "",
        table_option: {}
    }
    function Table(table_option){
        data.table_option = table_option;
        return tbl;
    }

    let tbl = {
        head : function (columns,thead_options = null){
            let attrs = "";
            let value = create_columns("th",columns);
            if (thead_options != null) attrs = create_attrs(thead_options)
            data.thead = `<thead ${attrs}>${value}</thead>`;
            return this;

        },
        body: function (columns,tbody_options = null){
            let attrs = "";
            let value = "";
            columns.forEach((item)=>{
                value += create_td_columns(item);
            })
            if (tbody_options != null) attrs = create_attrs(tbody_options)
            data.tbody = `<tbody ${attrs}>${value}</tbody>`;

            attrs = "";
            if (data.table_option != null) attrs = create_attrs(data.table_option)
            value = `<table${attrs}>${data.thead}${data.tbody}</table>`;
            data = { thead: "", tbody: ""}
            return value;
        },

    }

    function create_columns(tx,columns){
        // example: ["name","surname","phone","address"]
        let attrs = "";
        let _columns = "";
        if (columns instanceof Array) {
            columns.forEach((item)=>{
                if(item instanceof Object){
                    attrs = create_attrs(item.attr);
                    _columns += `<${tx}${attrs}>${item.html}</${tx}>`;
                }else {
                    _columns += `<${tx}>${item}</${tx}>`;
                }
            })
            return `<tr>${_columns}</tr>`;
        }
        else { return `<tr>${columns}</tr>` }
    }
    function create_td_columns(data){
        // example: ["name","surname","phone","address"]
        let attrs = "";
        let value = "";

        if(typeof data.td !== "undefined") {
            if (data.td instanceof Array) {
                data.td.forEach((item)=>{
                    if(item instanceof Object){
                        attrs = create_attrs(item.attr);
                        value += `<td${attrs}>${item.html}</td>`;
                    }else value += `<td>${item}</td>`;
                })
            }
        }

        if (typeof data.tr !== "undefined") attrs = create_attrs(data.tr);
        return `<tr${attrs}>${value}</tr>`;
    }
    function create_attrs(item){
        let values = "";
        for (let [key, val] of Object.entries(item)) values += `${key}='${val}' `
        return (values === "") ? "" : " " + values;
    }

    return Table;
})();

