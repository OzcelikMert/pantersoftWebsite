import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {Session, SessionAdmin} from "../../../config/session";
import V from "../../../pantersoft/server/operation/variable";
import HelperDB from "../../../public/helper/db";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

interface Data {
    type: string
    id?: number | any
}

class Testimonial {
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
        switch (self.data.type) {
            case "id":
                result = HelperDB.get.testimonials(this.db, this.session.lang, self.data.id)[0];
                break;
            case "all": result = HelperDB.get.testimonials(this.db, this.session.lang); break;
        }
        this.result.result = result;
    }

    private check_values(){
        let self = this;
        if (V.empty(
                self.data.type,
            )) self.result.error_code = ErrorCode.EMPTY_VALUE;

        if(self.result.error_code == ErrorCode.SUCCESS){
            if(self.data.type === "user" && V.empty(self.data.id)){
                self.result.error_code = ErrorCode.EMPTY_VALUE;
            }
        }

        if(self.result.error_code == ErrorCode.SUCCESS){
            if(self.session.type !== TableTypes.user.ADMIN && V.array_index_of(self.session.permission, "id", TableTypes.permission.TESTIMONIAL_SHOW) === -1){
                self.result.error_code = ErrorCode.NO_PERM;
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

export default Testimonial;