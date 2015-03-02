from galaxy import web
from galaxy.web.base.controller import *


class Mobile( BaseUIController ):

    @web.expose
    def index( self, trans, **kwargs ):
        return trans.response.send_redirect( web.url_for(controller='root', action='index' ) )
        # return trans.fill_template( "mobile/index.mako" )

    @web.expose
    def history_list( self, trans ):
        return trans.response.send_redirect( web.url_for(controller='root', action='index' ) )
        # return trans.fill_template( "mobile/history/list.mako" )

    @web.expose
    def history_detail( self, trans, id ):
        return trans.response.send_redirect( web.url_for(controller='root', action='index' ) )
        # history = trans.sa_session.query( trans.app.model.History ).get( id )
        # assert history.user == trans.user
        # return trans.fill_template( "mobile/history/detail.mako", history=history )

    @web.expose
    def dataset_detail( self, trans, id ):
        return trans.response.send_redirect( web.url_for(controller='root', action='index' ) )
        # dataset = trans.sa_session.query( trans.app.model.HistoryDatasetAssociation ).get( id )
        # assert dataset.history.user == trans.user
        # return trans.fill_template( "mobile/dataset/detail.mako", dataset=dataset )

    @web.expose
    def dataset_peek( self, trans, id ):
        return trans.response.send_redirect( web.url_for(controller='root', action='index' ) )
        # dataset = trans.sa_session.query( trans.app.model.HistoryDatasetAssociation ).get( id )
        # assert dataset.history.user == trans.user
        # return trans.fill_template( "mobile/dataset/peek.mako", dataset=dataset )

    @web.expose
    def settings( self, trans, email=None, password=None ):
        return trans.response.send_redirect( web.url_for(controller='root', action='index' ) )
        # message = None
        # if email is not None and password is not None:
        #     if email == "":
        #         self.__logout( trans )
        #         message = "Logged out"
        #     else:
        #         error = self.__login( trans, email, password )
        #         message = error or "Login changed"
        # return trans.fill_template( "mobile/settings.mako", message=message )

    def __logout( self, trans ):
        return trans.response.send_redirect( web.url_for(controller='root', action='index' ) )
        # trans.log_event( "User logged out" )
        # trans.handle_user_logout()

    def __login( self, trans, email="", password="" ):
        return trans.response.send_redirect( web.url_for(controller='root', action='index' ) )
        # error = password_error = None
        # user = trans.sa_session.query( model.User ).filter_by( email = email ).first()
        # if not user:
        #     autoreg = galaxy.auth.check_auto_registration(trans, email, password, trans.app.config.auth_config_file, trans.app.config.auth_debug)
        #     if autoreg[0]:
        #         kwd = {}
        #         kwd['username'] = autoreg[1]
        #         params = util.Params( kwd )
        #         message = validate_email( trans, email )
        #         if not message:
        #             message, status, user, success = self.__register( trans, 'user', False, **kwd )
        #             if success:
        #                 # The handle_user_login() method has a call to the history_set_default_permissions() method
        #                 # (needed when logging in with a history), user needs to have default permissions set before logging in
        #                 trans.handle_user_login( user )
        #                 trans.log_event( "User (auto) created a new account" )
        #                 trans.log_event( "User logged in" )
        #             else:
        #                 message = "Auto-registration failed, contact your local Galaxy administrator. %s" % message
        #         else:
        #             message = "Auto-registration failed, contact your local Galaxy administrator. %s" % message
        #     else:
        #         message = "No such user (please note that login is case sensitive)"
        # elif user.deleted:
        #     error = "This account has been marked deleted, contact your Galaxy administrator to restore the account."
        # elif user.external:
        #     error = "This account was created for use with an external authentication method, contact your local Galaxy administrator to activate it."
        # elif not galaxy.auth.check_password(user, password, trans.app.config.auth_config_file, trans.app.config.auth_debug):
        #     error = "Invalid password"
        # else:
        #     trans.handle_user_login( user )
        #     trans.log_event( "User logged in" )
        # return error
