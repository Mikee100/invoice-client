import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const Projects = () => {
  const navigate = useNavigate();
  // State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    clientId: '',
    type: '',
    price: '',
    image: '',
    skills: '',
  });
  const [success, setSuccess] = useState(null);
  const [clients, setClients] = useState([]);
  const [editing, setEditing] = useState(null);

  // Effects
  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  // Data fetching
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      setError('Failed to fetch clients');
    }
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      const reader = new FileReader();
      reader.onload = e => setForm(f => ({ ...f, image: e.target.result }));
      reader.readAsDataURL(files[0]);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.post('/projects', form);
      setSuccess('Project added successfully!');
      setForm({ name: '', description: '', clientId: '' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add project');
    }
  };

  const handleEdit = (project) => {
    setEditing(project);
    setForm({ name: project.name, description: project.description, clientId: project.clientId || '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.put(`/projects/${editing._id}`, form);
      setSuccess('Project updated successfully!');
      setEditing(null);
      setForm({ name: '', description: '', clientId: '' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/projects/${id}`);
      setSuccess('Project deleted successfully!');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (loading) {
    return <Loader />;
  }
  return (
  <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 flex items-center gap-2">
        <span className="inline-block bg-green-100 text-green-700 rounded-full px-3 py-1 text-lg font-semibold">Projects</span>
      </h1>
      <div className="flex justify-end mb-6">
        <button
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold shadow transition"
          onClick={() => navigate('/create-project')}
        >
          Create Project
        </button>
      </div>
      {success && <div className="mb-4 text-green-600 font-semibold bg-green-50 border border-green-200 rounded-lg p-3">{success}</div>}
      {error && <div className="mb-4 text-red-500 font-semibold bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}
      <div>
        <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-green-50">
              <th className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">Name</th>
              <th className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">Description</th>
              <th className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">Type</th>
              <th className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">Price</th>
              <th className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">Skills/Tags</th>
              <th className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">Image</th>
              <th className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">Client</th>
              <th className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">Added</th>
              <th className="p-3 text-left font-semibold text-gray-700 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project._id} className="border-b hover:bg-green-50 transition">
                <td className="p-3 text-gray-900 font-medium max-w-[120px] truncate" title={project.name}>{project.name}</td>
                <td className="p-3 text-gray-700 max-w-[180px] truncate" title={project.description}>{project.description}</td>
                <td className="p-3 text-gray-700 whitespace-nowrap">{project.type || '-'}</td>
                <td className="p-3 text-gray-700 whitespace-nowrap">{project.price ? `$${project.price}` : '-'}</td>
                <td className="p-3 text-gray-700 max-w-[120px] truncate" title={project.skills}>{project.skills || '-'}</td>
                <td className="p-3 text-gray-700">
                  {project.image ? (
                    <img src={project.image} alt="Project" className="w-12 h-12 object-cover rounded-lg border" />
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </td>
                <td className="p-3 text-gray-700 whitespace-nowrap">{clients.find(c => c._id === project.clientId)?.name || '-'}</td>
                <td className="p-3 text-gray-500 whitespace-nowrap">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}</td>
                <td className="p-3 flex gap-2 whitespace-nowrap">
                  <button onClick={() => { handleEdit(project); setShowModal(true); }} className="text-green-600 hover:text-green-900 font-semibold px-3 py-1 rounded transition bg-green-100">Edit</button>
                  <button onClick={() => handleDelete(project._id)} className="text-red-600 hover:text-red-900 font-semibold px-3 py-1 rounded transition bg-red-100">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {projects.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center mt-12 text-gray-500">
          <img src="https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/folder.svg" alt="No projects" className="w-20 h-20 mb-4 opacity-70" />
          <h2 className="text-xl font-semibold mb-2">No projects found</h2>
          <p className="mb-4">Start by creating a new project using the button above.</p>
        </div>
      
      
      
      )}
    </div>
  );
};

export default Projects;
