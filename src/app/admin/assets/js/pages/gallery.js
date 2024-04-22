const PageGallery = (function () {
    function PageGallery(){
        add_new.init();
        main.init();
        images.init();
        top.init();
    }

    PageGallery.modal = {
        events: {
            onSelected: function (result) {}
        },
        id: {
            MODAL: "#modal_gallery"
        },
        open() {
            let self = this;
            $(self.id.MODAL).modal("show");
        },
        close() {
            let self = this;
            $(self.id.MODAL).modal("hide");
        }
    }

    let add_new = {
        class: {
            ADD_NEW: ".e_gallery_add_new",
            FILE: ".e_gallery_file"
        },
        variable: {
            FILE: null
        },
        get(){

        },
        init(){
            let self = this;

            function events(){}

            FilePond.registerPlugin(
                FilePondPluginFileValidateSize,
                FilePondPluginFileValidateType
            );
            self.variable.FILE = FilePond.create( document.querySelector(`${self.class.ADD_NEW} ${self.class.FILE}`), {
                allowImagePreview: true,

                labelIdle: `Dosyalarınızı Sürükleyip Bırakın Yada <span class="filepond--label-action"> Dosya Seçiniz </span>`,
                labelInvalidField: "Geçeriz dosya tipi!",
                labelFileWaitingForSize: "Boyut hesaplanıyor lütfen bekleyiniz.",
                labelFileSizeNotAvailable: "Boyut geçersiz!",
                labelFileCountSingular: "Dosya listede var!",
                labelFileCountPlural: "Dosyalar listede var!",
                labelFileLoading: "Yükleniyor...",
                labelFileAdded: "Eklendi",
                labelFileLoadError: "Yüklenirken hata oluştu!",
                labelFileRemoved: "Silindi",
                labelFileRemoveError: "Silinemedi!",
                labelFileProcessing: "Yükleniyor...",
                labelFileProcessingComplete: "Yükleme tamamlandı",
                labelFileProcessingAborted: "Yükleme iptal edildi!",
                labelFileProcessingError: "Yüklenirken bir hata meydana geldi!",
                labelTapToCancel: "İptal et",
                labelTapToRetry: "Tekrar et",
                labelTapToUndo: "Geri al",
                labelButtonRemoveItem: "Sil",
                labelButtonAbortItemLoad: "Durdur",
                labelButtonRetryItemLoad: "Tekrar",
                labelButtonAbortItemProcessing: "İptal",
                labelButtonUndoItemProcessing: "Geri Al",
                labelButtonRetryItemProcessing: "Tekrar",
                labelButtonProcessItem: "Yükle",

                allowMultiple: true,
                allowFileEncode: false,
                required: true,
                acceptedFileTypes: ['image/png','image/jpg','image/jpeg',"image/webp", "image/gif"],
                fileValidateTypeDetectType: (source, type) => new Promise((resolve, reject) => {resolve(type);}),
                server: {
                    process: (fieldName, file, metadata, load, error, progress, abort) => {
                        const formData = new FormData();
                        console.log("1")
                        formData.append(fieldName, file, file.name);
                        console.log(formData)

                        const request = new XMLHttpRequest();
                        request.open('POST', './service/image');
                        request.upload.onprogress = (e) => {
                            progress(e.lengthComputable, e.loaded, e.total);
                        };
                        request.onload = function () {
                            console.log("2")
                            if (request.status >= 200 && request.status < 300) {
                                load(request.responseText);
                            } else {
                                error('HATA!');
                            }
                        };
                        request.onreadystatechange = function () {
                            if (this.readyState === 4) {
                                if(this.status === 200) {
                                    console.log("3")
                                    images.variable.DATA = Array();
                                    images.get();
                                }
                            }
                        };
                        request.send(formData);
                    }
                }
            });
            $(".filepond--credits").remove();
            events();
        }
    }

    let main = {
        class: {
            GALLERY: ".e_gallery"
        },
        init(){
            let self = this;

            function events(){
                $(`${main.class.GALLERY} ${self.class.BTN_NEW}`).on("click", function () {
                    add_new.get();
                });
            }

            events();
        }
    }

    let top = {
        variable: {
            SEARCH_TEXT: "",
        },
        class: {
            SEARCH: ".e_gallery_search"
        },
        init(){
            let self = this;

            function events(){
                $(`${main.class.GALLERY} ${self.class.SEARCH}`).on("keyup change search", function () {
                    self.variable.SEARCH_TEXT = $(this).val();
                    console.log(self.variable.SEARCH_TEXT)
                    images.get();
                });
            }

            events();
        }
    }

    let images = {
        variable: {
            DATA: Array()
        },
        class: {
            IMAGES: ".e_gallery_images",
            IMAGE: ".e_gallery_image"
        },
        get(){
            let self = this;
            function create_element() {
                let elements = ``;
                let regex = new RegExp(top.variable.SEARCH_TEXT, "gi");

                self.variable.DATA.forEach(item => {
                    if(top.variable.SEARCH_TEXT.length > 0) {
                        if(!String(item).match(regex)) return;
                    }

                    let function_btn = (Main.variable.PAGE_NAME !== "gallery")
                        ? `<button class="btn btn-success" function="select"><i class="bi bi-check"></i></button>`
                        : `<button class="btn btn-danger" function="delete"><i class="bi bi-trash-fill"></i></button>`;

                    elements += `
                        <div class="e_gallery_image col-lg-3 mb-3" name="${item}">
                            <div class="hover hover-img text-white rounded">
                                <img src="../image/${item}" alt="${item}">
                                <div class="hover-overlay"></div>
                                <div class="hover-img-content px-5 py-4">
                                    <h4 class="hover-img-title text-light">${item}</h4>
                                    <div class="hover-img-description mb-0">
                                        ${function_btn}
                                        <a href="../image/${item}" target="_blank" class="btn btn-primary"><i class="bi bi-eye"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                return elements;
            }

            if(self.variable.DATA.length === 0) {
                Main.service(ServicePage.IMAGE, "GET",
                    {},
                    function (data) {
                        self.variable.DATA = data.result;
                    }, false
                );
            }

            $(self.class.IMAGES).html(create_element());
        },
        init(){
            let self = this;

            function events(){
                $(document).on("click", `${main.class.GALLERY} ${self.class.IMAGES} ${self.class.IMAGE} button`, function () {
                    let element_btn = $(this);
                    let element_div = element_btn.closest(self.class.IMAGE);
                    let _function = element_btn.attr("function");
                    let name = element_div.attr("name");

                    switch (_function){
                        case "delete":
                            HelperSweetAlert.question(
                                "Resim Silme",
                                `<b>'${name}'</b> isimli resimi silmek istediğinizden emin misiniz?`,
                                "Evet",
                                "Hayır",
                                function (result) {
                                    if(result.value){
                                        Main.service(ServicePage.IMAGE, "DELETE",
                                            {name: name},
                                            function (data) {
                                                element_div.remove();
                                                let index = Variable.array_index_of(self.variable.DATA, "", name);
                                                self.variable.DATA = Variable.del_index_of(self.variable.DATA, index);
                                                HelperToastify.success(`<b>'${name}'</b> başarı ile silindi!`);
                                            }
                                        );
                                    }
                                }
                            );
                            break;
                        case "select":
                            PageGallery.modal.close();
                            PageGallery.modal.events.onSelected(name);
                            break;
                    }
                })
            }

            events();
            self.get();
        }
    }


    return PageGallery;
})();

$(function () {
    (new PageGallery());
})