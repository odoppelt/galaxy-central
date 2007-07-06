"""
Tabular datatype

"""
import pkg_resources
pkg_resources.require( "bx-python" )

import logging
import data
from galaxy import util
from cgi import escape
from galaxy.datatypes.metadata import MetadataElement
from galaxy.datatypes.metadata import MetadataAttributes

log = logging.getLogger(__name__)


class Tabular( data.Text ):
    """Tab delimited data"""

    """Provide the set of display formats supported by this datatype """
    supported_display_apps = []
    
    MetadataElement( name="columns",
                     default=0,
                     desc="Number of columns",
                     attributes=MetadataAttributes.READONLY )

    def init_meta( self, dataset, copy_from=None ):
        data.Text.init_meta( self, dataset, copy_from=copy_from )
        try:
            # This actually doesn't work at the moment.  There needs
            # to be hooks for the file corresponding to a dataset, so
            # that when the file is written and closed, code can be
            # run.  That is idealy where this block would go.
            maxcols = 0
            count = 0
            for line in open( dataset.file_name ):
                count += 1
                if count > 1000: break
                cols = len( line.split("\t") )
                if cols > maxcols: maxcols = cols
            setattr( dataset.metadata, "columns", maxcols )
        except:
            pass
    
    def missing_meta( self, dataset ):
        """Checks for empty meta values"""
        for key, value in dataset.metadata.items():
            if not value:
                return True
        return False
        
    def make_html_table(self, data, skipchar=None):
        out = ['<table cellspacing="0" cellpadding="3">']
        first = True
        comments = []
        try:
            lines =  data.splitlines()
            for line in lines:
                if skipchar and line.startswith(skipchar):
                    comments.append(line.strip())
                    continue
                line = line.strip()
                if not line:
                    continue
                elems = line.split("\t")
                
                if first: #generate header
                    first = False
                    out.append('<tr>')
                    for index, elem in enumerate(elems):
                        out.append("<th>%s</th>" % (index+1))
                    out.append('</tr>')
                
                while len(comments)>0:
                    out.append('<tr><td colspan="100%">')
                    out.append(escape(comments.pop(0)))
                    out.append('</td></tr>')
                
                out.append('<tr>') # body
                for elem in elems:
                    elem = escape(elem)
                    out.append("<td>%s</td>" % elem)
                out.append('</tr>')
            out.append('</table>')
            out = "".join(out)
        except Exception, exc:
            out = "Can't create peek %s" % exc
        return out

    def get_estimated_display_viewport( self, dataset ):
        #TODO: fix me...
        return ('', '', '')

    def display_peek( self, dataset ):
        m_peek = self.make_html_table( dataset.peek )
        return m_peek
