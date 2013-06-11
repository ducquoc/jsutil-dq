/** simple plugin to draw treemap (using 'squarified' algorithm for layout) 
jQuery.fn.treeMap = function(params) { [] };
*/
(function($) {

    $.fn.treeMap = function(json, options) {
        var self = this;
        return this.fadeOut('fast', function() {
            self.empty().fadeIn('fast', function() {
                new TreeMap(self, options).paint(json);
            });
        });
    };

    function TreeMap($div, options) {
        var options = options || {};
        this.$div = $div;

        $div.css('position', 'relative');
        this.rectangle = new Rectangle(0, 0, $div.width(), $div.height());

        this.nodeClass = function() {
            return '';
        };
        this.click = function() {
        };
        this.mouseenter = function() {
        };
        this.mouseleave = function() {
        };
        this.mousemove = function() {
        };
        this.mouseover = function() {
        };
        this.paintCallback = function() {
        };
        this.ready = function() {
        };

        $.extend(this, options);

        this.setNodeColors = function($box) {
            if (this.backgroundColor) { $box.css('background-color', this.backgroundColor($box)); }
            if (this.color) { $box.css('color', this.color($box)); }
        };
    }

    TreeMap.NODE_MARGIN = 2; //4;
    TreeMap.SIDE_MARGIN = 15; //20;
    TreeMap.TOP_MARGIN = 15; //20;

    TreeMap.HORIZONTAL = 1; // landscape (wideScreen)
    TreeMap.VERTICAL = 2; // portrait

    TreeMap.NO_DATA_BG_COLOR = "#eeeeee"; // "#0095d5";
    TreeMap.NO_DATA_TEXT = "No valid data";

    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.margin = TreeMap.NODE_MARGIN;
    };

    Rectangle.prototype.style = function() {
        return {
            top: this.y + 'px',
            left: this.x + 'px',
            width: (this.width - this.margin) + "px",
            height: (this.height - this.margin) + "px"
        };
    };

    Rectangle.prototype.isWide = function() {
        return this.width > this.height;
    };

    TreeMap.prototype.paint = function(nodeList) {
        nodeList = this.filterInvalidSizeItems(nodeList);
        if (!nodeList || nodeList.length === 0) {
            this.$div.css("background-color", TreeMap.NO_DATA_BG_COLOR);
            this.$div.text(TreeMap.NO_DATA_TEXT);
        }

        nodeList = this.squarify(nodeList, this.rectangle);

        for (var i = 0; i < nodeList.length; i++) {
            var node = nodeList[i];
            var nodeBounds = node.bounds;

            var $box = $('<div id=' + node.id + '></div>');
            $box.css($.extend(nodeBounds.style(), {
                'position' : 'absolute'
            }));

            this.setNodeColors($box);

            $box.addClass('treemap-node');

            var self = this;
            $box.bind('click', node, function(e) {
                self.click(e.data, e);
            });
            $box.bind('mouseenter', node, function(e) {
                self.mouseenter(e.data, e);
            });
            $box.bind('mouseleave', node, function(e) {
                self.mouseleave(e.data, e);
            });
            $box.bind('mousemove', node, function(e) {
                self.mousemove(e.data, e);
            });
            $box.bind('mouseover', node, function(e) {
                self.mouseover(e.data, e);
            });

            $box.appendTo(this.$div);
            $box.addClass(this.nodeClass(node, $box));

            var $content = $("<div>" + node.label + "</div>");
            $content.addClass('treemap-label');
            $content.css({
                'display': 'inline',
                'position': 'relative',
                'text-align': 'center',
                'font-size': '24px'
            });
            $box.append($content);

            this.fitLabelFontSize($content, node);

            $content.css('margin-top', (parseInt($box.height()) / 2) - (parseInt($content.height()) / 2) + 'px');

        }
        this.ready();
    };

    TreeMap.prototype.filterInvalidSizeItems = function(nodeList) {
        var result = []; // JavaScript 1.6+ has Array.prototype.filter()
        for (var i = 0; i < nodeList.length; i++) {
            if (!nodeList[i].size || nodeList[i].size <= 0) {
                // alert("invalid size: " + nodeList[i].size);
                continue;
            }
            result.push(nodeList[i]);
        }
        return result;
    };

    TreeMap.prototype.squarify = function(nodeList, rectangle) {
        nodeList.sort(function(a, b) {
            return b.size - a.size;
        });
        this.divideDisplayArea(nodeList, rectangle);

        return nodeList;
    };

    TreeMap.prototype.divideDisplayArea = function(nodeList, destRectangle) {
        // Check for boundary conditions
        if (nodeList.length === 0) { 
            return;
        }

        if (nodeList.length === 1) {
            nodeList[0].bounds = destRectangle;
            return;
        }

        var halves = this.splitFairly(nodeList);

        var midPoint;
        var orientation;

        var leftSum = this.sumValues(halves.left),
                rightSum = this.sumValues(halves.right),
                totalSum = leftSum + rightSum;

        if (leftSum + rightSum <= 0) {
            midPoint = 0;
            orientation = TreeMap.HORIZONTAL;
        } else {

            if (destRectangle.isWide()) {
                orientation = TreeMap.HORIZONTAL;
                midPoint = Math.round(( leftSum * destRectangle.width ) / totalSum);
            } else {
                orientation = TreeMap.VERTICAL;
                midPoint = Math.round(( leftSum * destRectangle.height ) / totalSum);
            }
        }

        if (orientation === TreeMap.HORIZONTAL) {
            this.divideDisplayArea(halves.left, new Rectangle(destRectangle.x, destRectangle.y, midPoint, destRectangle.height));
            this.divideDisplayArea(halves.right, new Rectangle(destRectangle.x + midPoint, destRectangle.y, destRectangle.width - midPoint, destRectangle.height));
        } else {
            this.divideDisplayArea(halves.left, new Rectangle(destRectangle.x, destRectangle.y, destRectangle.width, midPoint));
            this.divideDisplayArea(halves.right, new Rectangle(destRectangle.x, destRectangle.y + midPoint, destRectangle.width, destRectangle.height - midPoint));
        }
    };

    TreeMap.prototype.splitFairly = function(nodeList) {
        var halfValue = this.sumValues(nodeList) / 2;
        var accValue = 0;
        var length = nodeList.length;

        for (var midPoint = 0; midPoint < length; midPoint++) {
            if (midPoint > 0 && ( accValue + nodeList[midPoint].size > halfValue )) {
                break;
            }
            accValue += nodeList[midPoint].size;
        }

        return {
            left: nodeList.slice(0, midPoint),
            right: nodeList.slice(midPoint)
        };
    };

    TreeMap.prototype.sumValues = function(nodeList) {
        var result = 0;
        var length = nodeList.length;
        for (var i = 0; i < length; i++) {
            result += nodeList[i].size;
        }
        return result;
    };

    TreeMap.prototype.fitLabelFontSize = function($content, node) {
        var nodeBounds = node.bounds ;
        while ($content.height() + TreeMap.TOP_MARGIN > nodeBounds.height || $content.width() + TreeMap.SIDE_MARGIN > nodeBounds.width) {
            var fontSize = parseFloat($content.css('font-size')) - 2;
            if (fontSize < 12) {
                $content.remove();
                break;
            }
            $content.css('font-size', fontSize + 'px');
        }
        $content.css('display', 'block');
        this.paintCallback($content, node);
    };

})(jQuery);
