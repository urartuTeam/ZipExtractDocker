import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Используем useNavigate вместо useHistory

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Инициализируем navigate

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) throw new Error('Auth failed');

            const data = await response.json();
            console.log('Auth success:', data);

            // Сохраняем ID пользователя в localStorage
            localStorage.setItem('userId', data.id);

            // Перенаправляем на Dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="logo-container">
                <img src="../images/logo_simple.svg" alt="Logo" className="logo" />
            </div>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label htmlFor="username">Логин:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Войти</button>
            </form>
        </div>
    );
};

export default LoginForm;
