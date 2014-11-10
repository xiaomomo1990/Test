/**
* bootstrap组件及扩展
* @author martin
* @namespace BootStrap
* @description 以bootstrap提供的js和css为基础，对其进行扩展
* @datetime 20140929
*/
var BootStrap = window.BootStrap || {};

/**
* 初始化这里用到的扩展函数
*/
; (function () {
    String.format = function (str) {
        var args = arguments, re = new RegExp("%([1-" + args.length + "])", "g");
        return String(str).replace(re,
            function ($1, $2) {
                return args[$2];
            });
    };
    String.htmlEncode = function (str) {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    String.wrap = function (str) {
        return str.replace(/\r\n/g, '<br />');
    };
    Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    };
    Array.prototype.removeValue = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                this.splice(i, 1);
                return;
            }
        }
    };
    Array.prototype.delRepeat = function () {
        var newArray = [];
        var provisional = {};
        for (var i = 0, item; (item = this[i]) != null; i++) {
            if (!provisional[item]) {
                newArray.push(item);
                provisional[item] = true;
            }
        }
        return newArray;
    };

})();
/**
* 列表组件
* @namespace BootStrap.Datagrid
* @description bootstrap列表页面的扩展
*/
BootStrap.Datagrid = {
    AllGridDataCache: [],
    DataGridSetData: {
        //DataGrid列配置对象
        columns: undefined,
        //同列属性，但是这些列将会被冻结在左侧。
        frozenColumns: undefined,
        //该方法类型请求远程数据。
        method: "POST",
        //顶部工具栏的DataGrid面板。可能的值：1) 一个数组，每个工具属性都和linkbutton一样。2) 字符串ID,选择器指定的工具栏。 
        toolbar: null,
        //如果为true，则在同一行中显示数据；为false，过长就会换行
        nowrap: true,
        //一个URL从远程站点请求数据
        url: null,
        /*当前页的数据*/
        data: null,
        /*所有页的数据，如果url为空，就判断这个是否有数据*/
        gridData: null,
        loadMsg: "正在努力加载数据...",
        title: null,
        //如果为true，则在DataGrid控件底部显示分页工具栏。
        pagination: true,
        rownumbers: false, /*显示行号*/
        checkbox: false, /*显示checkbox*/
        singleSelect: true,
        /*如果为true，当用户点击行的时候该复选框就会被选中或取消选中。如果为false，当用户仅在点击该复选框的时候才会呗选中或取消*/
        checkOnSelect: true,
        /*如果为true，单击复选框将永远选择行。如果为false，选择行将不选中复选框。*/
        selectOnCheck: false,
        //定义分页工具栏的位置。可用的值有：'top','bottom','both'
        pagePosition: "bottom", //XXXXXX
        pageIndex: 1,
        pageSize: 20,
        pageList: [20, 50, 80, 100],
        queryParams: {},
        sortName: null, //XXXXXX
        //只能是'asc'或'desc'
        sortOrder: "asc", //XXXXXX
        /*返回行样式 function (index, row) { return null; }*/
        rowStyler: null,
        /*返回过滤数据显示。该函数带一个参数'data'用来指向源数据,您可以改变源数据的标准数据格式。
        这个函数必须返回包含'total'和'rows'属性的标准数据对象。 function (data) { return null; }*/
        loadFilter: null,
        onLoadSuccess: null,
        onLoadError: null,
        /*在载入请求数据数据之前触发 function () { return true; }*/
        onBeforeLoad: null,
        /*点击一行的时候触发 function (rowIndex, rowData) { }*/
        onClickRow: null,
        /*双击行事件 function (rowIndex, rowData) { }*/
        onDblClickRow: null, //onDblClickRow还不完美，因为触发这个事件，会触发两次click，悲剧
        /*点击一个单元格的时候触发 function (rowIndex, field, value) { }*/
        onClickCell: null,
        /*双击一个单元格的时候触发 function (rowIndex, field, value) { }*/
        onDblClickCell: null, //onDblClickCell还不完美，因为触发这个事件，会触发两次click，悲剧
        /*择一行的时候触发 function (rowIndex, rowData) { }*/
        onSelect: null,
        /*取消选择一行的时候触发  function (rowIndex, rowData) { }*/
        onUnselect: null,
        /*选择所有行的时候触发 function (rows) { }*/
        onSelectAll: null,
        /*取消选择所有行的时候触发 function (rows) { }*/
        onUnselectAll: null,
        /*勾选一行的时候触发  function (rowIndex, rowData) { }*/
        onCheck: null,
        /*取消勾选一行的时候触发 function (rowIndex, rowData) { }*/
        onUncheck: null,
        /*勾选所有行的时候触发 function (rows) { }*/
        onCheckAll: null,
        /*取消勾选所有行的时候触发 function (rows) { }*/
        onUncheckAll: null,
        onRowContextMenu: function (e, rowIndex, rowData) { },


        //#region  grid的状态，这些值不能手动设置
        /*是否首次加载页面*/
        isFirstLoad: true,
        isCheckOnSelectEvent: false,
        selectTrIndexColl: [],
        /*已经选中列表中的checkbox的索引集合*/
        checkedBoxIndexColl: [],
        /*全选checkbox的状态*/
        cacheGlobalBoxStatus: false,
        /*是否是jQuery调用click方法执行点击*/
        isJqClickCheckBox: { isJqClick: false, value: false },
        /*列表的TableId*/
        tableId: null,
        /*全选checkbox的ID*/
        checkAllId: "ck_all",
        /*是否是点击全选按钮*/
        isCheckAllEvent: false
        //#endregion
    },
    /**
    * 列表列的拖拽功能
    * @namespace BootStrap.Datagrid.DragTableColumn
    * @description 支持动态改变列的宽度
    */
    DragTableColumn: {
        //是否是左边冻结datagrid
        _isLeftDg: true,
        //表格列表头是否有左键点击进行拖拽操作
        _headDivHasMouseDown: false,
        //点击的表头是那一列div的前面
        _witchHeadDivMouseDown: null,
        //拖拽操作开始时，鼠标的X坐标
        _mouseDownX: 0,
        //分割线html
        _resizeProxyHtml: '<div class="resize_proxy" style="left: 329px;position: absolute;width: 1px;height: 10000px;top: 0;cursor: e-resize;display: none;background: #aac5e7;z-index:100;"></div>',
        //分割线jquery对象，为什么缓存起来，防止查找因为很耗时，会出现闪动很厉害        
        _jqResizeProxyObject: null,
        Init: function (tableId) {
            if (!tableId) {
                return;
            }
            this.CreateResizeProxyLine(); //创建列拖动标识竖线
            var currGridData = BootStrap.Datagrid.GetGridDataById(tableId);
            var hasFrozenData = currGridData.frozenColumns && currGridData.frozenColumns.length > 0;
            if (hasFrozenData) {
                var lhTid = tableId + "_lh_t";
                this.BandDragEvent(lhTid, tableId + "_ldg");
                this.MouseMoveEvent(lhTid);
            }
            if (currGridData.columns && currGridData.columns.length > 0) {
                var rhTid = tableId + "_rh_t";
                this.BandDragEvent(rhTid, tableId + "_rdg");
                this.MouseMoveEvent(rhTid);
            }
            $("body").mouseup(function (e) {//松开鼠标
                if (BootStrap.Datagrid.DragTableColumn._headDivHasMouseDown) {
                    BootStrap.Datagrid.DragTableColumn._headDivHasMouseDown = false;
                    if (BootStrap.Datagrid.DragTableColumn._witchHeadDivMouseDown) {
                        var newWidth;
                        var prevDiv = BootStrap.Datagrid.DragTableColumn._witchHeadDivMouseDown.parent().prev().children().eq(0);
                        var cursorX = BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject.offset().left;
                        var position = 0;
                        var funSetViewW = function (lviewId, width) {
                            var lview = $(lviewId);
                            lview.css("width", (lview.width() + width) + "px");
                        };
                        if (cursorX > BootStrap.Datagrid.DragTableColumn._mouseDownX) {
                            position = cursorX - BootStrap.Datagrid.DragTableColumn._mouseDownX;
                            newWidth = prevDiv.innerWidth() + position;
                            if (BootStrap.Datagrid.DragTableColumn._isLeftDg) {
                                funSetViewW(tableId + "_lview", position);
                                funSetViewW(tableId + "_lh_t", position);
                                funSetViewW(tableId + "_lbody", position);
                            }
                        } else {
                            position = BootStrap.Datagrid.DragTableColumn._mouseDownX - cursorX;
                            newWidth = prevDiv.innerWidth() - position;
                            if (BootStrap.Datagrid.DragTableColumn._isLeftDg) {
                                funSetViewW(tableId + "_lview", -position);
                                funSetViewW(tableId + "_lh_t", -position);
                                funSetViewW(tableId + "_lbody", -position);
                            }
                        }

                        prevDiv.css("width", String(newWidth) + "px").parent().css("width", String(newWidth + 1) + "px");
                        BootStrap.Datagrid.DragTableColumn._witchHeadDivMouseDown.css("cursor", "default");
                        BootStrap.Datagrid.DragTableColumn._witchHeadDivMouseDown = null;
                    }
                    BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject.hide(); //隐藏分割线
                    BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject = null; //释放对象
                    $("body").unbind("selectstart");
                }
            });

        },
        BandDragEvent: function (headTid, bodyTid) {
            $(headTid + " th:gt(1)").css("padding", "0"); //th中的div必须贴近th的边缘
            var threadDiv = $(headTid + " th div:gt(0)");
            if (threadDiv.length > 0) {
                threadDiv.each(function (i) {
                    $(this).mouseenter(function (e) {
                        BootStrap.Datagrid.DragTableColumn.HeadDivMouseEvent($(this), event || e);
                    }).mouseleave(function () {
                        BootStrap.Datagrid.DragTableColumn.HeadDivMouseEvent($(this), event || e);
                    }).mousedown(function (e) {
                        if (event.button == 1 || event.button == 0) {//左键单击  
                            var dragColHandler = BootStrap.Datagrid.DragTableColumn;
                            var isTrue = dragColHandler.HeadDivMouseEvent($(this), event || e);
                            if (isTrue) {
                                dragColHandler._witchHeadDivMouseDown = $(this);
                                dragColHandler._headDivHasMouseDown = true;
                                dragColHandler._mouseDownX = event.clientX;
                                if (headTid.indexOf("_lh_t") > -1) {
                                    dragColHandler._isLeftDg = true;
                                } else {
                                    dragColHandler._isLeftDg = false;
                                }
                                var mainT = $(headTid);
                                var tableHeight = mainT.height() + $(bodyTid).height();
                                dragColHandler._jqResizeProxyObject = dragColHandler.GetResizeProxyLine();
                                dragColHandler._jqResizeProxyObject.css({ "height": tableHeight + "px", "left": event.clientX + "px", "top": mainT.offset().top + "px" }).show();
                                $("body").bind("selectstart", function () {
                                    return false;
                                });
                            }
                        }
                    });
                });
            }
        },
        MouseMoveEvent: function (headTid) {
            $(headTid).mousemove(function () {//按住鼠标移动事件
                if (BootStrap.Datagrid.DragTableColumn._headDivHasMouseDown) {
                    BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject.css("left", event.clientX + "px");
                }
            });
        },
        //创建分割线:竖线
        CreateResizeProxyLine: function () {
            var proxy = $(".resize_proxy");
            if (proxy.length < 1) {
                $("body").append($(this._resizeProxyHtml));
            }
        },
        GetResizeProxyLine: function () {
            return $(".resize_proxy");
        },
        HeadDivMouseEvent: function (jqDiv, e) {
            var divLeft = jqDiv.offset().left;
            return this.ChangeCursor(jqDiv, divLeft, e);
            //var divRight = jqDiv.offset().left + jqDiv.width();
            //var result = this.ChangeCursor(jqDiv, divRight, e);
            //if (result) {
            //   return result;
            //}
        },
        ChangeCursor: function (jqDiv, leftOrRight, e) {
            if (Math.abs(leftOrRight - e.clientX) < 4) {
                jqDiv.css("cursor", "e-resize");
                return true;
            } else {
                jqDiv.css("cursor", "default");
                return false;
            }
        }
    },
    Init: function (tableId, setData) {
        if (tableId.indexOf("#") == -1) {
            BootStrap.Window.Messager.Alert({ title: "错误", msg: tableId + "格式是错误的，必须是#+id的格式" });
            return;
        }
        this.LoadGridMaskLayout(tableId, setData);
        if (this.JudegIsFirstLoad(tableId)) {
            this.FirstLoadAction(tableId);
        }
        this.ResetDataBeforeLoad(tableId);
        this.UpdateSetData(tableId, setData); //更新用户设置的数据
        this.BeginLoadDataEvent(tableId); //生成列表前的事件
        this.GenerateTableHtml(tableId); //生成列表table的html
        this.EndLoadDataEvent(tableId); //列表和分页展示完成后执行的函数   
        this.EndLoadAction(tableId); //列表加载完成执行的额外操作
    },
    LoadGridMaskLayout: function (tId, newSetData) {
        var msg = this.DataGridSetData.loadMsg;
        if (newSetData && newSetData.loadMsg) {
            msg = newSetData.loadMsg;
        } else {
            var currGridData = this.GetGridDataById(tId);
            if (currGridData && currGridData.loadMsg) {
                msg = currGridData.loadMsg;
            }
        }
        BootStrap.Pager.ShowGridMaskLayout(msg); //调用遮罩层
    },
    /*获取tableId，去掉特殊字符：# .（类标记） 等*/
    GetTableId: function (tId) {
        return BootStrap.Tools.GetIdNameTrimOther(tId);
    },
    /*根据tableId获取其对应的数据*/
    GetGridDataById: function (tId) {
        var data = BootStrap.Tools.GetDataByLabel(BootStrap.Datagrid.AllGridDataCache, "label", tId);
        if (data) return data.gridSetData;
        return null;
    },
    /*是否是第一次加载，true:是；false:否*/
    JudegIsFirstLoad: function (tId) {
        var gdCache = BootStrap.Datagrid.AllGridDataCache;
        for (var i in gdCache) {
            if (gdCache[i].label == tId) {//存在说明不是第一次加载
                return false;
            }
        }
        return true;
    },
    /*列表第一次初始化执行的方法*/
    FirstLoadAction: function (tId) {
        var grids = BootStrap.Datagrid;
        var tools = BootStrap.Tools;
        grids.AllGridDataCache.push({//缓存的数据
            label: tId,
            gridSetData: tools.Clone(grids.DataGridSetData)
        });
        var currGrid = this.GetGridDataById(tId);
        currGrid.tableId = tId;
        currGrid.checkAllId = BootStrap.Tools.GetIdNameTrimOther(tId) + "_ck_all"; //设置全选的checkbox的ID

    },
    /*列表加载完成执行的方法*/
    EndLoadAction: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        if (currGridData.isFirstLoad) {//第一次加载就执行
            $(tId).css("display", "none"); //隐藏table
            BootStrap.InitPage.Init(tId); //设置大小
        }
        currGridData.isFirstLoad = false; //最后设置不是第一次加载
        var hideTime = 100;
        if (currGridData.pageSize >= 50) {
            hideTime = 500;
        }
        var tempT = setTimeout(function () {
            BootStrap.Pager.HideGridMaskLayout(); //隐藏遮罩层
            clearTimeout(tempT);
        }, hideTime);
    },
    /*执行之前重置一些数据*/
    ResetDataBeforeLoad: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        BootStrap.Datagrid.ChangeGlobalBoxStatus(tId, false); //取消选中，因为缓存  
        currGridData.checkedBoxIndexColl.length = 0;
    },
    UpdateSetData: function (tId, newSetData) {
        var currGridData = this.GetGridDataById(tId);
        currGridData = $.extend(currGridData, newSetData);
    },
    LoadDataBeforeEvent: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        if (currGridData.onBeforeLoad) {//在载入请求数据数据之前触发
            currGridData.onBeforeLoad();
        }
    },
    BeginLoadDataEvent: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        if (!currGridData.url && !currGridData.gridData) {
            return;
        }
        this.LoadDataBeforeEvent(tId);
        this.GetGridDataByUrlOrLocal(tId);
    },
    /*获取远程或者本地数据*/
    GetGridDataByUrlOrLocal: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        if (!currGridData.queryParams) {
            currGridData.queryParams = {};
        }
        currGridData.queryParams.pageIndex = currGridData.pageIndex;
        currGridData.queryParams.pageSize = currGridData.pageSize;
        var gridSetData = currGridData;
        if (gridSetData.url) {
            $.ajax({
                url: gridSetData.url,
                type: gridSetData.method,
                async: false,
                data: gridSetData.queryParams,
                success: function (data) {
                    if (currGridData.loadFilter) { //过滤数据
                        if (data && data.total > 0) {
                            data = currGridData.loadFilter(data);
                        }
                    }
                    currGridData.data = data;
                },
                error: function () {
                    if (currGridData.onLoadError) {
                        currGridData.onLoadError();
                    }
                }
            });
        } else {
            var rows = gridSetData.gridData.rows;
            if (gridSetData.gridData && rows) {
                currGridData.data = { total: gridSetData.gridData.total, rows: [] };
                var begin = (gridSetData.pageIndex - 1) * gridSetData.pageSize;
                var end = begin + gridSetData.pageSize;
                for (var i = begin; i < end; i++) {
                    currGridData.data.rows.push(rows[i]);
                }
            }

        }
    },
    /*生成html数据*/
    GenerateTableHtml: function (tId) {
        var currGridData = this.GetGridDataById(tId);

        if (currGridData.isFirstLoad) {
            this.AddGridBody(tId); //表头和列表的框架
        }
        this.GenerateGridHtml(tId);
        if (currGridData.isFirstLoad) {
            //table.addClass(tId + "_body_panel").find("table").css({ "border-bottom": "1px solid #ddd", "border-right": "1px solid #ddd" });
        }
        if (currGridData.pagination) {
            BootStrap.Pager.SetPageHtmlAjax(tId, {
                pageIndex: currGridData.pageIndex,
                pageSize: currGridData.pageSize,
                pageTotalCount: currGridData.data.total,
                hrefUrl: currGridData.url,
                pageList: currGridData.pageList,
                pageEvent: null,
                eventData: null
            });
        }

    },
    /*生成冻结列表头html*/
    LoadFrozenHead: function (currGridData) {
        var headTemplate = '<thead><tr class="datagrid-header">%1</tr></thead>';
        var headTd = '<th field="%3" class="table-common-th %1" style="padding:0;"><div class="datagrid-cell-nowrap table-th-div body-cell-div-height %1" style="padding:0;">%2</div></th>';
        var tId = currGridData.tableId;
        var headHtml = [];
        var colunmData = currGridData.frozenColumns;
        if (colunmData && colunmData.length > 0) {
            var rownumberData = this.GetRownumberData(tId);
            headHtml.push('<th class="table-rownumbers-thtd" style="padding:0px;width:' + rownumberData.widthPx + 'px;"><div class="body-cell-div-height" style="padding:0;margin:0;left:0;right:0;width:' + (rownumberData.widthPx - 6) + 'px;">&nbsp;</div></th>');
            if (currGridData.checkbox) {
                headHtml.push('<th class="table-first-thtd" style="padding:0;"><input type="checkbox" id="' + currGridData.checkAllId + '" class="group-checkable" /></th>');
            }
            var allWidth = 0; //总宽度
            $.each(colunmData[0], function (i, d) {
                var className = "grid_cell_" + d.field;
                var _tempW = d.width ? d.width : 80;
                allWidth += _tempW;
                //var width = "width:" + _tempW + "px;";
                headHtml.push(String.format(headTd, className, d.title, d.field));
            });
            allWidth = allWidth + 20 + parseInt(rownumberData.widthPx); //前面两列的宽度
            if (!currGridData.columns || currGridData.columns.length < 1) {//没有常规列的时候才创建填充th                
                headHtml.push(this.GetHeadLastTh(allWidth, (tId + "_body_panel"))); //最后一个th填充
            }
            headTemplate = String.format(headTemplate, headHtml.join(" ")); //得到冻结列的表头
            //设置左边的冻结列宽度
            $(tId + "_lview," + tId + "_lh_t," + tId + "_lbody").css("width", allWidth + "px");

        }
        return headTemplate;
    },
    /*生成非冻结列表头html*/
    LoadGeneralHead: function (currGridData) {
        var tId = currGridData.tableId;
        var headTemplate = '<thead><tr class="datagrid-header">%1</tr></thead>';
        var headTd = '<th field="%3" class="table-common-th %1" style="padding:0;"><div class="datagrid-cell-nowrap table-th-div body-cell-div-height %1" style="padding:0;">%2</div></th>';
        var headHtml = [];
        var colunmData = currGridData.columns;
        if (colunmData && colunmData.length > 0) {
            if (!currGridData.frozenColumns || currGridData.frozenColumns.length < 1) {
                var rownumberData = this.GetRownumberData(tId);
                headHtml.push('<th class="table-rownumbers-thtd" style="padding:0px;width:' + rownumberData.widthPx + 'px;"><div class="body-cell-div-height" style="padding:0;width:' + (rownumberData.widthPx - 6) + 'px;">&nbsp;</div></th>');
                if (currGridData.checkbox) {
                    headHtml.push('<th class="table-first-thtd" style="padding:0;"><input type="checkbox" id="' + currGridData.checkAllId + '" class="group-checkable" /></th>');
                }
            }
            var allWidth = 0; //总宽度
            $.each(colunmData[0], function (i, d) {
                var className = "grid_cell_" + d.field;
                var _tempW = d.width ? d.width : 80;
                allWidth += _tempW;
                //var width = "width:" + _tempW + "px;";
                headHtml.push(String.format(headTd, className, d.title, d.field));
            });
            headHtml.push(this.GetHeadLastTh(allWidth, (tId + "_rview"))); //最后一个td是填充作用
            headTemplate = String.format(headTemplate, headHtml.join(" ")); //得到冻结列的表头
            var panelW = $(tId + "_body_panel").width();
            var rightW = panelW;
            if (currGridData.frozenColumns && currGridData.frozenColumns.length > 0) {//如果有冻结列，要减去左边的宽度
                var leftW = $(tId + "_lbody").width();
                rightW = panelW - leftW;
            }
            $(tId + "_rview," + tId + "_rbody," + tId + "_rh_div").css("width", rightW + "px"); //设置左边的冻结列宽度
        }
        return headTemplate;
    },
    /*获取表头最后一个th*/
    GetHeadLastTh: function (allWidth, panelId) {
        var lastThW = "";
        var panelWidth = $(panelId).width(); //grid最外层div的总宽度
        if (allWidth < panelWidth) {//如果总宽度小于800
            lastThW = "width:" + (Math.ceil((panelWidth - allWidth) / panelWidth * 100)) + "%;";
        }
        return ('<th class="table-last-thtd" style="border-top:0;' + lastThW + '"><div class="datagrid-cell">&nbsp;</div></th>'); //最后一个td是填充作用
    },
    /*创建各个列宽度的样式类*/
    CreateWidthStyle: function (currGridData) {
        var style = "";
        var funGetStyle = function (data) {
            var _sty = "";
            if (data && data.length > 0) {
                $.each(data[0], function (i, d) {
                    _sty += ".grid_cell_" + d.field + "{width:" + (d.width ? d.width : 80) + "px;} ";
                });
            }
            return _sty;
        };
        style += funGetStyle(currGridData.frozenColumns);
        style += funGetStyle(currGridData.columns);
        BootStrap.Tools.CreateStyle2(style); //创建样式
    },
    GetFrozenColumnsHtml: function (tId) {

    },
    /*生成非冻结列*/
    GetColumnsHtmlByData: function (currGridData, colData, isFrozen) {
        var bodyTrHtml = [];
        var tds = [];
        if (currGridData.data && currGridData.data.rows) {
            var getAlign = function (val) {
                if (val) {
                    return "text-align:" + val + ";";
                } else {
                    return "text-align:left;";
                }
            };
            var rownumberData = this.GetRownumberData(currGridData.tableId); //获取rownumber的数据
            $.each(currGridData.data.rows, function (index, data) {
                tds.length = 0;
                var hasRowNum = false;
                if (isFrozen) {
                    hasRowNum = true;
                } else {
                    if (!currGridData.frozenColumns || currGridData.frozenColumns.length < 1) {
                        hasRowNum = true;
                    }
                }
                if (hasRowNum) {
                    tds.push('<td class="table-rownumbers-thtd" style="padding:0;width:' + (rownumberData.widthPx) + 'px;">' + (rownumberData.hasNumber ? String(++rownumberData.beginIndex) : "") + '</td>');
                    if (currGridData.checkbox) {
                        tds.push('<td class="table-first-thtd" style="padding:0;"><input type="checkbox" id="cb_row_' + index + '" class="group-checkable" /></td>');
                    }
                }
                $.each(colData[0], function (i, d) {
                    var className = "grid_cell_" + d.field;
                    var nowrapClass = currGridData.nowrap ? "datagrid-cell-nowrap" : "";
                    var tText = data[d.field];
                    if (d.formatter) {
                        tText = d.formatter(tText, data, index);
                    }
                    !(tText != "0" && !tText) || (tText = "");
                    tds.push("<td  class='datagrid-body-cell" + " " + className + "' style='" + getAlign(d.align) + ";padding:0;'  field='" + d.field + "'><div style='height:auto;' class='datagrid-cell body-cell-div-height" + " " + nowrapClass + " " + className + "'>" + tText + "</div></td>");
                    //tds.push("<td  class='datagrid-body-cell"  + " " + className + "' style='" + getAlign(d.align) + "'  field='" + d.field + "'>" +'<div style="height:auto;" class="datagrid-cell'+ " " + nowrapClass+'">' + tText + '</div>' + "</td>");*/
                });
                if (!isFrozen) {
                    tds.push("<td class='datagrid-body-cell table-last-thtd' style='padding:0;'>&nbsp;</td>");
                }
                var _rowSytle = "";
                if (typeof currGridData.rowStyler == "function") {
                    _rowSytle = currGridData.rowStyler(index, data);
                    _rowSytle = _rowSytle ? " style='" + _rowSytle + "'" : "";
                }
                var trDefClass = index % 2 != 0 ? " class='datagrid-tr-even' " : ""; //隔行变色
                bodyTrHtml.push("<tr" + _rowSytle + trDefClass + " dataIndex='" + index + "'>" + tds.join(" ") + "</tr>");
            });
        }
        return "<tbody>" + bodyTrHtml.join(" ") + "</tbody>";
    },
    /*创建列表区域*/
    AddGridBody: function (tId) {
        //#region html
        var bodyHtml = '\
<div class="row-fluid" id="%1_body_all"><div id="%1_body_panel" class="datagrid-view" style="%2">%3</div></div>';
        var frozenHtml = '\
<div id="%1_lview" class="datagrid-view1" style="width:%2px;display:%3">\
    <div id="%1_lh_div" class="datagrid-header" style="height:35px;float: left;width: 10000px;display: block;"><table id="%1_lh_t" class="table table-striped table-bordered table-condensed" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed;height:34px;float:left;"><tbody></tbody></table></div>\
    <div class="datagrid-body" id="%1_lbody" style="margin-top: 0px; height: 196px;overflow:hidden;">\
        <div class="datagrid-body-inner">\
            <table id="%1_ldg" class="table table-striped table-bordered table-condensed" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;border:none;"><tbody></tbody></table>\
        </div>\
    </div>\
</div>';
        var genHtml = '\
<div id="%1_rview" class="datagrid-view2" style="width:%2px;display:%3">\
    <div id="%1_rh_div" class="datagrid-header" style="height:35px;float: left;width: 10000px;display: block;"><table id="%1_rh_t"  class="table table-striped table-bordered table-condensed" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed;height:34px;margin:0px;"><tbody></tbody></table></div>\
    <div class="datagrid-body"  id="%1_rbody"  style="width: 425px; margin-top: 0px; height: 197px;">\
        <table id="%1_rdg" class="table table-striped table-bordered table-condensed"  cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;border:none;"><tbody></tbody></table>\
    </div>\
</div>';
        //#endregion
        var currGridData = this.GetGridDataById(tId);
        var table = $(tId);
        var setSty = table.attr("style");
        var css = setSty ? setSty : "width:100%;";
        if (css.indexOf("width") == -1) css += ";width:100%;";
        var frozenData = currGridData.frozenColumns,
            generalData = currGridData.columns;
        var hasFroCol = frozenData && frozenData.length > 0; //是否有冻结列
        var hasGenCol = generalData && generalData.length > 0; //是否有常规列
        var content = ""; //body_panel的内容
        var _tId = BootStrap.Tools.GetIdNameTrimOther(currGridData.tableId); //去掉前面的#
        var funGetWidth = function (_data) {
            var w = 0;
            $.each(_data, function () {
                w += this.width;
            });
            return w;
        };
        if (hasFroCol) {
            var froW = funGetWidth(frozenData[0]);
            content += String.format(frozenHtml, _tId, froW, (hasFroCol ? "block" : "none"));
        }
        if (hasGenCol) {
            var genW = funGetWidth(generalData[0]);
            content += String.format(genHtml, _tId, genW, (hasGenCol ? "block" : "none"));
        }
        var $bodyPanel = $(String.format(bodyHtml, _tId, css, content));
        table.before($bodyPanel);
        //$bodyPanel.find("table").css({ "border-bottom": "1px solid #ddd", "border-right": "1px solid #ddd" });

        this.CreateToolBar(currGridData); //创建toolbar
    },
    /*创建ToolBar*/
    CreateToolBar: function (currGridData) {
        if (currGridData.isFirstLoad) {
            if (currGridData.title || currGridData.toolbar) {
                var _tId = BootStrap.Tools.GetIdNameTrimOther(currGridData.tableId);
                var toolBarContent = $('<div class="datagrid-toolbar" id="' + _tId + '_toolbar"></div>');
                $("#" + _tId + "_body_panel").before(toolBarContent);
                if (currGridData.title) {
                    toolBarContent.append("<span class='grid-title'>" + currGridData.title + "</span>");
                }
                if (currGridData.toolbar) {//第一次加载要生成toolbar
                    if (typeof currGridData.toolbar == "string") {
                        toolBarContent.prepend($(currGridData.toolbar).remove());
                    } else {
                        var toolBarHtml = '<a class="btn red toolbar-margin" href="javascript:;"><i class="%1 icon-black"></i>%2</a>';
                        $.each(currGridData.toolbar, function () {
                            var thisBar = this;
                            var _bar = $(String.format(toolBarHtml, thisBar.iconCls, thisBar.text));
                            toolBarContent.append(_bar);
                            _bar.click(function () {
                                thisBar.handler();
                            });
                        });
                    }
                }
            }

        }
    },
    GenerateGridHtml: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        //生成冻结列表头
        this.CreateFrozenHeader(currGridData);
        //生成非冻结列的表头
        this.CreateGeneralHeader(currGridData);
        //创建各列的宽度样式类
        this.CreateWidthStyle(currGridData);
        var froConHtml = "", geneConHtml = "";
        //生成冻结列的数据
        if (currGridData.frozenColumns && currGridData.frozenColumns.length > 0) {
            froConHtml = this.GetColumnsHtmlByData(currGridData, currGridData.frozenColumns, true);
        }
        //生成非冻结列的数据
        if (currGridData.columns && currGridData.columns.length > 0) {
            geneConHtml = this.GetColumnsHtmlByData(currGridData, currGridData.columns, false);
        }
        var froDg = $(tId + "_ldg");
        var geneDg = $(tId + "_rdg");
        if (froConHtml) froDg.html(froConHtml); //左边grid
        if (geneConHtml) geneDg.html(geneConHtml); //右边grid

    },
    /*创建冻结列表头*/
    CreateFrozenHeader: function (currGridData) {
        if (currGridData.frozenColumns && currGridData.frozenColumns.length > 0) {
            var frozenHeadHtml = this.LoadFrozenHead(currGridData);
            $(currGridData.tableId + "_lh_t").html(frozenHeadHtml);
        }
    },
    /*创建非冻结列表头*/
    CreateGeneralHeader: function (currGridData) {
        if (currGridData.columns && currGridData.columns.length > 0) {
            var generalHeadHtml = this.LoadGeneralHead(currGridData);
            $(currGridData.tableId + "_rh_t").html(generalHeadHtml);
        }
    },
    /*获取rownumber的数据*/
    GetRownumberData: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        var beginIndex = (currGridData.pageIndex - 1) * currGridData.pageSize;
        var hasNumber = currGridData.rownumbers;
        var widthPx = "20"; //根据数字的位数确定rownumber列的宽度
        if (hasNumber) {
            var max = beginIndex + currGridData.pageSize;
            widthPx = (6 * String(max).length); //每个数字宽度为6像素
        }
        return { beginIndex: beginIndex, hasNumber: hasNumber, widthPx: widthPx };
    },
    EndLoadDataEvent: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        //如果超过页数，就回跳到最后一页
        if (currGridData.data.total > 0 && currGridData.pageIndex > 1 && (!currGridData.data.rows || currGridData.data.rows.length < 1)) {
            var realPage = BootStrap.Pager.GetRealPages(currGridData.data.total, currGridData.pageSize); //获取实际页数
            currGridData.pageIndex = realPage;
            this.Init(tId, {});
        }
        this.BindScrollEvent(tId);
        BootStrap.Datagrid.DragTableColumn.Init(tId);
        if (typeof currGridData.onLoadSuccess == "function") {
            currGridData.onLoadSuccess(currGridData.data);
        }
        this.BindFrozenDGEvent(tId, currGridData); //绑定左边的datagrid的事件
        this.BindGeneralDGEvent(tId, currGridData);
        if (currGridData.checkbox) {//绑定全选事件
            var ckBoxGlo = $("#" + currGridData.checkAllId);
            if (currGridData.singleSelect) {
                ckBoxGlo.attr("disabled", true);
            } else {
                ckBoxGlo.click(function (e) {//单击全选checkbox事件
                    var _e; (_e = event) || (_e = e);
                    BootStrap.Tools.StopBubble(_e); //阻止事件冒泡
                    currGridData.isCheckAllEvent = true;
                    var isCheckAll = $(this).attr("checked"); //获取全选checkbox的状态
                    currGridData.cacheGlobalBoxStatus = isCheckAll != undefined; //记录是否选中
                    var ckInTId = currGridData.tableId;
                    if (currGridData.frozenColumns && currGridData.frozenColumns.length > 0) {
                        ckInTId += "_ldg";
                    } else {
                        ckInTId += "_rdg";
                    }
                    $(ckInTId + " tr").each(function (i) {
                        var _cb = $(this).find("input:first");
                        if (_cb.attr("checked") == isCheckAll) {
                            return;
                        } else {
                            if (currGridData.selectOnCheck) {//如果有涉及到checkbox事件就点击
                                BootStrap.Datagrid.JqClickCheckBox(currGridData.tableId, _cb);
                            } else {
                                var isCheck = isCheckAll != undefined;
                                if (isCheck) {
                                    if (!currGridData.checkedBoxIndexColl.contains(i)) {
                                        currGridData.checkedBoxIndexColl.push(i);
                                    }
                                } else {
                                    if (currGridData.checkedBoxIndexColl.contains(i)) {
                                        currGridData.checkedBoxIndexColl.removeValue(i);
                                    }
                                }
                                _cb.attr("checked", isCheck);

                            }
                        }
                    });
                    if (isCheckAll) {//是否全选
                        BootStrap.Datagrid.CheckAllBox(currGridData.tableId, currGridData.data.rows);
                    }
                    currGridData.isCheckAllEvent = false;
                });
            }
        }

    },
    /*绑定冻结列事件*/
    BindFrozenDGEvent: function (tId, currGridData) {
        if (currGridData.frozenColumns && currGridData.frozenColumns.length > 0) {
            $(currGridData.tableId + "_ldg tbody tr").each(function (trIndex) {
                var _tr = $(this);
                BootStrap.Datagrid.BandDgTrClickEvent(currGridData, _tr, true);
                if (currGridData.checkbox) {
                    BootStrap.Datagrid.BandCheckBoxEvent(currGridData, _tr, trIndex, true);
                }

            });

        }
    },
    /*绑定常规列事件*/
    BindGeneralDGEvent: function (tId, currGridData) {
        if (currGridData.columns && currGridData.columns.length > 0) {
            $(currGridData.tableId + "_rdg tbody tr").each(function (trIndex) {
                var _tr = $(this);
                BootStrap.Datagrid.BandDgTrClickEvent(currGridData, _tr, false);
                if (currGridData.checkbox) {
                    //有冻结列，说明checkbox在冻结列table那里
                    if (currGridData.frozenColumns && currGridData.frozenColumns.length > 0) return;
                    BootStrap.Datagrid.BandCheckBoxEvent(currGridData, _tr, trIndex, false);
                }

            });

        }
    },
    /*绑定列表行单击事件*/
    BandDgTrClickEvent: function (currGridData, _tr, isLeftDg) {
        _tr.click(function (e) {
            var _Event; (_Event = event) || (_Event = e);
            BootStrap.Tools.StopBubble(_Event); //阻止事件冒泡  
            var trIndex = this.rowIndex;
            //执行选中行，或者非选中行方法
            var isAddColor = BootStrap.Datagrid.SelOrUnSelRowAction(currGridData, trIndex, _tr, isLeftDg);
            if (currGridData.checkbox) {//如果有checkbox
                if (currGridData.checkOnSelect) {
                    BootStrap.Datagrid.JudgeClickCheckBox(currGridData.tableId, _tr, isAddColor);

                }
            }
            if (currGridData.onClickRow) {//单击行事件
                currGridData.onClickRow(trIndex, currGridData.data.rows[trIndex]);
            }
            if (currGridData.onClickCell) {//点击一个单元格的时候触发
                var clickTd = _Event.srcElement;
                if (clickTd.tagName != "TD") {
                    clickTd = BootStrap.Datagrid.GetClickTDEle(clickTd);
                    if (!clickTd) return;
                }
                var field = clickTd.getAttribute("field");
                if (field) {//如果没有field，说明不是有数据的td，
                    currGridData.onClickCell(trIndex, field, currGridData.data.rows[trIndex][field]);
                }
            }
        });
    },
    /*执行选中行，或者非选中行方法*/
    SelOrUnSelRowAction: function (currGridData, trIndex, _tr, isLeftDg) {
        //先执行默认的颜色变化事件,如果isAddColor为true，说明是需要选中checkbox，否则取消选中        
        var isAddColor = BootStrap.Datagrid.TrToggleClass(currGridData.tableId, trIndex, _tr); //先改变行颜色，再判断时候有selectOnCheck事件
        this.ChangeOterDgSelStatus(currGridData, isAddColor, trIndex, isLeftDg);
        return isAddColor;
    },
    /*改变另一个datagrid的行样式，不需要出发任何事件*/
    ChangeOterDgSelStatus: function (currGridData, isAddColor, trIndex, isLeftDg) {
        var hasData = (isLeftDg ? (currGridData.columns && currGridData.columns.length > 0) : (currGridData.frozenColumns && currGridData.frozenColumns.length > 0));
        if (hasData) {
            //如果性能很差，那么就通过坐标来获取元素
            var clickTr = $(currGridData.tableId + (isLeftDg ? "_rdg" : "_ldg"))[0].rows[trIndex];
            if (isAddColor) {
                BootStrap.Datagrid.AddTrColor3($(clickTr));
            } else {
                BootStrap.Datagrid.RemoveTrColor3($(clickTr));
            }
        }
    },
    /*绑定checkbox事件*/
    BandCheckBoxEvent: function (currGridData, _tr, trIndex, isLeftDg) {
        _tr.find("input:first").click(function (e) {
            BootStrap.Tools.StopBubble(e); //阻止事件冒泡
            var tId = currGridData.tableId;
            var isChecked;
            if (currGridData.isJqClickCheckBox.isJqClick) {//如果是jQuery点击
                isChecked = currGridData.isJqClickCheckBox.value;
                currGridData.isJqClickCheckBox.isJqClick = false;
            }
            else {
                isChecked = $(this).attr("checked");
            }
            /*selectOnCheck如果为true，当用户点击复选框就会改变行的颜色*/
            if (currGridData.selectOnCheck) {
                if (!currGridData.checkOnSelect) {
                    BootStrap.Datagrid.TrToggleClass3(currGridData.tableId, isChecked, trIndex, _tr);
                    BootStrap.Datagrid.ChangeOterDgSelStatus(currGridData, isChecked, trIndex, isLeftDg);
                } else {
                    if (!currGridData.isCheckOnSelectEvent) {//如果是checkOnSelect事件触发点击checkbox，就不需要执行修改行颜色了
                        BootStrap.Datagrid.SelOrUnSelRowAction(currGridData, trIndex, _tr, isLeftDg);
                    } else {
                        currGridData.isCheckOnSelectEvent = false;
                    }
                }
            }
            if (isChecked && currGridData.onCheck) {
                currGridData.onCheck(trIndex, currGridData.data.rows[trIndex]);
            }
            if (!isChecked && currGridData.onUncheck) {
                currGridData.onUncheck(trIndex, currGridData.data.rows[trIndex]);
            }
            if (isChecked) {//如果选中，就判断是否已经全选
                if (!currGridData.checkedBoxIndexColl.contains(trIndex)) {
                    currGridData.checkedBoxIndexColl.push(trIndex);
                }
                //判断是否已经全选
                if (currGridData.checkedBoxIndexColl.length == currGridData.data.rows.length) {
                    BootStrap.Datagrid.ChangeGlobalBoxStatus(tId, true);
                }
            } else {
                currGridData.checkedBoxIndexColl.removeValue(trIndex);
                //如果觉得获取dom元素的数据耗时，那么就先判断时候勾选过checkbox，勾选过才需要判断取消全选，如果都没有勾选过，就没必要判断是否取消全选
                BootStrap.Datagrid.ChangeGlobalBoxStatus(tId, false);
                if (currGridData.checkedBoxIndexColl.length < 1) {
                    BootStrap.Datagrid.UnCheckAllBox(currGridData.tableId, currGridData.data.rows);
                }
            }
        });
    },
    /*获取点击的td*/
    GetClickTDEle: function (parentEle) {
        if (parentEle.tagName == "TR") {
            return null;
        }
        if (parentEle.tagName != "TD") {
            return this.GetClickTDEle(parentEle.parentElement);
        }
        return parentEle;
    },
    BindScrollEvent: function (tId) {
        var scoT = 0, scoL = 0;
        var lbody = $(tId + "_lbody");
        var rhDiv = $(tId + "_rh_div");
        $(tId + "_rbody").scroll(function () {
            var scrollH = $(this).scrollTop();
            var scrollT = $(this).scrollLeft();
            if (scrollH != scoT) {
                lbody.scrollTop(scrollH);
                scoT = scrollH;
            }
            if (scrollT != scoL) {
                rhDiv.scrollLeft(scrollT);
                scoL = scrollT;
            }
        });
    },
    //#region 选中行（单击行就代表选中或取消选中），并修改行的颜色
    /*获取行索引，从0开始*/
    GetRowIndex: function (tId, jqTr) {
        return parseInt(jqTr.attr("dataIndex"));
    },
    /*直接修改颜色：返回true代表做了增加样式操作，false代表不做任何操纵*/
    AddTrColor3: function (jqTr) {
        if (!jqTr.hasClass("info")) {
            jqTr.addClass("info");
            return true;
        }
        return false;
    },
    /**
    * 增加行的颜色
    * @param {Number} index，行索引
    * @param {JqueryObject} jqTr，行tr的jQuery对象
    */
    AddTrColor2: function (tId, index, jqTr) {
        var currGridData = this.GetGridDataById(tId);
        if (!currGridData.selectTrIndexColl.contains(index)) {
            currGridData.selectTrIndexColl.push(index);
        }
        var hasClass = this.AddTrColor3(jqTr);
        if (!hasClass) {
            if (currGridData.onSelect) {//如果已经存在info样式，说明已经触发过onSelect，所以，开始不存在info样式，才需要触发onSelect事件
                currGridData.onSelect(index, currGridData.data.rows[index]);
                if (currGridData.onSelectAll) {
                    if (currGridData.selectTrIndexColl.length == currGridData.data.rows.length) {//判断时候全选
                        currGridData.onSelectAll(currGridData.data.rows);
                    }
                }
            }
        }
        if (!currGridData.isCheckAllEvent && currGridData.singleSelect) {
            var dgId = jqTr.parent().parent().attr("id");
            var isLeftDg = dgId.indexOf("_ldg") > -1;
            var hasData = (isLeftDg ? (currGridData.columns && currGridData.columns.length > 0) : (currGridData.frozenColumns && currGridData.frozenColumns.length > 0));
            jqTr.siblings().each(function () {
                var rIndex = this.rowIndex;
                if (currGridData.selectTrIndexColl.contains(rIndex)) {
                    BootStrap.Datagrid.RemoveTrColor2(currGridData.tableId, rIndex, $(this));
                    if (hasData) {
                        var clickTr = $(currGridData.tableId + (isLeftDg ? "_rdg" : "_ldg"))[0].rows[rIndex];
                        BootStrap.Datagrid.RemoveTrColor3($(clickTr));
                    }

                }
            });
        }
    },
    /*增加行的颜色*/
    AddTrColor: function (tId, jqTr) {//单独放在一个函数，是为了统计选中的行数量和快速获取某行的值
        var index = this.GetRowIndex(tId, jqTr); //第几行               
        this.AddTrColor2(tId, index, jqTr);
    },
    /**
    * 删除行的颜色
    * @param {Number} index，行索引
    * @param {JqueryObject} jqTr，行tr的jQuery对象
    */
    RemoveTrColor2: function (tId, index, jqTr) {
        var currGridData = this.GetGridDataById(tId);
        if (currGridData.selectTrIndexColl.contains(index)) {
            currGridData.selectTrIndexColl.removeValue(index);
        }
        if (this.RemoveTrColor3(jqTr)) {
            //this.RemoveCheck(currGridData.tableId, jqTr, index); //去掉选中
            if (currGridData.onUnselect) { //如果不存在info样式，说明已经触发过onUnSelect，所以，开始存在info样式，才需要触发onUnSelect事件
                currGridData.onUnselect(index, currGridData.data.rows[index]);
                if (currGridData.onUnselectAll) {
                    if (currGridData.selectTrIndexColl.length == 0) { //判断时候全部取消
                        currGridData.onUnselectAll(currGridData.data.rows);
                    }
                }
            }
        }
    },
    /*直接修改颜色：返回true代表做了删除样式操作，false代表不做任何操纵*/
    RemoveTrColor3: function (jqTr) {
        if (jqTr.hasClass("info")) {
            jqTr.removeClass("info");
            return true;
        }
        return false;
    },
    /*checkbox去掉选中*/
    RemoveCheck: function (tId, jqTr, rowIndex) {
        var currGridData = this.GetGridDataById(tId);
        if (currGridData.checkedBoxIndexColl.contains(rowIndex)) {//同时去掉选中
            currGridData.checkedBoxIndexColl.removeValue(rowIndex);
            if (!currGridData.isCheckAllEvent) {//如果是全选事件，就不必要做任何操作，因为全选触发的已经是点击事件，状态会自动改变
                var cb = jqTr.find("input:first");
                if (cb.attr("checked")) {
                    cb.attr("checked", false);
                    BootStrap.Datagrid.ChangeGlobalBoxStatus(tId, false);
                }
            }
        }
    },
    /*删除行的颜色*/
    RemoveTrColor: function (tId, jqTr) {
        var index = this.GetRowIndex(tId, jqTr);
        this.RemoveTrColor2(tId, index, jqTr);
    },
    /*切换行的颜色,返回true代表是增加颜色，false是代表删除颜色*/
    TrToggleClass: function (tId, index, jqTr) {
        if (jqTr.hasClass("info")) {
            BootStrap.Datagrid.RemoveTrColor2(tId, index, jqTr);
            return false;
        } else {
            BootStrap.Datagrid.AddTrColor2(tId, index, jqTr);
            return true;
        }
    },
    /*指定添加或删除*/
    TrToggleClass2: function (tId, isAdd, jqTr) {
        if (isAdd) {
            if (!jqTr.hasClass("info")) {
                BootStrap.Datagrid.AddTrColor(tId, jqTr);
            }
        } else {
            if (jqTr.hasClass("info")) {
                BootStrap.Datagrid.RemoveTrColor(tId, jqTr);
            }
        }
    },
    /*指定添加或删除*/
    TrToggleClass3: function (tId, isAdd, index, jqTr) {
        if (isAdd) {
            BootStrap.Datagrid.AddTrColor2(tId, index, jqTr);
        } else {
            BootStrap.Datagrid.RemoveTrColor2(tId, index, jqTr);
        }
    },
    //#endregion   
    /*jQuery点击列表前面的checkbox，如果是调用jQuery的click事件，那么就会导致先执行事件，再更新checked的值，因此，要对这个情况作处理*/
    JqClickCheckBox: function (tId, jqBox) {
        var currGridData = this.GetGridDataById(tId);
        currGridData.isJqClickCheckBox.isJqClick = true;
        currGridData.isJqClickCheckBox.value = jqBox.attr("checked") == undefined;
        jqBox.click();
    },
    /* 根据条件判断是否勾选checkbox */
    JudgeClickCheckBox: function (tId, jqTr, isCheck) {
        var cb = jqTr.find("input:first");
        var currGridData = this.GetGridDataById(tId);
        if (isCheck && cb.attr("checked") == undefined) {
            currGridData.isCheckOnSelectEvent = true; //记录是selectOnCheck事件
            BootStrap.Datagrid.JqClickCheckBox(tId, cb);
        }
        else if (!isCheck && cb.attr("checked") != undefined) {
            currGridData.isCheckOnSelectEvent = true; //记录是selectOnCheck事件
            BootStrap.Datagrid.JqClickCheckBox(tId, cb);
        }
    },
    /*
    * 改变控制全选checkbox的状态
    * @param {Boolean} isChecked，值为true，选中；fals取消
    */
    ChangeGlobalBoxStatus: function (tId, isChecked) {
        var currGridData = this.GetGridDataById(tId);
        if (isChecked) {
            if (!currGridData.cacheGlobalBoxStatus) {//如果是不选中
                currGridData.cacheGlobalBoxStatus = true; //记录已经选中
                var globalBox = $("#" + currGridData.checkAllId);
                if (!globalBox.attr("checked")) {
                    globalBox.attr("checked", true);
                    BootStrap.Datagrid.CheckAllBox(currGridData.tableId, currGridData.data.rows); //执行用户定义的全选后的事件
                }
            }
        } else {
            if (currGridData.cacheGlobalBoxStatus) {//如果是已经选中才执行
                currGridData.cacheGlobalBoxStatus = false;
                var globalBox = $("#" + currGridData.checkAllId);
                if (globalBox.attr("checked")) {
                    globalBox.attr("checked", false);
                }
            }
        }

    },
    /*全选checkbox时执行的事件*/
    CheckAllBox: function (tId, rows) {
        var currGridData = this.GetGridDataById(tId);
        if (currGridData.onCheckAll) {
            currGridData.onCheckAll(rows);
        }
    },
    /*取消全选checkbox时执行的事件*/
    UnCheckAllBox: function (tId, rows) {
        var currGridData = this.GetGridDataById(tId);
        if (currGridData.onUncheckAll) {
            currGridData.onUncheckAll(rows);
        }
    },

    //#region 获取datagrid各个值的方法
    Options: function (tId) {
        return this.GetGridDataById(tId);
    },
    /*返回页面对象*/
    GetPager: function (tId) {
        return BootStrap.Pager.pageData;
    },
    /* 返回非冻结列字段，以数组形式返回*/
    GetColumnFields: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        var fields = [];
        $.each(currGridData.columns[0], function (i, d) {
            fields.push(d.field); //记录列的顺序
        });
        return fields;
    },
    /* 返回冻结列字段*/
    GetFrozenColumnFields: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        var fields = [];
        var froCol = currGridData.frozenColumns;
        if (froCol && froCol.length > 0) {
            $.each(currGridData.frozenColumns[0], function (i, d) {
                fields.push(d.field); //记录列的顺序
            });
        }
        return fields;
    },
    /* 返回指定列属性*/
    GetColumnOption: function (tId, field) {
        var currGridData = this.GetGridDataById(tId);
        var columns = currGridData.columns[0];
        for (var i in columns) {
            if (columns[i].field == field) {
                return BootStrap.Tools.Clone(columns[i]);
            }
        }
        return null;
    },
    /*加载和显示第一页的所有行。如果指定第二个参数，必须是Json数据，它将取代'queryParams'属性*/
    Load: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        var param = {};
        if (arguments) {
            if (arguments.length > 1) {
                param = arguments[1];
            }
        }
        currGridData.pageIndex = 1;
        var isNull = BootStrap.Tools.JudgeJsonIsNull(param);
        if (!isNull) {
            if (!currGridData.queryParams) {
                currGridData.queryParams = {};
            }
            currGridData.queryParams = param;
        }
        BootStrap.Datagrid.Init(currGridData.tableId, {});
    },
    /*重载行。等同于'load'方法，但是它将保持在当前页。*/
    Reload: function (tId, param) {
        BootStrap.Datagrid.Init(this.GetGridDataById(tId).tableId, param);
    },
    /*返回加载完毕后的数据*/
    GetData: function (tId) {
        return BootStrap.Tools.Clone(this.GetGridDataById(tId).data);
    },
    /*返回当前页的所有行。*/
    GetRows: function (tId) {
        return BootStrap.Tools.Clone(this.GetGridDataById(tId).data.rows);
    },
    /*根据索引集合获取行的数据*/
    GetByRowIndexs: function (tId, indexColl) {
        var checkRow = [];
        if (indexColl) {
            indexColl.delRepeat();
            $.each(indexColl, function (i, d) {
                checkRow.push(BootStrap.Datagrid.GetGridDataById(tId).data.rows[d]);
            });
        }
        return checkRow;
    },
    /*返回复选框被选中复选框的所有行。*/
    GetChecked: function (tId) {
        return this.GetByRowIndexs(tId, this.GetGridDataById(tId).checkedBoxIndexColl);
    },
    /*返回所有被选中的行，当没有记录被选中的时候将返回一个空数组。*/
    GetSelections: function (tId) {
        return this.GetByRowIndexs(tId, this.GetGridDataById(tId).selectTrIndexColl);
    },
    /*返回第一个被选中的行或如果没有选中的行则返回null。*/
    GetSelected: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        if (currGridData.selectTrIndexColl.length < 1) {
            return null;
        }
        currGridData.selectTrIndexColl.delRepeat();
        var data = null;
        currGridData.selectTrIndexColl.sort();
        if (currGridData.data) {
            return BootStrap.Tools.Clone(currGridData.data.rows[currGridData.selectTrIndexColl[0]]);
        }
        return null;

    },
    /*清除所有选择的行*/
    ClearSelections: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        $(currGridData.tableId + " tr.info").each(function () {
            $(this).find("td:first").click(); //如果单击行是编辑列的话，点击的时候，可能会出现编辑框，这是一个bug
            //$(this).removeClass("info");//清除所有选择的行，不会触发点击事件          
        });
        currGridData.selectTrIndexColl.length = 0; //清空选中
    },
    /*清除所有勾选的行*/
    ClearChecked: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        $(currGridData.tableId + " tr:gt(0)").each(function (i) {
            if (currGridData.checkedBoxIndexColl.contains(i)) {
                var cb = $(this).find("input:first");
                if (cb.attr("checked")) {
                    BootStrap.Datagrid.JqClickCheckBox(currGridData.tableId, cb); //清除选中，同时触发选中事件
                }
            }
        });
        currGridData.checkedBoxIndexColl.length = 0;
    },
    /*选择当前页中所有的行*/
    SelectAll: function (tId) {
        var currGridData = this.GetGridDataById(tId);
        $(currGridData.tableId + " tr:gt(0):not(tr.info)").each(function () { $(this).find("td:first").click(); });
    },
    /*择一行，行索引从0开始。*/
    SelectRow: function (tId, index) {
        var currGridData = this.GetGridDataById(tId);
        if (index < 0) return;
        if (!currGridData.selectTrIndexColl.contains(index)) {
            currGridData.selectTrIndexColl.push(index); //记录选中
            //要排除掉第一行的thread
            var row = $(currGridData.tableId + " tr:eq(" + (++index) + "):not(tr.info)");
            if (row.length > 0) {
                row.find("td:first").click();
            }
        }
    },
    /*取消选择一行*/
    UnselectRow: function (tId, index) {
        var currGridData = this.GetGridDataById(tId);
        if (index < 0) return;
        if (currGridData.selectTrIndexColl.contains(index)) {
            currGridData.selectTrIndexColl.removeValue(index); //剔除选中
            //要排除掉第一行的thread
            var row = $(currGridData.tableId + " tr:eq(" + (++index) + ")");
            if (row.length > 0) {
                if (row.hasClass("info")) {
                    row.find("td:first").click();
                }
            }
        }
    },
    /* 设置页面额外数据 setJsonData={displayMsg:"额外数据"} */
    SetPagerDisplayMsg: function (tId, setJsonData) {
        BootStrap.Pager.SetPagination(tId, setJsonData);
    }
    //#endregion
};


