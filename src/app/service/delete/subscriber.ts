import Mysql from "../../../pantersoft/server/mysql";
import Variable from "../../../pantersoft/server/operation/variable";
import V from "../../../pantersoft/server/operation/variable";
import Result from "../../../public/helper/service_result";
import {var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    subscribers: new (require("../../../config/helper/mysql/table/subscriber").default)
}

interface Data {
    id: number,
}

class Subscriber {
    private result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: any;
    constructor(db: Mysql, data: Data, session: any) {
        this.db = db;
        this.data = Variable.clear_all_data(data);
        this.session = session;
    }

    private set() {
        this.db.delete(tbl.subscribers.TABLE_NAME)
            .where.equals([{key: tbl.subscribers.ID, value: this.data.id, type: var_types.NUMBER}])
            .run()
    }

    private check_values() {
        if(V.empty(this.data.id)) this.result.error_code = ErrorCode.EMPTY_VALUE;

        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }

    init() : Result{
        this.check_values();
        if(this.result.status){
            this.set();
        }

        return this.result;
    }
}

export default Subscriber;