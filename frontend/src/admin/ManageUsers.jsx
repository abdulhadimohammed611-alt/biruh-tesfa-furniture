import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldAlert, Award, RefreshCw } from 'lucide-react';

const ManageUsers = () => {
  const { token, user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    if (userId === currentUser.id) {
      alert("You cannot modify your own administrative role.");
      return;
    }

    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">Manage Users</h1>
          <p className="text-xs text-stone-500 font-light">User database control and access role configuration panel.</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="p-2 hover:bg-white border border-stone-200 bg-stone-50 rounded-lg text-stone-600 transition-colors"
          title="Reload Users list"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-stone-200/50 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-stone-500">Loading user database...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-400 uppercase border-b border-stone-200/50">
                  <th className="p-4">Avatar</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-center">Active Role</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((usr) => (
                  <tr key={usr.id} className="text-stone-700 hover:bg-stone-50/50">
                    <td className="p-4 shrink-0">
                      <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 text-stone-600 flex items-center justify-center font-bold">
                        {usr.name.charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-stone-900">{usr.name}</td>
                    <td className="p-4 font-mono text-stone-500">{usr.email}</td>
                    <td className="p-4 font-light text-stone-600">{usr.phone || 'N/A'}</td>
                    <td className="p-4 text-stone-400">{new Date(usr.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        usr.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleRoleToggle(usr.id, usr.role)}
                        disabled={usr.id === currentUser.id}
                        className={`btn-outline !py-1.5 !px-3.5 text-[10px] font-bold tracking-wide transition-colors ${
                          usr.id === currentUser.id
                            ? 'opacity-40 cursor-not-allowed border-stone-200 text-stone-400 hover:bg-transparent'
                            : (usr.role === 'admin' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-primary-600 border-primary-200 hover:bg-primary-50')
                        }`}
                      >
                        {usr.role === 'admin' ? 'Demote User' : 'Promote Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageUsers;