/**
* 分页组件
* @namespace BootStrap.Pager
* @description 获取分页的html
*/
BootStrap.Pager = {
    paginationHtml: '<div class="pagination pagination-left" id="%1_pagination" style="margin:6px 0px;"> </div>',
    paginationWrite: '<div class="pagination-info-right" id="%1_pagination_right"><span style="color: red"></span>&nbsp;</div>',
    //分页div的ID
    _paginationId: "#%1_pagination",
    pageData: null,
    ShowGridMaskLayout: function () {
        var accordionHeight = $("#accordion").outerHeight(true);
        if (!accordionHeight) {
            accordionHeight = 0;
        }
        BootStrap.Tools.ShowMaskLayout2(0.5, accordionHeight);
        var args = arguments;
        if (args && args.length > 0) {
            $(".grid_mask_layout").html('<span style="margin-left:45%;color: white;">' + args[0] + '</span>');
        }
    },
    HideGridMaskLayout: function () {
        BootStrap.Tools.HideMaskLayout2();
    },
    GetPagination: function (tId) {
        var _tid = BootStrap.Tools.GetIdNameTrimOther(tId);
        var pager = $(String.format(this._paginationId, _tid));
        if (pager.length > 0) {
            return pager;
        } else {
            var pagination = $(String.format(this.paginationHtml, _tid) + String.format(this.paginationWrite, _tid));
            $("#" + _tid + "_body_panel").after(pagination);
            return this.GetPagination(tId);
        }
    },
    /*获取总页数*/
    GetRealPages: function (pageTotalCount, pageSize) {
        var realPages = Math.floor(pageTotalCount / pageSize);
        if (!(pageTotalCount % pageSize == 0 && pageTotalCount != 0)) {
            realPages++;
        }
        return realPages;
    },
    GetPageListHtml: function (tId, pageList, selectItem) {
        if (!pageList) {
            return "";
        }
        var pageHtml = [];
        pageHtml.push('<select class="pagination-page-list pagination-page-list-other" tid="' + tId + '" id="' + BootStrap.Tools.GetIdNameTrimOther(tId) + '_page_list">');
        $.each(pageList, function (i, d) {
            pageHtml.push("<option" + (selectItem == d ? " selected" : "") + ">" + d + "</option>");
        });
        pageHtml.push("</select>");
        return pageHtml.join(" ");
    },
    /**
    * 设置分页的相关数据
    */
    SetPageData: function (pageData) {
        pageData.realPages = this.GetRealPages(pageData.pageTotalCount, pageData.pageSize);
        if (pageData.pageIndex >= pageData.realPages) {
            pageData.pageIndex = pageData.realPages;
        }
        pageData.hasNextPage = pageData.pageIndex < pageData.realPages; //是否有下一页
        pageData.hasPrePage = pageData.pageIndex > 1; //是否有上一页        
        return pageData;
    },
    /**
    * 根据条件生成分页html，并插入到样式class="pagination"的div里
    * @param {String} tId，表格ID
    * @param {Json} pageSetJsonData，页设置Json数据：{pageIndex: 1,pageSize: 10,pageTotalCount: 50,pageList: [10,20],hrefUrl: "/Home",pageEvent: function(){},eventData: function(){}}
    * @param {Number} pageIndex，当前页
    * @param {Number} pageSize，每页数据量大小
    * @param {Number} pageTotalCount，总数据量
    * @param {String} hrefUrl，要跳转的连接：/Home/Index
    * @param {String} urlAttr，连接字符串： id=1&name=abc
    */
    SetPageHtmlAjax: function (tId, pageSetJsonData) {
        if (!pageSetJsonData.pageIndex || !pageSetJsonData.pageSize) {
            return;
        }
        this.pageData = {
            pageIndex: pageSetJsonData.pageIndex,
            pageSize: pageSetJsonData.pageSize,
            pageTotalCount: pageSetJsonData.pageTotalCount,
            pageList: pageSetJsonData.pageList,
            realPages: 0,
            hasNextPage: false,
            hasPrePage: false,
            hrefUrl: pageSetJsonData.hrefUrl,
            pageEvent: pageSetJsonData.pageEvent,
            eventData: pageSetJsonData.eventData
        };
        this.pageData = this.SetPageData(this.pageData);
        var pageHtml = this.PageDataToHtmlAjax(tId);
        var pagination = this.GetPagination(tId);
        pagination.html(pageHtml);
        if (this.pageData.pageEvent && (typeof this.pageData.pageEvent) === "function") {
            pagination.find("ul li a[isclick!=true]").click(function () {
                if (!($(this).hasClass("disabled") || $(this).hasClass("active"))) {
                    pageEvent(eventData);
                }
            });
        }
        this.AddEvent(tId);
    },
    PageDataToHtmlAjax: function (tId) {
        var currGridData = BootStrap.Datagrid.GetGridDataById(tId);
        var _pageData = this.pageData;
        if (_pageData.hrefUrl) {
            _pageData.hrefUrl = _pageData.hrefUrl.replace("?", "");
        }
        var showPageCount = 4; //显示页码个数
        var start = (_pageData.pageIndex - showPageCount / 2) >= 1 ? _pageData.pageIndex - showPageCount / 2 : 1;
        var end = (_pageData.realPages - start) > showPageCount ? start + showPageCount : _pageData.realPages;
        var pagerHtmlArr = [];
        pagerHtmlArr.push(this.GetPageListHtml(tId, _pageData.pageList, _pageData.pageSize));
        pagerHtmlArr.push('<ul>');
        var disablePre = _pageData.hasPrePage ? "" : 'class="disabled"'; //是否可以点击上一页
        pagerHtmlArr.push(String.format('<li isclick="true" %1><a href="javascript:void(0);" page="1" >首页</a></li>', disablePre)); //首页
        pagerHtmlArr.push(String.format('<li isclick="true" %1><a href="javascript:void(0);"  page="%2">«</a></li>', disablePre, String(_pageData.pageIndex - 1)));

        if (currGridData.data.rows && currGridData.data.rows.length > 0) {
            for (var i = start; i <= end; i++) {//前后各显示5个数字页码
                if (i == _pageData.pageIndex) {
                    pagerHtmlArr.push(String.format("<li isclick='true' class='active'><a href='javascript:void(0);' page='%1'>%1</a></li>", String(i)));
                } else {
                    pagerHtmlArr.push(String.format('<li isclick="true"><a href="javascript:void(0);" page="%1">%1</a></li>', String(i)));
                }
            }
        }
        var disableNext = _pageData.hasNextPage ? "" : 'class="disabled"'; //是否可以点击下一页
        pagerHtmlArr.push(String.format('<li isclick="true" %1><a href="javascript:void(0);"  page="%2">»</a></li>', disableNext, String(_pageData.pageIndex + 1)));
        pagerHtmlArr.push(String.format('<li isclick="true" %1><a href="javascript:void(0);" page="%2" >尾页</a></li>', disableNext, String(_pageData.realPages))); //尾页
        //搜索框        
        var search = '<li class="disabled"><a href="javascript:void(0);">共' + String(_pageData.realPages) + '页</a></li>\
            <li class="disabled"><a>跳到</a></li><li ><input type="text" class="input" value="' + _pageData.pageIndex + '" /></li><li class="disabled"><a>页</a></li><li><a href="javascript:void();" class="page_go">Go</a></li></ul>\
            <div class="lyout_pagecount">显示' + String(_pageData.pageSize * (_pageData.pageIndex - 1) + 1) + '到' + String(_pageData.pageIndex * _pageData.pageSize) + ',共' + String(_pageData.pageTotalCount) + '记录</div>';
        pagerHtmlArr.push(search);
        return pagerHtmlArr.join(" ");
    },
    AddEvent: function (tId) {
        var paginationDiv = this.GetPagination(tId);
        paginationDiv.find("ul li a.page_go").attr("tid", tId).click(function (e) {
            BootStrap.Tools.StopBubble(e);
            var pagerPlugin = BootStrap.Pager;
            if (pagerPlugin.pageData.pageTotalCount < 1) {
                return false;
            }
            var pageVal = paginationDiv.find("ul li input").val();
            if (!pageVal) {
                return false;
            }
            var intPageIndex = Math.abs(parseInt(pageVal));
            if (intPageIndex == 0) {
                intPageIndex = 1;
            }
            var realPageCount = pagerPlugin.GetRealPages(pagerPlugin.pageData.pageTotalCount, pagerPlugin.pageData.pageSize); //获取总页数
            if (intPageIndex > realPageCount) {
                intPageIndex = realPageCount;
            }
            var currGridData = BootStrap.Datagrid.GetGridDataById($(this).attr("tid")); //获取dategrid设置数据
            currGridData.pageIndex = intPageIndex; //记录是第几页
            BootStrap.Pager.LoadGridData(currGridData, { pageIndex: intPageIndex });
            return false;
        });
        paginationDiv.find("ul li[isclick='true']").each(function () {
            var thisLi = $(this);
            thisLi.attr("tid", tId).click(function (e) {
                BootStrap.Tools.StopBubble(e);
                if ($(this).hasClass("disabled") || $(this).hasClass("active")) {
                    return;
                }
                var currGridData = BootStrap.Datagrid.GetGridDataById(thisLi.attr("tid")); //获取dategrid设置数据
                var intPageIndex = parseInt($(this).find("a").attr("page"));
                currGridData.pageIndex = intPageIndex; //记录是第几页
                BootStrap.Pager.LoadGridData(currGridData, { pageIndex: intPageIndex });
            });
        });
        paginationDiv.find(tId + "_page_list").bind("change", function (e) {
            var pageSize = $(this).val();
            if (pageSize) {
                var currGridData = BootStrap.Datagrid.GetGridDataById($(this).attr("tid")); //获取dategrid设置数据
                BootStrap.Pager.LoadGridData(currGridData, { pageSize: pageSize });
            }
        });

    },
    LoadGridData: function (currGridData, param) {
        BootStrap.Pager.ShowGridMaskLayout(); //调用遮罩层
        var _tempT = setTimeout(function () {
            BootStrap.Datagrid.Init(currGridData.tableId, param);
            clearTimeout(_tempT);
        }, 0);
    },
    //#region easyui风格的分页
    /**
    * 根据条件生成分页html，并插入到样式class="pagination"的div里
    * @param {Number} pageIndex，当前页
    * @param {Number} pageSize，每页数据量大小
    * @param {Number} pageTotalCount，总数据量
    * @param {String} hrefUrl，要跳转的连接：/Home/Index
    * @param {String} urlAttr，连接字符串： id=1&name=abc
    */
    SetPageHtml: function (tId, pageIndex, pageSize, pageTotalCount, hrefUrl, urlAttr) {
        if (!pageIndex || !pageSize || !pageTotalCount) {
            return;
        }
        var pageData = {
            pageIndex: pageIndex, pageSize: pageSize, pageTotalCount: pageTotalCount,
            realPages: 0, hasNextPage: false, hasPrePage: false, hrefUrl: hrefUrl, urlAttr: urlAttr,
            pageEvent: null, eventData: null
        };
        this.GetPagination(tId).html(this.PageDataToHtml(this.SetPageData(pageData)));
    },
    /**
    * 根据条件生成分页html
    * @param {Number} pageIndex，当前页
    * @param {Number} pageSize，每页数据量大小
    * @param {Number} pageTotalCount，总数据量
    * @param {String} hrefUrl，要跳转的连接：/Home/Index
    * @param {String} urlAttr，连接字符串： id=1&name=abc
    * @param {function} pageEvent，单击分页按钮，执行的事件
    * @param {String} urlAttr，连接字符串： id=1&name=abc
    * @discription 根据条件生成分页html，并插入到样式class="pagination"的div里，并执行事件pageEvent，而且不刷新页面
    */
    SetPageHtml2: function (tId, pageIndex, pageSize, pageTotalCount, hrefUrl, urlAttr, pageEvent, eventData) {
        if (!pageIndex || !pageSize || !pageTotalCount) {
            return;
        }
        var pageData = {
            pageIndex: pageIndex, pageSize: pageSize, pageTotalCount: pageTotalCount,
            realPages: 0, hasNextPage: false, hasPrePage: false, hrefUrl: hrefUrl, urlAttr: urlAttr,
            pageEvent: pageEvent, eventData: eventData
        };
        var pagination = this.GetPagination(tId);
        pagination.html(this.PageDataToHtml(this.SetPageData(pageData)));
        if ((typeof pageEvent) === "function") {
            pagination.find("ul li a").click(function () {
                pageEvent(eventData);
            });
        }
    },
    /**
    * 根据分页的数据，生成并返回html
    * @param {Object} pageData，分页用到的json数据:
    * { pageIndex: 1, pageSize: 10, pageTotalCount: 100, realPages: 0, hasNextPage: false, hasPrePage: false, hrefUrl: "/Home/Index", urlAttr: "id=1&name=abc"}
    */
    PageDataToHtml: function (pageData) {
        pageData.hrefUrl = pageData.hrefUrl.replace("?", "");
        if (pageData.urlAttr && pageData.urlAttr.length > 0) {
            pageData.urlAttr += "&";
        }
        //如果有事件就禁用href连接，防止跳转-----------------------------------------------------
        var start = (pageData.pageIndex - 5) >= 1 ? pageData.pageIndex - 5 : 1;
        var end = (pageData.realPages - start) > 9 ? start + 9 : pageData.realPages;
        var pagerHtmlArr = [];
        pagerHtmlArr.push("<ul>");
        var disablePre = pageData.hasPrePage ? "" : 'class="disabled"'; //是否可以点击上一页
        var firstHref = pageData.hasPrePage ? String.format('%1?%2pageIndex=1', pageData.hrefUrl, pageData.urlAttr) : "javascript:void(0);";
        pagerHtmlArr.push(String.format('<li %1><a href="%2" page="1" >首页</a></li>', disablePre, firstHref)); //首页
        //如果没有上一页，就去掉连接
        var preHref = pageData.hasPrePage ? String.format('%1?%2pageIndex=%3', pageData.hrefUrl, pageData.urlAttr, String(pageData.pageIndex - 1)) : "javascript:void(0);";
        pagerHtmlArr.push(String.format('<li %1><a href="%2"  page="%3">«</a></li>', disablePre, preHref, String(pageData.pageIndex - 1)));
        for (var i = start; i <= end; i++) {//前后各显示5个数字页码
            if (i == pageData.pageIndex) {
                pagerHtmlArr.push(String.format("<li class='active'><a href='javascript:void(0);' page='%1'>%2</a></li>", String(pageData.pageIndex), String(i)));
            } else {
                pagerHtmlArr.push(String.format('<li><a href="%1?%2pageIndex=%3" page="%3">%3</a></li>', pageData.hrefUrl, pageData.urlAttr, String(i)));
            }
        }
        var disableNext = pageData.hasNextPage ? "" : 'class="disabled"'; //是否可以点击下一页
        //如果没有下一页，就去掉连接
        var nextHref = pageData.hasNextPage ? String.format('%1?%2pageIndex=%3', pageData.hrefUrl, pageData.urlAttr, String(pageData.pageIndex + 1)) : "javascript:void(0);";
        pagerHtmlArr.push(String.format('<li %1><a href="%2"  page="%3">»</a></li>', disableNext, nextHref, String(pageData.pageIndex + 1)));
        var lastHref = pageData.hasNextPage ? String.format('%1?%2pageIndex=%3', pageData.hrefUrl, pageData.urlAttr, String(pageData.realPages)) : "javascript:void(0);";
        pagerHtmlArr.push(String.format('<li %1><a href="%2" page="%3" >尾页</a></li>', disableNext, lastHref, String(pageData.realPages))); //尾页
        //搜索框        
        var search = '<li class="disabled"><a href="javascript:void(0);">共' + String(pageData.realPages) + '页</a></li>\
            <li class="disabled"><a>跳到</a></li><li ><input type="text" class="input" /></li><li class="disabled"><a>页</a></li><li><a href="javascript:void(0);">Go</a></li></ul>\
            <div class="lyout_pagecount">显示' + String(pageData.pageIndex * (pageData.pageSize - 1)) + '到' + String(pageData.pageIndex * pageData.pageSize) + ',共' + String(pageData.pageTotalCount) + '记录</div>';
        pagerHtmlArr.push(search);
        return pagerHtmlArr.join(" ");
    },
    //#endregion

    //#region 获取pagination
    /*设置页面额外数据*/
    SetPagination: function (tId, setJsonData) {
        if (setJsonData.displayMsg) {
            $(tId + "_pagination_right span").html(setJsonData.displayMsg);
        }
    }
    //#endregion
};



