"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function SignupPage() {
  const { register, handleSubmit, formState: { isSubmitting }, setError } = useForm<{ email: string; password: string; tenantSlug: string }>();
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(values: { email: string; password: string; tenantSlug: string }) {
    setMessage(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setError("root", { message: data?.error || "Signup failed" });
      return;
    }
    setMessage("Account created. Please login.");
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-black text-white">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold">Join your team</h1>
          <p className="text-white/70">Sign up as a member in your tenant.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Create account</h2>
            <p className="text-sm text-gray-400">Choose tenant: acme or globex</p>
          </div>
          <div className="space-y-3">
            <input className="w-full border border-gray-800 bg-black text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-700" placeholder="Email" type="email" {...register("email", { required: true })} />
            <input className="w-full border border-gray-800 bg-black text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-700" placeholder="Password" type="password" {...register("password", { required: true })} />
            <input className="w-full border border-gray-800 bg-black text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-700" placeholder="Tenant slug (e.g., acme)" {...register("tenantSlug", { required: true })} />
          </div>
          <button disabled={isSubmitting} className="w-full bg-white text-black hover:bg-gray-200 transition py-3 rounded">
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
          {message && <p className="text-sm text-green-500">{message}</p>}
          <p className="text-sm text-gray-400">Have an account? <a href="/login" className="underline">Sign in</a></p>
        </form>
      </div>
    </div>
  );
}



