import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/problems', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProblems(response.data);
        } catch (error) {
            setError('Failed to fetch problems');
            console.error('Error fetching problems:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600 bg-green-100';
            case 'Medium': return 'text-yellow-600 bg-yellow-100';
            case 'Hard': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading problems...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">LeakCode</h1>
                            <p className="text-gray-600">Welcome back, {user?.username}!</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Solved: {user?.solvedProblems?.length || 0} problems
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="px-4 py-6 sm:px-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Problems</h2>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {problems.map((problem) => (
                            <div
                                key={problem._id}
                                className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all hover:shadow-lg cursor-pointer ${
                                    problem.isSolved 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => navigate(`/problem/${problem._id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {problem.title}
                                    </h3>
                                    {problem.isSolved && (
                                        <span className="text-green-600 text-sm font-medium">
                                            ✓ Solved
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </span>
                                    {problem.tags && problem.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {problem.tags.slice(0, 2).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {problem.tags.length > 2 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                    +{problem.tags.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/problem/${problem._id}`);
                                    }}
                                >
                                    {problem.isSolved ? 'View Solution' : 'Solve'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {problems.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No problems available.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard; 