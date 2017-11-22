(function() {
    var formId = '8B386C67-4A6A-4DCA-A1FD-3E57ED35B335';
    var formName = 'frmNews';
    var db = {
        loadData: function (filter) {
            var d = $.Deferred();
            AjaxGetMethod(getFormDataUrl(formId, formName),
                function (r) {
                var items = [];
                var c = 0;
                for (var j in r) {
                    var item = {};
                    var keys = r[j].FieldsData;
                    for (var i in keys) {
                        item[keys[i].PropertyName] = keys[i].AnswerText;
                    }
                    item.ItemId = r[j].FormDataInstanceId;
                    item.AccessObjectId = r[j].AccessObjectId;
                    item.DataAccessLevel = r[j].DataAccessLevel;
                    db.news.push(item);
                    c++;
                }
                var feeds = { data: db.news, itemsCount: c };
                d.resolve(db.news);
            });
            return d.promise();
        },
        insertItem: function (item) {
            var teamId = $("#team :selected").val();
            var d = $.Deferred();
            var fdata = [];
            for (var key in item) {
                fdata.push({ PropertyName: key, AnswerText: item[key] });
            }
            var formData = {
                FormTemplateId: formId,
                FormName: formName,
                workItem: getWorkItem(formName),
                FieldsData: fdata,
                DataAccessLevel: "GROUP",
                AccessObjectId: teamId
            };
            AjaxPostMethod("Form/Data", formData, function (r) {
                item.ItemId = r.FormDataInstanceId;
                d.resolve(item);
            });
            return d.promise();
        },
        updateItem: function (item) {
            var d = $.Deferred();
            var fdata = [];
            var itemId;
            for (var key in item) {
                if (key == 'ItemId') {
                    itemId = item[key];
                }
                else {
                    fdata.push({ PropertyName: key, AnswerText: item[key] });
                }
            }
            var formData = {
                FormTemplateId: formId,
                FormName: formName,
                workItem: getWorkItem(formName),
                FormDataInstanceId: itemId,
                FieldsData: fdata,
                DataAccessLevel: item.DataAccessLevel,
                AccessObjectId: item.AccessObjectId
            };
            AjaxPostMethod("Form/Data", formData, function (r) {
                d.resolve(item);
            });
            return d.promise();
        },
        deleteItem: function(deletingItem) {
            var d = $.Deferred();
            var itemId = deletingItem.ItemId;
            var url = "Form/Data?instanceId=" + itemId + "&formId=" + formId + "&workItem=" + getWorkItem(formName);
            AjaxDeleteMethod(url, function (data) {

            },
            function (e) {
                console.log(e);
                alert("Error deleting data");
            });
        }
    };
    function getWorkItem(t) {
        workItem = t + '_' + "Role";
        return workItem;
    }
    function getFormDataUrl(id, t) {
        return "Form/Data?formId=" + id + "&workItem=" + getWorkItem(t);
    }
    window.db = db;
    db.news = [];
}());