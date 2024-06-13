import * as PW from './passweaver-gui.js'

var itemSearchTimeout
var itemTypesOptions

async function fillItemTypes() {
  const resp = await jhFetch(`/api/itemtypes`)
  if ( !await PW.checkResponse(resp) ) {
    return
  }

  itemTypesOptions = ''
  const body = await resp.json()
  for ( const itm of body.data ) {
    itemTypesOptions += `<sl-option id='itemtype-${itm.id}' value='${itm.id}'>${itm.description}`
    if ( itm.icon ) {
      itemTypesOptions += `<sl-icon name='${itm.icon}' slot='prefix'>${itm.description}</sl-icon>`
    }
    itemTypesOptions += `</sl-option>`
  }

  jhQuery("#viewtype").innerHTML = itemTypesOptions
}

async function fillItems() {
  jhQuery("#itemstable tbody").innerHTML = ""

  const search = jhValue("#itemsearch")
  const resp = await jhFetch(`/api/itemssearch?search=${search}`)

  // Folder may not be accessible
  if ( !await PW.checkResponse(resp,403) ) {
    return
  }

  const body = await resp.json()
  if ( body.data.length ) {
    let row = ""
    for ( const itm of body.data ) {
      row +=
        `<tr id='row-${itm.id}' data-id='${itm.id}'>`+
        `<td><sl-icon-button id='view-${itm.id}' title='View item' name='file-earmark' data-id='${itm.id}'></sl-icon-button></td>`+
        `<td class='border-start'>${itm.folder.description}</td>`+
        `<td>${itm.title}</td></tr>`
    }
    jhQuery("#itemstable tbody").innerHTML = row
  }

  // Install event handlers
  jhEvent("#itemstable tbody tr[id^=row]", "dblclick", async (ev)=>{
    await itemShow(ev.currentTarget.getAttribute("data-id"))
  })
  jhEvent("#itemstable tbody [id^=view]", "click", async (ev)=>{
    await itemShow(ev.currentTarget.getAttribute("data-id"))
  })
}

async function itemViewFill(item) {
  const resp = await jhFetch(`/api/items/${item}`)
  if ( !await PW.checkResponse(resp) ) {
    jhQuery("#itemviewdialog").hide()
    return
  }

  const body = await resp.json()
  jhValue("#viewtitle", body.data.title)
  jhValue("#viewtype", body.data.type)
  jhValue("#viewemail", body.data.data.email)
  jhValue("#viewdescription", body.data.data.description)
  jhValue("#viewurl", body.data.data.url)
  jhValue("#viewuser", body.data.data.user)
  jhQuery("#viewpassword").setAttribute("type","password")
  jhValue("#viewpassword", body.data.data.password)
}

async function itemShow(item) {
  if ( window.getSelection() ) {
    window.getSelection().empty()
  }
  jhQuery("#itemviewdialog").show()
  await itemViewFill(item)
}

await fillItemTypes()

jhEvent("#itemsearch", "sl-input", async (ev) => {
  if ( itemSearchTimeout ) {
    clearTimeout(itemSearchTimeout)
  }
  if ( jhValue("#itemsearch").length>2 ) {
    itemSearchTimeout = setTimeout(async() => { await fillItems() },250)
  }
})