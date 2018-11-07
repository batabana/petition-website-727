const canvas = $("canvas");
const ctx = canvas[0].getContext("2d");

canvas.on("mousedown", e => {
    let offset = canvas.offset();
    let x = e.pageX - offset.left;
    let y = e.pageY - offset.top;

    canvas.on("mousemove", function draw(e) {
        ctx.beginPath();
        ctx.strokeStyle = "#0B4D42";
        ctx.lineWidth = 3;
        ctx.moveTo(x, y);
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        ctx.lineTo(x, y);
        ctx.stroke();

        $(document).on("mouseup", () => {
            canvas.off("mousemove", draw);
            $("input[name='sig']").val(canvas[0].toDataURL());
        });
    });
});
