$(document).ready(function () {
    $("#favModal").on('click', '#dataSave', function (e) {
        var items = getItems();
        insertFavItems(items);
    });
    $("#favModal").on('click', '#dataUpdate', function (e) {
        var items = getItems();
        updateFavItems(items);
    });
    getUser();
    if ($.cookie('cookieStore')) {
        var data = JSON.parse($.cookie("cookieStore"));
        if (data) {
            $.each(data, function (i, e) {
                if (e.visible === false) {
                    var w = e.Id;
                    $('#' + w).parent().hide();
                }
                if (e.checked === false) {
                    $("#mngWidgets input[name='" + e.name + "']").removeAttr('checked');
                } else {
                    $("#mngWidgets input[name='" + e.name + "']").attr('checked', 'checked');
                }
            });
        }
    }
});
$('#srchDocs').on('click', function (e) {
    var srchTerm = $("input[name='srchTerm']").val();
    window.open('DocumentHelper.html?q=' + srchTerm);
    //$("#documentContainer").DocumentUI("searchDocs", srchTerm);
});
$('#settingsBtn').on('click', function (e) { });
function manageWidgets() {
    var widgets = [$('#newsSection'), $('#documentsSection'), $('#favouritesSection'), $('#peopleDirectorySection'),
                    $('#eventsSection'), $('#tasksSection')];
    $('#mngWidgets').dialog({
        modal: true,
        resizable: false,
        autoOpen: true,
        draggable: false,
        closeOnEscape: false,
        buttons: [
             {
                 text: "Apply", type: "button", click: function (e) {
                     toggleWidgets(e);
                 }
             }
        ]
    });
}
function executeOnUserDataReceived() {
    $("#documentContainer").DocumentUI();
    loadComponentData('links.json', showLinksData,1);
    loadComponentData('news.json', showNewsData,1);
    loadComponentData('events.json', showEventsData,1);
    loadFormData(formFavId, formFavName, showFavData,'favData.json');
    getDirectoryData();
}
function toggleWidgets() {
    var checkedWidgets = $("#mngWidgets input:checkbox:checked");
    var uncheckedWidgets = $("#mngWidgets input:checkbox:not(:checked)");
    $.each(checkedWidgets, function (i, e) {
        $.each(widgets, function (j, f) {
            if (e.name === widgets[j].name) {
                var w = widgets[j].Id;
                $('#' + w).parent().show();
                widgets[j].visible = true;
                widgets[j].checked = true;
            }
        });
    });
    if (uncheckedWidgets.length > 0) {
        $.each(uncheckedWidgets, function (i, e) {
            $.each(widgets, function (j, f) {
                if (e.name === widgets[j].name) {
                    var w = widgets[j].Id;
                    $('#' + w).parent().hide();
                    widgets[j].visible = false;
                    widgets[j].checked = false;
                }
            });
        });
    }
    console.log(widgets);
    $.cookie("cookieStore", JSON.stringify(widgets), { expires: 10000 });
}
function getUser() {
    var objData = sessionStorage.getItem("UserData");
    if (objData) {
        objData = JSON.parse(objData);
        setUserData(objData);
    }
    else {
        AjaxGetMethod("Account/User",
              function (data) {
                  var objData = JSON.stringify(data);
                  sessionStorage.setItem("UserData", objData);
                  setUserData(data);
              },
              function (data) {
              });
    }
}
function setUserData(data) {
    var userRoles = [];
    console.log(data);
    if (data){
        if (data.FirstName && data.LastName) {
            $('#loggedUser').html('Welcome, ' + data.FirstName + "  " + data.LastName)
        }
        if (data.Roles !== undefined && data.Roles.length > 0) {
            $.each(data.Roles, function (i, e) {
                var roleName = e.Name;
                roleName = roleName.toLowerCase();
                userRoles.push(roleName);
                if (roleName !== 'content admin' || roleName !== 'team admin') {
                    $('#admin').hide();
                }
                if (roleName === 'content admin') {
                    $('#admin').show();
                    $('#contentAdmin').removeClass('disabled');
                }
                if (roleName === 'team admin') {
                    $('#admin').show();
                    $('#teamAdmin').removeClass('disabled');
                }
            });
        }
    }
    executeOnUserDataReceived();
}
function getItems() {
    var items = [];
    var favName = {};
    favName.PropertyName = 'Name';
    favName.AnswerText = $("#favName").val();
    items.push(favName);
    var favURL = {};
    favURL.PropertyName = 'URL';
    favURL.AnswerText = $("#favURL").val();
    items.push(favURL);
    if (!($('#itemid').val())) {
        var favItemID = {};
        favItemID.PropertyName = 'ItemId';
        favItemID.AnswerText = $('#itemId').val();
        items.push(favItemID);
    }
    return items;
}

