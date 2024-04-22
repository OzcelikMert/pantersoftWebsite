import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V, {ClearTypes, DateMask} from "../../../pantersoft/server/operation/variable";
import {SessionAdmin} from "../../../config/session";
import {Column, var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    blog:            new (require("../../../config/helper/mysql/table/blog").default),
    categories:      new (require("../../../config/helper/mysql/table/category").default),
    category_linked: new (require("../../../config/helper/mysql/table/category_linked").default),
}
interface Data {
    url: string,
    title: string,
    image: string,
    content : string,
    status: number,
    is_active: boolean,
    is_fixed: boolean,
    tag: string,
    category: Array<number>,
    type: string,
}

class Blog {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private blog() : Array<any> | any {
        let db = this.db;
        this.session.lang = "tr";

        let data = db.insert(tbl.blog.TABLE_NAME).values([
            {key: tbl.blog.URL(this.session.lang),     value: V.clear(this.data.title, ClearTypes.SEO_URL)},
            {key: tbl.blog.TAG(this.session.lang),     value: this.data.tag},
            {key: tbl.blog.TITLE(this.session.lang),   value: this.data.title},
            {key: tbl.blog.CONTENT(this.session.lang), value: this.data.content },
            {key: tbl.blog.AUTHOR_ID,   value: this.session.id,     type:var_types.NUMBER},
            {key: tbl.blog.STATUS,      value: this.data.status, type: var_types.BOOL},
            {key: tbl.blog.IS_FIXED,    value: this.data.is_fixed,  type: var_types.BOOL},
            {key: tbl.blog.IMAGE,       value: this.data.image},
            {key: tbl.blog.DATE,        value: V.date_format(new Date(),DateMask.ALL)},
        ]).run();

        this.result.result = []
        this.result.result[0] = data;

         let insert_data : Array<Column>[] = [];
         if (data.insertId > 0) {
          this.data.category.forEach((item)=>{
                 insert_data.push([
                     {key: tbl.category_linked.ITEM_ID, value: data.insertId, type:var_types.NUMBER},
                     {key: tbl.category_linked.CATEGORY_ID, value: item, type:var_types.NUMBER},
                     {key: tbl.category_linked.TYPE, value: TableTypes.category.BLOG, type:var_types.NUMBER},
                 ])
             })
             this.result.result[1] = db.insert(tbl.category_linked.TABLE_NAME).values(insert_data).run();
         }
    }

    private check_values(){
        if (V.empty(this.data.title, this.data.content, this.data.category)) {
           this.result.error_code = ErrorCode.EMPTY_VALUE;
        }
        if(this.result.error_code == ErrorCode.SUCCESS){
            this.data.status = (!V.empty(this.data.is_active)) ? TableTypes.status.ACTIVE : TableTypes.status.PASSIVE;
            this.data.is_fixed = !V.empty(this.data.is_fixed)
            let row = this.db.select(tbl.categories).columns(tbl.categories.ID).where.equals([{key: tbl.categories.ID,value: this.data.category}]).run();
            if (row.length == this.data.category.length) this.result.error_code = ErrorCode.INCORRECT_DATA;
        }
        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }


    init() : Result | any{
        this.check_values();
        if (this.result.status){
            switch (this.data.type){
                case "blog": this.blog(); break;
                default: return;
            }
        }
        return this.result;
    }
}

export default Blog;