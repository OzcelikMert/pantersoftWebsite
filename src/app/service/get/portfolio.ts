import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {SessionAdmin} from "../../../config/session";
import V from "../../../pantersoft/server/operation/variable";
import {OrderBy, var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    portfolio: new (require("../../../config/helper/mysql/table/portfolio").default),
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
    type: string
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

    private get() : Array<any> | any {
        let db = this.db;
        if (V.isset(()=> this.data.id)){
            this.result.result = []

            this.result.result = db.select(tbl.portfolio.TABLE_NAME)
                .columns([
                    tbl.portfolio.ID,
                    db.as_name(tbl.portfolio.TITLE(this.session.lang),"title"),
                    db.as_name(tbl.portfolio.CONTENT(this.session.lang),"content"),
                    db.as_name(tbl.portfolio.TAG(this.session.lang),"tag"),
                    tbl.portfolio.AUTHOR_ID,
                    tbl.portfolio.IS_FIXED,
                    tbl.portfolio.STATUS,
                    tbl.portfolio.IMAGE,
                    tbl.portfolio.DATE,
                ])
                .join.inner([{table: tbl.status_type.TABLE_NAME, equal: [tbl.portfolio.STATUS,tbl.status_type.ID]}])
                .where.equals([{key: tbl.portfolio.ID, value:this.data.id, type:var_types.NUMBER}]).limit(1)
                .run();
        }
        else {
             this.result.result= db.select(tbl.portfolio.TABLE_NAME)
                .columns([
                    tbl.portfolio.ID,
                    db.as_name(tbl.portfolio.TITLE(this.session.lang),"title"),
                    db.as_name(tbl.portfolio.URL(this.session.lang),"url"),
                    db.as_name(tbl.portfolio.TAG(this.session.lang),"tag"),
                    tbl.portfolio.STATUS,
                    tbl.portfolio.IS_FIXED,
                    tbl.portfolio.IMAGE,
                    tbl.portfolio.DATE,
                    tbl.portfolio.AUTHOR_ID,
                    this.db.as_name(tbl.status_type.NAME(this.session.lang),"status_name")
                ])
                .join.inner([{table: tbl.status_type.TABLE_NAME, equal: [tbl.portfolio.STATUS,tbl.status_type.ID]}])
                .run();
        }
    }

    init() : Result | any{
        switch (this.data.type){
            default: this.get(); break;
        }
        return this.result;
    }
}

export default Portfolio;