function insertFavItems(item) {
    var formData = {
        FormTemplateId: formFavId,
        FormName: formFavName,
        workItem: getWorkItem(formFavName),
        FieldsData: item,
        DataAccessLevel: "PERSONAL"
    };
    AjaxPostMethod("Form/Data", formData, function (r) {
        item.ItemId = r.FormDataInstanceId;
        sessionStorage.removeItem("favData.json");
        refreshFav(item.ItemId,0);
    }, function (data) {

    });
}
function refreshFav(itemId, u) {
    var favName = $("#favName").val();
    var favURL = $("#favURL").val();
    if (favURL.length >= 5 && (favURL.substr(0, 5) != "http:")) {
        favURL = "http://" + favURL;
    } else {
        favURL = favURL;
    }
    if (u === 1) {
        console.log($('[itemId = itemId]'));
        $('[itemId ='+ itemId +']')[0].innerHTML = favName;
        $('[itemId ='+ itemId +']')[0].href = favURL;
    } else {
        var link = $("<a class='favLinks'/>").text(favName).prop('href', favURL).attr('target', '_blank').attr('ItemId', itemId);
        var li = $("<li/>").append(link).appendTo($('#favouriteList')).prepend("<input type='checkbox' class='favCheckbox'>").css('list-style-type', 'none');
    }
}
function updateFavItems(item) {
    var itemId;
    $.each(item, function (i, e) {
        if (item[i].PropertyName === 'ItemId') {
            itemId = e.AnswerText;
        }
    })
    var formData = {
        FormTemplateId: formFavId,
        FormName: formFavName,
        workItem: getWorkItem(formFavName),
        FormDataInstanceId: itemId,
        FieldsData: item,
        DataAccessLevel: "PERSONAL"
    };
    AjaxPostMethod("Form/Data", formData, function (r) {
        sessionStorage.removeItem("favData.json");
        refreshFav(itemId, 1);
    }, function (data) { });
}

function getWorkItem(t) {
    workItem = t + '_' + "Role";
    return workItem;
}

function getFormDataUrl(id, type) {
    return "Form/Data?formId=" + id + "&workItem=" + getWorkItem(type);
}

function loadComponentData(a, b, c) {
    var continueLoad = true;

    if (c) {
        var objData = sessionStorage.getItem(a);
        if(objData)
        {
            objData = JSON.parse(objData);
            continueLoad = false;
            b(objData);
        }
    }
    if (continueLoad) {
        $.ajax({
            url: 'js/json/' + a,
            dataType: 'json',
            data: { json: JSON.stringify() },
            success: function (response) {
                loadFormData(response.formId, response.formName,b, a,c);
            }
        });
    }
}

function loadFormData(formId, formName, h, a, c) {
    var continueLoad = true;
    if (c) {
        var objData = sessionStorage.getItem(a);
        if(objData)
        {
            objData = JSON.parse(objData);
            continueLoad = false;
            h(objData);
        }
    }
    if (continueLoad) {
        AjaxGetMethod(getFormDataUrl(formId, formName),
            function (d) {
                if (c) {
                    var objData = JSON.stringify(d);
                    sessionStorage.setItem(a, objData);
                }
                h(d);
            },
            function (data) { });
    }
}

function convertToObj(data) {
    var items = [];
    var c = 0;
    for (var j in data) {
        var item = {};
        var keys = data[j].FieldsData;
        for (var i in keys) {
            item[keys[i].PropertyName] = keys[i].AnswerText;
        }
        item.ItemId = data[j].FormDataInstanceId;
        items.push(item);
        c++;
    }
    return items;
}

