import Creator, {Page} from '../../../pantersoft/server/page/creator';
import Express,{Router} from 'express';
import {config} from "../../../config/init";
import V from "../../../pantersoft/server/operation/variable";
import Mysql from "../../../pantersoft/server/mysql";
import HelperDB from "../../../public/helper/db";
import Service from "../../service/";
import Result from "../../../public/helper/service_result";
import Session from "../../../config/session";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

enum PageName {
    INDEX = "index"
}

const express: any = Express();
const router: any = Router();
let db = new Mysql();
let lang = config.LANG;

export class WebsiteRouter {
    private page: string = "";

    constructor() {
        this.init();


    }

    section_url(file: string) { return `${this.page}/${file}`;}

    init() : void{
        express.set('views', `${config.ROOT_DIR}app/website/`);
        this.page_creator().main();
        this.page_creator().service();
    }

    set_session(session: Session){
        new Session(session, {
            guest: {
                ip: "127.168.1.1",
                token: "create token guest",
                lang: "tr",
            }
        });
    }

    check_session(session: Session) : boolean{
        return  (V.isset(() => session.data.admin) || V.isset(() => session.data.guest));
    }

    page_creator() {
        let self = this;
        let creator: Creator = new Creator(router, express.settings.views);

        return {
            main() {
                let page = {
                    INDEX(session: any) : Page {
                        self.page = PageName.INDEX;

                        let slider = new (require("../../service/get/slider").default)(db, {type: "guest"}, session).get(true);
                        let main = {
                            service: new (require("../../service/get/service").default)(db, {type: "guest"}, session).get(true),
                            counter: new (require("../../service/get/counter").default)(db, {type: "guest"}, session).get(true),
                        };
                        console.log(main.counter);
                        
                        return {
                            title: lang.homepage,
                            scripts: `
                                <script src="../public/vendors/particle/particles.js"></script>
                                <script src="./assets/js/pages/index.js"></script>
                            `,
                            links: `
                                <link rel="stylesheet" href="./assets/css/pages/index.css"/>
                            `,
                            sections: [
                                {url: self.section_url("slider"), params: {slider: slider}},
                                {url: self.section_url("main"), params: {main: main}}
                            ]
                        }
                    }
                }

                creator.init(null, (req: any, res: any) => {
                    if(!self.check_session(req.session)) {
                        self.set_session(req.session);
                    }
                    HelperDB.set.viewer(db, req);
                    let data: Page | null = null;

                    try{
                        data = eval(`page.${req.params.page.toUpperCase()}(req.session);`);
                    }catch (e){
                        res.status(404).send("<h1 style='padding: 50px; text-align: center; font-size: 30px'>PAGE NOT FOUND - 404</h1>");
                    }

                    creator.set_data(
                        Object.assign(
                            {
                                lang: lang,
                                page_name: self.page,
                                session: req.session.data
                            },
                            data
                        )
                    );
                });
            },
            service() {
                creator.init("/service/:page", async (req: any, res: any) => {
                    await (new Service(db, req, res)).init().then( (r: Result) => {
                        res.status(r.status_code).send(r);
                    });
                }, false, {limit: "1mb", parameterLimit: 10000});
            }
        }
    }
}

new WebsiteRouter();

export default router;