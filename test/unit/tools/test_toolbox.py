import os
import string
import unittest

from galaxy.tools import ToolBox
from galaxy.model import tool_shed_install
from galaxy.model.tool_shed_install import mapping
import tools_support


CONFIG_TEST_TOOL_VERSION_TEMPLATE = string.Template(
    """    <tool file="tool.xml" guid="github.com/galaxyproect/example/test_tool/0.${version}">
            <tool_shed>github.com</tool_shed>
            <repository_name>example</repository_name>
            <repository_owner>galaxyproject</repository_owner>
            <installed_changeset_revision>${version}</installed_changeset_revision>
            <id>github.com/galaxyproect/example/test_tool/0.${version}</id>
            <version>0.${version}</version>
        </tool>
    """
)
CONFIG_TEST_TOOL_VERSION_1 = CONFIG_TEST_TOOL_VERSION_TEMPLATE.safe_substitute( dict( version="1" ) )
CONFIG_TEST_TOOL_VERSION_2 = CONFIG_TEST_TOOL_VERSION_TEMPLATE.safe_substitute( dict( version="2" ) )


class BaseToolBoxTestCase(  unittest.TestCase, tools_support.UsesApp, tools_support.UsesTools  ):

    @property
    def integerated_tool_panel_path( self ):
        return os.path.join(self.test_directory, "integrated_tool_panel.xml")

    def assert_integerated_tool_panel( self, exists=True ):
        does_exist = os.path.exists( self.integerated_tool_panel_path )
        if exists:
            assert does_exist
        else:
            assert not does_exist

    @property
    def toolbox( self ):
        if self.__toolbox is None:
            self.__toolbox = SimplifiedToolBox( self )
            # wire app with this new toolbox
            self.app.toolbox = self.__toolbox
        return self.__toolbox

    def setUp( self ):
        self.reindexed = False
        self.setup_app( mock_model=False )
        install_model = mapping.init( "sqlite:///:memory:", create_tables=True )
        self.app.install_model = install_model
        self.app.reindex_tool_search = self.__reindex
        itp_config = os.path.join(self.test_directory, "integrated_tool_panel.xml")
        self.app.config.integrated_tool_panel_config = itp_config
        self.__toolbox = None
        self.config_files = []

    def _repo_install( self, changeset ):
        repository = tool_shed_install.ToolShedRepository()
        repository.tool_shed = "github.com"
        repository.owner = "galaxyproject"
        repository.name = "example"
        repository.changeset_revision = changeset
        repository.installed_changeset_revision = changeset
        repository.deleted = False
        repository.uninstalled = False
        self.app.install_model.context.add( repository )
        self.app.install_model.context.flush( )
        return repository

    def _setup_two_versions( self ):
        repository1 = self._repo_install( changeset="1" )
        version1 = tool_shed_install.ToolVersion()
        version1.tool_id = "github.com/galaxyproect/example/test_tool/0.1"
        version1.repository = repository1
        self.app.install_model.context.add( version1 )
        self.app.install_model.context.flush( )

        repository2 = self._repo_install( changeset="2" )
        version2 = tool_shed_install.ToolVersion()
        version2.tool_id = "github.com/galaxyproect/example/test_tool/0.2"
        version2.repository = repository2

        self.app.install_model.context.add( version2 )
        self.app.install_model.context.flush( )

        version_association = tool_shed_install.ToolVersionAssociation()
        version_association.parent_id = version1.id
        version_association.tool_id = version2.id

        self.app.install_model.context.add( version_association )
        self.app.install_model.context.flush( )

    def _setup_two_versions_in_config( self, section=False ):
        if section:
            template = """<toolbox tool_path="%s">
<section id="tid" name="TID" version="">
    %s
</section>
<section id="tid" name="TID" version="">
    %s
</section>
</toolbox>"""
        else:
            template = """<toolbox tool_path="%s">
<section id="tid" name="TID" version="">
    %s
</section>
<section id="tid" name="TID" version="">
    %s
</section>
</toolbox>"""
        self._add_config( template % (self.test_directory, CONFIG_TEST_TOOL_VERSION_1, CONFIG_TEST_TOOL_VERSION_2 ) )

    def _add_config( self, xml, name="tool_conf.xml" ):
        path = self._tool_conf_path( name=name )
        with open( path, "w" ) as f:
            f.write( xml )
        self.config_files.append( path )

    def _tool_conf_path( self, name="tool_conf.xml" ):
        path = os.path.join( self.test_directory, name )
        return path

    def __reindex( self ):
        self.reindexed = True


