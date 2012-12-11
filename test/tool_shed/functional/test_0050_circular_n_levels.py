from tool_shed.base.twilltestcase import ShedTwillTestCase, common, os
from tool_shed.base.test_db_util import get_repository_by_name_and_owner, get_user, get_private_role

emboss_datatypes_repository_name = 'emboss_datatypes_0050'
emboss_datatypes_repository_description = "Datatypes for emboss"
emboss_datatypes_repository_long_description = "Long description of Emboss' datatypes"

emboss_repository_name = 'emboss_0050'
emboss_repository_description = "Galaxy's emboss tool"
emboss_repository_long_description = "Long description of Galaxy's emboss tool"

freebayes_repository_name = 'freebayes_0050'
freebayes_repository_description = "Galaxy's freebayes tool"
freebayes_repository_long_description = "Long description of Galaxy's freebayes tool"

filtering_repository_name = 'filtering_0050'
filtering_repository_description = "Galaxy's filtering tool"
filtering_repository_long_description = "Long description of Galaxy's filtering tool"

default_category = 'test_0050_repository_n_level_circular_dependencies'
default_category_description = 'Testing handling of circular repository dependencies to n levels.'

class TestRepositoryCircularDependenciesToNLevels( ShedTwillTestCase ):
    '''Verify that the code correctly handles circular dependencies down to n levels.'''
    def test_0000_initiate_users( self ):
        """Create necessary user accounts."""
        self.logout()
        self.login( email=common.test_user_1_email, username=common.test_user_1_name )
        test_user_1 = get_user( common.test_user_1_email )
        assert test_user_1 is not None, 'Problem retrieving user with email %s from the database' % test_user_1_email
        test_user_1_private_role = get_private_role( test_user_1 )
        self.logout()
        self.login( email=common.admin_email, username=common.admin_username )
        admin_user = get_user( common.admin_email )
        assert admin_user is not None, 'Problem retrieving user with email %s from the database' % admin_email
        admin_user_private_role = get_private_role( admin_user )
    def test_0005_create_category( self ):
        """Create a category for this test suite"""
        self.create_category( default_category, default_category_description )
    def test_0010_create_emboss_datatypes_repository( self ):
        '''Create and populate emboss_datatypes_0050.'''
        self.logout()
        self.login( email=common.test_user_1_email, username=common.test_user_1_name )
        self.create_repository( emboss_datatypes_repository_name, 
                                emboss_datatypes_repository_description, 
                                repository_long_description=emboss_datatypes_repository_long_description, 
                                categories=[ default_category ], 
                                strings_displayed=[] )
        repository = get_repository_by_name_and_owner( emboss_datatypes_repository_name, common.test_user_1_name )
        self.upload_file( repository, 
                          'emboss/datatypes/datatypes_conf.xml', 
                          strings_displayed=[], 
                          commit_message='Uploaded datatypes_conf.xml.' )
    def test_0015_create_emboss_repository( self ):
        '''Create and populate emboss_0050.'''
        self.create_repository( emboss_repository_name, 
                                emboss_repository_description, 
                                repository_long_description=emboss_repository_long_description, 
                                categories=[ default_category ], 
                                strings_displayed=[] )
        repository = get_repository_by_name_and_owner( emboss_repository_name, common.test_user_1_name )
        self.upload_file( repository, 
                          'emboss/emboss.tar', 
                          strings_displayed=[], 
                          commit_message='Uploaded tool tarball.' )
        datatypes_repository = get_repository_by_name_and_owner( emboss_datatypes_repository_name, common.test_user_1_name )
        repository_dependencies_path = self.generate_temp_path( 'test_0050', additional_paths=[ 'emboss' ] )
        self.generate_repository_dependency_xml( [ datatypes_repository ], 
                                                 self.get_filename( 'repository_dependencies.xml', filepath=repository_dependencies_path ), 
                                                 dependency_description='Emboss depends on the emboss_datatypes repository.' )
        self.upload_file( repository, 
                          'repository_dependencies.xml', 
                          filepath=repository_dependencies_path, 
                          commit_message='Uploaded dependency on emboss_datatypes.' )
    def test_0020_create_filtering_repository( self ):
        '''Create and populate filtering_0050.'''
        self.create_repository( filtering_repository_name, 
                                filtering_repository_description, 
                                repository_long_description=filtering_repository_long_description, 
                                categories=[ default_category ], 
                                strings_displayed=[] )
        repository = get_repository_by_name_and_owner( filtering_repository_name, common.test_user_1_name )
        self.upload_file( repository, 
                          'filtering/filtering_1.1.0.tar', 
                          strings_displayed=[], 
                          commit_message='Uploaded filtering.tar.' )
        emboss_repository = get_repository_by_name_and_owner( emboss_repository_name, common.test_user_1_name )
        repository_dependencies_path = self.generate_temp_path( 'test_0050', additional_paths=[ 'filtering' ] )
        self.generate_repository_dependency_xml( [ emboss_repository ], 
                                                 self.get_filename( 'repository_dependencies.xml', filepath=repository_dependencies_path ), 
                                                 dependency_description='Filtering depends on the emboss repository.' )
        self.upload_file( repository, 
                          'repository_dependencies.xml', 
                          filepath=repository_dependencies_path, 
                          commit_message='Uploaded dependency on emboss.' )
    def test_0025_create_freebayes_repository( self ):
        '''Create and populate freebayes_0050.'''
        self.create_repository( freebayes_repository_name, 
                                freebayes_repository_description, 
                                repository_long_description=freebayes_repository_long_description, 
                                categories=[ default_category ], 
                                strings_displayed=[] )
        repository = get_repository_by_name_and_owner( freebayes_repository_name, common.test_user_1_name )
        self.upload_file( repository, 
                          'freebayes/freebayes.tar', 
                          strings_displayed=[], 
                          commit_message='Uploaded freebayes.tar.' )
        emboss_datatypes_repository = get_repository_by_name_and_owner( emboss_datatypes_repository_name, common.test_user_1_name )
        emboss_repository = get_repository_by_name_and_owner( emboss_repository_name, common.test_user_1_name )
        filtering_repository = get_repository_by_name_and_owner( filtering_repository_name, common.test_user_1_name )
        repository_dependencies_path = self.generate_temp_path( 'test_0050', additional_paths=[ 'freebayes' ] )
        previous_tip = self.get_repository_tip( repository )
        self.generate_repository_dependency_xml( [ emboss_datatypes_repository, emboss_repository, filtering_repository, repository ], 
                                                 self.get_filename( 'repository_dependencies.xml', filepath=repository_dependencies_path ), 
                                                 dependency_description='Freebayes depends on the filtering repository.' )
        self.upload_file( repository, 
                          'repository_dependencies.xml', 
                          filepath=repository_dependencies_path, 
                          commit_message='Uploaded dependency on filtering.' )
        self.display_manage_repository_page( repository, strings_not_displayed=[ previous_tip ] )
    def test_0030_verify_repository_dependencies( self ):
        '''Verify that the generated dependency circle does not cause an infinite loop.'''
        emboss_datatypes_repository = get_repository_by_name_and_owner( emboss_datatypes_repository_name, common.test_user_1_name )
        emboss_repository = get_repository_by_name_and_owner( emboss_repository_name, common.test_user_1_name )
        filtering_repository = get_repository_by_name_and_owner( filtering_repository_name, common.test_user_1_name )
        freebayes_repository = get_repository_by_name_and_owner( freebayes_repository_name, common.test_user_1_name )
        for repository in [ emboss_datatypes_repository, emboss_repository, filtering_repository ]:
            self.check_repository_dependency( freebayes_repository, repository, self.get_repository_tip( repository ) )
        self.display_manage_repository_page( freebayes_repository, strings_displayed=[ 'Freebayes depends on the filtering repository.' ] )
