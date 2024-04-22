let PageYasin = (function () {
    function PageLogin(){
        main.init();
    }

    let main = {
        id: {
            MAIN: "#area_a"
        },
        class: {
            AREA: ".e_area"
        },
        variable: {DATA: []},
        get: function () {
            let self = this;
            Main.service(ServicePage.YASIN,"GET",null,(data)=>{
                if (data.status) {
                   self.variable.DATA = data.result;
                }
            },false, true)

            function create_element() {
                let table_column = []

                if (self.variable.DATA.length > 0) {
                    self.variable.DATA.forEach((item)=>{

                        table_column.push({
                            tr: {"item-id": item.id},
                            td: [
                                item.name,
                                item.surname,
                                item.age
                            ]
                        })

                    })

                    return new Table({class:"e_table table table-striped"})
                        .head(["Name","Surname","Age"])
                        .body(table_column)
                }
            }

            $(`${self.id.MAIN} ${self.class.AREA}`).html(create_element())
            //Main.DataTable($(`${self.id.MAIN} ${self.class.AREA} table`)[0]);
        },
        init(){
          let self = this;
          function event() {

          }
          self.get();
          event();
        }
    }

    return PageLogin;
})();


$(function () { (PageYasin()); })
