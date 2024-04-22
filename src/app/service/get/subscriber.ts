import Mysql from "../../../pantersoft/server/mysql";
import Variable from "../../../pantersoft/server/operation/variable";
import Result from "../../../public/helper/service_result";
import {OrderBy, var_types} from "../../../pantersoft/server/mysql/helper";
import {SessionAdmin} from "../../../config/session";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    subscribers: new (require("../../../config/helper/mysql/table/subscriber").default),
    status_type: new (require("../../../config/helper/mysql/table/status_type").default)
}

interface Data {
    type: string,
    detail_type?: string,
    id?: number
}

class Subscriber {
    private result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: Data, session: any) {
        this.db = db;
        this.data = Variable.clear_all_data(data);
        this.session = session.data.admin;
    }

    private total() {
        let db = this.db;

        this.result.result = db.select(tbl.subscribers.TABLE_NAME)
            .columns(db.as_name(db.count(tbl.subscribers.ID), "total"))
            .run()[0];
    }

    private detail() {
        let db = this.db;

        let query = db.select(tbl.subscribers.TABLE_NAME)
            .columns([tbl.subscribers.ALL, db.as_name(tbl.status_type.NAME(this.session.lang), "status_name")])
            .join.inner([
                {table: tbl.status_type.TABLE_NAME, equal: [tbl.status_type.ID, tbl.subscribers.STATUS]}
            ])
            .order_by([tbl.subscribers.ID], OrderBy.DESC);

        switch (this.data.detail_type){
            case "all": break;
            case "id": query.where.equals([{key: tbl.subscribers.ID, value: this.data.id, type: var_types.NUMBER}]); break;
            case "last": query.limit([0, 4]); break;
        }

        this.result.result = query.run()
    }

    init() : Result{
        switch (this.data.type){
            case "total": this.total(); break;
            case "detail": this.detail(); break;
        }

        return this.result;
    }
}

export default Subscriber;