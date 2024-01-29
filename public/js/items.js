var currentFolder = ""
var currentPermissions = {
  read: false,
  write: false
}

function fillItems() {
  loadingShow($("#itemstable"))
  $.get("/pages/itemslist/"+currentFolder,(resp)=>{
    $("#itemstable tbody tr").remove()
    if ( resp.data.length ) {
      for ( const itm of resp.data ) {
        var row = `<tr ondblclick="javascript:itemShow('${itm.id}')">`
        if ( currentPermissions.write ) {
          row += `<td><i id='view-${itm.id}' class='fa-solid fa-circle-info text-primary' data-bs-toggle="modal" data-bs-target="#viewitemdialog" data-id='${itm.id}'></i></td>`
          row += `<td><i class='fa-solid fa-pen-to-square' data-bs-toggle="modal" data-bs-target="#edititemdialog" data-id='${itm.id}'></i></td>`
          row += `<td><i class='fa-solid fa-trash text-danger' onclick='javascript:itemRemove("${itm.id}")'></i></td>`
        } else {
          row += "<td></td><td></td>"
        }
        row += "<td>"+itm.title+"</td><td>"+itm.createdat+"</td></tr>"
        $("#itemstable tbody").append(row)
      }
    }

    // Folder cannot be removed if not empty
    if ( $("#itemstable tbody tr").length ) {
      $("#removefolder").attr("disabled","disabled")
    }
    loadingHide($("#itemstable"))
  })
}

function folderClicked(ev) {
  $("[role=treeitem]").css({"font-weight":"normal","background-color":"transparent"})

  // If ev is a string, the call has been forced on an item just for items reload: calling an
  // "onclick" directly would mess with collapse status of the folder
  if ( typeof ev==="string" ) {
    $("[role=treeitem][id="+ev+"]").css("font-weight","bold").css("background-color","#eeeeee")
    ensureVisibile( $("[role=treeitem][id="+ev+"]") )
    currentFolder = ev
  } else {
    $(this).css("font-weight","bold").css("background-color","#eeeeee")
    currentFolder = this.id
  }

  localStorage.setItem("bstreeview_open_folderstree",currentFolder)

  // Read folder info
  $.get("/pages/folders/"+currentFolder,(resp)=>{
    if ( resp.data && resp.data.permissions ) {
      currentPermissions = resp.data.permissions
    } else {
      currentPermissions = { read: false, write: false }
    }

    // Load items
    fillItems()

    if ( currentPermissions.write ) {
      $("#newitem").removeAttr("disabled")
      $("#newfolder").removeAttr("disabled")
      $("#removefolder").removeAttr("disabled")
      $("#editfolder").removeAttr("disabled")
    } else {
      $("#newitem").attr("disabled","disabled")
      $("#newfolder").attr("disabled","disabled")
      $("#removefolder").attr("disabled","disabled")
      $("#editfolder").attr("disabled","disabled")
    }
  })
}

function toggleNewPassword() {
  if ( $("#newpassword").attr("type")=="password") {
    $("#newpassword").attr("type","text")
  } else {
    $("#newpassword").attr("type","password")
  }
}

function itemCreate() {
  let itemdata = {
    _csrf: $("#_csrf").val(),
    title: $("#newtitle").val(),
    email: $("#newemail").val(),
    description: $("#newdescription").val(),
    url: $("#newurl").val(),
    user: $("#newuser").val(),
    password: $("#newpassword").val()
  }

  $.post("/pages/itemnew/"+currentFolder, itemdata, (resp)=> {
    if ( resp.data && resp.data.id ) {
      location.reload()
    } else {
      errorDialog(resp.message)
    }
  });
}

function itemCreateEnable() {
  if ( $("#newtitle").val()=="" ) {
    $("#itemcreate").attr("disabled","disabled")
  } else {
    $("#itemcreate").removeAttr("disabled")
  }
}

function itemRemove(itm) {
  confirm("Remove item", "Are you sure you want to remove this item?", ()=> {
    $.post("/pages/itemremove/"+itm, {_csrf: $("#_csrf").val()}, (resp)=> {
      if ( resp.status=="success" ) {
        location.reload()
      } else {
        errorDialog(resp.message)
      }
    })
  })
}

function itemEditFill(item) {
  $("#itemeditid").val(item)

  $.get("/pages/items/"+item, (resp)=> {
    if ( resp.status=="success" ) {
      $("#edittitle").val(resp.data.title)
      $("#editemail").val(resp.data.data.email)
      $("#editdescription").val(resp.data.data.description)
      $("#editurl").val(resp.data.data.url)
      $("#edituser").val(resp.data.data.user)
      $("#editpassword").val(resp.data.data.password)
    }
  })
}

