let Helper = (function () {
    function Helper() {}
    Helper.logger = true;

    Helper.create_select_option = function (array, key_value, key_text, array_selected = [], check_function = (item) => { return true; }) {
        let elements = ``;
        array.forEach(item =>{
            if(!check_function(item)) return;
            let selected = (array_selected.length > 0 && array_selected.includes(item[key_value])) ? "selected" : "";
            elements += `<option value="${item[key_value]}" ${selected}>${item[key_text]}</option>`;
        });
        return elements;
    }

    // daha bitmedi aklımda bir fikir var bebek 😍
    Helper.log = {
        values : {
            channel: "default",
        },
        channel (name="default") {
            this.values.channel = name;
            return this;
        },
        send(data,description = null){
            if (description !== null) console.log( `%c${description.toUpperCase()}`, "color:orange;font-size:14px" )
        }
    }
    /* helper.log = function (data,description=null) {
        if (!helper.logger) return;
        if (typeof data == "string" || typeof data == "number" || typeof data == "boolean") {
            console.log(`%c${data}`,"color:orange;font-size:14px");
        }else {
            if (description !== null) console.log( `%c${description.toUpperCase()}`, "color:orange;font-size:14px" )
            console.log(data);
            console.log(".")
        }
    }*/

    //helper.log.channel("blog").send([{a:1,b:2}])



    Helper.create_table_columns = function (tr = {},columns = []){
        let class_list = "";
        let attr_list = "";
        let id = "";
        let td = "";

        try {
            if (typeof columns !== 'undefined'){
                if (typeof columns === 'string'){
                    td = columns;
                }else if (typeof columns === 'object'){

                    columns.forEach(function (item){
                        if (typeof item == "string") td += "<td>"+item + "</td> ";
                        if (typeof item == "object") {
                            let data = {
                                html: (item.html !== undefined) ? item.html : "",
                                id: (item.id !== undefined) ? `id='${item.id}' ` : "",
                                class: (item.class !== undefined) ? `class='${item.class}' ` : "",
                                style: (item.style !== undefined) ? `style='${item.style}' ` : "",
                                attr: (item.attr !== undefined) ? `style='${item.attr}' ` : "",
                            }
                            td += `<td ${data.id}${data.class}${data.style}${data.attr}>${data.html}</td>`;
                        }
                    })
                    td.slice(0,-1)
                }
            }
            // ===-| TR |-===
            if (typeof tr !== 'undefined'){
                if (typeof tr !== 'undefined'){
                    // -> class
                    if (typeof tr.class === 'string'){
                        class_list = `class='${tr.class}'`;
                    }else if (typeof tr.class === 'object'){
                        tr.class.forEach(function (item){ class_list += item +" "; })
                        class_list = `class='${class_list.slice(0,-1)}'`;
                    }
                    // -> id
                    if (typeof tr.id == 'string'){ id = `id='${tr.id}'` }

                    // -> attributes
                    if (typeof tr.attr === 'string'){
                        attr_list = tr.attr;
                    }else if (typeof tr.attr === 'object'){
                        for (const key in tr.attr) {
                            attr_list += `${key}="${tr.attr[key]}" `
                        }
                        attr_list.slice(0,-1)
                    }
                }
                tr = `<tr ${id} ${class_list} ${attr_list}>${td}</tr>`;
            }
            return tr;
        }catch (e) {return e}
    }
    Helper.get_pagination_elements = function (total, per_count, current){
        let elements = ``;
        let total_page = Math.ceil((total / per_count));
        current = (Number.isNaN(current) || current <= 0) ? 1 : current;
        current = (Number.isNaN(current) || current > total_page) ? total_page : current;
        /* Button Count */

        let length = 4;
        length = (length > total_page) ? total_page - 1 : length;
        let start = current - Math.floor(length / 2);
        start = Math.max(start, 1);
        start = Math.min(start, total_page - length);

        for (let i = 0; i <= length; ++i){
            let index = i + start;
            elements += `
                <li class="page-item ${(current === index) ? "active" : ""}">
                    <a class="page-link ${(current !== index) ? "text-dark" : ""}" index=${index}">${index}</a>
                </li>
            `;
        }

        elements = `
            <ul style="list-style: none; display: inline-flex;">
                <li class="page-item ${(current <= 1) ? "disabled" : ""}">
                    <a class="page-link text-dark" index=${current - 1}" tabindex="-1">Önceki</a>
                </li>
                ${elements}
                <li class="page-item ${(current >= total_page) ? "disabled" : ""}">
                    <a class="page-link text-dark" index=${current + 1}">Sonraki</a>
                </li>
            </ul>
        `;
        return elements;
    }

    Helper.check_mobile = function() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

    return Helper;
})();