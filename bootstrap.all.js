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
    }
})();
/**
* 列表组件
* @namespace BootStrap.Datagrid
* @description bootstrap列表页面的扩展
*/
BootStrap.Datagrid = {
    /*保存所有DataGrid的状态*/
    DataGridStatusColl: [],
    /*保存所有DataGrid的数据*/
    DataGridSetDataColl: [],
    /*临时保存当前操作的DataGrid的状态*/
    DataGridStatus: {
        /*列表的TableId*/
        tableId: null,
        /*是否首次加载页面*/
        isFirstLoad: true,
        /*用户设置的字段顺序*/
        columnSequence: [],
        isSelectOnCheckEvent: false,
        selectTrIndexColl: [],
        /*已经选中列表中的checkbox的索引集合*/
        checkedBoxIndexColl: [],
        cacheCheckBox: null,
        /*是否是jQuery调用click方法执行点击*/
        isJqClickCheckBox: { isJqClick: false, value: false },
        /*全选checkbox的ID*/
        checkAllId: "check_all",
        /*是否是点击全选按钮*/
        isCheckAllEvent: false
    },
    /*临时保存当前操作的DataGrid的数据*/
    DataGridSetData: {
        tableId: null,
        //DataGrid列配置对象
        columns: undefined,
        //同列属性，但是这些列将会被冻结在左侧。
        frozenColumns: undefined,
        //该方法类型请求远程数据。
        method: "POST",
        //顶部工具栏的DataGrid面板。可能的值：1) 一个数组，每个工具属性都和linkbutton一样。2) 选择器指定的工具栏。 
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
        //如果为true，则在DataGrid控件底部显示分页工具栏。
        pagination: true,
        rownumbers: false,
        singleSelect: true,
        /*如果为true，当用户点击行的时候该复选框就会被选中或取消选中。如果为false，当用户仅在点击该复选框的时候才会呗选中或取消*/
        checkOnSelect: true,
        /*如果为true，单击复选框将永远选择行。如果为false，选择行将不选中复选框。*/
        selectOnCheck: false,
        //定义分页工具栏的位置。可用的值有：'top','bottom','both'
        pagePosition: "bottom", //XXXXXX
        pageIndex: 1,
        pageSize: 20,
        pageList: [10, 20, 30, 40, 50],
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
        onRowContextMenu: function (e, rowIndex, rowData) { }
    },
    /*是否存在某个Id的Grid数据*/
    IsExistGridById: function () {
        for (var i in this.DataGridSetDataColl) {
            if (this.DataGridSetDataColl[i].tableId === tableId) {
                return true;
            }
        }
        return false;
    },
    /**
    * 根据tableId标识获取这个grid对应的数据，并保存到变量this.DataGridSetData和this.DataGridStatus
    */
    GetGridDataById: function (tableId) {
        this.GetGridSetDataById(tableId);
        this.GetGridStatusDataById(tableId);
    },
    /*根据tableId标识获取这个grid对应的数据，并保存到变量this.DataGridSetData*/
    GetGridSetDataById: function (tableId) {
        if (this.DataGridSetData && this.DataGridSetData.tableId == tableId) {//如果缓存就是这个Grid的数据，就不需要重新获取
            return;
        }
        for (var i in this.DataGridSetDataColl) {
            if (this.DataGridSetDataColl[i].tableId === tableId) {
                this.DataGridSetData = BootStrap.Tools.Clone(this.DataGridSetDataColl[i]);
                return;
            }
        }
        //如果找不到tableId的数据，就设置关键数据为空 
        this.DataGridSetData.tableId = null;
        this.DataGridSetData.data = null;
        this.DataGridSetData.url = null;
        this.DataGridSetData.columns = null;
        this.DataGridSetData.gridData = null;
        this.DataGridSetData.frozenColumns = null;
    },
    /*根据tableId标识获取这个grid对应的状态，并保存到变量this.DataGridStatus*/
    GetGridStatusById: function (tableId) {
        if (this.DataGridStatus && this.DataGridStatus.tableId == tableId) {//如果缓存就是这个Grid的数据，就不需要重新获取
            return;
        }
        for (var i in this.DataGridStatusColl) {
            if (this.DataGridStatusColl[i].tableId === tableId) {
                this.DataGridStatus = BootStrap.Tools.Clone(this.DataGridStatusColl[i]);
                return;
            }
        }
    },
    /**
    * 更新Grid状态的某个key的值
    * @param {String} tableId，操作的tableId
    * @param {String} key，更新的key
    * @param {String} value，更新key的值
    */
    SetGridStatusDetailById: function (tableId, key, value) {
        for (var i in this.DataGridStatusColl) {
            if (this.DataGridStatusColl[i].tableId === tableId) {
                this.DataGridStatusColl[i][key] = value; //更新值
                this.DataGridStatus = BootStrap.Tools.Clone(this.DataGridStatusColl[i]); //更新变量值
                return;
            }
        }
    },
    /**
    * 更新Grid数据某个key的值
    * @param {String} tableId，操作的tableId
    * @param {String} key，更新的key
    * @param {String} value，更新key的值
    */
    SetGridDataDetailById: function (tableId, key, value) {
        for (var i in this.DataGridSetDataColl) {
            if (this.DataGridSetDataColl[i].tableId === tableId) {
                this.DataGridSetDataColl[i][key] = value; //更新值
                this.DataGridSetData = BootStrap.Tools.Clone(this.DataGridSetDataColl[i]); //更新变量值
                return;
            }
        }
    },
    /**
    * 更新某个Grid的所有值
    * @param {String} tableId，操作的tableId
    * @param {String} jsonData，table的Json数据
    */
    SetGridDataById: function (tableId, jsonData) {
        this.DataGridSetData = BootStrap.Tools.Clone(jsonData); //更新变量值
        for (var i in this.DataGridSetDataColl) {
            if (this.DataGridSetDataColl[i].tableId === tableId) {
                this.DataGridSetDataColl[i][key] = BootStrap.Tools.Clone(jsonData); //更新值                
                return;
            }
        }
        BootStrap.Datagrid.DataGridSetDataColl.push(BootStrap.Tools.Clone(jsonData)); //如果不存在这个datagrid就追加进来
    },
    /**
    * 列表列的拖拽功能
    * @namespace BootStrap.Datagrid.DragTableColumn
    * @description 支持动态改变列的宽度
    */
    DragTableColumn: {
        //表格列的数量
        _headDivCount: 0,
        //表格列表头是否有左键点击进行拖拽操作
        _headDivHasMouseDown: false,
        //点击的表头是那一列div的前面
        _witchHeadDivMouseDown: null,
        //拖拽操作开始时，鼠标的X坐标
        _mouseDownX: 0,
        //分割线html
        _resizeProxyHtml: '<div class="resize_proxy" style="left: 329px;position: absolute;width: 1px;height: 10000px;top: 0;cursor: e-resize;display: none;background: #aac5e7;"></div>',
        //分割线jquery对象，为什么缓存起来，防止查找因为很耗时，会出现闪动很厉害        
        _jqResizeProxyObject: null,
        Init: function (tableId) {
            if (!tableId) {
                return;
            }
            this.CreateResizeProxyLine(); //创建列拖动标识竖线
            $(".datagrid-header th:gt(0)").css("padding", "0"); //th中的div必须贴近th的边缘
            var threadDiv = $(".datagrid-header th div");
            this._headDivCount = threadDiv.length;
            if (this._headDivCount > 1) {
                threadDiv.each(function (i) {
                    $(this).mouseenter(function (e) {
                        BootStrap.Datagrid.DragTableColumn.HeadDivMouseEvent($(this), event || e);
                    }).mouseleave(function () {
                        BootStrap.Datagrid.DragTableColumn.HeadDivMouseEvent($(this), event || e);
                    }).mousedown(function (e) {
                        if (event.button == 1 || event.button == 0) {//左键单击                            
                            var isTrue = BootStrap.Datagrid.DragTableColumn.HeadDivMouseEvent($(this), event || e);
                            if (isTrue) {
                                BootStrap.Datagrid.DragTableColumn._witchHeadDivMouseDown = $(this);
                                BootStrap.Datagrid.DragTableColumn._headDivHasMouseDown = true;
                                BootStrap.Datagrid.DragTableColumn._mouseDownX = event.clientX;
                                var mainT = $("#" + tableId);
                                var tableHeight = mainT.height();
                                BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject = BootStrap.Datagrid.DragTableColumn.GetResizeProxyLine();
                                BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject.css({ "height": tableHeight + "px", "left": event.clientX + "px", "top": mainT.offset().top + "px" }).show();
                                $("body").bind("selectstart", function () {
                                    return false;
                                });
                            }
                        }
                    });
                });
            }
            $("body").mouseup(function (e) {//松开鼠标
                if (BootStrap.Datagrid.DragTableColumn._headDivHasMouseDown) {
                    BootStrap.Datagrid.DragTableColumn._headDivHasMouseDown = false;
                    if (BootStrap.Datagrid.DragTableColumn._witchHeadDivMouseDown) {
                        //var proxyOffset = BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject.offset();
                        var newWidth;
                        var prevDiv = BootStrap.Datagrid.DragTableColumn._witchHeadDivMouseDown.parent().prev().children().eq(0);
                        var cursorX = event.clientX;
                        if (cursorX > BootStrap.Datagrid.DragTableColumn._mouseDownX) {
                            newWidth = prevDiv.width() + cursorX - BootStrap.Datagrid.DragTableColumn._mouseDownX;
                            newWidth = newWidth + 7; //误差值
                        } else {
                            newWidth = prevDiv.width() - (BootStrap.Datagrid.DragTableColumn._mouseDownX - cursorX);
                            newWidth = newWidth - 7; //误差值
                        }
                        prevDiv.css("width", String(newWidth) + "px");
                        BootStrap.Datagrid.DragTableColumn._witchHeadDivMouseDown.css("cursor", "default");
                        BootStrap.Datagrid.DragTableColumn._witchHeadDivMouseDown = null;
                    }
                    BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject.hide(); //隐藏分割线
                    BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject = null; //释放对象
                    $("body").unbind("selectstart");
                }
            });
            $(".datagrid-header").mousemove(function () {//按住鼠标移动事件
                if (BootStrap.Datagrid.DragTableColumn._headDivHasMouseDown) {
                    BootStrap.Datagrid.DragTableColumn._jqResizeProxyObject.css("left", event.clientX + "px");
                }
            });
        },
        //创建分割线:竖线
        CreateResizeProxyLine: function () {
            $("body").append($(this._resizeProxyHtml));
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
            if (Math.abs(leftOrRight - e.clientX) < 3) {
                jqDiv.css("cursor", "e-resize");
                return true;
            } else {
                jqDiv.css("cursor", "default");
                return false;
            }
        }
    },
    LoadData: function (tableId, setData) {
        if (!this.DataGridStatus.isFirstLoad) {
            BootStrap.Pager.ShowGridMaskLayout(); //调用遮罩层
        }
        this.DataGridStatus.tableId = tableId;
        this.ResetDataBeforeLoad();
        this.UpdateSetData(setData); //更新用户设置的数据
        this.BeginLoadDataEvent(); //生成列表前的事件
        this.GenerateTableHtml(); //生成列表table的html
        this.EndLoadDataEvent(); //列表和分页展示完成后执行的函数
        this.DataGridStatus.isFirstLoad = false; //最后设置不是第一次加载
        BootStrap.Pager.HideGridMaskLayout(); //隐藏遮罩层
    },
    /*执行之前重置一些数据*/
    ResetDataBeforeLoad: function () {
        BootStrap.Datagrid.ChangeGlobalBoxStatus(false); //取消选中，因为缓存  
        BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.length = 0;
    },
    UpdateSetData: function (newSetData) {
        BootStrap.Datagrid.DataGridSetData = $.extend(BootStrap.Datagrid.DataGridSetData, newSetData);
    },
    LoadDataBeforeEvent: function () {
        if (this.DataGridSetData.onBeforeLoad) {//在载入请求数据数据之前触发
            this.DataGridSetData.onBeforeLoad();
        }
    },
    BeginLoadDataEvent: function () {
        if (!this.DataGridSetData.url && !this.DataGridSetData.gridData) {
            return;
        }
        if (this.DataGridStatus.isFirstLoad) {
            if (this.DataGridSetData.title || this.DataGridSetData.toolbar) {
                var toolBarContent = $('<div class="datagrid-toolbar"></div>');
                $(".body-panel-content").before(toolBarContent);
                if (this.DataGridSetData.title) {
                    toolBarContent.append("<span class='grid-title'>" + this.DataGridSetData.title + "</span>");
                }
                if (this.DataGridSetData.toolbar) {//第一次加载要生成toolbar
                    if (typeof this.DataGridSetData.toolbar == "string") {
                        toolBarContent.prepend($(this.DataGridSetData.toolbar).remove());
                    } else {
                        var toolBarHtml = '<a class="btn red toolbar-margin" href="javascript:;"><i class="%1 icon-black"></i>%2</a>';
                        $.each(this.DataGridSetData.toolbar, function () {
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
        this.GetGridDataByUrlOrLocal();
    },
    GetGridDataByUrlOrLocal: function () {
        if (!BootStrap.Datagrid.DataGridSetData.queryParams) {
            BootStrap.Datagrid.DataGridSetData.queryParams = {};
        }
        BootStrap.Datagrid.DataGridSetData.queryParams.pageIndex = this.DataGridSetData.pageIndex;
        BootStrap.Datagrid.DataGridSetData.queryParams.pageSize = this.DataGridSetData.pageSize;

        var gridSetData = BootStrap.Datagrid.DataGridSetData;
        if (gridSetData.url) {
            $.ajax({
                url: gridSetData.url,
                type: gridSetData.method,
                async: false,
                data: gridSetData.queryParams,
                success: function (data) {
                    if (BootStrap.Datagrid.DataGridSetData.loadFilter) { //过滤数据
                        if (data && data.total > 0) {
                            data = BootStrap.Datagrid.DataGridSetData.loadFilter(data);
                        }
                    }
                    BootStrap.Datagrid.DataGridSetData.data = data;
                },
                error: function () {
                    if (BootStrap.Datagrid.DataGridSetData.onLoadError) {
                        BootStrap.Datagrid.DataGridSetData.onLoadError();
                    }
                }
            });
        } else {
            if (gridSetData.gridData && gridSetData.gridData.rows) {
                BootStrap.Datagrid.DataGridSetData.data = { total: gridSetData.gridData.total, rows: [] };
                var begin = (gridSetData.pageIndex - 1) * gridSetData.pageSize;
                var end = begin + gridSetData.pageSize;
                for (var rows = gridSetData.gridData.rows, i = begin; i < end; i++) {
                    BootStrap.Datagrid.DataGridSetData.data.rows.push(gridSetData.gridData.rows[i]);
                }
            }

        }
    },
    EndLoadDataEvent: function () {
        //如果超过页数，就回跳到最后一页
        if (this.DataGridSetData.data.total > 0 && this.DataGridSetData.pageIndex > 1 && (!this.DataGridSetData.data.rows || this.DataGridSetData.data.rows.length < 1)) {
            var realPage = BootStrap.Pager.GetRealPages(this.DataGridSetData.data.total, this.DataGridSetData.pageSize); //获取实际页数
            this.LoadData(this.DataGridStatus.tableId, { pageIndex: realPage });
        }
        BootStrap.Datagrid.DragTableColumn.Init(BootStrap.Datagrid.DataGridStatus.tableId);
        if (typeof this.DataGridSetData.onLoadSuccess == "function") {
            this.DataGridSetData.onLoadSuccess(BootStrap.Datagrid.DataGridSetData.data);
        }
        $("#" + BootStrap.Datagrid.DataGridStatus.tableId + " tr:gt(0)").each(function (trIndex) {
            var _tr = $(this);
            if (BootStrap.Datagrid.DataGridSetData.onDblClickRow) {
                _tr.dblclick(function () {
                    BootStrap.Datagrid.DataGridSetData.onDblClickRow(trIndex, BootStrap.Datagrid.DataGridSetData.data.rows[trIndex]);
                });
            }
            if (BootStrap.Datagrid.DataGridSetData.onClickRow) {//单击行事件
                _tr.click(function () {
                    BootStrap.Datagrid.DataGridSetData.onClickRow(trIndex, BootStrap.Datagrid.DataGridSetData.data.rows[trIndex]);
                });
            }
            var _rowTds = _tr.children("td");
            _rowTds.click(function (e) {
                BootStrap.Tools.StopBubble(e); //阻止事件冒泡
                //先执行默认的颜色变化事件
                BootStrap.Datagrid.TrToggleClass(trIndex, _tr); //先改变行颜色，再判断时候有selectOnCheck事件
                if (BootStrap.Datagrid.DataGridSetData.checkbox) {//如果有checkbox
                    if (BootStrap.Datagrid.DataGridSetData.selectOnCheck) {
                        BootStrap.Datagrid.JudgeClickCheckBox(_tr);
                    }
                }
                if (BootStrap.Datagrid.DataGridSetData.onClickCell) {//点击一个单元格的时候触发
                    var field = $(this).attr("field");
                    BootStrap.Datagrid.DataGridSetData.onClickCell(trIndex, field, BootStrap.Datagrid.DataGridSetData.data.rows[trIndex][field]);
                }

            });
            if (BootStrap.Datagrid.DataGridSetData.onDblClickCell) {//双击一个单元格的时候触发
                _rowTds.dblclick(function () {
                    var field = $(this).attr("field");
                    if (field) {
                        BootStrap.Datagrid.DataGridSetData.onDblClickCell(trIndex, field, BootStrap.Datagrid.DataGridSetData.data.rows[trIndex][field]);
                    }
                });
            }
            _tr.find("input:first").click(function (e) {
                BootStrap.Tools.StopBubble(e); //阻止事件冒泡
                var isChecked;
                if (BootStrap.Datagrid.DataGridStatus.isJqClickCheckBox.isJqClick) {//如果是jQuery点击
                    isChecked = BootStrap.Datagrid.DataGridStatus.isJqClickCheckBox.value;
                    BootStrap.Datagrid.DataGridStatus.isJqClickCheckBox.isJqClick = false;
                }
                else {
                    isChecked = $(this).attr("checked");
                }
                /*checkOnSelect如果为true，当用户点击行的时候该复选框就会被选中或取消选中*/
                if (BootStrap.Datagrid.DataGridSetData.checkbox && BootStrap.Datagrid.DataGridSetData.checkOnSelect) {
                    if (!BootStrap.Datagrid.DataGridSetData.selectOnCheck) {
                        BootStrap.Datagrid.TrToggleClass2(isChecked, _tr);
                    } else {
                        if (!BootStrap.Datagrid.DataGridStatus.isSelectOnCheckEvent) {//如果是selectOnCheck事件触发点击checkbox，就不需要执行修改行颜色了
                            if (isChecked) {
                                BootStrap.Datagrid.AddTrColor2(trIndex, _tr);
                            } else {
                                BootStrap.Datagrid.RemoveTrColor2(trIndex, _tr);
                            }
                        } else {
                            BootStrap.Datagrid.DataGridStatus.isSelectOnCheckEvent = false;
                        }
                    }
                }
                if (isChecked && BootStrap.Datagrid.DataGridSetData.onCheck) {
                    BootStrap.Datagrid.DataGridSetData.onCheck(trIndex, BootStrap.Datagrid.DataGridSetData.data.rows[trIndex]);
                }
                if (!isChecked && BootStrap.Datagrid.DataGridSetData.onUncheck) {
                    BootStrap.Datagrid.DataGridSetData.onUncheck(trIndex, BootStrap.Datagrid.DataGridSetData.data.rows[trIndex]);
                }
                if (isChecked) {//如果选中，就判断是否已经全选
                    if (!BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.contains(trIndex)) {
                        BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.push(trIndex);
                    }
                    //判断是否已经全选
                    if (BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.length == BootStrap.Datagrid.DataGridSetData.data.rows.length) {
                        BootStrap.Datagrid.ChangeGlobalBoxStatus(true);
                    }
                } else {
                    BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.removeValue(trIndex);
                    //如果觉得获取dom元素的数据耗时，那么就先判断时候勾选过checkbox，勾选过才需要判断取消全选，如果都没有勾选过，就没必要判断是否取消全选
                    BootStrap.Datagrid.ChangeGlobalBoxStatus(false);
                    if (BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.length < 1) {
                        BootStrap.Datagrid.UnCheckAllBox(BootStrap.Datagrid.DataGridSetData.data.rows);
                    }
                }
            });

        });
        if (this.DataGridSetData.checkbox) {
            $("#" + this.DataGridStatus.checkAllId).click(function () {//单击全选checkbox事件
                BootStrap.Datagrid.DataGridStatus.isCheckAllEvent = true;
                var isCheckAll = $(this).attr("checked"); //获取全选checkbox的状态
                BootStrap.Datagrid.DataGridStatus.cacheGlobalBoxStatus = isCheckAll != undefined; //记录是否选中
                $("#" + BootStrap.Datagrid.DataGridStatus.tableId + " tr:gt(0)").each(function (i) {
                    var _cb = $(this).find("input:first");
                    if (_cb.attr("checked") == isCheckAll) {
                        return;
                    } else {
                        if (BootStrap.Datagrid.DataGridSetData.checkOnSelect) {//如果有涉及到checkbox事件就点击
                            BootStrap.Datagrid.JqClickCheckBox(_cb);
                        } else {
                            var isCheck = isCheckAll != undefined;
                            if (isCheck) {
                                if (!BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.contains(i)) {
                                    BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.push(i);
                                }
                            } else {
                                if (BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.contains(i)) {
                                    BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.removeValue(i);
                                }
                            }
                            _cb.attr("checked", isCheck);

                        }
                    }
                });
                if (isCheckAll) {//是否全选
                    BootStrap.Datagrid.CheckAllBox(BootStrap.Datagrid.DataGridSetData.data.rows);
                }
                BootStrap.Datagrid.DataGridStatus.isCheckAllEvent = false;
            });
        }
    },
    //#region 选中行（单击行就代表选中或取消选中），并修改行的颜色
    /*获取行索引，从0开始*/
    GetRowIndex: function (jqTr) {
        return parseInt(jqTr.attr("dataIndex"));
    },
    /**
    * 增加行的颜色
    * @param {Number} index，行索引
    * @param {JqueryObject} jqTr，行tr的jQuery对象
    */
    AddTrColor2: function (index, jqTr) {
        if (!this.DataGridStatus.selectTrIndexColl.contains(index)) {
            this.DataGridStatus.selectTrIndexColl.push(index);
        }
        var hasClass = jqTr.hasClass("info");
        if (!hasClass) {
            jqTr.addClass("info");
            if (this.DataGridSetData.onSelect) {//如果已经存在info样式，说明已经触发过onSelect，所以，开始不存在info样式，才需要触发onSelect事件
                this.DataGridSetData.onSelect(index, BootStrap.Datagrid.DataGridSetData.data.rows[index]);
                if (this.DataGridSetData.onSelectAll) {
                    if (this.DataGridStatus.selectTrIndexColl.length == this.DataGridSetData.data.rows.length) {//判断时候全选
                        this.DataGridSetData.onSelectAll(this.DataGridSetData.data.rows);
                    }
                }
            }
        }
        if (!this.DataGridStatus.isCheckAllEvent && this.DataGridSetData.singleSelect) {
            jqTr.siblings().each(function () {
                BootStrap.Datagrid.RemoveTrColor($(this));
            });
        }
    },
    /*增加行的颜色*/
    AddTrColor: function (jqTr) {//单独放在一个函数，是为了统计选中的行数量和快速获取某行的值
        var index = this.GetRowIndex(jqTr); //第几行               
        this.AddTrColor2(index, jqTr);
    },
    /**
    * 删除行的颜色
    * @param {Number} index，行索引
    * @param {JqueryObject} jqTr，行tr的jQuery对象
    */
    RemoveTrColor2: function (index, jqTr) {
        if (BootStrap.Datagrid.DataGridStatus.selectTrIndexColl.contains(index)) {
            BootStrap.Datagrid.DataGridStatus.selectTrIndexColl.removeValue(index);
        }
        if (jqTr.hasClass("info")) {
            jqTr.removeClass("info");
            this.RemoveCheck(jqTr, index); //去掉选中
            if (this.DataGridSetData.onUnselect) { //如果不存在info样式，说明已经触发过onUnSelect，所以，开始存在info样式，才需要触发onUnSelect事件
                this.DataGridSetData.onUnselect(index, BootStrap.Datagrid.DataGridSetData.data.rows[index]);
                if (this.DataGridSetData.onUnselectAll) {
                    if (this.DataGridStatus.selectTrIndexColl.length == 0) { //判断时候全部取消
                        this.DataGridSetData.onUnselectAll(this.DataGridSetData.data.rows);
                    }
                }
            }
        } else {
            this.RemoveCheck(jqTr, index); //去掉选中
        }
    },
    /*删除行的颜色*/
    RemoveTrColor: function (jqTr) {
        var index = this.GetRowIndex(jqTr);
        this.RemoveTrColor2(index, jqTr);
    },
    /*checkbox去掉选中*/
    RemoveCheck: function (jqTr, rowIndex) {
        if (BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.contains(rowIndex)) {//同时去掉选中
            BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.removeValue(rowIndex);
            if (!this.DataGridStatus.isCheckAllEvent) {//如果是全选事件，就不必要做任何操作，因为全选触发的已经是点击事件，状态会自动改变
                var cb = jqTr.find("input:first");
                if (cb.attr("checked")) {
                    cb.attr("checked", false);
                    BootStrap.Datagrid.ChangeGlobalBoxStatus(false);
                }
            }
        }
    },
    /*切换行的颜色*/
    TrToggleClass: function (index, jqTr) {
        if (jqTr.hasClass("info")) {
            BootStrap.Datagrid.RemoveTrColor2(index, jqTr);
        } else {
            BootStrap.Datagrid.AddTrColor2(index, jqTr);
        }
    },
    /*指定添加或删除*/
    TrToggleClass2: function (isAdd, jqTr) {
        if (isAdd) {
            if (!jqTr.hasClass("info")) {
                BootStrap.Datagrid.AddTrColor(jqTr);
            }
        } else {
            if (jqTr.hasClass("info")) {
                BootStrap.Datagrid.RemoveTrColor(jqTr);
            }
        }
    },
    //#endregion   
    /*jQuery点击列表前面的checkbox，如果是调用jQuery的click事件，那么就会导致先执行事件，再更新checked的值，因此，要对这个情况作处理*/
    JqClickCheckBox: function (jqBox) {
        this.DataGridStatus.isJqClickCheckBox.isJqClick = true;
        this.DataGridStatus.isJqClickCheckBox.value = jqBox.attr("checked") == undefined;
        jqBox.click();
    },
    /* 根据条件判断是否勾选checkbox */
    JudgeClickCheckBox: function (jqTr) {
        var cb = jqTr.find("input:first");
        var _trHasInfoClass = jqTr.hasClass("info");
        var _isCheck = cb.attr("checked");
        //如果选中行，而且已经是勾选checkbox，或者没有选中行，而且也没有勾选checkbox，那么就不需要执行checkbox事件
        if (!((_trHasInfoClass && _isCheck) || (!_trHasInfoClass && _isCheck == undefined))) {
            BootStrap.Datagrid.DataGridStatus.isSelectOnCheckEvent = true; //记录是selectOnCheck事件
            BootStrap.Datagrid.JqClickCheckBox(cb);
        }
    },
    /*
    * 改变控制全选checkbox的状态
    * @param {Boolean} isChecked，值为true，选中；fals取消
    */
    ChangeGlobalBoxStatus: function (isChecked) {
        if (isChecked) {
            if (!BootStrap.Datagrid.DataGridStatus.cacheGlobalBoxStatus) {//如果是不选中
                BootStrap.Datagrid.DataGridStatus.cacheGlobalBoxStatus = true; //记录已经选中
                var globalBox = $("#" + BootStrap.Datagrid.DataGridStatus.checkAllId);
                if (!globalBox.attr("checked")) {
                    globalBox.attr("checked", true);
                    BootStrap.Datagrid.CheckAllBox(BootStrap.Datagrid.DataGridSetData.data.rows); //执行用户定义的全选后的事件
                }
            }
        } else {
            if (BootStrap.Datagrid.DataGridStatus.cacheGlobalBoxStatus) {//如果是已经选中才执行
                BootStrap.Datagrid.DataGridStatus.cacheGlobalBoxStatus = false;
                var globalBox = $("#" + BootStrap.Datagrid.DataGridStatus.checkAllId);
                if (globalBox.attr("checked")) {
                    globalBox.attr("checked", false);
                }
            }
        }

    },
    /*全选checkbox时执行的事件*/
    CheckAllBox: function (rows) {
        if (this.DataGridSetData.onCheckAll) {
            this.DataGridSetData.onCheckAll(rows);
        }
    },
    /*取消全选checkbox时执行的事件*/
    UnCheckAllBox: function (rows) {
        if (this.DataGridSetData.onUncheckAll) {
            this.DataGridSetData.onUncheckAll(rows);
        }
    },
    /*生成html数据*/
    GenerateTableHtml: function () {
        var table = $("#" + this.DataGridStatus.tableId);
        if (this.DataGridStatus.isFirstLoad) {
            table.html(this.LoadTableHead()); //表头
        }
        table.find("tbody").remove(); //.find("tr:gt(0)").remove();
        table.append(this.GetGeneralColumnsHtml());
        if (this.DataGridSetData.pagination) {
            BootStrap.Pager.SetPageHtmlAjax({
                pageIndex: this.DataGridSetData.pageIndex,
                pageSize: this.DataGridSetData.pageSize,
                pageTotalCount: this.DataGridSetData.data.total,
                hrefUrl: this.DataGridSetData.url,
                pageList: this.DataGridSetData.pageList,
                pageEvent: null,
                eventData: null
            });
        }

    },
    LoadTableHead: function () {
        var headTemplate = '<thead><tr class="datagrid-header">%1</tr></thead>';
        var headTd = '<th field="%3" class="table-common-th" %1><div class="datagrid-cell table-th-div %1">%2</div></th>';
        var headHtml = [];
        var dataGridSetData = this.DataGridSetData;
        if (dataGridSetData.columns && dataGridSetData.columns.length > 0) {
            var style = [];
            var rownumberData = this.GetRownumberData();
            headHtml.push('<th class="table-rownumbers-thtd" ' + rownumberData.widthPx + '>&nbsp;</th>');
            if (dataGridSetData.checkbox) {
                headHtml.push('<th class="table-first-thtd"><input type="checkbox" id="' + this.DataGridStatus.checkAllId + '" class="group-checkable" /></th>');
            }
            $.each(dataGridSetData.columns[0], function (i, d) {
                var className = "grid_cell_" + d.field;
                var width = "width:" + (d.width ? d.width : 80) + "px;";
                style.push({ key: "." + className, value: "{" + width + "}" });
                var thStyle = "style='" + width + "'";
                headHtml.push(String.format(headTd, thStyle, d.title, d.field));
                //BootStrap.Datagrid.DataGridStatus.columnSequence.push(d.field);//记录列的顺序
            });
            headHtml.push('<th class="table-last-thtd" style="border-top:0;"><div class="datagrid-cell">&nbsp;</div></th>'); //最后一个td是填充作用
            headTemplate = String.format(headTemplate, headHtml.join(" "));
            BootStrap.Tools.CreateStyle(style); //创建样式
        }
        return headTemplate;
    },
    GetFrozenColumnsHtml: function () {

    },
    /*生成非冻结列*/
    GetGeneralColumnsHtml: function () {
        var bodyTrHtml = [];
        var tds = [];
        if (this.DataGridSetData.data && this.DataGridSetData.data.rows) {
            var getAlign = function (val) {
                if (val) {
                    return "text-align:" + val + ";";
                } else {
                    return "text-align:left;";
                }
            };
            var rownumberData = this.GetRownumberData(); //获取rownumber的数据
            $.each(this.DataGridSetData.data.rows, function (index, data) {
                tds.length = 0;
                tds.push('<td class="table-rownumbers-thtd" ' + rownumberData.widthPx + '>' + (rownumberData.hasNumber ? String(++rownumberData.beginIndex) : "") + '</td>');
                if (BootStrap.Datagrid.DataGridSetData.checkbox) {
                    tds.push('<td class="table-first-thtd"><input type="checkbox" id="cb_row_' + index + '" class="group-checkable" /></td>');
                }
                $.each(BootStrap.Datagrid.DataGridSetData.columns[0], function (i, d) {
                    var className = "grid_cell_" + d.field;
                    var nowrapClass = BootStrap.Datagrid.DataGridSetData.nowrap ? "datagrid-cell-nowrap" : "";
                    var tText = data[d.field];
                    if (d.formatter) {
                        tText = d.formatter(tText, data, index);
                    }
                    tds.push("<td  class='datagrid-body-cell" + " " + nowrapClass + " " + className + "' style='" + getAlign(d.align) + "'  field='" + d.field + "'>" + tText + "</td>");

                });
                tds.push("<td class='datagrid-body-cell table-last-thtd' style='border-top:0;'>&nbsp;</td>");
                var _rowSytle = "";
                if (typeof BootStrap.Datagrid.DataGridSetData.rowStyler == "function") {
                    _rowSytle = BootStrap.Datagrid.DataGridSetData.rowStyler(index, data);
                    _rowSytle = _rowSytle ? " style='" + _rowSytle + "'" : "";
                }
                var trDefClass = index % 2 != 0 ? " class='datagrid-tr-even' " : ""; //隔行变色
                bodyTrHtml.push("<tr" + _rowSytle + trDefClass + " dataIndex='" + index + "'>" + tds.join(" ") + "</tr>");
            });
        }
        return "<tbody>" + bodyTrHtml.join(" ") + "</tbody>";
    },
    /*获取rownumber的数据*/
    GetRownumberData: function () {
        var beginIndex = (BootStrap.Datagrid.DataGridSetData.pageIndex - 1) * BootStrap.Datagrid.DataGridSetData.pageSize;
        var hasNumber = BootStrap.Datagrid.DataGridSetData.rownumbers;
        var widthPx = ""; //根据数字的位数确定rownumber列的宽度
        if (hasNumber) {
            var max = beginIndex + BootStrap.Datagrid.DataGridSetData.pageSize;
            widthPx = "style='width:" + (6 * String(max).length) + "px'"; //每个数字宽度为6像素
        }
        return { beginIndex: beginIndex, hasNumber: hasNumber, widthPx: widthPx };
    },



    //#region 获取datagrid各个值的方法
    Options: function (tableId) {
        return BootStrap.Datagrid.DataGridSetData;
    },
    /*返回页面对象*/
    GetPager: function (tableId) {
        return BootStrap.Pager.pageData;
    },
    /* 返回非冻结列字段，以数组形式返回*/
    GetColumnFields: function (tableId) {
        var fields = [];
        $.each(this.DataGridSetData.columns[0], function (i, d) {
            fields.push(d.field); //记录列的顺序
        });
        return fields;
    },
    /* 返回冻结列字段*/
    GetFrozenColumnFields: function (tableId) {
        return null;
    },
    /* 返回指定列属性*/
    GetColumnOption: function (tableId, field) {
        var cloumns = BootStrap.Datagrid.DataGridSetData.columns[0];
        for (var i in cloumns) {
            if (cloumns[i].field == field) {
                return BootStrap.Tools.Clone(cloumns[i]);
            }
        }
        return null;
    },
    /*加载和显示第一页的所有行。如果指定了'param'，它将取代'queryParams'属性*/
    Load: function (tableId, param) {
        BootStrap.Datagrid.DataGridSetData.pageIndex = 1;
        BootStrap.Datagrid.LoadData(BootStrap.Datagrid.DataGridStatus.tableId, param);
    },
    /*重载行。等同于'load'方法，但是它将保持在当前页。*/
    Reload: function (tableId, param) {
        BootStrap.Datagrid.LoadData(BootStrap.Datagrid.DataGridStatus.tableId, param);
    },
    /*返回加载完毕后的数据*/
    GetData: function (tabledId) {
        return BootStrap.Tools.Clone(BootStrap.Datagrid.DataGridSetData.data);
    },
    /*返回当前页的所有行。*/
    GetRows: function (tabledId) {
        return BootStrap.Tools.Clone(BootStrap.Datagrid.DataGridSetData.data.rows);
    },
    /*根据索引集合获取行的数据*/
    GetByRowIndexs: function (tabledId, indexColl) {
        var checkRow = [];
        if (indexColl) {
            indexColl.delRepeat();
            $.each(indexColl, function (i, d) {
                checkRow.push(BootStrap.Datagrid.DataGridSetData.data.rows[d]);
            });
        }
        return checkRow;
    },
    /*返回复选框被选中复选框的所有行。*/
    GetChecked: function (tabledId) {
        return this.GetByRowIndexs(this.DataGridStatus.checkedBoxIndexColl);
    },
    /*返回所有被选中的行，当没有记录被选中的时候将返回一个空数组。*/
    GetSelections: function (tabledId) {
        return this.GetByRowIndexs(this.DataGridStatus.selectTrIndexColl);
    },
    /*返回第一个被选中的行或如果没有选中的行则返回null。*/
    GetSelected: function (tabledId) {
        if (this.DataGridStatus.selectTrIndexColl.length < 1) {
            return null;
        }
        this.DataGridStatus.selectTrIndexColl.delRepeat();
        var data = null;
        this.DataGridStatus.selectTrIndexColl.sort();
        if (BootStrap.Datagrid.DataGridSetData.data) {
            return BootStrap.Tools.Clone(BootStrap.Datagrid.DataGridSetData.data.rows[this.DataGridStatus.selectTrIndexColl[0]]);
        }
        return null;

    },
    /*清除所有选择的行*/
    ClearSelections: function (tabledId) {
        $("#" + this.DataGridStatus.tableId + " tr.info").each(function () {
            $(this).find("td:first").click(); //如果单击行是编辑列的话，点击的时候，可能会出现编辑框，这是一个bug
            //$(this).removeClass("info");//清除所有选择的行，不会触发点击事件          
        });
        this.DataGridStatus.selectTrIndexColl.length = 0; //清空选中
    },
    /*清除所有勾选的行*/
    ClearChecked: function (tabledId) {
        $("#" + this.DataGridStatus.tableId + " tr:gt(0)").each(function (i) {
            if (BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.contains(i)) {
                var cb = $(this).find("input:first");
                if (cb.attr("checked")) {
                    BootStrap.Datagrid.JqClickCheckBox(cb); //清除选中，同时触发选中事件
                }
            }
        });
        BootStrap.Datagrid.DataGridStatus.checkedBoxIndexColl.length = 0;
    },
    /*选择当前页中所有的行*/
    SelectAll: function (tabledId) {
        $("#" + this.DataGridStatus.tableId + " tr:gt(0):not(tr.info)").each(function () { $(this).find("td:first").click(); });
    },
    /*择一行，行索引从0开始。*/
    SelectRow: function (tabledId, index) {
        if (index < 0) return;
        if (!this.DataGridStatus.selectTrIndexColl.contains(index)) {
            this.DataGridStatus.selectTrIndexColl.push(index); //记录选中
            //要排除掉第一行的thread
            var row = $("#" + this.DataGridStatus.tableId + " tr:eq(" + (++index) + "):not(tr.info)");
            if (row.length > 0) {
                row.find("td:first").click();
            }
        }
    },
    /*取消选择一行*/
    UnselectRow: function (tabledId, index) {
        if (index < 0) return;
        if (this.DataGridStatus.selectTrIndexColl.contains(index)) {
            this.DataGridStatus.selectTrIndexColl.removeValue(index); //剔除选中
            //要排除掉第一行的thread
            var row = $("#" + this.DataGridStatus.tableId + " tr:eq(" + (++index) + ")");
            if (row.length > 0) {
                if (row.hasClass("info")) {
                    row.find("td:first").click();
                }
            }
        }
    },
    /* 设置页面额外数据 setJsonData={displayMsg:"额外数据"} */
    SetPagerDisplayMsg: function (tabledId, setJsonData) {
        BootStrap.Pager.SetPagination(setJsonData);
    }
    //#endregion
};

/**
* 分页组件
* @namespace BootStrap.Pager
* @description 获取分页的html
*/
BootStrap.Pager = {
    paginationHtml: '<div class="pagination pagination-left"> </div>',
    paginationWrite: '<div class="pagination-info-right"><span style="color: red">可填充内容</span>&nbsp;</div>',
    //分页div样式名称
    _paginationDivClassName: "pagination",
    pageData: null,
    ShowGridMaskLayout: function () {
        var accordionHeight = $("#accordion").outerHeight(true);
        if (!accordionHeight) {
            accordionHeight = 0;
        }
        BootStrap.Tools.ShowMaskLayout2(0.5, accordionHeight);
    },
    HideGridMaskLayout: function () {
        //BootStrap.Tools.HideMaskLayout2();
    },
    GetPagination: function () {
        var pager = $("." + this._paginationDivClassName);
        if (pager.length > 0) {
            return pager;
        } else {
            var pagination = $(this.paginationHtml + this.paginationWrite);
            $(".body-panel-content").after(pagination);
            return this.GetPagination();
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
    GetPageListHtml: function (pageList, selectItem) {
        if (!pageList) {
            return "";
        }
        var pageHtml = [];
        pageHtml.push('<select class="pagination-page-list pagination-page-list-other">');
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
    * @param {Json} pageSetJsonData，页设置Json数据：{pageIndex: 1,pageSize: 10,pageTotalCount: 50,pageList: [10,20],hrefUrl: "/Home",pageEvent: function(){},eventData: function(){}}
    * @param {Number} pageIndex，当前页
    * @param {Number} pageSize，每页数据量大小
    * @param {Number} pageTotalCount，总数据量
    * @param {String} hrefUrl，要跳转的连接：/Home/Index
    * @param {String} urlAttr，连接字符串： id=1&name=abc
    */
    SetPageHtmlAjax: function (pageSetJsonData) {
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
        var pageHtml = this.PageDataToHtmlAjax();
        var pagination = this.GetPagination();
        pagination.html(pageHtml);
        if (this.pageData.pageEvent && (typeof this.pageData.pageEvent) === "function") {
            pagination.find("ul li a[isclick!=true]").click(function () {
                if (!($(this).hasClass("disabled") || $(this).hasClass("active"))) {
                    pageEvent(eventData);
                }
            });
        }
        this.AddEvent();
    },
    PageDataToHtmlAjax: function () {
        var _pageData = this.pageData;
        if (_pageData.hrefUrl) {
            _pageData.hrefUrl = _pageData.hrefUrl.replace("?", "");
        }
        var showPageCount = 4; //显示页码个数
        var start = (_pageData.pageIndex - showPageCount / 2) >= 1 ? _pageData.pageIndex - showPageCount / 2 : 1;
        var end = (_pageData.realPages - start) > showPageCount ? start + showPageCount : _pageData.realPages;
        var pagerHtmlArr = [];
        pagerHtmlArr.push(this.GetPageListHtml(_pageData.pageList, _pageData.pageSize));
        pagerHtmlArr.push('<ul>');
        var disablePre = _pageData.hasPrePage ? "" : 'class="disabled"'; //是否可以点击上一页
        pagerHtmlArr.push(String.format('<li isclick="true" %1><a href="javascript:void(0);" page="1" >首页</a></li>', disablePre)); //首页
        pagerHtmlArr.push(String.format('<li isclick="true" %1><a href="javascript:void(0);"  page="%2">«</a></li>', disablePre, String(_pageData.pageIndex - 1)));

        if (BootStrap.Datagrid.DataGridSetData.data.rows && BootStrap.Datagrid.DataGridSetData.data.rows.length > 0) {
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
    AddEvent: function () {
        var paginationDiv = this.GetPagination();
        paginationDiv.find("ul li a.page_go").click(function (e) {
            BootStrap.Tools.StopBubble(e);
            console.info(e);
            console.info(event);
            var pagerPlugin = BootStrap.Pager;
            if (pagerPlugin.pageData.pageTotalCount < 1) {
                return false;
            }
            var pageVal = paginationDiv.find("ul li input").val();
            if (!pageVal) {
                return false;
            }
            var intPageIndex = parseInt(pageVal);
            var realPageCount = pagerPlugin.GetRealPages(pagerPlugin.pageData.pageTotalCount, pagerPlugin.pageData.pageSize); //获取总页数
            if (intPageIndex > realPageCount) {
                intPageIndex = realPageCount;
            }
            BootStrap.Datagrid.DataGridSetData.pageIndex = intPageIndex; //记录是第几页
            BootStrap.Datagrid.LoadData(BootStrap.Datagrid.DataGridStatus.tableId, { pageIndex: intPageIndex });
            return false;
        });
        paginationDiv.find("ul li[isclick='true']").click(function (e) {
            BootStrap.Tools.StopBubble(e);
            if ($(this).hasClass("disabled") || $(this).hasClass("active")) {
                return;
            }
            var intPageIndex = parseInt($(this).find("a").attr("page"));
            BootStrap.Datagrid.DataGridSetData.pageIndex = intPageIndex; //记录是第几页
            BootStrap.Datagrid.LoadData(BootStrap.Datagrid.DataGridStatus.tableId, { pageIndex: intPageIndex });
        });
        paginationDiv.delegate(".pagination-page-list", "change", function (e) {
            var pageSize = $(this).val();
            if (pageSize) {
                setTimeout(function () {
                    BootStrap.Datagrid.LoadData(BootStrap.Datagrid.DataGridStatus.tableId, { pageSize: pageSize });
                }, 0);
            }
        });

    },
    GoToPageIndex: function (jqA) {
        alert(pageIndex);
        BootStrap.Datagrid.LoadData(BootStrap.Datagrid.DataGridStatus.tableId, { pageIndex: parseInt(jqA.attr("page")) });
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
    SetPageHtml: function (pageIndex, pageSize, pageTotalCount, hrefUrl, urlAttr) {
        if (!pageIndex || !pageSize || !pageTotalCount) {
            return;
        }
        var pageData = {
            pageIndex: pageIndex, pageSize: pageSize, pageTotalCount: pageTotalCount,
            realPages: 0, hasNextPage: false, hasPrePage: false, hrefUrl: hrefUrl, urlAttr: urlAttr,
            pageEvent: null, eventData: null
        };
        this.GetPagination().html(this.PageDataToHtml(this.SetPageData(pageData)));
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
    SetPageHtml2: function (pageIndex, pageSize, pageTotalCount, hrefUrl, urlAttr, pageEvent, eventData) {
        if (!pageIndex || !pageSize || !pageTotalCount) {
            return;
        }
        var pageData = {
            pageIndex: pageIndex, pageSize: pageSize, pageTotalCount: pageTotalCount,
            realPages: 0, hasNextPage: false, hasPrePage: false, hrefUrl: hrefUrl, urlAttr: urlAttr,
            pageEvent: pageEvent, eventData: eventData
        };
        var pagination = this.GetPagination();
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
    SetPagination: function (setJsonData) {
        if (setJsonData.displayMsg) {
            $(".pagination-info-right span").html(setJsonData.displayMsg);
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
        this.BuildCombox($(newOption.id), newOption);
        if (newOption.onLoadSuccess) {
            this.OnLoadSuccess(newOption.data);
        }
        if (!newOption.isLoadSuccess) {
            this.OnLoadError();
        }
    },
    BuildCombox: function (combobox, jsonData) {
        //添加输入框与下拉点击区域
        combobox.append('<input type="text" class="combobox_input" data-value="" label="' + jsonData.label + '" /><span class="combobox_searbtn"></span><div class="combobox_data_list"></div>');
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
    /*设置下拉列表框值数组*/
    SetValue: function (comboboxId, text) {
        var combobox = $("#" + comboboxId);
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
        var combobox = $("#" + comboboxId);
        var input = combobox.find("input:first");
        if (!input) return;
        input.attr("data-value", "").val("");
    }
    //#endregion
};

BootStrap.Window = {
    Dialog: {

},
Messager: {
    /*消息窗口：%1是标题；2%消息内容；*/
    ModalHtml: '<div class="modal" style="position: relative; top: auto; left: auto; right: auto; margin: 0 auto 20px; z-index: 1000; max-width: 100%;">\
                  <div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3>%1</h3></div><div class="modal-body"><p>%2</p></div><div class="modal-footer"><a href="#" class="btn">关闭</a><a href="#" class="btn btn-primary">Save changes</a></div>\
                </div>',
    Alert: function (options) {
        /*showType：定义将如何显示该消息。可用值有：null,slide,fade,show。默认：slide。
        showSpeed：定义窗口显示的过度时间。默认：600毫秒。
        width：定义消息窗口的宽度。默认：250px。
        height：定义消息窗口的高度。默认：100px。
        title：在头部面板显示的标题文本。
        msg：显示的消息文本。
        style：定义消息窗体的自定义样式。
        timeout：如果定义为0，消息窗体将不会自动关闭，除非用户关闭他。如果定义成非0的树，消息窗体将在超时后自动关闭。默认：4秒。*/
        var modal = $(".modal");
        if (modal.length < 1) {
            modal = $(this.ModalHtml);
            $(document.body).append(modal);
        }
        //赋值
        //modal.show();
    },
    /*
    * 显示一个包含“确定”和“取消”按钮的确认消息窗口
    * @param {String} title：在头部面板显示的标题文本。
    * @param {String} msg：显示的消息文本。
    * @param {Function} fn(b): 当用户点击“确定”按钮的时侯将传递一个true值给回调函数，否则传递一个false值。
    */
    Confirm: function (title, msg, fn) {

    }
}
}
;

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
                "z-index": "1000"
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
    GetStyleSheetByArrry: function (styleSheetArr) {
        var style = [];
        $.each(styleSheetArr, function () {
            style.push(this.key + this.value);
        });
        return style.join(" ");
    },
    CreateStyle: function (styleSheetArr) {
        if ($.browser.msie) {
            var sheet = document.createStyleSheet();
            $.each(styleSheetArr, function () {
                sheet.addRule(this.key, this.value);
            });
        }
        else {
            var styleStr = this.GetStyleSheetByArrry(styleSheetArr);
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = styleStr; // "body{ background-color:blue }";
            document.getElementsByTagName('HEAD').item(0).appendChild(style);
        }
        //if ($.browser.msie) {
        //    window.style=styleStr;
        //    document.createStyleSheet("javascript:style");
        //}
    },
    ReadJsonKeys: function (jsonData) {
        var keys = [];
        for (var i = 0, len = jsonData.length; i < len; i++) {
            for (var key in jsonData[i]) {
                //alert("key：" + key + ",value：" + jsonData[i][key]);
                keys.push(key);
            }
        }
        return keys;
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
        var newObj = new Object();
        for (var i in obj)
            newObj[i] = this.Clone(obj[i]);
        return newObj;
    }
};

BootStrap.InitPage = {
    isFirstLoad: true,
    Init: function () {
        this.AddEvent();
        this.SetPageElementPosition(0);

    },
    AddEvent: function () {
        $(".accordion-heading").click(function () {//搜索区域的隐藏事件
            var jqAccordion = $(this).find("a");
            var accordion = $($(this).attr("data-target"));
            accordion.fadeToggle(200);
            if (jqAccordion.hasClass("accordion-collapse")) {
                jqAccordion.removeClass("accordion-collapse").addClass("accordion-expand");
                BootStrap.InitPage.SetPageElementPosition(0); //展开后，高度也会变化
            } else {
                jqAccordion.removeClass("accordion-expand").addClass("accordion-collapse");
                var collapseHeight = accordion.outerHeight(false);
                BootStrap.InitPage.SetPageElementPosition(collapseHeight); //隐藏后，高度发生变化
            }
        });
    },
    /**
    * 设置当前页大高度
    * @param {offsetHeight} 高度偏移量，正负数都可以
    */
    SetPageElementPosition: function (offsetHeight) {
        var screenHeight = (document.documentElement && document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight);
        var accordionHeight = $("#accordion").outerHeight(true);
        var toolbarHeight = $(".datagrid-toolbar").outerHeight(false);
        var pageHeight = $(".pagination").outerHeight(true);
        $(".body-panel-content").css("height", (screenHeight - accordionHeight - pageHeight - toolbarHeight + offsetHeight) + "px");
    }
}
;
/**
* 初始化BootStrap的各个组件
*/
$(function () {
    //    BootStrap.Tabs.Init(); //标签页初始化
    BootStrap.InitPage.Init();
});



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
                $("body").css("cursor", "w-resize");
            }
            else if ($this._dragArea.right.x1 <= xx && xx <= $this._dragArea.right.x2 && $this._dragArea.right.y1 <= yy && yy <= $this._dragArea.right.y2) {
                $("body").css("cursor", "w-resize");
            }
            else {
                $("body").css("cursor", "");
            }

        });

        _lspV.bind("mousedown", function () {
            _lspV.css({
                opacity: "0.6"
            });
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