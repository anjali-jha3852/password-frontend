"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import CryptoJS from "crypto-js";

export default function DashboardPage() {
  const router = useRouter();
  const [vaultItems, setVaultItems] = useState([]);
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState(""); // 📝 Notes field
  const [search, setSearch] = useState("");
  const [length, setLength] = useState(12);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false); // 🌗 Theme toggle

  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : "";

  // 🌗 Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = !dark;
    setDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // ✅ Fetch vault items
  const fetchVaultItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vault");
      setVaultItems(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchVaultItems();
  }, []);

  // ✨ Password Generator
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

  // ✉️ Add / Update vault item
  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!title || !username || !password) return alert("All fields required");

    const encryptedPassword = CryptoJS.AES.encrypt(password, userEmail).toString();

    try {
      if (editingId) {
        // update
        const res = await api.put(`/vault/${editingId}`, {
          title,
          username,
          password: encryptedPassword,
          notes, // 📝 include notes
        });
        setVaultItems(vaultItems.map((v) => (v._id === editingId ? res.data : v)));
        alert("Vault item updated!");
        setEditingId(null);
      } else {
        // add new
        const res = await api.post("/vault", {
          title,
          username,
          password: encryptedPassword,
          notes, // 📝 include notes
        });
        setVaultItems([...vaultItems, res.data]);
        alert("Vault item added!");
      }

      // reset form
      setTitle("");
      setUsername("");
      setPassword("");
      setNotes(""); // reset notes
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save vault");
    }
  };

  // 🗑️ Delete vault item
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/vault/${id}`);
      setVaultItems(vaultItems.filter((item) => item._id !== id));
      alert("Deleted successfully!");
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  // ✏️ Edit vault item
  const handleEdit = (item) => {
    const decrypted = CryptoJS.AES.decrypt(item.password, userEmail).toString(CryptoJS.enc.Utf8);
    setTitle(item.title);
    setUsername(item.username);
    setPassword(decrypted);
    setNotes(item.notes || ""); // 📝 load notes if present
    setEditingId(item._id);
  };

  // 📋 Copy password with auto-clear
  const copyPassword = (encryptedPassword) => {
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, userEmail).toString(CryptoJS.enc.Utf8);
    navigator.clipboard.writeText(decrypted);
    alert("Password copied to clipboard!");

    // 🧹 Auto-clear clipboard after 10 seconds
    setTimeout(() => {
      navigator.clipboard.writeText("");
      console.log("Clipboard cleared");
    }, 10000);
  };

  // 🔍 Filter vaults
  const filteredVaults = vaultItems.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-6 transition-colors ${dark ? "bg-gray-900 text-white" : "bg-blue-400 text-white"}`}>
      {/* 🌗 Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 px-3 py-1 rounded shadow ${
          dark ? "bg-gray-700 text-whote" : "bg-white text-white"
        }`}
      >
        {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">Your Password Vault</h1>

      {/* Add / Edit Vault Form */}
      <form
        onSubmit={handleAddOrUpdate}
        className={`p-6 rounded shadow-md mb-6 w-full max-w-lg mx-auto ${dark ? "bg-gray-800" : "bg-black"} text-white`}
      >
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Entry" : "Add New Entry"}</h2>
        <input
          type="text"
          placeholder="Title"
          className="border p-2 w-full mb-3 rounded text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full mb-3 rounded text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Password"
          className="border p-2 w-full mb-3 rounded text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* 📝 Notes field */}
        <textarea
          placeholder="Notes (optional)"
          className="border p-2 w-full mb-3 rounded text-white"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>

        {/* Generator Options */}
        <div className={`p-3 rounded border mb-3 ${dark ? "bg-gray-700 text-white" : "bg-red-400 text-black"}`}>
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
            Generate Password
          </button>
        </div>

        <button className="bg-green-500 hover:bg-green-600 text-white p-2 w-full rounded">
          {editingId ? "Update Entry" : "Save Entry"}
        </button>
      </form>

      {/* Search + Refresh */}
      <div className="max-w-lg mx-auto mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by title or username..."
          className="border p-2 w-full rounded text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={fetchVaultItems}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 rounded"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Vault List */}
      <div className={`max-w-lg mx-auto p-4 rounded shadow ${dark ? "bg-gray-800 text-white" : "bg-black text-white"}`}>
        <h2 className="text-lg font-semibold mb-3">Saved Vaults</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : filteredVaults.length === 0 ? (
          <p className="text-gray-400">No saved passwords found</p>
        ) : (
          <ul className="space-y-3">
            {filteredVaults.map((item) => (
              <li
                key={item._id}
                className="border p-3 rounded flex flex-col gap-2 bg-gray-800"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <strong className="block">{item.title}</strong>
                    <span className="text-sm text-gray-400">{item.username}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => copyPassword(item.password)}
                      className="text-blue-400 hover:underline"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-yellow-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {item.notes && <p className="text-sm text-gray-300 mt-1">📝 {item.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
