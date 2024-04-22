import Variable from "../operation/variable";
import Mysql from "./index";

export enum var_types {
    NUMBER,
    STRING,
    BOOL,
    DOUBLE,
    SQL
}

// -- INTERFACES -- //
export interface Column{
    key:string,
    value: any | undefined,
    type?: var_types
}
export interface NoKeyColumn{
    value: any | undefined,
    type?: var_types
}
export interface JoinColumn{
    table:string,
    equal:Array<string>,
}
export interface BetweenColumn{
    column: string,
    values: Array<NoKeyColumn>,
}
export interface CaseColumn{
    column: string,
    value: any | undefined,
    result: any| undefined
    type?: var_types
}

// -- ENUMS -- //
export enum QueryType {
    SELECT,
    INSERT,
    UPDATE,
    DELETE,
}
export enum WhereOperatorType {
    EQUALS = " = ",
    LIKE = " LIKE ",
    NOT_LIKE = " NOT LIKE ",
    GREAT_THEN = " > ",
    GREAT_EQUALS = " >= ",
    LESS_THEN = " < ",
    LESS_EQUALS = " <= ",
}
export enum WhereNextOperator {
    AND = " AND ",
    OR = " OR ",
}
export enum OrderBy{
    DESC = "DESC",
    ASC = "ASC",
}
export enum JoinType {
    LEFT  = "LEFT",
    RIGHT = "RIGHT",
    INNER = "INNER",
}