function itemEditEnable() {
  if ( $("#edittitle").val()=="" ) {
    $("#itemedit").attr("disabled","disabled")
  } else {
    $("#itemedit").removeAttr("disabled")
  }
}

function itemEdit() {
  let itemdata = {
    _csrf: $("#_csrf").val(),
    title: $("#edittitle").val(),
    data: {
      description: $("#editdescription").val(),
      email: $("#editemail").val(),
      url: $("#editurl").val(),
      user: $("#edituser").val(),
      password: $("#editpassword").val()
    }
  }

  $.post("/pages/itemupdate/"+$("#itemeditid").val(), itemdata, (resp)=> {
    if ( resp.status=="success" ) {
      location.reload()
    } else {
      errorDialog(resp.message)
    }
  });
}

function toggleEditPassword() {
  if ( $("#editpassword").attr("type")=="password") {
    $("#editpassword").attr("type","text")
  } else {
    $("#editpassword").attr("type","password")
  }
}

function folderCreateEnable() {
  if ( $("#newfolderdescription").val()=="" ) {
    $("#foldercreate").attr("disabled","disabled")
  } else {
    $("#foldercreate").removeAttr("disabled")
  }
}

function folderCreate() {
  let itemdata = {
    _csrf: $("#_csrf").val(),
    description: $("#newfolderdescription").val()
  }

  $.post("/pages/foldernew/"+currentFolder, itemdata, (resp)=> {
    if ( resp.data && resp.data.id ) {
      location.reload()
    } else {
      errorDialog(resp.message)
    }
  });
}

function folderRemove() {
  confirm("Remove folder", "Are you sure you want to remove this folder?", ()=> {
    $.post("/pages/folderremove/"+currentFolder, {_csrf: $("#_csrf").val()}, (resp)=> {
      if ( resp.status=="success" ) {
        location.reload()
      } else {
        errorDialog(resp.message)
      }
    })
  })
}

function folderEditEnable() {
  if ( $("#foldereditdescription").val()=="" ) {
    $("#folderedit").attr("disabled","disabled")
  } else {
    $("#folderedit").removeAttr("disabled")
  }
}

function folderEditFill() {
  $("#foldereditid").val(currentFolder)

  $.get("/pages/folders/"+currentFolder, (resp)=> {
    if ( resp.status=="success" ) {
      $("#foldereditdescription").val(resp.data.description)
    }
  })
}

function folderEdit() {
  let data = {
    _csrf: $("#_csrf").val(),
    description: $("#foldereditdescription").val()
  }

  $.post("/pages/folderupdate/"+$("#foldereditid").val(), data, (resp)=> {
    if ( resp.status=="success" ) {
      location.reload()
    } else {
      errorDialog(resp.message)
    }
  });
}

function toggleViewPassword() {
  if ( $("#viewpassword").attr("type")=="password") {
    $("#viewpassword").attr("type","text")
  } else {
    $("#viewpassword").attr("type","password")
  }
}

function itemViewFill(item) {
  $.get("/pages/items/"+item, (resp)=> {
    if ( resp.status=="success" ) {
      $("#viewtitle").val(resp.data.title)
      $("#viewemail").val(resp.data.data.email)
      $("#viewdescription").val(resp.data.data.description)
      $("#viewurl").val(resp.data.data.url)
      $("#viewuser").val(resp.data.data.user)
      $("#viewpassword").val(resp.data.data.password).attr("type","password")
    }
  })
}

function itemShow(item) {
  if ( window.getSelection() ) {
    window.getSelection().empty()
  }
  $("#view-"+item).click()
}

$(function() {
  // Reset new item dialog fields
  $("#newitemdialog").on("hidden.bs.modal", ()=> {
    $("#newitemdialog input,textarea").val("")
  })

  // Get the item data to be edited
  $("#edititemdialog").on("show.bs.modal", (ev)=> {
    itemEditFill($(ev.relatedTarget).data("id"))
  })

  // Reset new folder dialog fields
  $("#newfolderdialog").on("hidden.bs.modal", ()=> {
    $("#newfolderdialog input,textarea").val("")
  })

  // Autofocus
  $("#newitemdialog,#edititemdialog,#newfolderdialog").on("shown.bs.modal", (ev)=> {
    $(this).find("[autofocus]").focus()
  })

  // Get the folder data to be edited
  $("#editfolderdialog").on("show.bs.modal", (ev)=> {
    folderEditFill($(ev.relatedTarget).data("id"))
  })

  // Get the item data to be shown
  $("#viewitemdialog").on("show.bs.modal", (ev)=> {
    itemViewFill($(ev.relatedTarget).data("id"))
  })
})