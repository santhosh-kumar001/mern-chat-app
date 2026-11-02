import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                // IMPORTANT: Save user info so Chat.js knows who you are
                localStorage.setItem('token', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                navigate('/chat');
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Error: Backend is not responding. Is it running on port 5000?");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Login</h2>
                <form onSubmit={handleLogin}>
                    <input style={styles.input} placeholder="Email" type="email" onChange={e => setForm({...form, email: e.target.value})} required />
                    <input style={styles.input} placeholder="Password" type="password" onChange={e => setForm({...form, password: e.target.value})} required />
                    <button type="submit" style={styles.button}>Login</button>
                </form>
                <p style={styles.footer}>Don't have an account? <Link to="/register" style={styles.link}>Register</Link></p>
            </div>
        </div>
    );
};

// Use the same styles object as Register.js
const styles = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f9', fontFamily: 'Arial, sans-serif' },
    card: { width: '450px', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' },
    title: { marginBottom: '30px', color: '#333', fontSize: '32px', fontWeight: '600' },
    input: { width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' },
    footer: { marginTop: '25px', color: '#666', fontSize: '16px' },
    link: { color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }
};

export default Login;