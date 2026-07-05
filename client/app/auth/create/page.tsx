"use client";
import { useState } from "react";

const CreatePage = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleFormSubmission = async (e: any) => {
    e.preventDefault();

    setLoading(true);

    const frm = new FormData(e.target);

    const response = await fetch("http://localhost:5080/api/User/Create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Username: frm.get("Username"),
        Password: frm.get("Password"),
      }),
    });

    console.log(await response.json());

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen flex justify-center items-center">
      <main className="p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center">
          Account Creation Page
        </h1>
        <form
          onSubmit={handleFormSubmission}
          className="mt-4 flex flex-col gap-4"
        >
          <div className="w-full relative">
            <label
              htmlFor="Username"
              className="absolute -top-2.5 left-2 bg-white px-1 text-sm text-gray-500"
            >
              Username
            </label>
            <input
              id="Username"
              type="text"
              name="Username"
              placeholder="Enter a username"
              className="border p-3 rounded w-full bg-none border-gray-300 focus:outline-none"
            />
          </div>
          <div className="w-full relative">
            <label
              htmlFor="Username"
              className="absolute -top-2.5 left-2 bg-white px-1 text-sm text-gray-500"
            >
              Password
            </label>
            <input
              id="Password"
              type="password"
              name="Password"
              placeholder="Enter a password"
              className="border p-3 rounded w-full bg-none border-gray-300 focus:outline-none"
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="bg-blue-500 hover:bg-blue-600  disabled:bg-gray-300 cursor-pointer text-white p-2 rounded disabled:cursor-default"
          >
            Create
          </button>
          <div className="text-center text-sm text-gray-500 mt-2">
            Already have an account?{" "}
            <a href="/auth/login" className="text-blue-500 hover:underline">
              Login
            </a>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreatePage;
