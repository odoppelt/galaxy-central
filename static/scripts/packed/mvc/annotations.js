var AnnotationEditor=Backbone.View.extend(LoggableMixin).extend(HiddenUntilActivatedViewMixin).extend({tagName:"div",className:"annotation-display",initialize:function(a){a=a||{};this.tooltipConfig=a.tooltipConfig||{placement:"bottom"};this.listenTo(this.model,"change:annotation",function(){this.render()});this.hiddenUntilActivated(a.$activator,a)},render:function(){var a=this;this.$el.html(this._template());this.$el.find("[title]").tooltip(this.tooltipConfig);this.$annotation().make_text_editable({use_textarea:true,on_finish:function(b){a.$annotation().text(b);a.model.save({annotation:b},{silent:true}).fail(function(){a.$annotation().text(a.model.previous("annotation"))})}});return this},_template:function(){var a=this.model.get("annotation");return['<label class="prompt">',_l("Annotation"),"</label>",'<div class="annotation" title="',_l("Edit annotation"),'">',a,"</div>"].join("")},$annotation:function(){return this.$el.find(".annotation")},remove:function(){this.$annotation.off();this.stopListening(this.model);Backbone.View.prototype.remove.call(this)},toString:function(){return["AnnotationEditor(",this.model+"",")"].join("")}});