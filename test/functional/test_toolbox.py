import new
import sys
from base.twilltestcase import TwillTestCase
from base.interactor import build_interactor, stage_data_in_history
from galaxy.tools import DataManagerTool
from galaxy.util import bunch
import logging
try:
    from nose.tools import nottest
except ImportError:
    nottest = lambda x: x

log = logging.getLogger( __name__ )

toolbox = None

#Do not test Data Managers as part of the standard Tool Test Framework.
TOOL_TYPES_NO_TEST = ( DataManagerTool, )

class ToolTestCase( TwillTestCase ):
    """Abstract test case that runs tests based on a `galaxy.tools.test.ToolTest`"""

    def do_it( self, testdef ):
        """
        Run through a tool test case.
        """
        shed_tool_id = self.shed_tool_id

        self._handle_test_def_errors( testdef )

        galaxy_interactor = self._galaxy_interactor( testdef )

        test_history = galaxy_interactor.new_history()

        stage_data_in_history( galaxy_interactor, testdef.test_data(), test_history, shed_tool_id )

        data_list, data_collection_list, jobs = galaxy_interactor.run_tool( testdef, test_history )

        # This definition is not longer compatible with twill interactor - that code should be deleted.
        self._verify_outputs( testdef, test_history, jobs, shed_tool_id, data_list, data_collection_list, galaxy_interactor )

        galaxy_interactor.delete_history( test_history )

    def _galaxy_interactor( self, testdef ):
        return build_interactor( self, testdef.interactor )

    def _handle_test_def_errors(self, testdef):
        # If the test generation had an error, raise
        if testdef.error:
            if testdef.exception:
                raise testdef.exception
            else:
                raise Exception( "Test parse failure" )

    def _verify_outputs( self, testdef, history, jobs, shed_tool_id, data_list, data_collection_list, galaxy_interactor ):
        maxseconds = testdef.maxseconds
        if testdef.num_outputs is not None:
            expected = testdef.num_outputs
            actual = len( data_list )
            if expected != actual:
                messaage_template = "Incorrect number of outputs - expected %d, found %s."
                message = messaage_template % ( expected, actual )
                raise Exception( message )
        found_exceptions = []

        for output_index, output_tuple in enumerate(testdef.outputs):
            # Get the correct hid
            name, outfile, attributes = output_tuple
            output_testdef = bunch.Bunch( name=name, outfile=outfile, attributes=attributes )
            try:
                output_data = data_list[ name ]
            except (TypeError, KeyError):
                # Legacy - fall back on ordered data list access if data_list is
                # just a list (case with twill variant or if output changes its
                # name).
                if hasattr(data_list, "values"):
                    output_data = data_list.values()[ output_index ]
                else:
                    output_data = data_list[ len(data_list) - len(testdef.outputs) + output_index ]
            self.assertTrue( output_data is not None )
            try:
                galaxy_interactor.verify_output( history, jobs, output_data, output_testdef=output_testdef, shed_tool_id=shed_tool_id, maxseconds=maxseconds )
            except Exception as e:
                if not found_exceptions:
                    # Only print this stuff out once.
                    for job in jobs:
                        job_stdio = galaxy_interactor.get_job_stdio( job[ 'id' ] )
                        for stream in ['stdout', 'stderr']:
                            if stream in job_stdio:
                                print >>sys.stderr, self._format_stream( job_stdio[ stream ], stream=stream, format=True )
                found_exceptions.append(e)

        if testdef.output_collections:
            galaxy_interactor.wait_for_jobs( history, jobs, maxseconds )
        for output_collection_def in testdef.output_collections:
            try:
                name = output_collection_def.name
                # TODO: data_collection_list is clearly a bad name for dictionary.
                if name not in data_collection_list:
                    template = "Failed to find output [%s], tool outputs include [%s]"
                    message = template % (name, ",".join(data_collection_list.keys()))
                    raise AssertionError(message)

                # Data collection returned from submission, elements may have been populated after
                # the job completed so re-hit the API for more information.
                data_collection_returned = data_collection_list[ name ]
                data_collection = galaxy_interactor._get( "dataset_collections/%s" % data_collection_returned[ "id" ], data={"instance_type": "history"} ).json()
                elements = data_collection[ "elements" ]
                element_dict = dict( map(lambda e: (e["element_identifier"], e["object"]), elements) )

                expected_collection_type = output_collection_def.collection_type
                if expected_collection_type:
                    collection_type = data_collection[ "collection_type"]
                    if expected_collection_type != collection_type:
                        template = "Expected output collection [%s] to be of type [%s], was of type [%s]."
                        message = template % (name, expected_collection_type, collection_type)
                        raise AssertionError(message)

                for element_identifier, ( element_outfile, element_attrib ) in output_collection_def.element_tests.items():
                    if element_identifier not in element_dict:
                        template = "Failed to find identifier [%s] for testing, tool generated collection with identifiers [%s]"
                        message = template % (element_identifier, ",".join(element_dict.keys()))
                        raise AssertionError(message)
                    hda = element_dict[ element_identifier ]

                    galaxy_interactor.verify_output_dataset(
                        history,
                        hda_id=hda["id"],
                        outfile=element_outfile,
                        attributes=element_attrib,
                        shed_tool_id=shed_tool_id
                    )
            except Exception as e:
                # TODO: This block copied and pasted - FIX before merging
                # into -central.
                if not found_exceptions:
                    # Only print this stuff out once.
                    for job in jobs:
                        job_stdio = galaxy_interactor.get_job_stdio( job[ 'id' ] )
                        for stream in ['stdout', 'stderr']:
                            if stream in job_stdio:
                                print >>sys.stderr, self._format_stream( job_stdio[ stream ], stream=stream, format=True )
                found_exceptions.append(e)

        if found_exceptions:
            big_message = "\n".join(map(str, found_exceptions))
            raise AssertionError(big_message)


