<%inherit file="/base.mako"/>
<%def name="title()">${form.title}</%def>

<%def name="javascripts()">
${parent.javascripts()}
<script type="text/javascript">
$(function(){
    $("input:text:first").focus();
})
</script>
</%def>

<div class="toolForm">
    <div class="toolFormTitle">${form.title}</div>
    <div class="toolFormBody">
    <form name="${form.name}" action="${form.action}" method="post" >
        %for input in form.inputs:
            <%
            cls = "form-row"
            if input.error:
                cls += " form-row-error"
            %>
            <div class="${cls}">
              %if input.use_label:
              <label>
                  ${input.label}:
              </label>
              %endif
              <div style="float: left; width: 250px; margin-right: 10px;">
                  <input type="${input.type}" name="${input.name}" value="${input.value}" size="40">
              </div>
              %if input.error:
              <div style="float: left; color: red; font-weight: bold; padding-top: 1px; padding-bottom: 3px;">
                  <div style="width: 300px;"><img style="vertical-align: middle;" src="${h.url_for('/static/style/error_small.png')}">&nbsp;<span style="vertical-align: middle;">${input.error}</span></div>
              </div>
              %endif

              %if input.help:
              <div class="toolParamHelp" style="clear: both;">
                  ${input.help}
              </div>
              %endif

              <div style="clear: both"></div>

            </div>
        %endfor
      <tr><td></td><td><input type="submit" value="${form.submit_text}">
      </table>
  </form>
  </div>
</div>
