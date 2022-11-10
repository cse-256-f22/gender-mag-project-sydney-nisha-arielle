// array of all file names
let file_array = []

// array of all users
let user_array = Object.keys(all_users)
console.log("users")
console.log(user_array)

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
    console.log(allow_user_action(path_to_file[filepath], all_users[myUserObj], permissionToCheck, true))
    $('#new-dialog').empty()
    $('#new-dialog').append(get_explanation_text(allowUserAction));
})

// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    file_array.push(file_obj.filename)
    let file_hash = get_full_path(file_obj)

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
   let myUniqueId = "effectivePermissions" + Math.floor(Math.random() * 26)
    let displayeeEffectivePermissionPanel = define_new_effective_permissions(myUniqueId, true);
let selecteeNewUser = define_new_user_select_field(Math.floor(Math.random() * 26) + Date.now(), "select new user", function(selected3_user) {
     $('#'+myUniqueId).attr('username', selected3_user);
});
$('#sidepanel').append(file_array[i])
$('#sidepanel').append(displayeeEffectivePermissionPanel)
$('#sidepanel').append(selecteeNewUser)

//ISSUE HERE
//CAN'T FIGURE OUT HOW TO GET THE FILEPATH if we just do filearray[i] then its not the complete path
//but this is what it would be $('#effectivePermissions').attr('filepath', '/C/presentation_documents/important_file.txt') if we hardcoded it
// let newFilepath = $('#' + myUniqueId).attr('filepath');

// let createdFilepath = path_to_file[newFilepath]

$('#'+myUniqueId).attr('filepath', createdFilepath)
   for (let j = 0; j < user_array.length; j++) {
    console.log(user_array[j])
    
   }
}

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