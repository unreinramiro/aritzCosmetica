import Swal from "sweetalert2";

const swal = Swal.mixin({
  buttonsStyling: false,
  showClass: { popup: "animate__animated animate__fadeInUp animate__faster" },
  hideClass: { popup: "animate__animated animate__fadeOutDown animate__faster" },
  customClass: {
    popup: "swal-aritz-popup",
    title: "swal-aritz-title",
    htmlContainer: "swal-aritz-text",
    confirmButton: "swal-aritz-confirm",
    cancelButton: "swal-aritz-cancel",
  },
});

export default swal;