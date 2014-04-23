define([],function(){var f=Backbone.Model.extend({urlRoot:"/api/libraries/",isVisible:function(l){var k=true;if((!l)&&(this.get("deleted"))){k=false}return k}});var i=Backbone.Collection.extend({url:"/api/libraries",model:f,sort_key:"name",sort_order:null,initialize:function(k){k=k||{}},getVisible:function(l,m){m=m||[];var k=new i(this.filter(function(n){return n.isVisible(l)}));return k},sortByNameAsc:function(){this.comparator=function(l,k){if(l.get("name").toLowerCase()>k.get("name").toLowerCase()){return 1}if(k.get("name").toLowerCase()>l.get("name").toLowerCase()){return -1}return 0};this.sort();return this},sortByNameDesc:function(){this.comparator=function(l,k){if(l.get("name").toLowerCase()>k.get("name").toLowerCase()){return -1}if(k.get("name").toLowerCase()>l.get("name").toLowerCase()){return 1}return 0};this.sort();return this}});var g=Backbone.Model.extend({urlRoot:"/api/libraries/datasets"});var a=Backbone.Model.extend({urlRoot:"/api/folders"});var c=Backbone.Collection.extend({model:g,sortByNameAsc:function(){this.comparator=function(l,k){if(l.get("type")===k.get("type")){if(l.get("name").toLowerCase()>k.get("name").toLowerCase()){return 1}if(k.get("name").toLowerCase()>l.get("name").toLowerCase()){return -1}return 0}else{if(l.get("type")==="folder"){return -1}else{return 1}}};this.sort();return this},sortByNameDesc:function(){this.comparator=function(l,k){if(l.get("type")===k.get("type")){if(l.get("name").toLowerCase()>k.get("name").toLowerCase()){return -1}if(k.get("name").toLowerCase()>l.get("name").toLowerCase()){return 1}return 0}else{if(l.get("type")==="folder"){return -1}else{return 1}}};this.sort();return this}});var e=Backbone.Model.extend({defaults:{folder:new c(),urlRoot:"/api/folders/",id:"unknown"},parse:function(k){this.get("folder").reset(k.folder_contents);return k}});var b=Backbone.Model.extend({urlRoot:"/api/histories/"});var d=Backbone.Collection.extend({urlRoot:"/api/histories/",initialize:function(k){this.id=k.id},url:function(){return this.urlRoot+this.id+"/contents"},model:b});var h=Backbone.Model.extend({urlRoot:"/api/histories/"});var j=Backbone.Collection.extend({url:"/api/histories",model:h});return{Library:f,FolderAsModel:a,Libraries:i,Item:g,Folder:c,FolderContainer:e,HistoryItem:b,HistoryContents:d,GalaxyHistory:h,GalaxyHistories:j}});