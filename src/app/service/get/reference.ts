import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V from "../../../pantersoft/server/operation/variable";
import {SessionAdmin} from "../../../config/session";
import {OrderBy, var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    reference: new (require("../../../config/helper/mysql/table/reference").default),
    status_type: new (require("../../../config/helper/mysql/table/status_type").default),
}
interface Data {
    type: string
}

class Reference{
    public result: Result = new Result();
    private readonly db: Mysql;
    //private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        //this.data = V.clear_all_data(data);
    }

    private get() : Array<any> | any {
        this.result.result = this.db.select(tbl.reference.TABLE_NAME)
            .columns([
                this.db.as_name(tbl.reference.NAME(this.session.lang),"name"),
                this.db.as_name(tbl.status_type.NAME(this.session.lang),"status_name"),
                tbl.reference.ID,
                tbl.reference.URL,
                tbl.reference.STATUS,
                tbl.reference.DATE,
                tbl.reference.RANK,
                tbl.reference.IMAGE,
            ])
            .join.inner([{table: tbl.status_type.TABLE_NAME, equal: [tbl.reference.STATUS,tbl.status_type.ID]}])
            .order_by([tbl.reference.RANK],OrderBy.ASC)
            .run();
    }


    init() : Result | any{
        this.get();
        return this.result;
    }
}

export default Reference;