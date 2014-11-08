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
        BootStrap.layout.Init();
    </script>
</body>
</html>
