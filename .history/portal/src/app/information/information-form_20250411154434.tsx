"use client";

import { useState } from "react";

interface InformationFormProps {
  userName: string;
  userEmail: string;
  userPhone: string;
  onUpdate: (updatedData: { name: string; phoneNumber: string }) => Promise<void>;
  onCancel: () => void;
}

const InformationForm: React.FC<InformationFormProps> = ({ 
  userName, 
  userEmail, 
  userPhone, 
  onUpdate, 
  onCancel 
}) => {
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      name: formData.get('name') as string,
      phoneNumber: formData.get('phoneNumber') as string,
    };
    
    try {
      await onUpdate(updatedData);
      setFormSuccess(true);
    } catch (error: any) {
      console.error("Error in form submission:", error);
      setFormError(error.message || "Failed to update information");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {formError && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-white rounded">
          <p>{formError}</p>
        </div>
      )}
      
      {formSuccess && (
        <div className="mb-4 p-3 bg-green-900 border border-green-700 text-white rounded">
          <p>Information updated successfully!</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input 
            type="text"
            name="name"
            defaultValue={userName}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={formLoading}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input 
            type="email"
            name="email"
            value={userEmail}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded-md cursor-not-allowed text-gray-400"
            disabled
          />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
          <input 
            type="tel"
            name="phoneNumber"
            defaultValue={userPhone}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={formLoading}
            placeholder="Enter your phone number"
          />
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={formLoading}
            className="w-1/3 py-2 px-4 rounded-md bg-gray-700 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={formLoading}
            className={`w-2/3 py-2 px-4 rounded-md ${
              formLoading 
                ? 'bg-blue-800 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white flex justify-center items-center`}
          >
            {formLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InformationForm;