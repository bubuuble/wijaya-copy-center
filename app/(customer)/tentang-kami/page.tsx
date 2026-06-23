import React from 'react';

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-4">Tentang Kami</h1>
      <p className="text-slate-700 mb-6">
        Selamat datang di Wijaya Copy Center. Kami menyediakan layanan cetak cepat dan
        berkualitas untuk kebutuhan pribadi maupun bisnis. Dengan pengalaman puluhan tahun,
        tim kami siap membantu Anda mulai dari desain, cetak, hingga finishing.
      </p>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Visi</h2>
        <p className="text-slate-600">Menjadi solusi cetak terpercaya dan inovatif di wilayah kami.</p>

        <h2 className="text-xl font-semibold mt-4 mb-2">Misi</h2>
        <ul className="list-disc list-inside text-slate-600">
          <li>Menyediakan layanan cetak berkualitas dengan harga terjangkau.</li>
          <li>Memberikan pelayanan cepat dan ramah kepada setiap pelanggan.</li>
          <li>Terus berinovasi dalam teknologi cetak dan layanan.</li>
        </ul>
      </section>
    </main>
  );
}
