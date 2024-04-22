import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V, {ClearTypes, DateMask} from "../../../pantersoft/server/operation/variable";
import {config} from "../../../config/init";
import {SessionAdmin} from "../../../config/session";
import {ErrorCode,TableTypes} from "../../../config/helper/require";
import { var_types } from "../../../pantersoft/server/mysql/helper";

const tbl = {
    testimonial: new (require("../../../config/helper/mysql/table/testimonial").default),
}

interface Data {
    title: string,
    content: string,
    rank: number,
    image: string,
    status: number
}

class Testimonial {
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
            {key: tbl.testimonial.TITLE(self.session.lang),   value: self.data.title},
            {key: tbl.testimonial.CONTENT(self.session.lang), value: self.data.content},
            {key: tbl.testimonial.DATE,                       value: V.date_format(new Date(), DateMask.ALL)},
            {key: tbl.testimonial.STATUS,                     value: (self.data.status === 1) ? 1 : 2, type: var_types.NUMBER},
            {key: tbl.testimonial.RANK,                       value: self.data.rank, type: var_types.NUMBER},
            {key: tbl.testimonial.IMAGE,                      value: self.data.image}
        ];

        db.insert(tbl.testimonial.TABLE_NAME).values(values).run();
    }

    private check_values(){
        let self = this;
        if(V.empty(self.data.status)) self.data.status = TableTypes.status.PASSIVE;

        if (V.empty(
                self.data.title,
                self.data.content,
                self.data.status,
                self.data.rank,
                self.data.image
            )) self.result.error_code = ErrorCode.EMPTY_VALUE;

        if(self.result.error_code == ErrorCode.SUCCESS){
            if(self.session.type !== TableTypes.user.ADMIN && V.array_index_of(self.session.permission, "id", TableTypes.permission.TESTIMONIAL_EDIT) === -1){
                self.result.error_code = ErrorCode.NO_PERM;
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

export default Testimonial;