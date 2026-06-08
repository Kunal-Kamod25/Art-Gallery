'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { User, MapPin, Phone, Mail, Heart, Star, Edit, Save, X } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/store';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchProfile();
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setProfile(data.user);
      setFormData({
        name: data.user.name || '',
        phone: data.user.phone || '',
        address: data.user.address || {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        }
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', formData);
      setProfile(data.user);
      updateUser(data.user);  // sync updated user into Zustand store
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      console.error('Profile update error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="bg-neutral-50 px-8 py-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <User size={32} className="text-amber-600" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-neutral-900">{profile.name}</h1>
                  <p className="text-neutral-600 capitalize">{profile.role}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-outline text-sm"
              >
                {isEditing ? (
                  <>
                    <X size={16} className="mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit size={16} className="mr-2" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold text-neutral-900">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  ) : (
                    <p className="text-neutral-900 py-2">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                  <p className="text-neutral-900 py-2 flex items-center gap-2">
                    <Mail size={16} className="text-neutral-400" />
                    {profile.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-neutral-900 py-2 flex items-center gap-2">
                      <Phone size={16} className="text-neutral-400" />
                      {profile.phone || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h3 className="font-display text-lg font-semibold text-neutral-900">Address</h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-neutral-900 py-2">{profile.address?.street || 'Not provided'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-neutral-900 py-2">{profile.address?.city || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">State/Province</label>
                    {isEditing ? (
                      <select
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Puducherry">Puducherry</option>
                        <option value="Chandigarh">Chandigarh</option>
                      </select>
                    ) : (
                      <p className="text-neutral-900 py-2">{profile.address?.state || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Postal Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address.postalCode"
                        value={formData.address.postalCode}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="e.g., 400001"
                      />
                    ) : (
                      <p className="text-neutral-900 py-2">{profile.address?.postalCode || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Country</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="input-field"
                      defaultValue="India"
                    />
                  ) : (
                    <p className="text-neutral-900 py-2">{profile.address?.country || 'India'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Wishlist Section (for regular users) */}
            {profile.role === 'user' && profile.wishlist && profile.wishlist.length > 0 && (
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="font-display text-lg font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                  <Heart size={20} className="text-red-500" />
                  Wishlist ({profile.wishlist.length} items)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.wishlist.map(item => (
                    <div key={item._id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-neutral-100 rounded mb-3 overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            No image
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-neutral-900 truncate">{item.title}</h4>
                      <p className="text-sm text-neutral-600">${item.price}</p>
                      <button
                        onClick={() => router.push(`/artwork/${item._id}`)}
                        className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <button type="submit" className="btn-primary">
                  <Save size={16} className="mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}