/////////////////// Links Section ////////////////////
function showLinksData(frmData) {
    var items = convertToObj(frmData);
    items.sort(function (a, b) {
        return a.orderby - b.orderby;
    });
    var portallnksSection = $("#linksSection");
    var linksListContent = $("<div/>", { "class": "collapse in" });
    $.each(items, function (i, e) {
        if (e.Type === "header") {
            var heading = $("<a class='list-group-item list-group-item-custom'/>").text(e.Name).attr('href', '#').attr("data-parent", "#sideMenu");
            linksListContent = $("<div/>", { "class": "collapse in" });
            portallnksSection.append(heading[0]);
        } else {
            if (e.URL !== undefined) {
                if ((e.URL).length >= 5 && ((e.URL).substr(0, 5) != "http:")) {
                    e.URL = "http://" + e.URL;
                } else {
                    e.URL = e.URL;
                }
            }
            var link = $("<a class='list-group-item'/>").text(e.Name).attr('href', e.URL).attr('target', '_blank');
            linksListContent.append(link).appendTo(portallnksSection);
        }
    });
}

/////////////////// News Section ////////////////////
function showNewsData(frmData) {
    var items = convertToObj(frmData);
    var newsSection = $("#newsSection");
    newsList = $("<ul/>", { "id": 'newsContent' });
    $.each(items, function (i, e) {
        if (e.Name !== undefined) {
            if (e.URL) {
                var test = '<a href="http://' + e.URL + '" target="_blank">' + e.Name + '</a>';
                //var link = $('<a/>').text(e.Name).prop('href="http://', e.URL).attr('target', '_blank');
                var link = $(test);
            } else {
                link = $('<a/>').text(e.Name).prop('href', "newsDisplay.html?Id=" + e.ItemId).attr('target', '_blank');
            }
            if (link !== undefined) {
                var li = $("<li/>").append(link).appendTo(newsList);
            }
        }
    });
    newsSection.append(newsList[0]);
}

/////////////////// Favourites Section ////////////////////
function showFavData(frmData) {
    var items = convertToObj(frmData);
    var favSection = $("#favouriteContent");
    favList = $("<ul/>", { "id": 'favouriteList' });
    $.each(items, function (i, e) {
        if (e.Name !== undefined) {
            if (e.URL !== undefined) {
                if ((e.URL).length >= 5 && ((e.URL).substr(0, 5) != "http:")) {
                    e.URL = "http://" + e.URL;
                } else {
                    e.URL = e.URL;
                }
                var link = $("<a class='favLinks'/>").text(e.Name).prop('href', e.URL).attr('target', '_blank').attr('ItemId', e.ItemId);
            }
            if (link !== undefined) {
                var li = $("<li/>").append(link).appendTo(favList);
            }
        }
    });
    favSection.append(favList[0]);
}

function showMenuBar() {
    $('#menuBar').slideToggle('fast');
    if ($('#favouriteList li:has(input[type=checkbox])').length <= 0) {
        $("#favouriteList li").prepend("<input type='checkbox' class='favCheckbox'>").css('list-style-type', 'none');
    } else {
        $("#favouriteList li input[type=checkbox]").remove();
        $("#favouriteList li").css('list-style-type', 'disc')
    }
}

function addFav() {
    $("#favModal-dialog input[name=favName]").val("");
    $("#favModal-dialog input[name=favURL]").val("");
    $('#dataSave').show();
    $("#dataUpdate").hide();
    $('#favModal').modal('show');
}

function editList() {
    /*$(".favCheckbox").trigger('click',function () {
        $(this).siblings('input:checkbox').prop('checked', false);
    });
    var selected = $("#favouriteList li input:checkbox:checked");*/
    var selected = $("#favouriteList li input:checkbox:checked:eq(0)").next();
    if (selected.length > 0) {
        $("#favModal-dialog input[name=favName]").val(selected[0].innerHTML);
        //$.each(selected[0], function (i, e) {
        //    if (e.attributes[i].name === 'href') {
        //        $("#favModal-dialog input[name=url]").val(e.value);
        //    }
        //if (selected[0].attributes[i].name === 'href') {
        //     $("#favModal-dialog input[name=url]").val(selected[0].attributes[i].value);
        // }
        // if (selected[0].attributes[i].name === 'itemid') {
        //     $("#favModal-dialog input[name=url]").val(selected[0].attributes[i].value);
        // } 
        //});
        //$("#dataUpdate").prop("disabled", false);
        $("#favModal-dialog input[name=favURL]").val(selected[0].attributes[1].value);
        $("#favModal-dialog input[name=itemId]").val(selected[0].attributes[3].value);
        $('#dataSave').hide();
        $("#dataUpdate").show();
        $('#favModal').modal('show');
    } else {
        alert("Please select the item to Edit");
    }
}