/**
* 下拉查询组件
* @namespace BootStrap.ComboBox
* @description 下拉(查询匹配)框
*/
BootStrap.ComboBox = {
    Data: [],
    /*当操作某个combobox的时候，其数据临时保存在这个变量中*/
    TempComboBoxData: null,
    Init: function (option) {
        if (!(typeof option == "object")) {
            return;
        }
        var defaultData = {
            id: "#demo1",
            url: "",
            data: null,
            width: 220,
            valueField: "",
            textField: "",
            method: "POST",
            /* q：用户输入的文本，row：列表行数据，默认支持模糊查询，不区分大小写。返回true的时候允许行显示。function(q, row){}*/
            filter: function filterData(q, row) {
                if (!q) return true;
                return row[this.textField].toUpperCase().indexOf(q.toUpperCase()) >= 0;
            },
            /*搜索功能是否禁用，默认为true*/
            search: true,
            macthData: [],
            /*这个是区分不同的combox标识，不需要赋值*/
            label: "",
            isLoadSuccess: true,
            onLoadSuccess: null,
            onLoadError: null,
            onSelect: null
        };
        var newOption = $.extend(defaultData, option);
        if (newOption.id.indexOf("#") == -1) {
            newOption.id = "#" + this.Data.id;
        }
        if (!newOption.valueField) {//如果没有valueField字段，就用text
            newOption.valueField = newOption.textField;
        }
        newOption.label = "cb" + this.Data.length; //记录标签，方便识别是哪个combobox
        if (!newOption.data) {
            var data = BootStrap.Tools.GetDataByAjax({ url: newOption.url, type: "POST", params: {} });
            newOption.data = data.data;
            newOption.isLoadSuccess = data.result; //ajax获取数据是否有异常
        }
        this.TempComboBoxData = newOption;
        this.Data.push(newOption); //缓存数据
        this.BuildCombox($(newOption.id).css("width", newOption.width), newOption);
        if (newOption.onLoadSuccess) {
            this.OnLoadSuccess(newOption.data);
        }
        if (!newOption.isLoadSuccess) {
            this.OnLoadError();
        }
    },
    BuildCombox: function (combobox, jsonData) {
        //添加输入框与下拉点击区域
        combobox.append('<input type="text" class="combobox_input" data-value="" style="width:' + (jsonData.width - 14) + 'px;" label="' + jsonData.label + '" /><span class="combobox_searbtn"></span><div class="combobox_data_list" style="width:' + (jsonData.width - 2) + 'px;" ></div>');
        if (!jsonData.data) {
            return;
        }
        combobox.each(function () {
            var _that = $(this);
            var _comboBoxDataList = _that.find(".combobox_data_list"),
                _comboboxInput = _that.find(".combobox_input");
            BootStrap.ComboBox.DataBind(_comboBoxDataList, jsonData.data, null); //初始化数据绑定
            BootStrap.ComboBox.ComboxMainEvent(_that, _comboBoxDataList, _comboboxInput); //初始化select组件
            jsonData.search ? BootStrap.ComboBox.Search(_comboboxInput) : _comboboxInput.css("cursor", "pointer").focus(function () { _comboboxInput.blur(); }); //初始化search组件

        });
    },
    /*数据绑定*/
    DataBind: function (comboboxDataList, cbJsonData, selectVal) {
        var comboxHtml = [];
        var thisBoxData = BootStrap.ComboBox.TempComboBoxData;
        $.each(cbJsonData, function (i, d) {
            var val = d[thisBoxData.valueField];
            comboxHtml.push('<div class="item" data-value="' + val + '" ' + (selectVal == val ? "style='background-color:#ccc; color:#fff;'" : "") + ' ><a>' + d[thisBoxData.textField] + '</a></div>');
        });
        comboboxDataList.html("").append(comboxHtml.join(" "));
    },
    /*combobox默认事件*/
    ComboxMainEvent: function (combobox, comboBoxDataList, comboboxInput) {
        combobox.bind("mouseleave", function () {
            comboBoxDataList.css("display", "none");
        });
        combobox.delegate(".combobox_searbtn", "click", function (e) {
            BootStrap.Tools.StopBubble(e);
            comboBoxDataList.toggle();
            BootStrap.ComboBox.GetComBoBoxDataByLabel(comboboxInput.attr("label")); //获取当前combobox组件的数据
            BootStrap.ComboBox.DataBind(comboBoxDataList, BootStrap.ComboBox.TempComboBoxData.data, comboboxInput.attr("data-value")); //查询数据绑定
        });
        this.SelectEvent(combobox, comboBoxDataList, comboboxInput);
        combobox.delegate(".combobox_input", "focus", function () {
            comboBoxDataList.css("display", "block");
        });
    },
    /*绑定点击项事件*/
    SelectEvent: function (combobox, comboBoxDataList, comboboxInput) {
        combobox.delegate(".item", "click", function (e) {
            BootStrap.Tools.StopBubble(e);
            var _that = $(this);
            var thisText = _that.text();
            var thisVal = _that.attr("data-value");
            comboboxInput.val(thisText).attr("data-value", thisVal);
            comboBoxDataList.css("display", "none");
            _that.css("background-color", "#ccc").siblings().css("background-color", "#fff"); //改变选中项的颜色
            if (BootStrap.ComboBox.TempComboBoxData.onSelect && typeof BootStrap.ComboBox.TempComboBoxData.onSelect == "function") {//选中事件
                var input = combobox.find("input:first");
                if (!input) return;
                BootStrap.ComboBox.GetComBoBoxDataByLabel(input.attr("label")); //更新数据
                var itemData = BootStrap.ComboBox.GetDataByText(thisText);
                BootStrap.ComboBox.TempComboBoxData.onSelect(itemData);
            }
        });


    },
    /*根据text获取这条数据的value，返回json：{}*/
    GetDataByText: function (text) {
        var itemData;
        $.each(BootStrap.ComboBox.TempComboBoxData.data, function (i, d) {
            if (d[BootStrap.ComboBox.TempComboBoxData.textField] == text) {
                itemData = d;
                return;
            }
        });
        return itemData;
    },
    /*根据输入框获取combobox下拉列表*/
    GetComboboxByInput: function (jqInput) {
        return jqInput.siblings(".combobox_data_list");
    },
    /*模糊搜索执行方法*/
    Search: function (comboboxInput) {
        comboboxInput.bind("keyup", function () {
            var _comboBoxDataList = $(this).siblings(".combobox_data_list");
            BootStrap.ComboBox.GetComBoBoxDataByLabel($(this).attr("label"));
            var _arr = [];
            var _txt = $(this).val();
            var thisBoxData = BootStrap.ComboBox.TempComboBoxData;
            for (var index in thisBoxData.data) {
                var d = thisBoxData.data[index];
                if (!d[thisBoxData.textField]) {
                    continue;
                }
                if (d[thisBoxData.textField].match(_txt)) {
                    _arr.push(d); //匹配查询框里面文字,则放入_arr数组里面以用于查询数据绑定
                } else {
                    if (thisBoxData.filter) {
                        if (thisBoxData.filter(_txt, d)) {
                            _arr.push(d);
                        }
                    }
                }
            }
            _comboBoxDataList.css("display", (_arr.length > 0 ? "block" : "none")); //有数据就让下拉框显示
            BootStrap.ComboBox.DataBind(_comboBoxDataList, _arr, null); //查询数据绑定
            _arr = []; //清除数组数据
        });

    },
    /*获取combobox所有的text*/
    GetComboboxTextList: function () {
        var textList = [];
        if (this.TempComboBoxData && this.TempComboBoxData.data) {
            $.each(this.TempComboBoxData, function (i, d) {
                textList.push(d[BootStrap.ComboBox.TempComboBoxData.textField]);
            });
        }
        return textList;
    },
    /*根据lable标识获取combobox对应的数据*/
    GetComBoBoxDataByLabel: function (labelValue) {
        if (this.TempComboBoxData && this.TempComboBoxData.label == labelValue) {//如果缓存就是这个combobox的数据，就不需要重新获取
            return;
        }
        for (var i in this.Data) {
            if (this.Data[i].label == labelValue) {
                this.TempComboBoxData = this.Data[i];
                return;
            }
        }
        this.TempComboBoxData = null;
    },
    /*如果缓存占用太多内存，就用这种方式获取数据*/
    GetDataByBoxHtml: function (combobox) {
        if (!this.TempComboBoxData) {
            this.TempComboBoxData = {};
        }
        if (!this.TempComboBoxData.data) {
            this.TempComboBoxData.data = [];
        }
        combobox.find(".combobox_data_list").children().each(function () {
            BootStrap.ComboBox.TempComboBoxData.data.push({ text: $(this).text(), value: $(this).attr("data-value") });
        });
    },

    //#region combobox事件
    /*在加载远程数据成功的时候触发*/
    OnLoadSuccess: function (data) {
        if (this.TempComboBoxData.onLoadSuccess && typeof this.TempComboBoxData.onLoadSuccess == "function") {
            this.TempComboBoxData.onLoadSuccess(data);
        }
    },
    /*在加载远程数据失败的时候触发*/
    OnLoadError: function () {
        if (this.TempComboBoxData.onLoadError && typeof this.TempComboBoxData.onLoadError == "function") {
            this.TempComboBoxData.onLoadError();
        }
    },
    /*在用户选择列表项的时候触发*/
    OnSelect: function (record) {
        if (this.TempComboBoxData.onSelect && typeof this.TempComboBoxData.onSelect == "function") {
            this.TempComboBoxData.onSelect(record);
        }
    },
    //#endregion

    //#region combobox方法
    /*返回加载数据*/
    GetData: function (comboboxId) {
        var input = $("#" + comboboxId + " input:first");
        if (!input) return;
        this.GetComBoBoxDataByLabel(input.attr("label")); //先把当前数据保存到this.TempComboBoxData变量中
        return BootStrap.Tools.Clone(this.TempComboBoxData.data);
    },
    /*获取组件的值*/
    GetValue: function (comboboxId) {
        return $(comboboxId).find("input:first").attr("data-value");
    },
    /*获取组件的值，返回Json数据{ value:"1",text:"XX" }*/
    GetText: function (comboboxId) {
        return $(comboboxId).find("input:first").val();
    },
    /*设置下拉列表框值数组*/
    SetValue: function (comboboxId, text) {
        var combobox = $(comboboxId);
        var comboBoxDataList = combobox.find(".combobox_data_list");
        var input = combobox.find("input:first");
        if (!input) return;
        this.GetComBoBoxDataByLabel(input.attr("label"));
        var itemData = BootStrap.ComboBox.GetDataByText(text);
        var selectVal = itemData[BootStrap.ComboBox.TempComboBoxData.valueField];
        input.attr("data-value", selectVal).val(text);
        this.DataBind(comboBoxDataList, BootStrap.ComboBox.TempComboBoxData.data, selectVal);
        BootStrap.ComboBox.SelectEvent(combobox, comboBoxDataList, input); //绑定点击项事件

    },
    /*清除下拉列表框的值*/
    Clear: function (comboboxId) {
        var combobox = $(comboboxId);
        var input = combobox.find("input:first");
        if (!input) return;
        input.attr("data-value", "").val("");
    }
    //#endregion
};

