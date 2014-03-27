define(["mvc/dataset/hda-model","mvc/dataset/hda-base","mvc/tags","mvc/annotations"],function(f,b,a,e){var g=b.HDABaseView.extend({initialize:function(h){b.HDABaseView.prototype.initialize.call(this,h);this.hasUser=h.hasUser;this.defaultPrimaryActionButtonRenderers=[this._render_showParamsButton,this._render_rerunButton];this.tagsEditorShown=h.tagsEditorShown||false;this.annotationEditorShown=h.annotationEditorShown||false},_render_titleButtons:function(){return b.HDABaseView.prototype._render_titleButtons.call(this).concat([this._render_editButton(),this._render_deleteButton()])},_render_editButton:function(){if((this.model.get("state")===f.HistoryDatasetAssociation.STATES.NEW)||(this.model.get("state")===f.HistoryDatasetAssociation.STATES.DISCARDED)||(this.model.get("state")===f.HistoryDatasetAssociation.STATES.NOT_VIEWABLE)||(!this.model.get("accessible"))){return null}var j=this.model.get("purged"),h=this.model.get("deleted"),i={title:_l("Edit attributes"),href:this.urls.edit,target:this.linkTarget,classes:"dataset-edit"};if(h||j){i.disabled=true;if(j){i.title=_l("Cannot edit attributes of datasets removed from disk")}else{if(h){i.title=_l("Undelete dataset to edit attributes")}}}else{if(this.model.get("state")===f.HistoryDatasetAssociation.STATES.UPLOAD){i.disabled=true;i.title=_l("This dataset must finish uploading before it can be edited")}}i.faIcon="fa-pencil";return faIconButton(i)},_render_deleteButton:function(){if((this.model.get("state")===f.HistoryDatasetAssociation.STATES.NEW)||(this.model.get("state")===f.HistoryDatasetAssociation.STATES.NOT_VIEWABLE)||(!this.model.get("accessible"))){return null}var h=this,i={title:_l("Delete"),classes:"dataset-delete",onclick:function(){h.$el.find(".icon-btn.dataset-delete").trigger("mouseout");h.model["delete"]()}};if(this.model.get("deleted")||this.model.get("purged")){i={title:_l("Dataset is already deleted"),disabled:true}}i.faIcon="fa-times";return faIconButton(i)},_render_errButton:function(){if(this.model.get("state")!==f.HistoryDatasetAssociation.STATES.ERROR){return null}return faIconButton({title:_l("View or report this error"),href:this.urls.report_error,classes:"dataset-report-error-btn",target:this.linkTarget,faIcon:"fa-bug"})},_render_rerunButton:function(){return faIconButton({title:_l("Run this job again"),href:this.urls.rerun,classes:"dataset-rerun-btn",target:this.linkTarget,faIcon:"fa-refresh"})},_render_visualizationsButton:function(){var h=this.model.get("visualizations");if((!this.hasUser)||(!this.model.hasData())||(_.isEmpty(h))){return null}if(_.isObject(h[0])){return this._render_visualizationsFrameworkButton(h)}if(!this.urls.visualization){return null}var j=this.model.get("dbkey"),n=this.urls.visualization,k={},o={dataset_id:this.model.get("id"),hda_ldda:"hda"};if(j){o.dbkey=j}var i=faIconButton({title:_l("Visualize"),classes:"dataset-visualize-btn",faIcon:"fa-bar-chart-o"});function l(p){if(p==="trackster"){return c(n,o,j)}return function(){Galaxy.frame.add({title:"Visualization",type:"url",content:n+"/"+p+"?"+$.param(o)})}}function m(p){return p.charAt(0).toUpperCase()+p.slice(1)}if(h.length===1){i.attr("data-original-title",_l("Visualize in ")+_l(m(h[0])));i.click(l(h[0]))}else{_.each(h,function(p){k[_l(m(p))]=l(p)});make_popupmenu(i,k)}return i},_render_visualizationsFrameworkButton:function(h){if(!(this.model.hasData())||!(h&&!_.isEmpty(h))){return null}var j=faIconButton({title:_l("Visualize"),classes:"dataset-visualize-btn",faIcon:"fa-bar-chart-o"});if(h.length===1){var i=h[0];j.attr("data-original-title",_l("Visualize in ")+i.html);j.attr("href",i.href)}else{var k=[];_.each(h,function(l){l.func=function(m){if(Galaxy.frame&&Galaxy.frame.active){Galaxy.frame.add({title:"Visualization",type:"url",content:l.href});m.preventDefault();return false}return true};k.push(l);return false});PopupMenu.create(j,k)}return j},_buildNewRender:function(){var h=b.HDABaseView.prototype._buildNewRender.call(this);h.find(".dataset-deleted-msg").append(_l('Click <a href="javascript:void(0);" class="dataset-undelete">here</a> to undelete it or <a href="javascript:void(0);" class="dataset-purge">here</a> to immediately remove it from disk'));h.find(".dataset-hidden-msg").append(_l('Click <a href="javascript:void(0);" class="dataset-unhide">here</a> to unhide it'));return h},_render_body_failed_metadata:function(){var i=$("<a/>").attr({href:this.urls.edit,target:this.linkTarget}).text(_l("set it manually or retry auto-detection")),h=$("<span/>").text(". "+_l("You may be able to")+" ").append(i),j=b.HDABaseView.prototype._render_body_failed_metadata.call(this);j.find(".warningmessagesmall strong").append(h);return j},_render_body_error:function(){var h=b.HDABaseView.prototype._render_body_error.call(this);h.find(".dataset-actions .left").prepend(this._render_errButton());return h},_render_body_ok:function(){var h=b.HDABaseView.prototype._render_body_ok.call(this);if(this.model.isDeletedOrPurged()){return h}this.makeDbkeyEditLink(h);if(this.hasUser){h.find(".dataset-actions .left").append(this._render_visualizationsButton());this._renderTags(h);this._renderAnnotation(h)}return h},_renderTags:function(h){var i=this;this.tagsEditor=new a.TagsEditor({model:this.model,el:h.find(".tags-display"),onshowFirstTime:function(){this.render()},onshow:function(){i.tagsEditorShown=true},onhide:function(){i.tagsEditorShown=false},$activator:faIconButton({title:_l("Edit dataset tags"),classes:"dataset-tag-btn",faIcon:"fa-tags"}).appendTo(h.find(".dataset-actions .right"))});if(this.tagsEditorShown){this.tagsEditor.toggle(true)}},_renderAnnotation:function(h){var i=this;this.annotationEditor=new e.AnnotationEditor({model:this.model,el:h.find(".annotation-display"),onshowFirstTime:function(){this.render()},onshow:function(){i.annotationEditorShown=true},onhide:function(){i.annotationEditorShown=false},$activator:faIconButton({title:_l("Edit dataset annotation"),classes:"dataset-annotate-btn",faIcon:"fa-comment"}).appendTo(h.find(".dataset-actions .right"))});if(this.annotationEditorShown){this.annotationEditor.toggle(true)}},makeDbkeyEditLink:function(i){if(this.model.get("metadata_dbkey")==="?"&&!this.model.isDeletedOrPurged()){var h=$('<a class="value">?</a>').attr("href",this.urls.edit).attr("target",this.linkTarget);i.find(".dataset-dbkey .value").replaceWith(h)}},events:_.extend(_.clone(b.HDABaseView.prototype.events),{"click .dataset-undelete":function(h){this.model.undelete();return false},"click .dataset-unhide":function(h){this.model.unhide();return false},"click .dataset-purge":"confirmPurge"}),confirmPurge:function d(h){this.model.purge();return false},toString:function(){var h=(this.model)?(this.model+""):("(no model)");return"HDAView("+h+")"}});function c(h,j,i){return function(){var k={};if(i){k["f-dbkey"]=i}$.ajax({url:h+"/list_tracks?"+$.param(k),dataType:"html",error:function(){alert(("Could not add this dataset to browser")+".")},success:function(l){var m=window.parent;m.Galaxy.modal.show({title:"View Data in a New or Saved Visualization",buttons:{Cancel:function(){m.Galaxy.modal.hide()},"View in saved visualization":function(){m.Galaxy.modal.show({title:"Add Data to Saved Visualization",body:l,buttons:{Cancel:function(){m.Galaxy.modal.hide()},"Add to visualization":function(){$(m.document).find("input[name=id]:checked").each(function(){m.Galaxy.modal.hide();var n=$(this).val();j.id=n;m.Galaxy.frame.add({title:"Trackster",type:"url",content:h+"/trackster?"+$.param(j)})})}}})},"View in new visualization":function(){m.Galaxy.modal.hide();var n=h+"/trackster?"+$.param(j);m.Galaxy.frame.add({title:"Trackster",type:"url",content:n})}}})}});return false}}return{HDAEditView:g}});