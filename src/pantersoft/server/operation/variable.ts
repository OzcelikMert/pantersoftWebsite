import {Readable} from "stream";
import {ErrorCode, TableTypes} from "../../../config/helper/require";
import {SessionAdmin} from "../../../config/session";

export enum FilterTypes {
    EMAIL,
    INT,
    FLOAT
}
export enum ClearTypes {
    STRING,
    EMAIL,
    INT,
    FLOAT,
    SEO_URL,
    ALPHABETS
}
export enum SortTypes {
    ASC,
    DESC
}
export enum DateMask {
    ALL = "yyyy-mm-dd HH:MM:ss",
    UNIFIED_ALL = "yyyymmddHHMMss"
}

export class Permisson {
   static control(session: SessionAdmin, user_type: number, permisson: number,) {
       let result = ErrorCode.SUCCESS;
       // @ts-ignore
       if(session.type !== user_type && Variable.array_index_of(session.permission, "id", permisson) === -1) result = ErrorCode.NO_PERM;
       return result;
    }
}

class Variable{
    clear(variable: any, type: ClearTypes = ClearTypes.STRING, clear_html_tags = true) : any {
        variable = (typeof variable != "undefined") ? variable : null;
        if(variable !== null){
            variable = (clear_html_tags) ? Variable.strip_tags(variable) : variable;
            if (isNaN(variable)) {
                variable = variable.toString().trim();
                variable = this.html_special_chars(variable);
            }
            switch (type){
                case ClearTypes.INT:
                    variable = Number.parseInt(Variable.filter_var(variable, FilterTypes.INT));
                    break;
                case ClearTypes.FLOAT:
                    variable = Number.parseFloat(Variable.filter_var(variable, FilterTypes.FLOAT));
                    break;
                case ClearTypes.ALPHABETS:
                    variable = variable.replace(/[^a-zA-ZğüşöçİĞÜŞÖÇ\w ]/g, "");
                    break;
                case ClearTypes.EMAIL:
                    variable = Variable.filter_var(variable, FilterTypes.EMAIL);
                    break;
                case ClearTypes.SEO_URL:
                    variable = this.convert_seo_url(variable);
                    break;
            }
        }

        return variable;
    }

    clear_all_data(data: object | any, not_column : Array<string> = []) : object | any {
        if(!this.isset(() => data)) return false;

        for (let [key, _1] of Object.entries(data)) {
            if (not_column.includes(key)) continue;
            let clear_type = ClearTypes.STRING;
            if(!this.empty(_1)) {
                if(typeof _1 === "object"){ this.clear_all_data(_1); continue; }
                if (!isNaN(Number(_1))){
                    if (Number(_1).isInt()) clear_type = ClearTypes.INT;
                    else if (Number(_1).isFloat()) clear_type = ClearTypes.FLOAT;
                }
            }
            data[key] = this.clear(_1, clear_type, false);
        }

        return data;
    }

    array_index_of(array: Array<any>, key: string, value: any){
        return array.map(data => {
            return (key === "") ? data : data[key];
        }).indexOf(value);
    };

    array_find(array: Array<any>, key: string, value: string){
        return array.find(function(data, index){
            data._index = index;
            return ((key === "") ? data : data[key]) == value
        });
    };

    array_find_multi(array: Array<any>, key: string, value: any){
        let founds = Array();
        array.find(function(data, index){
            let query = eval(((Array.isArray(value)) ? `value.includes(((key === "") ? data : data[key]))` : `((key === "") ? data : data[key]) == value`));
            data = Object.assign(data, {_index: index});
            if(query) founds.push(data);
        });
        return founds;
    };