/**
* 窗口组件
* @namespace BootStrap.Window
* @description 窗口控件是一个浮动和可拖拽的面板可以用作应用程序窗口。默认情况下,窗口可以移动,调整大小和关闭。它的内容也可以被定义为静态html或要么通过ajax动态加载
*/
BootStrap.Window = {
    Html: {
        /*消息窗口：%1是标题；2%消息内容；*/
        ModalHtml: '<div class="modal" style="position:absolute; top: auto; left: auto; right: auto; margin: 0 auto 20px; z-index: 1000; max-width: 100%;">\
                  <div class="modal-header" style="padding: 0px 15px;"><button type="button" class="close" data-dismiss="modal" aria-hidden="true" onclick="BootStrap.Window.Messager.CloseModal();" >×</button><h4>%1</h4></div>\
                    <div class="modal-body">%2</div><div class="modal-footer">%3</div>\
                </div>',
        /*关闭按钮*/
        CloseHtml: '<a href="#" onclick="BootStrap.Window.Messager.CloseModal();" class="btn">关闭</a>',
        /*确定按钮*/
        ConfirmHtml: '<a href="#" class="btn btn-primary">确定</a>'
    },
    /*
    * 弹出对话框窗口
    * @param {objec} options,对象包含的键：
    *   width：定义消息窗口的宽度。
    *   height：定义消息窗口的高度。
    *   title：在头部面板显示的标题文本。
    *   href：加载的页面
    */
    Dialog: function (options) {
        var modal = $(String.format(BootStrap.Window.Html.ModalHtml, options.title, "", ''));
        $(document.body).append(modal);
        BootStrap.Window.SetModalSize(modal, options);
        this.Messager.ShowModal(modal, 200);
        this.SetModalBodySize(modal, options);
        $(".modal-body", modal).css("padding", "0px").html('<iframe scrolling="auto" frameborder="0" src="' + options.href + '" style="width: 100%;height: 100%"></iframe>');
    },
    /*消息框*/
    Messager: {
        /*
        * 弹出消息框
        * @param {objec} options,对象包含的键：
        *   showType：定义将如何显示该消息。可用值有：null,slide,fade,show。默认：slide。
        *   showSpeed：定义窗口显示的过度时间。默认：600毫秒。
        *   width：定义消息窗口的宽度。
        *   height：定义消息窗口的高度。
        *   title：在头部面板显示的标题文本。
        *   msg：显示的消息文本。
        *   timeout：如果定义为0，消息窗体将不会自动关闭，除非用户关闭他。如果定义成非0的树，消息窗体将在超时后自动关闭。
        */
        Alert: function (options) {
            var content = "<p>" + String.wrap(String.htmlEncode(options.msg)) + "</p>";
            var modal = $(String.format(BootStrap.Window.Html.ModalHtml, options.title, content, BootStrap.Window.Html.CloseHtml));
            $(document.body).append(modal);
            BootStrap.Window.SetModalSize(modal, options);
            var speed = 600;
            if (options.showSpeed) {
                speed = options.showSpeed;
            }
            this.ShowModal(modal, speed);
            if (options.timeout && options.timeout != 0) {
                var timeOut = setTimeout(function () {
                    BootStrap.Window.Messager.CloseModal("Alert");
                    clearTimeout(timeOut);
                }, options.timeout);
            }
        },
        /*
        * 显示一个包含“确定”和“取消”按钮的确认消息窗口
        * @param {String} title：在头部面板显示的标题文本。
        * @param {String} msg：显示的消息文本。
        * @param {Function} fn(b): 当用户点击“确定”按钮的时侯将传递一个true值给回调函数，否则传递一个false值。
        */
        Confirm: function (title, msg, fn) {
            var content = "<p>" + String.wrap(String.htmlEncode(msg)) + "</p>"; //是否支持换行
            var modal = $(String.format(BootStrap.Window.Html.ModalHtml, title, content, BootStrap.Window.Html.CloseHtml + BootStrap.Window.Html.ConfirmHtml));
            $(document.body).append(modal);
            if (fn) {
                $(".btn-primary", modal).click(function () {
                    var returnVal = (fn)();
                    if (returnVal) {
                        BootStrap.Window.Messager.CloseModal();
                    }
                    return false;
                });
            }
            this.ShowModal(modal, 200);

        },
        /*显示对话框*/
        ShowModal: function (modal, fadeSpeed) {
            var screenHeight = BootStrap.Tools.GetScreenHeight();
            var screenWidth = BootStrap.Tools.GetScreenWidth();
            var modalHei = modal.outerHeight(false);
            var modalWidth = modal.outerWidth(false);
            BootStrap.Tools.ShowMaskLayout(0.5);
            modal.css({ "top": ((screenHeight - modalHei) / 2) + "px", "left": ((screenWidth - modalWidth) / 2) + "px" }).fadeIn(fadeSpeed);
        },
        /*关闭对话框*/
        CloseModal: function () {
            var args = arguments;
            if (args.length > 0 && args[0] == "Alert") {//因为alert和comfirm调用同一个html，所以自动关闭alert的时候，防止关闭confirm
                if ($(".modal .btn-primary").length > 0) return false;
            }
            $('.modal').remove();
            BootStrap.Tools.HideMaskLayout();
            return false;
        }
    },
    /*设置弹出框的大小*/
    SetModalSize: function (modal, options) {
        if (options.height) {
            var height = String(options.height);
            if (height.indexOf("px") < 0) {
                height += "px";
            }
            modal.css("height", height);
        }
        if (options.width) {
            var width = String(options.width);
            if (width.indexOf("px") < 0) {
                width += "px";
            }
            modal.css("width", width);
        }
    },
    /*设置弹出框中间区域的大小*/
    SetModalBodySize: function (modal, options) {
        var height = 0;
        if (options.height) {
            height = parseInt(options.height);
        }
        if (height == 0 || !height) {
            height = modal.outerHeight(true);
        }
        var headHeight = $(".modal-header", modal).outerHeight(true);
        var footHeight = $(".modal-footer", modal).outerHeight(true);
        $(".modal-body", modal).css("height", (height - headHeight - footHeight) + "px");
    }
}


