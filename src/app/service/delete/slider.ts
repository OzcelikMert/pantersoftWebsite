import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V, {ClearTypes, DateMask} from "../../../pantersoft/server/operation/variable";
import {config} from "../../../config/init";
import {SessionAdmin} from "../../../config/session";
import {ErrorCode,TableTypes} from "../../../config/helper/require";
import { var_types } from "../../../pantersoft/server/mysql/helper";

const tbl = {
    slider: new (require("../../../config/helper/mysql/table/slider").default),
}

interface Data {
    id: number
}

class Slider {
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
            {key: tbl.slider.STATUS, value: TableTypes.status.DELETED, type: var_types.NUMBER},
        ];

        db.update(tbl.slider.TABLE_NAME).columns(values).where.equals([{key: tbl.slider.ID, value: self.data.id, type: var_types.NUMBER}]).run();
    }

    private check_values(){
        let self = this;

        if (V.empty(
                self.data.id,
            )) self.result.error_code = ErrorCode.EMPTY_VALUE;

        if(self.result.error_code == ErrorCode.SUCCESS){
            if(self.session.type !== TableTypes.user.ADMIN && V.array_index_of(self.session.permission, "id", TableTypes.permission.SLIDER_EDIT) === -1){
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

export default Slider;