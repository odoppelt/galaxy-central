from tool_shed.base.twilltestcase import ShedTwillTestCase, common, os
import tool_shed.base.test_db_util as test_db_util

repository_name = 'filtering_0060'
repository_description="Galaxy's filtering tool for test 0060"
repository_long_description="Long description of Galaxy's filtering tool for test 0060"
workflow_filename = 'Workflow_for_0060_filter_workflow_repository.ga'
workflow_name = 'Workflow for 0060_filter_workflow_repository'

class TestToolShedWorkflowFeatures( ShedTwillTestCase ):
    def test_0000_initiate_users( self ):
        """Create necessary user accounts and login as an admin user."""
        self.logout()
        self.login( email=common.test_user_1_email, username=common.test_user_1_name )
        test_user_1 = test_db_util.get_user( common.test_user_1_email )
        assert test_user_1 is not None, 'Problem retrieving user with email %s from the database' % test_user_1_email
        test_user_1_private_role = test_db_util.get_private_role( test_user_1 )
        self.logout()
        self.login( email=common.admin_email, username=common.admin_username )
        admin_user = test_db_util.get_user( common.admin_email )
        assert admin_user is not None, 'Problem retrieving user with email %s from the database' % common.admin_email
        admin_user_private_role = test_db_util.get_private_role( admin_user )
    def test_0005_create_categories( self ):
        """Create categories for this test suite"""
        self.create_category( name='Test 0060 Workflow Features', description='Test 0060 - Workflow Features' )
    def test_0010_create_repository( self ):
        """Create and populate the filtering repository"""
        self.logout()
        self.login( email=common.test_user_1_email, username=common.test_user_1_name )
        self.get_or_create_repository( name=repository_name, 
                                       description=repository_description, 
                                       long_description=repository_long_description, 
                                       owner=common.test_user_1_name,
                                       categories=[ 'Test 0060 Workflow Features' ], 
                                       strings_displayed=[] )
    def test_0015_upload_workflow( self ):
        '''Upload a workflow with a missing tool, and verify that the tool specified is marked as missing.'''
        repository = test_db_util.get_repository_by_name_and_owner( repository_name, common.test_user_1_name )
        workflow = file( self.get_filename( 'filtering_workflow/Workflow_for_0060_filter_workflow_repository.ga' ), 'r' ).read()
        workflow = workflow.replace(  '__TEST_TOOL_SHED_URL__', self.url.replace( 'http://', '' ) )
        workflow_filepath = self.generate_temp_path( 'test_0060', additional_paths=[ 'filtering_workflow' ] )
        os.makedirs( workflow_filepath )
        file( os.path.join( workflow_filepath, workflow_filename ), 'w+' ).write( workflow )
        self.upload_file( repository, 
                          workflow_filename, 
                          filepath=workflow_filepath, 
                          commit_message='Uploaded filtering workflow.' )
        self.load_workflow_image_in_tool_shed( repository, workflow_name, strings_displayed=[ '#EBBCB2' ] )
    def test_0020_upload_tool( self ):
        '''Upload the missing tool for the workflow in the previous step, and verify that the error is no longer present.'''
        repository = test_db_util.get_repository_by_name_and_owner( repository_name, common.test_user_1_name )
        self.upload_file( repository, 
                          'filtering/filtering_2.2.0.tar', 
                          commit_message="Uploaded filtering 2.2.0", 
                          remove_repo_files_not_in_tar='No' )
#        raise Exception( self.get_repository_tip( repository ) )
        self.load_workflow_image_in_tool_shed( repository, workflow_name, strings_not_displayed=[ '#EBBCB2' ] )
    def test_0025_verify_repository_metadata( self ):
        '''Verify that resetting the metadata does not change it.'''
        repository = test_db_util.get_repository_by_name_and_owner( repository_name, common.test_user_1_name )
        self.verify_unchanged_repository_metadata( repository )
