window.onload = () => {
  const goBackBtn = document.querySelector('#btn-go-back');
  goBackBtn.addEventListener('click', () => {
    const response = window.confirm(
      'You will lose your changes, do you really want to go back?',
    );
    if (response) {
      history.back();
    }
  });

  const descriptionTypeContainer = document.querySelector(
    '#description-type-container',
  );
  const descriptionOptions = ['ontim', 'tinno', 'odm'];

  for (const [index, option] of descriptionOptions.entries()) {
    const p = document.createElement('p');

    p.innerHTML = `
      <label>
        <input
          name="description-type"
          type="radio"
          class="with-gap"
          value=${option}
          ${index == 0 ? 'checked' : ''}
        />
        <span>${option}</span>
      </label>
    `;

    descriptionTypeContainer.appendChild(p);

    document
      .querySelector('#btn-create-table')
      .addEventListener('click', () => {
        const wbLink = document.querySelector('#workbook-link').value;
        const productManager = document.querySelector('#product-manager').value;
        const radioTypes = document.querySelectorAll(
          'input[name=description-type]',
        );
        let company = '';

        for (const radio of radioTypes) {
          if (radio.checked) {
            company = radio.value;
          }
        }

        localStorage.setItem('wbLink', wbLink);
        localStorage.setItem('company', company);
        localStorage.setItem('productManager', productManager);
        localStorage.setItem('kitsCreated', JSON.stringify([]));
      });
  }
};
