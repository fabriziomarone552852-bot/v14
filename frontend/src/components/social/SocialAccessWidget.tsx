import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const SocialAccessWidget: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <button
      onClick={() => navigate('/social')}
      className="w-10 h-10 rounded-full border border-gray-200 shadow-sm bg-white overflow-hidden flex items-center justify-center hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
      title="Profilo & Social"
    >
      {user.profile_picture_url ? (
        <img 
          src={user.profile_picture_url} 
          alt={user.username} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
        />
      ) : (
        <span className="text-sm font-black text-gray-500 uppercase group-hover:text-blue-600 transition-colors">
          {user.username.substring(0, 2)}
        </span>
      )}
    </button>
  );
};
