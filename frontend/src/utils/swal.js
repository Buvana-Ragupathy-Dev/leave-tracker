import Swal from 'sweetalert2';

export const confirm = (text) =>
  Swal.fire({
    title: 'Are you sure?',
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, proceed',
  });

export const toast = (icon, title) =>
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