/**
* 验证组件
* @namespace BootStrap.Validatebox
* @description 设计目的是为了验证输入的表单字段是否有效,该验证框可以结合form(表单)插件并防止表单重复提交
*/
BootStrap.Validatebox = {
    Html: {
        TipHtml: '<div class="popover fade %2 in" style="display: block;"><div class="arrow"></div><div class="popover-content popover-content-other">%1</div></div>'
    },
    /*位置*/
    Position: {
        right: "right",
        top: "top",
        bottom: "bottom"
    },
    ValidateData: [],
    Defaults: {
        /*默认存在的规则*/
        Rules: {
            email: function (jq, options) {
                var jqInput;
                if (typeof jq == "string") {
                    jqInput = $(jq);
                } else {
                    jqInput = jq;
                }
                var validateBox = BootStrap.Validatebox;
                var reqResult = validateBox.ValidateEmpty(jqInput, options);
                var tip = validateBox.GetTipElement(jqInput, options);
                if (!reqResult) {
                    validateBox.UpdateTipText(tip, "邮箱不能为空！");
                    validateBox.SetTipPosition(jqInput, tip, options); //设置提示显示的位置并显示
                    return false;
                }
                var filter = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                if (!filter.test(jqInput.val())) {
                    options.message || (options.message = "邮箱不正确！");
                    validateBox.UpdateTipText(tip, options.message);
                    validateBox.SetTipPosition(jqInput, tip, options); //设置提示显示的位置并显示
                    return false;
                }
                tip.hide();
                return true;
            }
        }
    },
    /*验证元素必须要有id或者name属性*/
    Init: function (jqfilter, options) {
        var element = $(jqfilter);
        if (element.length < 1) {
            return;
        }
        var label = this.GetNameOrId(element);
        this.ValidateData.push({ "label": label, "jqfilter": jqfilter, "options": options }); //缓存数据
        if (element[0].tagName.toLowerCase() == "input") {
            element.bind("blur", function () {
                var validateBox = BootStrap.Validatebox;
                var data = BootStrap.Tools.GetDataByLabel(validateBox.ValidateData, "label", validateBox.GetNameOrId(element)); //获取数据
                if (!data) return;
                var _element = $(data.jqfilter);
                switch (options.validType) {
                    case "email":
                        validateBox.Defaults.Rules[options.validType](_element, data.options);
                        break;
                    default:
                        break;
                }
            });
        }

    },
    /*即刻验证输入数据的正确性*/
    Validate: function (jqfilter, options) {
        var validateBox = BootStrap.Validatebox;
        switch (options.validType) {
            case "email":
                validateBox.Defaults.Rules[options.validType](jqfilter, options);
                break;
            default:
                break;
        }
    },
    CreateRule: function () {

    },
    GetNameOrId: function (jqInput) {
        var id = jqInput.attr("id");
        if (id) {
            return id;
        }
        id = jqInput.attr("name");
        if (!id) {
            BootStrap.Window.Messager.Alert({ title: "提示", msg: "验证元素必须有Id或者Name属性" });
        }
        return id;
    },
    UpdateTipText: function (tip, msg) {
        $(".popover-content", tip).text(msg);
    },
    /*根据设置，获取提示信息*/
    GetTipElement: function (jqEle, options) {
        var msg = "输入不正确！";
        if (options.message) {
            msg = options.message;
        }
        var tip, nameOrId = this.GetNameOrId(jqEle);
        $(".popover").each(function () {
            if ($(this).attr("taget") == nameOrId) {
                tip = $(this);
                return;
            }
        });
        if (!tip) {
            tip = $(String.format(BootStrap.Validatebox.Html.TipHtml, msg, BootStrap.Validatebox.Position[options.position ? options.position : "right"]));
            tip.attr("taget", nameOrId);
        }
        return tip;
    },
    /*验证是否为空*/
    ValidateEmpty: function (jqInput, options) {
        if (options.required) {
            if ($.trim(jqInput.val()) != "") {
                return true;
            }
            return false;
        }
        return true;
    },
    /*设置提示框的位置并显示*/
    SetTipPosition: function (jqEle, tip, options) {
        jqEle.after(tip);
        var inputOs = jqEle.offset();
        var left = inputOs.left;
        var top = inputOs.top;
        switch (options.position) {
            case this.Position.top:
                left = left + (jqEle.width() - tip.width()) / 2;
                top = top - jqEle.outerHeight(true) - $(".arrow", tip).outerHeight(true);
                break;
            case this.Position.bottom:
                left = left + (jqEle.width() - tip.width()) / 2;
                top = top + jqEle.height() + $(".arrow", tip).outerHeight(true);
                break;
            default: //默认是右
                left = left + jqEle.width() + 12;
                top = top - jqEle.height() / 2;
                break;
        }
        tip.css({ "left": left + "px", "top": top + "px" }).show();
    },
    /*设置提示框的位置并显示*/
    SetTipPosition2: function (jqFilter, options) {
        var jqEle = $(jqFilter);
        var tip = BootStrap.Validatebox.GetTipElement(jqEle, options);
        this.SetTipPosition(jqEle, tip, options);
    }
}

