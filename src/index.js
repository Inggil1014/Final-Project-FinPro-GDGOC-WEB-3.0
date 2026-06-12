import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0xf8e81D47203A594245E36C48e151709F0C19fBe8"; 

const CONTRACT_ABI = [
    "function pilih(uint256 nomorKandidat) public",
    "function suaraKandidat1() public view returns (uint256)",
    "function suaraKandidat2() public view returns (uint256)",
    "function sudahMemilih(address) public view returns (bool)"
];

function VotingApp() {
    const [suaraKandidat1, setSuaraKandidat1] = useState("0");
    const [suaraKandidat2, setSuaraKandidat2] = useState("0");
    const [statusMemilih, setStatusMemilih] = useState("Silakan hubungkan dompet");
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState("");
    const [hoveredKandidat, setHoveredKandidat] = useState(null);
    const [pilihanUser, setPilihanUser] = useState(""); 
    const [ethPrice, setEthPrice] = useState("Memuat...");

    const muatDataBlockchain = async () => {
        if (window.ethereum && account) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
                
                const v1 = await contract.suaraKandidat1();
                const v2 = await contract.suaraKandidat2();
                setSuaraKandidat1(v1.toString());
                setSuaraKandidat2(v2.toString());
            } catch (err) {
                console.error("Gagal memuat data blockchain:", err);
            }
        }
    };

    const ambilHargaETH = async () => {
        try {
            const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
            const data = await response.json();
            if (data.ethereum && data.ethereum.usd) {
                setEthPrice(`$${data.ethereum.usd.toLocaleString()}`);
            }
        } catch (err) {
            console.error("Gagal mengambil API harga ETH:", err);
            setEthPrice("Gagal memuat");
        }
    };

    useEffect(() => {
        ambilHargaETH();
        const interval = setInterval(ambilHargaETH, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (account) {
            muatDataBlockchain();
        }
    }, [account]);

    const connectWallet = async () => {
        if (!window.ethereum) return alert("Harap instal ekstensi MetaMask!");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setAccount(address);

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
            const sudahVote = await contract.sudahMemilih(address);
            
            if (sudahVote) {
                setStatusMemilih("Sudah Menggunakan Hak Suara");
                setPilihanUser("Sudah Memilih (Pilihan Rahasia)");
            } else {
                setStatusMemilih("Belum Memilih (Golput)");
                setPilihanUser("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleVote = async (nomorKandidat) => {
        if (!account) return alert("Hubungkan MetaMask terlebih dahulu!");
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.pilih(nomorKandidat);
            await tx.wait();
            
            alert(`Sukses Murni! Suara Kandidat 0${nomorKandidat} tercatat di Blockchain.`);
            await muatDataBlockchain();
            
            setStatusMemilih("Sudah Menggunakan Hak Suara");
            setPilihanUser(nomorKandidat === 1 ? "Kandidat A" : "Kandidat B");
        } catch (error) {
            console.error(error);
            alert("Transaksi Gagal atau Anda Sudah Pernah Memilih!");
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { 
            backgroundColor: '#020617', 
            color: '#f8fafc', 
            minHeight: '100vh', 
            width: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '40px 20px', 
            boxSizing: 'border-box',
            fontFamily: 'system-ui, -apple-system, sans-serif' 
        },
        loginBox: {
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '24px',
            padding: '48px 32px',
            textAlign: 'center',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        },
        btnLogin: {
            backgroundColor: '#10b981', 
            color: '#020617', 
            fontWeight: '700', 
            padding: '16px 32px', 
            borderRadius: '12px', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '15px',
            width: '100%',
            marginTop: '24px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            transition: 'transform 0.2s'
        },
        header: { 
            textAlign: 'center', 
            marginBottom: '48px',
            maxWidth: '700px'
        },
        title: { 
            fontSize: '42px', 
            fontWeight: '900', 
            letterSpacing: '-0.05em',
            color: '#10b981', 
            margin: '0 0 16px 0' 
        },
        subtitle: { 
            color: '#94a3b8', 
            fontSize: '15px', 
            lineHeight: '1.7',
            margin: '0 0 24px 0',
            textAlign: 'center'
        },
        badgeContainer: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '16px'
        },
        grid: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '32px', 
            width: '100%', 
            maxWidth: '950px',
            marginBottom: '40px'
        },
        card: { 
            backgroundColor: '#0f172a', 
            border: '1px solid #1e293b', 
            padding: '32px', 
            borderRadius: '24px', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
            minHeight: '400px', // Sedikit dinaikkan biar layout makin lega
            justifyContent: 'space-between'
        },
        fotoKandidat: {
            width: '110px',
            height: '110px',
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: '4px solid #1e293b', 
            marginBottom: '12px',
            backgroundColor: '#020617' 
        },
        suaraContainer: {
            backgroundColor: '#020617',
            border: '1px solid #1e293b',
            padding: '10px 24px',
            borderRadius: '16px',
            margin: '8px 0',
            width: '80%',
            textAlign: 'center',
            zIndex: 10 // Agar tombol dan container suara selalu berada di atas overlay jika terjadi tabrakan posisi
        },
        suaraText: { 
            fontSize: '32px', 
            fontWeight: '900', 
            color: '#34d399', 
            margin: '0' 
        },
        btnVote: { 
            width: '100%', 
            backgroundColor: '#1e293b', 
            color: '#34d399', 
            padding: '14px', 
            borderRadius: '12px', 
            fontWeight: '700', 
            fontSize: '14px',
            border: '1px solid #34d399', 
            cursor: 'pointer',
            zIndex: 10 // PENTING: Supaya tombol berada di lapisan paling depan dan bisa diklik!
        },
        // PERBAIKAN UTAMA: Mengatur ulang tinggi agar tidak mentok ke bawah kartu
        slideOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '62%', // Diubah dari 100% ke 62% supaya tidak menutupi area tombol voting di bawah
            backgroundColor: '#090d16',
            padding: '24px 24px 12px 24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left',
            transition: 'transform 0.4s ease-in-out', 
            borderRadius: '24px 24px 0 0', // Menyesuaikan tumpul sudut atas saja
            borderBottom: '1px solid #1e293b',
            overflowY: 'auto' // Menjaga jika teks profil terlalu panjang di layar kecil
        },
        footer: { 
            fontSize: '14px', 
            color: '#64748b',
            fontFamily: 'monospace',
            backgroundColor: '#0f172a',
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid #1e293b'
        }
    };

    return (
        <div style={styles.container}>
            {!account ? (
                <div style={styles.loginBox}>
                    <h1 style={{fontSize: '32px', fontWeight: '900', color: '#10b981', margin: '0 0 8px 0'}}>BLOCKVOTE ID</h1>
                    <p style={{color: '#64748b', fontSize: '14px', lineHeight: '1.5', margin: '0 0 24px 0'}}>
                        Selamat datang di BlockVote ID, sistem pemungutan suara digital yang dirancang khusus untuk mewujudkan pemilihan ketua organisasi yang bersih, jujur, dan transparan.
                    </p>
                    <div style={{borderWidth: '1px', borderStyle: 'dashed', borderColor: '#1e293b', borderRadius: '12px', padding: '16px', backgroundColor: '#020617'}}>
                        <span style={{fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px'}}>Status Gerbang</span>
                        <span style={{fontSize: '14px', color: '#f43f5e', fontWeight: '700'}}>Akses Terkunci 🔒</span>
                    </div>
                    <button onClick={connectWallet} style={styles.btnLogin}>
                        Hubungkan MetaMask via Web3
                    </button>
                </div>
            ) : (
                <>
                    <div style={styles.header}>
                        <h1 style={styles.title}>BLOCKVOTE ID</h1>
                        <p style={styles.subtitle}>
                            Setujui koneksi dompet digitalmu, kenali visi misi para kandidat secara mendalam, dan mari gunakan hak pilihmu secara bijak demi arah pergerakan organisasi yang lebih baik ke depan!
                        </p>
                        
                        <div style={styles.badgeContainer}>
                            <span style={{backgroundColor: '#10b981', color: '#020617', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'}}>
                                Wallet Terbuka: {account.substring(0,6)}...{account.substring(38)}
                            </span>
                            <span style={{backgroundColor: '#3b82f6', color: '#ffffff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700'}}>
                                🌐 Live ETH Price (API): {ethPrice}
                            </span>
                        </div>
                    </div>

                    <div style={styles.grid}>
                        {/* KANDIDAT A */}
                        <div 
                            style={styles.card}
                            onMouseEnter={() => setHoveredKandidat(1)}
                            onMouseLeave={() => setHoveredKandidat(null)}
                        >
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                                <img src="/img/kandidat-a.jpg" alt="Foto Kandidat A" style={styles.fotoKandidat} />
                                <h3 style={{margin:0, fontSize:'22px', color:'#f1f5f9'}}>Pria Solo</h3>
                                <p style={{color: '#10b981', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '600'}}>
                                    Aliansi Progresif
                                </p>
                            </div>

                            <div style={styles.suaraContainer}>
                                <p style={styles.suaraText}>{suaraKandidat1}</p>
                                <span style={{fontSize:'11px', color:'#64748b', textTransform:'uppercase', fontWeight: '600'}}>Total Suara</span>
                            </div>
                            
                            <button onClick={() => handleVote(1)} disabled={loading} style={styles.btnVote}>
                                {loading ? "Memproses..." : "Pilih Kandidat A"}
                            </button>

                            <div style={{
                                ...styles.slideOverlay,
                                transform: hoveredKandidat === 1 ? 'translateX(0)' : 'translateX(-101%)'
                            }}>
                                <h4 style={{margin: '0 0 4px 0', color: '#10b981', fontSize: '16px'}}>Profil & Strategi</h4>
                                <p style={{fontSize: '11px', color: '#94a3b8', margin: '0 0 8px 0'}}><strong>Pengalaman:</strong> Ketua Bidang Internal Himpunan 2025.</p>
                                <div style={{fontSize: '11.5px', borderTop: '1px solid #1e293b', paddingTop: '8px'}}>
                                    <strong>Visi:</strong> Ekosistem digital inklusif dan kolaborasi aktif.
                                    <ul style={{margin: '4px 0 0 0', paddingLeft: '14px'}}>
                                        <li>Optimasi manajemen terbuka.</li>
                                        <li>Transparansi kebijakan harian.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* KANDIDAT B */}
                        <div 
                            style={styles.card}
                            onMouseEnter={() => setHoveredKandidat(2)}
                            onMouseLeave={() => setHoveredKandidat(null)}
                        >
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                                <img src="/img/kandidat-b.jpg" alt="Foto Kandidat B" style={styles.fotoKandidat} />
                                <h3 style={{margin:0, fontSize:'22px', color:'#f1f5f9'}}>Pria Bolu Ketan</h3>
                                <p style={{color: '#10b981', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '600'}}>
                                    Sinergi Integratif
                                </p>
                            </div>

                            <div style={styles.suaraContainer}>
                                <p style={styles.suaraText}>{suaraKandidat2}</p>
                                <span style={{fontSize:'11px', color:'#64748b', textTransform:'uppercase', fontWeight: '600'}}>Total Suara</span>
                            </div>
                            
                            <button onClick={() => handleVote(2)} disabled={loading} style={styles.btnVote}>
                                {loading ? "Memproses..." : "Pilih Kandidat B"}
                            </button>

                            <div style={{
                                ...styles.slideOverlay,
                                transform: hoveredKandidat === 2 ? 'translateX(0)' : 'translateX(-101%)'
                            }}>
                                <h4 style={{margin: '0 0 4px 0', color: '#10b981', fontSize: '16px'}}>Profil & Strategi</h4>
                                <p style={{fontSize: '11px', color: '#94a3b8', margin: '0 0 8px 0'}}><strong>Pengalaman:</strong> Kepala Hubungan Eksternal 2025.</p>
                                <div style={{fontSize: '11.5px', borderTop: '1px solid #1e293b', paddingTop: '8px'}}>
                                    <strong>Visi:</strong> Kepemimpinan adaptif dalam inovasi modern.
                                    <ul style={{margin: '4px 0 0 0', paddingLeft: '14px'}}>
                                        <li>Standarisasi tata kelola berkala.</li>
                                        <li>Wadah aspirasi terintegrasi aman.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.footer}>
                        Status Pemilih:{" "}
                        <span style={{ color: pilihanUser ? '#34d399' : '#f43f5e', fontWeight: '700' }}>
                            {pilihanUser ? `Sudah Memilih: ${pilihanUser}` : "Belum Memilih (Golput)"}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <VotingApp />
  </React.StrictMode>
);