<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <title>设计数据发布系统</title>
    <link href="/Css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="/Scripts/Bootstrap-V1/css/bootstrap.all.css" rel="stylesheet" />
    <link href="/Scripts/Bootstrap-V1/css/layout.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <div class="row-fluid">
        <div class="span12" style="background-color: gray;">
            <div id="accordion">
                <div class="accordion-group">
                    <div class="accordion-heading" style="text-align: right; height: 30px; cursor: pointer;"
                        data-toggle="collapse" data-target="#collapseOne">
                        <span style="width: 2%; display: inline-block; padding-top: 10px; padding-left: 3px;
                            text-align: right;"><a class="accordion-toggle accordion-expand" href="javascript:void(0);"
                                style="text-align: right;">&nbsp;</a> </span>
                    </div>
                    <div id="collapseOne" class="accordion-body in" style="height: auto;">
                        <div class="accordion-inner">
                            <form action="/BootStrap/Martin" class="form-search" id="search" method="get">
                            <div class="lyout_p5">
                                <table>
                                    <tr>
                                        <td>
                                            <label for="PipeLine">
                                                管线号：</label>
                                        </td>
                                        <td>
                                            <input id="Text1" name="PipeLine" type="text" value="" />
                                        </td>
                                        <td>
                                            <label for="Conn">
                                                头/尾部连接类型：</label>
                                        </td>
                                        <td>
                                            <input id="Text2" name="Conn" type="text" value="" />
                                        </td>
                                        <td style="text-align: center;">
                                            <button type="submit" class="btn">
                                                搜索 <i class="icon-search"></i>
                                            </button>
                                        </td>
                                        <td>
                                            &nbsp;
                                        </td>
                                        <td style="width: 10%">
                                            &nbsp;
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label for="system">
                                                系<label style="width: 14px;">&nbsp;</label>统：</label>
                                        </td>
                                        <td>
                                            <div id="system" class="combobox">
                                            </div>
                                        </td>
                                        <td>
                                            <label for="Type">
                                                <span>类</span><label style="width: 77px; height: 20px;">&nbsp;</label><span>型：</span></label>
                                        </td>
                                        <td>
                                            <select>
                                                <option>管线</option>
                                                <option>管件</option>
                                            </select>
                                        </td>
                                        <td>
                                            <label style="width: 20px; margin-left: 86px;">
                                                &nbsp;</label>
                                        </td>
                                        <td>
                                        </td>
                                        <td>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="body-panel-content row-fluid">
        <%-- <div id="toolbar">
            <a class="btn red" id="delete" href="javascript:;"><i class="icon-trash icon-black"></i>删除</a>
            <a class="btn blue thickbox" title='添加新文章' href="javascript:void(0);"><i class="icon-plus icon-black"></i>新增</a>
        </div>--%>
        <div class="datagrid-body row-fluid" style="overflow: auto;">
            <table class="table table-striped table-bordered table-condensed" id="mainTable">
            </table>
        </div>
    </div>
    <div class="pagination pagination-left">
        <div class="datagrid-pager pagination">
            <table cellspacing="0" cellpadding="0" border="0">
                <tbody>
                    <tr>
                        <td>
                            <select class="pagination-page-list">
                                <option>20</option>
                                <option>50</option>
                                <option>80</option>
                                <option>100</option>
                            </select>
                        </td>
                        <td>
                            <div class="pagination-btn-separator">
                            </div>
                        </td>
                        <td>
                            <a href="javascript:void(0)" class="l-btn l-btn-plain l-btn-disabled l-btn-plain-disabled"
                                group="" id=""><span class="l-btn-left"><span class="l-btn-text"><span class="l-btn-empty pagination-first">
                                    &nbsp;</span></span></span></a>
                        </td>
                        <td>
                            <a href="javascript:void(0)" class="l-btn l-btn-plain l-btn-disabled l-btn-plain-disabled"
                                group="" id=""><span class="l-btn-left"><span class="l-btn-text"><span class="l-btn-empty pagination-prev">
                                    &nbsp;</span></span></span></a>
                        </td>
                        <td>
                            <div class="pagination-btn-separator">
                            </div>
                        </td>
                        <td>
                            <span style="padding-left: 6px;">第</span>
                        </td>
                        <td>
                            <input class="pagination-num" type="text" value="1" size="2">
                        </td>
                        <td>
                            <span style="padding-right: 6px;">共26页</span>
                        </td>
                        <td>
                            <div class="pagination-btn-separator">
                            </div>
                        </td>
                        <td>
                            <a href="javascript:void(0)" class="l-btn l-btn-plain" group="" id=""><span class="l-btn-left">
                                <span class="l-btn-text"><span class="l-btn-empty pagination-next">&nbsp;</span></span></span></a>
                        </td>
                        <td>
                            <a href="javascript:void(0)" class="l-btn l-btn-plain" group="" id=""><span class="l-btn-left">
                                <span class="l-btn-text"><span class="l-btn-empty pagination-last">&nbsp;</span></span></span></a>
                        </td>
                        <td>
                            <div class="pagination-btn-separator">
                            </div>
                        </td>
                        <td>
                            <a href="javascript:void(0)" class="l-btn l-btn-plain" group="" id=""><span class="l-btn-left">
                                <span class="l-btn-text"><span class="l-btn-empty pagination-load">&nbsp;</span></span></span></a>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style="clear: both;">
            </div>
        </div>
    </div>
    <div class="pagination-info-right">
        <span style="color: red">当前共选中0条记录</span>&nbsp;&nbsp;&nbsp;显示1到50,共1289记录
    </div>
    <!-- ComboBox 组件 Start -->
    <table>
        <tr>
            <td>
                <div id="demo1" class="combobox">
                </div>
            </td>
        </tr>
    </table>
    <input id="Button1" type="button" onclick="BootStrap.Datagrid.SelectAll();" value="button" />
    <!---------------------------- 我是华丽丽的分割线 ----------------------------->
    <!-- layout 组件 Start -->
    <div class="layout" id="layout">
        <div region="north">
        </div>
        <div region="south">
        </div>
        <div region="center">
        </div>
        <div region="east">
        </div>
        <div region="west">
        </div>
    </div>
    <!-- layout 组件 End -->
    <script src="/Scripts/jquery-1.8.2.min.js"></script>
    <script src="/Scripts/Bootstrap-V1/bootstrap.all.js"></script>
    <script type="text/javascript">

        BootStrap.Datagrid.LoadData("mainTable", {
            title: "",
            url: '/BootStrap/GetJsonData',
            loadMsg: "正在努力加载....",
            rownumbers: false,
            autoRowHeight: true,
            rownumbers: true,
            checkOnSelect: false,
            selectOnCheck: true,
            //toolbar: "#toolbar",
            //singleSelect:true,
            columns: [[
                { field: 'Id', title: '主键', width: 80, align: 'center' },
                { field: 'Name', title: '名称', width: 80, align: 'left' },
                { field: 'Address', title: '地址', width: 80, align: 'left' },
                { field: 'Tel', title: '电话', width: 80, align: 'left' },
                { field: 'Country', title: '国家', width: 80, align: 'center' },
                { field: 'Discription', title: '描述', width: 100, align: 'left' },
                { field: 'LikeSport', title: '运动', width: 80, align: 'left' },
                { field: 'Wage', title: '薪水', width: 80, align: 'left' }
            ]],
            toolbar: [{
                text: "删除",
                iconCls: 'icon-trash',
                handler: function () { alert('删除响应事件'); }
            }, {
                text: "新增",
                iconCls: 'icon-plus',
                handler: function () { alert('新增'); }
            }, {
                text: "编辑",
                iconCls: 'icon-edit',
                handler: function () { alert('编辑'); }
            }],
            rowStyler: function (index, data) {
                //                if (data.Id > 3) {
                //                    return "background-color:red;";
                //                }
            },
            //loadFilter: function (data) { data.rows[0].Name = "ddddddd"; return data; },
            onLoadSuccess: function (data) { /*alert(data.rows.length);*/ },
            onLoadError: function () { },
            onBeforeLoad: function () { return true; },
            onClickRow: function (rowIndex, rowData) { /*alert(rowIndex);*/ },
            //onDblClickRow: function (rowIndex, rowData) { /*alert(rowData);*/ },
            onClickCell: function (rowIndex, field, value) { /*alert(value);*/ },
            //onDblClickCell: function (rowIndex, field, value) { /*alert(value);*/ },
            onSelect: function (rowIndex, rowData) { /*alert(rowIndex+"select");*/ },
            onUnselect: function (rowIndex, rowData) { /*alert(rowIndex+"unselect");*/ },
            onSelectAll: function (rows) { /*alert(rows.length);*/ },
            onUnselectAll: function (rows) { /*alert(rows.length);*/ },
            onCheck: function (rowIndex, rowData) { /*alert("onCheck:" + rowData.Name); */ },
            onUncheck: function (rowIndex, rowData) { /*alert("onUncheck:" + rowData.Address);*/ },
            onCheckAll: function (rows) { /*alert(rows.length);*/ },
            onUncheckAll: function (rows) { /*alert(rows.length);*/ },
            onRowContextMenu: function (e, rowIndex, rowData) { }
        });

        //BootStrap.Tools.ShowMaskLayout("0.8");
        // ComboBox 组件 End 
        BootStrap.ComboBox.Init({
            id: "#demo1",
            valueField: "value",
            textField: "text",
            url: "/BootStrap/GetCbData",
            data: null,
            //filter: null,
            /*搜索功能是否禁用，默认为true*/
            search: true,
            onLoadSuccess: function (data) {
                /*alert("加载成功了");*/
            },
            onLoadError: function () {
                alert("combobox加载出错啦");
            },
            onSelect: function (row) {
                alert(row.text + "  value:" + row.value);
            }
        });
        BootStrap.ComboBox.Init({
            id: "#system",
            valueField: "value",
            textField: "text",
            data: [{ text: "PYZ", value: "1" }, { text: "PYX", value: "2"}],
            /*搜索功能是否禁用，默认为true*/
            search: true
        });


        BootStrap.layout.Init();
    </script>
</body>
</html>
