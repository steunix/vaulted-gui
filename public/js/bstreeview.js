/*! @preserve
 * bstreeview.js
 * Version: 1.2.1
 * Authors: Sami CHNITER <sami.chniter@gmail.com>
 * Copyright 2020
 * License: Apache License 2.0
 *
 * Project: https://github.com/chniter/bstreeview
 * Project: https://github.com/nhmvienna/bs5treeview (bootstrap 5)
 */
; (function ($, window, document, undefined) {
    "use strict";
    /**
     * Default bstreeview  options.
     */
    var pluginName = "bstreeview",
        defaults = {
            expandIcon: 'fa fa-caret-right fa-xs fa-fw',
            collapseIcon: 'fa fa-caret-down fa-xs fa-fw',
            expandClass: 'show',
            indent: 0.25,
            parentsMarginLeft: '0.25rem',
            openNodeLinkOnNewTab: true
        };
    /**
     * bstreeview HTML templates.
     */
    var templates = {
        treeview: '<div class="bstreeview"></div>',
        treeviewItem: '<div role="treeitem" class="list-group-item" data-bs-toggle="collapse"></div>',
        treeviewGroupItem: '<div role="group" class="list-group collapse" id="itemid"></div>',
        treeviewItemStateIcon: '<i class="state-icon"></i>',
        treeviewItemIcon: '<i class="item-icon"></i>',
        treeviewItemEmptyIcon: '<i class="fa fa-fw fa-angle-right"></i>'
    };

    var mainid;

    /**
     * BsTreeview Plugin constructor.
     * @param {*} element
     * @param {*} options
     */
    function bstreeView(element, options) {
        this.element = element;
        this.itemIdPrefix = element.id + "-item-";
        this.settings = $.extend({}, defaults, options);
        mainid = element.id
        this.init();
    }
    /**
     * Avoid plugin conflict.
     */
    $.extend(bstreeView.prototype, {
        /**
         * bstreeview intialize.
         */
        init: function () {
            this.tree = [];
            this.children = [];
            // Retrieve bstreeview Json Data.
            if (this.settings.data) {
                if (this.settings.data.isPrototypeOf(String)) {
                    this.settings.data = $.parseJSON(this.settings.data);
                }
                this.tree = $.extend(true, [], this.settings.data);
                delete this.settings.data;
            }
            // Set main bstreeview class to element.
            $(this.element).addClass('bstreeview');

            this.initData({ children: this.tree });
            var _this = this;
            this.build($(this.element), this.tree, 0);
            // Update angle icon on collapse
            $(this.element).on('click', '.list-group-item', function (e) {
                $('.state-icon', this)
                    .toggleClass(_this.settings.expandIcon)
                    .toggleClass(_this.settings.collapseIcon);
                // navigate to href if present
                if (e.target.hasAttribute('href')) {
                    if (_this.settings.openNodeLinkOnNewTab) {
                        window.open(e.target.getAttribute('href'), '_blank');
                    }
                    else {
                        window.location = e.target.getAttribute('href');
                    }
                }
                else
                {
                    // Toggle the data-bs-target. Issue with Bootstrap toggle and dynamic code
                    var bstarget = $(this).attr("data-bs-target")
                    $($.find(bstarget)).collapse('toggle')
                    localStorage.setItem("bstreeview_expanded_"+mainid+"_"+$(this).attr("id"), $(this).attr("aria-expanded"))
                }
            });
        },
        /**
         * Initialize treeview Data.
         * @param {*} node
         */
        initData: function (node) {
            if (!node.children) return;
            var parent = node;
            var _this = this;
            $.each(node.children, function checkStates(index, node) {

                node.nodeId = _this.children.length;
                node.parentId = parent.nodeId;
                _this.children.push(node);

                if (node.children) {
                    _this.initData(node);
                }
            });
        },
        /**
         * Build treeview.
         * @param {*} parentElement
         * @param {*} children
         * @param {*} depth
         */
        build: function (parentElement, children, depth) {
            var _this = this;
            // Calculate item padding.
            var leftPadding = _this.settings.parentsMarginLeft;

            if (depth > 0) {
                leftPadding = (_this.settings.indent + depth * _this.settings.indent).toString() + "rem;";
            }
            depth += 1;
            // Add each node and sub-nodes.
            $.each(children, function addNodes(id, node) {
                // Main node element.
                var treeItem = $(templates.treeviewItem)
                    .attr('data-bs-target', "#" + _this.itemIdPrefix + node.nodeId)
                    .attr('style', 'padding-left:' + leftPadding)
                    .attr('aria-level', depth);
                // Set Expand and Collapse icones.
                if (node.children && node.children.length) {
                    var treeItemStateIcon = $(templates.treeviewItemStateIcon)
                        .addClass((node.expanded) ? _this.settings.expandIcon : _this.settings.collapseIcon);
                    treeItem.append(treeItemStateIcon);
                } else {
                    var treeItemStateIcon = $(templates.treeviewItemStateIcon)
                        .addClass((node.expanded) ? _this.settings.expandIcon : _this.settings.collapseIcon)
                        .css("opacity","0")
                    treeItem.append(treeItemStateIcon);
                }
                // set node icon if exist.
                if (node.icon) {
                    var treeItemIcon = $(templates.treeviewItemIcon)
                        .addClass(node.icon);
                    treeItem.append(treeItemIcon);
                }
                // Set node Text.
                treeItem.append(node.description);
                // Reset node href if present
                if (node.href) {
                    treeItem.attr('href', node.href);
                }
                // Add class to node if present
                if (node.class) {
                    treeItem.addClass(node.class);
                }
                // Add custom id to node if present
                if (node.id) {
                    treeItem.attr('id', node.id);
                }
                // Attach node to parent.
                parentElement.append(treeItem);
                // Build child nodes.
                if (node.children) {
                    // Node group item.
                    var treeGroup = $(templates.treeviewGroupItem)
                        .attr('id', _this.itemIdPrefix + node.nodeId);
                    parentElement.append(treeGroup);
                    _this.build(treeGroup, node.children, depth);

                    // Search in localStorage for expanded status
                    var ls = localStorage.getItem("bstreeview_expanded_"+mainid+"_"+node.id)
                    if ( ls=="true") {
                        node.expanded = true;
                    }
                    if (node.expanded) {
                        treeGroup.addClass(_this.settings.expandClass);
                    }
                }
            });
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" +
                    pluginName, new bstreeView(this, options));
            }
        });
    };
})(jQuery, window, document);