import Variable, {DateMask} from "../../../pantersoft/server/operation/variable";
import Result from "../../../public/helper/service_result";
import {config} from "../../../config/init";
import sharp from "sharp";
import multer from "multer";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const fs = require("fs"),
    path = require('path');

class Image {
    public result: Result = new Result();
    private readonly req: any;
    private readonly res: any;
    constructor(req: any, res: any) {
        this.req = req;
        this.res = res;
    }

    private set() {
        let self = this;

        const storage = multer.diskStorage({
            destination: function(req, file, cb) {
                cb(null, `${config.ROOT_DIR}/image/`);
            },

            // By default, multer removes file extensions so let's add them back
            filename: function(req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            }
        });

        const upload = multer({
            storage: multer.memoryStorage(),
            fileFilter: (req: any,file: any,cb: any)=> {
                let ext = path.extname(file.originalname);
                if(ext == '.jpg' || ext == '.png' || ext == '.gif' || ext == '.jpeg') {
                    cb(null,true);
                } else {
                    this.result.error_code = ErrorCode.UPLOAD_ERROR;
                    cb('Only Images Are Allow', false);
                }
            }
        }).single("file");

        return new Promise( (resolve: any) => {
            upload(self.req, self.res, async function (err: any) {
                const timestamp = Variable.date_format(new Date(), DateMask.UNIFIED_ALL);
                const ref = `${timestamp}-${Variable.random(1000, 9999)}.webp`;
                let data = await sharp(self.req.file.buffer)
                    .webp({ quality: 80 })
                    .toBuffer();
                fs.createWriteStream(`${config.ROOT_DIR}/image/${ref}`).write(data);
                resolve();
            });
        })
    }

    init() : Promise<Result>{
        let self = this;
        return new Promise( (resolve) => {
            this.set().then( () => {
                resolve(self.result);
            });
        })
    }
}

export default Image;