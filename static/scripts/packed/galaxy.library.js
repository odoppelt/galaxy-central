define(["galaxy.masthead","utils/utils","libs/toastr","mvc/base-mvc","mvc/library/library-model","mvc/library/library-folderlist-view","mvc/library/library-librarylist-view","mvc/library/library-librarytoolbar-view","mvc/library/library-foldertoolbar-view","mvc/library/library-dataset-view","mvc/library/library-library-view","mvc/library/library-folder-view"],function(h,e,j,n,k,c,i,g,l,f,b,a){var o=Backbone.Router.extend({initialize:function(){this.routesHit=0;Backbone.history.on("route",function(){this.routesHit++},this)},routes:{"":"libraries","library/:library_id/permissions":"library_permissions","folders/:folder_id/permissions":"folder_permissions","folders/:id":"folder_content","folders/:folder_id/datasets/:dataset_id":"dataset_detail","folders/:folder_id/datasets/:dataset_id/permissions":"dataset_permissions","folders/:folder_id/download/:format":"download"},back:function(){if(this.routesHit>1){window.history.back()}else{this.navigate("#",{trigger:true,replace:true})}}});var m=n.SessionStorageModel.extend({defaults:{with_deleted:false,sort_order:"asc",sort_by:"name"}});var d=Backbone.View.extend({libraryToolbarView:null,libraryListView:null,library_router:null,libraryView:null,folderToolbarView:null,folderListView:null,datasetView:null,initialize:function(){Galaxy.libraries=this;this.preferences=new m({id:"global-lib-prefs"});this.library_router=new o();this.library_router.on("route:libraries",function(){Galaxy.libraries.libraryToolbarView=new g.LibraryToolbarView();Galaxy.libraries.libraryListView=new i.LibraryListView()});this.library_router.on("route:folder_content",function(p){if(Galaxy.libraries.folderToolbarView){Galaxy.libraries.folderToolbarView.$el.unbind("click")}Galaxy.libraries.folderToolbarView=new l.FolderToolbarView({id:p});Galaxy.libraries.folderListView=new c.FolderListView({id:p})});this.library_router.on("route:download",function(p,q){if($("#folder_list_body").find(":checked").length===0){j.info("You have to select some datasets to download");Galaxy.libraries.library_router.navigate("folders/"+p,{trigger:true,replace:true})}else{Galaxy.libraries.folderToolbarView.download(p,q);Galaxy.libraries.library_router.navigate("folders/"+p,{trigger:false,replace:true})}});this.library_router.on("route:dataset_detail",function(q,p){if(Galaxy.libraries.datasetView){Galaxy.libraries.datasetView.$el.unbind("click")}Galaxy.libraries.datasetView=new f.LibraryDatasetView({id:p})});this.library_router.on("route:dataset_permissions",function(q,p){if(Galaxy.libraries.datasetView){Galaxy.libraries.datasetView.$el.unbind("click")}Galaxy.libraries.datasetView=new f.LibraryDatasetView({id:p,show_permissions:true})});this.library_router.on("route:library_permissions",function(p){if(Galaxy.libraries.libraryView){Galaxy.libraries.libraryView.$el.unbind("click")}Galaxy.libraries.libraryView=new b.LibraryView({id:p,show_permissions:true})});this.library_router.on("route:folder_permissions",function(p){if(Galaxy.libraries.folderView){Galaxy.libraries.folderView.$el.unbind("click")}Galaxy.libraries.folderView=new a.FolderView({id:p,show_permissions:true})});Backbone.history.start({pushState:false})}});return{GalaxyApp:d}});