class ToolBoxTestCase( BaseToolBoxTestCase ):

    def test_load_file( self ):
        self._init_tool()
        self._add_config( """<toolbox><tool file="tool.xml" /></toolbox>""" )

        toolbox = self.toolbox
        assert toolbox.get_tool( "test_tool" ) is not None
        assert toolbox.get_tool( "not_a_test_tool" ) is None

    def test_load_file_in_section( self ):
        self._init_tool()
        self._add_config( """<toolbox><section id="t" name="test"><tool file="tool.xml" /></section></toolbox>""" )

        toolbox = self.toolbox
        assert toolbox.get_tool( "test_tool" ) is not None
        assert toolbox.get_tool( "not_a_test_tool" ) is None

    def test_writes_integrate_tool_panel( self ):
        self._init_tool()
        self._add_config( """<toolbox><tool file="tool.xml" /></toolbox>""" )

        self.assert_integerated_tool_panel(exists=False)
        self.toolbox
        self.assert_integerated_tool_panel(exists=True)

    def test_groups_tools_in_section( self ):
        self._init_tool()
        self._setup_two_versions_in_config( section=True )
        self._setup_two_versions()
        self.toolbox
        self.__verify_two_test_tools( )

        # Assert only newer version of the tool loaded into the panel.
        section = self.toolbox.tool_panel["tid"]
        assert len(section.elems) == 1
        assert section.elems.values()[0].id == "github.com/galaxyproect/example/test_tool/0.2"

    def test_group_tools_out_of_section( self ):
        self._init_tool()
        self._setup_two_versions_in_config( section=False )
        self._setup_two_versions()
        self.__verify_two_test_tools( )

        # Assert tools merged in tool panel.
        assert len( self.toolbox.tool_panel ) == 1

    def test_update_shed_conf(self):
        self.__setup_shed_tool_conf()
        self.toolbox.update_shed_config( 0, {} )
        assert self.reindexed
        self.assert_integerated_tool_panel(exists=True)

    def test_update_shed_conf_deactivate_only(self):
        self.__setup_shed_tool_conf()
        self.toolbox.update_shed_config( 0, {}, integrated_panel_changes=False )
        assert self.reindexed
        # No changes, should be regenerated
        self.assert_integerated_tool_panel(exists=False)

    def test_get_tool_id( self ):
        self._init_tool()
        self._setup_two_versions_in_config( )
        self._setup_two_versions()
        assert self.toolbox.get_tool_id( "test_tool" ) == "github.com/galaxyproect/example/test_tool/0.1"
        assert self.toolbox.get_tool_id( "github.com/galaxyproect/example/test_tool/0.1" ) == "github.com/galaxyproect/example/test_tool/0.1"
        assert self.toolbox.get_tool_id( "github.com/galaxyproect/example/test_tool/0.2" ) == "github.com/galaxyproect/example/test_tool/0.2"
        assert self.toolbox.get_tool_id( "github.com/galaxyproect/example/test_tool/0.3" ) is None

    def __verify_two_test_tools( self ):
        # Assert tool versions of the tool with simple id 'test_tool'
        all_versions = self.toolbox.get_tool( "test_tool", get_all_versions=True )
        assert len( all_versions ) == 2

        # Verify lineage_ids on both tools is correctly ordered.
        for version in ["0.1", "0.2"]:
            guid = "github.com/galaxyproect/example/test_tool/" + version
            lineage_ids = self.toolbox.get_tool( guid ).lineage_ids
            assert lineage_ids[ 0 ] == "github.com/galaxyproect/example/test_tool/0.1"
            assert lineage_ids[ 1 ] == "github.com/galaxyproect/example/test_tool/0.2"

        # Test tool_version attribute.
        assert self.toolbox.get_tool( "test_tool", tool_version="0.1" ).guid == "github.com/galaxyproect/example/test_tool/0.1"
        assert self.toolbox.get_tool( "test_tool", tool_version="0.2" ).guid == "github.com/galaxyproect/example/test_tool/0.2"

    def test_default_lineage( self ):
        self._init_tool( filename="tool_v01.xml", version="0.1" )
        self._init_tool( filename="tool_v02.xml", version="0.2" )
        self._add_config( """<toolbox><tool file="tool_v01.xml" /><tool file="tool_v02.xml" /></toolbox>""" )
        tool_v01 = self.toolbox.get_tool( "test_tool", tool_version="0.1" )
        tool_v02 = self.toolbox.get_tool( "test_tool", tool_version="0.2" )
        assert tool_v02.id == "test_tool"
        assert tool_v02.version == "0.2", tool_v02.version
        assert tool_v01.id == "test_tool"
        assert tool_v01.version == "0.1"

    def __remove_itp( self ):
        os.remove( os.path)

    def __setup_shed_tool_conf( self ):
        self._add_config( """<toolbox tool_path="."></toolbox>""" )

        self.toolbox  # create toolbox
        assert not self.reindexed

        os.remove( self.integerated_tool_panel_path )


class SimplifiedToolBox( ToolBox ):

    def __init__( self, test_case ):
        app = test_case.app
        # Handle app/config stuff needed by toolbox but not by tools.
        app.job_config.get_tool_resource_parameters = lambda tool_id: None
        app.config.update_integrated_tool_panel = True
        config_files = test_case.config_files
        tool_root_dir = test_case.test_directory
        super( SimplifiedToolBox, self ).__init__(
            config_files,
            tool_root_dir,
            app,
        )
