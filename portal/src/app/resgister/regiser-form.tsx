import React, { useState } from 'react';

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    sex: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    console.log('Form Data:', formData);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {step === 1 ? (
        <div className="space-y-4">
          <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="w-full p-2 border rounded" />
          <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="w-full p-2 border rounded" />
          <input name="dob" placeholder="Day of Birth" value={formData.dob} onChange={handleInputChange} className="w-full p-2 border rounded" />
          <select name="sex" value={formData.sex} onChange={handleSelectChange} className="w-full p-2 border rounded">
            <option value="">Select Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button type="button" onClick={nextStep} className="w-full bg-blue-600 text-white p-2 rounded">Continue</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded" required />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} className="w-full p-2 border rounded" required />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleInputChange} className="w-full p-2 border rounded" required />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">Register</button>
          <button type="button" onClick={prevStep} className="w-full text-sm text-gray-500 mt-2">Back</button>
        </form>
      )}
    </div>
  );
}
