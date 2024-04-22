import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V, {ClearTypes, DateMask} from "../../../pantersoft/server/operation/variable";
import {config} from "../../../config/init";
import {SessionAdmin} from "../../../config/session";
import {ErrorCode,TableTypes} from "../../../config/helper/require";
import { var_types } from "../../../pantersoft/server/mysql/helper";
import HelperDB from "../../../public/helper/db";

const tbl = {
    counter: new (require("../../../config/helper/mysql/table/counter").default),
    counter_type: new (require("../../../config/helper/mysql/table/counter_type").default),
}

interface Data {
    id: number,
    title: string,
    value: number,
    counter_type: number,
    rank: number,
    image: string,
    status: number,
    icon?: string | any,
}

class Counter {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private set() {
        let self = this;
        let db = this.db;

        let values = [
            {key: tbl.counter.TITLE(self.session.lang),   value: self.data.title},
            {key: tbl.counter.VALUE,                      value: self.data.value},
            {key: tbl.counter.TYPE,                      value: self.data.counter_type},
            {key: tbl.counter.DATE,                       value: V.date_format(new Date(), DateMask.ALL)},
            {key: tbl.counter.STATUS,                     value: (self.data.status === 1) ? 1 : 2, type: var_types.NUMBER},
            {key: tbl.counter.RANK,                       value: self.data.rank, type: var_types.NUMBER},
            {key: tbl.counter.IMAGE,                      value: self.data.image}
        ];

        db.update(tbl.counter.TABLE_NAME).columns(values).where.equals([{key: tbl.counter.ID, value: self.data.id, type: var_types.NUMBER}]).run();
    }

    private check_values(){
        let self = this;
        if(V.empty(self.data.status)) self.data.status = TableTypes.status.PASSIVE;
        if(!V.empty(self.data.icon)) self.data.image = self.data.icon;

        if (V.empty(
                self.data.id,
                self.data.title,
                self.data.value,
                self.data.counter_type,
                self.data.status,
                self.data.rank,
                self.data.image
            )) self.result.error_code = ErrorCode.EMPTY_VALUE;

        if(self.result.error_code == ErrorCode.SUCCESS){
            if(self.session.type !== TableTypes.user.ADMIN && V.array_index_of(self.session.permission, "id", TableTypes.permission.COUNTER_EDIT) === -1){
                self.result.error_code = ErrorCode.NO_PERM;
            }
        }

        if(self.result.error_code == ErrorCode.SUCCESS){
            let row = HelperDB.get.counter_type(self.db, self.session.lang, self.data.counter_type);
            if (row.length < 1) {
                self.result.error_code = ErrorCode.INCORRECT_DATA;
            }
        }

        if(self.result.error_code !== ErrorCode.SUCCESS) self.result.status = false;
    }

    init() : Result | any{
        this.check_values();
        if (this.result.status) {
            this.set();
        }
        return this.result;
    }
}

export default Counter;