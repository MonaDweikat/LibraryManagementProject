import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import SignUp from './SignUp';
import HomePage from './HomePage';
import UserProfile from './UserProfile';
import AddBook from './AddBook';
import ViewBooks from './ViewBooks';
import AddStudent from './AddStudent';
import ViewStudents from './ViewStudents';
import LendBook from './LendBook'
import ViewLentBooks from './ViewLentBooks'
import ManageFees from './ManageFees'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/addbook" element={<AddBook />} />
        <Route path="/viewbooks" element={<ViewBooks />} />
        <Route path="/addstudent" element={<AddStudent />} />
        <Route path="/viewstudents" element={<ViewStudents />} />
        <Route path="/lendbook" element={<LendBook />} />
        <Route path="/viewlentbooks" element={<ViewLentBooks />} />
        <Route path="/managefees" element={<ManageFees />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);
