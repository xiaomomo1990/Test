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
                $("body").css("cursor", "n-resize");
                _lspV.css({
                    display: "block",
                    opacity: "0"
                });
                _lspV.css({
                    left: $this._location.north[0] + "px",
                    top: yy + "px",
                    width: $this._size.north[0] + "px",
                    height: "5px"
                });

            }
            else if ($this._dragArea.bottom.x1 <= xx && xx <= $this._dragArea.bottom.x2 && $this._dragArea.bottom.y1 <= yy && yy <= $this._dragArea.bottom.y2) {
                $("body").css("cursor", "n-resize");
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
                _lspV.css({
                    opacity: "0.6"
                });
                var xx = e.pageX - $this._getAbsolutely(_that, "left");
                var yy = e.pageY - $this._getAbsolutely(_that, "top");
                $this._dragArea.top.y1 = yy - 2.5;
                $this._dragArea.top.y2 = yy + 2.5;

                _lspV.css({
                    left: $this._location.north[0] + "px",
                    top: yy + "px",
                    width: $this._size.north[0] + "px",
                    height: "5px"
                });

            });
        });

        _lspV.bind("mouseup", function () {
            $("body").css("cursor", "");
            _lspV.css({
                display: "none"
            });
            _that.unbind("mousemove");

            var val1 = $this._dragArea.top.y1,
                val2 = $this._dragArea.bottom.y1 - $this._dragArea.top.y2,
                val3 = $this._dragArea.top.y2;

            $this._size.north[1] = val1;
            $this._size.center[1] = $this._size.east[1] = $this._size.west[1] = val2;
            $this._location.center[1] = $this._location.east[1] = $this._location.west[1] = val3;

            $this._layout();

        });
    }

}