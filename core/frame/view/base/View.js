import VPosition from "../../util/VPosition";
import VSize from "../../util/VSize";
import Application from "../../app/Application";

export default class View {
    constructor(id) {
        this.id = id || "";
        this.componentId = "";
        /**
         * View对应的节点
         * @type {HTMLElement}
         */
        this._ele = null;
        //绑定的viewManager
        this.viewManager = null;
        //绑定的数据
        this._data = null;
        //所属父控件
        this.fatherView = null;


        /**
         * Page默认的显示变化监听
         * Page的 监听的方法
         * @param view
         * @param isShowing
         */
        this.onVisibleChangeListener = "";
    }

    callVisibleChangeListener(view, isShowing) {
        var onVisibleChangeListener = null;
        if (this.onVisibleChangeListener) {
            if (typeof this.onVisibleChangeListener == "string") {
                onVisibleChangeListener = this.page[this.onVisibleChangeListener];
            } else if (this.onVisibleChangeListener instanceof Function) {
                onVisibleChangeListener = this.onVisibleChangeListener;
            } else {
                console.error("显示变化监听设置错误");
                return;
            }
            onVisibleChangeListener.call(this.page, view, isShowing);
        } else {
            if (this.fatherView) {
                this.fatherView.callVisibleChangeListener(view, isShowing);
            }
        }
    }

    /**
     * 显示
     */
    show() {
        this.setStyle("visibility", "");
        this.setStyle("display", "block");
        this.callVisibleChangeListener(this, true);
    }

    /**
     * 隐藏view
     */
    hide() {
        this.setStyle("visibility", "");
        this.setStyle("display", "none");
        this.callVisibleChangeListener(this, false);
    }

    /**
     * 是否显示
     * @return {boolean|boolean}
     */
    get isShowing() {
        return View.isShowing(this);
    }

    /**
     * 是否在显示范围
     */
    get isDisplayRange() {
        return View.isDisplayRange(this);
    }

    /**
     * 获取控件距父控件节点左上角的绝对坐标
     * @returns {VPosition} 可以是负值；left负值：在显示区域上方；top负值：在显示区域左侧
     */
    getPositionByFather() {
        var left = this.left;
        var top = this.top;

        if (!this.fatherView) {//兼容，正常请款不会出现
            return new VPosition(left, top);
        }

        var childEle = this.ele;
        var fatherEle = this.fatherView.ele;
        while (true) {
            var fEle = childEle.parentElement;
            var fatherEle_1 = childEle.offsetParent;
            if (!fatherEle_1 || fatherEle_1 == fatherEle) {
                break;
            }
            // if (fatherEle_1 != this.fatherView.scroller.ele) {//该节点不是滚动器
            //     left += View.getLeft(fEle) - fEle.scrollLeft;
            //     top += View.getTop(fEle) - fEle.scrollTop;
            // }
            left += View.getLeft(fEle) - fEle.scrollLeft;
            top += View.getTop(fEle) - fEle.scrollTop;

            childEle = fEle;
        }
        return new VPosition(left, top);
    }

    /**
     * 获取距屏幕左上角的绝对定位
     * @returns {VPosition}
     */
    getPositionAbsolute() {
        var left = this.positionByFather.left;
        var top = this.positionByFather.top;
        if (this.fatherView && this.fatherView != this.page.application) {
            left += this.fatherView.getPositionAbsolute().left;
            top += this.fatherView.getPositionAbsolute().top;
        }
        return new VPosition(left, top);
    }

    /**
     * 获取相对于父控件的坐标
     * @return {VPosition}
     */
    get positionByFather() {
        return this.getPositionByFather();
    }

    /**
     * 获取相对于屏幕的绝对位置
     * 相对于所属Page的坐标
     * @return {VPosition}
     */
    get positionAbsolute() {
        return this.getPositionAbsolute();
    }

    /**
     * 给对应的ele设置布局
     * @param html
     */
    set html(html) {
        this.ele.innerHTML = html;
    }

    /**
     * 获取left
     */
    get left() {
        return View.getLeft(this.ele);
    }

    set left(value) {
        this.position.left = value;
        this.setStyle("left", value + "px");
    }

    /**
     * 获取top
     */
    get top() {
        return View.getTop(this.ele);
    }

    set top(value) {
        this.position.top = value;
        this.setStyle("top", value + "px");
    }