    array_sort(array: Array<any>, key: string, sort_type: SortTypes = SortTypes.ASC){
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

    isset(...variable: any) : boolean{
        let result;
        try{
            for (let i = 0; i < variable.length; i++){
                result = variable[i]();
            }
        }catch (e){
            result = undefined;
        }finally {
            return result !== undefined;
        }
    }

    /**
     * 
     * @param _value 
     * Checks your entered value Ex: if(_value === case_key)
     * @param _case 
     * Usage: { "default": () => any}
     * @returns 
     */
    switch(_value: any, _case: object = { "default":  () => false }) : any {
        let result;
        for (let [key, value] of Object.entries(_case)) {
            if(key === "default") {
                result = value(); 
                continue;
            }else if(_value === key) {
                result = value();
            }
        }
        return result;
    }

    empty(...variable: any) : boolean{
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

    convert_string_to_key(string: string){
        return unescape(encodeURIComponent(this.clear(string.toString(), ClearTypes.SEO_URL)));
    }

    remove_last_char(value:string,remove_count:number=1){
       return value.substring(value.length-1,remove_count * -1)
    }

    diff_minutes(dt2: Date, dt1: Date) {
        let diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
    }

    date_format(date: Date | any, mask: string, utc: boolean = false) {

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

        let token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g;

        function pad(val: any, len: any = 0) : any {
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

        const _ = utc ? "getUTC" : "get",
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
                d: d,
                dd: pad(d),
                ddd: i18n.dayNames[D],
                dddd: i18n.dayNames[D + 7],
                m: m + 1,
                mm: pad(m + 1),
                mmm: i18n.monthNames[m],
                mmmm: i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                M: M,
                MM: pad(M),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                // @ts-ignore
                Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                // @ts-ignore
                S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            // @ts-ignore
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };

    html_special_chars(variable: any) : any {
        return escape(variable); //variable.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#039;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }

    html_special_chars_decode(variable: any) : any {
        return variable.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll("&#039;", "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
    }

    random(min: number, max: number) : number{
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    buffer_to_stream(buffer: Buffer): Readable {
        const readable = new Readable()
        readable._read = () => {}
        readable.push(buffer)
        readable.push(null)
        return readable
    }

    private static strip_tags(variable: any) : any{
        variable = variable.toString();
        return variable.replace(/<\/?[^>]+>/gi, '');
    }

    private static filter_var(variable: any, filter_type: FilterTypes) : string {
        let regex;

        // Check Filter Type
        switch(filter_type){
            case FilterTypes.EMAIL:
                regex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
                break;
            case FilterTypes.INT:
                regex = /([0-9]+)/g;
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

    private convert_seo_url(variable: any) : string{
        variable = this.html_special_chars(Variable.strip_tags(variable.toString().toLowerCase().trim()));
        variable = variable.replace("'", '');
        let tr = Array('ş','Ş','ı','I','İ','ğ','Ğ','ü','Ü','ö','Ö','Ç','ç','(',')','/',':',',','!');
        let eng = Array('s','s','i','i','i','g','g','u','u','o','o','c','c','','','_','_','','');
        variable = variable.replaceArray(tr, eng);
        variable = variable.replace(/[^-\w\s]/g, ''); // Remove unneeded characters
        variable = variable.replace(/^\s+|\s+$/g, ''); // Trim leading/trailing spaces
        variable = variable.replace(/[-\s]+/g, '-'); // Convert spaces to hyphens
        variable = variable.toLowerCase(); // Convert to lowercase
        return variable;
    }

}

declare global {
    interface String {
        replaceAll(find: string, replace: string): string
        replaceArray(find: Array<string>, replace: Array<string>): string
    }
    interface Number {
        isInt(): boolean
        isFloat(): boolean
    }
    interface Date {
        addDays(n: any): any;
        nextDay() : any;
        addMonths(n: any): any;
        addYears(n: any): any;
    }
}

String.prototype.replaceAll = function (find: string, replace: string) : string {
    let str = this.toString();
    return str.replace(new RegExp(find, 'g'), replace);
}
String.prototype.replaceArray = function(find:Array<string>, replace:Array<string>): string {
    let replaceString = this;
    for (let i = 0; i < find.length; i++) {
        replaceString = replaceString.replace(find[i], replace[i]);
    }
    return replaceString.toString();
};
Number.prototype.isInt = function (): boolean{
    if (typeof this !== "number") return false;
    let n = <number> this;
    return Number(n) === n && n % 1 === 0;
}
Number.prototype.isFloat = function (): boolean{
    if (typeof this !== "number") return false;
    let n  = <number> this;
    return Number(n) === n && n % 1 !== 0;
}
Date.prototype.addDays = function(n) {
    this.setDate(this.getDate() + n);
};
// Can call it tomorrow if you want
Date.prototype.nextDay = function() {
    this.addDays(1);
};
Date.prototype.addMonths = function(n) {
    this.setMonth(this.getMonth() + n);
};
Date.prototype.addYears = function(n) {
    this.setFullYear(this.getFullYear() + n);
}

export default Variable.prototype;


