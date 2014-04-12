define(["galaxy.masthead","utils/utils","libs/toastr","mvc/library/library-model"],function(b,d,e,c){var a=Backbone.View.extend({el:"#center",events:{"click #toolbtn_create_folder":"createFolderFromModal","click #toolbtn_bulk_import":"modalBulkImport","click #toolbtn_add_files":"addFilesToFolderModal"},defaults:{can_add_library_item:false,contains_file:false},modal:null,histories:null,initialize:function(f){this.options=_.defaults(f||{},this.defaults);this.render()},render:function(f){this.options=_.extend(this.options,f);var h=this.templateToolBar();var g=Galaxy.currUser.isAdmin();this.$el.html(h({id:this.options.id,admin_user:g}))},configureElements:function(f){this.options=_.extend(this.options,f);if(this.options.can_add_library_item===true){$("#toolbtn_create_folder").show();$("#toolbtn_add_files").show()}if(this.options.contains_file===true){$("#toolbtn_bulk_import").show();$("#toolbtn_dl").show()}this.$el.find("[data-toggle]").tooltip()},createFolderFromModal:function(){event.preventDefault();event.stopPropagation();var f=this;var g=this.templateNewFolderInModal();this.modal=Galaxy.modal;this.modal.show({closing_events:true,title:"Create New Folder",body:g(),buttons:{Create:function(){f.create_new_folder_event()},Close:function(){Galaxy.modal.hide()}}})},create_new_folder_event:function(){var f=this.serialize_new_folder();if(this.validate_new_folder(f)){var h=new c.FolderAsModel();url_items=Backbone.history.fragment.split("/");current_folder_id=url_items[url_items.length-1];h.url=h.urlRoot+"/"+current_folder_id;var g=this;h.save(f,{success:function(i){g.modal.hide();e.success("Folder created");i.set({type:"folder"});Galaxy.libraries.folderListView.folderContainer.attributes.folder.add(i);Galaxy.libraries.folderListView.render({id:current_folder_id})},error:function(){e.error("An error occured :(")}})}else{e.error("Folder's name is missing")}return false},serialize_new_folder:function(){return{name:$("input[name='Name']").val(),description:$("input[name='Description']").val()}},validate_new_folder:function(f){return f.name!==""},modalBulkImport:function(){var f=$("#folder_table").find(":checked");if(f.length===0){e.info("You have to select some datasets first")}else{this.refreshUserHistoriesList(function(g){var h=g.templateBulkImportInModal();g.modal=Galaxy.modal;g.modal.show({closing_events:true,title:"Import into History",body:h({histories:g.histories.models}),buttons:{Import:function(){g.importAllIntoHistory()},Close:function(){Galaxy.modal.hide()}}})})}},refreshUserHistoriesList:function(g){var f=this;this.histories=new c.GalaxyHistories();this.histories.fetch({success:function(){g(f)},error:function(){}})},importAllIntoHistory:function(){this.modal.disableButton("Import");var h=$("select[name=dataset_import_bulk] option:selected").val();var m=$("select[name=dataset_import_bulk] option:selected").text();var o=[];$("#folder_table").find(":checked").each(function(){if(this.parentElement.parentElement.id!==""){o.push(this.parentElement.parentElement.id)}});var n=this.templateProgressBar();$(this.modal.elMain).find(".modal-body").html(n({history_name:m}));var j=100/o.length;this.initProgress(j);var f=[];for(var g=o.length-1;g>=0;g--){library_dataset_id=o[g];var k=new c.HistoryItem();var l=this;k.url=k.urlRoot+h+"/contents";k.content=library_dataset_id;k.source="library";f.push(k)}this.chainCall(f)},chainCall:function(g){var f=this;var h=g.pop();if(typeof h==="undefined"){e.success("All datasets imported");this.modal.hide();return}var i=$.when(h.save({content:h.content,source:h.source})).done(function(j){f.updateProgress();f.chainCall(g)})},initProgress:function(f){this.progress=0;this.progressStep=f},updateProgress:function(){this.progress+=this.progressStep;$(".progress-bar-import").width(Math.round(this.progress)+"%");txt_representation=Math.round(this.progress)+"% Complete";$(".completion_span").text(txt_representation)},download:function(f,j){var h=[];$("#folder_table").find(":checked").each(function(){if(this.parentElement.parentElement.id!==""){h.push(this.parentElement.parentElement.id)}});var g="/api/libraries/datasets/download/"+j;var i={ldda_ids:h};this.processDownload(g,i,"get")},processDownload:function(g,h,i){if(g&&h){h=typeof h=="string"?h:$.param(h);var f="";$.each(h.split("&"),function(){var j=this.split("=");f+='<input type="hidden" name="'+j[0]+'" value="'+j[1]+'" />'});$('<form action="'+g+'" method="'+(i||"post")+'">'+f+"</form>").appendTo("body").submit().remove();e.info("Your download will begin soon")}},addFilesToFolderModal:function(){this.refreshUserHistoriesList(function(f){f.modal=Galaxy.modal;var h=f.templateAddFilesInModal();f.modal.show({closing_events:true,title:"Add datasets from history to "+f.options.folder_name,body:h({histories:f.histories.models}),buttons:{Add:function(){f.addFiles()},Close:function(){Galaxy.modal.hide()}}});var g=f.templateHistoryContents();f.modal.$el.find("#selected_history_content").html(g)})},addFiles:function(){alert("adding files")},templateToolBar:function(){tmpl_array=[];tmpl_array.push('<div class="library_style_container">');tmpl_array.push('<h3>Data Libraries Beta Test. This is work in progress. Please report problems & ideas via <a href="mailto:galaxy-bugs@bx.psu.edu?Subject=DataLibrariesBeta_Feedback" target="_blank">email</a> and <a href="https://trello.com/c/nwYQNFPK/56-data-library-ui-progressive-display-of-folders" target="_blank">Trello</a>.</h3>');tmpl_array.push('<div id="library_folder_toolbar" >');tmpl_array.push('   <button data-toggle="tooltip" data-placement="top" title="Create New Folder" id="toolbtn_create_folder" class="primary-button" type="button" style="display:none;"><span class="fa fa-plus"></span> <span class="fa fa-folder"></span></button>');tmpl_array.push('   <button data-toggle="tooltip" data-placement="top" title="Add Datasets to Current Folder" id="toolbtn_add_files" class="primary-button" type="button" style="display:none;"><span class="fa fa-plus"></span> <span class="fa fa-file"></span></span></button>');tmpl_array.push('   <button data-toggle="tooltip" data-placement="top" title="Import selected datasets into history" id="toolbtn_bulk_import" class="primary-button" style="margin-left: 0.5em; display:none;" type="button"><span class="fa fa-book"></span> to history</button>');tmpl_array.push('   <div id="toolbtn_dl" class="btn-group" style="margin-left: 0.5em; display:none; ">');tmpl_array.push('       <button title="Download selected datasets" id="drop_toggle" type="button" class="primary-button dropdown-toggle" data-toggle="dropdown">');tmpl_array.push('       <span class="fa fa-download"></span> download <span class="caret"></span>');tmpl_array.push("       </button>");tmpl_array.push('       <ul class="dropdown-menu" role="menu">');tmpl_array.push('          <li id="download_archive"><a href="#/folders/<%= id %>/download/tgz">.tar.gz</a></li>');tmpl_array.push('          <li id="download_archive"><a href="#/folders/<%= id %>/download/tbz">.tar.bz</a></li>');tmpl_array.push('          <li id="download_archive"><a href="#/folders/<%= id %>/download/zip">.zip</a></li>');tmpl_array.push("       </ul>");tmpl_array.push("   </div>");tmpl_array.push("   </div>");tmpl_array.push('   <div id="folder_items_element">');tmpl_array.push("   </div>");tmpl_array.push("</div>");return _.template(tmpl_array.join(""))},templateNewFolderInModal:function(){tmpl_array=[];tmpl_array.push('<div id="new_folder_modal">');tmpl_array.push("<form>");tmpl_array.push('<input type="text" name="Name" value="" placeholder="Name">');tmpl_array.push('<input type="text" name="Description" value="" placeholder="Description">');tmpl_array.push("</form>");tmpl_array.push("</div>");return _.template(tmpl_array.join(""))},templateBulkImportInModal:function(){var f=[];f.push('<span id="history_modal_combo_bulk" style="width:90%; margin-left: 1em; margin-right: 1em; ">');f.push("Select history: ");f.push('<select id="dataset_import_bulk" name="dataset_import_bulk" style="width:50%; margin-bottom: 1em; "> ');f.push("   <% _.each(histories, function(history) { %>");f.push('       <option value="<%= _.escape(history.get("id")) %>"><%= _.escape(history.get("name")) %></option>');f.push("   <% }); %>");f.push("</select>");f.push("</span>");return _.template(f.join(""))},templateProgressBar:function(){var f=[];f.push('<div class="import_text">');f.push("Importing selected datasets to history <b><%= _.escape(history_name) %></b>");f.push("</div>");f.push('<div class="progress">');f.push('   <div class="progress-bar progress-bar-import" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 00%;">');f.push('       <span class="completion_span">0% Complete</span>');f.push("   </div>");f.push("</div>");f.push("");return _.template(f.join(""))},templateAddFilesInModal:function(){var f=[];f.push('<div id="add_files_modal">');f.push('<div id="history_modal_combo_bulk">');f.push("Select history:  ");f.push('<select id="dataset_import_bulk" name="dataset_import_bulk" style="width:66%; "> ');f.push("   <% _.each(histories, function(history) { %>");f.push('       <option value="<%= _.escape(history.get("id")) %>"><%= _.escape(history.get("name")) %></option>');f.push("   <% }); %>");f.push("</select>");f.push("</div>");f.push('<div id="selected_history_content">');f.push("</div>");f.push("</div>");return _.template(f.join(""))},templateHistoryContents:function(){var f=[];f.push("item1");f.push("item2");f.push("item3");return _.template(f.join(""))}});return{FolderToolbarView:a}});