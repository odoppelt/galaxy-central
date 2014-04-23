define(["galaxy.masthead","utils/utils","libs/toastr","mvc/library/library-model","mvc/library/library-folderrow-view"],function(c,e,f,d,a){var b=Backbone.View.extend({el:"#folder_items_element",progress:0,progressStep:1,modal:null,folderContainer:null,sort:"asc",events:{"click #select-all-checkboxes":"selectAll","click .dataset_row":"selectClickedRow","click .sort-folder-link":"sort_clicked"},initialize:function(g){var h=this;this.options=_.defaults(this.options||{},g);this.collection=new d.Folder();this.listenTo(this.collection,"add",this.addOne);this.folderContainer=new d.FolderContainer({id:this.options.id});this.folderContainer.url=this.folderContainer.attributes.urlRoot+this.options.id+"/contents";this.folderContainer.fetch({success:function(i){h.render();var j=i.get("folder").models;h.addAll(j)},error:function(j,i){if(typeof i.responseJSON!=="undefined"){f.error(i.responseJSON.err_msg)}else{f.error("An error ocurred :(")}}})},render:function(g){this.options=_.defaults(this.options||{},g);var i=this.templateFolder();var j=this.folderContainer.attributes.metadata.full_path;var k;if(j.length===1){k=0}else{k=j[j.length-2][0]}this.$el.html(i({path:this.folderContainer.attributes.metadata.full_path,id:this.options.id,upper_folder_id:k,order:this.sort}));var h=this.folderContainer.attributes.metadata;h.contains_file=this.options.contains_file;Galaxy.libraries.folderToolbarView.configureElements(h);$("#center [data-toggle]").tooltip();$("#center").css("overflow","auto")},addAll:function(g){_.each(g.reverse(),function(h){Galaxy.libraries.folderListView.collection.add(h)});this.checkEmptiness()},addOne:function(h){if(h.get("data_type")!=="folder"){this.options.contains_file=true;h.set("readable_size",this.size_to_string(h.get("file_size")))}var g=new a.FolderRowView(h);this.$el.find("#first_folder_item").after(g.el);this.checkEmptiness()},checkEmptiness:function(){if((this.$el.find(".dataset_row").length===0)&&(this.$el.find(".folder_row").length===0)){var g=this.templateEmptyFolder();this.$el.find("#folder_list_body").append(g())}else{this.$el.find("#empty_folder_message").remove()}},sort_clicked:function(g){g.preventDefault();if(this.sort==="asc"){this.sortFolder("name","desc");this.sort="desc"}else{this.sortFolder("name","asc");this.sort="asc"}this.render()},sortFolder:function(h,g){if(h==="name"){if(g==="asc"){this.collection.sortByNameAsc()}else{if(g==="desc"){this.collection.sortByNameDesc()}}}},size_to_string:function(g){var h="";if(g>=100000000000){g=g/100000000000;h="TB"}else{if(g>=100000000){g=g/100000000;h="GB"}else{if(g>=100000){g=g/100000;h="MB"}else{if(g>=100){g=g/100;h="KB"}else{g=g*10;h="b"}}}}return(Math.round(g)/10)+h},selectAll:function(h){var g=h.target.checked;that=this;$(":checkbox").each(function(){this.checked=g;$row=$(this.parentElement.parentElement);if(g){that.makeDarkRow($row)}else{that.makeWhiteRow($row)}})},selectClickedRow:function(h){var j="";var g;var i;if(h.target.localName==="input"){j=h.target;g=$(h.target.parentElement.parentElement);i="input"}else{if(h.target.localName==="td"){j=$("#"+h.target.parentElement.id).find(":checkbox")[0];g=$(h.target.parentElement);i="td"}}if(j.checked){if(i==="td"){j.checked="";this.makeWhiteRow(g)}else{if(i==="input"){this.makeDarkRow(g)}}}else{if(i==="td"){j.checked="selected";this.makeDarkRow(g)}else{if(i==="input"){this.makeWhiteRow(g)}}}},makeDarkRow:function(g){g.removeClass("light");g.find("a").removeClass("light");g.addClass("dark");g.find("a").addClass("dark");g.find("span").removeClass("fa-file-o");g.find("span").addClass("fa-file")},makeWhiteRow:function(g){g.removeClass("dark");g.find("a").removeClass("dark");g.addClass("light");g.find("a").addClass("light");g.find("span").addClass("fa-file-o");g.find("span").removeClass("fa-file")},templateFolder:function(){var g=[];g.push('<ol class="breadcrumb">');g.push('   <li><a title="Return to the list of libraries" href="#">Libraries</a></li>');g.push("   <% _.each(path, function(path_item) { %>");g.push("   <% if (path_item[0] != id) { %>");g.push('   <li><a title="Return to this folder" href="#/folders/<%- path_item[0] %>"><%- path_item[1] %></a> </li> ');g.push("<% } else { %>");g.push('   <li class="active"><span title="You are in this folder"><%- path_item[1] %></span></li>');g.push("   <% } %>");g.push("   <% }); %>");g.push("</ol>");g.push('<table id="folder_table" class="grid table table-condensed">');g.push("   <thead>");g.push('       <th class="button_heading"></th>');g.push('       <th style="text-align: center; width: 20px; " title="Check to select all datasets"><input id="select-all-checkboxes" style="margin: 0;" type="checkbox"></th>');g.push('       <th><a class="sort-folder-link" title="Click to reverse order" href="#">name</a> <span title="Sorted alphabetically" class="fa fa-sort-alpha-<%- order %>"></span></th>');g.push("       <th>data type</th>");g.push("       <th>size</th>");g.push("       <th>time updated (UTC)</th>");g.push("   </thead>");g.push('   <tbody id="folder_list_body">');g.push('       <tr id="first_folder_item">');g.push('           <td><a href="#<% if (upper_folder_id !== 0){ print("folders/" + upper_folder_id)} %>" title="Go to parent folder" class="btn_open_folder btn btn-default btn-xs">..<a></td>');g.push("           <td></td>");g.push("           <td></td>");g.push("           <td></td>");g.push("           <td></td>");g.push("           <td></td>");g.push("       </tr>");g.push("   </tbody>");g.push("</table>");return _.template(g.join(""))},templateEmptyFolder:function(){var g=[];g.push('<tr id="empty_folder_message">');g.push('<td colspan="6" style="text-align:center">');g.push("This folder is either empty or you do not have proper access permissions to see the contents.");g.push("</td>");g.push("</tr>");return _.template(g.join(""))}});return{FolderListView:b}});