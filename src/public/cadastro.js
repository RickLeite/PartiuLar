document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('cadastroForm');
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;

        if (password !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        const userData = {
            nome: `${firstName} ${lastName}`,
            email: email,
            telefone: phone,
            senha: password,
            genero: gender
        };

        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Cadastro realizado com sucesso!');
                // fazer redirecionamento pagina login
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Erro ao realizar o cadastro. Por favor, tente novamente.');
            });
    });
});