import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {SessionAdmin} from "../../../config/session";
import V from "../../../pantersoft/server/operation/variable";
import {OrderBy, var_types} from "../../../pantersoft/server/mysql/helper";

const tbl = {
    blog: new (require("../../../config/helper/mysql/table/blog").default),
    category_linked: new (require("../../../config/helper/mysql/table/category_linked").default),
    category: new (require("../../../config/helper/mysql/table/category").default),
    status_type: new (require("../../../config/helper/mysql/table/status_type").default),
}

interface Data {
    id: number,
    category: number,
    search: string,
    is_active: boolean,
    is_delete: boolean,
    is_fixed: boolean,
    type: string,
    limit: number
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

    private get() : Array<any> | any {
        let db = this.db;
        if (V.isset(()=> this.data.id)){
            this.result.result = []

            this.result.result = db.select(tbl.blog.TABLE_NAME)
                .columns([
                    tbl.blog.ID,
                    db.as_name(tbl.blog.TITLE(this.session.lang),"title"),
                    db.as_name(tbl.blog.CONTENT(this.session.lang),"content"),
                    db.as_name(tbl.blog.TAG(this.session.lang),"tag"),
                    tbl.blog.AUTHOR_ID,
                    tbl.blog.IS_FIXED,
                    tbl.blog.STATUS,
                    tbl.blog.IMAGE,
                    tbl.blog.DATE,
                ])
                .where.equals([{key: tbl.blog.ID, value:this.data.id, type:var_types.NUMBER}]).limit(1)
                .run();
        }
        else {
             let query = db.select(tbl.blog.TABLE_NAME)
                .columns([
                    tbl.blog.ID,
                    db.as_name(tbl.blog.TITLE(this.session.lang),"title"),
                    db.as_name(tbl.blog.URL(this.session.lang),"url"),
                    db.as_name(tbl.blog.TAG(this.session.lang),"tag"),
                    tbl.blog.STATUS,
                    tbl.blog.IS_FIXED,
                    tbl.blog.IMAGE,
                    tbl.blog.DATE,
                    tbl.blog.AUTHOR_ID,
                    this.db.as_name(tbl.status_type.NAME(this.session.lang),"status_name")
                ]).order_by(tbl.blog.DATE,OrderBy.DESC)
                .join.inner([{table: tbl.status_type.TABLE_NAME, equal: [tbl.blog.STATUS,tbl.status_type.ID]}])
                if(V.isset(()=> this.data.limit)) query.limit(this.data.limit);
                this.result.result =  query.run();
        }
    }

    init() : Result | any{
        switch (this.data.type){

            default: this.get(); break;
        }
        return this.result;
    }
}

export default Blog;