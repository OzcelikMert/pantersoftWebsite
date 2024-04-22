(function($){
	$.fn.extend({
		autofill: function(data, options) {
			self = this;
			return this.each(function() {
				$.each( data, function(k, v) {
					function set(_k, _v, type = 0){
						var selector, elt;
						selector = `[name="${_k}${((type === 1) ? `[]` : ``)}"]${((type === 1) ? `[value="${_v}"]` : ``)}`;
						elt = self.find( selector );

						if ( elt.length === 1 ) {
							if(elt.attr("type") === "checkbox") elt.prop("checked", (type === 1) ? 1 : _v);
							else elt.val( _v );
							//if(elt.is("select")) elt.change();
						} else if ( elt.length > 1 ) {
							// radio
							elt.val([_v]);
						}
					}


					if(Array.isArray(v)){
						v.forEach(_v => {
							set(k, _v, 1);
						});
					}else{
						set(k, v);
					}

				});
			});
		}
	});
})(jQuery);