/**
* bootstrap工具类
* @namespace BootStrap.Tools
* @description 以标签页的形式显示页面，不需要重复点击加载页面
*/
BootStrap.Tools = {
    /*阻止事件冒泡*/
    StopBubble: function (e) {
        if (e && e.stopPropagation)
            e.stopPropagation();
        else
            window.event.cancelBubble = true;
        //if (e.preventDefault) e.preventDefault();
    },
    /**
    * 清除iframe，并释放内存
    * @param {JqueryObject} tabId，标签页的Id
    */
    ClearIframe: function (jqFrame) {
        if (jqFrame && jqFrame.length > 0) {
            jqFrame[0].contentWindow.document.write('');
            jqFrame[0].contentWindow.close();
            jqFrame.remove();
            this.IeGc();
        }
    },
    //IE回收内存
    IeGc: function () {
        if ($.browser.msie) {
            CollectGarbage();
        }
    },
    ShowMaskLayout: function (opacity) {
        var maskLayout = $(".mask_layout");
        if (maskLayout.length < 1) {
            maskLayout = $("<div class=\"mask_layout\" style=\"display: none;\"></div>");
            $(document.body).append(maskLayout);
        }
        if (maskLayout.css("display") == "none") {
            maskLayout.css({
                "position": "absolute",
                "top": "0px",
                "left": "0px",
                "margin-left": "0px",
                "margin-top": "0px",
                "background-color": "#000000",
                "height": function () { return $(document).height(); },
                "filter": "alpha(opacity=80)",
                "opacity": opacity ? opacity : "0.8",
                "overflow": "hidden",
                "width": function () { return $(document).width(); },
                "z-index": "10"
            });
            maskLayout.show();
            //maskLayout.fadeIn(200);
        }
    },
    HideMaskLayout: function () {
        var maskLayout = $(".mask_layout");
        if (maskLayout.css("display") == "none") {
            return;
        }
        maskLayout.hide();
        //$(".mask_layout").fadeOut(200);
    },
    /**
    * 在固定区域显示加载图
    * @param {Number} opacity，透明度，小数表示
    * @param {Number} top，位置类型：absolute，relative
    */
    ShowMaskLayout2: function (opacity, top) {
        var newTop = String(top);
        if (newTop.indexOf("px") < 0) {
            newTop += "px";
        }
        var maskLayout = $(".grid_mask_layout");
        if (maskLayout.length < 1) {
            maskLayout = $("<div class=\"grid_mask_layout\" style=\"display: none;\"></div>");
            $(".body-panel-content").append(maskLayout);
        }
        if (maskLayout.css("display") == "none") {
            maskLayout.css({
                "position": "absolute",
                "top": newTop,
                "left": "0px",
                //                "margin-left": "0px",
                //                "margin-top": "0px",
                "background-color": "#000000",
                "height": function () { return $(document).height() - top; },
                "filter": "alpha(opacity=" + (parseInt(opacity) * 100) + ")",
                "opacity": opacity ? opacity : "0.8",
                "overflow": "hidden",
                "width": "100%",
                "z-index": "1000"
            });
            maskLayout.show();
            //maskLayout.fadeIn(200);
        }
    },
    /*隐藏指定区域的遮罩图*/
    HideMaskLayout2: function () {
        var maskLayout = $(".grid_mask_layout");
        if (maskLayout.css("display") == "none") {
            return;
        }
        maskLayout.hide();
        //$(".mask_layout").fadeOut(200);
    },
    GetStyleSheetByArrry: function (styleSheetArr) {
        var style = [];
        $.each(styleSheetArr, function () {
            style.push(this.key + this.value);
        });
        return style.join(" ");
    },
    /*创建样式*/
    CreateStyle: function (styleSheetArr) {
        if ($.browser.msie) {
            var sheet = document.createStyleSheet();
            $.each(styleSheetArr, function () {
                sheet.addRule(this.key, this.value);
            });
        } else {
            var styleStr = this.GetStyleSheetByArrry(styleSheetArr);
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = styleStr; // "body{ background-color:blue }";
            document.getElementsByTagName('HEAD').item(0).appendChild(style);
        }
    },
    /*创建样式*/
    CreateStyle2: function (strStyleSheet) {
        $(document.body).append("<style>" + strStyleSheet + "</style>");
    },
    /*获取json数据的所有key*/
    ReadJsonKeys: function (jsonData) {
        var keys = [];
        if (!jsonData) {
            return keys;
        }
        for (var key in jsonData) {
            //alert("key：" + key + ",value：" + jsonData[key]);
            keys.push(key);
        }
        return keys;
    },
    /*
    * 判断Json是否为空
    * @param {object} jsonData，json数据
    * return true：为空；false不为空
    */
    JudgeJsonIsNull: function (jsonData) {
        if (!jsonData) {
            return true;
        }
        for (var key in jsonData) {
            if (key) return false;
        }
        return true;
    },
    /*根据标识获取对应的数据*/
    GetDataByLabel: function (jsonData, label, value) {
        var data;
        for (var i in jsonData) {
            if (jsonData[i][label] == value) {
                data = jsonData[i];
                break;
            }
        }
        return data;
    },
    /**
    * Ajax获取数据
    * @param {setJsonData} Ajax的设置数据，格式：{url:"/home/getdata", type:"POST", params:{id:1}}
    * @return 返回结果是json数据 {result: true,data:{}}
    */
    GetDataByAjax: function (setJsonData) {
        var returnData = null;
        var isSuccess = false;
        if (!setJsonData.params) {
            setJsonData.params = {};
        }
        $.ajax({
            url: setJsonData.url,
            type: setJsonData.type,
            async: false,
            data: setJsonData.params,
            success: function (data) {
                returnData = data;
                isSuccess = true;
            },
            error: function () {

            }
        });
        return {
            result: isSuccess,
            data: returnData
        };
    },
    /*克隆数据，防止被污染*/
    Clone: function (obj) {
        if (typeof (obj) != 'object') return obj;
        if (obj == null) return obj;
        if ((obj instanceof Array) && obj.length != undefined) {
            //浅复制
            return obj.concat();
        }
        var newObj = new Object();
        for (var i in obj)
            newObj[i] = this.Clone(obj[i]);
        return newObj;
    },
    /*获取浏览器的高度*/
    GetScreenHeight: function () {
        return (document.documentElement && document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight);
    },
    /*获取浏览器的宽度*/
    GetScreenWidth: function () {
        return (document.documentElement && document.documentElement.clientWidth || window.innerWidth || document.body.clientWidth);
    },
    /*获取Id，去掉特殊字符：# .（类标记） 等*/
    GetIdNameTrimOther: function (id) {
        if (!id) return "";
        return id.replace("#", "").replace(".", "");
    }

};

