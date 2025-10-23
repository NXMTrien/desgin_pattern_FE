// utils/customAlert.js
export function customAlert(message) {
  const alertBox = document.getElementById('custom-alert');
  if (alertBox) {
    alertBox.textContent = message;
    
    // Reset class
    alertBox.className = "fixed-bottom end-0 text-white p-3 rounded-start shadow-lg z-3 d-none";
    
    const isError = message.includes('Lỗi') || message.includes('thất bại') || message.includes('không hợp lệ');
    const isSuccess = message.includes('thành công');

    if (isError) {
      alertBox.classList.add('bg-danger');
    } else if (isSuccess) {
      alertBox.classList.add('bg-success');
    } else {
      alertBox.classList.add('bg-info');
    }

    alertBox.classList.remove('d-none');
    setTimeout(() => {
      alertBox.classList.add('d-none');
    }, 3000);
  }
}
