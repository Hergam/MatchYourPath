import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function Admin() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statutEdits, setStatutEdits] = useState({}); // { userId: newStatut }
  const adminUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/admin/users', {
        headers: { 'x-user-id': adminUser.UserID }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    try {
      await axios.delete(`/users/${userId}`, {
        headers: { 'x-user-id': adminUser.UserID }
      });
      setUsers(users.filter(u => u.UserID !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleStatutChange = (userId, value) => {
    setStatutEdits(prev => ({ ...prev, [userId]: value }));
  };

  const handleStatutSave = async (user) => {
    setError('');
    try {
      await axios.put(`/users/${user.UserID}`, {
        Nom: user.Nom,
        Email: user.Email,
        Password: 'dummy', // Backend requires password, but you should improve this in production
        Statut: statutEdits[user.UserID] || user.Statut
      }, {
        headers: { 'x-user-id': adminUser.UserID }
      });
      setUsers(users.map(u =>
        u.UserID === user.UserID
          ? { ...u, Statut: statutEdits[user.UserID] || user.Statut }
          : u
      ));
      setStatutEdits(prev => {
        const copy = { ...prev };
        delete copy[user.UserID];
        return copy;
      });
    } catch (err) {
      setError('Failed to update statut');
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Admin User Management
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>UserID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.UserID}>
                    <TableCell>{user.UserID}</TableCell>
                    <TableCell>{user.Nom}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>
                      <Select
                        value={statutEdits[user.UserID] ?? user.Statut}
                        onChange={e => handleStatutChange(user.UserID, e.target.value)}
                        size="small"
                        disabled={user.Statut === 'admin'}
                        sx={{ minWidth: 100 }}
                      >
                        <MenuItem value="admin">admin</MenuItem>
                        <MenuItem value="etudiant">etudiant</MenuItem>
                        <MenuItem value="ecole">ecole</MenuItem>
                      </Select>
                      {statutEdits[user.UserID] && statutEdits[user.UserID] !== user.Statut && (
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ ml: 1 }}
                          onClick={() => handleStatutSave(user)}
                        >
                          Save
                        </Button>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(user.UserID)}
                        disabled={user.Statut === 'admin'}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default Admin;
