define(["utils/utils"],function(b){var a=Backbone.View.extend({initialize:function(g){this.optionsDefault={visible:true,data:[],id:b.uuid(),error_text:"No data available.",wait_text:"Please wait..."};this.options=b.merge(g,this.optionsDefault);this.setElement('<div class="ui-options"/>');this.$message=$("<div/>");this.$options=$(this._template(g));this.$el.append(this.$message);this.$el.append(this.$options);if(!this.options.visible){this.$el.hide()}this.update(this.options.data);if(this.options.value!==undefined){this.value(this.options.value)}var f=this;this.on("change",function(){f._change()})},update:function(g){var j=this._getValue();this.$options.empty();if(this._templateOptions){this.$options.append(this._templateOptions(g))}else{for(var h in g){var i=$(this._templateOption(g[h]));i.addClass("ui-option");i.tooltip({title:g[h].tooltip,placement:"bottom"});this.$options.append(i)}}var f=this;this.$el.find("input").on("change",function(){f.value(f._getValue());f._change()});this._refresh();this.value(j)},value:function(g){if(g!==undefined){if(!(g instanceof Array)){g=[g]}this.$el.find("input").prop("checked",false);for(var f in g){this.$el.find('input[value="'+g[f]+'"]').first().prop("checked",true)}}return this._getValue()},exists:function(g){if(g!==undefined){if(!(g instanceof Array)){g=[g]}for(var f in g){if(this.$el.find('input[value="'+g[f]+'"]').length>0){return true}}}return false},first:function(){var f=this.$el.find("input");if(f.length>0){return f.val()}else{return undefined}},validate:function(){return b.validate(this.value())},wait:function(){if(this._size()==0){this._messageShow(this.options.wait_text,"info");this.$options.hide()}},unwait:function(){this._messageHide();this._refresh()},_change:function(){if(this.options.onchange){this.options.onchange(this._getValue())}},_refresh:function(){if(this._size()==0){this._messageShow(this.options.error_text,"danger");this.$options.hide()}else{this._messageHide();this.$options.css("display","inline-block")}},_getValue:function(){var g=this.$el.find(":checked");if(g.length==0){return"__null__"}if(this.options.multiple){var f=[];g.each(function(){f.push($(this).val())});return f}else{return g.val()}},_size:function(){return this.$el.find(".ui-option").length},_messageShow:function(g,f){this.$message.show();this.$message.removeClass();this.$message.addClass("ui-message alert alert-"+f);this.$message.html(g)},_messageHide:function(){this.$message.hide()},_template:function(){return'<div class="ui-options-input"/>'}});var d={};d.View=a.extend({initialize:function(f){a.prototype.initialize.call(this,f)},_templateOption:function(f){return'<div><input type="radio" name="'+this.options.id+'" value="'+f.value+'"/>'+f.label+"<br></div>"}});var c={};c.View=a.extend({initialize:function(f){f.multiple=true;a.prototype.initialize.call(this,f)},_templateOption:function(f){return'<div><input type="checkbox" name="'+this.options.id+'" value="'+f.value+'"/>'+f.label+"<br></div>"}});var e={};e.View=a.extend({initialize:function(f){a.prototype.initialize.call(this,f)},value:function(f){if(f!==undefined){this.$el.find("input").prop("checked",false);this.$el.find("label").removeClass("active");this.$el.find('[value="'+f+'"]').prop("checked",true).closest("label").addClass("active")}return this._getValue()},_templateOption:function(g){var f='<label class="btn btn-default">';if(g.icon){f+='<i class="fa '+g.icon+'"/>'}f+='<input type="radio" name="'+this.options.id+'" value="'+g.value+'">'+g.label+"</label>";return f},_template:function(){return'<div class="btn-group ui-radiobutton" data-toggle="buttons"/>'}});return{Base:a,Radio:d,RadioButton:e,Checkbox:c}});