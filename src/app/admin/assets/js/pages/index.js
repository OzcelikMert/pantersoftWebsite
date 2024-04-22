let PageDashboard = (function () {

	function PageDashboard(){
		total.init();
		last.init();
		detail_chart_view.init();
		top_view_blog.init();
	}

	let total = {
		variable: {

		},
		attr: {
			function: {
				VIEW: "view",
				BLOG: "blog",
				LIVE_VIEW: "live_view",
				SUBSCRIBE: "subscribe"
			}
		},
		class: {
			TOTAL: ".e_total"
		},
		id: {

		},
		get(){
			let self = this;

			Main.service(ServicePage.VIEW, "GET",
				{ type: "total" },
				function (data) {
					$(`${self.class.TOTAL}[function="${self.attr.function.VIEW}"]`).html(data.result.total);
				}
			);

			Main.service(ServicePage.SUBSCRIBER, "GET",
				{ type: "total" },
				function (data) {
					$(`${self.class.TOTAL}[function="${self.attr.function.SUBSCRIBE}"]`).html(data.result.total);
				}
			);

		},
		init(){
			let self = this;

			function events(){

			}

			self.get();
			events();
		}
	}

	let detail_chart_view = {
		variable: {
			DETAIL_TYPE: "year"
		},
		attr: {
			function: {
				YEAR: "year",
				MONTH: "month",
				WEEK: "week",
				DAY: "day"
			}
		},
		class: {
			VIEW_DETAIL: ".e_view_detail"
		},
		id: {
			CHART_VIEW_DETAIL: "#chart_view_detail"
		},
		get(){
			let self = this;

			Main.service(ServicePage.VIEW, "GET",
				{ type: "detail", detail_type: self.variable.DETAIL_TYPE },
				function (data) {
					let data_chart = {
						values: [],
						names: []
					};

					data.result.forEach( item => {
						let name = item.date;
						switch (self.variable.DETAIL_TYPE){
							case "day": name = `${item.date.substring(item.date.length - 2)}:00`; break;
						}
						data_chart.values.push(item.total);
						data_chart.names.push(name);
					});

					$(self.id.CHART_VIEW_DETAIL).html("");
					(new ApexCharts(document.querySelector(self.id.CHART_VIEW_DETAIL), {
						annotations: {
							position: 'back'
						},
						dataLabels: {
							enabled:false
						},
						chart: {
							type: 'bar',
							height: 300
						},
						fill: {
							opacity:1
						},
						plotOptions: {
						},
						series: [{
							name: 'Görüntüleme',
							data: data_chart.values
						}],
						colors: '#435ebe',
						xaxis: {
							categories: data_chart.names,
						},
					})).render();
				}
			);

		},
		init(){
			let self = this;

			function events(){
				$(self.class.VIEW_DETAIL).on("click", function () {
					self.variable.DETAIL_TYPE = $(this).attr("function");
					self.get();
				})
			}

			self.get();
			events();
		}
	}


	let last = {
		variable: {

		},
		attr: {
			function: {
				BLOG: "blog",
				SUBSCRIBE: "subscribe"
			}
		},
		class: {
			LAST: ".e_last"
		},
		id: {

		},
		get(){
			let self = this;

			Main.service(ServicePage.SUBSCRIBER, "GET",
				{ type: "detail", detail_type: "last" },
				function (data) {
					function create_element(){
						let element = ``;

						let bg_count = 0;
						data.result.forEach(item => {
							let name   = item.email.substring(0, item.email.lastIndexOf("@"));
							let domain = item.email.substring(item.email.lastIndexOf("@"));
							bg_count = (bg_count === 4) ? 1 : ++bg_count;
							let bg = (bg_count === 1) ? "bg-primary" :
								(bg_count === 2) ? "bg-warning" :
								(bg_count === 3) ? "bg-danger" : "bg-dark";
							element += `
								<div class="d-flex px-4 py-3">
            						<div class="avatar avatar-lg ${bg}">
            						    <span class="avatar-content">${name.substring(0, 1).toUpperCase()}</span>
            						    <span class="avatar-status ${Main.status_bg(item.status)}"></span>
            						</div>
            						<div class="name ms-4">
            						    <a href="mailto:${item.email}"><h5 class="mb-1">${name}</h5></a>
            						    <h6 class="text-muted mb-0">${domain}</h6>
            						</div>
        						</div>
							`;
						})

						return element;
					}

					$(`${self.class.LAST}[function="${self.attr.function.SUBSCRIBE}"]`).html(create_element());
				}
			);

		},
		init(){
			let self = this;

			function events(){

			}

			self.get();
			events();
		}
	}

	let top_view_blog = {
		class: { MAIN: ".e_blog" },
		variable: { DATA: [] },
		get(){
			let self = this;
			Main.service(ServicePage.BLOG,"GET",null,(data)=>{
				self.variable.DATA = data.result;

			},false)
			function create_element(){
				let table_columns = [];
				if (self.variable.DATA.length > 0) {
					self.variable.DATA.forEach((item)=>{
						if (status.includes(item.status)) return;

						if(!Variable.isset(()=> item.title)) item.title= "-";
						if(!Variable.isset(()=> item.views)) item.views= "50";

						table_columns.push({
							tr: {"item-id": `${item.id}`},
							td: [
								`<div class="d-flex align-items-center">
                                    <div class="avatar avatar-sm"><img src="../image/${item.image}" alt=""></div>
                                    <p class="font-bold ms-3 mb-0"><a href="${item.url}" target="_blank" item-name>${item.title}</a></p>
                                </div>`,
								item.views,
							]
						})
					})
				}

				return new Table({class:"table table-hover table-sm table-hover"}).head(["İsim",{html:"Görüntüleme",attr:{style:`width: 50px;`}}]).body(table_columns);
			}
			$(self.class.MAIN).html(create_element())
		},
		init(){
			this.get();
		}
	}

	return PageDashboard;
})();

$(function () {
	(new PageDashboard());
})