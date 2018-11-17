var canvas = $("#draw-canvas");
var ctx = canvas[0].getContext("2d");
ctx.strokeStyle = "#21e6c1";
ctx.lineWidth = 3;

canvas.on("mousedown", function(e) {
    var offset = canvas.offset();
    var x = e.pageX - offset.left;
    var y = e.pageY - offset.top;

    canvas.on("mousemove", function draw(e) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        ctx.lineTo(x, y);
        ctx.stroke();

        $(document).on("mouseup", function() {
            canvas.off("mousemove", draw);
            $("input[name='sig']").val(canvas[0].toDataURL());
        });
    });
});

canvas.on("touchstart", function(e) {
    if ($(e.target) == canvas) {
        e.preventDefault();
    }
    var offset = canvas.offset();
    var x = e.originalEvent.touches[0].pageX - offset.left;
    var y = e.originalEvent.touches[0].pageY - offset.top;

    canvas.on("touchmove", function draw(e) {
        if ($(e.target) == canvas) {
            e.preventDefault();
        }
        ctx.beginPath();
        ctx.moveTo(x, y);
        x = e.originalEvent.touches[0].pageX - offset.left;
        y = e.originalEvent.touches[0].pageY - offset.top;
        ctx.lineTo(x, y);
        ctx.stroke();

        $(document).on("touchend", function() {
            if ($(e.target) == canvas) {
                e.preventDefault();
            }
            canvas.off("touchmove", draw);
            $("input[name='sig']").val(canvas[0].toDataURL());
        });
    });
});
