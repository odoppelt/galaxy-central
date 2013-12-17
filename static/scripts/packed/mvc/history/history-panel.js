define(["mvc/history/history-model","mvc/dataset/hda-model","mvc/dataset/hda-base","mvc/dataset/hda-edit"],function(c,f,a,i){var g=SessionStorageModel.extend({defaults:{searching:false,tagsEditorShown:false,annotationEditorShown:false},toString:function(){return"HistoryPanelPrefs("+JSON.stringify(this.toJSON())+")"}});g.storageKey=function h(){return("history-panel")};var d=SessionStorageModel.extend({defaults:{expandedHdas:{},show_deleted:false,show_hidden:false},addExpandedHda:function(j){this.save("expandedHdas",_.extend(this.get("expandedHdas"),_.object([j],[true])))},removeExpandedHda:function(j){this.save("expandedHdas",_.omit(this.get("expandedHdas"),j))},toString:function(){return"HistoryPrefs("+this.id+")"}});d.historyStorageKey=function b(j){if(!j){throw new Error("HistoryPrefs.historyStorageKey needs valid id: "+j)}return("history:"+j)};var e=Backbone.View.extend(LoggableMixin).extend({defaultHDAViewClass:i.HDAEditView,tagName:"div",className:"history-panel",fxSpeed:"fast",datasetsSelector:".datasets-list",emptyMsgSelector:".empty-history-message",msgsSelector:".message-container",initialize:function(j){j=j||{};if(j.logger){this.logger=j.logger}this.log(this+".initialize:",j);this.HDAViewClass=j.HDAViewClass||this.defaultHDAViewClass;this.linkTarget=j.linkTarget||"_blank";this.hdaViews={};this.indicator=new LoadingIndicator(this.$el);this.preferences=new g(_.extend({id:g.storageKey()},_.pick(j,_.keys(g.prototype.defaults))));this.filters=[];this.selecting=j.selecting||false;this.annotationEditorShown=j.annotationEditorShown||false;this._setUpListeners();if(this.model){this._setUpWebStorage(j.initiallyExpanded,j.show_deleted,j.show_hidden);this._setUpModelEventHandlers()}if(j.onready){j.onready.call(this)}},_setUpListeners:function(){this.on("error",function(k,n,j,m,l){this.errorHandler(k,n,j,m,l)});this.on("loading-history",function(){this.showLoadingIndicator("loading history...")});this.on("loading-done",function(){this.hideLoadingIndicator()});this.once("rendered",function(){this.trigger("rendered:initial",this);return false});this.on("switched-history current-history new-history",function(){if(_.isEmpty(this.hdaViews)){this.trigger("empty-history",this)}});if(this.logger){this.on("all",function(j){this.log(this+"",arguments)},this)}},errorHandler:function(l,o,k,n,m){var j=this._parseErrorMessage(l,o,k,n,m);if(o&&o.status===0&&o.readyState===0){}else{if(o&&o.status===502){}else{if(!this.$el.find(this.msgsSelector).is(":visible")){this.once("rendered",function(){this.displayMessage("error",j.message,j.details)})}else{this.displayMessage("error",j.message,j.details)}}}},_parseErrorMessage:function(m,q,l,p,o){var k=Galaxy.currUser,j={message:this._bePolite(p),details:{user:(k instanceof User)?(k.toJSON()):(k+""),source:(m instanceof Backbone.Model)?(m.toJSON()):(m+""),xhr:q,options:(q)?(_.omit(l,"xhr")):(l)}};_.extend(j.details,o||{});if(q&&_.isFunction(q.getAllResponseHeaders)){var n=q.getAllResponseHeaders();n=_.compact(n.split("\n"));n=_.map(n,function(r){return r.split(": ")});j.details.xhr.responseHeaders=_.object(n)}return j},_bePolite:function(j){j=j||_l("An error occurred while getting updates from the server");return j+". "+_l("Please contact a Galaxy administrator if the problem persists.")},loadCurrentHistory:function(k){var j=this;return this.loadHistoryWithHDADetails("current",k).then(function(m,l){j.trigger("current-history",j)})},switchToHistory:function(m,l){var j=this,k=function(){return jQuery.post(galaxy_config.root+"api/histories/"+m+"/set_as_current")};return this.loadHistoryWithHDADetails(m,l,k).then(function(o,n){j.trigger("switched-history",j)})},createNewHistory:function(l){if(!Galaxy||!Galaxy.currUser||Galaxy.currUser.isAnonymous()){this.displayMessage("error",_l("You must be logged in to create histories"));return $.when()}var j=this,k=function(){return jQuery.post(galaxy_config.root+"api/histories",{current:true})};return this.loadHistory(undefined,l,k).then(function(n,m){j.trigger("new-history",j)})},loadHistoryWithHDADetails:function(m,l,k,o){var j=this,n=function(p){return j.getExpandedHdaIds(p.id)};return this.loadHistory(m,l,k,o,n)},loadHistory:function(m,l,k,p,n){this.trigger("loading-history",this);l=l||{};var j=this;var o=c.History.getHistoryData(m,{historyFn:k,hdaFn:p,hdaDetailIds:l.initiallyExpanded||n});return this._loadHistoryFromXHR(o,l).fail(function(s,q,r){j.trigger("error",j,s,l,_l("An error was encountered while "+q),{historyId:m,history:r||{}})}).always(function(){j.trigger("loading-done",j)})},_loadHistoryFromXHR:function(l,k){var j=this;l.then(function(m,n){j.setModel(m,n,k)});l.fail(function(n,m){j.render()});return l},setModel:function(l,j,k){k=k||{};if(this.model){this.model.clearUpdateTimeout();this.stopListening(this.model);this.stopListening(this.model.hdas)}this.hdaViews={};if(Galaxy&&Galaxy.currUser){l.user=Galaxy.currUser.toJSON()}this.model=new c.History(l,j,k);this._setUpWebStorage(k.initiallyExpanded,k.show_deleted,k.show_hidden);this._setUpModelEventHandlers();this.trigger("new-model",this);this.render();return this},_setUpWebStorage:function(k,j,l){this.storage=new d({id:d.historyStorageKey(this.model.get("id"))});if(_.isObject(k)){this.storage.set("exandedHdas",k)}if(_.isBoolean(j)){this.storage.set("show_deleted",j)}if(_.isBoolean(l)){this.storage.set("show_hidden",l)}this.trigger("new-storage",this.storage,this);this.log(this+" (init'd) storage:",this.storage.get())},clearWebStorage:function(){for(var j in sessionStorage){if(j.indexOf("history:")===0){sessionStorage.removeItem(j)}}},getStoredOptions:function(k){if(!k||k==="current"){return(this.storage)?(this.storage.get()):({})}var j=sessionStorage.getItem(d.historyStorageKey(k));return(j===null)?({}):(JSON.parse(j))},getExpandedHdaIds:function(j){var k=this.getStoredOptions(j).expandedHdas;return((_.isEmpty(k))?([]):(_.keys(k)))},_setUpModelEventHandlers:function(){this.model.on("error error:hdas",function(k,m,j,l){this.errorHandler(k,m,j,l)},this);this.model.on("change:nice_size",this.updateHistoryDiskSize,this);if(Galaxy&&Galaxy.quotaMeter){this.listenTo(this.model,"change:nice_size",function(){Galaxy.quotaMeter.update()})}this.model.hdas.on("add",this.addHdaView,this);this.model.hdas.on("change:deleted",this.handleHdaDeletionChange,this);this.model.hdas.on("change:visible",this.handleHdaVisibleChange,this);this.model.hdas.on("change:purged",function(j){this.model.fetch()},this);this.model.hdas.on("state:ready",function(k,l,j){if((!k.get("visible"))&&(!this.storage.get("show_hidden"))){this.removeHdaView(this.hdaViews[k.id])}},this)},render:function(l,m){l=(l===undefined)?(this.fxSpeed):(l);var j=this,k;if(this.model){k=this.renderModel()}else{k=this.renderWithoutModel()}$(j).queue("fx",[function(n){if(l&&j.$el.is(":visible")){j.$el.fadeOut(l,n)}else{n()}},function(n){j.$el.empty();if(k){j.$el.append(k.children());j.renderBasedOnPrefs()}n()},function(n){if(l&&!j.$el.is(":visible")){j.$el.fadeIn(l,n)}else{n()}},function(n){if(m){m.call(this)}j.trigger("rendered",this);n()}]);return this},renderWithoutModel:function(){var j=$("<div/>"),k=$("<div/>").addClass("message-container").css({"margin-left":"4px","margin-right":"4px"});return j.append(k)},renderModel:function(){var j=$("<div/>");if(!Galaxy||!Galaxy.currUser||Galaxy.currUser.isAnonymous()){j.append(e.templates.anonHistoryPanel(this.model.toJSON()))}else{j.append(e.templates.historyPanel(this.model.toJSON()));if(Galaxy.currUser.id&&Galaxy.currUser.id===this.model.get("user_id")){this._renderTags(j);this._renderAnnotation(j)}}j.find(".history-secondary-actions").prepend(this._renderSearchButton());this._setUpBehaviours(j);this.renderHdas(j);return j},renderBasedOnPrefs:function(){if(this.preferences.get("searching")){this.showSearchControls(0)}},_renderTags:function(j){var k=this;this.tagsEditor=new TagsEditor({model:this.model,el:j.find(".history-controls .tags-display"),onshowFirstTime:function(){this.render()},onshow:function(){k.preferences.set("tagsEditorShown",true);k.toggleHDATagEditors(true,k.fxSpeed)},onhide:function(){k.preferences.set("tagsEditorShown",false);k.toggleHDATagEditors(false,k.fxSpeed)},$activator:faIconButton({title:_l("Edit history tags"),classes:"history-tag-btn",faIcon:"fa-tags"}).appendTo(j.find(".history-secondary-actions"))});if(this.preferences.get("tagsEditorShown")){this.tagsEditor.toggle(true)}},_renderAnnotation:function(j){var k=this;this.annotationEditor=new AnnotationEditor({model:this.model,el:j.find(".history-controls .annotation-display"),onshowFirstTime:function(){this.render()},onshow:function(){k.preferences.set("annotationEditorShown",true);k.toggleHDAAnnotationEditors(true,k.fxSpeed)},onhide:function(){k.preferences.set("annotationEditorShown",false);k.toggleHDAAnnotationEditors(false,k.fxSpeed)},$activator:faIconButton({title:_l("Edit history Annotation"),classes:"history-annotate-btn",faIcon:"fa-comment"}).appendTo(j.find(".history-secondary-actions"))});if(this.preferences.get("annotationEditorShown")){this.annotationEditor.toggle(true)}},_renderSearchButton:function(j){return faIconButton({title:_l("Search datasets"),classes:"history-search-btn",faIcon:"fa-search"})},_renderSelectButton:function(j){return faIconButton({title:_l("Operations on multiple datasets"),classes:"history-select-btn",faIcon:"fa-check-square-o"})},_setUpBehaviours:function(j){j=j||this.$el;j.find("[title]").tooltip({placement:"bottom"});if((!this.model)||(!Galaxy.currUser||Galaxy.currUser.isAnonymous())||(Galaxy.currUser.id!==this.model.get("user_id"))){return}var k=this;j.find(".history-name").attr("title",_l("Click to rename history")).tooltip({placement:"bottom"}).make_text_editable({on_finish:function(l){j.find(".history-name").text(l);k.model.save({name:l}).fail(function(){j.find(".history-name").text(k.model.previous("name"))})}});this._setUpDatasetActionsPopup(j)},_setUpDatasetActionsPopup:function(j){var k=this;(new PopupMenu(j.find(".history-dataset-action-popup-btn"),[{html:_l("Hide datasets"),func:function(){var l=f.HistoryDatasetAssociation.prototype.hide;k.getSelectedHdaCollection().ajaxQueue(l)}},{html:_l("Unhide datasets"),func:function(){var l=f.HistoryDatasetAssociation.prototype.unhide;k.getSelectedHdaCollection().ajaxQueue(l)}},{html:_l("Delete datasets"),func:function(){var l=f.HistoryDatasetAssociation.prototype["delete"];k.getSelectedHdaCollection().ajaxQueue(l)}},{html:_l("Undelete datasets"),func:function(){var l=f.HistoryDatasetAssociation.prototype.undelete;k.getSelectedHdaCollection().ajaxQueue(l)}},{html:_l("Permanently delete datasets"),func:function(){if(confirm(_l("This will permanently remove the data in your datasets. Are you sure?"))){var l=f.HistoryDatasetAssociation.prototype.purge;k.getSelectedHdaCollection().ajaxQueue(l)}}}]))},refreshHdas:function(k,j){if(this.model){return this.model.refresh(k,j)}return $.when()},addHdaView:function(m){this.log("add."+this,m);var k=this;if(!m.isVisible(this.storage.get("show_deleted"),this.storage.get("show_hidden"))){return}$({}).queue([function l(o){var n=k.$el.find(k.emptyMsgSelector);if(n.is(":visible")){n.fadeOut(k.fxSpeed,o)}else{o()}},function j(o){k.scrollToTop();var n=k.$el.find(k.datasetsSelector);k.createHdaView(m).$el.hide().prependTo(n).slideDown(k.fxSpeed)}])},createHdaView:function(l){var k=l.get("id"),j=this.storage.get("expandedHdas")[k],m=new this.HDAViewClass({model:l,linkTarget:this.linkTarget,expanded:j,tagsEditorShown:this.preferences.get("tagsEditorShown"),annotationEditorShown:this.preferences.get("annotationEditorShown"),selectable:this.selecting,hasUser:this.model.ownedByCurrUser(),logger:this.logger});this._setUpHdaListeners(m);this.hdaViews[k]=m;return m.render()},_setUpHdaListeners:function(k){var j=this;k.on("body-expanded",function(l){j.storage.addExpandedHda(l)});k.on("body-collapsed",function(l){j.storage.removeExpandedHda(l)});k.on("error",function(m,o,l,n){j.errorHandler(m,o,l,n)})},handleHdaDeletionChange:function(j){if(j.get("deleted")&&!this.storage.get("show_deleted")){this.removeHdaView(this.hdaViews[j.id])}},handleHdaVisibleChange:function(j){if(j.hidden()&&!this.storage.get("show_hidden")){this.removeHdaView(this.hdaViews[j.id])}},removeHdaView:function(k){if(!k){return}var j=this;k.$el.fadeOut(j.fxSpeed,function(){k.off();k.remove();delete j.hdaViews[k.model.id];if(_.isEmpty(j.hdaViews)){j.$el.find(j.emptyMsgSelector).fadeIn(j.fxSpeed,function(){j.trigger("empty-history",j)})}})},renderHdas:function(l){l=l||this.$el;this.hdaViews={};var k=this,j=l.find(this.datasetsSelector),m=this.model.hdas.getVisible(this.storage.get("show_deleted"),this.storage.get("show_hidden"),this.filters);j.empty();if(m.length){m.each(function(n){j.prepend(k.createHdaView(n).$el)});l.find(this.emptyMsgSelector).hide()}else{l.find(this.emptyMsgSelector).show()}return this.hdaViews},toggleHDATagEditors:function(){var j=arguments;_.each(this.hdaViews,function(k){if(k.tagsEditor){k.tagsEditor.toggle.apply(k.tagsEditor,j)}})},toggleHDAAnnotationEditors:function(j){var k=arguments;_.each(this.hdaViews,function(l){if(l.annotationEditor){l.annotationEditor.toggle.apply(l.annotationEditor,k)}})},events:{"click .message-container":"clearMessages","click .history-search-btn":"toggleSearchControls","click .history-select-btn":function(j){this.toggleSelectors(this.fxSpeed)},"click .history-select-all-datasets-btn":"selectAllDatasets"},updateHistoryDiskSize:function(){this.$el.find(".history-size").text(this.model.get("nice_size"))},collapseAllHdaBodies:function(){_.each(this.hdaViews,function(j){j.toggleBodyVisibility(null,false)});this.storage.set("expandedHdas",{})},toggleShowDeleted:function(){this.storage.set("show_deleted",!this.storage.get("show_deleted"));this.renderHdas();return this.storage.get("show_deleted")},toggleShowHidden:function(){this.storage.set("show_hidden",!this.storage.get("show_hidden"));this.renderHdas();return this.storage.get("show_hidden")},renderSearchControls:function(k){var l=this;function n(o){l.searchFor=o;l.filters=[function(p){return p.matchesAll(l.searchFor)}];l.trigger("search:searching",o,l);l.renderHdas()}function j(o){if(l.model.hdas.haveDetails()){n(o);return}l.$el.find(".history-search-controls").searchInput("toggle-loading");l.model.hdas.fetchAllDetails({silent:true}).always(function(){l.$el.find(".history-search-controls").searchInput("toggle-loading")}).done(function(){n(o)})}function m(){l.searchFor="";l.filters=[];l.trigger("search:clear",l);l.renderHdas()}return k.searchInput({initialVal:l.searchFor,name:"history-search",placeholder:"search datasets",classes:"history-search",onfirstsearch:j,onsearch:n,onclear:m})},showSearchControls:function(l){l=(l===undefined)?(this.fxSpeed):(l);var j=this,k=this.$el.find(".history-search-controls");if(!k.children().size()){k=this.renderSearchControls(k).hide()}k.show(l,function(){$(this).find("input").focus();j.preferences.set("searching",true)})},hideSearchControls:function(){speed=(speed===undefined)?(this.fxSpeed):(speed);var j=this;this.$el.find(".history-search-controls").hide(speed,function(){j.preferences.set("searching",false)})},toggleSearchControls:function(j){speed=(jQuery.type(j)==="number")?(j):(this.fxSpeed);if(this.$el.find(".history-search-controls").is(":visible")){this.hideSearchControls(speed)}else{this.showSearchControls(speed)}},showSelectors:function(j){this.selecting=true;this.$el.find(".history-dataset-actions").slideDown(j);_.each(this.hdaViews,function(k){k.showSelector(j)})},hideSelectors:function(j){this.selecting=false;this.$el.find(".history-dataset-actions").slideUp(j);_.each(this.hdaViews,function(k){k.hideSelector(j)})},toggleSelectors:function(j){if(!this.selecting){this.showSelectors(j)}else{this.hideSelectors(j)}},selectAllDatasets:function(k){var j=this.$el.find(".history-select-all-datasets-btn");currMode=j.data("mode");if(currMode==="select"){_.each(this.hdaViews,function(l){l.select(k)});j.data("mode","deselect");j.text(_l("De-select all"))}else{if(currMode==="deselect"){_.each(this.hdaViews,function(l){l.deselect(k)});j.data("mode","select");j.text(_l("Select all"))}}},getSelectedHdaViews:function(){return _.filter(this.hdaViews,function(j){return j.selected})},getSelectedHdaCollection:function(){return new f.HDACollection(_.map(this.getSelectedHdaViews(),function(j){return j.model}),{historyId:this.model.id})},showLoadingIndicator:function(k,j,l){j=(j!==undefined)?(j):(this.fxSpeed);if(!this.indicator){this.indicator=new LoadingIndicator(this.$el,this.$el.parent())}if(!this.$el.is(":visible")){this.indicator.show(0,l)}else{this.$el.fadeOut(j);this.indicator.show(k,j,l)}},hideLoadingIndicator:function(j,k){j=(j!==undefined)?(j):(this.fxSpeed);if(this.indicator){this.indicator.hide(j,k)}},displayMessage:function(o,p,n){var l=this;this.scrollToTop();var m=this.$el.find(this.msgsSelector),j=$("<div/>").addClass(o+"message").html(p);if(!_.isEmpty(n)){var k=$('<a href="javascript:void(0)">Details</a>').click(function(){Galaxy.modal.show(l.messageToModalOptions(o,p,n));return false});j.append(" ",k)}return m.html(j)},messageToModalOptions:function(n,p,m){var j=this,o=$("<div/>"),l={title:"Details"};function k(q){q=_.omit(q,_.functions(q));return["<table>",_.map(q,function(s,r){s=(_.isObject(s))?(k(s)):(s);return'<tr><td style="vertical-align: top; color: grey">'+r+'</td><td style="padding-left: 8px">'+s+"</td></tr>"}).join(""),"</table>"].join("")}if(_.isObject(m)){l.body=o.append(k(m))}else{l.body=o.html(m)}l.buttons={Ok:function(){Galaxy.modal.hide();j.clearMessages()}};return l},clearMessages:function(){var j=this.$el.find(this.msgsSelector);j.empty()},scrollPosition:function(){return this.$el.parent().scrollTop()},scrollTo:function(j){this.$el.parent().scrollTop(j)},scrollToTop:function(){this.$el.parent().scrollTop(0);return this},scrollIntoView:function(k,l){if(!l){this.$el.parent().parent().scrollTop(k);return this}var j=window,m=this.$el.parent().parent(),o=$(j).innerHeight(),n=(o/2)-(l/2);$(m).scrollTop(k-n);return this},scrollToId:function(k){if((!k)||(!this.hdaViews[k])){return this}var j=this.hdaViews[k].$el;this.scrollIntoView(j.offset().top,j.outerHeight());return this},scrollToHid:function(j){var k=this.model.hdas.getByHid(j);if(!k){return this}return this.scrollToId(k.id)},connectToQuotaMeter:function(j){if(!j){return this}this.listenTo(j,"quota:over",this.showQuotaMessage);this.listenTo(j,"quota:under",this.hideQuotaMessage);this.on("rendered rendered:initial",function(){if(j&&j.isOverQuota()){this.showQuotaMessage()}});return this},showQuotaMessage:function(){var j=this.$el.find(".quota-message");if(j.is(":hidden")){j.slideDown(this.fxSpeed)}},hideQuotaMessage:function(){var j=this.$el.find(".quota-message");if(!j.is(":hidden")){j.slideUp(this.fxSpeed)}},connectToOptionsMenu:function(j){if(!j){return this}this.on("new-storage",function(l,k){if(j&&l){j.findItemByHtml(_l("Include Deleted Datasets")).checked=l.get("show_deleted");j.findItemByHtml(_l("Include Hidden Datasets")).checked=l.get("show_hidden")}});return this},toString:function(){return"HistoryPanel("+((this.model)?(this.model.get("name")):(""))+")"}});e.templates={historyPanel:Handlebars.templates["template-history-historyPanel"],anonHistoryPanel:Handlebars.templates["template-history-historyPanel-anon"]};return{HistoryPanel:e}});