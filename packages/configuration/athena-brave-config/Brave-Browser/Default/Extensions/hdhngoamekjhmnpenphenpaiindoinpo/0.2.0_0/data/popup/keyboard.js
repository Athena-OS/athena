'use strict';

document.addEventListener('keyup', ({code}) => {
  if (code === 'Delete') {
    document.querySelector('[data-cmd=remove]').click();
  }
  else if (code === 'Enter') {
    if (document.getElementById('save').disabled) {
      document.getElementById('name').focus();
    }
  }
});
