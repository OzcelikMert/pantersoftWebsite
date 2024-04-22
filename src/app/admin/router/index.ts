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
    INDEX = "index",
    LOGIN = "login",
    BLOG = "blog",
    GALLERY = "gallery",
    PROFILE = "profile",
    SUBSCRIBER = "subscriber",
    YASIN = "yasin",
    USERS = "users",
    REFERENCE = "reference",
    PORTFOLIO = "portfolio",
    CHANGE_PASSWORD = "change_password",
    SETTINGS  = "settings",
    SLIDER = "slider",
    SERVICES = "services",
    TESTIMONIALS = "testimonials",
    COUNTER = "counter"
}

const express: any = Express();
const router: any = Router();
let db = new Mysql();
let lang = config.LANG;

export class AdminRouter {
    private page: string = "";

    constructor() {
        this.init();


    }

    section_url(file: string) { return `${this.page}/${file}`;}

    init() : void{
        express.set('views', `${config.ROOT_DIR}app/admin/`);
        this.page_creator().main();
        this.page_creator().service();
    }

    check_session(session: Session) : boolean{
        return V.isset(() => session.data.admin)
    }

    page_creator() {
        let self = this;
        let creator: Creator = new Creator(router, express.settings.views);

        return {
            main() {
                let page = {
                    INDEX() : Page {
                        self.page = PageName.INDEX;
                        return {
                            title: lang.homepage,
                            scripts: `
                                <script src="../public/vendors/apexcharts/apexcharts.js"></script>
                                <script src="./assets/js/pages/index.js"></script>
                            `,
                            links: `<link rel="stylesheet" href="./assets/css/pages/index.css"/>`,
                            sections: [{url: self.section_url("main")}]
                        }
                    },
                    LOGIN() : Page {
                        self.page = PageName.LOGIN;
                        return {
                            title: lang.login,
                            scripts: `
                                    <script src="./assets/js/pages/login.js"></script>
                            `,
                            links: `<link rel="stylesheet" href="./assets/css/pages/auth.css"/>`,
                            sections: [{url: self.section_url("login.ejs")}]
                        }
                    },
                    BLOG() : Page {
                        self.page = PageName.BLOG;
                        return {
                            title: lang.blog,
                            links: `
                                    <link rel="stylesheet" href="../public/vendors/summernote/summernote-lite.min.css">
                            `,
                            scripts: `
                                <script src="../public/vendors/summernote/summernote-lite.min.js"></script>
                                <script src="./assets/js/pages/blog.js"></script>
                            `,
                            sections: [{url: self.section_url("main")}]
                        }
                    },
                    GALLERY() : Page {
                        self.page = PageName.GALLERY;
                        return {
                            title: lang.gallery,
                            sections: [
                                {url: self.section_url("main")}
                            ]
                        }
                    },
                    PROFILE() : Page {
                        self.page = PageName.PROFILE;
                        return {
                            title: lang.profile,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                                    <link rel="stylesheet" href="./assets/css/pages/profile.css">
                            `,
                            scripts: `
                                <script src="./assets/js/pages/profile.js"></script>
                            `,
                        }
                    },
                    SUBSCRIBER() : Page {
                        self.page = PageName.SUBSCRIBER;
                        return {
                            title: lang.subscribers,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                                <link rel="stylesheet" href="./assets/css/pages/subscriber.css">
                            `,
                            scripts: `
                                <script src="./assets/js/pages/subscriber.js"></script>
                            `,
                        }
                    },
                    USERS() : Page {
                        self.page = PageName.USERS;
                        return {
                            title: lang.users,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                                <link rel="stylesheet" href="./assets/css/pages/users.css">
                            `,
                            scripts: `
                                <script src="./assets/js/pages/users.js"></script>
                            `,
                        }
                    },
                    REFERENCE() : Page {
                        self.page = PageName.REFERENCE;
                        return {
                            title: lang.reference,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                            `,
                            scripts: `
                                <script src="./assets/js/pages/reference.js"></script>
                            `,
                        }
                    },
                    PORTFOLIO() : Page {
                        self.page = PageName.PORTFOLIO;
                        return {
                            title: lang.portfolios,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                                <link rel="stylesheet" href="../public/vendors/summernote/summernote-lite.min.css">
                            `,
                            scripts: `
                                <script src="../public/vendors/summernote/summernote-lite.min.js"></script>
                                <script src="./assets/js/pages/portfolio.js"></script>
                            `,
                        }
                    },
                    CHANGE_PASSWORD() : Page {
                        self.page = PageName.CHANGE_PASSWORD;
                        return {
                            title: lang.change_password,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                                    <link rel="stylesheet" href="./assets/css/pages/change_password.css">
                            `,
                            scripts: `
                                <script src="./assets/js/pages/change_password.js"></script>
                            `,
                        }
                    },
                    SLIDER() : Page {
                        self.page = PageName.SLIDER;
                        return {
                            title: lang.slider,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                                <link rel="stylesheet" href="../public/vendors/summernote/summernote-lite.min.css">
                                <link rel="stylesheet" href="./assets/css/pages/slider.css">
                            `,
                            scripts: `
                                <script src="../public/vendors/summernote/summernote-lite.min.js"></script>
                                <script src="./assets/js/pages/slider.js"></script>
                            `,
                        }
                    },
                    SERVICES() : Page {
                        self.page = PageName.SERVICES;
                        return {
                            title: lang.services,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                                <link rel="stylesheet" href="../public/vendors/summernote/summernote-lite.min.css">
                                <link rel="stylesheet" href="./assets/css/pages/services.css">
                            `,
                            scripts: `
                                <script src="../public/vendors/summernote/summernote-lite.min.js"></script>
                                <script src="./assets/js/pages/services.js"></script>
                            `,
                        }
                    },
                    TESTIMONIALS() : Page {
                        self.page = PageName.TESTIMONIALS;
                        return {
                            title: lang.testimonials,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                                <link rel="stylesheet" href="../public/vendors/summernote/summernote-lite.min.css">
                                <link rel="stylesheet" href="./assets/css/pages/testimonials.css">
                            `,
                            scripts: `
                                <script src="../public/vendors/summernote/summernote-lite.min.js"></script>
                                <script src="./assets/js/pages/testimonials.js"></script>
                            `,
                        }
                    },
                    COUNTER() : Page {
                        self.page = PageName.COUNTER;
                        return {
                            title: lang.counter,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: `
                                <link rel="stylesheet" href="./assets/css/pages/counter.css">
                            `,
                            scripts: `
                                <script src="./assets/js/pages/counter.js"></script>
                            `,
                        }
                    },
                    YASIN() : Page {
                        self.page = PageName.YASIN;
                        return {
                            title: lang.profile,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: ` <link rel="stylesheet" href="./assets/css/pages/yasin.css">`,
                            scripts: `<script src="./assets/js/pages/yasin.js"></script>`,
                        }
                    },
                    SETTINGS() : Page {
                        self.page = PageName.SETTINGS;
                        return {
                            title: lang.settings,
                            sections: [
                                {url: self.section_url("main")},
                            ],
                            links: ` <link rel="stylesheet" href="./assets/css/pages/settings.css">`,
                            scripts: `<script src="./assets/js/pages/settings.js"></script>`,
                        }
                    },
                }

                creator.init(null, (req: any, res: any) => {
                    if(req.params.page !== PageName.LOGIN && !self.check_session(req.session)){
                        res.redirect(PageName.LOGIN); return false;
                    }else if(req.params.page === PageName.LOGIN && self.check_session(req.session)) {
                        res.redirect(PageName.INDEX); return false;
                    }

                    HelperDB.set.viewer(db, req);
                    let data: Page | null = null;

                    try{
                        data = eval(`page.${req.params.page.toUpperCase()}()`);
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
                    let result = new Result();
                    if(self.page !== PageName.LOGIN && !self.check_session(req.session)){
                        result = new Result(null, null, false, "", ErrorCode.NOT_LOGGED_IN);
                    }

                    await (new Service(db, req, res)).init(result).then( (r: Result) => {
                        console.log(r)
                        res.status(r.status_code).send(r);
                    });
                }, false, {limit: "1mb", parameterLimit: 10000});
            }
        }
    }
}

new AdminRouter();

export default router;