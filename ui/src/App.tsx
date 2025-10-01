import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JobList from './components/JobList';
import JobDetail from './components/JobDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>AnsibleJob Dashboard</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/job/:jobId" element={
              <JobDetail job={{
                job_id: '',
                app_name: '',
                playbook_name: '',
                inventory: '',
                play_name: ''
              }} />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
