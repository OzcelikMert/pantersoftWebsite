import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {SessionAdmin} from "../../../config/session";
import V from "../../../pantersoft/server/operation/variable";
import HelperDB from "../../../public/helper/db";
import {var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    user: new (require("../../../config/helper/mysql/table/user").default),
}

interface Data {
    id: number,
}

class User {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;

    constructor(db: Mysql, data: any, session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private set() {
        this.db.update(tbl.user.TABLE_NAME)
            .columns([
                {key: tbl.user.STATUS, value: TableTypes.status.DELETED, type: var_types.NUMBER}
            ])
            .where.equals([{key:tbl.user.ID, value: this.data.id, type: var_types.NUMBER}])
            .run();
    }

    private check_values() {
        let self = this;
        if(V.empty(self.data.id)) {
            self.result.error_code = ErrorCode.EMPTY_VALUE;
        }

        if(self.result.error_code === ErrorCode.SUCCESS){
            let row = HelperDB.get.user(self.db, self.session.lang, self.data.id)[0];
            if(TableTypes.user_rank[self.session.type] >= TableTypes.user_rank[row.type]) {
                self.result.error_code = ErrorCode.NO_PERM;
            }
        }

        if(self.result.error_code !== ErrorCode.SUCCESS) self.result.status = false;
    }

    init() : Result{
        this.check_values();
        if(this.result.status) this.set();
        return this.result;
    }
}

export default User;