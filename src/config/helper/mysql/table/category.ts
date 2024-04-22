class Category {
    TABLE_NAME = "category";
    ID = `${this.TABLE_NAME}.id`;
    MAIN_ID = `${this.TABLE_NAME}.main_id`;
    NAME = (lang: string) => { return `${this.TABLE_NAME}.name_${lang}`};
    URL = (lang: string) => { return `${this.TABLE_NAME}.url_${lang}`};
    DATE = `${this.TABLE_NAME}.date`;
    IS_ACTIVE = `${this.TABLE_NAME}.is_active`;
    IS_DELETE = `${this.TABLE_NAME}.is_delete`;
    TYPE = `${this.TABLE_NAME}.type`;
    ALL = `${this.TABLE_NAME}.*`;
}

export default Category;