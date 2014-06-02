define(["libs/toastr","mvc/library/library-model","mvc/ui/ui-select"],function(d,c,b){var a=Backbone.View.extend({el:"#center",model:null,options:{},events:{"click .toolbtn_modify_dataset":"enableModification","click .toolbtn_cancel_modifications":"render","click .toolbtn-download-dataset":"downloadDataset","click .toolbtn-import-dataset":"importIntoHistory","click .toolbtn-share-dataset":"shareDataset","click .toolbtn_save_modifications":"comingSoon","click .btn-remove-restrictions":"comingSoon","click .btn-make-private":"comingSoon","click .btn-share-dataset":"comingSoon"},initialize:function(e){this.options=_.extend(this.options,e);if(this.options.id){this.fetchDataset()}},fetchDataset:function(e){this.options=_.extend(this.options,e);this.model=new c.Item({id:this.options.id});var f=this;this.model.fetch({success:function(){if(f.options.show_permissions){f.showPermissions()}else{f.render()}},error:function(h,g){if(typeof g.responseJSON!=="undefined"){d.error(g.responseJSON.err_msg+" Click this to go back.","",{onclick:function(){Galaxy.libraries.library_router.back()}})}else{d.error("An error ocurred :(. Click this to go back.","",{onclick:function(){Galaxy.libraries.library_router.back()}})}}})},render:function(e){$(".tooltip").remove();this.options=_.extend(this.options,e);var f=this.templateDataset();this.$el.html(f({item:this.model}));$(".peek").html(this.model.get("peek"));$("#center [data-toggle]").tooltip()},enableModification:function(){$(".tooltip").remove();var e=this.templateModifyDataset();this.$el.html(e({item:this.model}));$(".peek").html(this.model.get("peek"));$("#center [data-toggle]").tooltip()},downloadDataset:function(){var e="/api/libraries/datasets/download/uncompressed";var f={ldda_ids:this.id};this.processDownload(e,f)},processDownload:function(f,g,h){if(f&&g){g=typeof g=="string"?g:$.param(g);var e="";$.each(g.split("&"),function(){var i=this.split("=");e+='<input type="hidden" name="'+i[0]+'" value="'+i[1]+'" />'});$('<form action="'+f+'" method="'+(h||"post")+'">'+e+"</form>").appendTo("body").submit().remove();d.info("Your download will begin soon")}},importIntoHistory:function(){this.refreshUserHistoriesList(function(e){var f=e.templateBulkImportInModal();e.modal=Galaxy.modal;e.modal.show({closing_events:true,title:"Import into History",body:f({histories:e.histories.models}),buttons:{Import:function(){e.importCurrentIntoHistory()},Close:function(){Galaxy.modal.hide()}}})})},refreshUserHistoriesList:function(f){var e=this;this.histories=new c.GalaxyHistories();this.histories.fetch({success:function(){f(e)},error:function(h,g){if(typeof g.responseJSON!=="undefined"){d.error(g.responseJSON.err_msg)}else{d.error("An error ocurred :(")}}})},importCurrentIntoHistory:function(){var f=$(this.modal.elMain).find("select[name=dataset_import_single] option:selected").val();var g=new c.HistoryItem();g.url=g.urlRoot+f+"/contents";var e="/api/histories/"+f+"/set_as_current";$.ajax({url:e,type:"PUT"});g.save({content:this.id,source:"library"},{success:function(){Galaxy.modal.hide();d.success("Dataset imported. Click this to start analysing it.","",{onclick:function(){window.location="/"}})},error:function(i,h){if(typeof h.responseJSON!=="undefined"){d.error("Dataset not imported. "+h.responseJSON.err_msg)}else{d.error("An error occured! Dataset not imported. Please try again.")}}})},shareDataset:function(){d.info("Feature coming soon.")},goBack:function(){Galaxy.libraries.library_router.back()},showPermissions:function(){$(".tooltip").remove();var f=this.templateDatasetPermissions();this.$el.html(f({item:this.model}));var g=false;if(Galaxy.currUser){g=Galaxy.currUser.isAdmin()}var e=this;$.get("/api/libraries/datasets/"+e.id+"/permissions/current").done(function(j){var k=[];for(var m=0;m<j.length;m++){k.push(j[m]+":"+j[m])}if(g){var h={minimumInputLength:1,css:"access_perm",multiple:true,placeholder:"Click to select a role",container:e.$el.find("#access_perm"),ajax:{url:"/api/libraries/datasets/"+e.id+"/permissions",dataType:"json",quietMillis:100,data:function(i,p){return{q:i,page_limit:10,page:p}},results:function(q,p){var i=(p*10)<q.total;return{results:q.roles,more:i}}},formatResult:function l(i){return i.name+" type: "+i.type},formatSelection:function o(i){return i.name},initSelection:function(i,q){var p=[];$(i.val().split(",")).each(function(){var r=this.split(":");p.push({id:r[1],name:r[1]})});q(p)},initialData:k.join(","),dropdownCssClass:"bigdrop"};this.accessSelectObject=new b.View(h)}else{var n=this.templateAccessSelect();$.get("/api/libraries/datasets/"+e.id+"/permissions",function(i){$(".access_perm").html(n({options:i.roles}));this.accessSelectObject=$("#access_select").select2()}).fail(function(){d.error("An error occurred while fetching data with permissions. :(")})}}).fail(function(){d.error("An error occurred while fetching data with permissions. :(")});$("#center [data-toggle]").tooltip();$("#center").css("overflow","auto")},comingSoon:function(){d.warning("Feature coming soon")},templateDataset:function(){var e=[];e.push('<div class="library_style_container">');e.push('  <div id="library_toolbar">');e.push('   <button data-toggle="tooltip" data-placement="top" title="Download dataset" class="btn btn-default toolbtn-download-dataset primary-button" type="button"><span class="fa fa-download"></span> Download</span></button>');e.push('   <button data-toggle="tooltip" data-placement="top" title="Import dataset into history" class="btn btn-default toolbtn-import-dataset primary-button" type="button"><span class="fa fa-book"></span> to History</span></button>');e.push('   <button data-toggle="tooltip" data-placement="top" title="Modify dataset" class="btn btn-default toolbtn_modify_dataset primary-button" type="button"><span class="fa fa-pencil"></span> Modify</span></button>');e.push('   <a href="#folders/<%- item.get("folder_id") %>/datasets/<%- item.id %>/permissions"><button data-toggle="tooltip" data-placement="top" title="Change permissions" class="btn btn-default toolbtn_change_permissions primary-button" type="button"><span class="fa fa-group"></span> Permissions</span></button></a>');e.push('   <button data-toggle="tooltip" data-placement="top" title="Share dataset" class="btn btn-default toolbtn-share-dataset primary-button" type="button"><span class="fa fa-share"></span> Share</span></button>');e.push("  </div>");e.push('<ol class="breadcrumb">');e.push('   <li><a title="Return to the list of libraries" href="#">Libraries</a></li>');e.push('   <% _.each(item.get("full_path"), function(path_item) { %>');e.push("   <% if (path_item[0] != item.id) { %>");e.push('   <li><a title="Return to this folder" href="#/folders/<%- path_item[0] %>"><%- path_item[1] %></a> </li> ');e.push("<% } else { %>");e.push('   <li class="active"><span title="You are here"><%- path_item[1] %></span></li>');e.push("   <% } %>");e.push("   <% }); %>");e.push("</ol>");e.push('<div class="dataset_table">');e.push('   <table class="grid table table-striped table-condensed">');e.push("       <tr>");e.push('           <th scope="row" id="id_row" data-id="<%= _.escape(item.get("ldda_id")) %>">Name</th>');e.push('           <td><%= _.escape(item.get("name")) %></td>');e.push("       </tr>");e.push('   <% if (item.get("data_type")) { %>');e.push("       <tr>");e.push('           <th scope="row">Data type</th>');e.push('           <td><%= _.escape(item.get("data_type")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("genome_build")) { %>');e.push("       <tr>");e.push('           <th scope="row">Genome build</th>');e.push('           <td><%= _.escape(item.get("genome_build")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("file_size")) { %>');e.push("       <tr>");e.push('           <th scope="row">Size</th>');e.push('           <td><%= _.escape(item.get("file_size")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("date_uploaded")) { %>');e.push("       <tr>");e.push('           <th scope="row">Date uploaded (UTC)</th>');e.push('           <td><%= _.escape(item.get("date_uploaded")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("uploaded_by")) { %>');e.push("       <tr>");e.push('           <th scope="row">Uploaded by</th>');e.push('           <td><%= _.escape(item.get("uploaded_by")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("metadata_data_lines")) { %>');e.push("       <tr>");e.push('           <th scope="row">Data Lines</th>');e.push('           <td scope="row"><%= _.escape(item.get("metadata_data_lines")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("metadata_comment_lines")) { %>');e.push("       <tr>");e.push('           <th scope="row">Comment Lines</th>');e.push('           <td scope="row"><%= _.escape(item.get("metadata_comment_lines")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("metadata_columns")) { %>');e.push("       <tr>");e.push('           <th scope="row">Number of Columns</th>');e.push('           <td scope="row"><%= _.escape(item.get("metadata_columns")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("metadata_column_types")) { %>');e.push("       <tr>");e.push('           <th scope="row">Column Types</th>');e.push('           <td scope="row"><%= _.escape(item.get("metadata_column_types")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("message")) { %>');e.push("       <tr>");e.push('           <th scope="row">Message</th>');e.push('           <td scope="row"><%= _.escape(item.get("message")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("misc_blurb")) { %>');e.push("       <tr>");e.push('           <th scope="row">Miscellaneous blurb</th>');e.push('           <td scope="row"><%= _.escape(item.get("misc_blurb")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push('   <% if (item.get("misc_info")) { %>');e.push("       <tr>");e.push('           <th scope="row">Miscellaneous information</th>');e.push('           <td scope="row"><%= _.escape(item.get("misc_info")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push("    </table>");e.push("    <div>");e.push('        <pre class="peek">');e.push("        </pre>");e.push("    </div>");e.push("</div>");e.push("</div>");return _.template(e.join(""))},templateModifyDataset:function(){var e=[];e.push('<div class="library_style_container">');e.push('  <div id="library_toolbar">');e.push('   <button data-toggle="tooltip" data-placement="top" title="Cancel modifications" class="btn btn-default toolbtn_cancel_modifications primary-button" type="button"><span class="fa fa-times"></span> Cancel</span></button>');e.push('   <button data-toggle="tooltip" data-placement="top" title="Save modifications" class="btn btn-default toolbtn_save_modifications primary-button" type="button"><span class="fa fa-floppy-o"></span> Save</span></button>');e.push("  </div>");e.push('<ol class="breadcrumb">');e.push('   <li><a title="Return to the list of libraries" href="#">Libraries</a></li>');e.push('   <% _.each(item.get("full_path"), function(path_item) { %>');e.push("   <% if (path_item[0] != item.id) { %>");e.push('   <li><a title="Return to this folder" href="#/folders/<%- path_item[0] %>"><%- path_item[1] %></a> </li> ');e.push("<% } else { %>");e.push('   <li class="active"><span title="You are here"><%- path_item[1] %></span></li>');e.push("   <% } %>");e.push("   <% }); %>");e.push("</ol>");e.push('<div class="dataset_table">');e.push('<p>For more editing options please import the dataset to history and use "Edit attributes" on it.</p>');e.push('   <table class="grid table table-striped table-condensed">');e.push("       <tr>");e.push('           <th scope="row" id="id_row" data-id="<%= _.escape(item.get("ldda_id")) %>">Name</th>');e.push('           <td><input class="input_dataset_name form-control" type="text" placeholder="name" value="<%= _.escape(item.get("name")) %>"></td>');e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Data type</th>');e.push('           <td><%= _.escape(item.get("data_type")) %></td>');e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Genome build</th>');e.push('           <td><%= _.escape(item.get("genome_build")) %></td>');e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Size</th>');e.push('           <td><%= _.escape(item.get("file_size")) %></td>');e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Date uploaded (UTC)</th>');e.push('           <td><%= _.escape(item.get("date_uploaded")) %></td>');e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Uploaded by</th>');e.push('           <td><%= _.escape(item.get("uploaded_by")) %></td>');e.push("       </tr>");e.push('           <tr scope="row">');e.push('           <th scope="row">Data Lines</th>');e.push('           <td scope="row"><%= _.escape(item.get("metadata_data_lines")) %></td>');e.push("       </tr>");e.push('       <th scope="row">Comment Lines</th>');e.push('           <% if (item.get("metadata_comment_lines") === "") { %>');e.push('               <td scope="row"><%= _.escape(item.get("metadata_comment_lines")) %></td>');e.push("           <% } else { %>");e.push('               <td scope="row">unknown</td>');e.push("           <% } %>");e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Number of Columns</th>');e.push('           <td scope="row"><%= _.escape(item.get("metadata_columns")) %></td>');e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Column Types</th>');e.push('           <td scope="row"><%= _.escape(item.get("metadata_column_types")) %></td>');e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Message</th>');e.push('           <td scope="row"><%= _.escape(item.get("message")) %></td>');e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Miscellaneous information</th>');e.push('           <td scope="row"><%= _.escape(item.get("misc_info")) %></td>');e.push("       </tr>");e.push("       <tr>");e.push('           <th scope="row">Miscellaneous blurb</th>');e.push('           <td scope="row"><%= _.escape(item.get("misc_blurb")) %></td>');e.push("       </tr>");e.push("   </table>");e.push("<div>");e.push('   <pre class="peek">');e.push("   </pre>");e.push("</div>");e.push("</div>");e.push("</div>");return _.template(e.join(""))},templateDatasetPermissions:function(){var e=[];e.push('<div class="library_style_container">');e.push('  <div id="library_toolbar">');e.push('   <a href="#folders/<%- item.get("folder_id") %>"><button data-toggle="tooltip" data-placement="top" title="Go back to folder" class="btn btn-default primary-button" type="button"><span class="fa fa-folder-open-o"></span> go to Folder</span></button></a>');e.push('   <a href="#folders/<%- item.get("folder_id") %>/datasets/<%- item.id %>"><button data-toggle="tooltip" data-placement="top" title="Go back to dataset" class="btn btn-default primary-button" type="button"><span class="fa fa-file-o"></span> see the Dataset</span></button><a>');e.push("  </div>");e.push('<ol class="breadcrumb">');e.push('   <li><a title="Return to the list of libraries" href="#">Libraries</a></li>');e.push('   <% _.each(item.get("full_path"), function(path_item) { %>');e.push("   <% if (path_item[0] != item.id) { %>");e.push('   <li><a title="Return to this folder" href="#/folders/<%- path_item[0] %>"><%- path_item[1] %></a> </li> ');e.push("<% } else { %>");e.push('   <li class="active"><span title="You are here"><%- path_item[1] %></span></li>');e.push("   <% } %>");e.push("   <% }); %>");e.push("</ol>");e.push('<h1><%= _.escape(item.get("name")) %></h1>');e.push('<div class="alert alert-success">You have rights to change permissions on this dataset. That means you can control who can access it, who can modify it and also appoint others that can manage permissions on it.</div>');e.push('<div class="dataset_table">');e.push("<h2>Basic permissions</h2>");e.push("<p>You can remove all access restrictions on this dataset. ");e.push('<button data-toggle="tooltip" data-placement="top" title="Everybody will be able to see the dataset." class="btn btn-default btn-remove-restrictions primary-button" type="button"><span class="fa fa-globe"></span> Remove restrictions</span></button>');e.push("</p>");e.push("<p>You can make this dataset private to you. ");e.push('<button data-toggle="tooltip" data-placement="top" title="Only you will be able to see the dataset." class="btn btn-default btn-make-private primary-button" type="button"><span class="fa fa-key"></span> Make private</span></button>');e.push("</p>");e.push("<p>You can share this dataset with another Galaxy user. ");e.push('<button data-toggle="tooltip" data-placement="top" title="Only you and the other user will be able to see the dataset." class="btn btn-default btn-share-dataset primary-button" type="button"><span class="fa fa-share"></span> Share</span></button>');e.push("</p>");e.push("<h2>Advanced permissions</h2>");e.push("<p>You can assign any number of roles to any of the following three dataset permission types. However please read carefully the implications of such actions.</p>");e.push("<h3>Access Roles</h3>");e.push('<div class="alert alert-info">User has to have <strong>all these roles</strong> in order to see this dataset.</div>');e.push('<div id="access_perm" class="access_perm roles-selection"></div>');e.push('<button data-toggle="tooltip" data-placement="top" title="Save modifications" class="btn btn-default toolbtn_save_modifications primary-button" type="button"><span class="fa fa-floppy-o"></span> Save</span></button>');e.push("<h3>Modify Roles</h3>");e.push('<div class="alert alert-info">Users with <strong>any</strong> of these roles can modify the information about this dataset.</div>');e.push('<div id="modify_perm" class="modify_perm"></div>');e.push("<h3>Manage Roles</h3>");e.push('<div class="alert alert-info">Users with <strong>any</strong> of these roles can change permissions of this dataset.</div>');e.push('<div id="manage_perm" class="manage_perm"></div>');e.push("</div>");e.push("</div>");return _.template(e.join(""))},templateBulkImportInModal:function(){var e=[];e.push('<span id="history_modal_combo_bulk" style="width:90%; margin-left: 1em; margin-right: 1em; ">');e.push("Select history: ");e.push('<select id="dataset_import_single" name="dataset_import_single" style="width:50%; margin-bottom: 1em; "> ');e.push("   <% _.each(histories, function(history) { %>");e.push('       <option value="<%= _.escape(history.get("id")) %>"><%= _.escape(history.get("name")) %></option>');e.push("   <% }); %>");e.push("</select>");e.push("</span>");return _.template(e.join(""))},templateAccessSelect:function(){var e=[];e.push('<select id="access_select" multiple>');e.push("   <% _.each(options, function(option) { %>");e.push('       <option value="<%- option.name %>"><%- option.name %></option>');e.push("   <% }); %>");e.push("</select>");return _.template(e.join(""))}});return{LibraryDatasetView:a}});