// -- PARAM CLASSES -- //
export class ParamHelper{
    private readonly Main: Mysql;
    private data = {
        where: "",
        join: "",
        group_by: "",
        order_by: "",
        limit: ""
    }
    constructor(param_class: Mysql) {
        this.Main = param_class;
    }
    private creator_where(value: Array<Column> | Array<Column>[], type: WhereOperatorType, next_operator:WhereNextOperator = WhereNextOperator.AND){
        let data = "";
        let start_operator = (this.data.where.length > 0) ? next_operator : "";
        // @ts-ignore
        let is_multiple = (value[0] instanceof Array);
        if (is_multiple) {
            // @ts-ignore
            value.forEach((sub_value: Array<Column>,m_index)=>{
                sub_value.forEach( (item,s_index)=>{
                    if(typeof item == "object"){
                        let item_values = "";
                        if (typeof item.value == "object" && item.value.length > 1){ // [1,56,9,91] , ["ali","veli","mert"]
                            let size = item.value.length;
                            item.value.forEach((data: any,index:any)=>{
                                item_values += `${item.key}${type}${Helper.clear(data,item.type).value} `;
                                if (size -1 > index)  item_values += " or ";
                            })
                            item_values = ` (${item_values}) `;
                            data += item_values;
                        }else {
                            if (typeof item.value == "object" && item.value.length == 1) item.value = item.value[0];
                            data += `${item.key}${type}${Helper.clear(item.value,item.type).value} `;
                            if (sub_value.length > (s_index + 1))  this.data.where += " and ";
                        }
                    }
                })
                data = `(${data})`;

                if (value.length > m_index + 1) data += " or ";
            })

        }else {
            // @ts-ignore
            value.forEach((item: Column,m_index)=>{
                if(typeof item == "object"){
                    let item_values = "";
                    if (typeof item.value == "object"){ // [1,56,9,91] , ["ali","veli","mert"]
                        let size = item.value.length;
                        item.value.forEach((data:any,index:any)=>{
                            item_values += `${item.key}${type}${Helper.clear(data,item.type).value} `;
                            if (size -1 > index)  item_values += " or ";
                        })
                        item_values = `(${item_values}) `;
                        data += item_values;
                    }else {
                        data += `${item.key}${type}${Helper.clear(item.value,item.type).value} `;
                        if (value.length -1 > m_index)  data += "and ";
                    }
                }
            })
            data = `${start_operator}(${data})`;
        }
        this.data.where += data;
        return this;
    }
    private creator_join(value:Array<JoinColumn> | JoinColumn,type:JoinType){
        let self = this;
        let data = [];

        if (!(value instanceof Array)) data.push(value);

        // @ts-ignore
        value.forEach(function (item) {
            self.data.join += `${type} JOIN  ${item.table} on ${item.equal[0]} = ${item.equal[1]} `
        });
        return this;
    }
    where = {
        self: this,
        equals: function (value: Array<Column> | Array<Column>[],next_operator:WhereNextOperator = WhereNextOperator.AND) {
            return this.self.creator_where(value,WhereOperatorType.EQUALS,next_operator);
        },
        like: function (value: Array<Column> | Array<Column>[],next_operator:WhereNextOperator = WhereNextOperator.AND) {
            return this.self.creator_where(value,WhereOperatorType.LIKE,next_operator);
        },
        not_like:  function (value: Array<Column> | Array<Column>[],next_operator:WhereNextOperator = WhereNextOperator.AND) {
            return this.self.creator_where(value,WhereOperatorType.NOT_LIKE,next_operator);
        },
        great_then: function (value: Array<Column> | Array<Column>[], equals=false ,next_operator:WhereNextOperator = WhereNextOperator.AND) {
            if (equals){
                return this.self.creator_where(value,WhereOperatorType.GREAT_EQUALS,next_operator);
            }else {
                return this.self.creator_where(value,WhereOperatorType.GREAT_THEN,next_operator);
            }
        },
        less_then: function (value: Array<Column> | Array<Column>[], equals=false, next_operator:WhereNextOperator = WhereNextOperator.AND) {
            if (equals){
                return this.self.creator_where(value,WhereOperatorType.LESS_EQUALS,next_operator);
            }else {
                return this.self.creator_where(value,WhereOperatorType.LESS_THEN,next_operator);
            }
        },
        between: function (value: Array<BetweenColumn> | BetweenColumn, not=false, next_operator: WhereNextOperator = WhereNextOperator.AND) {
            let start_operator = (this.self.data.where.length > 0) ? next_operator : "";
            let result = "";
            let type = (not) ? "NOT BETWEEN" : "BETWEEN";
            let data = [];

            if (!(value instanceof Array)) {
                data.push(value);
            }else {
                data = value;
            }

            data.forEach((item: BetweenColumn,index)=>{
                if(item.values.length == 2) {
                    result += `${item.column} ${type} ${Helper.clear(item.values[0].value,item.values[0].type).value} AND ${Helper.clear(item.values[1].value,item.values[1].type).value} `;
                    if (data.length > index + 1) result += "AND "
                }
            })
            result += start_operator;
            this.self.data.where += result;
            return this.self;
        },
    }
    join = {
        self: this,
        left: function (value:Array<JoinColumn> ) {
            return this.self.creator_join(value,JoinType.LEFT)
        },
        right: function (value:Array<JoinColumn> ) {
            return this.self.creator_join(value,JoinType.RIGHT)
        },
        inner: function (value:Array<JoinColumn> ) {
            return  this.self.creator_join(value,JoinType.INNER)
        },
    }
    limit(value: Array<number> | any) {
        if (typeof value == "object") {
            this.data.limit = `LIMIT ${value.join(",")}`;
        }else {
            this.data.limit = `LIMIT ${value}`;
        }
        return this;
    }
    order_by(keys:Array<string> | string,order_by:OrderBy){
        let columns = "";
        let _keys = [];
        if (typeof keys == "object"){ _keys = keys } else _keys.push(keys);

        _keys.forEach((item,index)=>{
            columns += item;
            if (_keys.length > index + 1) columns +=",";
        })

        this.data.order_by = `${(this.data.order_by.length > 0) ? `${this.data.order_by},` : "ORDER BY"} ${columns} ${order_by}`;
        return this;
    }
    group_by(keys:Array<any>){
        let columns = "";
        keys.forEach((item,index)=>{
            columns += item;
            if (keys.length > index + 1) columns +=",";
        })
        this.data.group_by = `GROUP BY ${columns}`;
        return this;
    }
    txt(){
        return this.Main.run(true);
    }
    run(){
        return this.Main.run();
    }

