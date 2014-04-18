
## ============================================================================
<%def name="bootstrap( **kwargs )">
    ## Bootstap dictionaries for GalaxyApp object's JSON, create GalaxyApp,
    ##  and steal existing attributes from plain objects already created
    <%
        kwargs.update({
            'config'    : get_config_dict(),
            'user'      : get_user_dict(),
        })
    %>
    <script type="text/javascript">
        %for key in kwargs:
            ( window.bootstrapped = window.bootstrapped || {} )[ '${key}' ] = (
                ${ h.to_json_string( kwargs[ key ], indent=( 2 if trans.debug else 0 ) )} );
        %endfor
        define( 'bootstrapped-data', function(){
            return window.bootstrapped;
        });
    </script>
</%def>

<%def name="load( init_fn=None, **kwargs )">
    ${ self.bootstrap( **kwargs ) }
    <script type="text/javascript">
        require([ 'require', 'galaxy-app-base' ], function( require, galaxy ){
            //TODO: global...
            window.Galaxy = new galaxy.GalaxyApp({
                root            : '${h.url_for( "/" )}',
                //TODO: get these options from the server
                loggerOptions   : {}
            });

            var initFn = ${ 'window[ "%s" ]' %( init_fn ) if init_fn else 'undefined' };
            if( typeof initFn === 'function' ){
                initFn();
            }
        });
    </script>
</%def>


## ----------------------------------------------------------------------------
<%def name="get_config_dict()">
    ## Return a dictionary of universe_wsgi.ini settings
    <%
        config_dict = {}
        try:
            if 'configuration' in trans.webapp.api_controllers:
                config_dict = ( trans.webapp.api_controllers[ 'configuration' ]
                    .get_config_dict( trans.app.config, trans.user_is_admin() ) )
        except Exception, exc:
            pass
            
        return config_dict
    %>
</%def>

<%def name="get_config_json()">
    ## Conv. fn to write as JSON
${ h.to_json_string( get_config_dict() )}
</%def>


## ----------------------------------------------------------------------------
<%def name="get_user_dict()">
    ## Return a dictionary of user or anonymous user data including:
    ##  email, id, disk space used, quota percent, and tags used
    <%
        user_dict = {}
        try:
            if trans.user:
                user_dict = trans.user.to_dict( view='element',
                    value_mapper={ 'id': trans.security.encode_id, 'total_disk_usage': float } )
                user_dict[ 'quota_percent' ] = trans.app.quota_agent.get_percent( trans=trans )

                # tags used
                users_api_controller = trans.webapp.api_controllers[ 'users' ]
                user_dict[ 'tags_used' ] = users_api_controller.get_user_tags_used( trans, user=trans.user )
                user_dict[ 'is_admin' ] = trans.user_is_admin()
                return user_dict

            usage = 0
            percent = None
            try:
                usage = trans.app.quota_agent.get_usage( trans, history=trans.history )
                percent = trans.app.quota_agent.get_percent( trans=trans, usage=usage )
            except AssertionError, assertion:
                # no history for quota_agent.get_usage assertion
                pass
            return {
                'total_disk_usage'      : int( usage ),
                'nice_total_disk_usage' : util.nice_size( usage ),
                'quota_percent'         : percent
            }

        except Exception, exc:
            pass

        return user_dict
    %>
</%def>

<%def name="get_user_json()">
    ## Conv. fn to write as JSON
${ h.to_json_string( get_user_dict() )}
</%def>