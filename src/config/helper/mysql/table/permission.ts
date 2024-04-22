class Permission {
    TABLE_NAME = "permission";
    ID = `${this.TABLE_NAME}.id`;
    RANK = `${this.TABLE_NAME}.rank`;
    NAME = (lang: string) => { return `${this.TABLE_NAME}.name_${lang}`};
    ALL = `${this.TABLE_NAME}.*`;
}

export default Permission;