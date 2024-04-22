import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V, {ClearTypes, DateMask} from "../../../pantersoft/server/operation/variable";
import {SessionAdmin} from "../../../config/session";
import {Column, var_types} from "../../../pantersoft/server/mysql/helper";

import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    portfolio:       new (require("../../../config/helper/mysql/table/portfolio").default),
    categories:      new (require("../../../config/helper/mysql/table/category").default),
    category_linked: new (require("../../../config/helper/mysql/table/category_linked").default),
}

interface Data {
    id: number,
    url: string,
    title: string,
    content : string,
    image: string,
    is_active: boolean,
    status: number,
    tag: string,
    is_fixed: boolean,
    category: Array<number>,
    type: string,
}

class Portfolio {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private portfolio() : Array<any> | any {
        let db = this.db;
        let insert_data : Array<Column>[] = [];
        let data = {blog: [],add_category: [],del_category:[]}

        data.blog = db.update(tbl.portfolio.TABLE_NAME).columns([
            {key: tbl.portfolio.URL(this.session.lang),     value: V.clear(this.data.title, ClearTypes.SEO_URL)},
            {key: tbl.portfolio.TAG(this.session.lang),     value: this.data.tag},
            {key: tbl.portfolio.TITLE(this.session.lang),   value: this.data.title},
            {key: tbl.portfolio.CONTENT(this.session.lang), value: this.data.content },
            {key: tbl.portfolio.AUTHOR_ID, value: this.session.id,     type:var_types.NUMBER},
            {key: tbl.portfolio.STATUS,    value: this.data.status,      type: var_types.NUMBER},
            {key: tbl.portfolio.IS_FIXED,  value: this.data.is_fixed,  type: var_types.BOOL},
            {key: tbl.portfolio.IMAGE,     value: this.data.image},
            {key: tbl.portfolio.DATE,      value: V.date_format(new Date(),DateMask.ALL)},
        ]).where.equals([
            {key: tbl.portfolio.ID,value:this.data.id,type:var_types.NUMBER},
        ]).run();

        data.del_category = db.delete(tbl.category_linked.TABLE_NAME)
            .where.equals([
                {key:tbl.category_linked.ITEM_ID,value:this.data.id},
                {key:tbl.category_linked.TYPE, value: TableTypes.category.PORTFOLIO, type:var_types.NUMBER},
            ])
            .run();

        this.data.category.forEach((item)=>{
            insert_data.push([
                {key: tbl.category_linked.ITEM_ID, value: this.data.id, type:var_types.NUMBER},
                {key: tbl.category_linked.CATEGORY_ID, value: item, type:var_types.NUMBER},
                {key: tbl.category_linked.TYPE, value: TableTypes.category.PORTFOLIO, type:var_types.NUMBER},
            ])
        })
        data.add_category = db.insert(tbl.category_linked.TABLE_NAME)
            .values(insert_data)
            .run();
        // debug result
        this.result.result = data;
    }
    private restore() : Array<any> | any {
        this.result.result = this.db.update(tbl.portfolio.TABLE_NAME)
            .columns([{key: tbl.portfolio.STATUS,  value: TableTypes.status.ACTIVE, type: var_types.NUMBER}])
            .where.equals([{key:tbl.portfolio.ID, value: this.data.id, type:var_types.NUMBER}])
            .run();
    }
    private trash() {
        this.db.update(tbl.portfolio.TABLE_NAME).columns([{key:tbl.portfolio.STATUS,value: TableTypes.status.DELETED}])
            .where.equals([{
            key: tbl.portfolio.ID,
            value: this.data.id,
            type: var_types.NUMBER
        }]).run()
    }

    private check_values(){
        switch (this.data.type) {
            case "portfolio":
                if (V.empty(this.data.title, this.data.content,this.data.id, this.data.category)) {
                    this.result.error_code = ErrorCode.EMPTY_VALUE;
                }
                if(this.result.error_code == ErrorCode.SUCCESS){
                    this.data.status = (!V.empty(this.data.is_active)) ? TableTypes.status.ACTIVE : TableTypes.status.PASSIVE;
                    this.data.is_fixed = (!V.empty(this.data.is_fixed) && this.data.is_fixed)
                }
                break;
            case "restore":
            case "trash":
                if (V.empty(this.data.id)) {
                    this.result.error_code = ErrorCode.EMPTY_VALUE;
                }
                if(this.result.error_code == ErrorCode.SUCCESS){
                    if (Number(this.data.id) < 1)  this.result.error_code = ErrorCode.INCORRECT_DATA;
                }
                break;
            default: this.result.error_code = ErrorCode.NOT_FOUND;
        }
        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }

    init() : Result | any{
        this.check_values()
        if (this.result.status) {
            switch (this.data.type){
                case "portfolio": this.portfolio();break;
                case "trash":     this.trash(); break;
                case "restore":   this.restore();break;
            }
        }
        return this.result;
    }
}
export default Portfolio;