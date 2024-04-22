import Mysql from "../../../pantersoft/server/mysql";
import Variable from "../../../pantersoft/server/operation/variable";
import Result from "../../../public/helper/service_result";
import {config} from "../../../config/init";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

let fs = require('fs'),
    path = require('path');

interface Data {
    type?: string
}


class Image {
    public result: Result = new Result();
    private readonly data: Data;
    constructor(db: Mysql, data: Data, session: any) {
        this.data = Variable.clear_all_data(data);
    }

    private get() {
        let fileType = [".jpg", ".png", ".webp", ".gif", ".jpeg"],
            files: Array<any> = [], i;
        let images = fs.readdirSync(`${config.ROOT_DIR}image/`);
        for(i=0; i<images.length; i++) {
            if (fileType.includes(path.extname(images[i])))
                files.push(images[i]);
        }

        this.result.result = files;
    }

    init() : Result{
        this.get();
        return this.result;
    }
}

export default Image;