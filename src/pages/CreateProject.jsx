import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateProject = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    clientId: '',
    type: '',
    price: '',
    image: '',
    skills: '',
  });
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients');
        setClients(res.data);
      } catch (err) {
        setError('Failed to fetch clients');
      }
    };
    fetchClients();
  }, []);

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
      setSuccess('Project created successfully!');
      setTimeout(() => navigate('/projects'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-0 bg-transparent">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
        <h1 className="text-4xl font-extrabold mb-2 text-gray-900 text-center">Create a New Project</h1>
        <p className="text-gray-500 mb-8 text-center text-lg">Fill in the details below to add your project. All fields marked <span className='text-red-500'>*</span> are required.</p>
        {success && <div className="mb-4 text-green-600 font-semibold bg-green-50 border border-green-200 rounded-lg p-3 text-center">{success}</div>}
        {error && <div className="mb-4 text-red-500 font-semibold bg-red-50 border border-red-200 rounded-lg p-3 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end w-full">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Project Name <span className="text-red-500">*</span></label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Website Redesign"
              className="border border-gray-300 p-4 rounded-lg w-full focus:ring-2 focus:ring-green-400 transition text-lg"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the project"
              className="border border-gray-300 p-4 rounded-lg w-full focus:ring-2 focus:ring-green-400 transition text-lg"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Type/Category <span className="text-red-500">*</span></label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-lg w-full focus:ring-2 focus:ring-green-400 transition text-lg"
              required
            >
              <option value="">Select type</option>
              <option value="coding">Coding</option>
              <option value="design">Design</option>
              <option value="writing">Writing</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Project Price (USD) <span className="text-red-500">*</span></label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 500"
              className="border border-gray-300 p-4 rounded-lg w-full focus:ring-2 focus:ring-green-400 transition text-lg"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Skills/Tags</label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="e.g. React, Figma, SEO"
              className="border border-gray-300 p-4 rounded-lg w-full focus:ring-2 focus:ring-green-400 transition text-lg"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Project Image</label>
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-lg w-full focus:ring-2 focus:ring-green-400 transition text-lg"
            />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-semibold text-gray-700">Client</label>
            <select
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-lg w-full focus:ring-2 focus:ring-green-400 transition text-lg"
            >
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 mt-8 md:col-span-2 justify-center">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-3 px-10 rounded-xl font-bold shadow transition text-lg">Create Project</button>
            <button type="button" onClick={() => navigate('/projects')} className="ml-2 text-gray-600 hover:text-gray-900 transition text-lg font-bold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
