document.addEventListener('DOMContentLoaded', function() {
    const roleSelect = document.getElementById('role');
    const form = document.getElementById('login-form');

    roleSelect.addEventListener('change', function() {
        const role = this.value;
        form.action = `../auth/authenticate.php?role=${role}`;
    });

    // Set initial action based on default selection
    form.action = `../auth/authenticate.php?role=${roleSelect.value}`;
});