function deleteFav() {
    if ($("#favouriteList li input:checkbox:checked").length === 0) {
        alert("Please select the items to remove");
    } else {
        $("#favouriteList li input:checkbox").each(function () {
            if ($(this).is(":checked")) {
                $(this).parent().remove();
                var selectedItems = $(this);
                $.each(selectedItems, function (i, e) {
                    var itemId = e.nextElementSibling.attributes['itemid'].value;
                    var itemName = e.nextElementSibling.innerHTML;
                    var url = "Form/Data?instanceId=" + itemId + "&formId=" + formFavId + "&workItem=" + getWorkItem(formFavName);
                    AjaxDeleteMethod(url, function (data) {
                        alert(itemName + ' will be deleted');
                        //return "The \"" + itemName + "\" will be removed. Are you sure?";
                    },
                    function (e) {
                        alert("Error deleting data");
                    });
                });
            }
        });
    }
}

/////////////////// People Directory Section ////////////////////
function getDirectoryData() {
    var Itemkey = "PeopleDirectoryData";
    var data = sessionStorage.getItem(Itemkey);
    if (data) {
        var objData = JSON.parse(data);
        showDirectoryData(objData);
    }
    else {
        var obj = {
            SearchTerm: '',
            StartIndex: '',
            PageCount: ''
        }
        AjaxPostMethod("Account/Users", obj, function (data) {
            var objData = JSON.stringify(data);
            sessionStorage.setItem(Itemkey, objData);
            showDirectoryData(data);
        }, function (data) { });
    }
}

function showDirectoryData(data) {
    var directorySection = $("#peopleDirectorySection");
    peopleList = $("<ul/>", { "id": 'directoryContent' });
    $.each(data, function (i, e) {
        if (e.FirstName !== undefined) {
            var name = $('<strong><a href="#">' + e.FirstName + " " + e.LastName + '</a></strong>');
            var details = $('<div/>').append($('<p><span><strong>Email:</strong>&nbsp;</span><span>' + e.Email + '</span></p>'))
                          .append($('<p><span><strong>Telephone:</strong>&nbsp;</span><span>' + e.Telephone + '</span></p>'))
                          .append($('<p><span><strong>Dept:</strong>&nbsp;</span><span>' + e.Department + '</span></p>'));
            var li = $("<li/>").append(name).append(details).prependTo(peopleList);
        }
    });
    directorySection.append(peopleList[0]);
    $("#directoryContent").listnav({
        includeNums: false,
        includeAll: false,
        flagDisabled: false
        /*onClick: function (letter) {
            //getDirectoryData(letter);
            //console.log(u); alert("click" + u);
        }*/
    });
}


/////////////////// Events Section ////////////////////
function showEventsData(frmData) {
    var items = convertToObj(frmData);
    var k = 0;
    var events = [];
    for (var i = 0; i < items.length; i++) {
        var eventsData = new Object();
        eventsData.title = items[i].Name;
        eventsData.description = items[i].Description;
        dt = new Date(items[i].Date);
        st = new Date(items[i].StartTime);
        eventsData.datetime = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), st.getHours(), st.getMinutes()); //Date format is changed from toString format to new Date(2017, 6, 20) 
        if (items[i].StartTime !== undefined || items[i].EndTime !== undefined) {
            eventsData.starttime = items[i].StartTime.slice(11, 16);
            eventsData.endtime = items[i].EndTime.slice(11, 16);
        }
        events.push(eventsData);
        k++;
    }
    $('#calender').eCalendar({
        weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        textArrows: { previous: '<', next: '>' },
        eventTitle: 'Events',
        url: '',
        firstDayOfWeek: 0,
        events: events
    });
}