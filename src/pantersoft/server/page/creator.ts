import express from "express";
import Session from "../../../config/session";

const bodyParser = require("body-parser");

export interface Page {
    page_name?: string,
    title: string,
    sections: Array<Section>,
    lang?: {},
    scripts?: string,
    links?: string,
    session?: Session | any
}

interface Section {
    url: string,
    params?: object
}

class Creator {
    private router: any;
    private readonly path: string = "";
    private data: Page = {
        title: "",  
        sections: []
    };

    constructor(router: Express.Application, path:string){
        this.router = router;
        this.path = path;
    }

    init(match: Array<string> | string | null, func: Function = (req: any, res: any) => {}, page_skeleton: boolean = true, body_parser_options: Object = {}) : any{
        if(!match){
            match = "/(|:page)";
        }

        return this.router.route(match).all(bodyParser.urlencoded(Object.assign({ extended: true }, body_parser_options)), async (req:any, res:any, next: any) => {
            if (typeof req.params.page === "undefined") {
                if (req.originalUrl === req.baseUrl) {
                    return res.redirect(`${req.baseUrl}/`);
                } else {
                    req.params.page = "index.html";
                }
            }
            req.params.page = req.params.page.split(".")[0];
            await func(req, res);
            if(page_skeleton && res.statusCode === 200) res.render( this.path + `/tool/page_skeleton`, this.data);
            next();
        });
    }

    set_data(data: Page) : void{
        this.data = data;
    }
}

export default Creator;