class User {
    TABLE_NAME = "reference";
    ID = `${this.TABLE_NAME}.id`;
    URL = `${this.TABLE_NAME}.url`;
    IMAGE = `${this.TABLE_NAME}.image`;
    NAME = (lang: string) => `${this.TABLE_NAME}.name_${lang}`;
    RANK = `${this.TABLE_NAME}.rank`;
    STATUS = `${this.TABLE_NAME}.status`;
    ALL = `${this.TABLE_NAME}.*`;
    DATE = `${this.TABLE_NAME}.date`;
}
export default User;