BootStrap.InitPage = {
    isFirstLoad: true,
    Init: function (tId) {
        this.AddEvent(tId);
        this.SetPageElementPosition(tId, 0);
    },
    AddEvent: function (tId) {
        //这里也要加上区分
        $(".accordion-heading").click(function () {//搜索区域的隐藏事件              //这里需要重新写，因为多个列表的问题----------------
            var jqAccordion = $(this).find("a");
            var accordion = $($(this).attr("data-target"));
            accordion.fadeToggle(200);
            if (jqAccordion.hasClass("accordion-collapse")) {
                jqAccordion.removeClass("accordion-collapse").addClass("accordion-expand");
                BootStrap.InitPage.SetPageElementPosition(tId, 0); //展开后，高度也会变化
            } else {
                jqAccordion.removeClass("accordion-expand").addClass("accordion-collapse");
                var collapseHeight = accordion.outerHeight(true);
                BootStrap.InitPage.SetPageElementPosition(tId, collapseHeight); //隐藏后，高度发生变化
            }
        });
    },
    /**
    * 设置当前页的高度
    * @param {offsetHeight} 高度偏移量，正负数都可以
    */
    SetPageElementPosition: function (tId, offsetHeight) {
        if (tId && tId.indexOf("#") == -1) {
            tId = "#" + tId;
        }
        var screenHeight = BootStrap.Tools.GetScreenHeight();
        var accordionHeight = $("#accordion").outerHeight(true); //这里需要重新写，因为多个列表的问题----------------
        if (!accordionHeight) accordionHeight = 0;
        var tbarFilter = tId ? tId + "_toolbar" : ".datagrid-toolbar";
        var toolbarHeight = $(tbarFilter).outerHeight(true);
        var pagFilter = tId ? tId + "_pagination" : ".pagination";
        var pageHeight = $(pagFilter).outerHeight(true);
        if (!toolbarHeight) toolbarHeight = 0;
        if (!pageHeight) pageHeight = 0;
        var setH = (screenHeight - accordionHeight - pageHeight - toolbarHeight + offsetHeight);
        var filterBody = tId ? tId + "_body_panel" : ".body-panel-content";
        var h = setH + "px";
        $(filterBody).css("height", h).children().css("height", h);
        var lbody = tId ? tId + "_lbody" : ".datagrid-body";
        var rbody = tId ? tId + "_rbody" : ".datagrid-body";
        var rhdiv = tId ? tId + "_rh_div" : ".datagrid-header";
        $(lbody + "," + rbody).css("height", (setH - $(rhdiv).height()) + "px");
    }
};