    /**
     * 获取width
     */
    get width() {
        return View.getWidth(this.ele);
    }

    set width(value) {
        this.size.width = value;
        this.setStyle("width", value + "px");
    }

    /**
     * 获取height
     */
    get height() {
        return View.getHeight(this.ele);
    }

    set height(value) {
        this.size.height = value;
        this.setStyle("height", value + "px");
    }

    get ele() {
        return this._ele;
    }

    set ele(value) {
        this._ele = value;
    }

    get style() {
        return View.getStyle(this.ele);
    }

    setStyle(key, value) {
        this.ele.style[key] = value;
    }

    get position() {
        return new VPosition(this.left, this.top);
    }

    set position(value) {
        this.left = value.left;
        this.top = value.top;
    }

    get size() {
        return new VSize(this.width, this.height);
    }

    set size(value) {
        this.width = value.width;
        this.height = value.height;
    }

    /**
     * 绑定数据
     */
    set data(value) {
        this._data = value;
    }

    get data() {
        return this._data;
    }

    get page() {
        return this.viewManager.page;
    }

    /**
     * 将标签中的属性解析到对应的变量中
     */
    setAttributeParam() {
        var id = View.parseAttribute("view-id", this.ele);
        if (id) {
            this.id = id;
        }

        var componentId = View.parseAttribute("component-id", this.ele);
        if (componentId) {
            this.componentId = componentId;
        }

        var visible = View.parseAttribute("view-visible", this.ele);//滚动

        this.onVisibleChangeListener = visible || "";

        return false;
    }


    static parseAttribute(key, ele) {
        var value = ele.getAttribute(key);
        if (!value || value == "undefined" || value == "null") {
            return null;
        }
        if (key != "view-id" || key != "view-type" || key != "component-id") {
            ele.removeAttribute(key);
        }
        return value;
    }

    static getViewType(ele){
        var viewType = ele.tagName;
        if (viewType == "DIV") {
            viewType = View.parseAttribute("view-type",ele);
            if (viewType) {
                viewType = viewType.toUpperCase();
            }
        }
        return viewType;
    }

    /**
     * 是否显示
     * @param{View|ImageView}
     * @return {boolean|boolean}
     */
    static isShowing(view) {
        var style = View.getStyle(view.ele);
        var display = style.display;
        var visible = style.visibility;
        var isS = display != "none" && visible != "hidden";

        if (isS) {
            var fatherView = view.fatherView;
            var parentElement = view.ele.parentElement
            while (parentElement && parentElement.tagName != "BODY") {
                if (fatherView
                    && (fatherView.ele == parentElement //判断是否为父控件的节点
                        || (fatherView.scroller //这里存在view是ImageView，fatherView是View，没有scroller的情况
                            && fatherView.scroller.ele == parentElement //判断是否为父控件滚动器的节点
                        )
                    )
                ) {
                    isS = fatherView.isShowing;
                    break;
                } else {
                    var parentStyle = View.getStyle(parentElement);
                    var parentDisplay = parentStyle.display;
                    var parentVisible = parentStyle.visibility;
                    var isParentS = parentDisplay != "none" && parentVisible != "hidden";

                    if (!isParentS) {
                        isS = false;
                        break;
                    }
                }

                parentElement = parentElement.parentElement;
            }
        }

        return isS;

    }

    /**
     * 是否在显示范围
     * @param{View|ImageView}
     */
    static isDisplayRange(view) {
        var position = view.positionByFather;
        var size = view.size;
        var fatherView = view.fatherView;

        var isD = false;

        if (fatherView) {
            if (fatherView instanceof Application) {
                isD = true;
            } else if (
                (position.left + size.width >= 0 && position.top + size.height >= 0)//下边在父控件位置
                && (position.left < fatherView.width && position.top < fatherView.height) //上边在控件位置
            ) {
                isD = fatherView.isDisplayRange;
            } else {
                isD = false;
            }
        } else {
            isD = true;
        }

        return isD;
    }

    static bindTextByEle(ele, view) {
        var ele_list = ele.children;
        if (ele_list.length == 0) {
            return [];
        }
        for (var child_ele of ele_list) {
            var viewType = child_ele.tagName;
            if (viewType == "DIV") {
                viewType = child_ele.getAttribute("view-type");
                if (viewType) {
                    viewType = viewType.toUpperCase();
                }
            }
            if (viewType == "VIEW-TEXT") {
                view.marquee = child_ele;
            } else {
                View.bindTextByEle(child_ele, view);
            }
        }
    }

