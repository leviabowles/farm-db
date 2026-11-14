import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import api from '../services/api';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');

  // Load all notes
  const loadNotes = async () => {
    try {
      const response = await api.get('/api/farmnotes/');
      const allNotes = Array.isArray(response.data) ? response.data : (response.data.results || []);
      
      // Sort: active (non-dismissed) first, then recently updated dismissed notes
      const activeNotes = allNotes.filter(n => !n.dismissed).sort((a, b) => new Date(b.create_date) - new Date(a.create_date));
      const dismissedNotes = allNotes.filter(n => n.dismissed).sort((a, b) => new Date(b.update_date) - new Date(a.update_date));
      
      setNotes([...activeNotes, ...dismissedNotes]);
      setError(null);
    } catch (err) {
      console.error('Error fetching farm notes:', err);
      setError('Failed to load farm notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await api.post('/api/farmnotes/', { note: newNote.trim() });
      setNotes(prev => [response.data, ...prev]);
      setNewNote('');
      setError(null);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
    }
  };

  const handleDismiss = async (noteId) => {
    try {
      const response = await api.patch(`/api/farmnotes/${noteId}/`, { dismissed: true });
      setNotes(prev => prev.map(n => n.id === noteId ? response.data : n));
    } catch (err) {
      console.error('Error dismissing note:', err);
      setError('Failed to dismiss note');
    }
  };

  const handleUndoDismiss = async (noteId) => {
    try {
      const response = await api.patch(`/api/farmnotes/${noteId}/`, { dismissed: false });
      setNotes(prev => prev.map(n => n.id === noteId ? response.data : n));
    } catch (err) {
      console.error('Error undoing dismiss:', err);
      setError('Failed to undo dismiss');
    }
  };

  return (
    <Box sx={{ padding: '40px 20px', maxWidth: 'lg', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Farm Notes
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : (
        <>
          {/* Add new note */}
          <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }} elevation={0}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Add New Note
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type your note here..."
                  variant="outlined"
                  size="medium"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  color="primary"
                >
                  Add Note
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Notes list */}
          <Paper sx={{ p: 3, borderRadius: 4 }} elevation={0}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'primary.main', mr: 2, borderRadius: 1 }} />
              All Notes
            </Typography>
            
            {notes.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                No notes yet. Add one above!
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 'bold', color: 'text.secondary' } }}>
                      <TableCell>Status</TableCell>
                      <TableCell>Note</TableCell>
                      <TableCell align="right">Created</TableCell>
                      <TableCell align="right">Last Updated</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notes.map(note => (
                      <TableRow 
                        key={note.id}
                        sx={{
                          '&:hover': { backgroundColor: 'action.hover' },
                          opacity: note.dismissed ? 0.6 : 1,
                        }}
                      >
                        <TableCell>
                          {note.dismissed ? (
                            <Box sx={{ 
                              px: 1.5, py: 0.5, 
                              borderRadius: '20px', 
                              bgcolor: 'secondary.light', 
                              color: 'secondary.dark', 
                              fontSize: '0.85rem',
                              fontWeight: 600 
                            }}>
                              Dismissed
                            </Box>
                          ) : (
                            <Box sx={{ 
                              px: 1.5, py: 0.5, 
                              borderRadius: '20px', 
                              bgcolor: 'success.light', 
                              color: 'success.dark', 
                              fontSize: '0.85rem',
                              fontWeight: 600 
                            }}>
                              Active
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {note.note}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {note.create_date ? new Date(note.create_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          {note.update_date ? new Date(note.update_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            {note.dismissed ? (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleUndoDismiss(note.id)}
                                color="primary"
                              >
                                Undo
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleDismiss(note.id)}
                                color="warning"
                              >
                                Dismiss
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Notes;
