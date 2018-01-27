;(function(root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "object") {
        //umd
        module.exports = factory();
    } else {
        root.jeTabs = factory(window.$ || $);
    }
})(this, function($) {  
    var tab = {tempDom:[]};
    //点击切换Tabs选项卡面板
    var opts = {
        cell:"",
        skinCell:"tabpanel",
        currCls:"active",                        //当前高亮的标识class
        contextmenu:true,                        //是否启用右键快捷菜单
        menulist: {                              //右键菜单列表
            refresh: '刷新此标签',
            closeThis: '关闭此标签',
            closeOther: '关闭其他标签',
            closeLeft: '关闭左侧标签',
            closeRight: '关闭右侧标签'
        },
        items:[],
        closefun:null,
        success:null                             //加载成功后的回调
    };
    tab.uuid = function(num) {
        var len = num || 10, str = "", arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        for (var i = 0; i < len; i++) str += arr[Math.round(Math.random() * (arr.length - 1))];
        return str;
    };
    tab.removeTabs = function(nav,con){
        nav.on("click","em.close",function () {
            var idx = $(this).parent().index(),
                tabarr = tab.tempDom[tab.tempDom.length == 1 ? 0 : idx - 1];
            tab.tempDom.splice(idx,1);
            $(opts.cell).find("ul[tabsnav]").children().removeClass(opts.currCls);
            $(opts.cell).find("div[tabscon]").children().removeClass(opts.currCls);
            tabarr.clsnav.addClass(opts.currCls);
            tabarr.clscon.addClass(opts.currCls);    
            nav.remove();  con.remove();
        })
    };
    tab.selectedTabs = function (nav,con) {
        nav.on("click",function () {
            $(this).addClass(opts.currCls).siblings().removeClass(opts.currCls);
            con.addClass(opts.currCls).siblings().removeClass(opts.currCls);
        })
    };
    tab.createTabs = function (tabtxt,taburl,isClose) {
        var isPeer = window.top != window.self, tabuid = tab.uuid(),
            emclose = isClose == undefined || isClose == true ? $('<em/>',{"class":"close","cell":tabuid}) : "";
        var tabNav = $("<li/>"), tabCon = $("<div/>",{"class":"tab-conwrap"});
        tabNav.html("<span>"+tabtxt+"</span>").append(emclose);
        tabCon.html("<iframe src='"+taburl+"' scrolling='yes' cell='ifr"+tabuid+"' frameborder='0'></iframe>").attr("srcurl",taburl);
        tab.tempDom.push({clsnav:tabNav,clscon:tabCon});
        tab.selectedTabs(tabNav,tabCon);
        if(isClose == undefined || isClose == true) tab.removeTabs(tabNav,tabCon);
        return {nav:tabNav,con:tabCon}
    };
    tab.contextMenu = function(params) {
        var menuCell = $('<div>', {'id': 'tabMenus', 'class': 'tabmenubox'}),
            createMenu = function (elcell, text) {
                return $('<p>', {'class': elcell, 'data-right': elcell}).append(text);
            };
        $('#tabMenus').remove();
    };
    // 获取容器的宽度
    tab.getContainerWidth=function(el){
        return $(el).width();
    };
    // 
    tab.getNavListsWidth=function(el,childEl){
        if(!el || !childEl) return;
        var totalWidth=0;
        [].slice.call($(el).find(childEl),0).forEach(function(item){
            totalWidth += item.offsetWidth
        });
        console.log(totalWidth);
        $('')
        return totalWidth;
    };
    tab.moveRange=function(fatherEl,el,childEl){
        var getMenuW = tab.getNavListsWidth(el,childEl),getConW = tab.getContainerWidth(fatherEl)
        if(getMenuW>getConW){
            return getMenuW - getConW
        }    
    }

    
    var jeTabs = {
        config:function (params) {
            $.extend(opts, params || {});
            var that = this, TabPane = $("<div>",{"class":opts.skinCell}),
                TabWrap = $("<div>",{"class":"tab-contrlwrap"}),
                Tabboxs = $("<div>",{"class":"tab-itemwrap"}),
                Tabitem = $("<ul>",{"tabsnav":"","class":"tab-itemmove"}),
                TabCont = $("<div>",{"tabscon":"","class":"tab-panelcontent"}),
                TabLeBut = $("<div>",{"class":"tab-leftbtn tab-scroll"}),
                TabRiBut = $("<div>",{"class":"tab-rightbtn tab-scroll"});
            //将内容追加到目标元素中
            var wraphtml = TabWrap.append(Tabboxs.append(Tabitem)).append(TabLeBut).append(TabRiBut);
            $(opts.cell).html(TabPane.prepend(wraphtml).append(TabCont)); 
            $.each(opts.items,function(i,val) {
                var first = that.addTab({
                    text:val.text, url:val.url, close:val.close
                });
                if(i==0){
                    first.nav.addClass(opts.currCls);
                    first.con.addClass(opts.currCls);
                } 
            });
            $(opts.cell).find("ul[tabsnav]").css('width',tab.getNavListsWidth())
          
        },
        addTab:function (obj) {
            var ctp = tab.createTabs(obj.text,obj.url,obj.close);
            $(opts.cell).find("ul[tabsnav]").append(ctp.nav);
            $(opts.cell).find("div[tabscon]").append(ctp.con);
            tab.moveRange('.tab-itemwrap','.tab-itemmove','li');
            return ctp
        }
        
    }
    return jeTabs;
});