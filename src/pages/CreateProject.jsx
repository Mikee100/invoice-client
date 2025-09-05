import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPaperclip ,FiUpload ,FiPlus, FiX, FiInfo, FiDollarSign, FiClock, FiTag, FiCalendar, FiLock, FiGlobe, FiUsers, FiCode, FiPenTool, FiBarChart2, FiCamera, FiMic, FiFilm, FiBook } from 'react-icons/fi';
import ReactSelect from 'react-select';
import api from '../services/api';
import { toast } from 'react-toastify';

// Project categories and subcategories
const PROJECT_CATEGORIES = {
  'Web Development': ['Website', 'Web App', 'E-commerce', 'WordPress', 'API'],
  'Mobile Development': ['iOS', 'Android', 'React Native', 'Flutter', 'Cross-platform'],
  'Design & Creative': ['UI/UX', 'Logo', 'Illustration', '3D', 'Animation'],
  'Writing': ['Content', 'Copywriting', 'Technical', 'Translation'],
  'Marketing': ['SEO', 'Social Media', 'Email', 'PPC', 'Content'],
  'Video & Audio': ['Editing', 'Motion Graphics', 'Voice Over', 'Animation']
};

// Skills suggestions
const SKILLS_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'UI/UX', 'Figma', 'Photoshop', 'Illustrator', 'Content Writing',
  'Copywriting', 'SEO', 'Social Media', 'Video Editing', '3D Modeling'
].map(skill => ({ value: skill, label: skill }));

// Budget types
const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'retainer', label: 'Retainer' }
];

// Project complexity levels
const COMPLEXITY_LEVELS = [
  { value: 'small', label: 'Small', description: 'Simple task, few hours' },
  { value: 'medium', label: 'Medium', description: 'Multiple components' },
  { value: 'complex', label: 'Complex', description: 'Multiple features' },
  { value: 'ongoing', label: 'Ongoing', description: 'Long-term work' }
];

