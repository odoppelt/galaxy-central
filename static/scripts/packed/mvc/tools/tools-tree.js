define([],function(){return Backbone.Model.extend({initialize:function(a){this.app=a},refresh:function(){this.dict={};this.xml=$("<div/>");if(!this.app.section){return{}}this._iterate(this.app.section.$el,this.dict,this.xml)},finalize:function(d){d=d||{};var a=this;this.job_def={};this.job_ids={};function c(g,f,e){a.job_def[g]=e;a.job_ids[g]=f}function b(l,o){for(var j in o){var g=o[j];if(g.input){var q=g.input;var k=l;if(l!=""){k+="|"}k+=q.name;switch(q.type){case"repeat":var f="section-";var t=[];var n=null;for(var s in g){var m=s.indexOf(f);if(m!=-1){m+=f.length;t.push(parseInt(s.substr(m)));if(!n){n=s.substr(0,m)}}}t.sort(function(u,i){return u-i});var j=0;for(var h in t){b(k+"_"+j++,g[n+t[h]])}break;case"conditional":var r=a.app.field_list[q.id].value();if(d[q.test_param.type]){r=d[q.test_param.type](r)}c(k+"|"+q.test_param.name,q.id,r);var e=a.matchCase(q,r);if(e!=-1){b(k,o[q.id+"-section-"+e])}break;default:var p=a.app.field_list[q.id];var r=p.value();if(d[q.type]){r=d[q.type](r)}if(!p.skip){if(q.optional&&p.validate&&!p.validate()){r=null}c(k,q.id,r)}}}}}b("",this.dict);return this.job_def},match:function(a){return this.job_ids&&this.job_ids[a]},matchCase:function(a,c){if(a.test_param.type=="boolean"){if(c=="true"){c=a.test_param.truevalue||"true"}else{c=a.test_param.falsevalue||"false"}}for(var b in a.cases){if(a.cases[b].value==c){return b}}return -1},matchModel:function(c,e){var a={};var b=this;function d(f,o){for(var l in o){var h=o[l];var m=h.name;if(f!=""){m=f+"|"+m}switch(h.type){case"repeat":for(var k in h.cache){d(m+"_"+k,h.cache[k])}break;case"conditional":var p=h.test_param&&h.test_param.value;var g=b.matchCase(h,p);if(g!=-1){d(m,h.cases[g].inputs)}break;default:var n=b.app.tree.job_ids[m];if(n){e(n,h)}}}}d("",c.inputs);return a},matchResponse:function(c){var a={};var b=this;function d(k,h){if(typeof h==="string"){var f=b.app.tree.job_ids[k];if(f){a[f]=h}}else{for(var g in h){var e=g;if(k!==""){var j="|";if(h instanceof Array){j="_"}e=k+j+e}d(e,h[g])}}}d("",c);return a},references:function(c,e){var g=[];var b=this;function d(h,j){var i=$(j).children();var l=[];var k=false;i.each(function(){var o=this;var n=$(o).attr("id");if(n!==c){var m=b.app.input_list[n];if(m){if(m.name==h){k=true;return false}if(m.data_ref==h&&m.type==e){l.push(n)}}}});if(!k){g=g.concat(l);i.each(function(){d(h,this)})}}var f=this.xml.find("#"+c);if(f.length>0){var a=this.app.input_list[c];if(a){d(a.name,f.parent())}}return g},_iterate:function(d,e,b){var a=this;var c=$(d).children();c.each(function(){var i=this;var h=$(i).attr("id");if($(i).hasClass("section-row")){e[h]={};var f=a.app.input_list[h];if(f){e[h]={input:f}}var g=$('<div id="'+h+'"/>');b.append(g);a._iterate(i,e[h],g)}else{a._iterate(i,e,b)}})}})});