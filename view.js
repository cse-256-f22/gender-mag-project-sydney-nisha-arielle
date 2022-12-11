// array of all file names
let file_array = []

// array of all file paths
let file_paths = []

// array of all users
user_array = []
user_values = Object.values(all_users)
user_keys = Object.keys(all_users)

for(let i = 0; i < user_values.length; i++) {
    users = user_values[i]

    if(typeof users == 'object') {
        group_name = user_keys[i] + ' (Includes: '
        user_nested = Object.values(users)[1]
        for(let j = 0; j < user_nested.length - 1; j++) {
            group_name += user_nested[j] + ', '
        }
        let len = user_nested.length
        group_name += user_nested[len-1] 
        group_name += ')'
        user_array.push(group_name)
    }
    else {
        user_array.push(users)
    }
}

// array of all effective permissions
let which_permissions = Object.values(permissions)

// array for permission groups
let perm_groups = ['Other', 'Delete', 'Full_Control', 'Modify', 'Read_Execute', 'Write', 'Read']


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
                    EDIT PERMISSIONS
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if(file_hash in parent_to_children) {
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
                EDIT PERMISSIONS 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#fileAccordionDiv" ).append( file_elem);    
}

// make tables for the permissions of each user for each file
cur_state = []
for (let f = 0; f < file_array.length; f++){
    file_users = get_file_users(path_to_file[file_paths[f]])
    file_state = get_cur_file_perm(file_paths[f], Object.keys(file_users))
    cur_state.push(file_state)
    make_permission_grids(file_array[f], file_paths[f], which_permissions, perm_groups, Object.keys(file_users))
}

let checkboxes = document.querySelectorAll('[id^="perm-dialog-ok-button"]')
for(let y = 0; y < checkboxes.length; y++) {
    checkboxes[y].addEventListener("click", function handleClick(event) {
        $('#sidepanel').empty()
        for (let i = 0; i < file_array.length; i++){
            file_users = get_file_users(path_to_file[file_paths[i]])
            make_permission_grids(file_array[i], file_paths[i], which_permissions, perm_groups, Object.keys(file_users), cur_state[i])
        }
    })
}

function get_cur_file_perm(file_path, file_users) {
    let cur_state = []
    for (let j = 0; j < file_users.length; j++) {
        user = file_users[j]

        if(user.includes('(')) {
            user = user.substring(0, user.lastIndexOf('(')).replace(/\s/g, "")
        }

        permissions1 = get_grouped_permissions(path_to_file[file_path], user)
        allowed_perms = []
        denied_perms = []
        user_arr = []

        for(var key in permissions1['allow']) {
            allowed_perms.push(key)
        }
        for(var key in permissions1['deny']) {
            denied_perms.push(key)
        }

        // READ PERMISSIONS
        if(denied_perms.includes('Read')) {
            user_arr.push('deny')
        }
        else if(allowed_perms.includes('Read')) {
            user_arr.push('allow')
        }
        else {
            user_arr.push('none')
        }

        // WRITE PERMISSIONS
        if(denied_perms.includes('Write')) {
            user_arr.push('deny')
        }
        else if(allowed_perms.includes('Write')) {
            user_arr.push('allow')
        }
        else {
            user_arr.push('none')
        }

        // READ_EXECUTE PERMISSIONS
        if(denied_perms.includes('Read_Execute')) {
            user_arr.push('deny')
        }
        else if(allowed_perms.includes('Read_Execute')) {
            user_arr.push('allow')
        }
        else {
            user_arr.push('none')
        }

        // MODIFY
        if(denied_perms.includes('Modify')) {
            user_arr.push('deny')
        }
        else if(allowed_perms.includes('Modify')) {
            user_arr.push('allow')
        }
        else {
            user_arr.push('none')
        }

        // FULL CONTROL
        if(denied_perms.includes('Full_control')) {
            user_arr.push('deny')
        }
        else if(allowed_perms.includes('Full_control')) {
            user_arr.push('allow')
        }
        else {
            user_arr.push('none')
        }

        // DELETE
        if(denied_perms.includes('Delete')) {
            user_arr.push('deny')
        }
        else if(allowed_perms.includes('Delete')) {
            user_arr.push('allow')
        }
        else {
            user_arr.push('none')
        }

        // OTHER
        if(denied_perms.includes('Other')) {
            user_arr.push('deny')
        }
        else if(allowed_perms.includes('Other')) {
            user_arr.push('allow')
        }
        else {
            user_arr.push('none')
        }

        cur_state.push(user_arr)
    }
    
    return cur_state
}

// $('#instructions').append("Instructions: Please make all permissions changes by clicking the lock icon below." + 
//" You can view the current permissions in the tables to the right. A cell with '---' signifies that the permission is not specified. As you make changes, the corresponding cells in the table will change color.")
// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?

// $('#instructions1').append("<b> <u> Look at all of the direct (not inherited) permissions that are set on this file for this user OR for any groups that this user is part of (e.g. administrators)");
// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");
// $('#instructions1').append("       If any of these are set to deny permission, then permission is denied.");
// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");
// $('#instructions1').append("       Or, if any of these are set to allow the permission, then the action is allowed to happen.");
// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");
// $('#instructions1').append("<b> <u> If:");
// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");
// $('#instructions1').append("        there were no direct permissions for this [user, action] combination,");
// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");

// $('#instructions1').append("        AND inheritance is turned on for this file/folder ");
// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");

// $('#instructions1').append(".. Repeat the process using the permissions for the parent folder.");


// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");
// $('#instructions1').append("<b> <u> If:");
// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");
// $('#instructions1').append("        you have exhausted the options available via inheritance");
// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");

// $('#instructions1').append("        AND still have not found any relevant permission settings, ");
// $('#instructions1').append("<br>");
// // $('#instructions1').append("<br>");

// $('#instructions1').append("<b> .. then permission is denied.");

var pdefbutton = document.createElement("button");
pdefbutton.innerHTML = "What is Precedence?";
pdefbutton.style = "font-size: 15px; margin-right: 10px; background-color: white; color: black; padding: 6px;  border-color: black";
pdefbutton.onclick = function () {
    // var myDialog = document.createElement("dialog");
    // document.body.appendChild(myDialog)
    // var text = document.createTextNode("This is a dialog window");
    // myDialog.appendChild(text);
    // myDialog.showModal();
  alert("Precedence: Direct permissions take precedence over inherited permissions (if any). Inherited permissions at a 'closer' level to the file in question take precedence over ones that are 'further' (e.g. parent permissions take precedence over grandparent permissions). Within the same inheritance level, 'deny' permissions take precedence over 'allow' permissions. Within the same inheritance level, permissions set for users and groups have the same priority; neither takes priority over the other.");
};
// document.body.appendChild(btn);
$('#instructions2').append(pdefbutton);
//$('#instructions2').append("<br>");
// $('#instructions2').append("<br>");


var idefbutton = document.createElement("button");
idefbutton.innerHTML = "What is Inheritance?";
idefbutton.style = "font-size: 15px; background-color: white; color: black; padding: 6px;  border-color: black;";
idefbutton.onclick = function () {
  alert("Inheritance: A file/folder may inherit permissions from its parent folder. By default, this inheritance is on for all files/folders. Yet, it is possible to turn off inheritance for a particular file/folder (which makes it stop inheriting permissions from its parent).");
};
// document.body.appendChild(btn);
$('#instructions2').append(idefbutton);

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