"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    sex: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    const { firstName, lastName, dob, sex } = formData;
    if (firstName && lastName && dob && sex) {
      setStep(2);
    } else {
      alert("Please fill in all fields before continuing.");
    }
  };

  const handleSubmit = () => {
    if (formData.password === formData.confirmPassword) {
      console.log("Registered:", formData);
    } else {
      alert("Passwords do not match");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="grid grid-cols-2 w-full max-w-4xl border border-gray-700 rounded-xl overflow-hidden">
        <div className="relative">
          <img
            src="/placeholder.svg"
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-center bg-black p-6">
          <div className="w-full max-w-md bg-black p-6 rounded-xl shadow-md text-white border border-gray-700">
            {step === 1 ? (
              <div className="space-y-4 text-center">
                <h2 className="text-xl font-bold">Information Page</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border p-2 rounded bg-white text-black"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border p-2 rounded bg-white text-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="dob"
                    placeholder="Day Of Birth"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full border p-2 rounded bg-white text-black"
                  />
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full border p-2 rounded bg-white text-black"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <button
                  onClick={nextStep}
                  className="w-1/2 mx-auto bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Register Page</h2>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border p-2 rounded bg-white text-black"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border p-2 rounded bg-white text-black"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border p-2 rounded bg-white text-black"
                />
                <button
                  onClick={handleSubmit}
                  className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}