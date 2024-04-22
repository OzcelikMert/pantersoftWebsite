const PageSubscriber = (function () {
    function PageSubscriber(){
        list.init();
    }

    let list = {
        variable: {
            DATA: Array(),
            DATA_TABLE: null
        },
        class: {
            LIST: ".e_list"
        },
        get(){
            let self = this;

            function create_element(){
                let elements = ``;

                self.variable.DATA.forEach(item => {
                    elements += `
                        <tr item-id="${item.id}">
                            <td>${item.date}</td>
                            <td><a href="mailto:${item.email}">${item.email}</a></td>
                            <td><a href="https://ipinfo.io/${item.ip}" target="_blank">${item.ip}</a></td>
                            <td>
                                <a href="javascript:void(0)" function="status">
                                    <span class="badge ${Main.status_bg(item.status)}">${item.status_name}</span>
                                </a>
                            </td>
                            <td>
                                <a href="javascript:void(0)" class="text-danger" function="delete">
                                    <i class="bi bi-trash-fill"></i>
                                </a>
                            </td>
                        </tr>
                    `;
                });

                return elements;
            }


            if(self.variable.DATA.length === 0){
                Main.service(ServicePage.SUBSCRIBER, "GET",
                    {type: "detail", detail_type: "all"},
                    function (data) {
                        self.variable.DATA = data.result;
                    }, false
                );
            }

            $(`${self.class.LIST} tbody`).html(create_element());
            self.variable.DATA_TABLE = Main.DataTable($(self.class.LIST)[0]);
        },
        init(){
            let self = this;

            function events(){
                $(document).on("click", `${self.class.LIST} tbody a[function]`, function () {
                    let element = $(this),
                        element_tr =  element.closest("tr"),
                        _function = element.attr("function"),
                        id = element_tr.attr("item-id"),
                        item = Variable.array_find(self.variable.DATA, "id", id);

                    switch (_function){
                        case "status":
                            Main.service(ServicePage.SUBSCRIBER, "PUT",
                                {id: id},
                                function (data) {
                                    Main.service(ServicePage.SUBSCRIBER, "GET",
                                        {type: "detail", detail_type: "id", id: id},
                                        function (data) {
                                            self.variable.DATA[item._index] = data.result[0];
                                            self.variable.DATA_TABLE.destroy();
                                            self.get();
                                            HelperToastify.success(`<b>'${item.email}</b> adresine ait abonenin durumu değiştirildi`);
                                        }, false
                                    );
                                }
                            );
                            break;
                        case "delete":
                            HelperSweetAlert.question(
                                "Abone Silme",
                                `<b>'${item.email}</b> adresine ait aboneyi silmek istediğinizden emin misiniz?`,
                                "Evet",
                                "Hayır",
                                function (result) {
                                    if(result.value){
                                        Main.service(ServicePage.SUBSCRIBER, "DELETE",
                                            {id: id},
                                            function (data) {
                                                element_tr.remove();
                                                Variable.del_index_of(self.variable.DATA, item._index);
                                                HelperToastify.success(`<b>'${item.email}</b> adresine ait abone silindi`);
                                            }
                                        );
                                    }
                                }

                            );
                            break;
                    }
                });
            }

            events();
            self.get();
        }
    }

    return PageSubscriber;
})();

$(function () {
    (new PageSubscriber());
})