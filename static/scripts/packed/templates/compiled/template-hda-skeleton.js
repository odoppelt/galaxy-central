(function(){var b=Handlebars.template,a=Handlebars.templates=Handlebars.templates||{};a["template-hda-skeleton"]=b(function(f,r,p,k,w){this.compilerInfo=[4,">= 1.0.0"];p=this.merge(p,f.helpers);w=w||{};var q="",h,e="function",d=this.escapeExpression,o=this,c=p.blockHelperMissing;function n(B,A){var x="",z,y;x+='\n        <div class="errormessagesmall">\n            ';y={hash:{},inverse:o.noop,fn:o.program(2,m,A),data:A};if(z=p.local){z=z.call(B,y)}else{z=B.local;z=typeof z===e?z.apply(B):z}if(!p.local){z=c.call(B,z,y)}if(z||z===0){x+=z}x+=":\n            ";y={hash:{},inverse:o.noop,fn:o.program(4,l,A),data:A};if(z=p.local){z=z.call(B,y)}else{z=B.local;z=typeof z===e?z.apply(B):z}if(!p.local){z=c.call(B,z,y)}if(z||z===0){x+=z}x+="\n        </div>\n        ";return x}function m(y,x){return"There was an error getting the data for this dataset"}function l(z,y){var x;if(x=p.error){x=x.call(z,{hash:{},data:y})}else{x=z.error;x=typeof x===e?x.apply(z):x}return d(x)}function j(A,z){var x="",y;x+="\n            ";y=p["if"].call(A,A.purged,{hash:{},inverse:o.program(10,v,z),fn:o.program(7,i,z),data:z});if(y||y===0){x+=y}x+="\n        ";return x}function i(B,A){var x="",z,y;x+='\n            <div class="warningmessagesmall"><strong>\n                ';y={hash:{},inverse:o.noop,fn:o.program(8,g,A),data:A};if(z=p.local){z=z.call(B,y)}else{z=B.local;z=typeof z===e?z.apply(B):z}if(!p.local){z=c.call(B,z,y)}if(z||z===0){x+=z}x+="\n            </strong></div>\n\n            ";return x}function g(y,x){return"This dataset has been deleted and removed from disk."}function v(B,A){var x="",z,y;x+='\n            <div class="warningmessagesmall"><strong>\n                ';y={hash:{},inverse:o.noop,fn:o.program(11,u,A),data:A};if(z=p.local){z=z.call(B,y)}else{z=B.local;z=typeof z===e?z.apply(B):z}if(!p.local){z=c.call(B,z,y)}if(z||z===0){x+=z}x+='\n                \n                \n                Click <a href="javascript:void(0);" class="dataset-undelete">here</a> to undelete it\n                or <a href="javascript:void(0);" class="dataset-purge">here</a> to immediately remove it from disk\n            </strong></div>\n            ';return x}function u(y,x){return"This dataset has been deleted."}function t(B,A){var x="",z,y;x+='\n        <div class="warningmessagesmall"><strong>\n            ';y={hash:{},inverse:o.noop,fn:o.program(14,s,A),data:A};if(z=p.local){z=z.call(B,y)}else{z=B.local;z=typeof z===e?z.apply(B):z}if(!p.local){z=c.call(B,z,y)}if(z||z===0){x+=z}x+='\n            \n            Click <a href="javascript:void(0);" class="dataset-unhide">here</a> to unhide it\n        </strong></div>\n        ';return x}function s(y,x){return"This dataset has been hidden."}q+='<div class="dataset hda">\n    <div class="dataset-warnings">\n        ';h=p["if"].call(r,r.error,{hash:{},inverse:o.noop,fn:o.program(1,n,w),data:w});if(h||h===0){q+=h}q+="\n\n        ";h=p["if"].call(r,r.deleted,{hash:{},inverse:o.noop,fn:o.program(6,j,w),data:w});if(h||h===0){q+=h}q+="\n\n        ";h=p.unless.call(r,r.visible,{hash:{},inverse:o.noop,fn:o.program(13,t,w),data:w});if(h||h===0){q+=h}q+='\n    </div>\n\n    <div class="dataset-primary-actions"></div>\n\n    <div class="dataset-title-bar">\n        <span class="dataset-state-icon state-icon"></span>\n        <div class="dataset-title">\n            <span class="hda-hid">';if(h=p.hid){h=h.call(r,{hash:{},data:w})}else{h=r.hid;h=typeof h===e?h.apply(r):h}q+=d(h)+'</span>\n            <span class="dataset-name">';if(h=p.name){h=h.call(r,{hash:{},data:w})}else{h=r.name;h=typeof h===e?h.apply(r):h}q+=d(h)+'</span>\n        </div>\n    </div>\n    <div class="clear"></div>\n\n    <div class="dataset-body"></div>\n</div>';return q})})();