import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

const Home = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/user/data');
            if (response.data.success) {
                setUserData(response.data.userData);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await api.post('/auth/logout');

            if (response.data.success) {
                toast.success(response.data.message);
                navigate('/login');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Logout failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-2xl animate-slide-up">
                <div className="glass-card p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-4">
                            Welcome! 🎉
                        </h1>
                        <p className="text-gray-400 text-lg">
                            You have successfully logged in to your account
                        </p>

                        {/* Verification Status Badge */}
                        {userData && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                {userData.isAccountVerified ? (
                                    <>
                                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-green-400 font-medium">Email Verified</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-yellow-400 font-medium">Email Not Verified</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Email Verification Alert */}
                    {userData && !userData.isAccountVerified && (
                        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="text-yellow-400 font-semibold mb-1">Verify Your Email Address</h3>
                                    <p className="text-gray-400 text-sm mb-3">
                                        Please verify your email address to access all features and secure your account.
                                    </p>
                                    <button
                                        onClick={() => navigate('/email-verify')}
                                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors duration-200"
                                    >
                                        Verify Email Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="space-y-6 mb-8">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h2 className="text-xl font-semibold text-white mb-2">Authentication Success</h2>
                            <p className="text-gray-400">
                                Your session is active and you're now authenticated. This is a protected route that only logged-in users can access.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl p-4 border border-primary-500/30">
                                <div className="text-3xl mb-2">🔐</div>
                                <h3 className="font-semibold text-white mb-1">Secure</h3>
                                <p className="text-sm text-gray-400">JWT-based authentication</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
                                <div className="text-3xl mb-2">⚡</div>
                                <h3 className="font-semibold text-white mb-1">Fast</h3>
                                <p className="text-sm text-gray-400">Optimized performance</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                                <div className="text-3xl mb-2">🎨</div>
                                <h3 className="font-semibold text-white mb-1">Modern</h3>
                                <p className="text-sm text-gray-400">Beautiful UI design</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleLogout}
                            className="btn-primary"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>
        </div>
    );
};

export default Home;
