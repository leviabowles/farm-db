import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import FarmList from './components/FarmList';
import FarmForm from './components/FarmForm';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Header from './components/Header';
import FieldList from './components/FieldList';
import FieldYearCropList from './components/FieldYearCropList';
import './App.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/farms" element={<FarmList />} />
              <Route path="/farms/new" element={<FarmForm />} />
              <Route path="/farms/:id/edit" element={<FarmForm />} />
              <Route path="/transactions" element={<TransactionList />} />
              <Route path="/transactions/new" element={<TransactionForm />} />
              <Route path="/transactions/:id/edit" element={<TransactionForm />} />
              {/* New route for Fields */}
              <Route path="/fields" element={<FieldList />} />
              <Route path="/fieldyearcrops" element={<FieldYearCropList />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;