var ui=null;var view=null;var browser_router=null;require(["utils/utils","libs/jquery/jquery.event.drag","libs/jquery/jquery.event.hover","libs/jquery/jquery.mousewheel","libs/jquery/jquery-ui","libs/jquery/select2","libs/farbtastic","libs/jquery/jquery.form","libs/jquery/jquery.rating"],function(b,a){b.cssLoadFile("static/style/jquery.rating.css");b.cssLoadFile("static/style/autocomplete_tagging.css");b.cssLoadFile("static/style/jquery-ui/smoothness/jquery-ui.css");b.cssLoadFile("static/style/library.css");b.cssLoadFile("static/style/trackster.css")});define(["libs/underscore","base","viz/trackster/tracks","viz/visualization","mvc/ui/icon-button"],function(b,f,a,d,c){var e=f.Base.extend({initialize:function(h){this.baseURL=h},save_viz:function(){Galaxy.modal.show({title:"Saving...",body:"progress"});var h=[];$(".bookmark").each(function(){h.push({position:$(this).children(".position").text(),annotation:$(this).children(".annotation").text()})});var j=(view.overview_drawable?view.overview_drawable.config.get_value("name"):null),k={view:view.to_dict(),viewport:{chrom:view.chrom,start:view.low,end:view.high,overview:j},bookmarks:h};return $.ajax({url:galaxy_config.root+"visualization/save",type:"POST",dataType:"json",data:{id:view.vis_id,title:view.config.get_value("name"),dbkey:view.dbkey,type:"trackster",vis_json:JSON.stringify(k)}}).success(function(l){Galaxy.modal.hide();view.vis_id=l.vis_id;view.has_changes=false;window.history.pushState({},"",l.url+window.location.hash)}).error(function(){Galaxy.modal.show({title:"Could Not Save",body:"Could not save visualization. Please try again later.",buttons:{Cancel:function(){Galaxy.modal.hide()}}})})},createButtonMenu:function(){var h=this,j=c.create_icon_buttons_menu([{icon_class:"plus-button",title:"Add tracks",on_click:function(){d.select_datasets(galaxy_config.root+"visualization/list_current_history_datasets",galaxy_config.root+"api/datasets",{"f-dbkey":view.dbkey},function(k){b.each(k,function(l){view.add_drawable(a.object_from_template(l,view,view))})})}},{icon_class:"block--plus",title:"Add group",on_click:function(){view.add_drawable(new a.DrawableGroup(view,view,{name:"New Group"}))}},{icon_class:"bookmarks",title:"Bookmarks",on_click:function(){force_right_panel(($("div#right").css("right")=="0px"?"hide":"show"))}},{icon_class:"globe",title:"Circster",on_click:function(){window.location=h.baseURL+"visualization/circster?id="+view.vis_id}},{icon_class:"disk--arrow",title:"Save",on_click:function(){h.save_viz()}},{icon_class:"cross-circle",title:"Close",on_click:function(){h.handle_unsaved_changes(view)}}],{tooltip_config:{placement:"bottom"}});this.buttonMenu=j;return j},add_bookmarks:function(){var h=this,j=this.baseURL;Galaxy.modal.show({title:"Select dataset for new bookmarks",body:"progress"});$.ajax({url:this.baseURL+"/visualization/list_histories",data:{"f-dbkey":view.dbkey},error:function(){alert("Grid failed")},success:function(k){Galaxy.modal.show({title:"Select dataset for new bookmarks",body:k,buttons:{Cancel:function(){Galaxy.modal.hide()},Insert:function(){$("input[name=id]:checked,input[name=ldda_ids]:checked").first().each(function(){var l,m=$(this).val();if($(this).attr("name")==="id"){l={hda_id:m}}else{l={ldda_id:m}}$.ajax({url:this.baseURL+"/visualization/bookmarks_from_dataset",data:l,dataType:"json"}).then(function(n){for(i=0;i<n.data.length;i++){var o=n.data[i];h.add_bookmark(o[0],o[1])}})});Galaxy.modal.hide()}}})}})},add_bookmark:function(m,k,h){var o=$("#right .unified-panel-body"),q=$("<div/>").addClass("bookmark").appendTo(o);var r=$("<div/>").addClass("position").appendTo(q),n=$("<a href=''/>").text(m).appendTo(r).click(function(){view.go_to(m);return false}),l=$("<div/>").text(k).appendTo(q);if(h){var p=$("<div/>").addClass("delete-icon-container").prependTo(q).click(function(){q.slideUp("fast");q.remove();view.has_changes=true;return false}),j=$("<a href=''/>").addClass("icon-button delete").appendTo(p);l.make_text_editable({num_rows:3,use_textarea:true,help_text:"Edit bookmark note"}).addClass("annotation")}view.has_changes=true;return q},create_visualization:function(n,h,m,o,l){var k=this,j=new a.TracksterView(b.extend(n,{header:false}));j.editor=true;$.when(j.load_chroms_deferred).then(function(z){if(h){var x=h.chrom,p=h.start,u=h.end,r=h.overview;if(x&&(p!==undefined)&&u){j.change_chrom(x,p,u)}else{j.change_chrom(z[0].chrom)}}else{j.change_chrom(z[0].chrom)}if(m){var s,q,t;for(var v=0;v<m.length;v++){j.add_drawable(a.object_from_template(m[v],j,j))}}var y;for(var v=0;v<j.drawables.length;v++){if(j.drawables[v].config.get_value("name")===r){j.set_overview(j.drawables[v]);break}}if(o){var w;for(var v=0;v<o.length;v++){w=o[v];k.add_bookmark(w.position,w.annotation,l)}}j.has_changes=false});this.set_up_router({view:j});return j},set_up_router:function(h){new d.TrackBrowserRouter(h);Backbone.history.start()},init_keyboard_nav:function(h){$(document).keyup(function(j){if($(j.srcElement).is(":input")){return}switch(j.which){case 37:h.move_fraction(0.25);break;case 38:var k=Math.round(h.viewport_container.height()/15);h.viewport_container.scrollTop(h.viewport_container.scrollTop()-20);break;case 39:h.move_fraction(-0.25);break;case 40:var k=Math.round(h.viewport_container.height()/15);h.viewport_container.scrollTop(h.viewport_container.scrollTop()+20);break}})},handle_unsaved_changes:function(h){if(h.has_changes){var j=this;Galaxy.modal.show({title:"Close visualization",body:"There are unsaved changes to your visualization which will be lost if you do not save them.",buttons:{Cancel:function(){Galaxy.modal.hide()},"Leave without Saving":function(){$(window).off("beforeunload");window.location=galaxy_config.root+"visualization"},Save:function(){$.when(j.save_viz()).then(function(){window.location=galaxy_config.root+"visualization"})}}})}else{window.location=galaxy_config.root+"visualization"}}});var g=f.Backbone.View.extend({initialize:function(){ui=new e(galaxy_config.root);ui.createButtonMenu();ui.buttonMenu.$el.attr("style","float: right");$("#center .unified-panel-header-inner").append(ui.buttonMenu.$el);$("#right .unified-panel-title").append("Bookmarks");$("#right .unified-panel-icons").append("<a id='add-bookmark-button' class='icon-button menu-button plus-button' href='javascript:void(0);' title='Add bookmark'></a>");$("#right-border").click(function(){view.resize_window()});force_right_panel("hide");if(galaxy_config.app.id){this.view_existing()}else{this.view_new()}},view_existing:function(){var h=galaxy_config.app.viz_config;view=ui.create_visualization({container:$("#center .unified-panel-body"),name:h.title,vis_id:h.vis_id,dbkey:h.dbkey},h.viewport,h.tracks,h.bookmarks,true);this.init_editor()},view_new:function(){var h=this;$.ajax({url:galaxy_config.root+"api/genomes?chrom_info=True",data:{},error:function(){alert("Couldn't create new browser.")},success:function(j){Galaxy.modal.show({title:"New Visualization",body:h.template_view_new(j),buttons:{Cancel:function(){window.location=galaxy_config.root+"visualization/list"},Create:function(){h.create_browser($("#new-title").val(),$("#new-dbkey").val());Galaxy.modal.hide()}}});if(galaxy_config.app.default_dbkey){$("#new-dbkey").val(galaxy_config.app.default_dbkey)}$("#new-title").focus();$("select[name='dbkey']").select2();$("#overlay").css("overflow","auto")}})},template_view_new:function(h){var k='<form id="new-browser-form" action="javascript:void(0);" method="post" onsubmit="return false;"><div class="form-row"><label for="new-title">Browser name:</label><div class="form-row-input"><input type="text" name="title" id="new-title" value="Unnamed"></input></div><div style="clear: both;"></div></div><div class="form-row"><label for="new-dbkey">Reference genome build (dbkey): </label><div class="form-row-input"><select name="dbkey" id="new-dbkey">';for(var j=0;j<h.length;j++){k+='<option value="'+h[j][1]+'">'+h[j][0]+"</option>"}k+='</select></div><div style="clear: both;"></div></div><div class="form-row">Is the build not listed here? <a href="'+galaxy_config.root+'user/dbkeys?use_panels=True">Add a Custom Build</a></div></form>';return k},create_browser:function(j,h){$(document).trigger("convert_to_values");view=ui.create_visualization({container:$("#center .unified-panel-body"),name:j,dbkey:h},galaxy_config.app.gene_region);this.init_editor();view.editor=true},init_editor:function(){$("#center .unified-panel-title").text(view.config.get_value("name")+" ("+view.dbkey+")");if(galaxy_config.app.add_dataset){$.ajax({url:galaxy_config.root+"api/datasets/"+galaxy_config.app.add_dataset,data:{hda_ldda:"hda",data_type:"track_config"},dataType:"json",success:function(h){view.add_drawable(a.object_from_template(h,view,view))}})}$("#add-bookmark-button").click(function(){var j=view.chrom+":"+view.low+"-"+view.high,h="Bookmark description";return ui.add_bookmark(j,h,true)});ui.init_keyboard_nav(view);$(window).on("beforeunload",function(){if(view.has_changes){return"There are unsaved changes to your visualization that will be lost if you leave this page."}})}});return{TracksterUI:e,GalaxyApp:g}});