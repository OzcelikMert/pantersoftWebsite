import {ErrorCode} from "../../config/helper/require";

class Result {
    constructor(
        result: any = null,
        custom: any = null,
        status: boolean = true,
        message: string = "",
        error_code: number = ErrorCode.SUCCESS,
        status_code: number = 200,
    ) {
        this.result = result;
        this.custom = custom;
        this.status = status;
        this.message = message;
        this.error_code = error_code;
        this.status_code = status_code;
    }

    result: any;
    custom: any;
    status: boolean;
    message: string;
    error_code: number;
    status_code: number;
}

export default Result;