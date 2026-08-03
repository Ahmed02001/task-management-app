import { useState } from "react";
import { searchUserByEmail } from "../services/userService";
import { addMember } from "../services/projectService";

export default function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  onMemberAdded,
}) {
  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail("");
    setFoundUser(null);
    setError("");
    setIsSearching(false);
    setIsAdding(false);
    onClose();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setFoundUser(null);
    setIsSearching(true);

    try {
      const user = await searchUserByEmail(email.trim());
      setFoundUser(user);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No user found with this email address.");
      } else {
        setError(
          err.response?.data?.message ||
            "Something went wrong while searching.",
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async () => {
    if (!foundUser) return;

    setError("");
    setIsAdding(true);

    try {
      const newMember = await addMember(projectId, foundUser.id);
      if (onMemberAdded) {
        onMemberAdded(newMember);
      }
      handleClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add member to project.",
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Add Project Member
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User's Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="user@example.com"
                required
              />
              <button
                type="submit"
                disabled={isSearching || !email.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {foundUser && (
          <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                {foundUser.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  {foundUser.name}
                </h4>
                <p className="text-xs text-gray-500">{foundUser.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMember}
              disabled={isAdding}
              className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 transition"
            >
              {isAdding ? "Adding..." : "Add to Project"}
            </button>
          </div>
        )}

        <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
