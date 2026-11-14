import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import api from '../services/api';
import Banner from './Banner';
import ExpenditureWaterfall from './ExpenditureWaterfall';

const ClickableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FarmNote = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Only fetch active (non-dismissed) notes for the farm notes section
  const loadNotes = async (onlyActive = true) => {
    try {
      const url = onlyActive ? '/api/farmnotes/?dismissed=false' : '/api/farmnotes/';
      const response = await api.get(url);
      setNotes(response.data.results || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching farm notes:', err);
      setError('Failed to load farm notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes(true);
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
    <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }} elevation={0}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'info.main', mr: 2, borderRadius: 1 }} />
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
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Add New Note
              </Typography>
              <TextField
                multiline
                rows={2}
                fullWidth
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type your note here..."
                variant="outlined"
                size="small"
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

          {/* Notes list */}
          <Box>
            <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
              Notes
            </Typography>
            {notes.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                No notes yet. Add one above!
              </Box>
            ) : (
              notes.map(note => (
                <Paper
                  key={note.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: note.dismissed ? 'action.disabledBackground' : 'background.paper',
                    border: note.dismissed ? '1px solid' : '1px solid',
                    borderColor: note.dismissed ? 'divider' : 'primary.light',
                    opacity: note.dismissed ? 0.7 : 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {note.note}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {note.create_date ? new Date(note.create_date).toLocaleString() : 'Unknown date'}
                    {note.update_date && note.update_date !== note.create_date && 
                      ` • Updated: ${new Date(note.update_date).toLocaleString()}`
                    }
                  </Typography>
                </Paper>
              ))
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentCrops, setCurrentCrops] = useState([]);
  const [harvestedCrops, setHarvestedCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCropData = async () => {
      try {
        console.log('Fetching crop data for dashboard...');
        const response = await api.get('/api/annualcrops/');

        let allCrops = Array.isArray(response.data) ? response.data : (response.data.results || []);

        const now = new Date();
        const oneAndHalfYearsAgo = new Date();
        oneAndHalfYearsAgo.setMonth(now.getMonth() - 18);

        const active = [];
        const harvested = [];

        allCrops.forEach(crop => {
          const cropData = {
            ...crop,
            field_name: crop.field?.field_name || 'Unknown Field',
            crop_name: crop.crop?.crop_name || 'Unknown Crop'
          };

          if (!crop.harvest_date) {
            active.push(cropData);
          } else {
            const hDate = new Date(crop.harvest_date);
            if (hDate >= oneAndHalfYearsAgo) {
              harvested.push(cropData);
            }
          }
        });

        const sortByYear = (a, b) => (b.year_key || 0) - (a.year_key || 0);

        setCurrentCrops(active.sort(sortByYear));
        setHarvestedCrops(harvested.sort(sortByYear));
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard crops:', err);
        setError('Failed to load crop status.');
      } finally {
        setLoading(false);
      }
    };

    fetchCropData();
  }, []);

  const renderCropTable = (title, data, isHarvested = false) => (
    <Paper sx={{ p: 3, borderRadius: 4, mb: 4 }} elevation={0}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ width: 4, height: 24, bgcolor: isHarvested ? 'secondary.main' : 'primary.main', mr: 2, borderRadius: 1 }} />
        {title}
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          No {isHarvested ? 'recent harvests' : 'active crops'} found.
        </Box>
      ) : (
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold', color: 'text.secondary' } }}>
                <TableCell>Field</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Crop</TableCell>
                <TableCell align="right">Acres</TableCell>
                <TableCell align="center">{isHarvested ? 'Harvest Date' : 'Planting Date'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((crop, index) => (
                <ClickableRow 
                  key={index} 
                  hover 
                  onClick={() => navigate(`/fieldyearcrops/${crop.id}`)}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{crop.field_name}</TableCell>
                  <TableCell>{crop.year_key}</TableCell>
                  <TableCell>
                    <Box 
                      component="span" 
                      sx={{ 
                        px: 1.5, py: 0.5, 
                        borderRadius: '20px', 
                        bgcolor: isHarvested ? 'secondary.light' : 'primary.light', 
                        color: isHarvested ? 'secondary.dark' : 'primary.dark', 
                        fontSize: '0.85rem',
                        fontWeight: 600 
                      }}
                    >
                      {crop.crop_name}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{crop.acres_planted || 0}</TableCell>
                  <TableCell align="center">{isHarvested ? crop.harvest_date : crop.planting_date || 'N/A'}</TableCell>
                </ClickableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

  return (
    <Box>
      <Banner />
      
      <Box sx={{ padding: '40px 20px', maxWidth: 'lg', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Farm Status
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column: Crop Tables */}
          <Grid item xs={12} md={8}>
            {renderCropTable('CURRENTLY PLANTED CROPS', currentCrops)}
            {renderCropTable('RECENTLY HARVESTED CROPS', harvestedCrops, true)}
          </Grid>

          {/* Right Column: Financial Intelligence */}
          <Grid item xs={12} md={4}>
            <FarmNote />
            <ExpenditureWaterfall />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
