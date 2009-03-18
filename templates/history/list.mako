<% _=n_ %>
<%inherit file="/base.mako"/>
<%def name="title()">${_('Your saved histories')}</%def>

%if error_msg:
<p>
<div class="errormessage">${error_msg}</div>
<div style="clear: both"></div>
</p>
%endif
%if ok_msg:
<p>
<div class="donemessage">${ok_msg}</div>
<div style="clear: both"></div>
</p>
%endif

%if user.histories:
  <h1 style="margin-bottom:0px;">${_('Stored Histories')}</h1>
  %if show_deleted:
  <div><a href="${h.url_for( action='history_available', id=','.join( ids ), show_deleted=False )}">${_('hide deleted')}</a></div>
  %else:
  <div><a href="${h.url_for( action='history_available', id=','.join( ids ), show_deleted=True )}">${_('show deleted')}</a></div>
  %endif
  <form name="history_actions" action="${h.url_for( action='history_available')}" method="post" >
      <table class="colored" border="0" cellspacing="0" cellpadding="0" width="100%">
          <tr class="header" align="center"><td>${_('Name')}</td><td>${_('Size')}</td><td>${_('Last modified')}</td><td>${_('Actions')}</td></tr>
      %for history in user.histories:
        %if ( show_deleted and not history.purged ) or not( history.deleted ):
          <tr>
            <td>
            <input type=checkbox name="id" value="${history.id}"
          %if str(history.id) in ids:
          checked 
          %endif
          >${history.name} 
          %if history == trans.get_history():
          (current history)
          %endif
          </td>
          <td>${len(history.active_datasets)}</td>
          <td>${str(history.update_time)[:19]}</td>
          <td>
          %if not history.deleted:
            <a href="${h.url_for( action='history_rename', id=history.id )}">${_('rename')}</a><br />
            <a href="${h.url_for( action='history_switch', id=history.id )}">${_('switch to')}</a><br />
            <a href="${h.url_for( action='history_delete', id=history.id )}" confirm="Are you sure you want to delete this history?">${_('delete')}</a><br />
          %else:
            <a href="${h.url_for( action='history_undelete', id=history.id )}">${_('undelete')}</a><br />
          %endif
          </td>
          </tr>
        %endif
      %endfor
   <tr><th colspan="100%">${_('Action')}</th></tr>
   <tr><td colspan="100%" align="center"><input type="radio" name="do_operation" value="share" checked>${_('Share')} <input type="radio" name="do_operation" value="rename">${_('Rename')} <input type="radio" name="do_operation" value="delete">${_('Delete')} 
   %if show_deleted:
   <input type="radio" name="do_operation" value="undelete">${_('Undelete')} 
   %endif
   </td></tr>
   <tr><td colspan="100%" align="center"><input type="submit" name="submit" value="${_('Perform Action')}"></td></tr>
      </table>
  </form>
%else:
  ${_('You have no stored histories')}
%endif