@nottest
def build_tests( app=None, testing_shed_tools=False, master_api_key=None, user_api_key=None ):
    """
    If the module level variable `toolbox` is set, generate `ToolTestCase`
    classes for all of its tests and put them into this modules globals() so
    they can be discovered by nose.
    """
    if app is None:
        return

    # Push all the toolbox tests to module level
    G = globals()

    # Eliminate all previous tests from G.
    for key, val in G.items():
        if key.startswith( 'TestForTool_' ):
            del G[ key ]
    for i, tool_id in enumerate( app.toolbox.tools_by_id ):
        tool = app.toolbox.get_tool( tool_id )
        if isinstance( tool, TOOL_TYPES_NO_TEST ):
            #We do not test certain types of tools (e.g. Data Manager tools) as part of ToolTestCase 
            continue
        if tool.tests:
            shed_tool_id = None if not testing_shed_tools else tool.id
            # Create a new subclass of ToolTestCase, dynamically adding methods
            # named test_tool_XXX that run each test defined in the tool config.
            name = "TestForTool_" + tool.id.replace( ' ', '_' )
            baseclasses = ( ToolTestCase, )
            namespace = dict()
            for j, testdef in enumerate( tool.tests ):
                def make_test_method( td ):
                    def test_tool( self ):
                        self.do_it( td )
                    return test_tool
                test_method = make_test_method( testdef )
                test_method.__doc__ = "%s ( %s ) > %s" % ( tool.name, tool.id, testdef.name )
                namespace[ 'test_tool_%06d' % j ] = test_method
                namespace[ 'shed_tool_id' ] = shed_tool_id
                namespace[ 'master_api_key' ] = master_api_key
                namespace[ 'user_api_key' ] = user_api_key
            # The new.classobj function returns a new class object, with name name, derived
            # from baseclasses (which should be a tuple of classes) and with namespace dict.
            new_class_obj = new.classobj( name, baseclasses, namespace )
            G[ name ] = new_class_obj
