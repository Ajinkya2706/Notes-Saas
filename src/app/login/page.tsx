"use client";
import React from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const { register, handleSubmit, formState: { isSubmitting, errors }, setError } = useForm<{ email: string; password: string }>();

  async function onSubmit(values: { email: string; password: string }) {
    try {
      console.log("Attempting login for:", values.email);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      
      if (!res.ok) {
        setError("root", { message: data?.error || "Login failed" });
        return;
      }
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("tenant", JSON.stringify(data.tenant));
      localStorage.setItem("role", data.role);
      console.log("Login successful, redirecting to dashboard");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      setError("root", { message: "Network error. Please try again." });
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-black text-white">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
        <div className="max-w-md space-y-4">
          <h1 className="text-4xl font-bold">Capture ideas beautifully</h1>
          <p className="text-white/70">A modern multi-tenant notes app for teams.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm text-gray-400">Sign in to your account</p>
          </div>
          <div className="space-y-3">
            <input className="w-full border border-gray-800 bg-black text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-700" placeholder="Email" type="email" {...register("email", { required: true })} />
            <input className="w-full border border-gray-800 bg-black text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-700" placeholder="Password" type="password" {...register("password", { required: true })} />
          </div>
          <button disabled={isSubmitting} className="w-full bg-white text-black hover:bg-gray-200 transition py-3 rounded">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          {errors.root && <p className="text-sm text-red-500">Error: {errors.root.message}</p>}
          <p className="text-sm text-gray-400">No account? <a href="/signup" className="underline">Create one</a></p>
          {/* <p className="text-xs text-gray-500">Test: admin@acme.test / password</p> */}
        </form>
      </div>
    </div>
  );
}


