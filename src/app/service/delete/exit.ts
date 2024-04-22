import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {Session} from "../../../config/session";
import V from "../../../pantersoft/server/operation/variable";
import {ErrorCode,TableTypes} from "../../../config/helper/require";


interface Data {}

class Exit {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: Session;
    constructor(db: Mysql, data: any, session: Session) {
        this.db = db;
        this.session = session;
        this.data = V.clear_all_data(data);
    }

    private set() {
        this.session.destroy();
    }

    init() : Result{
        this.set();
        return this.result;
    }
}

export default Exit;