import React, { useState, useEffect } from "react";
import { data } from "./data/links";
import { Status } from "./types";
import { UserData } from "./types";
import { LoadingSpinner, NotFoundIcon, HomeIcon } from "./components/Icons";

const App: React.FC = () => {
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [targetName, setTargetName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);

  useEffect(() => {
    const redirectByName = () => {
      // Mengambil path dari URL, contoh: "/marthin"
      const path = window.location.pathname;

      // Mengambil bagian terakhir dari path, contoh: "marthin"
      // Membersihkan dari slash di awal jika ada
      const nameFromUrl = path.startsWith("/") ? path.substring(1) : path;

      // Hentikan jika tidak ada nama di URL (path adalah '/')
      if (!nameFromUrl) {
        setStatus(Status.HOME);
        console.log("Tidak ada nama di URL. Menampilkan halaman utama.");
        return;
      }

      setTargetName(nameFromUrl);
      setStatus(Status.REDIRECTING);

      // Cari nama di dalam data (case-insensitive)
      const user = data.find(
        (u) => u.nama.toLowerCase() === nameFromUrl.toLowerCase()
      );

      if (user) {
        // Jika nama ditemukan, lakukan redirect
        console.log(
          `Nama "${nameFromUrl}" ditemukan. Mengalihkan ke: ${user.link}`
        );
        window.location.href = user.link;
      } else {
        // Jika nama tidak ditemukan, tampilkan error di console dan ubah status UI
        console.error(
          `Error: Nama "${nameFromUrl}" tidak ditemukan dalam data.`
        );
        setStatus(Status.NOT_FOUND);
      }
    };

    redirectByName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependensi kosong agar fungsi hanya berjalan sekali saat komponen dimuat

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered = data.filter(
      (user) =>
        user.nama.toLowerCase().includes(query.toLowerCase()) ||
        user.deskripsi.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleRedirect = (link: string) => {
    window.open(link, "_blank");
  };

  const renderContent = () => {
    switch (status) {
      case Status.REDIRECTING:
        return (
          <div className="text-center">
            <LoadingSpinner />
            <h1 className="text-2xl font-bold mt-4 text-teal-400">
              Mencari...
            </h1>
            <p className="mt-2 text-gray-400">
              Mencoba mengalihkan untuk{" "}
              <span className="font-semibold text-white">{targetName}</span>.
            </p>
          </div>
        );
      case Status.NOT_FOUND:
        return (
          <div className="text-center">
            <NotFoundIcon />
            <h1 className="text-3xl font-bold mt-4 text-red-500">
              Halaman Tidak Ditemukan
            </h1>
            <p className="mt-2 text-gray-400">
              Maaf, kami tidak dapat menemukan halaman untuk{" "}
              <span className="font-semibold text-white">"{targetName}"</span>.
            </p>
          </div>
        );
      case Status.HOME:
        return (
          <div className="text-center">
            <HomeIcon />
            <h1 className="text-3xl font-bold mt-4 text-teal-400">
              Selamat Datang di Pengalih URL
            </h1>
            <p className="mt-2 text-gray-400">
              Untuk menggunakan aplikasi ini, tambahkan nama ke URL atau cari di
              bawah.
            </p>
            <p className="mt-1 text-gray-500 mb-6">
              Contoh:{" "}
              <code className="bg-gray-700 rounded px-2 py-1 text-sm">
                {window.location.origin}/marthin
              </code>
            </p>

            {/* Input Pencarian */}
            <div className="mt-6">
              <input
                type="text"
                placeholder="Cari nama atau deskripsi..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />

              {/* Hasil Pencarian */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-400 text-left">
                    Hasil Pencarian ({searchResults.length}):
                  </p>
                  {searchResults.map((user, index) => (
                    <div
                      key={index}
                      onClick={() => handleRedirect(user.link)}
                      className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors border border-gray-600 hover:border-teal-400"
                    >
                      <h3 className="text-lg font-semibold text-white">
                        {user.nama}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {user.deskripsi}
                      </p>
                      <p className="text-xs text-teal-400 mt-2 break-all">
                        {user.link}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.trim() !== "" && searchResults.length === 0 && (
                <p className="mt-4 text-gray-500">
                  Tidak ada hasil yang ditemukan.
                </p>
              )}
            </div>

            {/* Keterangan Menambahkan URL */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Ingin menambahkan URL Anda?
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Silakan hubungi{" "}
                <a
                  href="https://wa.me/6281318812027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 font-semibold underline"
                >
                  Marthin
                </a>{" "}
                via WhatsApp{" "}
                <span className="text-white font-semibold">081318812027</span>
              </p>
            </div>
          </div>
        );
      default:
        return null; // Status IDLE tidak menampilkan apa-apa
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
