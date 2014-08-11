define(["mvc/collection/dataset-collection-base","mvc/base-mvc","utils/localization"],function(f,a,e){var d=Backbone.View.extend(a.LoggableMixin).extend({tagName:"div",className:"dataset-collection-panel",fxSpeed:"fast",DatasetDCEViewClass:f.DatasetDCEBaseView,NestedDCEViewClass:f.NestedDCEBaseView,initialize:function(h){h=h||{};if(h.logger){this.logger=h.logger}this.log(this+".initialize:",h);this.hasUser=h.hasUser;this.panelStack=[];this.parentName=h.parentName},_setUpListeners:function(){this.on("all",function(h){this.log(this+"",arguments)},this);return this},_setUpModelEventHandlers:function(){return this},render:function(j,k){this.log("render:",j,k);j=(j===undefined)?(this.fxSpeed):(j);var h=this,i;if(!this.model){return this}i=this.renderModel();$(h).queue("fx",[function(l){if(j&&h.$el.is(":visible")){h.$el.fadeOut(j,l)}else{l()}},function(l){h.$el.empty();if(i){h.$el.append(i.children())}l()},function(l){if(j&&!h.$el.is(":visible")){h.$el.fadeIn(j,l)}else{l()}},function(l){if(k){k.call(this)}h.trigger("rendered",this);l()}]);return this},renderModel:function(){var j=this.model.get("collection_type")||this.model.object.get("collection_type"),i=_.extend(this.model.toJSON(),{parentName:this.parentName,type:j}),h=$("<div/>").append(this.templates.panel(i));this._setUpBehaviours(h);this.renderContents(h);return h},_setUpBehaviours:function(h){h=h||this.$el;h.find("[title]").tooltip({placement:"bottom"});return this},$container:function(){return(this.findContainerFn)?(this.findContainerFn.call(this)):(this.$el.parent())},$datasetsList:function(h){return(h||this.$el).find(".datasets-list")},renderContents:function(i){i=i||this.$el;this.warn(this+".renderContents:, model:",this.model);var h=this,k={},j=this.model.getVisibleContents();this.log("renderContents, visibleContents:",j,i);this.$datasetsList(i).empty();if(j&&j.length){j.each(function(m){var n=m.id,l=h._createContentView(m);k[n]=l;h._attachContentView(l.render(),i)})}this.contentViews=k;return this.contentViews},_createContentView:function(j){var i=null,h=this._getContentClass(j);this.debug("ContentClass:",h);this.debug("content:",j);i=new h({model:j,linkTarget:this.linkTarget,hasUser:this.hasUser,logger:this.logger});this.debug("contentView:",i);this._setUpContentListeners(i);return i},_getContentClass:function(h){this.debug(this+"._getContentClass:",h);this.debug("DCEViewClass:",this.DCEViewClass);switch(h.get("element_type")){case"hda":return this.DCEViewClass;case"dataset_collection":return this.DCEViewClass}throw new TypeError("Unknown element type:",h.get("element_type"))},_setUpContentListeners:function(i){var h=this;if(i.model.get("element_type")==="dataset_collection"){i.on("expanded",function(j){h.info("expanded",j);h._addCollectionPanel(j)})}},_addCollectionPanel:function(j){var k=this,h=j.model;this.debug("collection panel (stack), collectionView:",j);this.debug("collection panel (stack), collectionModel:",h);var i=new c({model:h,parentName:this.model.get("name")});k.panelStack.push(i);k.$(".controls").add(".datasets-list").hide();k.$el.append(i.$el);i.on("close",function(){k.render();j.collapse();k.panelStack.pop()});if(!i.model.hasDetails()){var l=i.model.fetch();l.done(function(){i.render()})}else{i.render()}},_attachContentView:function(j,i){i=i||this.$el;var h=this.$datasetsList(i);h.append(j.$el);return this},events:{"click .navigation .back":"close"},close:function(h){this.$el.remove();this.trigger("close")},toString:function(){return"CollectionPanel("+((this.model)?(this.model.get("name")):(""))+")"}});d.templates=d.prototype.templates=(function(){var h=_.template(['<div class="controls">','<div class="navigation">','<a class="back" href="javascript:void(0)">','<span class="fa fa-icon fa-angle-left"></span>',e("Back to "),"<%- collection.parentName %>","</a>","</div>",'<div class="title">','<div class="name"><%- collection.name || collection.element_identifier %></div>','<div class="subtitle">','<% if( collection.type === "list" ){ %>',e("a list of datasets"),'<% } else if( collection.type === "paired" ){ %>',e("a pair of datasets"),'<% } else if( collection.type === "list:paired" ){ %>',e("a list of paired datasets"),"<% } %>","</div>","</div>","</div>",'<div class="datasets-list"></div>'].join(""));return{panel:function(i){return h({_l:e,collection:i})}}}());var b=d.extend({DCEViewClass:f.DatasetDCEBaseView,toString:function(){return"ListCollectionPanel("+((this.model)?(this.model.get("name")):(""))+")"}});var c=b.extend({toString:function(){return"PairCollectionPanel("+((this.model)?(this.model.get("name")):(""))+")"}});var g=d.extend({DCEViewClass:f.NestedDCDCEBaseView,toString:function(){return"ListOfPairsCollectionPanel("+((this.model)?(this.model.get("name")):(""))+")"}});return{CollectionPanel:d,ListCollectionPanel:b,PairCollectionPanel:c,ListOfPairsCollectionPanel:g}});