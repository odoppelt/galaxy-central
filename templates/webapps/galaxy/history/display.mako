<%inherit file="/display_base.mako"/>
<%namespace file="history_panel.mako" import="history_panel_javascripts" />

## Set vars so that there's no need to change the code below.
<%
    history = published_item 
    datasets = published_item_data
%>

<%def name="javascripts()">
    ${parent.javascripts()}
    ${history_panel_javascripts()}
</%def>

<%def name="stylesheets()">
    ${parent.stylesheets()}
    <style type="text/css">
    </style>
</%def>

<%def name="render_item_links( history )">
<%
    encoded_history_id = history_dict[ 'id' ]
    import_url = h.url_for( controller='history', action='imp', id=encoded_history_id )
    switch_url = h.url_for( controller='history', action='switch_to_history', hist_id=encoded_history_id )
%>
    ## Needed to overwide initial width so that link is floated left appropriately.
    %if not user_is_owner:
    <a href="${import_url}" style="width: 100%" title="${_('Make a copy of this history and switch to it')}">
        ${_('Import history')}
    </a>
    %else:
    <a href="${switch_url}" style="width: 100%" title="${_('Make this history your current history')}">
        ${_('Switch to this history')}
    </a>
    %endif
</%def>

<%def name="render_item_header( item )">
</%def>

<%def name="render_item( history, datasets )">

<div id="history-${ history_dict[ 'id' ] }" class="history-panel">
</div>
<script type="text/javascript">
    var debugging    = JSON.parse( sessionStorage.getItem( 'debugging' ) ) || false,
        historyJSON  = ${h.to_json_string( history_dict )},
        hdaJSON      = ${h.to_json_string( hda_dicts )};
    //window.historyJSON = historyJSON;
    window.hdaJSON = hdaJSON;

    require.config({
        baseUrl : "${h.url_for( '/static/scripts' )}"
    })([ 'mvc/history/annotated-history-panel' ], function( panelMod ){
        // history module is already in the dpn chain from the panel. We can re-scope it here.
        var historyModel = require( 'mvc/history/history-model' ),
            hdaBaseView  = require( 'mvc/dataset/hda-base' ),
            history = new historyModel.History( historyJSON, hdaJSON, {
                logger: ( debugging )?( console ):( null )
            });

        window.historyPanel = new panelMod.AnnotatedHistoryPanel({
            show_deleted    : false,
            show_hidden     : false,
            el              : $( "#history-" + historyJSON.id ),
            model           : history,
            onready         : function(){
                this.render();
            }
        });
    });
</script>
</%def>
