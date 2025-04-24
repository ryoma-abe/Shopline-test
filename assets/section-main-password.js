class PasswordModal extends DetailsModal {
  connectedCallback() {
    super.connectedCallback?.();
    // The initial opening of the pop-up page works on the error form
    if (this.querySelector('input[data-error="true"]')) this.open({ target: this.querySelector('details') });
  }
}

customElements.define('password-modal', PasswordModal);
