
$(function () {
    $.widget("nimbe.DocumentUI", {
        options: {
            searchTerm:'',
            selectedItem: { ItemId: ' ', ItemType: ' ', ItemName: ' ',Permissions: ' '},
            copiedItem: { ItemId: ' ', ItemType: ' ', ItemName: ' ', Permissions: ' ' },
            ToolBar: true,
            container: null,
            folderId: '',
            parentId: '',
            navBar:[],
            table:null
        },
        _create: function (args) {
            var instance = this;
            this.ParentId = '';
            var FromId;
            var AssetId;
            $("<div id='documentUI_newFolder'></div>").appendTo("body").dialog({
                autoOpen: false, width: 709, modal: true, draggable: true, resizable: false, title: "Create a new folder",
            });
            this._fileInput = $("<div style='width:0px;height:0px;overflow:hidden'><input type='file' id='documentUI_fileupload'></div>");
            $("<div id='documentUI_permissions'></div>").appendTo("body").dialog({
                autoOpen: false, width: 709, modal: true, draggable: true, resizable: false, title: "Share Permissions"
            });
            if(this.options.ToolBar === true){
            this._header = $("<nav/>", { 'class': 'container-fluid' }).append(
                    $("<div/>").append(
                        $("<ul/>", { 'class': 'nav navbar-nav' }).append($("<li/>").append(
                            $("<button type='button' title='Upload' class='btn btn-primary'><span class='glyphicon glyphicon-upload'/></button>").on('click', function (e) {
                                $("#documentUI_fileupload").click();
                            }))
                            ).append($("<li/>").append($("<button type='button' title='New Folder' class='btn btn-primary'><span class='glyphicon glyphicon-folder-close'/></button>").on('click',
                                function (e) {
                                    if ($("#documentUI_permissions")) {
                                        $("#documentUI_permissions").empty();
                                    }
                                    url = "AddEditFolder.html";
                                    if (url) {
                                        $("#documentUI_newFolder").load(url);
                                        $("#documentUI_newFolder").dialog("open");
                                    }
                                }))
                            ).append($("<li/>").append($("<button type='button' title='Edit' class='btn btn-primary'><span class='glyphicon glyphicon-share' /></button>").on('click', function (e) {
                                var opts = instance.options;
                                if ($("#documentUI_newFolder")) {
                                    $("#documentUI_newFolder").empty();
                                }
                                if(opts.selectedItem.ItemName !== " "){
                                    var id = opts.selectedItem.ItemId;
                                    var name = opts.selectedItem.ItemName;
                                    var permissions = JSON.parse(opts.selectedItem.Permissions);
                                    url = "AddEditFolder.html";
                                    if(url){
                                        $("#documentUI_permissions").load(url);
                                    }
                                    $("#documentUI_permissions")
                                        .data('FolderName',name.trim())
                                        .data('FolderId', id)
                                        .data('Permissions', permissions)
                                        .dialog("open");
                                    return false;
                                }
                                else
                                {
                                    alert("Please select a folder and try again.");
                                }
                            }))
                        ).append($("<li/>").append($("<button type='button' title='Delete' class='btn btn-primary'><span class='glyphicon glyphicon-trash' /></button>").on('click', function (e) {
                            var selectedItem = getItem();
                            AssetId = selectedItem.assetId;
                            AssetName = selectedItem.assetName;
                            var c = confirm('Are you sure you want to delete "' + AssetName + '"');
                            if (c) {
                                var url = 'Folder/Delete?itemId=' + AssetId;
                                var container = instance.options.container;
                                folderId = $(container).data("FolderId");
                                parentId = $(container).data("ParentId");
                                AjaxDeleteMethod(url, function (data) {
                                    loadData(container, parentId, folderId);
                                }, function (data) {
                                    console.log(data);
                                    alert("Error deleting item ");
                                });
                            }
                        }))
                         ).append($("<li/>").append($("<button type='button' title='Cut' class='btn btn-primary'><span class='glyphicon glyphicon-scissors' /></button>").on('click', function (e) {
                             var Docslist = $('.documentContainer .list-group-item');
                             $('.documentContainer .list-group-item').each(function () {
                                 if ($(this).hasClass('blur')) {
                                     $(this).removeClass('blur');
                                 }
                                 if ($(this).css('background-color') === 'rgb(228, 228, 228)') {
                                     $(this).addClass('blur');
                                 }
                             });
                             FromId = getItem().frmId;
                             AssetId = getItem().assetId;
                         }))
                        ).append($("<li/>").append($("<button type='button' title='Paste' class='btn btn-primary'><span class='glyphicon glyphicon-paste' /></button>").on('click', function (e) {
                            var container = instance.options.container;
                            folderId = $(container).data("FolderId");
                            parentId = $(container).data("ParentId");
                            var ToId = moveItem();
                            var obj = {
                                FromId: FromId,
                                ToId: moveItem(),
                                AssetId: AssetId
                            }
                            AjaxPostMethod('Folder/Move', obj, function (data) {
                                //loadData(container, ToId, folderId);
                                loadData(container, folderId, parentId);
                            }, function (data) { });
                            
                        }))
                    )));
            }
            //this._header.append($("<li>").append($(</li></ul></div></nav>")));
            this._container = $("<div class='documentContainer table-responsive'>");
             $(this._container).append(this._fileInput);
            $(this._container).append(this._header);
            $(this.element).append(this._container);
            this._container.data("FolderId", '');
            this._table = $("<div class='list-group'>");
            $(this._container).append(this._table);
            this.options.container = this._container;
            $("#documentUI_fileupload").on('change', function (e) {
                //var container = $(this).parent().closest('div[class^="documentContainer"]');
                var container = instance.options.container;
                uploadFile(container, this);
            });
            /*$('#folderSubmit').on('click', function (e) {
                var c = instance.options.container;
                e.preventDefault();
                saveFolder(c);
            });*/
            loadData(this._table, '', '',this.options.searchTerm);
        },
        getFolderId: function () {
            return this.ParentId;
        },
        initDialog: function (e) {
            alert('hello');
        },
       getOptions: function () {
            return this.options;
       },
       goBack: function () {

           return this.options.navBar.pop();
       },
       _setOption: function (key, value) {
           this.options[key] = value;
       },
       searchDocs: function (srchTerm) {
           var container = this.options.container;
           loadData(container, '', '',srchTerm);
       },
       refresh: function (f, p) {
           var container = this.options.container;
           loadData(container, f, p);
       }
    });
    var uploadFile = function (container, fileInput) {
        var fileList = fileInput.files;
        var PostData = {};
        PostData.AssetName = fileList[0].name;
        PostData.IsFolderUpload = true;
        PostData.FolderId = $(container).data('FolderId');
        AjaxFormPostMethod('Assets/Add', PostData, 'documentUI_fileupload', function (d) {
            folderId = $(container).data("FolderId");
            parentId = $(container).data("ParentId");
            loadData(container, folderId, parentId);
        });
    }
    var addDocumentItemRow = function (t, d, p) {
        var row = "<a>";
        //var permissions = 
        if (d.ItemType == 'Folder') {
            extension = 'folder';
        }
        else {
            var extension = d.ItemName.replace(/^.*\./, '');
            if (extension == d.ItemName) {
                extension = 'txt';
            } else {
                extension = extension.toLowerCase();
            }

        }
        row = '<a class="list-group-item di_' + extension + '">&nbsp;';
        row = row + d.ItemName + "</a>";
        row = $(row);
        row.data('ItemId', d.ItemKey);
        row.data('ItemType', d.ItemType);
        row.data('ItemParentId', d.ParentId);
        row.data('Permissions', JSON.stringify(d.PermissionObjects));
        $(t).append(row);
        row.on('dblclick', function (e) {
            if ($(this).data("ItemType") == 'Folder') {
                var opts = $('#documentContainer').DocumentUI("getOptions");
                p = opts.navBar.push($(this).data("ItemParentId"));
                loadData(t, $(this).data("ItemId"), $(this).data("ItemParentId"));
            }
            else {
                e.stopPropagation();
                DownloadFileData(opts.selectedItem.ItemId,opts.selectedItem.ItemName);
            }
            e.preventDefault();
        });
        row.on('click', function (e) {
            selectItem($(this));
        });
    }
    var selectItem = function (item) {
        var opts = $('#documentContainer').DocumentUI("getOptions");
        opts.selectedItem.ItemId = $(item).data("ItemId");
        opts.selectedItem.ItemType = $(item).data("ItemType");
        opts.selectedItem.ItemName = $(item).text();
        opts.selectedItem.ItemParentId = $(item).data("ItemParentId");
        opts.selectedItem.Permissions = $(item).data('Permissions');
        var links = (item.context !== undefined) ? item.context.parentElement.childNodes : item[0].parentElement.childNodes;
        for (var x = 0; x < links.length; x++) {
            if (links[x].style.backgroundColor === "rgb(228, 228, 228)") {
                links[x].style.backgroundColor = "rgb(255, 255, 255)";
            }
        }
        var item = (item.context !== undefined) ? item.context.setAttribute( 'style', 'background-color: #e4e4e4') : item[0].setAttribute('style','background-color: #e4e4e4');
        //var item = (item.context !== undefined) ? item.context.attr({ 'style': 'background-color: #e4e4e4', 'id': 'selected' }) : item[0].attr({ 'style': 'background-color: #e4e4e4', 'id': 'selected' });
        //var item = (item.context !== undefined) ? item[0].addClass('selectedDoc') : item.context.addClass('selectedDoc');
     }
    var getItem = function () {
        var getData = {
            frmId : '',
            assetId: '',
            assetName:''
        }
        var opts = $('#documentContainer').DocumentUI("getOptions");
         opts.copiedItem.ItemId = opts.selectedItem.ItemParentId;
         opts.copiedItem.AssetId = opts.selectedItem.ItemId;
         opts.copiedItem.ItemName = opts.selectedItem.ItemName
         getData.frmId = opts.copiedItem.ItemId;
         getData.assetId = opts.copiedItem.AssetId;
         getData.assetName = opts.copiedItem.ItemName;
         return getData;
     }
     var moveItem = function () {
         var opts = $('#documentContainer').DocumentUI("getOptions");
         return opts.selectedItem.ItemId;
     }
     var OpenFolder=function(t,f,p){
         
     }
     var loadData = function (table, folderId, parentId,searchTerm) {
         //var container = $(table).parent().closest('div[class^="documentContainer"]');
         var opts = $('#documentContainer').DocumentUI("getOptions");
         var container = $(opts.container);

         var url = '' ;
         if(searchTerm){
             url = 'Folder/Search?folderId=&searchTerms=' + searchTerm;
         }
         else
         {
             url = 'Folder/Get?ParentId=' + folderId;
         }
         
         $(container).data("FolderId", folderId);
         $(container).data("ParentId", parentId);
         $(table).find("a").remove();

         var navBar = $("#documentContainer").DocumentUI("getOptions").navBar;
         // If nav bar is empty , then this should be first load

         if (navBar.length == 0) { // level 0
             
         }
         else {
             $(table).append($("<a class='list-group-item'><span class='glyphicon glyphicon-level-up'></span></a>").on('dblclick', function (e) {
                 var parentId = $("#documentContainer").DocumentUI("goBack");
                 if (parentId == folderId) {
                     parentId = '';
                 }
                 loadData(table, parentId, '');
             }));
         }

         AjaxGetMethod(url, function (data) {
             if (data == "[]") { return; } 

             var folders = jQuery.grep(data, function (n, i) {
                 return (n.ItemType == 'Folder');
             })

             $.each(folders, function () {
                 addDocumentItemRow(table, this, folderId);
             });

             var files = jQuery.grep(data, function (n, i) {
                 return (n.ItemType != 'Folder');
             })

             $.each(files, function () {
                 addDocumentItemRow(table, this, folderId);
             });
         },
         function () { console.log("Error message"); });
     };

   /* var saveFolder = function (c) {
        var container = $(c);
        var obj = {
            ParentId: $(container).data("FolderId"),
            FolderName :  $('#folderName').val()
        }
        AjaxPostMethod('Folder/Add', obj, function (data) {
            folderId = $(container).data("FolderId");
            parentId = $(container).data("ParentId");
            loadData(container, folderId, parentId);
            $('#documentUI_newFolder').dialog('close');
        }, function (data) { });
    }*/
    var nf = function (e) {
        //debugger;
        alert("new file");
    }
});
