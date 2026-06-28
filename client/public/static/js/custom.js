function successAlert(message = 'تم التنفيذ بنجاح') {
    return Swal.fire({
        title: message,
        icon: "success",
        draggable: true
    });
}

function errorAlert(message = 'حدث خطأ ما!') {
    return Swal.fire({
        icon: "error",
        title: "خطأ",
        text: message,
    });
}


function confirmAlert(title = 'هل انت متاكد؟', text = 'هل انت متاكد من هذا القرار؟', confirmButton = 'نعم') {
    return Swal.fire({
        title: title,
        text: text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: confirmButton,
    })
}