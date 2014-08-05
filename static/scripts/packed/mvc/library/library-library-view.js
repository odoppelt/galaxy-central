define(["libs/toastr","mvc/library/library-model","mvc/ui/ui-select"],function(d,c,a){var b=Backbone.View.extend({el:"#center",model:null,options:{},events:{"click .toolbtn_save_permissions":"savePermissions"},initialize:function(e){this.options=_.extend(this.options,e);if(this.options.id){this.fetchLibrary()}},fetchLibrary:function(e){this.options=_.extend(this.options,e);this.model=new c.Library({id:this.options.id});var f=this;this.model.fetch({success:function(){if(f.options.show_permissions){f.showPermissions()}else{f.render()}},error:function(h,g){if(typeof g.responseJSON!=="undefined"){d.error(g.responseJSON.err_msg+" Click this to go back.","",{onclick:function(){Galaxy.libraries.library_router.back()}})}else{d.error("An error ocurred :(. Click this to go back.","",{onclick:function(){Galaxy.libraries.library_router.back()}})}}})},render:function(e){$(".tooltip").remove();this.options=_.extend(this.options,e);var f=this.templateLibrary();this.$el.html(f({item:this.model}));$("#center [data-toggle]").tooltip()},shareDataset:function(){d.info("Feature coming soon.")},goBack:function(){Galaxy.libraries.library_router.back()},showPermissions:function(f){this.options=_.extend(this.options,f);$(".tooltip").remove();if(this.options.fetched_permissions!==undefined){if(this.options.fetched_permissions.access_library_role_list.length===0){this.model.set({is_unrestricted:true})}else{this.model.set({is_unrestricted:false})}}var h=false;if(Galaxy.currUser){h=Galaxy.currUser.isAdmin()}var g=this.templateLibraryPermissions();this.$el.html(g({library:this.model,is_admin:h}));var e=this;if(this.options.fetched_permissions===undefined){$.get("/api/libraries/"+e.id+"/permissions?scope=current").done(function(i){e.prepareSelectBoxes({fetched_permissions:i})}).fail(function(){d.error("An error occurred while fetching library permissions. :(")})}else{this.prepareSelectBoxes({})}$("#center [data-toggle]").tooltip();$("#center").css("overflow","auto")},_serializeRoles:function(g){var e=[];for(var f=0;f<g.length;f++){e.push(g[f]+":"+g[f])}return e},prepareSelectBoxes:function(i){this.options=_.extend(this.options,i);var e=this.options.fetched_permissions;var g=this;var f=this._serializeRoles(e.access_library_role_list);var j=this._serializeRoles(e.add_library_item_role_list);var h=this._serializeRoles(e.manage_library_role_list);var k=this._serializeRoles(e.modify_library_role_list);g.accessSelectObject=new a.View(this._createSelectOptions(this,"access_perm",f,true));g.addSelectObject=new a.View(this._createSelectOptions(this,"add_perm",j,false));g.manageSelectObject=new a.View(this._createSelectOptions(this,"manage_perm",h,false));g.modifySelectObject=new a.View(this._createSelectOptions(this,"modify_perm",k,false))},_createSelectOptions:function(f,k,i,e){e=e===true?e:false;var j={minimumInputLength:0,css:k,multiple:true,placeholder:"Click to select a role",container:f.$el.find("#"+k),ajax:{url:"/api/libraries/"+f.id+"/permissions?scope=available&is_library_access="+e,dataType:"json",quietMillis:100,data:function(l,m){return{q:l,page_limit:10,page:m}},results:function(n,m){var l=(m*10)<n.total;return{results:n.roles,more:l}}},formatResult:function g(l){return l.name+" type: "+l.type},formatSelection:function h(l){return l.name},initSelection:function(l,n){var m=[];$(l.val().split(",")).each(function(){var o=this.split(":");m.push({id:o[1],name:o[1]})});n(m)},initialData:i.join(","),dropdownCssClass:"bigdrop"};return j},comingSoon:function(){d.warning("Feature coming soon")},copyToClipboard:function(){var e=Backbone.history.location.href;if(e.lastIndexOf("/permissions")!==-1){e=e.substr(0,e.lastIndexOf("/permissions"))}window.prompt("Copy to clipboard: Ctrl+C, Enter",e)},makeDatasetPrivate:function(){var e=this;$.post("/api/libraries/datasets/"+e.id+"/permissions?action=make_private").done(function(f){e.model.set({is_unrestricted:false});e.showPermissions({fetched_permissions:f});d.success("The dataset is now private to you")}).fail(function(){d.error("An error occurred while making dataset private :(")})},removeDatasetRestrictions:function(){var e=this;$.post("/api/libraries/datasets/"+e.id+"/permissions?action=remove_restrictions").done(function(f){e.model.set({is_unrestricted:true});e.showPermissions({fetched_permissions:f});d.success("Access to this dataset is now unrestricted")}).fail(function(){d.error("An error occurred while making dataset unrestricted :(")})},_extractIds:function(e){ids_list=[];for(var f=e.length-1;f>=0;f--){ids_list.push(e[f].id)}return ids_list},savePermissions:function(h){var g=this;var i=this._extractIds(this.accessSelectObject.$el.select2("data"));var e=this._extractIds(this.addSelectObject.$el.select2("data"));var j=this._extractIds(this.manageSelectObject.$el.select2("data"));var f=this._extractIds(this.modifySelectObject.$el.select2("data"));$.post("/api/libraries/"+g.id+"/permissions?action=set_permissions",{"access_ids[]":i,"add_ids[]":e,"manage_ids[]":j,"modify_ids[]":f,}).done(function(k){g.showPermissions({fetched_permissions:k});d.success("Permissions saved")}).fail(function(){d.error("An error occurred while setting library permissions :(")})},templateLibrary:function(){var e=[];e.push('<div class="library_style_container">');e.push('  <div id="library_toolbar">');e.push('   <button data-toggle="tooltip" data-placement="top" title="Modify library item" class="btn btn-default toolbtn_modify_dataset primary-button" type="button"><span class="fa fa-pencil"></span> Modify</span></button>');e.push('   <a href="#folders/<%- item.get("folder_id") %>/datasets/<%- item.id %>/permissions"><button data-toggle="tooltip" data-placement="top" title="Manage permissions" class="btn btn-default toolbtn_change_permissions primary-button" type="button"><span class="fa fa-group"></span> Permissions</span></button></a>');e.push('   <button data-toggle="tooltip" data-placement="top" title="Share dataset" class="btn btn-default toolbtn-share-dataset primary-button" type="button"><span class="fa fa-share"></span> Share</span></button>');e.push("  </div>");e.push("  <p>");e.push("  This dataset is unrestricted so everybody can access it. Just share the URL of this page. ");e.push('  <button data-toggle="tooltip" data-placement="top" title="Copy to clipboard" class="btn btn-default btn-copy-link-to-clipboard primary-button" type="button"><span class="fa fa-clipboard"></span> To Clipboard</span></button> ');e.push("  </p>");e.push('<div class="dataset_table">');e.push('   <table class="grid table table-striped table-condensed">');e.push("       <tr>");e.push('           <th scope="row" id="id_row" data-id="<%= _.escape(item.get("ldda_id")) %>">Name</th>');e.push('           <td><%= _.escape(item.get("name")) %></td>');e.push("       </tr>");e.push('   <% if (item.get("data_type")) { %>');e.push("       <tr>");e.push('           <th scope="row">Data type</th>');e.push('           <td><%= _.escape(item.get("data_type")) %></td>');e.push("       </tr>");e.push("   <% } %>");e.push("    </table>");e.push("</div>");e.push("</div>");return _.template(e.join(""))},templateLibraryPermissions:function(){var e=[];e.push('<div class="library_style_container">');e.push('  <div id="library_toolbar">');e.push('   <a href="#"><button data-toggle="tooltip" data-placement="top" title="Go back to the list of Libraries" class="btn btn-default primary-button" type="button"><span class="fa fa-list"></span> Libraries</span></button></a>');e.push("  </div>");e.push('<h1>Library: <%= _.escape(library.get("name")) %></h1>');e.push('<div class="alert alert-warning">');e.push("<% if (is_admin) { %>");e.push("You are logged in as an <strong>administrator</strong> therefore you can manage any library on this Galaxy instance. Please make sure you understand the consequences.");e.push("<% } else { %>");e.push("You can assign any number of roles to any of the following permission types. However please read carefully the implications of such actions.");e.push("<% }%>");e.push("</div>");e.push('<div class="dataset_table">');e.push("<h2>Library permissions</h2>");e.push("<h4>Roles that can access the library</h4>");e.push('<div id="access_perm" class="access_perm roles-selection"></div>');e.push('<div class="alert alert-info roles-selection">User with <strong>any</strong> of these roles can access this library. If there are no access roles set on the library it is considered <strong>unrestricted</strong>.</div>');e.push("<h4>Roles that can manage permissions on this library</h4>");e.push('<div id="manage_perm" class="manage_perm roles-selection"></div>');e.push('<div class="alert alert-info roles-selection">User with <strong>any</strong> of these roles can manage permissions on this library (includes giving access).</div>');e.push("<h4>Roles that can add items to this library</h4>");e.push('<div id="add_perm" class="add_perm roles-selection"></div>');e.push('<div class="alert alert-info roles-selection">User with <strong>any</strong> of these roles can add items to this library (folders and datasets).</div>');e.push("<h4>Roles that can modify this library</h4>");e.push('<div id="modify_perm" class="modify_perm roles-selection"></div>');e.push('<div class="alert alert-info roles-selection">User with <strong>any</strong> of these roles can modify this library (name, synopsis, etc.).</div>');e.push('<button data-toggle="tooltip" data-placement="top" title="Save modifications made on this page" class="btn btn-default toolbtn_save_permissions primary-button" type="button"><span class="fa fa-floppy-o"></span> Save</span></button>');e.push("</div>");e.push("</div>");return _.template(e.join(""))}});return{LibraryView:b}});