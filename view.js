// array of all file names
let file_array = []

//array of all file paths
let file_paths = []

// array of all users
let user_array = Object.keys(all_users)


// ---- Define your dialogs  and panels here ----
// let displayEffectivePermissionPanel = define_new_effective_permissions("effectivePermissions", true);
// let selectNewUser = define_new_user_select_field("select-new-user", "select new user", function(selected_user) {
//      $('#effectivePermissions').attr('username', selected_user);
// });

// $('#sidepanel').append(displayEffectivePermissionPanel)
// $('#sidepanel').append(selectNewUser)
// $('#effectivePermissions').attr('filepath', '/C/presentation_documents/important_file.txt')

let createDialog = define_new_dialog("new-dialog", "");
$('.perm_info').click(function(){
    createDialog.dialog('open')
    let filepath = $('#effectivePermissions').attr('filepath');
    let myUserObj = $('#effectivePermissions').attr('username');
    let permissionToCheck = $(this).attr('permission_name');

    let allowUserAction = allow_user_action(path_to_file[filepath], all_users[myUserObj], permissionToCheck, true);
    // console.log(allow_user_action(path_to_file[filepath], all_users[myUserObj], permissionToCheck, true))
    $('#new-dialog').empty()
    $('#new-dialog').append(get_explanation_text(allowUserAction));
})

// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    file_array.push(file_obj.filename)

    let file_hash = get_full_path(file_obj)
    file_paths.push(file_hash)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}

// create array of user permissions for each file
for (let i = 0; i < file_array.length; i++) {
    console.log(file_array[i])
    let file = file_array[i]
    filepath = file_paths[i]

    let myUniqueId = "effectivePermissions" + Math.floor(Math.random() * 26)
    id_prefix = 'perm' + Math.floor(Math.random() * 26)
    let displayeeEffectivePermissionPanel = define_new_effective_permissions(myUniqueId, true);
    let selecteeNewUser = define_new_user_select_field(Math.floor(Math.random() * 26) + Date.now(), "select new user", function(selected3_user) {
        $('#'+myUniqueId).attr('username', selected3_user);
    });

    let fileNameDiv = $(`<div id="file_name"></div>`)
    fileNameDiv.append("File: " + file)
    
    $('#sidepanel').append(fileNameDiv)
    // $('#sidepanel').append(displayeeEffectivePermissionPanel)
    // $('#sidepanel').append(selecteeNewUser)

    let effective_container = $(`<div id="${id_prefix}" class="ui-widget-content" style="overflow-y:scroll"></div>`)

    let which_permissions = Object.values(permissions)

    let perm_id = 'permission' + Math.floor(Math.random() * 26)
    let perm_str = "Permissions: "
    //this is each row of the table
    let perm_row = $(`
    <tr id="${id_prefix}_row_${perm_id}" permission_name="${perm_str}" permission_id="${perm_id}">
        <td id="${id_prefix}_checkcell_${perm_id}" class="effectivecheckcell" width="100px"></td>
        <td id="${id_prefix}_name_${perm_id}" class="effective_perm_name">${perm_str}</td>
    </tr>
    `)

    //each column of the table
    for (x = which_permissions.length-1; x >=0; x--) {
        perm_row.append(`
        <td id="${id_prefix}_${perm_id}_info_cell" width="100px" style="text-align:center">
        <span id="${id_prefix}_${perm_id}_info_icon" class="effective_perm_name" setting_container_id="${id_prefix}"/>
             ${which_permissions[x]}  
             </td>`)
    }
    effective_container.append(perm_row)

    for (let j = 0; j < user_array.length; j++) {
        let user = user_array[j]

        let user_id = user.replace(/[ \/]/g, '_') //get jquery-readable id
 
        let row = $(`
        <tr id="${id_prefix}_row_${user_id}" permission_name="${user}" permission_id="${user_id}">
            <td id="${id_prefix}_checkcell_${user_id}" class="effectivecheckcell" width="100px"></td>
            <td id="${id_prefix}_name_${user_id}" class="effective_perm_name">${user}</td>
        </tr>
        `)

        for (let k = 0; k < which_permissions.length; k++){
            
            let permission = which_permissions[k]
            let allowUserAction1 = allow_user_action(path_to_file[filepath], all_users[user], permission, true);
            
            let allow_id = user.replace(/[ \/]/g, '_') //get jquery-readable id

            if (allowUserAction1.is_allowed == true) {
                row.append(`
                    <td id="${id_prefix}_${allow_id}_info_cell" width="100px" style="text-align:center">
                    <span id="${id_prefix}_${allow_id}_info_icon" class="fa fa-check" setting_container_id="${id_prefix}"/>
                    </td>`)
            }
            else {
                row.append(`
                    <td id="${id_prefix}_${allow_id}_info_cell" width="100px" style="text-align:center">
                    <span id="${id_prefix}_${allow_id}_info_icon" class="fa fa-times" setting_container_id="${id_prefix}"/>
                    </td>`)
            }
        }
        effective_container.append(row)
    }
    
    // grouped_permissions = define_grouped_permission_checkboxes('permdialog_grouped_permissions')
    // $('#sidepanel').append(grouped_permissions)
    $('#sidepanel').append(effective_container)
}

$('#instructions').append("Instructions: Please make all permissions changes by clicking the lock icon below." + 
" Compare with original permissions listed in the tables to the right")
// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 