<%namespace file="../grid_base.mako" import="*" />
<%namespace file="/display_common.mako" import="render_message" />
${init()}
## Always show item checkboxes so that users can select items.
${render_grid_table_body_contents( grid, show_item_checkboxes=show_item_checkboxes )}
*****
${num_pages}
*****
${render_message( message, status )}