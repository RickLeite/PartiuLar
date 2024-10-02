import React, { useState } from 'react';
import './Cadastro.css';
import illustration from './undraw_best_place_re_lne9.svg'; // Importe a imagem SVG

function Cadastro() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gender: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    telefone: formData.phone,
                    senha: formData.password,
                    genero: formData.gender
                }),
            });

            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                // Redirect to login page or dashboard
            } else {
                const errorData = await response.json();
                alert(`Erro ao realizar o cadastro: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao realizar o cadastro. Por favor, tente novamente.');
        }
    };

    return (
        <div className="container">
            <div className="form-image">
                <img src={illustration} alt="Ilustração" /> {/* Use a imagem importada */}
            </div>
            <div className="form">
                <form onSubmit={handleSubmit}>
                    <div className="form-header">
                        <div className="title">
                            <h1>Cadastre-se</h1>
                        </div>
                        <div className="login-button">
                            <button type="button">Entrar</button>
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-box">
                            <label htmlFor="firstName">Primeiro nome</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Digite seu primeiro nome"
                            />
                        </div>

                        <div className="input-box">
                            <label htmlFor="lastName">Sobrenome</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Digite seu sobrenome"
                            />
                        </div>

                        <div className="input-box">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Digite seu email"
                            />
                        </div>

                        <div className="input-box">
                            <label htmlFor="phone">Celular</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(xx) xxxx-xxxx"
                            />
                        </div>

                        <div className="input-box">
                            <label htmlFor="password">Senha</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Digite sua senha"
                            />
                        </div>

                        <div className="input-box">
                            <label htmlFor="confirmPassword">Confirme sua senha</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirme sua senha"
                            />
                        </div>
                    </div>

                    <div className="gender-inputs">
                        <div className="gender-title">
                            <h6>Gênero</h6>
                        </div>
                        <div className="gender-group">
                            <div className="gender-input">
                                <input
                                    type="radio"
                                    id="female"
                                    name="gender"
                                    value="female"
                                    checked={formData.gender === 'female'}
                                    onChange={handleChange}
                                />
                                <label htmlFor="female">Feminino</label>
                            </div>

                            <div className="gender-input">
                                <input
                                    type="radio"
                                    id="male"
                                    name="gender"
                                    value="male"
                                    checked={formData.gender === 'male'}
                                    onChange={handleChange}
                                />
                                <label htmlFor="male">Masculino</label>
                            </div>

                            <div className="gender-input">
                                <input
                                    type="radio"
                                    id="other"
                                    name="gender"
                                    value="other"
                                    checked={formData.gender === 'other'}
                                    onChange={handleChange}
                                />
                                <label htmlFor="other">Outro</label>
                            </div>
                        </div>
                    </div>

                    <div className="continue-button">
                        <button type="submit">Continuar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Cadastro;