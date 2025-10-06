"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import CryptoJS from "crypto-js"; // for encryption if needed later

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);

  // ✨ Password Generator Function
  const generatePassword = () => {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+";
    if (excludeSimilar) chars = chars.replace(/[O0Il1]/g, "");

    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 🔐 You can encrypt password locally if needed for vault usage
      // const encrypted = CryptoJS.AES.encrypt(password, email).toString();

      const res = await api.post("/auth/register", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", email); // save key for vault encryption
      router.push("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-black p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input + Generator */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Password"
            className="border p-2 w-full rounded mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Password Generator Controls */}
          <div className="bg-amber-200 p-3 rounded border">
            <label className="block text-sm mb-2 font-medium">Generate Password</label>

            <div className="mb-2">
              <label className="block text-xs">Length: {length}</label>
              <input
                type="range"
                min="6"
                max="32"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <label>
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={() => setIncludeNumbers(!includeNumbers)}
                />{" "}
                Include Numbers
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={() => setIncludeSymbols(!includeSymbols)}
                />{" "}
                Include Symbols
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={() => setExcludeSimilar(!excludeSimilar)}
                />{" "}
                Exclude Similar Characters
              </label>
            </div>

            <button
              type="button"
              onClick={generatePassword}
              className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Generate
            </button>
          </div>
        </div>

        <button className="bg-green-500 hover:bg-green-600 text-white p-2 w-full rounded">
          Register
        </button>
      </form>
    </div>
  );
}
