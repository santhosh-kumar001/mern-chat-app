import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [editingId, setEditingId] = useState(null);
    const chatEndRef = useRef(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || { permissions: [], username: "" };

    const can = (p) => userInfo.permissions?.includes(p);

    useEffect(() => {
        socket.on('loadMessages', (msgs) => setMessages(msgs));

        socket.off('message');
        socket.on('message', (msg) => {
            setMessages((prev) => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
        });

        socket.off('messageDeleted');
        socket.on('messageDeleted', (id) => setMessages(prev => prev.filter(m => m._id !== id)));

        socket.off('messageEdited');
        socket.on('messageEdited', ({ id, newText }) => {
            setMessages(prev => prev.map(m => m._id === id ? { ...m, text: newText, isEdited: true } : m));
        });

        socket.off('userBanned');
        socket.on('userBanned', (user) => {
            if(userInfo.username === user) {
                alert("You have been banned!");
                localStorage.clear();
                window.location.href = '/';
            }
        });

        return () => socket.removeAllListeners();
    }, [userInfo.username]);

    useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (editingId) {
            socket.emit('editMessage', { id: editingId, newText: input, requester: userInfo.username });
            setEditingId(null);
        } else {
            socket.emit('chatMessage', { user: userInfo.username, text: input });
        }
        setInput('');
    };

    const handleFileUpload = async (e) => {
        if (!e.target.files[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        try {
            const res = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            socket.emit('chatMessage', { user: userInfo.username, text: "📷 Image", fileUrl: data.url });
        } catch (err) { alert("Upload failed"); }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <span><b>{userInfo.role?.toUpperCase()}</b>: {userInfo.username}</span>
                <button onClick={() => {localStorage.clear(); window.location.href='/';}} style={styles.logout}>Logout</button>
            </div>
            <div style={styles.chatWindow}>
                {messages.map((m) => (
                    <div key={m._id} style={styles.msgBox}>
                        <div style={styles.msgHeader}>
                            <b>{m.user}</b> <small>{new Date(m.timestamp).toLocaleTimeString()}</small>
                            <div style={{marginLeft:'auto'}}>
                                {can('ban_user') && m.user !== userInfo.username && <button onClick={() => socket.emit('banUser', m.user)}>🔨</button>}
                                {(can('edit_message') || m.user === userInfo.username) && <button onClick={() => {setEditingId(m._id); setInput(m.text);}}>✏️</button>}
                                {can('delete_message') && <button onClick={() => socket.emit('deleteMessage', m._id)}>🗑️</button>}
                            </div>
                        </div>
                        {m.fileUrl ? (
                            <img src={m.fileUrl} style={styles.img} alt="msg" onClick={() => window.open(m.fileUrl)}/>
                        ) : (
                            <p style={{margin: '5px 0'}}>{m.text} {m.isEdited && <small style={{color:'#999'}}>(edited)</small>}</p>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            {can('send_message') ? (
                <form onSubmit={handleSend} style={styles.inputArea}>
                    <label style={{cursor:'pointer', padding:'0 15px', fontSize:'20px'}}>📎<input type="file" hidden onChange={handleFileUpload} /></label>
                    <input style={styles.input} value={input} onChange={e => setInput(e.target.value)} placeholder={editingId ? "Save changes..." : "Type message..."} />
                    <button type="submit" style={styles.btn}>{editingId ? "Update" : "Send"}</button>
                </form>
            ) : <div style={styles.readOnly}>ReadOnly Mode</div>}
        </div>
    );
};

const styles = {
    container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#e5ddd5' },
    header: { padding: '15px', background: '#075e54', color: 'white', display: 'flex', justifyContent: 'space-between' },
    chatWindow: { flex: 1, overflowY: 'auto', padding: '20px' },
    msgBox: { background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '10px', maxWidth: '80%', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' },
    msgHeader: { display: 'flex', gap: '10px', borderBottom: '1px solid #f2f2f2', paddingBottom: '3px' },
    inputArea: { display: 'flex', padding: '15px', background: '#f0f0f0', alignItems: 'center' },
    input: { flex: 1, padding: '12px', borderRadius: '25px', border: 'none', outline: 'none' },
    btn: { background: '#128c7e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', marginLeft: '10px', cursor: 'pointer' },
    img: { maxWidth: '100%', borderRadius: '5px', marginTop: '5px', cursor: 'pointer' },
    logout: { background: '#d33', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
    readOnly: { padding: '15px', textAlign: 'center', color: '#666' }
};

export default Chat;