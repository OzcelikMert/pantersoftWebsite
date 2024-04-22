import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {Session, SessionAdmin} from "../../../config/session";
import V from "../../../pantersoft/server/operation/variable";
import HelperDB from "../../../public/helper/db";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

interface Data {
    type: string
}

class UserType {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;

    constructor(db: Mysql, data: any, session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private get() {
        let self = this;
        let result = [];
        switch (this.data.type) {
            case "all": result = HelperDB.get.user_type(this.db, this.session.lang); break;
        }
        this.result.result = result;
    }

    init() : Result{
        this.get();
        return this.result;
    }
}

export default UserType;