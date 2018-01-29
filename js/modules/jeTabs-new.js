;
(function (root, factory) {
    //amd
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        //umd
        module.exports = factory();
    } else {
        root.jeTabs = factory(window.$ || $);
    }
})(this, function ($) {
    var tab = {
        tempDom: [],
        i: 0,
        timeoutId: null,
    };
    var cache = {};

    //点击切换Tabs选项卡面板
    var opts = {
        cell: "",
        skinCell: "tabpanel",
        currCls: "active", //当前高亮的标识class
        contextmenu: true, //是否启用右键快捷菜单
        menulist: { //右键菜单列表
            refresh: '刷新此标签',
            closeThis: '关闭此标签',
            closeOther: '关闭其他标签',
            closeLeft: '关闭左侧标签',
            closeRight: '关闭右侧标签'
        },
        items: [],
        distance: 100, 
        closefun: null,
        success: null //加载成功后的回调
    };
    tab.uuid = function (num) {
        var len = num || 10,
            str = "",
            arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        for (var i = 0; i < len; i++) str += arr[Math.round(Math.random() * (arr.length - 1))];
        return str;
    };
    tab.removeTabs = function (nav, con) {
        nav.on("click", "em.close", function () {
            var idx = $(this).parent().index(),
                tabarr = tab.tempDom[tab.tempDom.length == 1 ? 0 : idx - 1];
            tab.tempDom.splice(idx, 1);
            $(opts.cell).find("ul[tabsnav]").children().removeClass(opts.currCls);
            $(opts.cell).find("div[tabscon]").children().removeClass(opts.currCls);
            tabarr.clsnav.addClass(opts.currCls);
            tabarr.clscon.addClass(opts.currCls);
            nav.remove();
            con.remove();
        })
    };
    tab.selectedTabs = function (nav, con) {
        nav.on("click", function () {
            $(this).addClass(opts.currCls).siblings().removeClass(opts.currCls);
            con.addClass(opts.currCls).siblings().removeClass(opts.currCls);
        })
    };
    tab.createTabs = function (tabtxt, taburl, isClose) {
        var isPeer = window.top != window.self,
            tabuid = tab.uuid(),
            emclose = isClose == undefined || isClose == true ? $('<em/>', {
                "class": "close",
                "cell": tabuid
            }) : "";
        var tabNav = $("<li/>"),
            tabCon = $("<div/>", {
                "class": "tab-conwrap"
            });
        tabNav.html("<span>" + tabtxt + "</span>").append(emclose);
        tabCon.html("<iframe src='" + taburl + "' scrolling='yes' cell='ifr" + tabuid + "' frameborder='0'></iframe>").attr("srcurl", taburl);
        tab.tempDom.push({
            clsnav: tabNav,
            clscon: tabCon
        });
        tab.selectedTabs(tabNav, tabCon);
        if (isClose == undefined || isClose == true) tab.removeTabs(tabNav, tabCon);
        return {
            nav: tabNav,
            con: tabCon
        }
    };
    tab.contextMenu = function (params) {
        var menuCell = $('<div>', {
                'id': 'tabMenus',
                'class': 'tabmenubox'
            }),
            createMenu = function (elcell, text) {
                return $('<p>', {
                    'class': elcell,
                    'data-right': elcell
                }).append(text);
            };
        $('#tabMenus').remove();
    };
    // 获取容器的宽度
    tab.getContainerWidth = function (el) {
        tab.setCache({
            getContainerWidth: $(el).width()
        })
    };
    // 获得导航条的容器的宽度
    tab.getNavListsWidth = function (el, childEl) {
        if (!el || !childEl) return;
        var totalWidth = 0;
        $(el).find(childEl).each(function () {
            totalWidth += $(this).outerWidth(true);
            $(this).attr({where:totalWidth});
        });

        tab.setCache({
            totalWidth: totalWidth
        });
        
    };
    // 获得可移动的范围
    tab.moveRange = function (fatherEl, el, childEl) {
        var getMenuW = tab.getCache('totalWidth'),
            getConW = tab.getCache('getContainerWidth');
        if (getMenuW > getConW) {
            tab.setCache({
                moveRange: getMenuW - getConW
            });
        } else {
            tab.setCache({
                moveRange: 0
            })
        };
        cache['currentRangeVal'] = cache['moveRange'];
    }
    // 缓存系统
    tab.setCache = function (obj) {
        if (!obj) return;
        for (var key in obj) {
            cache[key] = obj[key]
        };
    }
    tab.getCache = function (key) {
        if (!key || !cache[key]) return;
        return cache[key]

    }
    tab.clearCache = function () {
        cache = {};
    }
    // 测试是否具备移动的资格
    tab.isMove = function () {
        return (cache['moveRange'] && cache['moveRange'] > 0) ? true : false;
    }

    // 监听左右按钮单击
    // @type  click  dbclick
    tab.listentEvent = function (btn, type, callback) {

        switch (type) {
            case 'click':
                $(btn).on({
                    click: function () {
                       
                        callback && callback()
                    }
                });
                break;
            case 'dblclick':
                $(btn).on({
                    dblclick: function () {
                        
                        callback && callback()
                    }
                });
                break;
            default:
                return;
        }

    }

    // 移动动画
    tab.animated = function (targe, until) {

        $(targe).animate(until, 300);

    }
    // 移动到开始位置或者结束位置
    tab.endMove = function (target, direction) {
        if (tab.isMove()) {
            switch (direction) {
                case 'left':
                    tab.animated(target, {
                        'left': 0
                    });
                    cache['currentRangeVal'] = 0;
                    tab.setCache({start:0}) ;
                    tab.setCache({end:cache['getContainerWidth']})
                    break;
                case 'right':
                    var end = cache['moveRange'];
                    tab.animated(target, {
                        'left': '-' + end + 'px'
                    });
                    cache['currentRangeVal'] = end;
                    tab.setCache({start:cache['totalWidth']-cache['getContainerWidth']}) ;
                    tab.setCache({end:cache['totalWidth']})
                    break;
                default:
                    return;

            }
        }
    }

    // 左右移动事件（动画）
    tab.move = function (target, distance) {
        if (tab.isMove()) {
            tab.animated(target, {
                left: -distance + 'px'
            })
        }
    }
    // 点击li，使当前激活的li移动到可视区域
    tab.smartMove = function(elem){
        elem.on('click',function(){
           
            var leftPos = parseInt($(this).prev().attr('where'),10);
            var rightPos = parseInt($(this).attr('where'),10);
            var diff = cache['end']-cache['getContainerWidth'];
            tab.setCache({start:diff}) ;
            console.log(cache);
            if(leftPos<=cache['start']){
                
                var diffLeft = cache['start']-leftPos;
                tab.move('.tab-itemmove',cache['currentRangeVal']-diffLeft);
                tab.setCache({end:cache['end']-diffLeft});
                
            };
            if(rightPos>cache['end']){
               
                var diffRight = rightPos-cache['end'];
                tab.move('.tab-itemmove',cache['currentRangeVal']+diffRight);
            }
        })
    };

    var jeTabs = {
        config: function (params) {
            $.extend(opts, params || {});
            var that = this,
                TabPane = $("<div>", {
                    "class": opts.skinCell
                }),
                TabWrap = $("<div>", {
                    "class": "tab-contrlwrap"
                }),
                Tabboxs = $("<div>", {
                    "class": "tab-itemwrap"
                }),
                Tabitem = $("<ul>", {
                    "tabsnav": "",
                    "class": "tab-itemmove"
                }),
                TabCont = $("<div>", {
                    "tabscon": "",
                    "class": "tab-panelcontent"
                }),
                TabLeBut = $("<div>", {
                    "class": "tab-leftbtn tab-scroll"
                }),
                TabRiBut = $("<div>", {
                    "class": "tab-rightbtn tab-scroll"
                });
            //将内容追加到目标元素中
            var wraphtml = TabWrap.append(Tabboxs.append(Tabitem)).append(TabLeBut).append(TabRiBut);
            $(opts.cell).html(TabPane.prepend(wraphtml).append(TabCont));
            $.each(opts.items, function (i, val) {
                var first = that.addTab({
                    text: val.text,
                    url: val.url,
                    close: val.close
                });
                if (i == 0) {
                    first.nav.addClass(opts.currCls);
                    first.con.addClass(opts.currCls);
                }
            });
            tab.getContainerWidth('.tab-itemwrap');
            // 双击
            tab.listentEvent(TabLeBut, 'dblclick', function () {
                clearTimeout(tab.timeoutId);
                tab.endMove('ul[tabsnav]', 'left');
            });
            tab.listentEvent(TabRiBut, 'dblclick', function () {
                clearTimeout(tab.timeoutId);
                tab.endMove('ul[tabsnav]', 'right');
            });
            //单击
            tab.listentEvent(TabLeBut, 'click', function () {
                clearTimeout(tab.timeoutId);
                tab.timeoutId = setTimeout(() => {
                    tab.i = 0;
                    tab.i++;
                    var currentVal = cache['currentRangeVal'] - tab.i * opts.distance;
                    if (currentVal < 0) {
                        currentVal = 0;
                    }
                    tab.setCache({
                        currentRangeVal: currentVal
                    });
                    tab.move('ul[tabsnav]', currentVal);
                    
                    var diffs = cache['end']-cache['getContainerWidth'];
                    
                    // if(diffs>=opts.distance){
                    //     tab.setCache({end:cache['end']-opts.distance});
                    // }else{
                    //     tab.setCache({end:cache['end']-diffs});
                    // }
                    if(cache['start']>=opts.distance){
                        tab.setCache({end:cache['end']-opts.distance});
                    }else{
                        tab.setCache({end:cache['end']-cache['start']});
                    }
                    
                }, 200);

            });
            tab.listentEvent(TabRiBut, 'click', function () {
                clearTimeout(tab.timeoutId);
                tab.timeoutId = setTimeout(function () {
                    tab.i = 0;
                    tab.i++;
                    var currentVal = cache['currentRangeVal'] + tab.i * opts.distance;
                    if (currentVal > cache['moveRange']) {
                        currentVal = cache['moveRange'];
                    }
                    tab.setCache({
                        currentRangeVal: currentVal
                    });
                    tab.move('ul[tabsnav]', currentVal);
                    
                    if((cache['end']+opts.distance)<=cache['totalWidth']){
                        tab.setCache({end:cache['end']+opts.distance});
                    }else{
                        var differ = cache['moveRange']-cache['start'];
                        tab.setCache({end:cache['end']+differ});
                    }
                    
                }, 200);
                

            })

            
        },
        addTab: function (obj) {
            var ctp = tab.createTabs(obj.text, obj.url, obj.close);
            $(opts.cell).find("ul[tabsnav]").append(ctp.nav);
            $(opts.cell).find("div[tabscon]").append(ctp.con);
            tab.getNavListsWidth('ul[tabsnav]', 'li');
            tab.moveRange('.tab-itemwrap', 'ul[tabsnav]', 'li');
            tab.endMove('ul[tabsnav]', 'right');
            tab.smartMove(ctp.nav);
            return ctp
        }

    }
    return jeTabs;
});