    /**
     * 获取指定节点的当前样式
     * @param{Element} ele
     */
    static getStyle(ele) {
        return getComputedStyle(ele);
    }

    /**
     * 获取指定节点的left
     * @param{Element} ele
     */
    static getLeft(ele) {
        var left = View.getStyle(ele).left;
        if (left == "auto" || left == "") {
            left = ele.offsetLeft;
        }
        return View.pxToNum(left);
    }

    /**
     * 获取指定节点的top
     * @param{Element} ele
     */
    static getTop(ele) {
        var top = View.getStyle(ele).top;
        if (top == "auto" || top == "") {
            top = ele.offsetTop;
        }
        return View.pxToNum(top);
    }

    /**
     * 获取指定节点的width
     * @param{Element} ele
     */
    static getWidth(ele) {
        var width = View.getStyle(ele).width;
        if (width == "auto" || width == "") {
            width = ele.offsetWidth;
        }
        return View.pxToNum(width);
    }

    /**
     * 获取指定节点的height
     * @param{Element} ele
     */
    static getHeight(ele) {
        var height = View.getStyle(ele).height;
        if (height == "auto" || height == "") {
            height = ele.offsetHeight;
        }
        return View.pxToNum(height);
    }

    /**
     * 带px的样式值转数值
     * @param styleValue
     * @returns {number}
     */
    static pxToNum(styleValue) {
        if (styleValue !== 0 && styleValue == "" || styleValue == "auto") {
            console.error(styleValue, "样式值不能转化，请使用offset属性获取");
        }
        if (typeof styleValue != "number") {
            if (styleValue == "auto" || !styleValue) {
                styleValue = "0px";
            }
            styleValue = parseInt(styleValue.replace("px", ""));
        }
        return styleValue;
    }

    /**
     * 获取节点显示大小
     * 不计算class带有item、tagName为VIEW或VIEW-ITEM、overflow为hidden的节点的子节点
     * @param{Element} ele
     * @return {VSize}
     */
    static getVisibleSize(ele) {
        var size = new VSize(View.getWidth(ele), View.getHeight(ele));

        if (ele.className.indexOf("item") > -1) {//不再往子节点计算
            return size;
        }

        var viewType = View.getViewType(ele);
        if(viewType == "VIEW" || viewType == "VIEW_ITEM"){
            return size;
        }

        // if(View.getStyle(ele).overflow == "hidden"){//这里是计算本身实际宽高，overflow依旧需要计算
        //     return size;
        // }

        var children = ele.children;
        if (children.length == 0) {
            return size;
        }

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var childStyle = View.getStyle(child);
            if (childStyle.display == "none" || childStyle.visibility == "hidden") {
                continue;
            }
            //获取子节点占位

            var position = new VPosition(View.getLeft(child), View.getTop(child));

            var childSize = null;
            if (View.getStyle(child).overflow == "hidden") {//不再往子节点计算
                childSize = new VSize(View.getWidth(child), View.getHeight(child));
            } else {
                childSize = View.getVisibleSize(child);
            }
            if (!childSize) {
                continue;
            }

            var seatSize = new VSize(childSize.width + position.left, childSize.height + position.top);

            if (seatSize.width > size.width) {
                size.width = seatSize.width;
            }

            if (seatSize.height > size.height) {
                size.height = seatSize.height;
            }

        }

        return size;
    }

    /**
     * 使用ele创建控件
     * @param{Element} ele
     * @param{ViewManager} viewManager
     * @returns {View}
     */
    static parseByEle(ele, viewManager) {
        var view = new View();
        view.ele = ele;
        view.setAttributeParam();
        viewManager.addView(view);
        return view;
    }
};

/**
 * 将data绑定到Page中
 * 双向绑定，先不做，没有应用场景
 * @param{Page} page
 */
var definedPageData = function (page) {
    var data = page.data();
    for (var key of Object.keys(data)) {
        if (typeof page[key] == "undefined") {
            var newKey = "_" + key;
            page[newKey] = data[key];
            Object.defineProperty(page, key, {
                configurable: false,
                get: function () {
                    return page[newKey];
                },
                set: function (value) {
                    page[newKey] = value;
                    console.log("new value", value);
                }
            })
        } else {
            console.error(page, key, "重复");
        }
    }

}
