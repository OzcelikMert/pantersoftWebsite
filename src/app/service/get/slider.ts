import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {Session, SessionData} from "../../../config/session";
import V from "../../../pantersoft/server/operation/variable";
import HelperDB from "../../../public/helper/db";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const _html = require("../../website/assets/js/pages/index.js");

interface Data {
    type: string
    id?: number | any
}

class Slider {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionData;

    constructor(db: Mysql, data: any, session: any) {
        this.db = db;
        this.session = session.data;
        this.data = V.clear_all_data(data);
    }

    public get(html = false) : any {
        let self = this;
        let lang = (V.isset(()=> self.session.admin)) ? self.session.admin.lang : self.session.guest.lang;
        try{
            self.result.result = V.switch(self.data.type, {
                "id": () => HelperDB.get.slider(self.db, lang, self.data.id)[0],
                "all": () => HelperDB.get.slider(self.db, lang),
                "guest": () => HelperDB.get.slider(self.db, lang, 0, TableTypes.status.ACTIVE)
            });
            
            if(html){
                return _html.slider(self.result.result);
            }
        }catch(e) {}
    }

    private check_values(){
        let self = this;
        if (V.empty(
                self.data.type,
            )) self.result.error_code = ErrorCode.EMPTY_VALUE;

        if(self.result.error_code == ErrorCode.SUCCESS){
            if(self.data.type === "id" && V.empty(self.data.id)){
                self.result.error_code = ErrorCode.EMPTY_VALUE;
            }
        }

        if(V.isset(() => self.session.admin)){
            if(self.result.error_code == ErrorCode.SUCCESS){
                if(self.session.admin.type !== TableTypes.user.ADMIN && V.array_index_of(self.session.admin.permission, "id", TableTypes.permission.SLIDER_SHOW) === -1){
                    self.result.error_code = ErrorCode.NO_PERM;
                }
            }
        }

        if(self.result.error_code !== ErrorCode.SUCCESS) self.result.status = false;
    }

    init() : Result{
        this.check_values();
        if(this.result.status){
            this.get();
        }
        return this.result;
    }
}

export default Slider;