const CreateProject = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    clientId: '',
    category: '',
    subcategory: '',
    budgetType: BUDGET_TYPES[0],
    price: '',
    minBudget: '',
    maxBudget: '',
    hourlyRate: '',
    estimatedHours: '',
    skills: [],
    complexity: COMPLEXITY_LEVELS[0],
    startDate: '',
    deadline: '',
    image: null,
    files: [],
    requirements: [''],
    isFeatured: false
  });
  
  const [clients, setClients] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Web Development': return <FiCode className="mr-2" />;
      case 'Mobile Development': return <FiCode className="mr-2" />;
      case 'Design & Creative': return <FiPenTool className="mr-2" />;
      case 'Writing': return <FiBook className="mr-2" />;
      case 'Marketing': return <FiBarChart2 className="mr-2" />;
      case 'Video & Audio': return <FiFilm className="mr-2" />;
      default: return <FiGlobe className="mr-2" />;
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setForm(prev => ({
      ...prev,
      category,
      subcategory: '',
      skills: []
    }));
    setSubcategories(PROJECT_CATEGORIES[category] || []);
  };

  // Handle form input changes - handles all input types including files and checkboxes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && name === 'image' && files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm(prev => ({
          ...prev,
          [name]: {
            file: files[0],
            preview: event.target.result
          }
        }));
      };
      reader.readAsDataURL(files[0]);
    } else if (type === 'file' && files) {
      // Handle multiple file uploads
      const newFiles = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      }));
      
      setForm(prev => ({
        ...prev,
        [name]: [...(prev[name] || []), ...newFiles]
      }));
    } else if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name, selectedOption) => {
    setForm(prev => ({
      ...prev,
      [name]: selectedOption
    }));
  };

  // Handle skill input
  const handleSkillAdd = (newValue) => {
    const newSkill = newValue.value.trim();
    if (newSkill && !form.skills.includes(newSkill)) {
      setForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
    }
    setSkillInput('');
  };

  // Remove skill
  const removeSkill = (skillToRemove) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Add requirement field
  const addRequirement = () => {
    setForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  // Update requirement
  const updateRequirement = (index, value) => {
    const newRequirements = [...form.requirements];
    newRequirements[index] = value;
    setForm(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  // Remove requirement
  const removeRequirement = (index) => {
    const newRequirements = form.requirements.filter((_, i) => i !== index);
    setForm(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    }));
    
    setForm(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  // Remove file
  const removeFile = (index) => {
    const newFiles = form.files.filter((_, i) => i !== index);
    setForm(prev => ({
      ...prev,
      files: newFiles
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm(prev => ({
          ...prev,
          image: {
            file: e.target.files[0],
            preview: event.target.result
          }
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Calculate total budget
  const calculateTotalBudget = () => {
    if (form.budgetType.value === 'hourly' && form.hourlyRate && form.estimatedHours) {
      return `$${(form.hourlyRate * form.estimatedHours).toFixed(2)}`;
    } else if (form.budgetType.value === 'fixed' && form.price) {
      return `$${parseFloat(form.price).toFixed(2)}`;
    } else if (form.budgetType.value === 'range' && form.minBudget && form.maxBudget) {
      return `$${parseFloat(form.minBudget).toFixed(2)} - $${parseFloat(form.maxBudget).toFixed(2)}`;
    }
    return 'Not specified';
  };

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      
      // Add all form fields to formData
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'image' && value) {
          formData.append('image', value.file);
        } else if (key === 'files' && value.length > 0) {
          form.files.forEach((file, index) => {
            formData.append(`files`, file.file);
          });
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      await api.post('/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Project created successfully!');
      setSuccess('Project created successfully!');
      setTimeout(() => navigate('/projects'), 1500);
    } catch (err) {
      console.error('Error creating project:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create project';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-blue-600">
          <h1 className="text-2xl font-bold text-white">Create New Project</h1>
          <p className="mt-1 text-sm text-indigo-100">Fill in the details below to create a new project</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="space-y-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Project Details</h2>
              <p className="mt-2 text-sm text-gray-500">Basic information about your project</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base px-4 py-3 border transition duration-150 ease-in-out"
                    placeholder="e.g. E-commerce Website Redesign"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                  Client
                </label>
                <div className="mt-1">
                  <select
                    id="clientId"
                    name="clientId"
                    value={form.clientId}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base px-4 py-3 border transition duration-150 ease-in-out"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {Object.keys(PROJECT_CATEGORIES).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={!form.category}
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe the project in detail..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Project Image</label>
                <div className="mt-1 flex items-center">
                  <span className="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                    {form.image ? (
                      <img
                        src={form.image.preview}
                        alt="Project preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        className="h-full w-full text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.936 0 9.263 2.595 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </span>
                  <label
                    htmlFor="image-upload"
                    className="ml-5 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                  >
                    <span>Change</span>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      className="sr-only"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Budget & Timeline</h2>
              <p className="mt-1 text-sm text-gray-500">Set the budget and timeline for your project</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="budgetType" className="block text-sm font-medium text-gray-700">
                  Budget Type
                </label>
                <select
                  id="budgetType"
                  name="budgetType"
                  value={form.budgetType.value}
                  onChange={(e) => {
                    const selected = BUDGET_TYPES.find(bt => bt.value === e.target.value);
                    handleSelectChange('budgetType', selected);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {BUDGET_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.budgetType.value === 'fixed' && (
                <div className="space-y-1">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Fixed Price ($)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      value={form.price}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {form.budgetType.value === 'hourly' && (
                <>
                  <div className="space-y-1">
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                      Hourly Rate ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="hourlyRate"
                        id="hourlyRate"
                        value={form.hourlyRate}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      name="estimatedHours"
                      id="estimatedHours"
                      value={form.estimatedHours}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="0"
                      min="1"
                      step="1"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="block text-sm font-medium text-gray-700">
                      Estimated Total
                    </span>
                    <div className="mt-1 px-3 py-2 bg-gray-50 text-sm text-gray-900 rounded-md">
                      {form.hourlyRate && form.estimatedHours ? (
                        `$${(form.hourlyRate * form.estimatedHours).toFixed(2)}`
                      ) : (
                        'Enter rate and hours'
                      )}
                    </div>
                  </div>
                </>
              )}

              {form.budgetType.value === 'range' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="minBudget" className="block text-sm font-medium text-gray-700">
                      Minimum Budget ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="minBudget"
                        id="minBudget"
                        value={form.minBudget}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700">
                      Maximum Budget ($)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="maxBudget"
                        id="maxBudget"
                        value={form.maxBudget}
                        onChange={handleChange}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        min={form.minBudget || '0'}
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  id="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Skills & Requirements */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Skills & Requirements</h2>
              <p className="mt-1 text-sm text-gray-500">Add skills and requirements for this project</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Required Skills
                </label>
                <div className="mt-1">
                  <ReactSelect
                    isMulti
                    options={SKILLS_SUGGESTIONS}
                    value={form.skills.map(skill => ({ value: skill, label: skill }))}
                    onChange={(selected) => {
                      setForm(prev => ({
                        ...prev,
                        skills: selected ? selected.map(option => option.value) : []
                      }));
                    }}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder="Select or type to add skills..."
                    isClearable
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Select from suggestions or type to add new ones</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Project Requirements
                  <span className="text-gray-500 font-normal ml-1">(optional)</span>
                </label>
                {form.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder={`Requirement ${index + 1}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiPlus className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Add Requirement
                </button>
              </div>
            </div>
          </div>

          {/* Files & Attachments */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Files & Attachments</h2>
              <p className="mt-1 text-sm text-gray-500">Upload any relevant files for this project</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, XLS, JPG, PNG (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    name="files"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                  />
                </label>
              </div>

              {form.files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Attached Files</h4>
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {form.files.map((file, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <FiPaperclip className="flex-shrink-0 h-5 w-5 text-gray-400" />
                          <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                          <span className="text-gray-500">{file.size}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="font-medium text-red-600 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Project Settings */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Project Settings</h2>
              <p className="mt-1 text-sm text-gray-500">Configure additional project settings</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isFeatured"
                    name="isFeatured"
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isFeatured" className="font-medium text-gray-700">
                    Feature this project
                  </label>
                  <p className="text-gray-500">
                    Featured projects appear at the top of your portfolio and are highlighted in search results.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Project Complexity
                </label>
                <select
                  value={form.complexity.value}
                  onChange={(e) => {
                    const selected = COMPLEXITY_LEVELS.find(lvl => lvl.value === e.target.value);
                    handleSelectChange('complexity', selected);
                  }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {COMPLEXITY_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {form.complexity.description}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-5">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : 'Create Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