    public _init(){
        let result = {
            where: this.data.where,
            join: this.data.join,
            group_by: this.data.group_by,
            order_by: this.data.order_by,
            limit: this.data.limit,
        }
        if(result.where.length > 0) result.where = `WHERE ${result.where}`;
        this.data.where = "";
        this.data.join = "";
        this.data.group_by = "";
        this.data.order_by = "";
        this.data.limit = "";
        return result;
    }

}
export class ParamSelect{
    private readonly Main : Mysql;
    private readonly ParamHelper : ParamHelper;
    private sql_columns: Array<string> = [];

    constructor(self_class: Mysql,helper_class: ParamHelper) {
        this.Main = self_class;
        this.ParamHelper = helper_class;
    }
    public columns(columns: Array<string> | string = ["*"]){
        if (typeof columns == "string") {
            this.sql_columns.push(columns);
        }else {
            this.sql_columns = columns;
        }
        return this.ParamHelper;
    }
    // Init Functions
    public _init(){
        return {columns: this.sql_columns.join(",")}
    }

}
export class ParamUpdate{
    private  Main : Mysql;
    private readonly ParamHelper : ParamHelper;
    private sql_columns: Array<Column> = [];

    constructor(self_class: Mysql,helper_class: ParamHelper) {
        this.Main = self_class;
        this.ParamHelper = helper_class;
    }
    public columns(columns: Array<Column> = []){
        this.sql_columns = columns;
        return this.ParamHelper;
    }
    // Init Functions
    public _init(){
        let columns = "";
        this.sql_columns.forEach((item,index)=>{
            columns += `${item.key} = ${Helper.clear(item.value,item.type).value}`;
            if (this.sql_columns.length > index + 1) columns += ", ";
        })
        return {columns: columns}
    }
}
export class ParamInsert{
    private readonly Main : Mysql;
    private insert_values: Array<Column> | Array<Column>[]  = [];
    constructor(self_class: Mysql) {
        this.Main = self_class;
    }
    values(values: Array<Column> | Array<Column>[]){
        this.insert_values = values;
        return this;
    }
    txt(){return this.Main.run(true);}
    run(){return this.Main.run();}
    // Init Functions
    private values_init(){
        let column_array: Array<string> = [];
        let sql_columns: string = "";
        let sql_values: string = "";
        let is_multiple: boolean;

        // Checked multi insert or single insert value
        is_multiple = (this.insert_values[0] instanceof Array);

        if (is_multiple){ // multi insert
            let column_lock = false;
            let insert_values: Array<any> = [];
            let index = 0;
            // @ts-ignore
            this.insert_values.forEach((item: Array<Column>)=>{
                item.forEach((data)=>{
                    if (!column_lock){
                        column_array.push(data.key)
                    }
                    if (typeof insert_values[index] === "undefined")  insert_values[index] = "";
                    insert_values[index] += `${Helper.clear(data.value,data.type).value},`;
                })
                insert_values[index] = insert_values[index].substring( insert_values[index].length-1,-1)
                index++;
                column_lock = true;
            })
            insert_values.forEach((item)=>{
                sql_values += `(${item}),`;
            })
        }else { //single insert
            // @ts-ignore
            this.insert_values.forEach((data: Column)=>{
                column_array.push(data.key)
                sql_values  += `${Helper.clear(data.value,data.type).value},`;
            })
        }
        sql_columns = `(${column_array.join(",")})`;
        sql_values = Variable.remove_last_char(sql_values);
        sql_values = (is_multiple) ? sql_values : `(${sql_values})`;
        return {columns: <string>sql_columns, values: <string>sql_values}
    }
    public _init() {
        return this.values_init();
    }

}
export class ParamCase{
    private case_when: string = "";
    constructor() {}
    private creator_case(value: Array<CaseColumn>,WhereOperatorType:WhereOperatorType){
        value.forEach((item)=>{
            this.case_when += `WHEN ${item.column} ${WhereOperatorType} ${Helper.clear(item.value,item.type).value} THEN "${item.result}" `;
        })
    }
    case = {
        self: this,
        equals: function (value: Array<CaseColumn>) {
            this.self.creator_case(value,WhereOperatorType.EQUALS)
            return this.self;
        },
        like: function (value: Array<CaseColumn>) {
            this.self.creator_case(value,WhereOperatorType.LIKE)
            return this.self;
        },
        not_like:  function (value: Array<CaseColumn>) {
            this.self.creator_case(value,WhereOperatorType.NOT_LIKE)
            return this.self;
        },
        great_then: function (value: Array<CaseColumn>,equals = false) {
            if (equals){
                this.self.creator_case(value,WhereOperatorType.GREAT_EQUALS)
                return this.self;
            }else {
                this.self.creator_case(value,WhereOperatorType.GREAT_THEN)
                return this.self;
            }
        },
        less_then: function (value: Array<CaseColumn>,equals = false) {
            if (equals){
                this.self.creator_case(value,WhereOperatorType.LESS_EQUALS)
                return this.self;
            }else {
                this.self.creator_case(value,WhereOperatorType.LESS_THEN)
                return this.self;
            }
        },
       /* between: function (value: Array<BetweenColumn> | BetweenColumn, not=false, next_operator: WhereNextOperator = WhereNextOperator.AND) {
            let start_operator = (this.self.data.where.length > 0) ? next_operator : "";
            let result = "";
            let type = (not) ? "NOT BETWEEN" : "BETWEEN";
            let data = [];

            if (!(value instanceof Array)) {
                data.push(value);
            }else {
                data = value;
            }

            data.forEach((item: BetweenColumn,index)=>{
                if(item.values.length == 2) {
                    result += `${item.column} ${type} ${Helper.clear(item.values[0].value,item.values[0].type).value} AND ${Helper.clear(item.values[1].value,item.values[1].type).value} `;
                    if (data.length > index + 1) result += "AND "
                }
            })
            result += start_operator;
            this.self.data.where += result;
            return this.self;
        },*/
    }
    else(value: string | null = null,type: var_types = var_types.STRING){
        if (value !== null){
            this.case_when += `ELSE ${Helper.clear(value,type).value} `;
        }
        let result = `(CASE ${this.case_when} END)`;
        this.case_when = "";
        return result;
    }

}