/**
* bootstrap组件
* @namespace BootStrap.layout
* @description 布局面板 
*/
BootStrap.layout = {
    Init: function (_opt) {
        var _default = {
            obj: ".layout",
            layoutWidth: "990",
            layoutHeight: "330"
        };

        var $this = this;

        var _opt = $this._opt = $.extend(_opt, _default);

        var _layout = $(_opt.obj).length >= 1 ? $(_opt.obj) : null; //判断是否存在layout对象

        if (_layout) {
            _layout
                .each(function () {
                    var _that = $this.Layout = $(this),
                        _north = _that.children("div[region='north']"),
                        _south = _that.children("div[region='south']"),
                        _center = _that.children("div[region='center']"),
                        _east = _that.children("div[region='east']"),
                        _west = _that.children("div[region='west']");

                    //储存五个区域初始的长和宽
                    $this._size = {
                        north: [$this._opt.layoutWidth, ($this._opt.layoutHeight - 10) * 0.25],
                        south: [$this._opt.layoutWidth, ($this._opt.layoutHeight - 10) * 0.25],
                        center: [($this._opt.layoutWidth - 10) * 0.5, ($this._opt.layoutHeight - 10) * 0.5],
                        east: [($this._opt.layoutWidth - 10) * 0.25, ($this._opt.layoutHeight - 10) * 0.5],
                        west: [($this._opt.layoutWidth - 10) * 0.25, ($this._opt.layoutHeight - 10) * 0.5]
                    };
                    //储存五个区域初始的位置(坐标x,y值)
                    $this._location = {
                        north: [0, 0],
                        south: [0, ($this._opt.layoutHeight - 10) * 0.75 + 10],
                        center: [($this._opt.layoutWidth - 10) * 0.25 + 5, ($this._opt.layoutHeight - 10) * 0.25 + 5],
                        east: [0, ($this._opt.layoutHeight - 10) * 0.25 + 5],
                        west: [($this._opt.layoutWidth - 10) * 0.75 + 10, ($this._opt.layoutHeight - 10) * 0.25 + 5]
                    };

                    //储存四个可拖动区域初始域
                    $this._dragArea = {
                        top: { x1: 0, x2: $this._opt.layoutWidth, y1: ($this._opt.layoutHeight - 10) * 0.25, y2: ($this._opt.layoutHeight - 10) * 0.25 + 5 },
                        bottom: { x1: 0, x2: $this._opt.layoutWidth, y1: ($this._opt.layoutHeight - 10) * 0.75 + 5, y2: ($this._opt.layoutHeight - 10) * 0.75 + 10 },
                        left: { x1: ($this._opt.layoutWidth - 10) * 0.25, x2: ($this._opt.layoutWidth - 10) * 0.25 + 5, y1: ($this._opt.layoutHeight - 10) * 0.25 + 5, y2: ($this._opt.layoutHeight - 10) * 0.75 + 5 },
                        right: { x1: ($this._opt.layoutWidth - 10) * 0.75, x2: ($this._opt.layoutWidth - 10) * 0.75 + 10, y1: ($this._opt.layoutHeight - 10) * 0.25 + 5, y2: ($this._opt.layoutHeight - 10) * 0.75 + 5 }
                    };

                    //储存当前可拖动轴值(值分别为top,bottom,left,right)
                    $this.thisDrag = "";


                    //统一添加类
                    _north.addClass("panle layout-panle");
                    _south.addClass("panle layout-panle");
                    _center.addClass("panle layout-panle");
                    _east.addClass("panle layout-panle");
                    _west.addClass("panle layout-panle");

                    //添加横竖条
                    _that.append('<div class="layout-split-proxy-h"></div><div class="layout-split-proxy-v"></div>');

                    var _lspH = _that.find(".layout-split-proxy-h"),
                        _lspV = _that.find(".layout-split-proxy-v");


                    //初始化五块区域的长和宽，位置
                    $this._layout();

                    //拆分功能
                    $this._split(_that, _lspH, _lspV);


                });
        }


    },
    _layout: function () {
        var $this = this;

        var _that = $this.Layout,
            _north = _that.children("div[region='north']"),
            _south = _that.children("div[region='south']"),
            _center = _that.children("div[region='center']"),
            _east = _that.children("div[region='east']"),
            _west = _that.children("div[region='west']");

        //设置五块区域的长和宽，位置
        _north.css({
            left: $this._location.north[0] + "px",
            top: $this._location.north[1] + "px",
            width: $this._size.north[0] + "px",
            height: $this._size.north[1] + "px"
        });

        _south.css({
            left: $this._location.south[0] + "px",
            top: $this._location.south[1] + "px",
            width: $this._size.south[0] + "px",
            height: $this._size.south[1] + "px"
        });

        _center.css({
            left: $this._location.center[0] + "px",
            top: $this._location.center[1] + "px",
            width: $this._size.center[0] + "px",
            height: $this._size.center[1] + "px"
        });

        _east.css({
            left: $this._location.east[0] + "px",
            top: $this._location.east[1] + "px",
            width: $this._size.east[0] + "px",
            height: $this._size.east[1] + "px"
        });

        _west.css({
            left: $this._location.west[0] + "px",
            top: $this._location.west[1] + "px",
            width: $this._size.west[0] + "px",
            height: $this._size.west[1] + "px"
        });
    },
    //获取当前layout块位于浏览器画布的位置
    _getAbsolutely: function (ele, coord) {
        var _currentPos;
        if (coord == "left") {
            var _that = $(ele)[0],
            _actualPos = _that.offsetLeft,
            _current = _that.offsetParent;

            while (_current !== null) {
                _actualPos += _current.offsetLeft;
                _current = _current.offsetParent;
            }

            _currentPos = _actualPos;
        }
        else if (coord == "top") {
            var _that = $(ele)[0],
            _actualPos = _that.offsetTop,
            _current = _that.offsetParent;

            while (_current !== null) {
                _actualPos += _current.offsetTop;
                _current = _current.offsetParent;
            }

            _currentPos = _actualPos;
        }

        return _currentPos;
    },
    _split: function (_that, _lspH, _lspV) {
        var $this = this;
        $(document).bind("mousemove", function (e) {
            //获取当前
            var xx = e.pageX - $this._getAbsolutely(_that, "left");
            var yy = e.pageY - $this._getAbsolutely(_that, "top");

            //处于可拖动区域
            if ($this._dragArea.top.x1 <= xx && xx <= $this._dragArea.top.x2 && $this._dragArea.top.y1 <= yy && yy <= $this._dragArea.top.y2) {
                //显示y轴
                $this._dragY(_lspV, $this, yy);
                $this.thisDrag = "top";
            }
            else if ($this._dragArea.bottom.x1 <= xx && xx <= $this._dragArea.bottom.x2 && $this._dragArea.bottom.y1 <= yy && yy <= $this._dragArea.bottom.y2) {
                //显示y轴
                $this._dragY(_lspV, $this, yy);
                $this.thisDrag = "bottom";
            }
            else if ($this._dragArea.left.x1 <= xx && xx <= $this._dragArea.left.x2 && $this._dragArea.left.y1 <= yy && yy <= $this._dragArea.left.y2) {
                $this._dragY(_lspH, $this, xx);
                $("body").css("cursor", "w-resize");
                $this.thisDrag = "left";
            }
            else if ($this._dragArea.right.x1 <= xx && xx <= $this._dragArea.right.x2 && $this._dragArea.right.y1 <= yy && yy <= $this._dragArea.right.y2) {
                $("body").css("cursor", "w-resize");
                $this.thisDrag = "right";
            }
            else {
                $("body").css("cursor", "");
            }

        });

        _lspV.bind("mousedown", function () {
            if ($this.thisDrag == "top" || $this.thisDrag == "bottom") {
                _lspV.css({
                    opacity: "0.6"
                });
            }
            else {
                _lspH.css({
                    opacity: "0.6"
                });
            }
            _that.bind("mousemove", function (e) {
                //获取当前
                e.stopPropagation();

                var xx = e.pageX - $this._getAbsolutely(_that, "left");
                var yy = e.pageY - $this._getAbsolutely(_that, "top");


                if (yy >= (30 + 5 / 2) && yy <= ($this._dragArea.bottom.y1 - 5 - 30) && $this.thisDrag == "top") {
                    $this._dragArea.top.y1 = yy - 5 / 2;
                    $this._dragArea.top.y2 = yy + 5 / 2;
                    _lspV.css({
                        left: $this._location.north[0] + "px",
                        top: yy + "px",
                        width: $this._size.north[0] + "px",
                        height: "5px"
                    });
                }
                else if (yy >= ($this._dragArea.top.y2 + 30 + 5 / 2) && yy <= $this._opt.layoutHeight - 30 && $this.thisDrag == "bottom") {
                    $this._dragArea.bottom.y1 = yy - 5 / 2;
                    $this._dragArea.bottom.y2 = yy + 5 / 2;
                    _lspV.css({
                        left: $this._location.south[0] + "px",
                        top: yy + "px",
                        width: $this._size.south[0] + "px",
                        height: "5px"
                    });
                }
                else if (xx >= (30 + 5 / 2) && ($this._dragArea.right.x1 - $this._dragArea.left.x2) >= 30 && $this.thisDrag == "left") {
                    alert("1");
                    $this._dragArea.left.x1 = xx - 5 / 2;
                    $this._dragArea.left.x2 = xx + 5 / 2;
                    _lspH.css({
                        left: xx + "px",
                        top: $this._location.east[1] + "px",
                        width: "5px",
                        height: $this._size.east[1] + "px"

                    });
                }
                else {
                    $(document).bind("mouseup", function () {
                        //拖动释放，重绘布局
                        $this._dragRelease(_lspV, _that, $this);
                    });

                }

            });
        });

        _lspV.bind("mouseup", function () {
            //拖动释放，重绘布局
            $this._dragRelease(_lspV, _that, $this);
        });
    },
    //拖动释放，重绘布局
    _dragRelease: function (_lspV, _that, $this) {
        $("body").css("cursor", "");
        _lspV.css({
            display: "none"
        });
        _that.unbind("mousemove");

        if ($this.thisDrag == "top") {

            var val1 = $this._dragArea.top.y1,
                val2 = $this._dragArea.bottom.y1 - $this._dragArea.top.y2,
                val3 = $this._dragArea.top.y2;

            $this._size.north[1] = val1;
            $this._size.center[1] = $this._size.east[1] = $this._size.west[1] = val2;
            $this._location.center[1] = $this._location.east[1] = $this._location.west[1] = val3;
        }
        else if ($this.thisDrag == "bottom") {
            var val1 = $this._opt.layoutHeight - $this._dragArea.bottom.y2,
                val2 = $this._dragArea.bottom.y1 - $this._dragArea.top.y2,
                val3 = $this._dragArea.bottom.y2;

            $this._size.south[1] = val1;
            $this._size.center[1] = $this._size.east[1] = $this._size.west[1] = val2;
            $this._location.south[1] = val3;
        }
        else if ($this.thisDrag == "left") {
            var val1 = $this._dragArea.left.x1,
                val2 = $this._dragArea.right.x1 - $this._dragArea.left.x2,
                val3 = $this._dragArea.left.x2;

            $this._size.east[0] = val1;
            $this._size.center[0] = val2;
            $this._location.center[0] = val3;
        }
        //重绘
        $this._layout();
    },
    //拖动Y轴显示
    _dragY: function (_lspV, $this, yy) {
        $("body").css("cursor", "n-resize");
        //垂直条出现
        _lspV.css({
            display: "block",
            opacity: "0"
        });
        //初始化垂直条位置
        _lspV.css({
            left: $this._location.north[0] + "px",
            top: yy + "px",
            width: $this._size.north[0] + "px",
            height: "5px"
        });
    }

}