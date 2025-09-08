import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data);
      
      // If the project has a clientId, fetch client details
      if (projectRes.data.clientId) {
        try {
          // Ensure clientId is a string
          const clientId = typeof projectRes.data.clientId === 'object' 
            ? projectRes.data.clientId._id || projectRes.data.clientId.id 
            : projectRes.data.clientId;
          
          if (clientId) {
            const clientRes = await api.get(`/clients/${clientId}`);
            setClient(clientRes.data);
          }
        } catch (err) {
          console.error('Failed to fetch client details:', err);
        }
      }
    } catch (err) {
      setError('Failed to fetch project details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects', { state: { message: 'Project deleted successfully' } });
    } catch (err) {
      setError('Failed to delete project');
      console.error(err);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Project</h3>
          <p className="mt-2 text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Project Not Found</h3>
          <p className="mt-2 text-gray-500">The project you're looking for doesn't exist.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/projects')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with navigation */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <div>
                <Link to="/projects" className="text-gray-500 hover:text-gray-700">
                  Projects
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-2 text-gray-700">{project.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Project header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                {project.type && (
                  <span className="ml-3 px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {project.type}
                  </span>
                )}
              </div>
              <p className="mt-2 text-gray-600">{project.description}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => navigate(`/projects/edit/${project._id}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Project image */}
          {project.image && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Project Image</h3>
              </div>
              <div className="p-4">
                <div className="h-48 md:h-64 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                  {project.image?.url ? (
                    <img 
                      src={project.image.url} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = (
                          '<div class="text-center text-gray-500">No image available</div>'
                        );
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-500">No image available</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          {project.skills && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Skills & Technologies</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(project.skills) 
                    ? project.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {typeof skill === 'string' ? skill.trim() : skill.name || skill.label || 'Skill'}
                        </span>
                      ))
                    : <span className="text-gray-500">No skills specified</span>
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Price</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {project.price ? `$${project.price}` : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created Date</p>
                <p className="mt-1 text-gray-900">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                <p className="mt-1 text-gray-900">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Client information */}
          {client && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-800 font-medium">
                      {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-semibold text-gray-900">{client.name}</h4>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/clients/${client._id}`}
                    className="text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    View client details →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;