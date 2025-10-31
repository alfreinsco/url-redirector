import React, { useState, useEffect } from "react";
import { data } from "./data/links";
import { Status } from "./types";
import { UserData } from "./types";
import { LoadingSpinner, NotFoundIcon, HomeIcon } from "./components/Icons";
import QRCode from "qrcode";

const App: React.FC = () => {
  const [status, setStatus] = useState<Status>(Status.IDLE);
  const [targetName, setTargetName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [qrPreview, setQrPreview] = useState<{
    dataUrl: string;
    nama: string;
    link: string;
  } | null>(null);

  useEffect(() => {
    const redirectByName = () => {
      // Mengambil path dari URL, contoh: "/marthin"
      const path = window.location.pathname;

      // Kecualikan path assets/* dari pengecekan nama
      if (path.startsWith("/assets/")) {
        console.log("Path assets diabaikan:", path);
        return;
      }

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

  const previewQRCode = async (
    link: string,
    nama: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Mencegah trigger redirect saat klik tombol

    try {
      const qrDataURL = await QRCode.toDataURL(link, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrPreview({ dataUrl: qrDataURL, nama, link });
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Gagal membuat QR code. Silakan coba lagi.");
    }
  };

  const downloadQRCode = (dataUrl: string, nama: string) => {
    const linkElement = document.createElement("a");
    linkElement.href = dataUrl;
    linkElement.download = `qrcode-${nama}.png`;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  const closeQRPreview = () => {
    setQrPreview(null);
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
            <img
              src="/assets/img/logo-url-redirector.png"
              alt="Logo Pengalih URL"
              className="mx-auto h-20 w-20 mb-4"
            />
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
                      className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors border border-gray-600 hover:border-teal-400"
                    >
                      <div
                        onClick={() => handleRedirect(user.link)}
                        className="cursor-pointer"
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
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <button
                          onClick={(e) =>
                            previewQRCode(user.link, user.nama, e)
                          }
                          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Preview QR Code
                        </button>
                      </div>
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
    <>
      <main className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
          {renderContent()}
        </div>
      </main>

      {/* Modal Preview QR Code */}
      {qrPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeQRPreview}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Preview QR Code</h3>
              <button
                onClick={closeQRPreview}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-400 mb-2">
                Nama: {qrPreview.nama}
              </p>
              <p className="text-xs text-teal-400 mb-4 break-all">
                {qrPreview.link}
              </p>
              <div className="flex justify-center bg-white p-4 rounded-lg inline-block">
                <img
                  src={qrPreview.dataUrl}
                  alt={`QR Code untuk ${qrPreview.nama}`}
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeQRPreview}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() =>
                  downloadQRCode(qrPreview.dataUrl, qrPreview.nama)
                }
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
