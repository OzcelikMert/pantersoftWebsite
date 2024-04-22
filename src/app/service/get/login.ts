import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {Session} from "../../../config/session";
import V from "../../../pantersoft/server/operation/variable";
import HelperDB from "../../../public/helper/db";
import {ErrorCode,TableTypes} from "../../../config/helper/require";


interface Data {
    email : string,
    password : string,
    ip : string,
    type : string,
}

class Login {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: Session;
    private user: any;
    constructor(db: Mysql, data: any,session: Session) {
        this.db = db;
        this.session = session;
        this.data = V.clear_all_data(data);
    }

    private login() : Array<any> | any {
        let user = this.user;

        new Session(this.session, {
            admin: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                type: user.type,
                type_name: user.type_name,
                image: user.image,
                ip: "127.168.1.1",
                token: "create token",
                lang: "tr",
                permission: JSON.parse(user.permission)
            },
        })
    }

    private check_values(){
        if (V.empty(this.data.email, this.data.password)) this.result.error_code = ErrorCode.EMPTY_VALUE;

        if(this.result.error_code == ErrorCode.SUCCESS){
            let rows = HelperDB.get.user(this.db, "tr", 0, this.data.email, this.data.password);

            if (rows.length > 0) {
                rows = rows[0];
                if(rows.status !== TableTypes.status.ACTIVE) {
                    this.result.result = {
                        "status": rows.status,
                        "ban_date": rows.ban_date,
                        "ban_date_end": rows.ban_date_end,
                        "ban_comment": rows.ban_comment
                    }
                    this.result.error_code = ErrorCode.NO_PERM;
                }else{
                    this.user = rows;
                }
            }
            else this.result.error_code = ErrorCode.WRONG_EMAIL_OR_PASSWORD;
        }

        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }

    init() : Result{
        this.check_values();
        if (this.result.status) {
            this.login();
        }
        if(this.result.error_code === ErrorCode.NO_PERM){
            this.result.status = true;
        }
        return this.result;
    }
}

export default Login;