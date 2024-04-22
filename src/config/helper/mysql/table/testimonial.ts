class Testimonial {
    TABLE_NAME = "testimonial";
    ID = `${this.TABLE_NAME}.id`;
    IMAGE = `${this.TABLE_NAME}.image`;
    TITLE = (lang: string) => { return `${this.TABLE_NAME}.title_${lang}`};
    CONTENT = (lang: string) => { return `${this.TABLE_NAME}.content_${lang}`};
    DATE = `${this.TABLE_NAME}.date`;
    STATUS = `${this.TABLE_NAME}.status`;
    RANK = `${this.TABLE_NAME}.rank`;
    ALL = `${this.TABLE_NAME}.*`;
}

export default Testimonial;