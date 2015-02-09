define(["utils/levenshtein","mvc/base-mvc","utils/localization"],function(g,a,d){var f=Backbone.View.extend(a.LoggableMixin).extend({tagName:"li",className:"dataset paired",initialize:function(h){this.pair=h.pair||{}},template:_.template(['<span class="forward-dataset-name flex-column"><%= pair.forward.name %></span>','<span class="pair-name-column flex-column">','<span class="pair-name"><%= pair.name %></span>',"</span>",'<span class="reverse-dataset-name flex-column"><%= pair.reverse.name %></span>'].join("")),render:function(){this.$el.attr("draggable",true).data("pair",this.pair).html(this.template({pair:this.pair})).addClass("flex-column-container");return this},events:{dragstart:"_dragstart",dragend:"_dragend",dragover:"_sendToParent",drop:"_sendToParent"},_dragstart:function(h){h.currentTarget.style.opacity="0.4";if(h.originalEvent){h=h.originalEvent}h.dataTransfer.effectAllowed="move";h.dataTransfer.setData("text/plain",JSON.stringify(this.pair));this.$el.parent().trigger("pair.dragstart",[this])},_dragend:function(h){h.currentTarget.style.opacity="1.0";this.$el.parent().trigger("pair.dragend",[this])},_sendToParent:function(h){this.$el.parent().trigger(h)},toString:function(){return"PairView("+this.pair.name+")"}});var e=Backbone.View.extend(a.LoggableMixin).extend({className:"collection-creator flex-row-container",initialize:function(h){h=_.defaults(h,{datasets:[],filters:this.DEFAULT_FILTERS,automaticallyPair:true,matchPercentage:1,strategy:"lcs"});this.initialList=h.datasets;this.historyId=h.historyId;this.filters=this.commonFilters[h.filters]||this.commonFilters[this.DEFAULT_FILTERS];if(_.isArray(h.filters)){this.filters=h.filters}this.automaticallyPair=h.automaticallyPair;this.matchPercentage=h.matchPercentage;this.strategy=this.strategies[h.strategy]||this.strategies[this.DEFAULT_STRATEGY];if(_.isFunction(h.strategy)){this.strategy=h.strategy}this.removeExtensions=true;this.oncancel=h.oncancel;this.oncreate=h.oncreate;this.unpairedPanelHidden=false;this.pairedPanelHidden=false;this.$dragging=null;this._setUpBehaviors();this._dataSetUp()},commonFilters:{none:["",""],illumina:["_1","_2"]},DEFAULT_FILTERS:"illumina",strategies:{lcs:"autoPairLCSs",levenshtein:"autoPairLevenshtein"},DEFAULT_STRATEGY:"lcs",_dataSetUp:function(){this.paired=[];this.unpaired=[];this.selectedIds=[];this._sortInitialList();this._ensureIds();this.unpaired=this.initialList.slice(0);if(this.automaticallyPair){this.autoPair();this.once("rendered:initial",function(){this.trigger("autopair")})}},_sortInitialList:function(){this._sortDatasetList(this.initialList)},_sortDatasetList:function(h){h.sort(function(j,i){return naturalSort(j.name,i.name)});return h},_ensureIds:function(){this.initialList.forEach(function(h){if(!h.hasOwnProperty("id")){h.id=_.uniqueId()}});return this.initialList},_splitByFilters:function(j){var i=[],h=[];this.unpaired.forEach(function(k){if(this._filterFwdFn(k)){i.push(k)}if(this._filterRevFn(k)){h.push(k)}}.bind(this));return[i,h]},_filterFwdFn:function(i){var h=new RegExp(this.filters[0]);return h.test(i.name)},_filterRevFn:function(i){var h=new RegExp(this.filters[1]);return h.test(i.name)},_addToUnpaired:function(i){var h=function(j,l){if(j===l){return j}var k=Math.floor((l-j)/2)+j,m=naturalSort(i.name,this.unpaired[k].name);if(m<0){return h(j,k)}else{if(m>0){return h(k+1,l)}}while(this.unpaired[k]&&this.unpaired[k].name===i.name){k++}return k}.bind(this);this.unpaired.splice(h(0,this.unpaired.length),0,i)},autoPair:function(i){i=i||this.strategy;var h=this.simpleAutoPair();h=h.concat(this[i].call(this));return h},simpleAutoPair:function(){var o=0,m,s=this._splitByFilters(),h=s[0],r=s[1],q,u,k=false,t=[];while(o<h.length){var n=h[o];q=n.name.replace(this.filters[0],"");k=false;for(m=0;m<r.length;m++){var p=r[m];u=p.name.replace(this.filters[1],"");if(n!==p&&q===u){k=true;var l=this._pair(h.splice(o,1)[0],r.splice(m,1)[0],{silent:true});t.push(l);break}}if(!k){o+=1}}return t},autoPairLevenshtein:function(){var p=0,n,u=this._splitByFilters(),h=u[0],s=u[1],r,x,k,t,l,v=[];while(p<h.length){var o=h[p];r=o.name.replace(this.filters[0],"");l=Number.MAX_VALUE;for(n=0;n<s.length;n++){var q=s[n];x=q.name.replace(this.filters[1],"");if(o!==q){if(r===x){t=n;l=0;break}k=levenshteinDistance(r,x);if(k<l){t=n;l=k}}}var w=1-(l/(Math.max(r.length,x.length)));if(w>=this.matchPercentage){var m=this._pair(h.splice(p,1)[0],s.splice(t,1)[0],{silent:true});v.push(m);if(h.length<=0||s.length<=0){return v}}else{p+=1}}return v},autoPairLCSs:function(){var n=0,l,u=this._splitByFilters(),h=u[0],s=u[1],r,y,x,t,p,v=[];if(!h.length||!s.length){return v}while(n<h.length){var m=h[n];r=m.name.replace(this.filters[0],"");p=0;for(l=0;l<s.length;l++){var q=s[l];y=q.name.replace(this.filters[1],"");if(m!==q){if(r===y){t=l;p=r.length;break}var o=this._naiveStartingAndEndingLCS(r,y);x=o.length;if(x>p){t=l;p=x}}}var w=p/(Math.min(r.length,y.length));if(w>=this.matchPercentage){var k=this._pair(h.splice(n,1)[0],s.splice(t,1)[0],{silent:true});v.push(k);if(h.length<=0||s.length<=0){return v}}else{n+=1}}return v},_naiveStartingAndEndingLCS:function(m,k){var n="",o="",l=0,h=0;while(l<m.length&&l<k.length){if(m[l]!==k[l]){break}n+=m[l];l+=1}if(l===m.length){return m}if(l===k.length){return k}l=(m.length-1);h=(k.length-1);while(l>=0&&h>=0){if(m[l]!==k[h]){break}o=[m[l],o].join("");l-=1;h-=1}return n+o},_pair:function(j,h,i){i=i||{};var k=this._createPair(j,h,i.name);this.paired.push(k);this.unpaired=_.without(this.unpaired,j,h);if(!i.silent){this.trigger("pair:new",k)}return k},_createPair:function(j,h,i){if(!(j&&h)||(j===h)){throw new Error("Bad pairing: "+[JSON.stringify(j),JSON.stringify(h)])}i=i||this._guessNameForPair(j,h);return{forward:j,name:i,reverse:h}},_guessNameForPair:function(j,h,k){k=(k!==undefined)?(k):(this.removeExtensions);var i=this._naiveStartingAndEndingLCS(j.name.replace(this.filters[0],""),h.name.replace(this.filters[1],""));if(k){var l=i.lastIndexOf(".");if(l>0){i=i.slice(0,l)}}return i||(j.name+" & "+h.name)},_unpair:function(i,h){h=h||{};if(!i){throw new Error("Bad pair: "+JSON.stringify(i))}this.paired=_.without(this.paired,i);this._addToUnpaired(i.forward);this._addToUnpaired(i.reverse);if(!h.silent){this.trigger("pair:unpair",[i])}return i},unpairAll:function(){var h=[];while(this.paired.length){h.push(this._unpair(this.paired[0],{silent:true}))}this.trigger("pair:unpair",h)},_pairToJSON:function(h){return{collection_type:"paired",src:"new_collection",name:h.name,element_identifiers:[{name:"forward",id:h.forward.id,src:"hda"},{name:"reverse",id:h.reverse.id,src:"hda"}]}},createList:function(){var j=this,i;if(j.historyId){i="/api/histories/"+this.historyId+"/contents/dataset_collections"}var h={type:"dataset_collection",collection_type:"list:paired",name:_.escape(j.$(".collection-name").val()),element_identifiers:j.paired.map(function(k){return j._pairToJSON(k)})};return jQuery.ajax(i,{type:"POST",contentType:"application/json",dataType:"json",data:JSON.stringify(h)}).fail(function(m,k,l){j._ajaxErrHandler(m,k,l)}).done(function(k,l,m){j.trigger("collection:created",k,l,m);if(typeof j.oncreate==="function"){j.oncreate.call(this,k,l,m)}})},_ajaxErrHandler:function(k,h,j){this.error(k,h,j);var i=d("An error occurred while creating this collection");if(k){if(k.readyState===0&&k.status===0){i+=": "+d("Galaxy could not be reached and may be updating.")+d(" Try again in a few minutes.")}else{if(k.responseJSON){i+="<br /><pre>"+JSON.stringify(k.responseJSON)+"</pre>"}else{i+=": "+j}}}creator._showAlert(i,"alert-danger")},render:function(h,i){this.$el.empty().html(e.templates.main());this._renderHeader(h);this._renderMiddle(h);this._renderFooter(h);this._addPluginComponents();this.trigger("rendered",this);return this},_renderHeader:function(i,j){var h=this.$(".header").empty().html(e.templates.header()).find(".help-content").prepend($(e.templates.helpContent()));this._renderFilters();return h},_renderFilters:function(){return this.$(".forward-column .column-header input").val(this.filters[0]).add(this.$(".reverse-column .column-header input").val(this.filters[1]))},_renderMiddle:function(i,j){var h=this.$(".middle").empty().html(e.templates.middle());if(this.unpairedPanelHidden){this.$(".unpaired-columns").hide()}else{if(this.pairedPanelHidden){this.$(".paired-columns").hide()}}this._renderUnpaired();this._renderPaired();return h},_renderUnpaired:function(m,n){var k=this,l,i,h=[],j=this._splitByFilters();this.$(".forward-column .title").text([j[0].length,d("unpaired forward")].join(" "));this.$(".forward-column .unpaired-info").text(this._renderUnpairedDisplayStr(this.unpaired.length-j[0].length));this.$(".reverse-column .title").text([j[1].length,d("unpaired reverse")].join(" "));this.$(".reverse-column .unpaired-info").text(this._renderUnpairedDisplayStr(this.unpaired.length-j[1].length));this.$(".unpaired-columns .column-datasets").empty();this.$(".autopair-link").toggle(this.unpaired.length!==0);if(this.unpaired.length===0){this._renderUnpairedEmpty();return}i=j[1].map(function(p,o){if((j[0][o]!==undefined)&&(j[0][o]!==p)){h.push(k._renderPairButton())}return k._renderUnpairedDataset(p)});l=j[0].map(function(o){return k._renderUnpairedDataset(o)});if(!l.length&&!i.length){this._renderUnpairedNotShown();return}this.$(".unpaired-columns .forward-column .column-datasets").append(l).add(this.$(".unpaired-columns .paired-column .column-datasets").append(h)).add(this.$(".unpaired-columns .reverse-column .column-datasets").append(i));this._adjUnpairedOnScrollbar()},_renderUnpairedDisplayStr:function(h){return["(",h," ",d("filtered out"),")"].join("")},_renderUnpairedDataset:function(h){return $("<li/>").attr("id","dataset-"+h.id).addClass("dataset unpaired").attr("draggable",true).addClass(h.selected?"selected":"").append($("<span/>").addClass("dataset-name").text(h.name)).data("dataset",h)},_renderPairButton:function(){return $("<li/>").addClass("dataset unpaired").append($("<span/>").addClass("dataset-name").text(d("Pair these datasets")))},_renderUnpairedEmpty:function(){var h=$('<div class="empty-message"></div>').text("("+d("no remaining unpaired datasets")+")");this.$(".unpaired-columns .paired-column .column-datasets").empty().prepend(h);return h},_renderUnpairedNotShown:function(){var h=$('<div class="empty-message"></div>').text("("+d("no datasets were found matching the current filters")+")");this.$(".unpaired-columns .paired-column .column-datasets").empty().prepend(h);return h},_adjUnpairedOnScrollbar:function(){var k=this.$(".unpaired-columns").last(),l=this.$(".unpaired-columns .reverse-column .dataset").first();if(!l.size()){return}var h=k.offset().left+k.outerWidth(),j=l.offset().left+l.outerWidth(),i=Math.floor(h)-Math.floor(j);this.$(".unpaired-columns .forward-column").css("margin-left",(i>0)?i:0)},_renderPaired:function(i,j){this.$(".paired-column-title .title").text([this.paired.length,d("paired")].join(" "));this.$(".unpair-all-link").toggle(this.paired.length!==0);if(this.paired.length===0){this._renderPairedEmpty();return}else{this.$(".remove-extensions-link").show()}this.$(".paired-columns .column-datasets").empty();var h=this;this.paired.forEach(function(m,k){var l=new f({pair:m});h.$(".paired-columns .column-datasets").append(l.render().$el).append(['<button class="unpair-btn">','<span class="fa fa-unlink" title="',d("Unpair"),'"></span>',"</button>"].join(""))})},_renderPairedEmpty:function(){var h=$('<div class="empty-message"></div>').text("("+d("no paired datasets yet")+")");this.$(".paired-columns .column-datasets").empty().prepend(h);return h},_renderFooter:function(i,j){var h=this.$(".footer").empty().html(e.templates.footer());this.$(".remove-extensions").prop("checked",this.removeExtensions);if(typeof this.oncancel==="function"){this.$(".cancel-create.btn").show()}return h},_addPluginComponents:function(){this._chooseFiltersPopover(".choose-filters-link");this.$(".help-content i").hoverhighlight(".collection-creator","rgba( 64, 255, 255, 1.0 )")},_chooseFiltersPopover:function(h){function i(l,k){return['<button class="filter-choice btn" ','data-forward="',l,'" data-reverse="',k,'">',d("Forward"),": ",l,", ",d("Reverse"),": ",k,"</button>"].join("")}var j=$(_.template(['<div class="choose-filters">','<div class="help">',d("Choose from the following filters to change which unpaired reads are shown in the display"),":</div>",i("_1","_2"),i("_R1","_R2"),"</div>"].join(""),{}));return this.$(h).popover({container:".collection-creator",placement:"bottom",html:true,content:j})},_validationWarning:function(i,h){var j="validation-warning";if(i==="name"){i=this.$(".collection-name").add(this.$(".collection-name-prompt"));this.$(".collection-name").focus().select()}if(h){i=i||this.$("."+j);i.removeClass(j)}else{i.addClass(j)}},_setUpBehaviors:function(){this.once("rendered",function(){this.trigger("rendered:initial",this)});this.on("pair:new",function(){this._renderUnpaired();this._renderPaired();this.$(".paired-columns").scrollTop(8000000)});this.on("pair:unpair",function(h){this._renderUnpaired();this._renderPaired();this.splitView()});this.on("filter-change",function(){this.filters=[this.$(".forward-unpaired-filter input").val(),this.$(".reverse-unpaired-filter input").val()];this._renderFilters();this._renderUnpaired()});this.on("autopair",function(){this._renderUnpaired();this._renderPaired();var h,i=null;if(this.paired.length){i="alert-success";h=this.paired.length+" "+d("pairs created");if(!this.unpaired.length){h+=": "+d("all datasets have been successfully paired");this.hideUnpaired();this.$(".collection-name").focus()}}else{h=d("Could not automatically create any pairs from the given dataset names")}this._showAlert(h,i)});return this},events:{"click .more-help":"_clickMoreHelp","click .less-help":"_clickLessHelp","click .header .alert button":"_hideAlert","click .forward-column .column-title":"_clickShowOnlyUnpaired","click .reverse-column .column-title":"_clickShowOnlyUnpaired","click .unpair-all-link":"_clickUnpairAll","change .forward-unpaired-filter input":function(h){this.trigger("filter-change")},"focus .forward-unpaired-filter input":function(h){$(h.currentTarget).select()},"click .autopair-link":"_clickAutopair","click .choose-filters .filter-choice":"_clickFilterChoice","click .clear-filters-link":"_clearFilters","change .reverse-unpaired-filter input":function(h){this.trigger("filter-change")},"focus .reverse-unpaired-filter input":function(h){$(h.currentTarget).select()},"click .forward-column .dataset.unpaired":"_clickUnpairedDataset","click .reverse-column .dataset.unpaired":"_clickUnpairedDataset","click .paired-column .dataset.unpaired":"_clickPairRow","click .unpaired-columns":"clearSelectedUnpaired","mousedown .unpaired-columns .dataset":"_mousedownUnpaired","click .paired-column-title":"_clickShowOnlyPaired","mousedown .flexible-partition-drag":"_startPartitionDrag","click .paired-columns .dataset.paired":"selectPair","click .paired-columns":"clearSelectedPaired","click .paired-columns .pair-name":"_clickPairName","click .unpair-btn":"_clickUnpair","dragover .paired-columns .column-datasets":"_dragoverPairedColumns","drop .paired-columns .column-datasets":"_dropPairedColumns","pair.dragstart .paired-columns .column-datasets":"_pairDragstart","pair.dragend   .paired-columns .column-datasets":"_pairDragend","change .remove-extensions":function(h){this.toggleExtensions()},"change .collection-name":"_changeName","keydown .collection-name":"_nameCheckForEnter","click .cancel-create":function(h){if(typeof this.oncancel==="function"){this.oncancel.call(this)}},"click .create-collection":"_clickCreate"},_clickMoreHelp:function(h){this.$(".main-help").addClass("expanded");this.$(".more-help").hide()},_clickLessHelp:function(h){this.$(".main-help").removeClass("expanded");this.$(".more-help").show()},_showAlert:function(i,h){console.debug("alert:",i,h);h=h||"alert-danger";this.$(".main-help").hide();this.$(".header .alert").attr("class","alert alert-dismissable").addClass(h).show().find(".alert-message").html(i)},_hideAlert:function(h){this.$(".main-help").show();this.$(".header .alert").hide()},_clickShowOnlyUnpaired:function(h){if(this.$(".paired-columns").is(":visible")){this.hidePaired()}else{this.splitView()}},_clickShowOnlyPaired:function(h){if(this.$(".unpaired-columns").is(":visible")){this.hideUnpaired()}else{this.splitView()}},hideUnpaired:function(h,i){this.unpairedPanelHidden=true;this.pairedPanelHidden=false;this._renderMiddle(h,i)},hidePaired:function(h,i){this.unpairedPanelHidden=false;this.pairedPanelHidden=true;this._renderMiddle(h,i)},splitView:function(h,i){this.unpairedPanelHidden=this.pairedPanelHidden=false;this._renderMiddle(h,i);return this},_clickUnpairAll:function(h){this.unpairAll()},_clickAutopair:function(h){this.autoPair();this.trigger("autopair")},_clickFilterChoice:function(i){var h=$(i.currentTarget);this.$(".forward-unpaired-filter input").val(h.data("forward"));this.$(".reverse-unpaired-filter input").val(h.data("reverse"));this._hideChooseFilters();this.trigger("filter-change")},_hideChooseFilters:function(){this.$(".choose-filters-link").popover("hide");this.$(".popover").css("display","none")},_clearFilters:function(h){this.$(".forward-unpaired-filter input").val("");this.$(".reverse-unpaired-filter input").val("");this.trigger("filter-change")},_clickUnpairedDataset:function(h){h.stopPropagation();return this.toggleSelectUnpaired($(h.currentTarget))},toggleSelectUnpaired:function(j,i){i=i||{};var k=j.data("dataset"),h=i.force!==undefined?i.force:!j.hasClass("selected");if(!j.size()||k===undefined){return j}if(h){j.addClass("selected");if(!i.waitToPair){this.pairAllSelected()}}else{j.removeClass("selected")}return j},pairAllSelected:function(i){i=i||{};var j=this,k=[],h=[],l=[];j.$(".unpaired-columns .forward-column .dataset.selected").each(function(){k.push($(this).data("dataset"))});j.$(".unpaired-columns .reverse-column .dataset.selected").each(function(){h.push($(this).data("dataset"))});k.length=h.length=Math.min(k.length,h.length);k.forEach(function(n,m){try{l.push(j._pair(n,h[m],{silent:true}))}catch(o){j.error(o)}});if(l.length&&!i.silent){this.trigger("pair:new",l)}return l},clearSelectedUnpaired:function(){this.$(".unpaired-columns .dataset.selected").removeClass("selected")},_mousedownUnpaired:function(j){if(j.shiftKey){var i=this,h=$(j.target).addClass("selected"),k=function(l){i.$(l.target).filter(".dataset").addClass("selected")};h.parent().on("mousemove",k);$(document).one("mouseup",function(l){h.parent().off("mousemove",k);i.pairAllSelected()})}},_clickPairRow:function(j){var k=$(j.currentTarget).index(),i=$(".unpaired-columns .forward-column .dataset").eq(k).data("dataset"),h=$(".unpaired-columns .reverse-column .dataset").eq(k).data("dataset");this._pair(i,h)},_startPartitionDrag:function(i){var h=this,l=i.pageY;$("body").css("cursor","ns-resize");h.$(".flexible-partition-drag").css("color","black");function k(m){h.$(".flexible-partition-drag").css("color","");$("body").css("cursor","").unbind("mousemove",j)}function j(m){var n=m.pageY-l;if(!h.adjPartition(n)){$("body").trigger("mouseup")}h._adjUnpairedOnScrollbar();l+=n}$("body").mousemove(j);$("body").one("mouseup",k)},adjPartition:function(i){var h=this.$(".unpaired-columns"),j=this.$(".paired-columns"),k=parseInt(h.css("height"),10),l=parseInt(j.css("height"),10);k=Math.max(10,k+i);l=l-i;var m=i<0;if(m){if(this.unpairedPanelHidden){return false}else{if(k<=10){this.hideUnpaired();return false}}}else{if(this.unpairedPanelHidden){h.show();this.unpairedPanelHidden=false}}if(!m){if(this.pairedPanelHidden){return false}else{if(l<=15){this.hidePaired();return false}}}else{if(this.pairedPanelHidden){j.show();this.pairedPanelHidden=false}}h.css({height:k+"px",flex:"0 0 auto"});return true},selectPair:function(h){h.stopPropagation();$(h.currentTarget).toggleClass("selected")},clearSelectedPaired:function(h){this.$(".paired-columns .dataset.selected").removeClass("selected")},_clickPairName:function(j){j.stopPropagation();var i=$(j.currentTarget),k=this.paired[i.parent().parent().index()/2],h=prompt("Enter a new name for the pair:",k.name);if(h){k.name=h;k.customizedName=true;i.text(k.name)}},_clickUnpair:function(i){var h=Math.floor($(i.currentTarget).index()/2);this._unpair(this.paired[h])},_dragoverPairedColumns:function(k){k.preventDefault();var i=this.$(".paired-columns .column-datasets"),l=i.offset();var j=this._getNearestPairedDatasetLi(k.originalEvent.clientY);$(".paired-drop-placeholder").remove();var h=$('<div class="paired-drop-placeholder"></div>');if(!j.size()){i.append(h)}else{j.before(h)}},_getNearestPairedDatasetLi:function(o){var l=4,j=this.$(".paired-columns .column-datasets li").toArray();for(var k=0;k<j.length;k++){var n=$(j[k]),m=n.offset().top,h=Math.floor(n.outerHeight()/2)+l;if(m+h>o&&m-h<o){return n}}return $()},_dropPairedColumns:function(i){i.preventDefault();i.dataTransfer.dropEffect="move";var h=this._getNearestPairedDatasetLi(i.originalEvent.clientY);if(h.size()){this.$dragging.insertBefore(h)}else{this.$dragging.insertAfter(this.$(".paired-columns .unpair-btn").last())}this._syncPairsToDom();return false},_syncPairsToDom:function(){var h=[];this.$(".paired-columns .dataset.paired").each(function(){h.push($(this).data("pair"))});this.paired=h;this._renderPaired()},_pairDragstart:function(i,j){j.$el.addClass("selected");var h=this.$(".paired-columns .dataset.selected");this.$dragging=h},_pairDragend:function(h,i){$(".paired-drop-placeholder").remove();this.$dragging=null},toggleExtensions:function(i){var h=this;h.removeExtensions=(i!==undefined)?(i):(!h.removeExtensions);_.each(h.paired,function(j){if(j.customizedName){return}j.name=h._guessNameForPair(j.forward,j.reverse)});h._renderPaired();h._renderFooter()},_changeName:function(h){this._validationWarning("name",!!this._getName())},_nameCheckForEnter:function(h){if(h.keyCode===13){this._clickCreate()}},_getName:function(){return _.escape(this.$(".collection-name").val())},_clickCreate:function(i){var h=this._getName();if(!h){this._validationWarning("name")}else{this.createList()}},_printList:function(i){var h=this;_.each(i,function(j){if(i===h.paired){h._printPair(j)}else{}})},_printPair:function(h){this.debug(h.forward.name,h.reverse.name,": ->",h.name)},toString:function(){return"PairedCollectionCreator"}});e.templates=e.templates||{main:_.template(['<div class="header flex-row no-flex"></div>','<div class="middle flex-row flex-row-container"></div>','<div class="footer flex-row no-flex">'].join("")),header:_.template(['<div class="main-help well clear">','<a class="more-help" href="javascript:void(0);">',d("More help"),"</a>",'<div class="help-content">','<a class="less-help" href="javascript:void(0);">',d("Less"),"</a>","</div>","</div>",'<div class="alert alert-dismissable">','<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>','<span class="alert-message"></span>',"</div>",'<div class="column-headers vertically-spaced flex-column-container">','<div class="forward-column flex-column column">','<div class="column-header">','<div class="column-title">','<span class="title">',d("Unpaired forward"),"</span>",'<span class="title-info unpaired-info"></span>',"</div>",'<div class="unpaired-filter forward-unpaired-filter pull-left">','<input class="search-query" placeholder="',d("Filter this list"),'" />',"</div>","</div>","</div>",'<div class="paired-column flex-column no-flex column">','<div class="column-header">','<a class="choose-filters-link" href="javascript:void(0)">',d("Choose filters"),"</a>",'<a class="clear-filters-link" href="javascript:void(0);">',d("Clear filters"),"</a><br />",'<a class="autopair-link" href="javascript:void(0);">',d("Auto-pair"),"</a>","</div>","</div>",'<div class="reverse-column flex-column column">','<div class="column-header">','<div class="column-title">','<span class="title">',d("Unpaired reverse"),"</span>",'<span class="title-info unpaired-info"></span>',"</div>",'<div class="unpaired-filter reverse-unpaired-filter pull-left">','<input class="search-query" placeholder="',d("Filter this list"),'" />',"</div>","</div>","</div>","</div>"].join("")),middle:_.template(['<div class="unpaired-columns flex-column-container scroll-container flex-row">','<div class="forward-column flex-column column">','<ol class="column-datasets"></ol>',"</div>",'<div class="paired-column flex-column no-flex column">','<ol class="column-datasets"></ol>',"</div>",'<div class="reverse-column flex-column column">','<ol class="column-datasets"></ol>',"</div>","</div>",'<div class="flexible-partition">','<div class="flexible-partition-drag" title="',d("Drag to change"),'"></div>','<div class="column-header">','<div class="column-title paired-column-title">','<span class="title"></span>',"</div>",'<a class="unpair-all-link" href="javascript:void(0);">',d("Unpair all"),"</a>","</div>","</div>",'<div class="paired-columns flex-column-container scroll-container flex-row">','<ol class="column-datasets"></ol>',"</div>"].join("")),footer:_.template(['<div class="attributes clear">','<div class="clear">','<label class="remove-extensions-prompt pull-right">',d("Remove file extensions from pair names"),"?",'<input class="remove-extensions pull-right" type="checkbox" />',"</label>","</div>",'<div class="clear">','<input class="collection-name form-control pull-right" ','placeholder="',d("Enter a name for your new list"),'" />','<div class="collection-name-prompt pull-right">',d("Name"),":</div>","</div>","</div>",'<div class="actions clear vertically-spaced">','<div class="other-options pull-left">','<button class="cancel-create btn" tabindex="-1">',d("Cancel"),"</button>",'<div class="create-other btn-group dropup">','<button class="btn btn-default dropdown-toggle" data-toggle="dropdown">',d("Create a different kind of collection"),' <span class="caret"></span>',"</button>",'<ul class="dropdown-menu" role="menu">','<li><a href="#">',d("Create a <i>single</i> pair"),"</a></li>",'<li><a href="#">',d("Create a list of <i>unpaired</i> datasets"),"</a></li>","</ul>","</div>","</div>",'<div class="main-options pull-right">','<button class="create-collection btn btn-primary">',d("Create list"),"</button>","</div>","</div>"].join("")),helpContent:_.template(["<p>",d(["Collections of paired datasets are ordered lists of dataset pairs (often forward and reverse reads). ","These collections can be passed to tools and workflows in order to have analyses done on each member of ","the entire group. This interface allows you to create a collection, choose which datasets are paired, ","and re-order the final collection."].join("")),"</p>","<p>",d(['Unpaired datasets are shown in the <i data-target=".unpaired-columns">unpaired section</i> ',"(hover over the underlined words to highlight below). ",'Paired datasets are shown in the <i data-target=".paired-columns">paired section</i>.',"<ul>To pair datasets, you can:","<li>Click a dataset in the ",'<i data-target=".unpaired-columns .forward-column .column-datasets,','.unpaired-columns .forward-column">forward column</i> ',"to select it then click a dataset in the ",'<i data-target=".unpaired-columns .reverse-column .column-datasets,','.unpaired-columns .reverse-column">reverse column</i>.',"</li>",'<li>Click one of the "Pair these datasets" buttons in the ','<i data-target=".unpaired-columns .paired-column .column-datasets,','.unpaired-columns .paired-column">middle column</i> ',"to pair the datasets in a particular row.","</li>",'<li>Click <i data-target=".autopair-link">"Auto-pair"</i> ',"to have your datasets automatically paired based on name.","</li>","</ul>"].join("")),"</p>","<p>",d(["<ul>You can filter what is shown in the unpaired sections by:","<li>Entering partial dataset names in either the ",'<i data-target=".forward-unpaired-filter input">forward filter</i> or ','<i data-target=".reverse-unpaired-filter input">reverse filter</i>.',"</li>","<li>Choosing from a list of preset filters by clicking the ",'<i data-target=".choose-filters-link">"Choose filters" link</i>.',"</li>","<li>Entering regular expressions to match dataset names. See: ",'<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions"',' target="_blank">MDN\'s JavaScript Regular Expression Tutorial</a>. ',"Note: forward slashes (\\) are not needed.","</li>","<li>Clearing the filters by clicking the ",'<i data-target=".clear-filters-link">"Clear filters" link</i>.',"</li>","</ul>"].join("")),"</p>","<p>",d(["To unpair individual dataset pairs, click the ",'<i data-target=".unpair-btn">unpair buttons ( <span class="fa fa-unlink"></span> )</i>. ','Click the <i data-target=".unpair-all-link">"Unpair all" link</i> to unpair all pairs.'].join("")),"</p>","<p>",d(['You can include or remove the file extensions (e.g. ".fastq") from your pair names by toggling the ','<i data-target=".remove-extensions-prompt">"Remove file extensions from pair names?"</i> control.'].join("")),"</p>","<p>",d(['Once your collection is complete, enter a <i data-target=".collection-name">name</i> and ','click <i data-target=".create-collection">"Create list"</i>. ',"(Note: you do not have to pair all unpaired datasets to finish.)"].join("")),"</p>"].join(""))};(function(){jQuery.fn.extend({hoverhighlight:function h(j,i){j=j||"body";if(!this.size()){return this}$(this).each(function(){var l=$(this),k=l.data("target");if(k){l.mouseover(function(m){$(k,j).css({background:i})}).mouseout(function(m){$(k).css({background:""})})}});return this}})}());var b=function c(j,h){h=_.defaults(h||{},{datasets:j,oncancel:function(){Galaxy.modal.hide()},oncreate:function(){Galaxy.modal.hide();Galaxy.currHistoryPanel.refreshContents()}});if(!window.Galaxy||!Galaxy.modal){throw new Error("Galaxy or Galaxy.modal not found")}var i=new e(h).render();Galaxy.modal.show({title:"Create a collection of paired datasets",body:i.$el,width:"80%",height:"800px",closing_events:true});window.PCC=i;return i};return{PairedCollectionCreator:e,pairedCollectionCreatorModal:b}});