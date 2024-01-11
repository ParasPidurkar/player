let loadingSpinner = {
    template: `
    <div id="WrapperLoading" class="loading-wrapper">
    <button id="spinnerButton" class="loader"></button>
    </div>
    `,

    show() {
        $('#main').append(this.template);
        $("#WrapperLoading").addClass('active');
    },

    hide() {
        $("#WrapperLoading").removeClass('active');
    }
}

export default loadingSpinner;