class Helper{
    static clear(value: any ,type:var_types = var_types.STRING){
        let result = {value: value, status: true}
        switch (type) {
            case var_types.BOOL:
                if (typeof value === "boolean") {
                    result.value = value;
                    return result;
                } else result.status = false;
                break;

            case var_types.NUMBER:
                if (typeof value === "number") {
                    result.value = value;
                    return result;
                } else {
                    result.value = Number(value);
                    result.status = false;
                }
                break;
            case var_types.SQL:
                    result.value = value;
                    result.status = true;
                break;
            default:
                if (typeof value == "string") {
                    value.replace("'", "").replace('"', "").replace("`", "").replace("(CASE WHEN", "")
                    result.value = `'${value}'`;
                    return result;
                } else result.status = false;
                break;
        }
        return result;
    }
    as_name(name: string, new_name: string) : string {
        return `${name} as ${new_name}`;
    }
    count(column: string) : string{
        return `COUNT(${column})`;
    }
    length(column: string) : string{
        return `LENGTH(${column})`;
    }
    max(column: string) : string{
        return `MAX(${column})`;
    }
    min(column: string) : string{
        return `MIN(${column})`;
    }
    sum(column: string) : string{
        return `SUM(${column})`;
    }
    if_null(column: string, value: string | Number) : string{
        return `IFNULL(${column}, ${value})`;
    }
    substring(value: string, start: Number, length: Number) : string{
        return `SUBSTRING(${value}, ${start}, ${length})`;
    }
    concat(string: Array<string>) : string{
        let concat = "";
        string.forEach(data =>{
            concat += `${data},`;
        });
        concat = Variable.remove_last_char(concat);
        return `CONCAT(${concat})`;
    }
    get case(){ return (new ParamCase()).case; }
}

export default Helper;