class CategoryLinked {
    TABLE_NAME = "category_linked";
    ID = `${this.TABLE_NAME}.id`;
    ITEM_ID = `${this.TABLE_NAME}.item_id`;
    TYPE = `${this.TABLE_NAME}.type`;
    CATEGORY_ID = `${this.TABLE_NAME}.category_id`;
    ALL = `${this.TABLE_NAME}.*`;
}

export default CategoryLinked;