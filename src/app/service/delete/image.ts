import Mysql from "../../../pantersoft/server/mysql";
import Variable, {DateMask} from "../../../pantersoft/server/operation/variable";
import Result from "../../../public/helper/service_result";
import {config} from "../../../config/init";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

let fs = require('fs');

interface Data {
    name: String
}

class Image {
    public result: Result = new Result();
    private readonly data: Data;
    constructor(db: Mysql, data: any, session: any) {
        this.data = Variable.clear_all_data(data);
    }

    private set() {
        let self = this;
        fs.unlinkSync(`${config.ROOT_DIR}/image/${this.data.name}`);
        fs.close(0);
    }

    init() : Result{
        this.set();
        return this.result;
    }
}

export default Image;