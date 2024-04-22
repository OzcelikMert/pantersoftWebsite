class Portfolio{
    TABLE_NAME = "portfolio";
    ID = `${this.TABLE_NAME}.id`;
    TITLE = (lang: string) => { return `${this.TABLE_NAME}.title_${lang}`};
    CONTENT = (lang: string) => { return `${this.TABLE_NAME}.content_${lang}`};
    TAG = (lang: string) => { return `${this.TABLE_NAME}.tag_${lang}`};
    URL = (lang: string) => { return `${this.TABLE_NAME}.url_${lang}`};
    DATE = `${this.TABLE_NAME}.date`;
    IS_FIXED = `${this.TABLE_NAME}.is_fixed`;
    AUTHOR_ID = `${this.TABLE_NAME}.author_id`;
    STATUS = `${this.TABLE_NAME}.status`;
    IMAGE = `${this.TABLE_NAME}.image`;
    ALL = `${this.TABLE_NAME}.*`;
}

export default Portfolio;