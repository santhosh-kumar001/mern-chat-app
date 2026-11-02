import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [form, setForm] = useState({ username: '', email: '', password: '', role: 'Admin' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) { alert("Registration Successful!"); navigate('/'); }
            else { const d = await res.json(); alert(d.message); }
        } catch (err) { alert("Error: Backend is not responding. Is it running on port 5000?"); }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Register</h2>
                <form onSubmit={handleSubmit}>
                    <input style={styles.input} placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} required />
                    <input style={styles.input} placeholder="Email" type="email" onChange={e => setForm({...form, email: e.target.value})} required />
                    <input style={styles.input} placeholder="Password" type="password" onChange={e => setForm({...form, password: e.target.value})} required />
                    <select style={styles.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                        <option value="Admin">Admin</option>
                        <option value="Moderator">Moderator</option>
                        <option value="User">User</option>
                        <option value="Guest">Guest</option>
                    </select>
                    <button type="submit" style={styles.button}>Register</button>
                </form>
                <p style={styles.footer}>Already have an account? <Link to="/" style={styles.link}>Login</Link></p>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f9', fontFamily: 'Arial' },
    card: { width: '450px', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' },
    title: { marginBottom: '30px', color: '#333', fontSize: '32px' },
    input: { width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
    button: { width: '100%', padding: '14px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    footer: { marginTop: '25px', color: '#666' },
    link: { color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }
};

export default Register;