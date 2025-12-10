import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiRefreshCw, FiChevronRight } from "react-icons/fi";

const ApplicantsList = () => {
  const [ids, setIds] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:8000/files/data.json");
      const data = res.data || {};
      const keys = Object.keys(data).sort();
      setIds(keys);

      // fetch names for each id
      const promises = keys.map(async (id) => {
        try {
          const r = await axios.get(`http://localhost:8000/api/applicant/full/${encodeURIComponent(id)}`);
          const name = r.data.fullName || r.data.FullName || r.data.name || id;
          return { id, name };
        } catch (e) {
          return { id, name: id };
        }
      });

      const results = await Promise.all(promises);
      const map = {};
      results.forEach((r) => (map[r.id] = r.name));
      setNames(map);
    } catch (err) {
      console.error("fetch data.json error:", err);
      setError("Failed to load applicants list. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const total = ids.length;
  const namedCount = Object.keys(names).filter((k) => names[k] && names[k] !== k).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#003366]">Applicants</h2>
          <p className="text-sm text-gray-500">Review applicant list and open detailed view</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchList}
            className="flex items-center gap-2 text-sm px-3 py-1.5 border rounded-md bg-white text-gray-700"
            title="Refresh list"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border rounded-md p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-md text-blue-700">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total applicants</p>
              <p className="text-lg font-medium">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-md p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-md text-green-700">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Resolved names</p>
              <p className="text-lg font-medium">{namedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading applicants…</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {!loading && ids.length === 0 && <p className="text-sm text-gray-600">No applicants found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ids.map((id) => {
          const name = names[id] || id;
          const isRegistered = name && name !== id;
          return (
            <div key={id} className="bg-white border rounded-md p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{id}</p>
                  </div>
                  <div>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full ${isRegistered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {isRegistered ? 'Registered' : 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">Quick actions</div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => navigate("/employee-dashboard", { state: { Applicant_ID: id } })}
                  className="flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md"
                >
                  Open
                  <FiChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/applicants/${encodeURIComponent(id)}`)}
                  className="text-sm px-2 py-1 border rounded-md text-gray-700 bg-white"
                >
                  Files
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicantsList;
